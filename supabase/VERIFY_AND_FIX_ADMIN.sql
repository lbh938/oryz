-- =====================================================
-- VÉRIFIER ET CORRIGER VOTRE STATUT ADMIN
-- =====================================================

-- 1. Vérifier si vous existez dans admin_users
SELECT 
  'Étape 1: Vérification dans admin_users' as etape,
  id,
  email,
  username,
  role,
  is_super_admin
FROM admin_users 
WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405';

-- 2. Si rien n'apparaît, INSÉRER maintenant
INSERT INTO admin_users (id, email, username, role, is_super_admin)
SELECT 
  'ff4f857b-35a5-4960-9049-48b54ab23405',
  email,
  'admin',
  'super_admin',
  true
FROM auth.users 
WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405'
ON CONFLICT (id) DO UPDATE SET
  is_super_admin = true,
  role = 'super_admin',
  username = 'admin';

-- 3. Vérification finale
SELECT 
  'Étape 3: Confirmation finale' as etape,
  au.id,
  au.email,
  au.username,
  au.role,
  au.is_super_admin,
  u.email as email_auth,
  CASE 
    WHEN au.is_super_admin = true THEN '✅ ADMIN CONFIRMÉ'
    ELSE '❌ PROBLÈME: is_super_admin est FALSE'
  END as statut
FROM admin_users au
JOIN auth.users u ON u.id = au.id
WHERE au.id = 'ff4f857b-35a5-4960-9049-48b54ab23405';

-- 4. Tester la lecture sans auth (comme le fait la page)
SELECT 
  'Étape 4: Test lecture publique' as etape,
  COUNT(*) as count,
  MAX(is_super_admin::text) as is_super_admin
FROM admin_users 
WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405';

-- =====================================================
-- SI TOUT EST OK, VOUS DEVRIEZ VOIR:
-- - Étape 3: is_super_admin = true
-- - Étape 3: statut = ✅ ADMIN CONFIRMÉ
-- - Étape 4: count = 1, is_super_admin = true
-- =====================================================

