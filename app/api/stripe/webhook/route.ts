import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Validation des variables d'environnement au chargement du module
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Webhook request missing signature');
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', {
      message: err.message,
      type: err.type,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { 
        error: 'Invalid signature',
        message: err.message 
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        let userId = session.metadata?.user_id;
        
        // Si userId n'est pas dans metadata, essayer de le trouver via customer_id
        if (!userId && session.customer) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', session.customer as string)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (subData) {
            userId = subData.user_id;
            console.log(`Found user_id via customer_id: ${userId}`);
          }
        }
        
        if (!userId) {
          console.error('No user_id found in checkout.session.completed event');
          break;
        }

        // Vérifier si c'est une session de subscription
        if (session.mode !== 'subscription' || !session.subscription) {
          console.log('Not a subscription session, skipping');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        ) as Stripe.Subscription;

        // Mettre à jour l'abonnement dans la base de données
        // C'est ici qu'on active vraiment l'abonnement avec le statut 'trial'
        const priceId = subscription.items.data[0]?.price.id;
        
        // Déterminer plan_type à partir du price_id ou metadata
        let planType = session.metadata?.plan_id || 'kickoff';
        if (priceId) {
          // Vérifier si le price_id correspond à un plan spécifique
          if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_LEAGUE) {
            planType = 'pro_league';
          } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP) {
            planType = 'vip';
          } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_KICKOFF) {
            planType = 'kickoff';
          }
        }
        
        const updateData: any = {
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          plan_type: planType === 'kickoff' ? 'kickoff' :
                     planType === 'pro_league' ? 'pro_league' :
                     planType === 'vip' ? 'vip' : 'kickoff',
          status: subscription.status === 'trialing' ? 'trial' : 'active',
        };

        if (subscription.trial_start) {
          updateData.trial_start = new Date(subscription.trial_start * 1000).toISOString();
        }
        if (subscription.trial_end) {
          updateData.trial_end = new Date(subscription.trial_end * 1000).toISOString();
        }
        if ('current_period_start' in subscription && typeof subscription.current_period_start === 'number') {
          updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
        }
        if ('current_period_end' in subscription && typeof subscription.current_period_end === 'number') {
          updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
        }

        // Vérifier s'il y a d'autres abonnements actifs pour cet utilisateur
        const { data: otherActiveSubs } = await supabase
          .from('subscriptions')
          .select('id, created_at')
          .eq('user_id', userId)
          .in('status', ['trial', 'active'])
          .neq('stripe_subscription_id', subscription.id)
          .not('stripe_subscription_id', 'is', null);
        
        // Si d'autres abonnements actifs existent, les annuler (garder seulement le plus récent)
        if (otherActiveSubs && otherActiveSubs.length > 0) {
          console.warn(`Multiple active subscriptions detected for user ${userId}. Canceling older ones.`);
          
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
              cancel_at_period_end: true
            })
            .eq('user_id', userId)
            .in('status', ['trial', 'active'])
            .neq('stripe_subscription_id', subscription.id)
            .not('stripe_subscription_id', 'is', null);
        }
        
        // STRATÉGIE: Chercher d'abord par stripe_subscription_id (le plus fiable)
        // Si pas trouvé, chercher par user_id et stripe_customer_id
        let existingSub = null;
        
        // Chercher par stripe_subscription_id si disponible
        if (subscription.id) {
          const { data: subByStripeId } = await supabase
            .from('subscriptions')
            .select('id, status, stripe_customer_id, stripe_subscription_id')
            .eq('stripe_subscription_id', subscription.id)
            .maybeSingle();
          
          if (subByStripeId) {
            existingSub = subByStripeId;
          }
        }
        
        // Si pas trouvé, chercher l'abonnement le plus récent de l'utilisateur
        if (!existingSub) {
          const { data: subByUserId } = await supabase
            .from('subscriptions')
            .select('id, status, stripe_customer_id, stripe_subscription_id')
            .eq('user_id', userId)
            .eq('stripe_customer_id', session.customer as string)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (subByUserId) {
            existingSub = subByUserId;
          }
        }
        
        if (existingSub) {
          // Mettre à jour l'abonnement existant
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              ...updateData,
              stripe_customer_id: session.customer as string, // S'assurer que le customer_id est à jour
            })
            .eq('id', existingSub.id);
          
          if (updateError) {
            console.error('Error updating subscription in webhook:', updateError);
            // Essayer de mettre à jour par stripe_subscription_id en fallback
            const { error: updateByIdError } = await supabase
              .from('subscriptions')
              .update({
                ...updateData,
                stripe_customer_id: session.customer as string,
              })
              .eq('stripe_subscription_id', subscription.id);
            
            if (updateByIdError) {
              console.error('Error updating by stripe_subscription_id:', updateByIdError);
            } else {
              console.log(`Subscription updated successfully (by stripe_subscription_id) for user ${userId}`);
            }
          } else {
            console.log(`Subscription updated successfully for user ${userId}:`, updateData);
          }
        } else {
          // Créer un nouvel abonnement si aucun n'existe
          const planId = session.metadata?.plan_id || 'kickoff';
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              ...updateData,
              plan_type: 'kickoff',
              price_monthly: 4.99,
            });
          
          if (insertError) {
            console.error('Error creating subscription in webhook:', insertError);
          } else {
            console.log(`Subscription created successfully for user ${userId}:`, updateData);
          }
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata?.user_id;

        if (!userId) {
          // Essayer de trouver l'utilisateur via le stripe_subscription_id
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

        // Déterminer le statut
        let status = 'active';
        if (subscription.status === 'trialing') {
          status = 'trial';
        } else if (subscription.status === 'canceled') {
          status = 'canceled';
        } else if (subscription.status === 'past_due') {
          status = 'past_due';
        } else if (subscription.status === 'incomplete') {
          status = 'incomplete';
        }

        // Déterminer plan_type à partir du price_id
        const priceId = subscription.items.data[0]?.price.id;

        const updateData: any = {
          status,
          stripe_price_id: priceId,
          plan_type: 'kickoff',
        };

        if (subscription.trial_start) {
          updateData.trial_start = new Date(subscription.trial_start * 1000).toISOString();
        }
        if (subscription.trial_end) {
          updateData.trial_end = new Date(subscription.trial_end * 1000).toISOString();
        }

        if ('current_period_start' in subscription && typeof subscription.current_period_start === 'number') {
          updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
        }
        if ('current_period_end' in subscription && typeof subscription.current_period_end === 'number') {
          updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
        }
        if ('cancel_at_period_end' in subscription) {
          updateData.cancel_at_period_end = subscription.cancel_at_period_end ?? false;
        }
        if (subscription.canceled_at) {
          updateData.canceled_at = new Date(subscription.canceled_at * 1000).toISOString();
        }

        await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Dans la nouvelle API Stripe, subscription peut être un string (ID) ou un objet Subscription
        // On accède via 'subscription' qui peut être undefined, string, ou Subscription
        const subscriptionId = (invoice as any).subscription 
          ? (typeof (invoice as any).subscription === 'string' 
              ? (invoice as any).subscription 
              : (invoice as any).subscription?.id)
          : null;

        if (subscriptionId) {
          // Mettre à jour la date de fin de période
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;

          const updateData: any = {
            status: 'active',
          };

          if ('current_period_start' in subscription && typeof subscription.current_period_start === 'number') {
            updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
          }
          if ('current_period_end' in subscription && typeof subscription.current_period_end === 'number') {
            updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
          }

          await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('stripe_subscription_id', subscriptionId);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

