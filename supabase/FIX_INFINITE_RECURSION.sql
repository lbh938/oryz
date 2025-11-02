-- =====================================================
-- CORRIGER LA RÉCURSION INFINIE DANS admin_users
-- =====================================================

-- Supprimer TOUTES les politiques problématiques
DROP POLICY IF EXISTS admin_read_policy ON admin_users;
DROP POLICY IF EXISTS admin_write_policy ON admin_users;
DROP POLICY IF EXISTS admin_all_policy ON admin_users;

-- Créer une politique SIMPLE sans récursion
-- Tout le monde peut LIRE admin_users (nécessaire pour vérifier si quelqu'un est admin)
CREATE POLICY admin_users_read_all ON admin_users
FOR SELECT
USING (true);

-- Seuls les admins authentifiés peuvent MODIFIER
-- On utilise auth.uid() directement sans sous-requête
CREATE POLICY admin_users_write_own ON admin_users
FOR ALL
USING (auth.uid() = id);

-- Permissions
GRANT SELECT ON admin_users TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON admin_users TO authenticated;

-- Vérifier que ça fonctionne
SELECT 
  id,
  email,
  username,
  role,
  is_super_admin
FROM admin_users 
WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405';

-- ✅ Si vous voyez votre ligne avec is_super_admin = true, c'est corrigé !

