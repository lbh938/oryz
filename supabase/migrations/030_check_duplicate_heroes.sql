-- =====================================================
-- MIGRATION: Vérifier et supprimer les doublons de heroes
-- =====================================================

-- 1. Vérifier les doublons potentiels (même titre, même URL CTA, etc.)
SELECT 
  title,
  cta_url,
  COUNT(*) as count,
  array_agg(id) as hero_ids
FROM hero_config
GROUP BY title, cta_url
HAVING COUNT(*) > 1;

-- 2. Supprimer les doublons en gardant seulement le plus récent
-- ATTENTION: Exécutez d'abord la requête ci-dessus pour voir les doublons
-- puis ajustez cette requête selon vos besoins

-- Supprimer les doublons en gardant le plus récent (le plus récent created_at)
DELETE FROM hero_config
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY title, cta_url 
        ORDER BY created_at DESC
      ) as rn
    FROM hero_config
  ) t
  WHERE t.rn > 1
);

-- 3. Vérifier qu'il n'y a plus de doublons
SELECT 
  title,
  cta_url,
  COUNT(*) as count
FROM hero_config
GROUP BY title, cta_url
HAVING COUNT(*) > 1;
-- Si cette requête ne retourne rien, il n'y a plus de doublons

