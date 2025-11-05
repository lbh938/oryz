-- Migration pour synchroniser les abonnements "incomplete" avec Stripe
-- Cette fonction doit être appelée depuis un script Node.js ou une API route
-- car elle nécessite l'API Stripe pour récupérer les données

-- Fonction pour marquer les abonnements incomplets à synchroniser
CREATE OR REPLACE FUNCTION get_incomplete_subscriptions_to_sync()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  stripe_customer_id TEXT,
  plan_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.stripe_customer_id,
    s.plan_type,
    s.created_at
  FROM subscriptions s
  WHERE s.status = 'incomplete'
    AND s.stripe_subscription_id IS NULL
    AND s.stripe_customer_id IS NOT NULL
    AND s.created_at > NOW() - INTERVAL '30 days' -- Seulement les abonnements récents
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql;

