-- =====================================================
-- CRÉATION DU BUCKET STORAGE POUR LES IMAGES
-- =====================================================

-- 1. Créer le bucket "hero-images" (public pour affichage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-images',
  'hero-images',
  true,
  5242880, -- 5MB max par fichier
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Créer le bucket "channel-images" (public pour affichage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'channel-images',
  'channel-images',
  true,
  5242880, -- 5MB max par fichier
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Créer le bucket "movie-images" (public pour affichage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'movie-images',
  'movie-images',
  true,
  5242880, -- 5MB max par fichier
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLITIQUES D'ACCÈS
-- =====================================================

-- HERO IMAGES
-- Tout le monde peut lire
CREATE POLICY "Public can view hero images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- Seuls les admins peuvent uploader
CREATE POLICY "Admins can upload hero images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-images' 
  AND auth.uid() IN (SELECT id FROM admin_users WHERE is_super_admin = true)
);

-- Seuls les admins peuvent supprimer
CREATE POLICY "Admins can delete hero images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hero-images' 
  AND auth.uid() IN (SELECT id FROM admin_users WHERE is_super_admin = true)
);

-- CHANNEL IMAGES
-- Tout le monde peut lire
CREATE POLICY "Public can view channel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'channel-images');

-- Seuls les admins peuvent uploader
CREATE POLICY "Admins can upload channel images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'channel-images' 
  AND auth.uid() IN (SELECT id FROM admin_users WHERE is_super_admin = true)
);

-- Seuls les admins peuvent supprimer
CREATE POLICY "Admins can delete channel images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'channel-images' 
  AND auth.uid() IN (SELECT id FROM admin_users WHERE is_super_admin = true)
);

-- MOVIE IMAGES
-- Tout le monde peut lire
CREATE POLICY "Public can view movie images"
ON storage.objects FOR SELECT
USING (bucket_id = 'movie-images');

-- Seuls les admins peuvent uploader
CREATE POLICY "Admins can upload movie images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'movie-images' 
  AND auth.uid() IN (SELECT id FROM admin_users WHERE is_super_admin = true)
);

-- Seuls les admins peuvent supprimer
CREATE POLICY "Admins can delete movie images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'movie-images' 
  AND auth.uid() IN (SELECT id FROM admin_users WHERE is_super_admin = true)
);

-- =====================================================
-- VÉRIFICATION
-- =====================================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id IN ('hero-images', 'channel-images', 'movie-images');

