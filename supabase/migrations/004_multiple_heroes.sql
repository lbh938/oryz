-- =====================================================
-- MIGRATION: Support de plusieurs heroes en slider
-- =====================================================

-- Ajouter des colonnes pour gérer l'ordre et l'état actif
ALTER TABLE hero_config
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Créer un index pour l'ordre d'affichage
CREATE INDEX IF NOT EXISTS idx_hero_config_order ON hero_config(display_order ASC, created_at DESC);

-- Mettre à jour le hero existant pour être le premier
UPDATE hero_config 
SET display_order = 1, is_active = true 
WHERE display_order = 0 OR display_order IS NULL;

-- Fonction pour obtenir tous les heroes actifs dans l'ordre
CREATE OR REPLACE FUNCTION get_active_heroes()
RETURNS SETOF hero_config
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM hero_config
  WHERE is_active = true
  ORDER BY display_order ASC, created_at DESC;
$$;

-- RLS: Permettre à tout le monde de lire les heroes actifs
DROP POLICY IF EXISTS "Anyone can view active heroes" ON hero_config;
CREATE POLICY "Anyone can view active heroes"
ON hero_config FOR SELECT
USING (is_active = true);

-- RLS: Seuls les admins peuvent modifier
DROP POLICY IF EXISTS "Admins can manage heroes" ON hero_config;
CREATE POLICY "Admins can manage heroes"
ON hero_config FOR ALL
USING (
  auth.uid() IN (SELECT id FROM admin_users WHERE is_super_admin = true)
);

-- Insérer quelques heroes par défaut si la table est vide
INSERT INTO hero_config (title, subtitle, cta_text, cta_url, image_url, display_order, is_active)
SELECT 
  'Regardez en direct, partout',
  'Streaming Live Simplifié - Profitez de vos chaînes préférées en direct avec une qualité exceptionnelle',
  'Regarder maintenant',
  '/channels',
  '/images/hero/default-1.jpg',
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM hero_config LIMIT 1);

INSERT INTO hero_config (title, subtitle, cta_text, cta_url, image_url, display_order, is_active)
SELECT 
  'Sports en Direct 24/7',
  'Tous vos matchs préférés en streaming HD - Football, Basketball, Tennis et plus encore',
  'Voir les matchs',
  '/category/foot',
  '/images/hero/default-2.jpg',
  2,
  true
WHERE (SELECT COUNT(*) FROM hero_config) < 2;

INSERT INTO hero_config (title, subtitle, cta_text, cta_url, image_url, display_order, is_active)
SELECT 
  'Films & Séries Premium',
  'Découvrez notre sélection de films et séries en streaming illimité',
  'Découvrir',
  '/category/films',
  '/images/hero/default-3.jpg',
  3,
  true
WHERE (SELECT COUNT(*) FROM hero_config) < 3;

-- Vérification
SELECT 
  id,
  title,
  display_order,
  is_active,
  created_at
FROM hero_config
ORDER BY display_order ASC;

