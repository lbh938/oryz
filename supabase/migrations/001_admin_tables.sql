-- =====================================================
-- TABLES ADMIN POUR ORYZ STREAM
-- =====================================================

-- 1. Table pour la configuration du Hero
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

-- Insérer une config par défaut
INSERT INTO hero_config (title, subtitle, cta_text, cta_url, image_url)
VALUES (
  'beINSPORT 1',
  'Sports en direct - Couverture complète des événements sportifs mondiaux',
  'Regarder',
  '/watch/1',
  '/images/channels/beIN SPORT.png'
);

-- 2. Table pour les visiteurs en temps réel
CREATE TABLE IF NOT EXISTS active_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  current_page TEXT,
  ip_address TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes rapides
CREATE INDEX idx_active_visitors_last_seen ON active_visitors(last_seen);
CREATE INDEX idx_active_visitors_session ON active_visitors(session_id);

-- 3. Table pour les statistiques de pages vues
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

-- Index pour les requêtes analytics
CREATE INDEX idx_page_views_url ON page_views(page_url);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);

-- 4. Table pour les admins
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Vue pour les pages les plus vues (dernières 24h)
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

-- 6. Vue pour les pages les plus vues (7 derniers jours)
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

-- 7. Fonction pour nettoyer les visiteurs inactifs (> 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_inactive_visitors()
RETURNS void AS $$
BEGIN
  DELETE FROM active_visitors
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- 8. Fonction pour compter les visiteurs actifs
CREATE OR REPLACE FUNCTION count_active_visitors()
RETURNS INTEGER AS $$
BEGIN
  -- Nettoyer d'abord les visiteurs inactifs
  PERFORM cleanup_inactive_visitors();
  
  -- Retourner le compte
  RETURN (SELECT COUNT(*) FROM active_visitors);
END;
$$ LANGUAGE plpgsql;

-- 9. Fonction pour mettre à jour le hero
CREATE OR REPLACE FUNCTION update_hero_config(
  p_title TEXT,
  p_subtitle TEXT,
  p_cta_text TEXT,
  p_cta_url TEXT,
  p_image_url TEXT
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Désactiver les anciens heroes
  UPDATE hero_config SET is_active = false;
  
  -- Insérer le nouveau
  INSERT INTO hero_config (title, subtitle, cta_text, cta_url, image_url, is_active)
  VALUES (p_title, p_subtitle, p_cta_text, p_cta_url, p_image_url, true)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Politique de sécurité RLS (Row Level Security)
ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (accès complet)
CREATE POLICY admin_all_hero ON hero_config FOR ALL USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
);

CREATE POLICY admin_all_visitors ON active_visitors FOR ALL USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
);

CREATE POLICY admin_all_pageviews ON page_views FOR ALL USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
);

-- Politique pour lecture publique du hero actif
CREATE POLICY public_read_hero ON hero_config FOR SELECT USING (is_active = true);

-- Politique pour insert public des visiteurs et page views
CREATE POLICY public_insert_visitors ON active_visitors FOR INSERT WITH CHECK (true);
CREATE POLICY public_update_visitors ON active_visitors FOR UPDATE USING (true);
CREATE POLICY public_insert_pageviews ON page_views FOR INSERT WITH CHECK (true);

-- 11. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hero_config_updated_at
  BEFORE UPDATE ON hero_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSTRUCTIONS D'UTILISATION
-- =====================================================

-- Pour ajouter un admin :
-- INSERT INTO admin_users (email) VALUES ('votre-email@example.com');

-- Pour voir les visiteurs actifs :
-- SELECT count_active_visitors();

-- Pour voir les pages les plus vues (24h) :
-- SELECT * FROM top_pages_24h;

-- Pour voir les pages les plus vues (7 jours) :
-- SELECT * FROM top_pages_7d;

-- Pour mettre à jour le hero :
-- SELECT update_hero_config('Nouveau titre', 'Nouveau sous-titre', 'Bouton', '/lien', '/image.jpg');

