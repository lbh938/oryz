# Variables d'environnement Stripe

## Configuration requise

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (à configurer dans Stripe Dashboard)
# Créer 3 produits dans Stripe :
# 1. Kick-Off (9.99€/mois)
# 2. Pro League (14.99€/mois)
# 3. VIP (19.99€/mois)
NEXT_PUBLIC_STRIPE_PRICE_KICKOFF=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO_LEAGUE=price_...
NEXT_PUBLIC_STRIPE_PRICE_VIP=price_...
```

## Instructions de configuration dans Stripe

1. **Créer les produits** :
   - Allez dans Stripe Dashboard > Products
   - Créez 3 produits :
     - **Kick-Off** : 9.99€/mois (récurrent mensuel)
     - **Pro League** : 14.99€/mois (récurrent mensuel)
     - **VIP** : 19.99€/mois (récurrent mensuel)

2. **Récupérer les Price IDs** :
   - Pour chaque produit, copiez le Price ID (commence par `price_...`)
   - Ajoutez-les dans les variables d'environnement correspondantes

3. **Configurer le webhook** :
   - Allez dans Stripe Dashboard > Developers > Webhooks
   - Ajoutez l'endpoint : `https://votre-domaine.com/api/stripe/webhook`
   - Sélectionnez les événements :
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
   - Copiez le secret du webhook dans `STRIPE_WEBHOOK_SECRET`
   - Voir `docs/STRIPE_WEBHOOK_EVENTS.md` pour plus de détails

