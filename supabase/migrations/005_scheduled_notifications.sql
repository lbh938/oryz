-- =====================================================
-- MIGRATION: Notifications programmées
-- =====================================================

-- Créer la table pour les notifications programmées
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT DEFAULT '/icon-192x192.png',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  repeat_type TEXT DEFAULT 'once' CHECK (repeat_type IN ('once', 'daily', 'weekly', 'monthly')),
  is_sent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for 
ON scheduled_notifications(scheduled_for) WHERE is_sent = false AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_created_by 
ON scheduled_notifications(created_by);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_scheduled_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scheduled_notification_updated_at
BEFORE UPDATE ON scheduled_notifications
FOR EACH ROW
EXECUTE FUNCTION update_scheduled_notification_updated_at();

-- RLS: Tout le monde peut voir les notifications actives
CREATE POLICY "Anyone can view active scheduled notifications"
ON scheduled_notifications FOR SELECT
USING (is_active = true);

-- RLS: Seuls les admins peuvent créer/modifier/supprimer
CREATE POLICY "Admins can manage scheduled notifications"
ON scheduled_notifications FOR ALL
USING (
  auth.uid() IN (SELECT id FROM admin_users WHERE is_super_admin = true)
);

-- Fonction pour récupérer les notifications à envoyer
CREATE OR REPLACE FUNCTION get_notifications_to_send()
RETURNS SETOF scheduled_notifications
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM scheduled_notifications
  WHERE is_sent = false
    AND is_active = true
    AND scheduled_for <= NOW()
  ORDER BY scheduled_for ASC;
$$;

-- Fonction pour marquer une notification comme envoyée
CREATE OR REPLACE FUNCTION mark_notification_as_sent(notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE scheduled_notifications
  SET is_sent = true,
      sent_at = NOW()
  WHERE id = notification_id;
  
  RETURN FOUND;
END;
$$;

-- Fonction pour planifier la prochaine occurrence (répétitions)
CREATE OR REPLACE FUNCTION schedule_next_occurrence(notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  notif scheduled_notifications;
  next_date TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT * INTO notif FROM scheduled_notifications WHERE id = notification_id;
  
  IF NOT FOUND OR notif.repeat_type = 'once' THEN
    RETURN FALSE;
  END IF;
  
  -- Calculer la prochaine date selon le type de répétition
  CASE notif.repeat_type
    WHEN 'daily' THEN
      next_date := notif.scheduled_for + INTERVAL '1 day';
    WHEN 'weekly' THEN
      next_date := notif.scheduled_for + INTERVAL '1 week';
    WHEN 'monthly' THEN
      next_date := notif.scheduled_for + INTERVAL '1 month';
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- Créer une nouvelle notification pour la prochaine occurrence
  INSERT INTO scheduled_notifications (
    title, body, icon, scheduled_for, repeat_type, is_active, created_by
  ) VALUES (
    notif.title, notif.body, notif.icon, next_date, notif.repeat_type, true, notif.created_by
  );
  
  RETURN TRUE;
END;
$$;

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_notifications TO authenticated;

-- Vérification
SELECT 
  'scheduled_notifications table created' as status,
  COUNT(*) as initial_count
FROM scheduled_notifications;

