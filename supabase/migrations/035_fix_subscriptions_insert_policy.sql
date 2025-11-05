-- Migration pour ajouter la politique INSERT manquante pour les subscriptions
-- Cette politique permet aux utilisateurs authentifiés de créer leur propre abonnement

-- Supprimer la politique si elle existe déjà
DROP POLICY IF EXISTS "Users can insert their own subscription" ON subscriptions;

-- Policy : Les utilisateurs peuvent créer leur propre abonnement
CREATE POLICY "Users can insert their own subscription"
  ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

