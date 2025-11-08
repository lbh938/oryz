import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Validation des variables d'environnement au chargement du module
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  // Récupérer les paramètres de la requête en premier pour les utiliser dans le catch si nécessaire
  const body = await request.json();
  const { priceId, planId } = body;
  
  try {
    const supabase = await createClient();
    
    // Pour les API routes, utiliser getUser() pour la sécurité (authentifie auprès du serveur)
    // C'est plus sécurisé que getSession() qui vient directement du stockage
    // getUser() contacte le serveur Supabase Auth pour authentifier l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID requis' }, { status: 400 });
    }

    // Récupérer ou créer le customer Stripe
    let customerId: string;
    
    // Vérifier si l'utilisateur a déjà un customer_id
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Si un customer_id existe, vérifier qu'il existe toujours dans Stripe
    if (existingSubscription?.stripe_customer_id) {
      try {
        // Vérifier que le customer existe dans Stripe
        await stripe.customers.retrieve(existingSubscription.stripe_customer_id);
        customerId = existingSubscription.stripe_customer_id;
      } catch (error: any) {
        // Si le customer n'existe pas (erreur "no such customer"), créer un nouveau
        console.warn(`Customer ${existingSubscription.stripe_customer_id} n'existe plus dans Stripe, création d'un nouveau customer`);
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = customer.id;
        
        // Mettre à jour la base de données avec le nouveau customer_id
        await supabase
          .from('subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user.id);
      }
    } else {
      // Créer un nouveau customer Stripe
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Vérifier si l'utilisateur a déjà un ou plusieurs abonnements actifs
    // Inclure aussi les abonnements 'incomplete' avec stripe_subscription_id (paiement effectué mais webhook pas encore traité)
    const { data: existingSubs } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id, status, plan_type')
      .eq('user_id', user.id)
      .or('status.in.(trial,active),and(status.eq.incomplete,stripe_subscription_id.not.is.null)');

    // Si l'utilisateur a déjà un ou plusieurs abonnements actifs, empêcher la création d'un nouvel abonnement
    if (existingSubs && existingSubs.length > 0) {
      const activeSub = existingSubs.find(sub => 
        sub.stripe_subscription_id && 
        (sub.status === 'trial' || sub.status === 'active' || 
         (sub.status === 'incomplete' && sub.stripe_subscription_id))
      );
      
      if (activeSub) {
        const planName = activeSub.plan_type === 'kickoff' ? 'Kick-Off' : 'Premium';
        
        return NextResponse.json(
          { 
            error: `Vous avez déjà un abonnement actif (${planName}). Veuillez annuler votre abonnement actuel avant d'en créer un nouveau.${existingSubs.length > 1 ? ` (${existingSubs.length} abonnements détectés)` : ''}`,
            hasActiveSubscription: true 
          },
          { status: 400 }
        );
      }
    }

    // Récupérer l'abonnement existant le plus récent (incomplete ou free) pour le mettre à jour
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Si l'utilisateur n'a pas d'abonnement ou pas de stripe_subscription_id,
    // on crée juste un enregistrement avec le customer_id (mais pas de statut 'trial' encore)
    if (!existingSub || !existingSub.stripe_subscription_id) {
      const tempSubscriptionData = {
        user_id: user.id,
        stripe_customer_id: customerId,
        status: 'incomplete' as const, // Statut temporaire jusqu'à ce que le checkout soit complété
        plan_type: 'kickoff' as any,
        price_monthly: 4.99,
      };

      if (existingSub) {
        // Mettre à jour avec le customer_id
        await supabase
          .from('subscriptions')
          .update({
            stripe_customer_id: customerId,
            status: 'incomplete',
            plan_type: tempSubscriptionData.plan_type,
            price_monthly: tempSubscriptionData.price_monthly,
          })
          .eq('user_id', user.id);
      } else {
        // Créer un nouvel enregistrement temporaire
        await supabase
          .from('subscriptions')
          .insert(tempSubscriptionData);
      }
    }

    // Vérifier une dernière fois que le customer existe avant de créer la session
    try {
      await stripe.customers.retrieve(customerId);
    } catch (error: any) {
      // Si le customer n'existe toujours pas, créer un nouveau customer
      console.error(`Customer ${customerId} n'existe pas, création d'un nouveau customer`);
      const newCustomer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = newCustomer.id;
      
      // Mettre à jour la base de données avec le nouveau customer_id
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    // Créer la session Checkout de Stripe avec essai gratuit de 7 jours
    // Une carte de paiement est REQUISE pour facturer automatiquement à la fin de l'essai
    // Le paiement sera collecté seulement à la fin de l'essai (0€ pendant 7 jours)
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      },
      // Configuration pour exiger la carte de paiement avant l'essai
      // La carte est nécessaire pour facturer automatiquement à la fin de l'essai gratuit
      payment_method_collection: 'always', // Exige toujours une carte avant de commencer l'essai
      success_url: `${request.nextUrl.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/subscription`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    // Si l'erreur est liée à un customer inexistant, corriger et réessayer
    if (error.code === 'resource_missing' && error.param === 'customer') {
      try {
        console.warn('Customer invalide détecté, correction en cours...');
        
        // Recréer les clients nécessaires
        const supabaseRecovery = await createClient();
        // SÉCURITÉ: Utiliser getUser() pour authentifier l'utilisateur auprès du serveur
        const { data: { user: userRecovery }, error: userRecoveryError } = await supabaseRecovery.auth.getUser();
        
        if (userRecoveryError || !userRecovery) {
          return NextResponse.json(
            { error: 'Utilisateur non authentifié' },
            { status: 401 }
          );
        }
        
        // Nettoyer le customer_id invalide de la base de données
        await supabaseRecovery
          .from('subscriptions')
          .update({ stripe_customer_id: null })
          .eq('user_id', userRecovery.id);
        
        // Créer un nouveau customer
        const newCustomer = await stripe.customers.create({
          email: userRecovery.email || undefined,
          metadata: {
            user_id: userRecovery.id,
          },
        });
        
        // Mettre à jour la base de données avec le nouveau customer_id
        await supabaseRecovery
          .from('subscriptions')
          .update({ stripe_customer_id: newCustomer.id })
          .eq('user_id', userRecovery.id);
        
        // Réessayer de créer la session avec le nouveau customer
        // Utiliser les variables priceId et planId du scope principal
        const retrySession = await stripe.checkout.sessions.create({
          customer: newCustomer.id,
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          subscription_data: {
            trial_period_days: 7,
            metadata: {
              user_id: userRecovery.id,
              plan_id: planId,
            },
          },
          payment_method_collection: 'always',
          success_url: `${request.nextUrl.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${request.nextUrl.origin}/subscription`,
          metadata: {
            user_id: userRecovery.id,
            plan_id: planId,
          },
        });
        
        console.log('Session créée avec succès après correction du customer');
        return NextResponse.json({ sessionId: retrySession.id, url: retrySession.url });
      } catch (recoveryError: any) {
        console.error('Error recovering from customer error:', recoveryError);
        return NextResponse.json(
          { error: 'Erreur lors de la correction du customer. Veuillez réessayer.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}

