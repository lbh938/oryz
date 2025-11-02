-- =====================================================
-- PROMOUVOIR L'UTILISATEUR EN ADMIN
-- UUID: ff4f857b-35a5-4960-9049-48b54ab23405
-- =====================================================

-- Rendre cet utilisateur super admin
INSERT INTO admin_users (id, email, username, role, is_super_admin)
VALUES (
  'ff4f857b-35a5-4960-9049-48b54ab23405',
  (SELECT email FROM auth.users WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405'),
  'admin',
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_super_admin = true,
  username = 'admin';

-- Vérifier que c'est OK
SELECT 
  au.id,
  au.email,
  au.username,
  au.role,
  au.is_super_admin,
  u.email as auth_email,
  u.created_at
FROM admin_users au
JOIN auth.users u ON u.id = au.id
WHERE au.id = 'ff4f857b-35a5-4960-9049-48b54ab23405';

-- =====================================================
-- RÉSULTAT ATTENDU :
-- id: ff4f857b-35a5-4960-9049-48b54ab23405
-- email: (votre email)
-- username: admin
-- role: super_admin
-- is_super_admin: true
-- auth_email: (votre email)
-- =====================================================

-- ✅ MAINTENANT VOUS POUVEZ :
-- 1. Vous connecter sur /auth/login
-- 2. Aller sur /admin
-- 3. Profiter du panel admin !
-- =====================================================

