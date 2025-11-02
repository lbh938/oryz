-- Table pour stocker les inscriptions aux notifications
-- Permet de savoir qui a activé les notifications et suivre les stats

CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_data JSONB NOT NULL, -- Contient l'endpoint, les clés, etc.
  device_info TEXT, -- Navigateur, OS, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_notification_at TIMESTAMP WITH TIME ZONE
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_notification_subs_user ON notification_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_subs_active ON notification_subscriptions(is_active) WHERE is_active = true;

-- Index unique sur l'endpoint (un utilisateur peut avoir plusieurs appareils)
-- Utiliser une expression pour extraire l'endpoint du JSONB
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_subs_unique_endpoint 
ON notification_subscriptions(user_id, (subscription_data->>'endpoint'));

-- Table pour tracker les préférences de notification (pour les utilisateurs non connectés aussi)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  browser_fingerprint TEXT, -- Pour identifier les utilisateurs non connectés
  status TEXT NOT NULL CHECK (status IN ('accepted', 'declined', 'error')),
  browser_permission TEXT, -- granted, denied, default
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Un user_id OU un fingerprint (pour non connectés)
  CONSTRAINT check_user_or_fingerprint CHECK (user_id IS NOT NULL OR browser_fingerprint IS NOT NULL)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_fingerprint ON notification_preferences(browser_fingerprint);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_status ON notification_preferences(status);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER notification_subs_updated_at
  BEFORE UPDATE ON notification_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER notification_prefs_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_updated_at();

-- RLS Policies
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir/modifier leurs propres subscriptions
CREATE POLICY notification_subs_user_policy ON notification_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent tout voir
CREATE POLICY notification_subs_admin_policy ON notification_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  );

-- Les utilisateurs peuvent voir/modifier leurs propres préférences
CREATE POLICY notification_prefs_user_policy ON notification_preferences
  FOR ALL
  USING (auth.uid() = user_id OR auth.uid() IS NULL)
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Les admins peuvent tout voir
CREATE POLICY notification_prefs_admin_policy ON notification_preferences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  );

-- Vue pour les statistiques admin
CREATE OR REPLACE VIEW notification_stats AS
SELECT
  COUNT(DISTINCT CASE WHEN np.status = 'accepted' THEN np.user_id END) as users_with_notifications,
  COUNT(DISTINCT CASE WHEN np.status = 'accepted' AND np.user_id IS NULL THEN np.browser_fingerprint END) as anonymous_with_notifications,
  COUNT(DISTINCT CASE WHEN np.status = 'declined' THEN COALESCE(np.user_id::text, np.browser_fingerprint) END) as users_declined,
  COUNT(DISTINCT ns.id) as active_devices,
  COUNT(*) as total_preferences
FROM notification_preferences np
LEFT JOIN notification_subscriptions ns ON ns.user_id = np.user_id AND ns.is_active = true;

-- Grant permissions pour la vue
GRANT SELECT ON notification_stats TO authenticated;

COMMENT ON TABLE notification_subscriptions IS 'Stocke les push subscriptions des utilisateurs pour l''envoi de notifications';
COMMENT ON TABLE notification_preferences IS 'Stocke les préférences de notification (accepté/refusé) même pour les utilisateurs non connectés';
COMMENT ON VIEW notification_stats IS 'Statistiques sur les notifications pour le panel admin';

