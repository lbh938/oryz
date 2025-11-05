-- Migration de diagnostic pour la vue active_subscriptions
-- Cette migration vérifie pourquoi la vue peut être vide

-- Vérifier tous les abonnements dans la table subscriptions
SELECT 
  'All subscriptions' as check_type,
  COUNT(*) as count,
  json_agg(json_build_object(
    'id', id,
    'user_id', user_id,
    'status', status,
    'trial_end', trial_end,
    'current_period_end', current_period_end,
    'stripe_subscription_id', stripe_subscription_id,
    'created_at', created_at
  )) as details
FROM subscriptions;

-- Vérifier les abonnements avec status 'trial' ou 'active'
SELECT 
  'Subscriptions with trial/active status' as check_type,
  COUNT(*) as count,
  json_agg(json_build_object(
    'id', id,
    'user_id', user_id,
    'status', status,
    'trial_end', trial_end,
    'current_period_end', current_period_end,
    'stripe_subscription_id', stripe_subscription_id,
    'trial_end_valid', CASE WHEN status = 'trial' AND trial_end > NOW() THEN true ELSE false END,
    'current_period_end_valid', CASE WHEN status = 'active' AND current_period_end > NOW() THEN true ELSE false END
  )) as details
FROM subscriptions
WHERE status IN ('trial', 'active');

-- Vérifier les abonnements qui devraient être dans la vue active_subscriptions
SELECT 
  'Should be in active_subscriptions view' as check_type,
  COUNT(*) as count,
  json_agg(json_build_object(
    'id', id,
    'user_id', user_id,
    'status', status,
    'trial_end', trial_end,
    'current_period_end', current_period_end,
    'stripe_subscription_id', stripe_subscription_id
  )) as details
FROM subscriptions
WHERE status IN ('trial', 'active')
  AND (
    (status = 'trial' AND trial_end IS NOT NULL AND trial_end > NOW())
    OR (status = 'active' AND current_period_end IS NOT NULL AND current_period_end > NOW())
  );

-- Vérifier la vue active_subscriptions actuelle
SELECT 
  'Current active_subscriptions view' as check_type,
  COUNT(*) as count,
  json_agg(json_build_object(
    'id', id,
    'user_id', user_id,
    'status', status,
    'trial_end', trial_end,
    'current_period_end', current_period_end,
    'stripe_subscription_id', stripe_subscription_id,
    'username', username,
    'email', email
  )) as details
FROM active_subscriptions;

-- Vérifier les problèmes potentiels avec les dates NULL
SELECT 
  'Subscriptions with NULL dates' as check_type,
  COUNT(*) as count,
  json_agg(json_build_object(
    'id', id,
    'user_id', user_id,
    'status', status,
    'trial_end', trial_end,
    'current_period_end', current_period_end,
    'problem', CASE 
      WHEN status = 'trial' AND trial_end IS NULL THEN 'trial_end is NULL'
      WHEN status = 'active' AND current_period_end IS NULL THEN 'current_period_end is NULL'
      ELSE 'OK'
    END
  )) as details
FROM subscriptions
WHERE status IN ('trial', 'active')
  AND (
    (status = 'trial' AND trial_end IS NULL)
    OR (status = 'active' AND current_period_end IS NULL)
  );

-- Vérifier les abonnements avec dates expirées
SELECT 
  'Subscriptions with expired dates' as check_type,
  COUNT(*) as count,
  json_agg(json_build_object(
    'id', id,
    'user_id', user_id,
    'status', status,
    'trial_end', trial_end,
    'current_period_end', current_period_end,
    'problem', CASE 
      WHEN status = 'trial' AND trial_end <= NOW() THEN 'trial_end expired'
      WHEN status = 'active' AND current_period_end <= NOW() THEN 'current_period_end expired'
      ELSE 'OK'
    END
  )) as details
FROM subscriptions
WHERE status IN ('trial', 'active')
  AND (
    (status = 'trial' AND trial_end IS NOT NULL AND trial_end <= NOW())
    OR (status = 'active' AND current_period_end IS NOT NULL AND current_period_end <= NOW())
  );

