-- =====================================================
-- TABLE : PAGE_VIEWS
-- Statistiques de pages vues
-- =====================================================

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  page_title TEXT,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  ip_address TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour analytics
CREATE INDEX IF NOT EXISTS idx_page_views_url ON page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);

-- Vue : Top pages 24h
CREATE OR REPLACE VIEW top_pages_24h AS
SELECT 
  page_url,
  page_title,
  COUNT(*) as view_count,
  COUNT(DISTINCT session_id) as unique_visitors
FROM page_views
WHERE viewed_at >= NOW() - INTERVAL '24 hours'
GROUP BY page_url, page_title
ORDER BY view_count DESC
LIMIT 20;

-- Vue : Top pages 7 jours
CREATE OR REPLACE VIEW top_pages_7d AS
SELECT 
  page_url,
  page_title,
  COUNT(*) as view_count,
  COUNT(DISTINCT session_id) as unique_visitors
FROM page_views
WHERE viewed_at >= NOW() - INTERVAL '7 days'
GROUP BY page_url, page_title
ORDER BY view_count DESC
LIMIT 20;

-- RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Politique : tout le monde peut enregistrer des vues
DROP POLICY IF EXISTS page_views_insert_policy ON page_views;
CREATE POLICY page_views_insert_policy ON page_views FOR INSERT WITH CHECK (true);

-- Politique : seuls les admins peuvent lire
DROP POLICY IF EXISTS page_views_select_policy ON page_views;
CREATE POLICY page_views_select_policy ON page_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_super_admin = true)
);

-- Permissions
GRANT INSERT ON page_views TO anon, authenticated;
GRANT SELECT ON page_views TO authenticated;

-- Permissions pour les vues
GRANT SELECT ON top_pages_24h TO authenticated;
GRANT SELECT ON top_pages_7d TO authenticated;

COMMENT ON TABLE page_views IS 'Historique des pages vues pour analytics';
COMMENT ON VIEW top_pages_24h IS 'Top 20 pages les plus vues (24h)';
COMMENT ON VIEW top_pages_7d IS 'Top 20 pages les plus vues (7 jours)';

