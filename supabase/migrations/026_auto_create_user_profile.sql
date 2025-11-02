-- Migration: Auto-créer le profil utilisateur lors de l'inscription
-- Description: Trigger pour créer automatiquement un profil dans user_profiles après création d'un compte

-- 1. Fonction pour créer le profil automatiquement
CREATE OR REPLACE FUNCTION public.create_user_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_username TEXT;
BEGIN
  -- Récupérer le username depuis les métadonnées utilisateur
  user_username := NEW.raw_user_meta_data->>'username';
  
  -- Si pas de username dans les métadonnées, générer un username temporaire
  IF user_username IS NULL OR user_username = '' THEN
    user_username := 'user_' || substring(NEW.id::TEXT, 1, 8);
  END IF;
  
  -- Créer le profil utilisateur (uniquement s'il n'existe pas déjà)
  INSERT INTO public.user_profiles (
    id,
    username,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    user_username,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Ne rien faire si le profil existe déjà
  
  RETURN NEW;
END;
$$;

-- 2. Créer le trigger (supprimer l'ancien d'abord si existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_profile_on_signup();

-- 3. Commentaire
COMMENT ON FUNCTION public.create_user_profile_on_signup() IS 
  'Crée automatiquement un profil utilisateur dans user_profiles lors de l''inscription. Le username est pris depuis les métadonnées ou généré automatiquement.';

