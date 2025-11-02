'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, ZoomIn, ZoomOut, RotateCw, Trash2 } from 'lucide-react';
import { uploadAvatar, deleteAvatar } from '@/lib/user-profile';

interface AvatarCropUploadProps {
  currentAvatarUrl?: string;
  onUploadSuccess: (url: string) => void;
  onUploadError: (error: string) => void;
  onDeleteSuccess: () => void;
}

export function AvatarCropUpload({ 
  currentAvatarUrl, 
  onUploadSuccess, 
  onUploadError,
  onDeleteSuccess
}: AvatarCropUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageError, setImageError] = useState(false);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifications
    if (!file.type.startsWith('image/')) {
      onUploadError('Le fichier doit être une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onUploadError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Taille finale (carré de 512x512 pour les avatars)
    const maxSize = 512;
    canvas.width = maxSize;
    canvas.height = maxSize;

    // Rotation
    ctx.translate(maxSize / 2, maxSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-maxSize / 2, -maxSize / 2);

    // Dessiner l'image croppée
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      maxSize,
      maxSize
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      }, 'image/jpeg', 0.95);
    });
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || !selectedFile) return;

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: 'image/jpeg',
      });

      const result = await uploadAvatar(croppedFile);
      
      if (result.success && result.url) {
        onUploadSuccess(result.url);
        setShowCropper(false);
        setImageSrc(null);
        setSelectedFile(null);
        setZoom(1);
        setRotation(0);
      } else {
        onUploadError(result.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Crop error:', error);
      onUploadError('Erreur lors du recadrage');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    setSelectedFile(null);
    setZoom(1);
    setRotation(0);
  };

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteAvatar();
    
    if (result.success) {
      onDeleteSuccess();
    } else {
      onUploadError(result.error || 'Erreur lors de la suppression');
    }
    setIsDeleting(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Avatar actuel */}
      {!showCropper && (
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#0F4C81] to-[#3498DB] flex items-center justify-center">
            {currentAvatarUrl && !imageError ? (
              <img
                key={currentAvatarUrl}
                src={`${currentAvatarUrl}${currentAvatarUrl.includes('?') ? '&' : '?'}t=${Date.now()}`}
                alt="Avatar"
                className="object-cover w-full h-full"
                onError={() => {
                  setImageError(true);
                }}
                onLoad={() => {
                  setImageError(false);
                }}
              />
            ) : (
              <Camera className="h-16 w-16 text-white" />
            )}
          </div>
          
          {/* Bouton upload au survol */}
          <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Camera className="h-8 w-8 text-white" />
          </label>
        </div>
      )}

      {/* Cropper */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#1a1a1a] border-b border-[#3498DB]/30">
            <h3 className="text-white font-semibold text-center">
              Recadrer votre avatar
            </h3>
          </div>

          {/* Zone de crop */}
          <div className="flex-1 relative">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1} // Ratio 1:1 pour avatar carré
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              cropShape="round" // Forme ronde pour l'aperçu
              showGrid={false}
            />
          </div>

          {/* Contrôles */}
          <div className="p-4 bg-[#1a1a1a] border-t border-[#3498DB]/30 space-y-4">
            {/* Zoom */}
            <div className="flex items-center gap-3">
              <ZoomOut className="h-5 w-5 text-white/60" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-[#3498DB]"
              />
              <ZoomIn className="h-5 w-5 text-white/60" />
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-3">
              <RotateCw className="h-5 w-5 text-white/60" />
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1 accent-[#3498DB]"
              />
              <span className="text-white/60 text-sm w-12">{rotation}°</span>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                disabled={isUploading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpload}
                className="flex-1 bg-[#3498DB] hover:bg-[#3498DB]/90"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upload...
                  </>
                ) : (
                  'Valider'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!showCropper && (
        <>
          <p className="text-xs text-white/40 mt-2">
            Cliquez pour changer (max 5MB)
          </p>
          
          {/* Bouton de suppression (visible seulement si photo existe) */}
          {currentAvatarUrl && !imageError && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="mt-3 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer la photo
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

