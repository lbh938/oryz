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
  v_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_user_id := (SELECT auth.uid());
  
  -- Vérifier que l'utilisateur est connecté
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;
  
  -- Supprimer les abonnements push (si table existe)
  BEGIN
    DELETE FROM public.push_subscriptions WHERE push_subscriptions.user_id = v_user_id;
  EXCEPTION
    WHEN undefined_table THEN
      -- Table n'existe pas, ignorer
      NULL;
  END;
  
  -- Supprimer les préférences de notifications (si table existe)
  BEGIN
    DELETE FROM public.notification_preferences WHERE notification_preferences.user_id = v_user_id;
  EXCEPTION
    WHEN undefined_table THEN
      -- Table n'existe pas, ignorer
      NULL;
  END;
  
  -- Supprimer les likes (si table existe)
  BEGIN
    DELETE FROM public.likes WHERE likes.user_id = v_user_id;
  EXCEPTION
    WHEN undefined_table THEN
      -- Table n'existe pas, ignorer
      NULL;
  END;
  
  -- Supprimer les favoris (si table existe)
  BEGIN
    DELETE FROM public.favorites WHERE favorites.user_id = v_user_id;
  EXCEPTION
    WHEN undefined_table THEN
      -- Table n'existe pas, ignorer
      NULL;
  END;
  
  -- Supprimer les abonnements Stripe (si table existe)
  BEGIN
    DELETE FROM public.subscriptions WHERE subscriptions.user_id = v_user_id;
  EXCEPTION
    WHEN undefined_table THEN
      -- Table n'existe pas, ignorer
      NULL;
  END;
  
  -- Supprimer le profil (si table existe)
  BEGIN
    DELETE FROM public.user_profiles WHERE user_profiles.id = v_user_id;
  EXCEPTION
    WHEN undefined_table THEN
      -- Table n'existe pas, ignorer
      NULL;
  END;
  
  -- Supprimer l'utilisateur de auth.users (cascade sur les autres tables)
  DELETE FROM auth.users WHERE auth.users.id = v_user_id;
  
END;
$$;

-- 2. Commentaire
COMMENT ON FUNCTION public.delete_user() IS 
  'Permet à un utilisateur de supprimer son propre compte et toutes ses données associées.';

-- 3. Accorder les permissions (seulement aux utilisateurs authentifiés)
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

