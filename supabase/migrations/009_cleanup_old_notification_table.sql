-- =====================================================
-- NETTOYAGE : Migration de notification_subscriptions vers push_subscriptions
-- =====================================================
-- Cette migration :
-- 1. Migre les données existantes si possible
-- 2. Met à jour la vue notification_stats
-- 3. Supprime l'ancienne table notification_subscriptions

-- Étape 1 : Migrer les données existantes de notification_subscriptions vers push_subscriptions
-- (seulement si des données existent et peuvent être extraites)
DO $$
DECLARE
  migrated_count INTEGER := 0;
BEGIN
  -- Vérifier si l'ancienne table existe et contient des données
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notification_subscriptions'
  ) THEN
    
    -- Migrer les abonnements valides avec toutes les données utiles
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, browser, device_info, is_active, created_at, last_notification_at)
    SELECT DISTINCT ON (subscription_data->>'endpoint')
      ns.user_id,
      subscription_data->>'endpoint' AS endpoint,
      (subscription_data->'keys'->>'p256dh') AS p256dh,
      (subscription_data->'keys'->>'auth') AS auth,
      CASE 
        WHEN ns.device_info ILIKE '%Chrome%' THEN 'Chrome'
        WHEN ns.device_info ILIKE '%Firefox%' THEN 'Firefox'
        WHEN ns.device_info ILIKE '%Safari%' THEN 'Safari'
        WHEN ns.device_info ILIKE '%Edge%' THEN 'Edge'
        ELSE 'Unknown'
      END AS browser,
      ns.device_info AS device_info, -- Conserver les infos complètes
      ns.is_active,
      ns.created_at,
      ns.last_notification_at -- Conserver l'historique des notifications
    FROM notification_subscriptions ns
    WHERE ns.subscription_data ? 'endpoint'
      AND ns.subscription_data->'keys' ? 'p256dh'
      AND ns.subscription_data->'keys' ? 'auth'
      AND NOT EXISTS (
        SELECT 1 FROM push_subscriptions ps 
        WHERE ps.endpoint = ns.subscription_data->>'endpoint'
      )
    ON CONFLICT (endpoint) DO UPDATE SET
      device_info = EXCLUDED.device_info,
      last_notification_at = COALESCE(EXCLUDED.last_notification_at, push_subscriptions.last_notification_at),
      updated_at = now();
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE 'Migré % abonnement(s) de notification_subscriptions vers push_subscriptions', migrated_count;
  END IF;
END $$;

-- Étape 2 : Mettre à jour la vue notification_stats pour utiliser push_subscriptions
CREATE OR REPLACE VIEW notification_stats AS
SELECT
  COUNT(DISTINCT CASE WHEN np.status = 'accepted' THEN np.user_id END) as users_with_notifications,
  COUNT(DISTINCT CASE WHEN np.status = 'accepted' AND np.user_id IS NULL THEN np.browser_fingerprint END) as anonymous_with_notifications,
  COUNT(DISTINCT CASE WHEN np.status = 'declined' THEN COALESCE(np.user_id::text, np.browser_fingerprint) END) as users_declined,
  COUNT(DISTINCT ps.id) as active_devices, -- Utiliser push_subscriptions au lieu de notification_subscriptions
  COUNT(*) as total_preferences
FROM notification_preferences np
LEFT JOIN push_subscriptions ps ON ps.user_id = np.user_id AND ps.is_active = true;

-- Étape 3 : Supprimer les dépendances de notification_subscriptions
-- Supprimer les policies
DROP POLICY IF EXISTS notification_subs_user_policy ON notification_subscriptions;
DROP POLICY IF EXISTS notification_subs_admin_policy ON notification_subscriptions;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS notification_subs_updated_at ON notification_subscriptions;

-- Supprimer les indexes
DROP INDEX IF EXISTS idx_notification_subs_user;
DROP INDEX IF EXISTS idx_notification_subs_active;
DROP INDEX IF EXISTS idx_notification_subs_unique_endpoint;

-- Étape 4 : Supprimer l'ancienne table (seulement si elle existe)
DROP TABLE IF EXISTS notification_subscriptions CASCADE;

-- Note : La table notification_preferences est conservée car elle sert pour les statistiques
-- et pour tracker les choix des utilisateurs (accepté/refusé)

COMMENT ON VIEW notification_stats IS 'Statistiques sur les notifications - Utilise push_subscriptions pour les appareils actifs';

