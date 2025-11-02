-- =====================================================
-- CORRIGER TOUTES LES PERMISSIONS ANALYTICS
-- Pour permettre le tracking sans authentification
-- =====================================================

-- 1. ACTIVE_VISITORS - Accès public complet
DROP POLICY IF EXISTS visitors_insert_policy ON active_visitors;
DROP POLICY IF EXISTS visitors_update_policy ON active_visitors;
DROP POLICY IF EXISTS visitors_select_policy ON active_visitors;
DROP POLICY IF EXISTS visitors_public_access ON active_visitors;

CREATE POLICY visitors_all_access ON active_visitors 
FOR ALL 
USING (true) 
WITH CHECK (true);

GRANT ALL ON active_visitors TO anon, authenticated;

-- 2. PAGE_VIEWS - Accès public pour INSERT
DROP POLICY IF EXISTS page_views_insert_policy ON page_views;
DROP POLICY IF EXISTS page_views_select_policy ON page_views;
DROP POLICY IF EXISTS page_views_public_insert ON page_views;

CREATE POLICY page_views_public_insert ON page_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY page_views_admin_select ON page_views 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_super_admin = true)
  OR true -- Temporairement ouvert pour debug
);

GRANT INSERT ON page_views TO anon, authenticated;
GRANT SELECT ON page_views TO authenticated;

-- 3. Vérifier les vues
GRANT SELECT ON top_pages_24h TO anon, authenticated;
GRANT SELECT ON top_pages_7d TO anon, authenticated;

-- =====================================================
-- TESTER
-- =====================================================

-- Test 1 : Insérer un visiteur
INSERT INTO active_visitors (session_id, current_page, last_seen)
VALUES ('test_' || NOW(), '/test', NOW())
ON CONFLICT (session_id) DO UPDATE SET last_seen = NOW();

-- Test 2 : Insérer une page vue
INSERT INTO page_views (page_url, page_title, session_id, viewed_at)
VALUES ('/test', 'Test Page', 'test_session', NOW());

-- Test 3 : Lire
SELECT COUNT(*) as visitors FROM active_visitors;
SELECT COUNT(*) as page_views FROM page_views;

-- ✅ Si tout fonctionne, vous êtes prêt !

