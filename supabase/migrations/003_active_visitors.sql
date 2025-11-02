-- =====================================================
-- TABLE : ACTIVE_VISITORS
-- Suivi des visiteurs en temps réel
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

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_active_visitors_last_seen ON active_visitors(last_seen);
CREATE INDEX IF NOT EXISTS idx_active_visitors_session ON active_visitors(session_id);

-- Fonction pour nettoyer les visiteurs inactifs (> 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_inactive_visitors()
RETURNS void AS $$
BEGIN
  DELETE FROM active_visitors
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour compter les visiteurs actifs
CREATE OR REPLACE FUNCTION count_active_visitors()
RETURNS INTEGER AS $$
BEGIN
  -- Nettoyer d'abord
  PERFORM cleanup_inactive_visitors();
  
  -- Retourner le compte
  RETURN (SELECT COUNT(*) FROM active_visitors);
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE active_visitors ENABLE ROW LEVEL SECURITY;

-- Politique : tout le monde peut s'enregistrer
DROP POLICY IF EXISTS visitors_insert_policy ON active_visitors;
CREATE POLICY visitors_insert_policy ON active_visitors FOR INSERT WITH CHECK (true);

-- Politique : tout le monde peut mettre à jour
DROP POLICY IF EXISTS visitors_update_policy ON active_visitors;
CREATE POLICY visitors_update_policy ON active_visitors FOR UPDATE USING (true);

-- Politique : seuls les admins peuvent lire
DROP POLICY IF EXISTS visitors_select_policy ON active_visitors;
CREATE POLICY visitors_select_policy ON active_visitors FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_super_admin = true)
);

-- Permissions
GRANT INSERT, UPDATE ON active_visitors TO anon, authenticated;
GRANT SELECT ON active_visitors TO authenticated;

COMMENT ON TABLE active_visitors IS 'Visiteurs actifs en temps réel (5 minutes)';

