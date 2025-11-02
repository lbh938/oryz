-- =====================================================
-- FIX: Ajout de SET search_path aux fonctions pour sécurité
-- =====================================================

-- Drop all functions first to avoid conflicts
-- Use CASCADE for functions that have triggers depending on them
DROP FUNCTION IF EXISTS can_change_username(UUID);
DROP FUNCTION IF EXISTS update_username(UUID, TEXT);
DROP FUNCTION IF EXISTS update_user_profiles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_hero_updated_at() CASCADE;
DROP FUNCTION IF EXISTS cleanup_inactive_visitors();
DROP FUNCTION IF EXISTS count_active_visitors();
DROP FUNCTION IF EXISTS get_active_heroes();
DROP FUNCTION IF EXISTS update_scheduled_notification_updated_at() CASCADE;
DROP FUNCTION IF EXISTS mark_notification_as_sent(UUID);
DROP FUNCTION IF EXISTS schedule_next_occurrence(UUID);
DROP FUNCTION IF EXISTS schedule_next_occurrence_simple(UUID);
DROP FUNCTION IF EXISTS trigger_scheduled_notifications_http();
DROP FUNCTION IF EXISTS get_notifications_to_send();

-- 1. Fonction can_change_username avec search_path
CREATE OR REPLACE FUNCTION can_change_username(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_changed TIMESTAMP WITH TIME ZONE;
  one_year_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT username_last_changed INTO last_changed
  FROM user_profiles
  WHERE id = user_id;
  
  IF last_changed IS NULL THEN
    RETURN TRUE;
  END IF;
  
  one_year_ago := NOW() - INTERVAL '1 year';
  RETURN last_changed <= one_year_ago;
END;
$$;

-- 2. Fonction update_username avec search_path
CREATE OR REPLACE FUNCTION update_username(
  user_id UUID,
  new_username TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  can_change BOOLEAN;
  result JSONB;
BEGIN
  -- Vérifier si l'utilisateur peut changer son username
  can_change := can_change_username(user_id);
  
  IF NOT can_change THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Vous ne pouvez changer votre username qu''une fois par an'
    );
  END IF;
  
  -- Vérifier que le username n'est pas déjà pris
  IF EXISTS (SELECT 1 FROM user_profiles WHERE username = new_username AND id != user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce username est déjà pris'
    );
  END IF;
  
  -- Mettre à jour le username
  UPDATE user_profiles
  SET 
    username = new_username,
    username_last_changed = NOW(),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Username mis à jour avec succès'
  );
END;
$$;

-- 3. Fonction update_user_profiles_updated_at avec search_path
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 4. Fonction update_hero_updated_at avec search_path
CREATE OR REPLACE FUNCTION update_hero_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 5. Fonction cleanup_inactive_visitors avec search_path
CREATE OR REPLACE FUNCTION cleanup_inactive_visitors()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM active_visitors
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$;

-- 6. Fonction count_active_visitors avec search_path
CREATE OR REPLACE FUNCTION count_active_visitors()
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  visitor_count integer;
BEGIN
  -- Nettoyer les visiteurs inactifs
  PERFORM cleanup_inactive_visitors();
  
  -- Compter les visiteurs actifs
  SELECT COUNT(DISTINCT session_id) INTO visitor_count
  FROM active_visitors;
  
  RETURN visitor_count;
END;
$$;

