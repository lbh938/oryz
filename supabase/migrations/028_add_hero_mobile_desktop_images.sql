-- =====================================================
-- MIGRATION: Support images mobile/desktop séparées pour hero
-- =====================================================

-- Ajouter des colonnes optionnelles pour images mobile et desktop
ALTER TABLE hero_config
ADD COLUMN IF NOT EXISTS image_mobile_url TEXT,
ADD COLUMN IF NOT EXISTS image_desktop_url TEXT;

-- Commentaires pour documentation
COMMENT ON COLUMN hero_config.image_url IS 'Image principale (fallback si mobile/desktop non définies)';
COMMENT ON COLUMN hero_config.image_mobile_url IS 'Image spécifique pour mobile (optionnel)';
COMMENT ON COLUMN hero_config.image_desktop_url IS 'Image spécifique pour desktop (optionnel)';

