-- =====================================================
-- CORRECTION : Vue notification_stats
-- =====================================================
-- Cette migration corrige la vue pour afficher correctement
-- le nombre d'appareils actifs depuis push_subscriptions

-- Supprimer l'ancienne vue
DROP VIEW IF EXISTS notification_stats;

-- Créer la nouvelle vue avec comptage correct des appareils
CREATE OR REPLACE VIEW notification_stats AS
SELECT
  -- Utilisateurs connectés ayant accepté
  COUNT(DISTINCT CASE WHEN np.status = 'accepted' AND np.user_id IS NOT NULL THEN np.user_id END) as users_with_notifications,
  
  -- Utilisateurs anonymes ayant accepté
  COUNT(DISTINCT CASE WHEN np.status = 'accepted' AND np.user_id IS NULL THEN np.browser_fingerprint END) as anonymous_with_notifications,
  
  -- Utilisateurs ayant refusé (connectés + anonymes)
  COUNT(DISTINCT CASE WHEN np.status = 'declined' THEN COALESCE(np.user_id::text, np.browser_fingerprint) END) as users_declined,
  
  -- Nombre TOTAL d'appareils actifs avec abonnements push (le vrai comptage)
  (SELECT COUNT(*) FROM push_subscriptions WHERE is_active = true) as active_devices,
  
  -- Total des préférences enregistrées
  COUNT(*) as total_preferences
FROM notification_preferences np;

COMMENT ON VIEW notification_stats IS 'Statistiques des notifications - affiche tous les appareils actifs avec push actif';

