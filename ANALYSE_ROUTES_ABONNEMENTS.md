# Analyse complète des routes d'abonnement

## Routes identifiées

1. **`/api/stripe/create-checkout`** - Création de session checkout
2. **`/api/stripe/webhook`** - Webhook Stripe (checkout.session.completed, customer.subscription.updated, etc.)
3. **`/api/stripe/sync-subscriptions`** - Synchronisation admin (tous les abonnements incomplete)
4. **`/api/subscription/sync-status`** - Synchronisation client (abonnement de l'utilisateur actuel)

## Problèmes identifiés

### 1. CONFLIT : Vérification des abonnements actifs dans create-checkout

**Fichier** : `app/api/stripe/create-checkout/route.ts` (lignes 89-114)

**Problème** :
```typescript
const { data: existingSubs } = await supabase
  .from('subscriptions')
  .select('id, stripe_subscription_id, status, plan_type')
  .eq('user_id', user.id)
  .in('status', ['trial', 'active']); // ❌ Ne prend pas en compte les 'incomplete' avec stripe_subscription_id
```

**Impact** : Un utilisateur avec un abonnement `incomplete` mais avec `stripe_subscription_id` (paiement effectué mais webhook pas encore traité) peut créer un nouvel abonnement.

**Solution** : Vérifier aussi les abonnements `incomplete` avec `stripe_subscription_id` :
```typescript
const { data: existingSubs } = await supabase
  .from('subscriptions')
  .select('id, stripe_subscription_id, status, plan_type')
  .eq('user_id', user.id)
  .or('status.in.(trial,active),and(status.eq.incomplete,stripe_subscription_id.not.is.null)');
```

---

### 2. INCOHÉRENCE : Récupération de l'abonnement dans create-checkout

**Fichier** : `app/api/stripe/create-checkout/route.ts` (lignes 117-121)

**Problème** :
```typescript
const { data: existingSub } = await supabase
  .from('subscriptions')
  .select('id, stripe_subscription_id')
  .eq('user_id', user.id)
  .maybeSingle(); // ❌ Ne prend pas le plus récent
```

**Impact** : Si plusieurs abonnements existent, on ne prend pas forcément le plus récent.

**Solution** : Utiliser `.order('created_at', { ascending: false }).limit(1)` :
```typescript
const { data: existingSub } = await supabase
  .from('subscriptions')
  .select('id, stripe_subscription_id')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();
```

---

### 3. INCOHÉRENCE : Webhook ne met pas à jour le plan_type

**Fichier** : `app/api/stripe/webhook/route.ts` (lignes 69-86)

**Problème** :
```typescript
const updateData: any = {
  stripe_subscription_id: subscription.id,
  stripe_price_id: subscription.items.data[0]?.price.id,
  status: subscription.status === 'trialing' ? 'trial' : 'active',
  // ❌ plan_type n'est pas mis à jour
};
```

**Impact** : Si le plan_type change dans Stripe, il n'est pas mis à jour dans la base de données.

**Solution** : Déterminer le plan_type à partir du price_id ou le récupérer depuis metadata :
```typescript
// Déterminer plan_type à partir du price_id
const priceId = subscription.items.data[0]?.price.id;
let planType = 'kickoff';
if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_LEAGUE) {
  planType = 'pro_league';
} else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP) {
  planType = 'vip';
}

const updateData: any = {
  stripe_subscription_id: subscription.id,
  stripe_price_id: priceId,
  plan_type: planType,
  status: subscription.status === 'trialing' ? 'trial' : 'active',
};
```

---

### 4. DUPLICATION : Logique de synchronisation dupliquée

**Fichiers** : 
- `app/api/stripe/sync-subscriptions/route.ts` (lignes 72-91)
- `app/api/subscription/sync-status/route.ts` (lignes 48-67)

**Problème** : La logique de synchronisation est dupliquée entre les deux routes, ce qui peut causer des incohérences si l'une est modifiée et pas l'autre.

**Solution** : Créer une fonction utilitaire partagée :
```typescript
// lib/subscriptions-sync.ts
export async function syncSubscriptionWithStripe(
  subscription: Subscription,
  stripe: Stripe
): Promise<{ updateData: any; matchingSubscription: Stripe.Subscription | null }> {
  // Logique de synchronisation partagée
}
```

---

### 5. INCOHÉRENCE : customer.subscription.updated ne met pas à jour plan_type

**Fichier** : `app/api/stripe/webhook/route.ts` (lignes 176-226)

**Problème** :
```typescript
const updateData: any = {
  status,
  // ❌ plan_type, trial_start, trial_end ne sont pas mis à jour
};
```

**Impact** : Si le plan change dans Stripe, la base de données n'est pas mise à jour.

**Solution** : Mettre à jour aussi les autres champs :
```typescript
const subscription = await stripe.subscriptions.retrieve(subscription.id);
const priceId = subscription.items.data[0]?.price.id;
let planType = 'kickoff';
if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_LEAGUE) {
  planType = 'pro_league';
} else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP) {
  planType = 'vip';
}

const updateData: any = {
  status,
  stripe_price_id: priceId,
  plan_type: planType,
};

if (subscription.trial_start) {
  updateData.trial_start = new Date(subscription.trial_start * 1000).toISOString();
}
if (subscription.trial_end) {
  updateData.trial_end = new Date(subscription.trial_end * 1000).toISOString();
}
```

---

### 6. BUG : Récupération de l'abonnement dans sync-status

**Fichier** : `app/api/subscription/sync-status/route.ts` (lignes 19-23)

**Problème** :
```typescript
const { data: subscription, error: subError } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', user.id)
  .maybeSingle(); // ❌ Ne prend pas le plus récent
```

**Impact** : Si plusieurs abonnements existent, on ne synchronise pas forcément le plus récent.

**Solution** : Utiliser `.order('created_at', { ascending: false }).limit(1)` :
```typescript
const { data: subscription, error: subError } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();
```

---

### 7. INCOHÉRENCE : customer.subscription.updated ne trouve pas toujours userId

**Fichier** : `app/api/stripe/webhook/route.ts` (lignes 178-190)

**Problème** :
```typescript
if (!userId) {
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single(); // ❌ Peut échouer si l'abonnement n'existe pas encore

  if (!subData) break;
  // userId sera utilisé ci-dessous mais n'est pas défini
}
```

**Impact** : Si `subData` n'existe pas, `userId` reste `undefined` mais est utilisé plus tard.

**Solution** : Définir `userId` correctement :
```typescript
let userId = subscription.metadata?.user_id;

if (!userId) {
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  if (subData) {
    userId = subData.user_id;
  } else {
    // Essayer via customer_id
    if (subscription.customer) {
      const { data: customerData } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', subscription.customer as string)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (customerData) {
        userId = customerData.user_id;
      }
    }
  }
}

if (!userId) {
  console.error('No user_id found in customer.subscription.updated event');
  break;
}
```

---

### 8. CONFLIT : getCurrentSubscription() peut retourner un abonnement incomplete

**Fichier** : `lib/subscriptions.ts` (lignes 92-110)

**Problème** :
```typescript
export async function getCurrentSubscription(): Promise<Subscription | null> {
  // ...
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();
  // ❌ Retourne l'abonnement le plus récent, même si c'est 'incomplete' sans stripe_subscription_id
}
```

**Impact** : Les composants peuvent recevoir un abonnement `incomplete` sans `stripe_subscription_id`, ce qui peut causer des problèmes d'affichage.

**Solution** : Filtrer les abonnements invalides ou créer une fonction séparée :
```typescript
export async function getCurrentSubscription(): Promise<Subscription | null> {
  // ...
  // Filtrer les abonnements incomplete sans stripe_subscription_id
  .or('status.in.(trial,active),and(status.eq.incomplete,stripe_subscription_id.not.is.null)')
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();
}
```

---

## Résumé des corrections nécessaires

1. ✅ Corriger la vérification des abonnements actifs dans `create-checkout`
2. ✅ Ajouter `.order()` dans `create-checkout` pour récupérer le plus récent
3. ✅ Mettre à jour `plan_type` dans le webhook `checkout.session.completed`
4. ✅ Créer une fonction utilitaire partagée pour la synchronisation
5. ✅ Mettre à jour `plan_type` dans `customer.subscription.updated`
6. ✅ Ajouter `.order()` dans `sync-status` pour récupérer le plus récent
7. ✅ Corriger la recherche de `userId` dans `customer.subscription.updated`
8. ✅ Filtrer les abonnements invalides dans `getCurrentSubscription()`

