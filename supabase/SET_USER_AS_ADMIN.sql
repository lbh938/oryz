-- =====================================================
-- RENDRE VOTRE UTILISATEUR ADMIN
-- Exécutez après avoir créé votre compte via le site
-- =====================================================

-- Remplacez 'admin@oryz.stream' par VOTRE email
INSERT INTO admin_users (id, email, username, role, is_super_admin)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@oryz.stream'),
  'admin@oryz.stream',
  'admin',
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_super_admin = true;

-- Vérifier que ça a fonctionné
SELECT 
  au.email,
  au.username,
  au.role,
  au.is_super_admin,
  u.email as auth_email
FROM admin_users au
JOIN auth.users u ON u.id = au.id
WHERE au.email = 'admin@oryz.stream';

-- Si vous voyez votre email avec is_super_admin = true, c'est bon ! ✅

