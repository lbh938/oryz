-- Migration pour empêcher plusieurs abonnements actifs pour un même utilisateur
-- Cette migration vérifie et nettoie les abonnements multiples

-- Fonction pour vérifier et nettoyer les abonnements multiples
CREATE OR REPLACE FUNCTION check_and_cleanup_multiple_subscriptions()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  active_count INTEGER;
  latest_sub RECORD;
BEGIN
  -- Pour chaque utilisateur ayant plusieurs abonnements
  FOR user_record IN 
    SELECT user_id, COUNT(*) as count
    FROM subscriptions
    WHERE status IN ('trial', 'active')
    GROUP BY user_id
    HAVING COUNT(*) > 1
  LOOP
    -- Compter les abonnements actifs
    SELECT COUNT(*) INTO active_count
    FROM subscriptions
    WHERE user_id = user_record.user_id
      AND status IN ('trial', 'active')
      AND stripe_subscription_id IS NOT NULL;
    
    -- Si plusieurs abonnements actifs, garder seulement le plus récent
    IF active_count > 1 THEN
      -- Récupérer le plus récent abonnement
      SELECT * INTO latest_sub
      FROM subscriptions
      WHERE user_id = user_record.user_id
        AND status IN ('trial', 'active')
        AND stripe_subscription_id IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1;
      
      -- Annuler tous les autres abonnements actifs (les mettre en canceled)
      UPDATE subscriptions
      SET status = 'canceled',
          canceled_at = NOW(),
          cancel_at_period_end = true
      WHERE user_id = user_record.user_id
        AND status IN ('trial', 'active')
        AND stripe_subscription_id IS NOT NULL
        AND id != latest_sub.id;
        
      RAISE NOTICE 'Multiple subscriptions cleaned for user %: kept %, canceled % others', 
        user_record.user_id, latest_sub.id, active_count - 1;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Exécuter la fonction pour nettoyer les abonnements existants
SELECT check_and_cleanup_multiple_subscriptions();

-- Créer une fonction trigger pour empêcher la création de nouveaux abonnements multiples
CREATE OR REPLACE FUNCTION prevent_multiple_active_subscriptions()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  -- Si le nouvel abonnement est actif (trial ou active)
  IF NEW.status IN ('trial', 'active') AND NEW.stripe_subscription_id IS NOT NULL THEN
    -- Compter les abonnements actifs existants pour cet utilisateur
    SELECT COUNT(*) INTO active_count
    FROM subscriptions
    WHERE user_id = NEW.user_id
      AND status IN ('trial', 'active')
      AND stripe_subscription_id IS NOT NULL
      AND id != NEW.id;
    
    -- Si un abonnement actif existe déjà, annuler le plus ancien
    IF active_count > 0 THEN
      UPDATE subscriptions
      SET status = 'canceled',
          canceled_at = NOW(),
          cancel_at_period_end = true
      WHERE user_id = NEW.user_id
        AND status IN ('trial', 'active')
        AND stripe_subscription_id IS NOT NULL
        AND id != NEW.id
        AND created_at < NEW.created_at;
        
      RAISE NOTICE 'Multiple active subscriptions prevented for user %: kept new subscription %, canceled older ones', 
        NEW.user_id, NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS trigger_prevent_multiple_active_subscriptions ON subscriptions;

-- Créer le trigger
CREATE TRIGGER trigger_prevent_multiple_active_subscriptions
  BEFORE INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_active_subscriptions();

