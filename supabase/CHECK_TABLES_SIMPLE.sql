-- =====================================================
-- VÉRIFICATION SIMPLE DES TABLES
-- Exécutez chaque section séparément dans Supabase SQL Editor
-- =====================================================

-- SECTION 1: Vérifier si les tables existent
SELECT 
  'admin_users' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') as exists
UNION ALL
SELECT 
  'hero_config',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'hero_config')
UNION ALL
SELECT 
  'active_visitors',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'active_visitors')
UNION ALL
SELECT 
  'page_views',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'page_views')
UNION ALL
SELECT 
  'scheduled_notifications',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'scheduled_notifications');

-- SECTION 2: Vérifier hero_config
SELECT COUNT(*) as total_heroes FROM hero_config;

SELECT 
  id,
  title,
  display_order,
  is_active
FROM hero_config
ORDER BY display_order ASC;

-- SECTION 3: Vérifier les admins
SELECT COUNT(*) as total_admins FROM admin_users;

SELECT 
  id,
  email,
  is_super_admin
FROM admin_users;

-- SECTION 4: Vérifier les buckets storage
SELECT 
  id,
  name,
  public
FROM storage.buckets
WHERE id IN ('hero-images', 'channel-images', 'movie-images');

