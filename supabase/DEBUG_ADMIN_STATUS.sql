-- =====================================================
-- DEBUG : VÉRIFIER LE STATUT ADMIN
-- =====================================================

-- 1. Vérifier votre utilisateur dans auth.users
SELECT 
  id,
  email,
  created_at,
  'Utilisateur existe dans auth.users' as status
FROM auth.users 
WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405';

-- 2. Vérifier si vous êtes dans admin_users
SELECT 
  id,
  email,
  username,
  role,
  is_super_admin,
  'Statut dans admin_users' as status
FROM admin_users 
WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405';

-- 3. Si vous n'êtes PAS dans admin_users, exécutez ceci :
INSERT INTO admin_users (id, email, username, role, is_super_admin)
VALUES (
  'ff4f857b-35a5-4960-9049-48b54ab23405',
  (SELECT email FROM auth.users WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405'),
  'admin',
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  is_super_admin = true,
  role = 'super_admin';

-- 4. Vérification finale
SELECT 
  au.id,
  au.email,
  au.username,
  au.role,
  au.is_super_admin,
  u.email as auth_email,
  CASE 
    WHEN au.is_super_admin = true THEN '✅ VOUS ÊTES ADMIN'
    ELSE '❌ PAS ADMIN'
  END as result
FROM admin_users au
JOIN auth.users u ON u.id = au.id
WHERE au.id = 'ff4f857b-35a5-4960-9049-48b54ab23405';

