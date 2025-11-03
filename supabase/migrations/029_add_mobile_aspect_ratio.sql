-- =====================================================
-- MIGRATION: Ajouter le ratio mobile pour les heroes
-- =====================================================

-- Ajouter la colonne mobile_aspect_ratio (par défaut 16/9 = 1.777...)
ALTER TABLE hero_config
ADD COLUMN IF NOT EXISTS mobile_aspect_ratio NUMERIC(5, 3) DEFAULT 1.778;

-- Commentaire pour documentation
COMMENT ON COLUMN hero_config.mobile_aspect_ratio IS 'Ratio aspect mobile (largeur/hauteur) pour le recadrage mobile. Défaut: 1.778 (16:9)';

