-- =====================================================
-- CORRECTION: Politiques RLS pour scheduled_notifications
-- =====================================================

-- Activer RLS si pas déjà fait
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Anyone can view active scheduled notifications" ON scheduled_notifications;
DROP POLICY IF EXISTS "Admins can manage scheduled notifications" ON scheduled_notifications;

-- Nouvelle policy : Lecture pour tout le monde (notifications actives)
CREATE POLICY scheduled_notifications_read ON scheduled_notifications
  FOR SELECT
  USING (is_active = true);

-- Nouvelle policy : Les admins peuvent tout faire
CREATE POLICY scheduled_notifications_admin ON scheduled_notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  );

COMMENT ON POLICY scheduled_notifications_read ON scheduled_notifications IS 'Tout le monde peut lire les notifications actives';
COMMENT ON POLICY scheduled_notifications_admin ON scheduled_notifications IS 'Les super admins peuvent créer/modifier/supprimer les notifications programmées';

