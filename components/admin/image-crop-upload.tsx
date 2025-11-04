'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2, Check, Image as ImageIcon, Crop, RotateCw, ZoomIn, ZoomOut, Smartphone, Monitor } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';

interface ImageCropUploadProps {
  bucket: 'hero-images' | 'channel-images' | 'movie-images';
  onUploadComplete?: (url: string) => void;
  onUploadCompleteMobile?: (url: string) => void; // Callback pour mobile
  onUploadCompleteDesktop?: (url: string) => void; // Callback pour desktop
  currentImage?: string;
  currentMobileImage?: string; // Image mobile actuelle
  currentDesktopImage?: string; // Image desktop actuelle
  label?: string;
  maxSizeMB?: number;
  aspectRatio?: number; // 21/9 pour hero, 16/9 pour channels, etc.
  mobileAspectRatio?: number; // Aspect ratio pour mobile (optionnel)
  allowSeparateMobileDesktop?: boolean; // Permettre deux versions séparées
}

export function ImageCropUpload({ 
  bucket, 
  onUploadComplete,
  onUploadCompleteMobile,
  onUploadCompleteDesktop,
  currentImage,
  currentMobileImage,
  currentDesktopImage,
  label = "Image",
  maxSizeMB = 10,
  aspectRatio = 16 / 9,
  mobileAspectRatio,
  allowSeparateMobileDesktop = false
}: ImageCropUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [previewMobile, setPreviewMobile] = useState<string | null>(currentMobileImage || null);
  const [previewDesktop, setPreviewDesktop] = useState<string | null>(currentDesktopImage || null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [croppingMode, setCroppingMode] = useState<'mobile' | 'desktop' | 'single'>('single'); // Mode de recadrage
  
  // Mettre à jour les previews quand les currentImage changent
  useEffect(() => {
    if (currentImage) setPreview(currentImage);
    if (currentMobileImage) setPreviewMobile(currentMobileImage);
    if (currentDesktopImage) setPreviewDesktop(currentDesktopImage);
  }, [currentImage, currentMobileImage, currentDesktopImage]);
  
  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  
  // Aspect ratio actuel selon le mode
  const currentAspectRatio = 
    allowSeparateMobileDesktop && croppingMode === 'mobile' && mobileAspectRatio
      ? mobileAspectRatio
      : aspectRatio;

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Charger une image depuis une URL pour le recadrage
  const loadImageFromUrl = async (imageUrl: string, mode: 'mobile' | 'desktop' | 'single' = 'single') => {
    try {
      setError(null);
      setSuccess(false);
      
      // Télécharger l'image depuis l'URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Impossible de charger l\'image');
      }
      
      const blob = await response.blob();
      
      // Convertir le blob en dataURL
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setCroppingMode(mode);
        setShowCropper(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error('Error loading image from URL:', err);
      setError(err.message || 'Erreur lors du chargement de l\'image');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation de la taille
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Le fichier est trop volumineux. Maximum ${maxSizeMB}MB.`);
      return;
    }

    // Validation du type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG, WEBP ou GIF.');
      return;
    }

    setError(null);
    setSuccess(false);

    // Charger l'image pour le cropper
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result as string);
      // Si on permet mobile/desktop séparé, demander quel mode choisir
      if (allowSeparateMobileDesktop) {
        // Demander le mode
        setCroppingMode('desktop'); // Par défaut, commencer par desktop
      } else {
        setCroppingMode('single');
      }
      setShowCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropConfirm = async () => {
    if (!originalImage || !croppedAreaPixels) return;

    setUploading(true);

    try {
      // Créer l'image recadrée
      const croppedBlob = await getCroppedImg(originalImage, croppedAreaPixels, rotation);
      
      // Upload vers Supabase
      const fileExt = 'jpg';
      const suffix = allowSeparateMobileDesktop 
        ? (croppingMode === 'mobile' ? '-mobile' : '-desktop')
        : '';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${suffix}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, croppedBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Preview local
      const previewUrl = URL.createObjectURL(croppedBlob);

      if (allowSeparateMobileDesktop) {
        if (croppingMode === 'mobile') {
          // Sauvegarder l'image mobile
          setPreviewMobile(previewUrl);
          if (onUploadCompleteMobile) {
            onUploadCompleteMobile(publicUrl);
          }
          
          // Si l'image desktop n'existe pas encore, proposer de la recadrer
          // Sinon, fermer automatiquement le cropper
          if (!previewDesktop && !currentDesktopImage) {
            // Petit délai pour que l'utilisateur voie le succès
            setSuccess(true);
            setTimeout(() => {
              setSuccess(false);
              const continueDesktop = window.confirm('Image mobile sauvegardée ! Voulez-vous recadrer aussi pour desktop ?');
              if (continueDesktop) {
                setCroppingMode('desktop');
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
                setCroppedAreaPixels(null);
                setUploading(false);
                // Ne pas fermer le cropper, continuer avec desktop
              } else {
                // Si l'utilisateur dit "Non", fermer le cropper
                setShowCropper(false);
                setOriginalImage(null);
                setUploading(false);
              }
            }, 500);
            return;
          }
          
          // Si desktop existe déjà, fermer automatiquement le cropper
          setShowCropper(false);
          setOriginalImage(null);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
          setUploading(false);
          return;
        } else {
          // Desktop : sauvegarder et fermer automatiquement
          setPreviewDesktop(previewUrl);
          if (onUploadCompleteDesktop) {
            onUploadCompleteDesktop(publicUrl);
          }
          setShowCropper(false);
          setOriginalImage(null);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
          setUploading(false);
          return;
        }
      } else {
        // Mode simple : sauvegarder et fermer automatiquement
        setPreview(previewUrl);
        if (onUploadComplete) {
          onUploadComplete(publicUrl);
        }
        setShowCropper(false);
        setOriginalImage(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setUploading(false);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Erreur lors de l\'upload');
      setUploading(false);
      // Ne pas fermer le cropper en cas d'erreur pour permettre de réessayer
      // Garder les previews existantes
      if (allowSeparateMobileDesktop) {
        if (croppingMode === 'mobile') {
          setPreviewMobile(currentMobileImage || null);
        } else {
          setPreviewDesktop(currentDesktopImage || null);
        }
      } else {
        setPreview(currentImage || null);
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setOriginalImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fonction pour supprimer une image du storage Supabase
  const deleteImageFromStorage = async (imageUrl: string | null | undefined) => {
    if (!imageUrl) return;
    
    try {
      const urlWithoutParams = imageUrl.split('?')[0];
      
      // Extraire le chemin du fichier depuis l'URL Supabase
      // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[filename]
      // Ou: https://[project].supabase.co/storage/v1/object/sign/[bucket]/[filename]
      
      // Méthode 1: Utiliser split pour extraire le nom du fichier après le bucket
      const bucketName = bucket; // hero-images, channel-images, ou movie-images
      const bucketIndex = urlWithoutParams.indexOf(`/${bucketName}/`);
      
      if (bucketIndex !== -1) {
        const filePath = urlWithoutParams.substring(bucketIndex + bucketName.length + 1);
        
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove([filePath]);
          
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
            throw storageError;
          } else {
            console.log('Image successfully deleted from storage:', filePath);
          }
        }
      } else {
        // Méthode 2: Essayer avec regex comme fallback
        const storageMatch = urlWithoutParams.match(/\/(hero-images|channel-images|movie-images)\/(.+)$/);
        
        if (storageMatch && storageMatch[2]) {
          const filePath = storageMatch[2];
          const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove([filePath]);
          
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
            throw storageError;
          } else {
            console.log('Image successfully deleted from storage:', filePath);
          }
        } else {
          console.warn('Could not extract file path from URL:', urlWithoutParams);
        }
      }
    } catch (storageErr) {
      console.error('Exception deleting image from storage:', storageErr);
      throw storageErr;
    }
  };

  const handleRemove = async () => {
    // Confirmation avant suppression
    if (!confirm('Voulez-vous vraiment supprimer cette image ? Cette action est irréversible.')) {
      return;
    }

    try {
      // Utiliser currentImage en priorité (image déjà sauvegardée), puis preview
      const imageToDelete = currentImage || preview;
      
      // Supprimer l'image du storage si elle existe et est une URL Supabase
      if (imageToDelete && (imageToDelete.includes('supabase.co') || imageToDelete.includes('supabase'))) {
        await deleteImageFromStorage(imageToDelete);
      }
      
      // Toujours réinitialiser l'état local
      setPreview(null);
      setError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      // Appeler le callback pour mettre à jour l'état parent
      if (onUploadComplete) {
        onUploadComplete(''); // Passer une chaîne vide pour supprimer
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error removing image:', error);
      setError('Erreur lors de la suppression de l\'image');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveMobile = async () => {
    // Confirmation avant suppression
    if (!confirm('Voulez-vous vraiment supprimer l\'image mobile ? Cette action est irréversible.')) {
      return;
    }

    try {
      // Utiliser currentMobileImage en priorité (image déjà sauvegardée), puis previewMobile
      const imageToDelete = currentMobileImage || previewMobile;
      
      // Supprimer l'image mobile du storage si elle existe et est une URL Supabase
      if (imageToDelete && (imageToDelete.includes('supabase.co') || imageToDelete.includes('supabase'))) {
        await deleteImageFromStorage(imageToDelete);
      }
      
      // Toujours réinitialiser l'état local
      setPreviewMobile(null);
      setError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      // Appeler le callback pour mettre à jour l'état parent
      if (onUploadCompleteMobile) {
        onUploadCompleteMobile(''); // Passer une chaîne vide pour supprimer
      }
    } catch (error) {
      console.error('Error removing mobile image:', error);
      setError('Erreur lors de la suppression de l\'image mobile');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveDesktop = async () => {
    // Confirmation avant suppression
    if (!confirm('Voulez-vous vraiment supprimer l\'image desktop ? Cette action est irréversible.')) {
      return;
    }

    try {
      // Utiliser currentDesktopImage en priorité (image déjà sauvegardée), puis previewDesktop
      const imageToDelete = currentDesktopImage || previewDesktop;
      
      // Supprimer l'image desktop du storage si elle existe et est une URL Supabase
      if (imageToDelete && (imageToDelete.includes('supabase.co') || imageToDelete.includes('supabase'))) {
        await deleteImageFromStorage(imageToDelete);
      }
      
      // Toujours réinitialiser l'état local
      setPreviewDesktop(null);
      setError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      // Appeler le callback pour mettre à jour l'état parent
      if (onUploadCompleteDesktop) {
        onUploadCompleteDesktop(''); // Passer une chaîne vide pour supprimer
      }
    } catch (error) {
      console.error('Error removing desktop image:', error);
      setError('Erreur lors de la suppression de l\'image desktop');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-label font-semibold text-white">
        {label}
      </label>

      {/* Cropper Modal */}
      {showCropper && originalImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#333333]">
              <div className="flex items-center gap-3">
                <Crop className="h-5 w-5 text-[#3498DB]" />
                <h3 className="text-lg font-display font-bold text-white">
                  {allowSeparateMobileDesktop 
                    ? `Recadrer pour ${croppingMode === 'mobile' ? 'Mobile' : 'Desktop'}`
                    : 'Recadrer l\'image'}
                </h3>
                {allowSeparateMobileDesktop && (
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant={croppingMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setCroppingMode('mobile');
                        setCrop({ x: 0, y: 0 });
                        setZoom(1);
                      }}
                      className={croppingMode === 'mobile' ? 'bg-[#3498DB]' : ''}
                    >
                      <Smartphone className="h-4 w-4 mr-1" />
                      Mobile
                    </Button>
                    <Button
                      variant={croppingMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setCroppingMode('desktop');
                        setCrop({ x: 0, y: 0 });
                        setZoom(1);
                      }}
                      className={croppingMode === 'desktop' ? 'bg-[#3498DB]' : ''}
                    >
                      <Monitor className="h-4 w-4 mr-1" />
                      Desktop
                    </Button>
                  </div>
                )}
              </div>
              <button
                onClick={handleCropCancel}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cropper */}
            <div className="relative flex-1 bg-black" style={{ minHeight: '400px' }}>
              <Cropper
                image={originalImage}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={currentAspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-[#333333] space-y-4">
              {/* Zoom */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="text-white/70 font-label flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </label>
                  <span className="text-white font-mono">{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-[#333333] rounded-lg appearance-none cursor-pointer accent-[#3498DB]"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="text-white/70 font-label flex items-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    Rotation
                  </label>
                  <span className="text-white font-mono">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full h-2 bg-[#333333] rounded-lg appearance-none cursor-pointer accent-[#3498DB]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCropCancel}
                  variant="outline"
                  className="flex-1 border-[#333333] text-white hover:bg-[#333333]"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCropConfirm}
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-bold"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Upload...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Confirmer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview ou Upload Area */}
      {allowSeparateMobileDesktop ? (
        /* Mode mobile/desktop séparé */
        <div className="space-y-4">
          {/* Mobile */}
          <div>
            <label className="block text-xs font-label font-semibold text-white/70 mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Version Mobile
            </label>
            {previewMobile ? (
              <div className="relative group">
                <img
                  src={previewMobile}
                  alt="Preview Mobile"
                  className="w-full h-48 object-cover rounded-lg border-2 border-[#333333]"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => loadImageFromUrl(previewMobile, 'mobile')}
                    className="p-2 bg-[#3498DB] hover:bg-[#3498DB]/90 text-white rounded-full shadow-lg"
                    title="Recadrer l'image mobile"
                  >
                    <Crop className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveMobile}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
                    title="Supprimer l'image mobile"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                    setCroppingMode('mobile');
                  }
                }}
                disabled={uploading}
                className="w-full h-48 border-2 border-dashed border-[#3498DB] rounded-lg bg-[#0F4C81]/10 hover:bg-[#0F4C81]/20 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Smartphone className="h-8 w-8 text-[#3498DB]" />
                <span className="text-sm font-label text-white">Cliquez pour uploader mobile</span>
              </button>
            )}
          </div>

          {/* Desktop */}
          <div>
            <label className="block text-xs font-label font-semibold text-white/70 mb-2 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Version Desktop
            </label>
            {previewDesktop ? (
              <div className="relative group">
                <img
                  src={previewDesktop}
                  alt="Preview Desktop"
                  className="w-full h-48 object-cover rounded-lg border-2 border-[#333333]"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => loadImageFromUrl(previewDesktop, 'desktop')}
                    className="p-2 bg-[#3498DB] hover:bg-[#3498DB]/90 text-white rounded-full shadow-lg"
                    title="Recadrer l'image desktop"
                  >
                    <Crop className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveDesktop}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
                    title="Supprimer l'image desktop"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                    setCroppingMode('desktop');
                  }
                }}
                disabled={uploading}
                className="w-full h-48 border-2 border-dashed border-[#3498DB] rounded-lg bg-[#0F4C81]/10 hover:bg-[#0F4C81]/20 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Monitor className="h-8 w-8 text-[#3498DB]" />
                <span className="text-sm font-label text-white">Cliquez pour uploader desktop</span>
              </button>
            )}
          </div>
        </div>
      ) : preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-[#333333]"
          />
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => loadImageFromUrl(preview, 'single')}
              className="p-2 bg-[#3498DB] hover:bg-[#3498DB]/90 text-white rounded-full shadow-lg"
              title="Recadrer l'image"
            >
              <Crop className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
              title="Supprimer l'image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {success && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg">
                <Check className="h-5 w-5" />
                <span className="font-label font-semibold">Uploadé !</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-48 border-2 border-dashed border-[#3498DB] rounded-lg bg-[#0F4C81]/10 hover:bg-[#0F4C81]/20 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 text-[#3498DB] animate-spin" />
              <span className="text-sm font-label text-white">Upload en cours...</span>
            </>
          ) : (
            <>
              <div className="p-4 bg-[#3498DB]/20 rounded-full">
                <ImageIcon className="h-8 w-8 text-[#3498DB]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-label font-semibold text-white mb-1">
                  Cliquez pour uploader
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP ou GIF (max {maxSizeMB}MB)
                </p>
                <p className="text-xs text-[#3498DB] mt-1">
                  Recadrage automatique au format {aspectRatio === 21/9 ? '21:9' : aspectRatio === 16/9 ? '16:9' : aspectRatio === 1 ? '1:1' : 'personnalisé'}
                </p>
              </div>
            </>
          )}
        </button>
      )}

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Messages d'erreur */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-600/10 border border-red-600 rounded-lg">
          <X className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-600 font-sans">{error}</span>
        </div>
      )}
    </div>
  );
}

