import { createClient } from '@/lib/supabase/client';

export type SubscriptionStatus = 'free' | 'trial' | 'active' | 'canceled' | 'past_due' | 'incomplete';
export type PlanType = 'free' | 'kickoff' | 'pro_league' | 'vip';

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
    description: 'Accès au kick-off, Pro League, séries et films',
    price: 9.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_KICKOFF || '', // À configurer dans Stripe
    features: [
      'Accès au kick-off',
      'Pro League',
      'Séries et films en supplément',
      'Autres options disponibles',
      'PC, téléphone, tablette',
      'Qualité HD'
    ],
    trialDays: 7
  },
  {
    id: 'pro_league',
    name: 'Pro League',
    description: 'Accès complet : kick-off, Pro League, séries, films et autres championnats',
    price: 14.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_LEAGUE || '', // À configurer dans Stripe
    features: [
      'Tout le kick-off',
      'Pro League complète',
      'Séries et films',
      'Autres championnats',
      'PC, téléphone, tablette',
      'Qualité HD sans limite'
    ],
    isPopular: true,
    trialDays: 7
  },
  {
    id: 'vip',
    name: 'VIP',
    description: 'Accès premium complet avec plusieurs écrans',
    price: 19.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP || '', // À configurer dans Stripe
    features: [
      'Tout le Pro League',
      'Films et séries illimités',
      'Autres championnats',
      'Plusieurs écrans simultanés',
      'PC, téléphone, tablette',
      'Qualité HD/4K sans limite'
    ],
    trialDays: 7
  }
];

/**
 * Récupérer l'abonnement de l'utilisateur actuel
 */
export async function getCurrentSubscription(): Promise<Subscription | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  
  return data as Subscription;
}

/**
 * Vérifier si l'utilisateur est admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

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
 */
export async function hasPremiumAccess(): Promise<boolean> {
  // Vérifier si l'utilisateur est admin - les admins ont accès automatique
  const admin = await isAdmin();
  if (admin) return true;

  const subscription = await getCurrentSubscription();
  
  if (!subscription) return false;
  
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

