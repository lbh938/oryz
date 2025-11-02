-- =====================================================
-- CORRECTION : Accès complet admin pour push_subscriptions
-- =====================================================
-- Permet aux admins de modifier et supprimer les abonnements push

-- Supprimer l'ancienne policy admin (lecture seule)
DROP POLICY IF EXISTS push_subs_admin_policy ON push_subscriptions;

-- Créer une nouvelle policy admin avec accès complet (lecture, modification, suppression)
CREATE POLICY push_subs_admin_policy ON push_subscriptions
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

COMMENT ON POLICY push_subs_admin_policy ON push_subscriptions IS 'Les super admins ont un accès complet à tous les abonnements push';

