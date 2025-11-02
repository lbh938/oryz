-- =====================================================
-- VÉRIFICATION ET CORRECTION DES BUCKETS STORAGE
-- =====================================================

-- 1. Vérifier si les buckets existent
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id IN ('hero-images', 'channel-images', 'movie-images');

-- 2. Supprimer les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Public can view hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete hero images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view channel images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload channel images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete channel images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view movie images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload movie images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete movie images" ON storage.objects;

-- 3. Créer les buckets s'ils n'existent pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-images',
  'hero-images',
  true,
  10485760, -- 10MB max par fichier (augmenté)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'channel-images',
  'channel-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'movie-images',
  'movie-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- =====================================================
-- POLITIQUES D'ACCÈS SIMPLIFIÉES (TEMPORAIREMENT OUVERTES)
-- =====================================================

-- HERO IMAGES - Lecture publique
CREATE POLICY "Public can view hero images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- HERO IMAGES - Upload pour tous les utilisateurs authentifiés (temporairement)
CREATE POLICY "Authenticated users can upload hero images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
);

-- HERO IMAGES - Update pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can update hero images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
);

-- HERO IMAGES - Delete pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete hero images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
);

-- CHANNEL IMAGES - Même chose
CREATE POLICY "Public can view channel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'channel-images');

CREATE POLICY "Authenticated users can upload channel images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'channel-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update channel images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'channel-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'channel-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete channel images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'channel-images' 
  AND auth.role() = 'authenticated'
);

-- MOVIE IMAGES - Même chose
CREATE POLICY "Public can view movie images"
ON storage.objects FOR SELECT
USING (bucket_id = 'movie-images');

CREATE POLICY "Authenticated users can upload movie images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'movie-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update movie images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'movie-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'movie-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete movie images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'movie-images' 
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================
SELECT 
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as "size_limit_mb",
  allowed_mime_types
FROM storage.buckets
WHERE id IN ('hero-images', 'channel-images', 'movie-images');

-- Vérifier les politiques
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

