-- =====================================================
-- DEBUG: Voir exactement ce qui est dans hero_config
-- =====================================================

-- 1. Compter les heroes
SELECT 
  'Total heroes' as info,
  COUNT(*) as count
FROM hero_config;

SELECT 
  'Heroes actifs' as info,
  COUNT(*) as count
FROM hero_config
WHERE is_active = true;

-- 2. Voir TOUS les heroes (actifs et inactifs)
SELECT 
  id,
  title,
  image_url,
  display_order,
  is_active,
  created_at
FROM hero_config
ORDER BY display_order ASC, created_at DESC;

-- 3. Tester si les images existent (approximatif)
SELECT 
  id,
  title,
  CASE 
    WHEN image_url IS NULL THEN '❌ NULL'
    WHEN image_url = '' THEN '❌ VIDE'
    WHEN image_url LIKE '%default%' THEN '❌ DEFAULT (n existe pas)'
    WHEN image_url LIKE 'http%' THEN '✅ URL externe'
    WHEN image_url LIKE '/images/%' THEN '⚠️ Local (vérifier si existe)'
    ELSE '❓ Inconnu'
  END as image_status,
  image_url,
  is_active
FROM hero_config
ORDER BY display_order ASC;

-- 4. Solution rapide: Désactiver les heroes avec images invalides
-- DÉCOMMENTEZ pour exécuter:
/*
UPDATE hero_config
SET is_active = false
WHERE image_url IS NULL 
   OR image_url = '' 
   OR image_url LIKE '%default%';
*/

-- 5. Solution rapide: Garder seulement le premier hero avec une vraie image
-- DÉCOMMENTEZ pour exécuter:
/*
UPDATE hero_config
SET is_active = false
WHERE id NOT IN (
  SELECT id 
  FROM hero_config 
  WHERE image_url IS NOT NULL 
    AND image_url != '' 
    AND image_url NOT LIKE '%default%'
  ORDER BY display_order ASC, created_at DESC
  LIMIT 1
);
*/

-- 6. Vérifier le résultat final (ce que le slider va afficher)
SELECT 
  'Ce que le slider affichera:' as info;

SELECT 
  display_order,
  title,
  LEFT(image_url, 60) as image_preview,
  is_active
FROM hero_config
WHERE is_active = true
ORDER BY display_order ASC, created_at DESC;

