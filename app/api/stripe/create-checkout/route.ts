import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { priceId, planId } = await request.json();
    
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

    // Créer ou mettre à jour l'abonnement dans la base de données
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7); // 7 jours d'essai

    const subscriptionData = {
      user_id: user.id,
      stripe_customer_id: customerId,
      status: 'trial' as const,
      trial_start: trialStart.toISOString(),
      trial_end: trialEnd.toISOString(),
      plan_type: (planId === 'kickoff' ? 'kickoff' :
                   planId === 'pro_league' ? 'pro_league' :
                   planId === 'vip' ? 'vip' : 'premium') as any,
      price_monthly: planId === 'kickoff' ? 9.99 :
                       planId === 'pro_league' ? 14.99 :
                       planId === 'vip' ? 19.99 : 19.99,
    };

    // NE PAS créer l'abonnement dans la DB avant le checkout complété
    // On attendra le webhook checkout.session.completed pour créer l'abonnement
    // Cela évite d'accorder l'accès avant que l'utilisateur n'ait complété le checkout
    // On crée juste un enregistrement temporaire avec le customer_id pour éviter les erreurs
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Si l'utilisateur a déjà un abonnement avec un stripe_subscription_id, 
    // on ne fait rien ici (le webhook gérera la mise à jour)
    // Si l'utilisateur n'a pas d'abonnement ou pas de stripe_subscription_id,
    // on crée juste un enregistrement avec le customer_id (mais pas de statut 'trial' encore)
    if (!existingSub || !existingSub.stripe_subscription_id) {
      const tempSubscriptionData = {
        user_id: user.id,
        stripe_customer_id: customerId,
        status: 'incomplete' as const, // Statut temporaire jusqu'à ce que le checkout soit complété
        plan_type: (planId === 'kickoff' ? 'kickoff' :
                     planId === 'pro_league' ? 'pro_league' :
                     planId === 'vip' ? 'vip' : 'premium') as any,
        price_monthly: planId === 'kickoff' ? 9.99 :
                       planId === 'pro_league' ? 14.99 :
                       planId === 'vip' ? 19.99 : 19.99,
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

    // Créer la session Checkout de Stripe avec essai gratuit de 7 jours
    // Une carte de paiement est REQUISE pour facturer automatiquement à la fin de l'essai
    // Le paiement sera collecté seulement à la fin de l'essai (0€ pendant 7 jours)
    const session = await stripe.checkout.sessions.create({
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

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}

