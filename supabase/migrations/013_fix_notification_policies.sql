-- =====================================================
-- CORRECTION : Politiques RLS pour notification_preferences
-- =====================================================
-- Permet aux utilisateurs anonymes d'enregistrer leurs préférences

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS notification_prefs_user_policy ON notification_preferences;
DROP POLICY IF EXISTS notification_prefs_admin_policy ON notification_preferences;

-- Policy pour permettre aux utilisateurs (connectés ET anonymes) de créer/lire/modifier leurs préférences
CREATE POLICY notification_prefs_user_policy ON notification_preferences
  FOR ALL
  USING (
    -- Peut voir ses propres données (connecté) OU données anonymes
    auth.uid() = user_id OR auth.uid() IS NULL
  )
  WITH CHECK (
    -- Peut créer/modifier ses propres données (connecté) OU données anonymes
    auth.uid() = user_id OR auth.uid() IS NULL
  );

-- Policy admin pour voir toutes les préférences
CREATE POLICY notification_prefs_admin_policy ON notification_preferences
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

COMMENT ON POLICY notification_prefs_user_policy ON notification_preferences IS 'Utilisateurs connectés et anonymes peuvent gérer leurs préférences';
COMMENT ON POLICY notification_prefs_admin_policy ON notification_preferences IS 'Les super admins ont un accès complet';

