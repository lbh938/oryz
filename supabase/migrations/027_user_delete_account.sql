-- Migration: Permettre aux utilisateurs de supprimer leur propre compte
-- Description: Fonction sécurisée pour qu'un utilisateur puisse supprimer son compte

-- 1. Fonction pour supprimer son propre compte
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  user_id := (SELECT auth.uid());
  
  -- Vérifier que l'utilisateur est connecté
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;
  
  -- Supprimer les abonnements push
  DELETE FROM public.push_subscriptions WHERE user_id = user_id;
  
  -- Supprimer les préférences de notifications
  DELETE FROM public.notification_preferences WHERE user_id = user_id;
  
  -- Supprimer le profil
  DELETE FROM public.user_profiles WHERE id = user_id;
  
  -- Supprimer l'utilisateur de auth.users (cascade sur les autres tables)
  DELETE FROM auth.users WHERE id = user_id;
  
END;
$$;

-- 2. Commentaire
COMMENT ON FUNCTION public.delete_user() IS 
  'Permet à un utilisateur de supprimer son propre compte et toutes ses données associées.';

-- 3. Accorder les permissions (seulement aux utilisateurs authentifiés)
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

