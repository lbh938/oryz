-- Migration: Corriger la fonction delete_user pour éviter l'ambiguïté
-- Description: Corrige l'erreur "column reference 'user_id' is ambiguous"

-- Corriger la fonction pour éviter l'ambiguïté sur user_id
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
  
  -- Supprimer les abonnements push (avec préfixe de table pour éviter l'ambiguïté)
  DELETE FROM public.push_subscriptions WHERE push_subscriptions.user_id = v_user_id;
  
  -- Supprimer les préférences de notifications (avec préfixe de table)
  DELETE FROM public.notification_preferences WHERE notification_preferences.user_id = v_user_id;
  
  -- Supprimer le profil (avec préfixe de table)
  DELETE FROM public.user_profiles WHERE user_profiles.id = v_user_id;
  
  -- Supprimer l'utilisateur de auth.users (avec préfixe de schéma)
  DELETE FROM auth.users WHERE auth.users.id = v_user_id;
  
END;
$$;

-- Commentaire
COMMENT ON FUNCTION public.delete_user() IS 
  'Permet à un utilisateur de supprimer son propre compte et toutes ses données associées. Version corrigée pour éviter l''ambiguïté sur user_id.';

