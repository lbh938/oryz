import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        
        if (!userId) break;

        // Vérifier si c'est une session de subscription
        if (session.mode !== 'subscription' || !session.subscription) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        ) as Stripe.Subscription;

        // Mettre à jour l'abonnement dans la base de données
        // C'est ici qu'on active vraiment l'abonnement avec le statut 'trial'
        const updateData: any = {
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0]?.price.id,
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

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('Error updating subscription in webhook:', updateError);
        } else {
          console.log(`Subscription updated successfully for user ${userId}:`, updateData);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          // Essayer de trouver l'utilisateur via le customer_id
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single();

          if (!subData) break;
          // userId sera utilisé ci-dessous
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

        const updateData: any = {
          status,
        };

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

