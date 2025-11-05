-- Migration pour vérifier un abonnement spécifique et pourquoi il n'est pas dans la vue
-- Cette requête montre exactement pourquoi un abonnement n'est pas détecté

-- Vérifier chaque abonnement individuellement avec toutes les conditions
SELECT 
  s.id,
  s.user_id,
  s.status,
  s.stripe_subscription_id,
  s.trial_start,
  s.trial_end,
  s.current_period_start,
  s.current_period_end,
  s.plan_type,
  s.created_at,
  s.updated_at,
  -- Vérifications individuelles
  CASE WHEN s.status IN ('trial', 'active') THEN '✓' ELSE '✗ Status not trial/active' END as status_check,
  CASE WHEN s.stripe_subscription_id IS NOT NULL THEN '✓' ELSE '✗ stripe_subscription_id is NULL' END as stripe_id_check,
  CASE 
    WHEN s.status = 'trial' AND s.trial_end IS NOT NULL THEN '✓' 
    WHEN s.status = 'trial' AND s.trial_end IS NULL THEN '✗ trial_end is NULL'
    ELSE 'N/A (not trial)'
  END as trial_end_check,
  CASE 
    WHEN s.status = 'trial' AND s.trial_end IS NOT NULL AND s.trial_end > NOW() THEN '✓' 
    WHEN s.status = 'trial' AND s.trial_end IS NOT NULL AND s.trial_end <= NOW() THEN '✗ trial_end expired'
    ELSE 'N/A'
  END as trial_end_validity_check,
  CASE 
    WHEN s.status = 'active' AND s.current_period_end IS NOT NULL THEN '✓' 
    WHEN s.status = 'active' AND s.current_period_end IS NULL THEN '✗ current_period_end is NULL'
    ELSE 'N/A (not active)'
  END as current_period_end_check,
  CASE 
    WHEN s.status = 'active' AND s.current_period_end IS NOT NULL AND s.current_period_end > NOW() THEN '✓' 
    WHEN s.status = 'active' AND s.current_period_end IS NOT NULL AND s.current_period_end <= NOW() THEN '✗ current_period_end expired'
    ELSE 'N/A'
  END as current_period_end_validity_check,
  -- Résultat final
  CASE
    WHEN s.status NOT IN ('trial', 'active') THEN '❌ NOT IN VIEW: Status is not trial or active'
    WHEN s.stripe_subscription_id IS NULL THEN '❌ NOT IN VIEW: stripe_subscription_id is NULL'
    WHEN s.status = 'trial' AND (s.trial_end IS NULL OR s.trial_end <= NOW()) THEN '❌ NOT IN VIEW: trial_end is NULL or expired'
    WHEN s.status = 'active' AND (s.current_period_end IS NULL OR s.current_period_end <= NOW()) THEN '❌ NOT IN VIEW: current_period_end is NULL or expired'
    ELSE '✅ SHOULD BE IN VIEW'
  END as final_status
FROM subscriptions s
ORDER BY s.created_at DESC;

