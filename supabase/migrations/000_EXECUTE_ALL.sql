-- =====================================================
-- INSTALLER TOUTES LES TABLES ORYZ ADMIN
-- Exécutez ce fichier dans Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. ADMIN_USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'admin',
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_read_policy ON admin_users;
CREATE POLICY admin_read_policy ON admin_users FOR SELECT USING (true);

DROP POLICY IF EXISTS admin_write_policy ON admin_users;
CREATE POLICY admin_write_policy ON admin_users FOR ALL USING (
  id IN (SELECT id FROM admin_users WHERE is_super_admin = true)
);

GRANT SELECT, INSERT, UPDATE ON admin_users TO anon, authenticated;

-- =====================================================
-- 2. HERO_CONFIG
-- =====================================================

CREATE TABLE IF NOT EXISTS hero_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  cta_text TEXT NOT NULL DEFAULT 'Regarder',
  cta_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO hero_config (title, subtitle, cta_text, cta_url, image_url)
VALUES (
  'beINSPORT 1',
  'Sports en direct - Couverture complète des événements sportifs mondiaux',
  'Regarder',
  '/watch/1',
  '/images/channels/beIN SPORT.png'
)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION update_hero_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hero_config_updated_at ON hero_config;
CREATE TRIGGER hero_config_updated_at
  BEFORE UPDATE ON hero_config
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_updated_at();

ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hero_read_active ON hero_config;
CREATE POLICY hero_read_active ON hero_config FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS hero_admin_write ON hero_config;
CREATE POLICY hero_admin_write ON hero_config FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_super_admin = true)
);

GRANT SELECT ON hero_config TO anon, authenticated;
GRANT ALL ON hero_config TO authenticated;

-- =====================================================
-- 3. ACTIVE_VISITORS
-- =====================================================

CREATE TABLE IF NOT EXISTS active_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  current_page TEXT,
  ip_address TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_active_visitors_last_seen ON active_visitors(last_seen);
CREATE INDEX IF NOT EXISTS idx_active_visitors_session ON active_visitors(session_id);

CREATE OR REPLACE FUNCTION cleanup_inactive_visitors()
RETURNS void AS $$
BEGIN
  DELETE FROM active_visitors WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_active_visitors()
RETURNS INTEGER AS $$
BEGIN
  PERFORM cleanup_inactive_visitors();
  RETURN (SELECT COUNT(*) FROM active_visitors);
END;
$$ LANGUAGE plpgsql;

ALTER TABLE active_visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS visitors_insert_policy ON active_visitors;
CREATE POLICY visitors_insert_policy ON active_visitors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS visitors_update_policy ON active_visitors;
CREATE POLICY visitors_update_policy ON active_visitors FOR UPDATE USING (true);

DROP POLICY IF EXISTS visitors_select_policy ON active_visitors;
CREATE POLICY visitors_select_policy ON active_visitors FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_super_admin = true)
);

GRANT INSERT, UPDATE ON active_visitors TO anon, authenticated;
GRANT SELECT ON active_visitors TO authenticated;

-- =====================================================
-- 4. PAGE_VIEWS
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

CREATE INDEX IF NOT EXISTS idx_page_views_url ON page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);

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

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS page_views_insert_policy ON page_views;
CREATE POLICY page_views_insert_policy ON page_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS page_views_select_policy ON page_views;
CREATE POLICY page_views_select_policy ON page_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_super_admin = true)
);

GRANT INSERT ON page_views TO anon, authenticated;
GRANT SELECT ON page_views TO authenticated;
GRANT SELECT ON top_pages_24h TO authenticated;
GRANT SELECT ON top_pages_7d TO authenticated;

-- =====================================================
-- SUCCÈS !
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Installation complète terminée !';
  RAISE NOTICE '';
  RAISE NOTICE '📝 PROCHAINES ÉTAPES :';
  RAISE NOTICE '1. Créer un utilisateur dans Authentication > Users';
  RAISE NOTICE '   Email: admin@oryz.stream';
  RAISE NOTICE '   Password: azerty';
  RAISE NOTICE '   ✅ Cochez "Auto Confirm User"';
  RAISE NOTICE '';
  RAISE NOTICE '2. Exécuter ce SQL :';
  RAISE NOTICE '   INSERT INTO admin_users (id, email, username, role, is_super_admin)';
  RAISE NOTICE '   VALUES (';
  RAISE NOTICE '     (SELECT id FROM auth.users WHERE email = ''admin@oryz.stream''),';
  RAISE NOTICE '     ''admin@oryz.stream'', ''admin'', ''super_admin'', true';
  RAISE NOTICE '   );';
  RAISE NOTICE '';
  RAISE NOTICE '3. Se connecter sur /auth/login';
  RAISE NOTICE '4. Aller sur /admin';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Profitez de votre panel admin !';
END $$;

