-- Migration pour ajouter la contrainte UNIQUE sur user_id dans subscriptions
-- Cette contrainte est nécessaire pour l'utilisation de ON CONFLICT dans les upserts

-- Ajouter la contrainte UNIQUE si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_user_id_key'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

