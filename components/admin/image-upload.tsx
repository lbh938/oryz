'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2, Check, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  bucket: 'hero-images' | 'channel-images' | 'movie-images';
  onUploadComplete?: (url: string) => void;
  currentImage?: string;
  label?: string;
  maxSizeMB?: number;
}

export function ImageUpload({ 
  bucket, 
  onUploadComplete, 
  currentImage,
  label = "Image",
  maxSizeMB = 5
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation de la taille
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
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

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload vers Supabase Storage
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      if (onUploadComplete) {
        onUploadComplete(publicUrl);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Erreur lors de l\'upload');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-label font-semibold text-white">
        {label}
      </label>

      {/* Preview ou Upload Area */}
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-[#333333]"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
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

