-- Table pour stocker les abonnements push des utilisateurs
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  browser TEXT, -- Chrome, Firefox, Safari, etc.
  device_name TEXT, -- Nom de l'appareil si disponible
  device_info TEXT, -- Informations détaillées sur l'appareil/navigateur/OS (utile pour personnalisation)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_notification_at TIMESTAMP WITH TIME ZONE, -- Timestamp de la dernière notification envoyée (utile pour suivi et statistiques)
  
  -- Un utilisateur peut avoir plusieurs appareils, mais un endpoint unique par appareil
  UNIQUE(endpoint)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_active ON push_subscriptions(is_active) WHERE is_active = true;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_subscription_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_updated_at();

-- RLS Policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir/modifier leurs propres subscriptions
CREATE POLICY push_subs_user_policy ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent tout voir
CREATE POLICY push_subs_admin_policy ON push_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  );

COMMENT ON TABLE push_subscriptions IS 'Stocke les abonnements push des utilisateurs pour Web Push Notifications';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'URL unique de l''endpoint push';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Clé publique P256DH de l''abonnement';
COMMENT ON COLUMN push_subscriptions.auth IS 'Clé secrète d''authentification';

