-- =====================================================
-- FIX: Correction des vues avec SECURITY DEFINER
-- =====================================================

-- 1. Corriger la vue public_profiles (retirer SECURITY DEFINER)
DROP VIEW IF EXISTS public_profiles;
CREATE VIEW public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  avatar_url,
  created_at
FROM user_profiles;

-- Grant access to authenticated users
GRANT SELECT ON public_profiles TO authenticated;
GRANT SELECT ON public_profiles TO anon;

-- 2. Corriger la vue notification_stats (retirer SECURITY DEFINER)
DROP VIEW IF EXISTS notification_stats;
CREATE VIEW notification_stats
WITH (security_invoker = true)
AS
SELECT
  COUNT(DISTINCT CASE WHEN np.status = 'accepted' AND np.user_id IS NOT NULL THEN np.user_id END) as users_with_notifications,
  COUNT(DISTINCT CASE WHEN np.status = 'accepted' AND np.user_id IS NULL THEN np.browser_fingerprint END) as anonymous_with_notifications,
  COUNT(DISTINCT CASE WHEN np.status = 'declined' THEN COALESCE(np.user_id::text, np.browser_fingerprint) END) as users_declined,
  (SELECT COUNT(*) FROM push_subscriptions WHERE is_active = true) as active_devices,
  COUNT(*) as total_preferences
FROM notification_preferences np;

-- Grant access
GRANT SELECT ON notification_stats TO authenticated;

-- 3. Corriger la vue top_pages_24h (retirer SECURITY DEFINER et corriger les colonnes)
DROP VIEW IF EXISTS top_pages_24h;
CREATE VIEW top_pages_24h
WITH (security_invoker = true)
AS
SELECT
  page_url,
  page_title,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_visitors
FROM page_views
WHERE viewed_at >= NOW() - INTERVAL '24 hours'
GROUP BY page_url, page_title
ORDER BY views DESC
LIMIT 10;

-- Grant access
GRANT SELECT ON top_pages_24h TO authenticated;

-- 4. Corriger la vue top_pages_7d (retirer SECURITY DEFINER et corriger les colonnes)
DROP VIEW IF EXISTS top_pages_7d;
CREATE VIEW top_pages_7d
WITH (security_invoker = true)
AS
SELECT
  page_url,
  page_title,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_visitors
FROM page_views
WHERE viewed_at >= NOW() - INTERVAL '7 days'
GROUP BY page_url, page_title
ORDER BY views DESC
LIMIT 10;

-- Grant access
GRANT SELECT ON top_pages_7d TO authenticated;

-- Ajouter des commentaires
COMMENT ON VIEW public_profiles IS 'Vue publique des profils utilisateurs (sans SECURITY DEFINER pour la sécurité)';
COMMENT ON VIEW notification_stats IS 'Statistiques des notifications (sans SECURITY DEFINER pour la sécurité)';
COMMENT ON VIEW top_pages_24h IS 'Top 10 pages des dernières 24h (sans SECURITY DEFINER pour la sécurité)';
COMMENT ON VIEW top_pages_7d IS 'Top 10 pages des 7 derniers jours (sans SECURITY DEFINER pour la sécurité)';

