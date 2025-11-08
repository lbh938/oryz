import { createClient } from '@/lib/supabase/client';

export type SubscriptionStatus = 'free' | 'trial' | 'active' | 'canceled' | 'past_due' | 'incomplete';
export type PlanType = 'free' | 'kickoff';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  status: SubscriptionStatus;
  trial_start?: string;
  trial_end?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  plan_type: PlanType;
  price_monthly?: number;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string; // Stripe Price ID
  features: string[];
  isPopular?: boolean;
  trialDays?: number;
}

// Plans disponibles
export const PLANS: Plan[] = [
  {
    id: 'kickoff',
    name: 'Kick-Off',
    description: 'Accès complet : Toutes les chaînes, films, séries et matchs en direct',
    price: 4.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_KICKOFF || '', // À configurer dans Stripe
    features: [
      'Toutes les chaînes TV en direct (beIN SPORT, DAZN, Canal+, RMC Sport)',
      'Tous les films et séries',
      'Tous les matchs sportifs en direct',
      'Grandes compétitions (Champion\'s League, Ligue 1, Coupe du Monde, etc.)',
      'Qualité HD/4K',
      'Streaming illimité',
      'Multi-écrans (2 appareils)',
      'Support 24/7',
      'Sans engagement'
    ],
    isPopular: true,
    trialDays: 7
  }
];

/**
 * Récupérer l'abonnement de l'utilisateur actuel
 */
export async function getCurrentSubscription(): Promise<Subscription | null> {
  const supabase = createClient();
  
  // OPTIMISATION: Utiliser getSession() en premier pour un état initial rapide
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    // Pas de session, vérifier avec getUser() pour être sûr
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .or('status.in.(trial,active),and(status.eq.incomplete,stripe_subscription_id.not.is.null)')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    
    return data as Subscription;
  }
  
  // Si une session existe, charger l'abonnement immédiatement
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .or('status.in.(trial,active),and(status.eq.incomplete,stripe_subscription_id.not.is.null)')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  
  // SÉCURITÉ: Vérifier ensuite avec getUser() pour authentifier auprès du serveur
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user || user.id !== session.user.id) {
    // Si getUser() échoue ou l'ID ne correspond pas, retourner null pour sécurité
    return null;
  }
  
  return data as Subscription;
}

/**
 * Vérifier si l'utilisateur est admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = createClient();
  
  // SÉCURITÉ: Utiliser getUser() pour authentifier l'utilisateur auprès du serveur
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return false;

  // Vérifier dans admin_users
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('is_super_admin')
    .eq('id', user.id)
    .maybeSingle();

  return adminData?.is_super_admin === true;
}

/**
 * Vérifier si l'utilisateur a accès premium
 * Les admins ont automatiquement accès premium
 * Version optimisée avec une seule requête
 */
export async function hasPremiumAccess(): Promise<boolean> {
  const supabase = createClient();
  
  // OPTIMISATION: Utiliser getSession() en premier pour un état initial rapide
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  let userId: string | null = null;
  
  if (sessionError || !session?.user) {
    // Pas de session, vérifier avec getUser() pour être sûr
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return false;
    userId = user.id;
  } else {
    userId = session.user.id;
  }
  
  // Si une session existe, charger les données immédiatement
  // Vérifier si l'utilisateur est admin en parallèle avec la subscription
  const [adminData, subscriptionData] = await Promise.all([
    supabase
      .from('admin_users')
      .select('is_super_admin')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('subscriptions')
      .select('status, trial_end, current_period_end, stripe_subscription_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  // SÉCURITÉ: Vérifier ensuite avec getUser() pour authentifier auprès du serveur
  // (seulement si on a utilisé getSession() en premier)
  if (session?.user) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user || user.id !== session.user.id) {
      // Si getUser() échoue ou l'ID ne correspond pas, retourner false pour sécurité
      return false;
    }
  }

  // Si admin, retourner true immédiatement
  if (adminData.data?.is_super_admin === true) return true;

  const subscription = subscriptionData.data;
  if (!subscription) return false;
  
  // IMPORTANT: Si le statut est 'incomplete' mais qu'il y a un stripe_subscription_id,
  // cela signifie que le paiement a été effectué mais le webhook n'a pas encore mis à jour le statut
  // On considère l'abonnement comme actif si les dates sont valides
  if (subscription.status === 'incomplete' && subscription.stripe_subscription_id) {
    // Vérifier si les dates sont valides (trial_end ou current_period_end dans le futur)
    if (subscription.trial_end) {
      return new Date(subscription.trial_end) > new Date();
    }
    if (subscription.current_period_end) {
      return new Date(subscription.current_period_end) > new Date();
    }
    // Si pas de dates mais qu'il y a un stripe_subscription_id, on considère que c'est actif
    // (le webhook va mettre à jour les dates prochainement)
    return true;
  }
  
  // IMPORTANT: Bloquer l'accès si le statut est 'incomplete' SANS stripe_subscription_id
  // Cela signifie que l'utilisateur n'a pas complété le checkout
  if (subscription.status === 'incomplete' && !subscription.stripe_subscription_id) {
    return false;
  }
  
  // IMPORTANT: Vérifier que l'utilisateur a complété le checkout Stripe
  // Si pas de stripe_subscription_id, l'utilisateur n'a pas complété le checkout
  // On ne doit pas accorder l'accès avant que le checkout soit complété
  if (!subscription.stripe_subscription_id && subscription.status === 'trial') {
    // Si le statut est 'trial' mais pas de stripe_subscription_id, 
    // cela signifie que le checkout n'a pas été complété
    // On ne doit pas accorder l'accès
    return false;
  }
  
  // Vérifier si l'abonnement est actif ou en essai
  if (subscription.status === 'trial') {
    if (!subscription.trial_end) return false;
    return new Date(subscription.trial_end) > new Date();
  }
  
  if (subscription.status === 'active') {
    if (!subscription.current_period_end) return false;
    return new Date(subscription.current_period_end) > new Date();
  }
  
  return false;
}

/**
 * Vérifier si une chaîne est premium
 */
export function isPremiumChannel(channelName: string): boolean {
  const premiumKeywords = [
    'bein',
    'dazn',
    'canal',
    'canal+',
    'canal plus',
    'foot+',
    'foot plus',
    'rmc sport',
    'rmc'
  ];
  
  const lowerName = channelName.toLowerCase();
  return premiumKeywords.some(keyword => lowerName.includes(keyword));
}

/**
 * Vérifier si l'utilisateur peut accéder à une chaîne
 */
export async function canAccessChannel(channelName: string): Promise<boolean> {
  // Si la chaîne n'est pas premium, accès libre
  if (!isPremiumChannel(channelName)) {
    return true;
  }
  
  // Si la chaîne est premium, vérifier l'abonnement
  return await hasPremiumAccess();
}

