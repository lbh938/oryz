-- =====================================================
-- TABLE : APP_SETTINGS
-- Paramètres de l'application ORYZ
-- =====================================================

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);

-- RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Politique : lecture publique
DROP POLICY IF EXISTS app_settings_read_policy ON app_settings;
CREATE POLICY app_settings_read_policy ON app_settings FOR SELECT USING (true);

-- Politique : seuls les admins peuvent modifier
DROP POLICY IF EXISTS app_settings_write_policy ON app_settings;
CREATE POLICY app_settings_write_policy ON app_settings FOR ALL USING (
  auth.uid() IN (SELECT id FROM admin_users WHERE is_super_admin = true)
);

-- Permissions
GRANT SELECT, INSERT, UPDATE ON app_settings TO anon, authenticated;

-- Insérer le paramètre sandbox par défaut (désactivé)
INSERT INTO app_settings (key, value, description)
VALUES ('iframe_sandbox_enabled', 'false', 'Active ou désactive l''attribut sandbox sur les iframes de lecture vidéo')
ON CONFLICT (key) DO NOTHING;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_app_settings_updated_at
BEFORE UPDATE ON app_settings
FOR EACH ROW
EXECUTE FUNCTION update_app_settings_updated_at();

COMMENT ON TABLE app_settings IS 'Paramètres configurables de l''application ORYZ';

