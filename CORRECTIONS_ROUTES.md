# Corrections appliquées aux routes d'abonnement

## ✅ Corrections effectuées

### 1. **Vérification des abonnements actifs dans create-checkout**
**Fichier** : `app/api/stripe/create-checkout/route.ts`

**Avant** :
```typescript
.in('status', ['trial', 'active']); // ❌ Ne prenait pas en compte les incomplete avec stripe_subscription_id
```

**Après** :
```typescript
.or('status.in.(trial,active),and(status.eq.incomplete,stripe_subscription_id.not.is.null)');
```

**Impact** : Empêche la création de nouveaux abonnements si l'utilisateur a déjà un abonnement avec paiement effectué (même si le webhook n'a pas encore traité).

---

### 2. **Récupération du plus récent abonnement dans create-checkout**
**Fichier** : `app/api/stripe/create-checkout/route.ts`

**Avant** :
```typescript
.maybeSingle(); // ❌ Ne garantissait pas le plus récent
```

**Après** :
```typescript
.order('created_at', { ascending: false })
.limit(1)
.maybeSingle();
```

**Impact** : Garantit que l'on travaille toujours avec l'abonnement le plus récent.

---

### 3. **Mise à jour du plan_type dans checkout.session.completed**
**Fichier** : `app/api/stripe/webhook/route.ts`

**Avant** :
```typescript
const updateData: any = {
  stripe_subscription_id: subscription.id,
  stripe_price_id: subscription.items.data[0]?.price.id,
  status: subscription.status === 'trialing' ? 'trial' : 'active',
  // ❌ plan_type n'était pas mis à jour
};
```

**Après** :
```typescript
const priceId = subscription.items.data[0]?.price.id;
let planType = session.metadata?.plan_id || 'kickoff';
// Déterminer plan_type à partir du price_id
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

**Impact** : Le plan_type est maintenant correctement synchronisé avec Stripe.

---

### 4. **Recherche améliorée de userId dans customer.subscription.updated**
**Fichier** : `app/api/stripe/webhook/route.ts`

**Avant** :
```typescript
if (!userId) {
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single(); // ❌ Peut échouer
  if (!subData) break;
  // ❌ userId n'était pas défini
}
```

**Après** :
```typescript
if (!userId) {
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();
  
  if (subData) {
    userId = subData.user_id;
  } else if (subscription.customer) {
    // Essayer via customer_id
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

if (!userId) {
  console.error('No user_id found in customer.subscription.updated event');
  break;
}
```

**Impact** : Le webhook peut maintenant trouver l'utilisateur même si metadata.user_id n'est pas présent.

---

### 5. **Mise à jour du plan_type dans customer.subscription.updated**
**Fichier** : `app/api/stripe/webhook/route.ts`

**Avant** :
```typescript
const updateData: any = {
  status,
  // ❌ plan_type et trial dates n'étaient pas mis à jour
};
```

**Après** :
```typescript
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

**Impact** : Le plan_type et les dates d'essai sont maintenant correctement synchronisés.

---

### 6. **Récupération du plus récent abonnement dans sync-status**
**Fichier** : `app/api/subscription/sync-status/route.ts`

**Avant** :
```typescript
.maybeSingle(); // ❌ Ne garantissait pas le plus récent
```

**Après** :
```typescript
.order('created_at', { ascending: false })
.limit(1)
.maybeSingle();
```

**Impact** : Garantit que l'on synchronise toujours l'abonnement le plus récent.

---

### 7. **Filtrage des abonnements invalides dans getCurrentSubscription**
**Fichier** : `lib/subscriptions.ts`

**Avant** :
```typescript
.eq('user_id', user.id)
.order('created_at', { ascending: false })
.limit(1)
.maybeSingle();
// ❌ Retournait aussi les incomplete sans stripe_subscription_id
```

**Après** :
```typescript
.eq('user_id', user.id)
.or('status.in.(trial,active),and(status.eq.incomplete,stripe_subscription_id.not.is.null)')
.order('created_at', { ascending: false })
.limit(1)
.maybeSingle();
```

**Impact** : Ne retourne que les abonnements valides (actifs ou incomplete avec paiement effectué).

---

## Résumé des améliorations

✅ **Cohérence** : Toutes les routes utilisent maintenant la même logique pour récupérer les abonnements
✅ **Robustesse** : Le webhook peut maintenant trouver l'utilisateur même sans metadata.user_id
✅ **Complétude** : Le plan_type est maintenant correctement synchronisé dans tous les webhooks
✅ **Précision** : Les abonnements invalides sont filtrés pour éviter les erreurs d'affichage
✅ **Fiabilité** : La vérification des abonnements actifs inclut maintenant les incomplete avec paiement effectué

