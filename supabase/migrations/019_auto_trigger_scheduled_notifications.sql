-- =====================================================
-- AUTO-TRIGGER: Notifications programmées (pg_cron)
-- =====================================================

-- 1. Activer l'extension pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Activer l'extension pg_net pour les requêtes HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Supprimer l'ancien job si existant (ignorer l'erreur si n'existe pas)
DO $$
BEGIN
  PERFORM cron.unschedule('send-scheduled-notifications-auto');
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignorer l'erreur si le job n'existe pas
END $$;

-- 4. Créer une fonction qui appelle l'API
CREATE OR REPLACE FUNCTION trigger_scheduled_notifications_http()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_status int;
BEGIN
  -- Appeler l'API d'envoi
  SELECT status INTO response_status
  FROM net.http_get(
    url := 'https://oryz-six.vercel.app/api/scheduled-notifications/send',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  
  -- Logger le résultat
  RAISE LOG 'Scheduled notifications trigger - HTTP Status: %', response_status;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error triggering scheduled notifications: %', SQLERRM;
END;
$$;

-- 5. Programmer l'exécution TOUTES LES MINUTES
SELECT cron.schedule(
  'send-scheduled-notifications-auto',  -- Nom du job
  '* * * * *',                          -- Chaque minute
  'SELECT trigger_scheduled_notifications_http();'
);

-- 6. Vérifier que le job est bien créé
SELECT 
  jobid,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'send-scheduled-notifications-auto';

COMMENT ON FUNCTION trigger_scheduled_notifications_http() IS 
'Fonction appelée automatiquement chaque minute par pg_cron pour envoyer les notifications programmées';

