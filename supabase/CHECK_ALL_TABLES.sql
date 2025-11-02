-- =====================================================
-- VÉRIFICATION COMPLÈTE DE TOUTES LES TABLES
-- =====================================================

-- 1. Vérifier si les tables existent
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

-- 2. Vérifier les données dans hero_config
SELECT 
  '=== HERO CONFIG ===' as info,
  COUNT(*) as total_heroes
FROM hero_config;

SELECT 
  id,
  title,
  subtitle,
  cta_text,
  cta_url,
  LEFT(image_url, 50) as image_url_preview,
  display_order,
  is_active,
  created_at
FROM hero_config
ORDER BY display_order ASC, created_at DESC;

-- 3. Vérifier les admins
SELECT 
  '=== ADMIN USERS ===' as info,
  COUNT(*) as total_admins
FROM admin_users;

SELECT 
  id,
  email,
  username,
  is_super_admin,
  created_at
FROM admin_users;

-- 4. Vérifier les politiques RLS sur hero_config
SELECT 
  '=== RLS POLICIES ===' as info;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN LENGTH(qual::text) > 50 THEN LEFT(qual::text, 50) || '...'
    ELSE qual::text
  END as qual_preview
FROM pg_policies
WHERE tablename = 'hero_config'
ORDER BY policyname;

-- 5. Vérifier les visiteurs actifs (dernières 24h)
SELECT 
  '=== ACTIVE VISITORS (24h) ===' as info,
  COUNT(*) as total_visitors
FROM active_visitors
WHERE last_seen >= NOW() - INTERVAL '24 hours';

-- 6. Vérifier les vues de pages (dernières 24h)
SELECT 
  '=== PAGE VIEWS (24h) ===' as info,
  COUNT(*) as total_views
FROM page_views
WHERE viewed_at >= NOW() - INTERVAL '24 hours';

SELECT 
  page_path,
  COUNT(*) as views
FROM page_views
WHERE viewed_at >= NOW() - INTERVAL '24 hours'
GROUP BY page_path
ORDER BY views DESC
LIMIT 10;

-- 7. Vérifier les notifications programmées
SELECT 
  '=== SCHEDULED NOTIFICATIONS ===' as info,
  COUNT(*) as total_notifications
FROM scheduled_notifications;

SELECT 
  id,
  title,
  LEFT(body, 30) as body_preview,
  scheduled_for,
  repeat_type,
  is_sent,
  is_active,
  created_at
FROM scheduled_notifications
ORDER BY scheduled_for DESC
LIMIT 10;

-- 8. Vérifier les buckets storage
SELECT 
  '=== STORAGE BUCKETS ===' as info;

SELECT 
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as size_limit_mb,
  created_at
FROM storage.buckets
WHERE id IN ('hero-images', 'channel-images', 'movie-images');

-- 9. Vérifier les permissions
SELECT 
  '=== TABLE PERMISSIONS ===' as info;

SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('hero_config', 'admin_users', 'active_visitors', 'page_views')
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee;

