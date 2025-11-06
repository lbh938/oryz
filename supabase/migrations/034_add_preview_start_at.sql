-- Add preview_start_at to track server-side 15-minute preview window

ALTER TABLE IF EXISTS free_preview_tracking
ADD COLUMN IF NOT EXISTS preview_start_at TIMESTAMP WITH TIME ZONE;

-- Update can_use_free_preview to enforce 15-minute window and return remaining_ms
CREATE OR REPLACE FUNCTION can_use_free_preview(
  p_ip_address INET,
  p_device_fingerprint TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_tracking free_preview_tracking%ROWTYPE;
  v_preview_count INTEGER;
  v_user_preview_count INTEGER := 0;
  v_trust_score DECIMAL(3, 2);
  v_is_vpn BOOLEAN;
  v_is_proxy BOOLEAN;
  v_is_tor BOOLEAN;
  v_can_use BOOLEAN := TRUE;
  v_reason TEXT;
  v_remaining_ms BIGINT := NULL;
  v_max_previews INTEGER := 1;
BEGIN
  -- If user has account, check their history first
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_preview_count
    FROM free_preview_tracking
    WHERE user_id = p_user_id;

    IF v_user_preview_count >= 1 THEN
      RETURN jsonb_build_object(
        'can_use', FALSE,
        'reason', 'Vous avez déjà utilisé votre essai gratuit',
        'preview_count', v_user_preview_count,
        'trust_score', 0.0,
        'is_vpn', FALSE,
        'is_proxy', FALSE,
        'is_tor', FALSE,
        'remaining_ms', 0
      );
    END IF;
  END IF;

  -- Find tracking by IP/device
  SELECT * INTO v_tracking
  FROM free_preview_tracking
  WHERE ip_address = p_ip_address
    AND device_fingerprint = p_device_fingerprint
  LIMIT 1;

  -- First time for this IP/device
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_use', TRUE,
      'reason', 'Premier essai',
      'preview_count', 0,
      'trust_score', 1.0,
      'is_vpn', FALSE,
      'is_proxy', FALSE,
      'is_tor', FALSE,
      'remaining_ms', 15 * 60 * 1000
    );
  END IF;

  v_preview_count := v_tracking.preview_count;
  v_trust_score := v_tracking.trust_score;
  v_is_vpn := v_tracking.is_vpn;
  v_is_proxy := v_tracking.is_proxy;
  v_is_tor := v_tracking.is_tor;

  -- Compute remaining_ms if preview_start_at is set
  IF v_tracking.preview_start_at IS NOT NULL THEN
    v_remaining_ms := GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (v_tracking.preview_start_at + INTERVAL '15 minutes' - NOW())) * 1000));
  END IF;

  -- If user has account and hasn't used preview, allow regardless of IP/device history
  IF p_user_id IS NOT NULL AND v_user_preview_count = 0 THEN
    RETURN jsonb_build_object(
      'can_use', TRUE,
      'reason', 'Autorisé - Premier essai pour ce compte',
      'preview_count', 0,
      'trust_score', 1.0,
      'is_vpn', v_is_vpn,
      'is_proxy', v_is_proxy,
      'is_tor', v_is_tor,
      'remaining_ms', COALESCE(v_remaining_ms, 15 * 60 * 1000)
    );
  END IF;

  -- Restrictions for IP/device without account
  IF v_preview_count >= v_max_previews AND p_user_id IS NULL THEN
    v_can_use := FALSE;
    v_reason := 'Limite d''essais atteinte pour cet appareil/IP';
  END IF;

  IF v_is_vpn OR v_is_proxy OR v_is_tor THEN
    v_can_use := FALSE;
    v_reason := 'VPN/Proxy/Tor détecté - Accès restreint';
  END IF;

  -- Enforce 15-minute window if a start exists
  IF v_tracking.preview_start_at IS NOT NULL AND v_remaining_ms IS NOT NULL AND v_remaining_ms = 0 THEN
    v_can_use := FALSE;
    v_reason := 'Temps d''essai écoulé';
  END IF;

  IF v_trust_score < 0.5 AND p_user_id IS NULL THEN
    v_can_use := FALSE;
    v_reason := 'Score de confiance trop bas';
  END IF;

  RETURN jsonb_build_object(
    'can_use', v_can_use,
    'reason', COALESCE(v_reason, 'Autorisé'),
    'preview_count', v_user_preview_count,
    'trust_score', CASE WHEN p_user_id IS NOT NULL THEN 1.0 ELSE v_trust_score END,
    'is_vpn', v_is_vpn,
    'is_proxy', v_is_proxy,
    'is_tor', v_is_tor,
    'remaining_ms', COALESCE(v_remaining_ms, 15 * 60 * 1000)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update record_free_preview to set preview_start_at only if empty or older than 24h
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
    last_preview_at,
    preview_start_at
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
    NOW(),
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
    updated_at = NOW(),
    preview_start_at = CASE
      WHEN free_preview_tracking.preview_start_at IS NULL OR free_preview_tracking.preview_start_at < (NOW() - INTERVAL '24 hours')
        THEN NOW()
      ELSE free_preview_tracking.preview_start_at
    END
  RETURNING id INTO v_tracking_id;

  RETURN v_tracking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


