-- =====================================================
-- PROFILS UTILISATEURS COMPLETS
-- =====================================================

-- 1. Créer la table user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  username_last_changed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT,
  first_name TEXT,
  last_name TEXT,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- 2. Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- 3. Fonction pour vérifier si l'utilisateur peut changer son username
CREATE OR REPLACE FUNCTION can_change_username(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_changed TIMESTAMP WITH TIME ZONE;
  one_year_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT username_last_changed INTO last_changed
  FROM user_profiles
  WHERE id = user_id;
  
  IF last_changed IS NULL THEN
    RETURN TRUE;
  END IF;
  
  one_year_ago := NOW() - INTERVAL '1 year';
  RETURN last_changed <= one_year_ago;
END;
$$;

-- 4. Fonction pour mettre à jour le username avec vérification
CREATE OR REPLACE FUNCTION update_username(
  user_id UUID,
  new_username TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  can_change BOOLEAN;
  result JSONB;
BEGIN
  -- Vérifier si l'utilisateur peut changer son username
  can_change := can_change_username(user_id);
  
  IF NOT can_change THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Vous ne pouvez changer votre username qu''une fois par an'
    );
  END IF;
  
  -- Vérifier que le username n'est pas déjà pris
  IF EXISTS (SELECT 1 FROM user_profiles WHERE username = new_username AND id != user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce username est déjà pris'
    );
  END IF;
  
  -- Mettre à jour le username
  UPDATE user_profiles
  SET 
    username = new_username,
    username_last_changed = NOW(),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Username mis à jour avec succès'
  );
END;
$$;

-- 5. Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- 6. RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Anyone can check username availability" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Tout le monde peut lire les usernames (pour vérifier disponibilité lors de l'inscription)
CREATE POLICY "Anyone can check username availability"
  ON user_profiles
  FOR SELECT
  USING (true);

-- L'utilisateur peut lire son propre profil complet
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- L'utilisateur peut mettre à jour son propre profil (sauf username via cette policy)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- L'utilisateur peut insérer son propre profil lors de l'inscription
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  );

-- 7. Fonction pour créer un profil automatiquement lors de l'inscription
-- NOTE: Le profil est créé avec le username choisi par l'utilisateur via l'app
-- Ce trigger est désactivé car la création se fait côté client avec le username choisi
-- Si besoin de créer un profil automatiquement (sans username choisi), décommenter ci-dessous

/*
CREATE OR REPLACE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_username TEXT;
BEGIN
  -- Récupérer le username depuis les métadonnées utilisateur
  user_username := NEW.raw_user_meta_data->>'username';
  
  -- Si pas de username dans les métadonnées, générer un username temporaire
  IF user_username IS NULL THEN
    user_username := 'user_' || substring(NEW.id::TEXT, 1, 8);
  END IF;
  
  -- Créer le profil avec le username
  INSERT INTO user_profiles (id, username)
  VALUES (NEW.id, user_username)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 8. Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile_on_signup();
*/

-- 9. Vue pour les profils publics (pour afficher les usernames dans la nav, etc.)
DROP VIEW IF EXISTS public_profiles;
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
  id,
  username,
  avatar_url,
  created_at
FROM user_profiles;

-- Grant access to authenticated users
GRANT SELECT ON public_profiles TO authenticated;

COMMENT ON TABLE user_profiles IS 'Profils utilisateurs avec username, avatar et informations personnelles';
COMMENT ON FUNCTION update_username IS 'Permet de mettre à jour le username avec vérification de la limite d''un an';
COMMENT ON FUNCTION can_change_username IS 'Vérifie si l''utilisateur peut changer son username (1 fois/an)';

