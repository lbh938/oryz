-- Migration pour empêcher plusieurs abonnements actifs pour un même utilisateur
-- Cette migration vérifie et nettoie les abonnements multiples

-- Supprimer la fonction existante si elle existe (pour permettre le changement de type de retour)
DROP FUNCTION IF EXISTS check_and_cleanup_multiple_subscriptions();

-- Fonction pour vérifier et nettoyer les abonnements multiples
CREATE OR REPLACE FUNCTION check_and_cleanup_multiple_subscriptions()
RETURNS TABLE(user_id UUID, kept_subscription_id UUID, canceled_count BIGINT) AS $$
DECLARE
  user_record RECORD;
  latest_sub RECORD;
  canceled_count_var BIGINT;
BEGIN
  -- Pour chaque utilisateur ayant plusieurs abonnements actifs
  FOR user_record IN 
    SELECT s.user_id, COUNT(*) as count
    FROM subscriptions s
    WHERE s.status IN ('trial', 'active')
      AND s.stripe_subscription_id IS NOT NULL
    GROUP BY s.user_id
    HAVING COUNT(*) > 1
  LOOP
    -- Récupérer le plus récent abonnement actif
    SELECT * INTO latest_sub
    FROM subscriptions
    WHERE user_id = user_record.user_id
      AND status IN ('trial', 'active')
      AND stripe_subscription_id IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Compter combien d'abonnements seront annulés
    SELECT COUNT(*) INTO canceled_count_var
    FROM subscriptions
    WHERE user_id = user_record.user_id
      AND status IN ('trial', 'active')
      AND stripe_subscription_id IS NOT NULL
      AND id != latest_sub.id;
    
    -- Annuler tous les autres abonnements actifs (les mettre en canceled)
    UPDATE subscriptions
    SET status = 'canceled',
        canceled_at = NOW(),
        cancel_at_period_end = true
    WHERE user_id = user_record.user_id
      AND status IN ('trial', 'active')
      AND stripe_subscription_id IS NOT NULL
      AND id != latest_sub.id;
    
    -- Retourner les informations de nettoyage
    RETURN QUERY SELECT user_record.user_id, latest_sub.id, canceled_count_var;
    
    RAISE NOTICE 'Multiple subscriptions cleaned for user %: kept %, canceled % others', 
      user_record.user_id, latest_sub.id, canceled_count_var;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Exécuter la fonction pour nettoyer les abonnements existants et afficher les résultats
SELECT * FROM check_and_cleanup_multiple_subscriptions();

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

