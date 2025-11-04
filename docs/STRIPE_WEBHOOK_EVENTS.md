# Configuration du Webhook Stripe

## URL du Webhook

```
https://votre-domaine.com/api/stripe/webhook
```

## Événements à sélectionner dans Stripe Dashboard

Le webhook doit recevoir **exactement** ces 4 événements :

### 1. `checkout.session.completed`
- **Quand** : Quand l'utilisateur complète la session de checkout Stripe
- **Action** : Met à jour l'abonnement dans la base de données avec les informations Stripe (subscription_id, price_id, dates d'essai)

### 2. `customer.subscription.updated`
- **Quand** : Quand l'abonnement est mis à jour (changement de statut, période, annulation, etc.)
- **Action** : Synchronise le statut de l'abonnement (trial, active, canceled, past_due, incomplete) et les dates de période

### 3. `customer.subscription.deleted`
- **Quand** : Quand l'abonnement est supprimé/annulé définitivement
- **Action** : Marque l'abonnement comme "canceled" dans la base de données

### 4. `invoice.payment_succeeded`
- **Quand** : Quand le paiement d'une facture réussit (après la période d'essai)
- **Action** : Met à jour le statut de l'abonnement à "active" et synchronise les dates de période

## Instructions de configuration dans Stripe Dashboard

1. **Allez dans Stripe Dashboard** → **Developers** → **Webhooks**

2. **Cliquez sur "Add endpoint"** (ou modifiez un endpoint existant)

3. **Entrez l'URL** :
   ```
   https://votre-domaine.com/api/stripe/webhook
   ```

4. **Sélectionnez les événements** :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`

5. **Cliquez sur "Add endpoint"**

6. **Copiez le "Signing secret"** (commence par `whsec_...`) et ajoutez-le dans votre `.env.local` :
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Vérification

Une fois configuré, vous pouvez tester le webhook en :
1. Effectuant un abonnement test
2. Vérifiant les logs dans Stripe Dashboard → Webhooks → Votre endpoint → "Events sent"
3. Vérifiant que les événements sont bien reçus (statut 200)

## Notes importantes

- **Environnement de test** : Utilisez le webhook de test pour les tests (`whsec_test_...`)
- **Environnement de production** : Utilisez le webhook de production pour la production (`whsec_live_...`)
- **Sécurité** : Ne partagez jamais votre `STRIPE_WEBHOOK_SECRET`
- **HTTPS requis** : L'URL du webhook doit être en HTTPS (obligatoire pour Stripe)

