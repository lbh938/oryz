# Guide : Comment trouver les Price IDs Stripe

## Où trouver les Price IDs dans Stripe Dashboard

### Étape 1 : Créer les produits dans Stripe

1. **Connectez-vous à Stripe Dashboard** : https://dashboard.stripe.com
2. **Allez dans** : **Products** (dans le menu de gauche)
3. **Cliquez sur** : **"+ Add product"** (en haut à droite)

### Étape 2 : Créer le produit "Kick-Off"

1. **Nom du produit** : `Kick-Off`
2. **Description** : `Abonnement Kick-Off - Accès au kick-off, Pro League, séries et films`
3. **Prix** :
   - **Montant** : `9.99`
   - **Devise** : `EUR` (ou `€`)
   - **Facturation** : `Recurring` (Récurrent)
   - **Intervalle** : `Monthly` (Mensuel)
4. **Cliquez sur** : **"Save product"**

### Étape 3 : Créer le produit "Pro League"

1. **Nom du produit** : `Pro League`
2. **Description** : `Abonnement Pro League - Accès complet : kick-off, Pro League, séries, films et autres championnats`
3. **Prix** :
   - **Montant** : `14.99`
   - **Devise** : `EUR` (ou `€`)
   - **Facturation** : `Recurring` (Récurrent)
   - **Intervalle** : `Monthly` (Mensuel)
4. **Cliquez sur** : **"Save product"**

### Étape 4 : Créer le produit "VIP"

1. **Nom du produit** : `VIP`
2. **Description** : `Abonnement VIP - Accès premium complet avec plusieurs écrans`
3. **Prix** :
   - **Montant** : `19.99`
   - **Devise** : `EUR` (ou `€`)
   - **Facturation** : `Recurring` (Récurrent)
   - **Intervalle** : `Monthly` (Mensuel)
4. **Cliquez sur** : **"Save product"**

## Récupérer les Price IDs

Après avoir créé chaque produit :

1. **Allez dans** : **Products** dans Stripe Dashboard
2. **Cliquez sur** le produit que vous venez de créer (ex: "Pro League")
3. **Dans la section "Pricing"**, vous verrez le **Price ID**
   - Il commence par `price_...` (ex: `price_1ABC123xyz`)
   - Il y a un bouton **"Copy"** à côté du Price ID

## Ajouter les Price IDs dans votre `.env.local`

Une fois que vous avez les 3 Price IDs, ajoutez-les dans votre fichier `.env.local` :

```bash
# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_KICKOFF=price_1ABC123xyz456  # Remplacez par le vrai Price ID
NEXT_PUBLIC_STRIPE_PRICE_PRO_LEAGUE=price_1DEF789abc012  # Remplacez par le vrai Price ID
NEXT_PUBLIC_STRIPE_PRICE_VIP=price_1GHI345def678  # Remplacez par le vrai Price ID
```

## Exemple visuel dans Stripe Dashboard

```
Products → Pro League
├── Name: Pro League
├── Description: ...
└── Pricing
    └── €14.99 / month
        └── Price ID: price_1ABC123xyz456  [Copy] ← Cliquez ici pour copier
```

## Important

- **Test vs Production** : 
  - En mode **Test** : Les Price IDs commencent par `price_` (ex: `price_1234567890`)
  - En mode **Production** : Les Price IDs commencent aussi par `price_` mais sont différents
  - Vous devrez créer les produits dans **Test** ET **Production** séparément

- **Chaque produit = 1 Price ID** : 
  - Kick-Off → `NEXT_PUBLIC_STRIPE_PRICE_KICKOFF`
  - Pro League → `NEXT_PUBLIC_STRIPE_PRICE_PRO_LEAGUE`
  - VIP → `NEXT_PUBLIC_STRIPE_PRICE_VIP`

## Vérification

Pour vérifier que vous avez le bon Price ID :
1. Allez dans Stripe Dashboard → Products
2. Cliquez sur le produit
3. Vérifiez que le montant correspond (9.99€, 14.99€, ou 19.99€)
4. Copiez le Price ID qui correspond au bon montant

