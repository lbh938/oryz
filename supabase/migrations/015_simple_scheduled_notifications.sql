-- =====================================================
-- SYSTÈME SIMPLE ET FONCTIONNEL DE NOTIFICATIONS PROGRAMMÉES
-- =====================================================

-- Supprimer les anciennes fonctions si elles existent
DROP FUNCTION IF EXISTS get_notifications_to_send();
DROP FUNCTION IF EXISTS schedule_next_occurrence_simple(UUID);

-- Fonction simple qui récupère et marque les notifications à envoyer
CREATE OR REPLACE FUNCTION get_notifications_to_send()
RETURNS TABLE(
  id UUID,
  title TEXT,
  body TEXT,
  icon TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  repeat_type TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Marquer et retourner les notifications prêtes
  RETURN QUERY
  UPDATE scheduled_notifications
  SET 
    is_sent = true,
    sent_at = NOW()
  WHERE scheduled_notifications.is_sent = false
    AND scheduled_notifications.is_active = true
    AND scheduled_notifications.scheduled_for <= NOW()
  RETURNING 
    scheduled_notifications.id,
    scheduled_notifications.title,
    scheduled_notifications.body,
    scheduled_notifications.icon,
    scheduled_notifications.scheduled_for,
    scheduled_notifications.repeat_type;
END;
$$;

-- Fonction pour planifier la prochaine occurrence
CREATE OR REPLACE FUNCTION schedule_next_occurrence_simple(notification_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  notif scheduled_notifications%ROWTYPE;
  next_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Récupérer la notification
  SELECT * INTO notif FROM scheduled_notifications WHERE id = notification_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Calculer la prochaine date selon le type de répétition
  CASE notif.repeat_type
    WHEN 'daily' THEN
      next_date := notif.scheduled_for + INTERVAL '1 day';
    WHEN 'weekly' THEN
      next_date := notif.scheduled_for + INTERVAL '7 days';
    WHEN 'monthly' THEN
      next_date := notif.scheduled_for + INTERVAL '1 month';
    ELSE
      RETURN; -- Pas de répétition pour 'once'
  END CASE;

  -- Créer la nouvelle occurrence
  INSERT INTO scheduled_notifications (
    title,
    body,
    icon,
    scheduled_for,
    repeat_type,
    timezone,
    is_active
  ) VALUES (
    notif.title,
    notif.body,
    notif.icon,
    next_date,
    notif.repeat_type,
    notif.timezone,
    notif.is_active
  );
END;
$$;

COMMENT ON FUNCTION get_notifications_to_send IS 'Récupère et marque les notifications programmées prêtes à être envoyées';
COMMENT ON FUNCTION schedule_next_occurrence_simple IS 'Crée la prochaine occurrence pour les notifications récurrentes';

