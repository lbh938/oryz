-- =====================================================
-- TABLE : HERO_CONFIG
-- Configuration de la bannière hero de la page d'accueil
-- =====================================================

CREATE TABLE IF NOT EXISTS hero_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  cta_text TEXT NOT NULL DEFAULT 'Regarder',
  cta_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer une config par défaut
INSERT INTO hero_config (title, subtitle, cta_text, cta_url, image_url)
VALUES (
  'beINSPORT 1',
  'Sports en direct - Couverture complète des événements sportifs mondiaux',
  'Regarder',
  '/watch/1',
  '/images/channels/beIN SPORT.png'
)
ON CONFLICT DO NOTHING;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_hero_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS hero_config_updated_at ON hero_config;
CREATE TRIGGER hero_config_updated_at
  BEFORE UPDATE ON hero_config
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_updated_at();

-- RLS
ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;

-- Politique : lecture publique du hero actif
DROP POLICY IF EXISTS hero_read_active ON hero_config;
CREATE POLICY hero_read_active ON hero_config FOR SELECT USING (is_active = true);

-- Politique : seuls les admins peuvent modifier
DROP POLICY IF EXISTS hero_admin_write ON hero_config;
CREATE POLICY hero_admin_write ON hero_config FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_super_admin = true)
);

-- Permissions
GRANT SELECT ON hero_config TO anon, authenticated;
GRANT ALL ON hero_config TO authenticated;

COMMENT ON TABLE hero_config IS 'Configuration du hero principal de la page d accueil';

