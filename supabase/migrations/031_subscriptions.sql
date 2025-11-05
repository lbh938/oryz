-- =====================================================
-- TABLE : SUBSCRIPTIONS
-- Gestion des abonnements utilisateurs avec Stripe
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  
  -- Statut de l'abonnement
  status TEXT NOT NULL DEFAULT 'free', -- 'free', 'trial', 'active', 'canceled', 'past_due', 'incomplete'
  
  -- Dates
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  
  -- Plan
  plan_type TEXT NOT NULL DEFAULT 'free', -- 'free', 'kickoff', 'pro_league', 'vip'
  price_monthly DECIMAL(10, 2), -- Prix mensuel (9.99, 14.99 ou 19.99)
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe avant de le créer
DROP TRIGGER IF EXISTS trigger_update_subscriptions_updated_at ON subscriptions;

CREATE TRIGGER trigger_update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes avant de les créer
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can modify all subscriptions" ON subscriptions;

-- Policy : Les utilisateurs peuvent voir leur propre abonnement
CREATE POLICY "Users can view their own subscription"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent créer leur propre abonnement
CREATE POLICY "Users can insert their own subscription"
  ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent mettre à jour leur propre abonnement (via Stripe webhook)
CREATE POLICY "Users can update their own subscription"
  ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy : Les admins peuvent tout voir
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_super_admin = TRUE
    )
  );

-- Policy : Les admins peuvent tout modifier
CREATE POLICY "Admins can modify all subscriptions"
  ON subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_super_admin = TRUE
    )
  );

-- Function pour vérifier si un utilisateur a accès premium
CREATE OR REPLACE FUNCTION has_premium_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record subscriptions%ROWTYPE;
BEGIN
  -- Récupérer l'abonnement de l'utilisateur
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE user_id = user_uuid
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Si pas d'abonnement, retourner FALSE
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Si l'abonnement est actif ou en essai, retourner TRUE
  IF subscription_record.status IN ('trial', 'active') THEN
    -- Vérifier que la date de fin n'est pas passée
    IF subscription_record.status = 'trial' THEN
      IF subscription_record.trial_end IS NOT NULL AND subscription_record.trial_end > NOW() THEN
        RETURN TRUE;
      END IF;
    ELSIF subscription_record.status = 'active' THEN
      IF subscription_record.current_period_end IS NOT NULL AND subscription_record.current_period_end > NOW() THEN
        RETURN TRUE;
      END IF;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- NOTE : Les chaînes premium sont détectées côté code
-- La fonction isPremiumChannel() dans lib/subscriptions.ts
-- détecte automatiquement les chaînes premium (BEIN, DAZN, Canal+, RMC Sport)
-- Il n'est pas nécessaire de créer une table channels dans Supabase
-- car les chaînes sont définies dans lib/channels.ts comme données statiques
-- =====================================================

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Supprimer la vue si elle existe avant de la créer
DROP VIEW IF EXISTS active_subscriptions;

-- Vue pour voir les abonnements actifs
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  s.*,
  up.username,
  au.email
FROM subscriptions s
LEFT JOIN user_profiles up ON s.user_id = up.id
LEFT JOIN auth.users au ON s.user_id = au.id
WHERE s.status IN ('trial', 'active')
  AND (
    (s.status = 'trial' AND s.trial_end > NOW())
    OR (s.status = 'active' AND s.current_period_end > NOW())
  );

