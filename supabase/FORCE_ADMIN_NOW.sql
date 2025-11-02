-- =====================================================
-- FORCER LE STATUT ADMIN MAINTENANT
-- UUID: ff4f857b-35a5-4960-9049-48b54ab23405
-- =====================================================

-- Supprimer l'entrée si elle existe déjà
DELETE FROM admin_users WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405';

-- Insérer avec le statut admin FORCÉ
INSERT INTO admin_users (id, email, username, role, is_super_admin)
VALUES (
  'ff4f857b-35a5-4960-9049-48b54ab23405',
  (SELECT email FROM auth.users WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405'),
  'admin',
  'super_admin',
  true
);

-- Vérifier immédiatement
SELECT 
  id,
  email,
  username,
  role,
  is_super_admin,
  CASE 
    WHEN is_super_admin = true THEN '✅ VOUS ÊTES ADMIN !'
    ELSE '❌ PROBLÈME'
  END as status
FROM admin_users 
WHERE id = 'ff4f857b-35a5-4960-9049-48b54ab23405';

-- Si vous voyez is_super_admin = true, rechargez /protected

