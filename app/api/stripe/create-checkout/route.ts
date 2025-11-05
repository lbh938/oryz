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
      .single();

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
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

    // Utiliser upsert avec onConflict sur user_id (contrainte unique)
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (subError) {
      console.error('Error creating subscription:', subError);
      // Ne pas bloquer le processus si l'upsert échoue, on continue quand même
    }

    // Créer la session Checkout de Stripe avec essai gratuit de 7 jours
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
      // Configuration pour ne pas charger immédiatement (0€ pendant l'essai)
      payment_method_collection: 'if_required', // Collecte la carte mais ne charge pas pendant l'essai
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

