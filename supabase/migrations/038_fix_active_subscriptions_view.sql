-- Migration pour corriger la vue active_subscriptions
-- Ajouter la vérification de stripe_subscription_id et des dates NULL

-- Supprimer la vue existante
DROP VIEW IF EXISTS active_subscriptions;

-- Recréer la vue avec les corrections
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  s.*,
  up.username,
  au.email
FROM subscriptions s
LEFT JOIN user_profiles up ON s.user_id = up.id
LEFT JOIN auth.users au ON s.user_id = au.id
WHERE s.status IN ('trial', 'active')
  AND s.stripe_subscription_id IS NOT NULL
  AND (
    (s.status = 'trial' AND s.trial_end IS NOT NULL AND s.trial_end > NOW())
    OR (s.status = 'active' AND s.current_period_end IS NOT NULL AND s.current_period_end > NOW())
  );

