-- =====================================================
-- CORRIGER LES IMAGES HERO
-- =====================================================

-- 1. Voir les heroes actuels
SELECT 
  id,
  title,
  image_url,
  display_order,
  is_active
FROM hero_config
ORDER BY display_order ASC;

-- 2. Option A: Supprimer tous les heroes et en créer un seul par défaut
-- Décommentez si vous voulez repartir de zéro
/*
DELETE FROM hero_config;

INSERT INTO hero_config (title, subtitle, cta_text, cta_url, image_url, display_order, is_active)
VALUES (
  'Regardez en direct, partout',
  'Streaming Live Simplifié - Profitez de vos chaînes préférées en direct',
  'Regarder maintenant',
  '/channels',
  'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1920&h=810&fit=crop',
  1,
  true
);
*/

-- 3. Option B: Mettre à jour les heroes existants avec des images Unsplash
-- (Images gratuites et libres de droits)

-- Hero 1: Sport
UPDATE hero_config
SET image_url = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&h=810&fit=crop'
WHERE title LIKE '%direct%' OR title LIKE '%Regardez%'
  AND (image_url LIKE '%default%' OR image_url = '');

-- Hero 2: Sports
UPDATE hero_config
SET image_url = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1920&h=810&fit=crop'
WHERE title LIKE '%Sport%' OR title LIKE '%match%'
  AND (image_url LIKE '%default%' OR image_url = '');

-- Hero 3: Films
UPDATE hero_config
SET image_url = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=810&fit=crop'
WHERE title LIKE '%Film%' OR title LIKE '%Série%'
  AND (image_url LIKE '%default%' OR image_url = '');

-- 4. Option C: Désactiver les heroes sans image valide
UPDATE hero_config
SET is_active = false
WHERE image_url LIKE '%default%' 
   OR image_url = '' 
   OR image_url IS NULL;

-- 5. Vérifier le résultat
SELECT 
  id,
  title,
  LEFT(image_url, 60) as image_preview,
  display_order,
  is_active
FROM hero_config
ORDER BY display_order ASC;

-- 6. S'assurer qu'il y a au moins un hero actif
-- Si aucun hero actif, créer un hero par défaut
INSERT INTO hero_config (title, subtitle, cta_text, cta_url, image_url, display_order, is_active)
SELECT 
  'ORYZ Streaming',
  'Regardez vos chaînes préférées en direct - Sports, Films, Séries',
  'Découvrir',
  '/channels',
  'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1920&h=810&fit=crop',
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM hero_config WHERE is_active = true);