-- 7. Fonction get_active_heroes avec search_path
CREATE OR REPLACE FUNCTION get_active_heroes()
RETURNS TABLE(
  id UUID,
  title TEXT,
  subtitle TEXT,
  cta_text TEXT,
  cta_url TEXT,
  image_url TEXT,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.title,
    h.subtitle,
    h.cta_text,
    h.cta_url,
    h.image_url,
    h.display_order,
    h.created_at,
    h.updated_at
  FROM hero_config h
  WHERE h.is_active = true
  ORDER BY h.display_order ASC;
END;
$$;

-- 8. Fonction update_scheduled_notification_updated_at avec search_path
CREATE OR REPLACE FUNCTION update_scheduled_notification_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 9. Fonction mark_notification_as_sent avec search_path
CREATE OR REPLACE FUNCTION mark_notification_as_sent(notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE scheduled_notifications
  SET 
    is_sent = true,
    sent_at = NOW()
  WHERE id = notification_id;
END;
$$;

-- 10. Fonction schedule_next_occurrence avec search_path
CREATE OR REPLACE FUNCTION schedule_next_occurrence(notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_notif scheduled_notifications%ROWTYPE;
  next_scheduled_for TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT * INTO current_notif
  FROM scheduled_notifications
  WHERE id = notification_id;
  
  IF current_notif.repeat_type = 'daily' THEN
    next_scheduled_for := current_notif.scheduled_for + INTERVAL '1 day';
  ELSIF current_notif.repeat_type = 'weekly' THEN
    next_scheduled_for := current_notif.scheduled_for + INTERVAL '1 week';
  ELSIF current_notif.repeat_type = 'monthly' THEN
    next_scheduled_for := current_notif.scheduled_for + INTERVAL '1 month';
  ELSE
    RETURN;
  END IF;
  
  INSERT INTO scheduled_notifications (
    title, body, icon, scheduled_for, repeat_type, timezone, is_active, created_by
  ) VALUES (
    current_notif.title,
    current_notif.body,
    current_notif.icon,
    next_scheduled_for,
    current_notif.repeat_type,
    current_notif.timezone,
    true,
    current_notif.created_by
  );
END;
$$;

-- 11. Fonction schedule_next_occurrence_simple avec search_path
CREATE OR REPLACE FUNCTION schedule_next_occurrence_simple(notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_notif scheduled_notifications%ROWTYPE;
  next_scheduled_for TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT * INTO current_notif FROM scheduled_notifications WHERE id = notification_id;

  IF current_notif.repeat_type = 'daily' THEN
    next_scheduled_for := current_notif.scheduled_for + INTERVAL '1 day';
  ELSIF current_notif.repeat_type = 'weekly' THEN
    next_scheduled_for := current_notif.scheduled_for + INTERVAL '1 week';
  ELSIF current_notif.repeat_type = 'monthly' THEN
    next_scheduled_for := current_notif.scheduled_for + INTERVAL '1 month';
  ELSE
    RETURN;
  END IF;

  INSERT INTO scheduled_notifications (title, body, icon, scheduled_for, repeat_type, timezone, is_active, created_by)
  VALUES (
    current_notif.title,
    current_notif.body,
    current_notif.icon,
    next_scheduled_for,
    current_notif.repeat_type,
    current_notif.timezone,
    TRUE,
    current_notif.created_by
  );
END;
$$;

-- 12. Fonction trigger_scheduled_notifications_http avec search_path
CREATE OR REPLACE FUNCTION trigger_scheduled_notifications_http()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  api_url TEXT;
BEGIN
  api_url := 'https://oryz-six.vercel.app/api/scheduled-notifications/send';
  
  PERFORM net.http_post(
    url := api_url,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
END;
$$;

-- 13. Fonction get_notifications_to_send avec search_path
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
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sn.id,
    sn.title,
    sn.body,
    sn.icon,
    sn.scheduled_for,
    sn.repeat_type
  FROM scheduled_notifications sn
  WHERE sn.is_active = true
    AND sn.is_sent = false
    AND sn.scheduled_for <= NOW();
  
  -- Marquer comme envoyées
  UPDATE scheduled_notifications
  SET is_sent = true, sent_at = NOW()
  WHERE id IN (
    SELECT sn2.id 
    FROM scheduled_notifications sn2
    WHERE sn2.is_active = true
      AND sn2.is_sent = false
      AND sn2.scheduled_for <= NOW()
  );
  
  -- Programmer les prochaines occurrences pour les notifications répétitives
  PERFORM schedule_next_occurrence_simple(notif.id)
  FROM (
    SELECT sn3.id
    FROM scheduled_notifications sn3
    WHERE sn3.is_active = true
      AND sn3.is_sent = true
      AND sn3.sent_at >= NOW() - INTERVAL '1 minute'
      AND sn3.repeat_type IN ('daily', 'weekly', 'monthly')
  ) notif;
END;
$$;

COMMENT ON FUNCTION can_change_username IS 'Vérifie si l''utilisateur peut changer son username (avec search_path pour sécurité)';
COMMENT ON FUNCTION update_username IS 'Permet de mettre à jour le username avec vérification (avec search_path pour sécurité)';
COMMENT ON FUNCTION trigger_scheduled_notifications_http IS 'Déclenche l''envoi des notifications programmées via HTTP (avec search_path pour sécurité)';
COMMENT ON FUNCTION get_notifications_to_send IS 'Récupère et marque les notifications à envoyer (avec search_path pour sécurité)';

-- =====================================================
-- Recréer les triggers qui ont été supprimés avec CASCADE
-- =====================================================

-- Trigger pour user_profiles
DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Trigger pour hero_config
DROP TRIGGER IF EXISTS hero_config_updated_at ON hero_config;
CREATE TRIGGER hero_config_updated_at
  BEFORE UPDATE ON hero_config
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_updated_at();

-- Trigger pour scheduled_notifications
DROP TRIGGER IF EXISTS scheduled_notifications_updated_at ON scheduled_notifications;
CREATE TRIGGER scheduled_notifications_updated_at
  BEFORE UPDATE ON scheduled_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_notification_updated_at();

