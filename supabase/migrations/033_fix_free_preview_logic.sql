-- =====================================================
-- Fix: Améliorer la logique de vérification des essais gratuits
-- Permettre aux nouveaux utilisateurs d'utiliser leur essai gratuit
-- =====================================================

-- Mettre à jour la fonction can_use_free_preview pour mieux gérer les nouveaux comptes
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
  v_max_previews INTEGER := 1; -- Limite : 1 essai par IP/device OU par utilisateur
BEGIN
  -- Si l'utilisateur a un compte, vérifier d'abord son historique
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_preview_count
    FROM free_preview_tracking
    WHERE user_id = p_user_id;
    
    -- Si l'utilisateur a déjà utilisé son essai, bloquer
    IF v_user_preview_count >= 1 THEN
      RETURN jsonb_build_object(
        'can_use', FALSE,
        'reason', 'Vous avez déjà utilisé votre essai gratuit',
        'preview_count', v_user_preview_count,
        'trust_score', 0.0,
        'is_vpn', FALSE,
        'is_proxy', FALSE,
        'is_tor', FALSE
      );
    END IF;
  END IF;
  
  -- Récupérer ou créer le tracking par IP/device
  SELECT * INTO v_tracking
  FROM free_preview_tracking
  WHERE ip_address = p_ip_address
    AND device_fingerprint = p_device_fingerprint
  LIMIT 1;
  
  -- Si pas de tracking, autoriser (première fois pour cet IP/device)
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_use', TRUE,
      'reason', 'Premier essai',
      'preview_count', 0,
      'trust_score', 1.0,
      'is_vpn', FALSE,
      'is_proxy', FALSE,
      'is_tor', FALSE
    );
  END IF;
  
  v_preview_count := v_tracking.preview_count;
  v_trust_score := v_tracking.trust_score;
  v_is_vpn := v_tracking.is_vpn;
  v_is_proxy := v_tracking.is_proxy;
  v_is_tor := v_tracking.is_tor;
  
  -- Si l'utilisateur a un compte et n'a pas encore utilisé son essai, autoriser même si l'IP/device a déjà utilisé l'essai
  IF p_user_id IS NOT NULL AND v_user_preview_count = 0 THEN
    -- Nouveau compte utilisateur, autoriser même si l'IP/device a déjà utilisé l'essai
    RETURN jsonb_build_object(
      'can_use', TRUE,
      'reason', 'Autorisé - Premier essai pour ce compte',
      'preview_count', 0,
      'trust_score', 1.0,
      'is_vpn', v_is_vpn,
      'is_proxy', v_is_proxy,
      'is_tor', v_is_tor
    );
  END IF;
  
  -- Vérifier les restrictions pour l'IP/device (si pas de compte utilisateur)
  
  -- 1. Limite de 1 essai par IP/device (seulement si pas de compte utilisateur)
  IF v_preview_count >= v_max_previews AND p_user_id IS NULL THEN
    v_can_use := FALSE;
    v_reason := 'Limite d''essais atteinte pour cet appareil/IP';
  END IF;
  
  -- 2. VPN/Proxy blacklistés
  IF v_is_vpn OR v_is_proxy OR v_is_tor THEN
    v_can_use := FALSE;
    v_reason := 'VPN/Proxy/Tor détecté - Accès restreint';
  END IF;
  
  -- 3. Score de confiance trop bas (< 0.5) - seulement si pas de compte utilisateur
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
    'is_tor', v_is_tor
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

