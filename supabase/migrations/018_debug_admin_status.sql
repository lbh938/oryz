-- =====================================================
-- DEBUG: Vérifier le statut admin de l'utilisateur actuel
-- =====================================================

-- Afficher l'utilisateur actuel
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_email;

-- Vérifier si l'utilisateur est dans admin_users
SELECT 
  id,
  email,
  is_super_admin,
  created_at
FROM admin_users
WHERE id = auth.uid();

-- Si aucun résultat ci-dessus, vous n'êtes PAS dans admin_users
-- Dans ce cas, ajoutez-vous avec cette commande :
-- (Remplacez YOUR_USER_ID par votre ID affiché dans la première requête)

/*
INSERT INTO admin_users (id, email, is_super_admin)
VALUES (
  'YOUR_USER_ID',  -- Remplacez par votre UUID
  'votre.email@example.com',  -- Remplacez par votre email
  true
)
ON CONFLICT (id) DO UPDATE
SET is_super_admin = true;
*/

-- Vérifier les policies actuelles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'scheduled_notifications';

