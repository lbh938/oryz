-- =====================================================
-- CORRECTION CRITIQUE : Autoriser les utilisateurs ANONYMES
-- =====================================================
-- Les utilisateurs NON CONNECTÉS doivent pouvoir s'inscrire aux notifications

-- Supprimer l'ancienne policy qui bloquait les anonymes
DROP POLICY IF EXISTS push_subs_user_policy ON push_subscriptions;

-- Nouvelle policy : autoriser TOUT LE MONDE à créer/modifier un abonnement
-- Les utilisateurs connectés peuvent gérer leurs propres abonnements
-- Les utilisateurs anonymes (user_id = NULL) peuvent créer des abonnements
CREATE POLICY push_subs_user_policy ON push_subscriptions
  FOR ALL
  USING (
    -- Peut voir/modifier ses propres abonnements (connecté)
    auth.uid() = user_id 
    -- OU peut voir/modifier les abonnements anonymes (non connecté)
    OR user_id IS NULL
  )
  WITH CHECK (
    -- Peut créer/modifier ses propres abonnements (connecté)
    auth.uid() = user_id 
    -- OU peut créer des abonnements anonymes (non connecté)
    OR user_id IS NULL
  );

COMMENT ON POLICY push_subs_user_policy ON push_subscriptions IS 'Utilisateurs connectés ET anonymes peuvent s''inscrire aux notifications';

