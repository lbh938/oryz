-- =====================================================
-- CORRECTION FINALE DE LA RÉCURSION INFINIE
-- On supprime TOUT et on recommence proprement
-- =====================================================

-- 1. DÉSACTIVER temporairement RLS
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES LES POLITIQUES
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'admin_users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON admin_users';
    END LOOP;
END $$;

-- 3. RÉACTIVER RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 4. CRÉER UNE POLITIQUE ULTRA-SIMPLE
-- Tout le monde peut LIRE (nécessaire pour vérifier si quelqu'un est admin)
CREATE POLICY admin_users_select_all ON admin_users
FOR SELECT
TO public
USING (true);

-- Les utilisateurs authentifiés peuvent modifier LEUR propre ligne
CREATE POLICY admin_users_update_self ON admin_users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Permissions
GRANT SELECT ON admin_users TO anon, authenticated, public;
GRANT UPDATE ON admin_users TO authenticated;

-- 5. VÉRIFIER que ça fonctionne
SELECT 
  'Test final' as test,
  id,
  email,
  username,
  role,
  is_super_admin
FROM admin_users 
WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405';

-- =====================================================
-- Si vous voyez votre ligne avec is_super_admin = true,
-- alors la récursion est corrigée !
-- =====================================================

