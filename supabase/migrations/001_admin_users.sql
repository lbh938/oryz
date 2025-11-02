-- =====================================================
-- TABLE : ADMIN_USERS
-- Gestion des administrateurs
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'admin',
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Politique : lecture publique (pour vérifier si admin)
DROP POLICY IF EXISTS admin_read_policy ON admin_users;
CREATE POLICY admin_read_policy ON admin_users FOR SELECT USING (true);

-- Politique : seuls les super admins peuvent modifier
DROP POLICY IF EXISTS admin_write_policy ON admin_users;
CREATE POLICY admin_write_policy ON admin_users FOR ALL USING (
  id IN (SELECT id FROM admin_users WHERE is_super_admin = true)
);

-- Permissions
GRANT SELECT, INSERT, UPDATE ON admin_users TO anon, authenticated;

COMMENT ON TABLE admin_users IS 'Administrateurs du système ORYZ';

