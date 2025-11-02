-- =====================================================
-- CORRIGER LES PERMISSIONS POUR ACTIVE_VISITORS
-- =====================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS visitors_insert_policy ON active_visitors;
DROP POLICY IF EXISTS visitors_update_policy ON active_visitors;
DROP POLICY IF EXISTS visitors_select_policy ON active_visitors;

-- Nouvelle politique : TOUT LE MONDE peut insérer/mettre à jour (anonyme inclus)
CREATE POLICY visitors_public_access ON active_visitors 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Permissions complètes
GRANT ALL ON active_visitors TO anon, authenticated;

-- Tester
SELECT COUNT(*) FROM active_visitors;

-- ✅ Si ça fonctionne sans erreur, c'est bon !

