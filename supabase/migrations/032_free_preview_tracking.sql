-- =====================================================
-- TABLE : FREE_PREVIEW_TRACKING
-- Tracking des essais gratuits pour éviter les abus
-- =====================================================

CREATE TABLE IF NOT EXISTS free_preview_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identification
  ip_address INET NOT NULL,
  device_fingerprint TEXT NOT NULL, -- Hash du fingerprint du device
  user_agent TEXT,
  
  -- Métadonnées de sécurité
  is_vpn BOOLEAN DEFAULT FALSE,
  is_proxy BOOLEAN DEFAULT FALSE,
  is_tor BOOLEAN DEFAULT FALSE,
  trust_score DECIMAL(3, 2) DEFAULT 1.0, -- Score de confiance (0.0 à 1.0)
  
  -- Informations réseau
  country_code TEXT,
  city TEXT,
  asn TEXT, -- Autonomous System Number
  
  -- Compteur
  preview_count INTEGER DEFAULT 1, -- Nombre de fois que cet IP/device a utilisé l'essai
  last_preview_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique : 1 entrée par IP + device fingerprint
  UNIQUE(ip_address, device_fingerprint)
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_free_preview_ip ON free_preview_tracking(ip_address);
CREATE INDEX IF NOT EXISTS idx_free_preview_device ON free_preview_tracking(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_free_preview_user ON free_preview_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_free_preview_trust_score ON free_preview_tracking(trust_score);
CREATE INDEX IF NOT EXISTS idx_free_preview_last_preview ON free_preview_tracking(last_preview_at);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_free_preview_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_free_preview_tracking_updated_at
  BEFORE UPDATE ON free_preview_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_free_preview_tracking_updated_at();

-- RLS
ALTER TABLE free_preview_tracking ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent voir leur propre tracking
CREATE POLICY "Users can view their own tracking"
  ON free_preview_tracking
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy : Les admins peuvent tout voir
CREATE POLICY "Admins can view all tracking"
  ON free_preview_tracking
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_super_admin = TRUE
    )
  );

-- Function pour vérifier si un IP/device peut utiliser l'essai gratuit
CREATE OR REPLACE FUNCTION can_use_free_preview(
  p_ip_address INET,
  p_device_fingerprint TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_tracking free_preview_tracking%ROWTYPE;
  v_preview_count INTEGER;
  v_trust_score DECIMAL(3, 2);
  v_is_vpn BOOLEAN;
  v_is_proxy BOOLEAN;
  v_is_tor BOOLEAN;
  v_can_use BOOLEAN := TRUE;
  v_reason TEXT;
  v_max_previews INTEGER := 1; -- Limite : 1 essai par IP/device
BEGIN
  -- Récupérer ou créer le tracking
  SELECT * INTO v_tracking
  FROM free_preview_tracking
  WHERE ip_address = p_ip_address
    AND device_fingerprint = p_device_fingerprint
  LIMIT 1;
  
  -- Si pas de tracking, autoriser (première fois)
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_use', TRUE,
      'reason', 'Premier essai',
      'preview_count', 0,
      'trust_score', 1.0
    );
  END IF;
  
  v_preview_count := v_tracking.preview_count;
  v_trust_score := v_tracking.trust_score;
  v_is_vpn := v_tracking.is_vpn;
  v_is_proxy := v_tracking.is_proxy;
  v_is_tor := v_tracking.is_tor;
  
  -- Vérifier les restrictions
  
  -- 1. Limite de 1 essai par IP/device
  IF v_preview_count >= v_max_previews THEN
    v_can_use := FALSE;
    v_reason := 'Limite d''essais atteinte pour cet appareil/IP';
  END IF;
  
  -- 2. VPN/Proxy blacklistés
  IF v_is_vpn OR v_is_proxy OR v_is_tor THEN
    v_can_use := FALSE;
    v_reason := 'VPN/Proxy/Tor détecté - Accès restreint';
  END IF;
  
  -- 3. Score de confiance trop bas (< 0.5)
  IF v_trust_score < 0.5 THEN
    v_can_use := FALSE;
    v_reason := 'Score de confiance trop bas';
  END IF;
  
  -- 4. Si l'utilisateur a déjà un compte et a déjà utilisé l'essai
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_preview_count
    FROM free_preview_tracking
    WHERE user_id = p_user_id;
    
    IF v_preview_count >= 1 THEN
      v_can_use := FALSE;
      v_reason := 'Vous avez déjà utilisé votre essai gratuit';
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'can_use', v_can_use,
    'reason', COALESCE(v_reason, 'Autorisé'),
    'preview_count', v_preview_count,
    'trust_score', v_trust_score,
    'is_vpn', v_is_vpn,
    'is_proxy', v_is_proxy,
    'is_tor', v_is_tor
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function pour enregistrer un essai gratuit
CREATE OR REPLACE FUNCTION record_free_preview(
  p_ip_address INET,
  p_device_fingerprint TEXT,
  p_user_id UUID DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_is_vpn BOOLEAN DEFAULT FALSE,
  p_is_proxy BOOLEAN DEFAULT FALSE,
  p_is_tor BOOLEAN DEFAULT FALSE,
  p_trust_score DECIMAL(3, 2) DEFAULT 1.0,
  p_country_code TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_asn TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_tracking_id UUID;
BEGIN
  -- Insérer ou mettre à jour le tracking
  INSERT INTO free_preview_tracking (
    user_id,
    ip_address,
    device_fingerprint,
    user_agent,
    is_vpn,
    is_proxy,
    is_tor,
    trust_score,
    country_code,
    city,
    asn,
    preview_count,
    last_preview_at
  )
  VALUES (
    p_user_id,
    p_ip_address,
    p_device_fingerprint,
    p_user_agent,
    p_is_vpn,
    p_is_proxy,
    p_is_tor,
    p_trust_score,
    p_country_code,
    p_city,
    p_asn,
    1,
    NOW()
  )
  ON CONFLICT (ip_address, device_fingerprint) 
  DO UPDATE SET
    user_id = COALESCE(p_user_id, free_preview_tracking.user_id),
    preview_count = free_preview_tracking.preview_count + 1,
    last_preview_at = NOW(),
    is_vpn = p_is_vpn,
    is_proxy = p_is_proxy,
    is_tor = p_is_tor,
    trust_score = p_trust_score,
    updated_at = NOW()
  RETURNING id INTO v_tracking_id;
  
  RETURN v_tracking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

