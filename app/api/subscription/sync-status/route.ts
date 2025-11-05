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

    // Récupérer l'abonnement de l'utilisateur le plus récent
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError || !subscription) {
      return NextResponse.json({ 
        subscription: null,
        status: 'free',
        planType: 'free'
      });
    }

    // Si l'abonnement est "incomplete" mais qu'il y a un stripe_customer_id, essayer de le synchroniser
    if (subscription.status === 'incomplete' && subscription.stripe_customer_id && !subscription.stripe_subscription_id) {
      try {
        // Récupérer les subscriptions du customer depuis Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: subscription.stripe_customer_id,
          status: 'all',
          limit: 10,
        });

        // Trouver la subscription la plus récente qui correspond
        const matchingSubscription = subscriptions.data
          .filter(s => s.status === 'active' || s.status === 'trialing')
          .sort((a, b) => (b.created || 0) - (a.created || 0))[0];

        if (matchingSubscription) {
          // Mettre à jour l'abonnement dans la base de données
          const updateData: any = {
            stripe_subscription_id: matchingSubscription.id,
            stripe_price_id: matchingSubscription.items.data[0]?.price.id,
            status: matchingSubscription.status === 'trialing' ? 'trial' : 'active',
          };

          if (matchingSubscription.trial_start) {
            updateData.trial_start = new Date(matchingSubscription.trial_start * 1000).toISOString();
          }
          if (matchingSubscription.trial_end) {
            updateData.trial_end = new Date(matchingSubscription.trial_end * 1000).toISOString();
          }
          if ('current_period_start' in matchingSubscription && typeof matchingSubscription.current_period_start === 'number') {
            updateData.current_period_start = new Date(matchingSubscription.current_period_start * 1000).toISOString();
          }
          if ('current_period_end' in matchingSubscription && typeof matchingSubscription.current_period_end === 'number') {
            updateData.current_period_end = new Date(matchingSubscription.current_period_end * 1000).toISOString();
          }

          const { error: updateError } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('id', subscription.id);

          if (!updateError) {
            // Recharger l'abonnement mis à jour
            const { data: updatedSub } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('id', subscription.id)
              .single();

            return NextResponse.json({
              subscription: updatedSub,
              status: updatedSub?.status || 'free',
              planType: updatedSub?.plan_type || 'free',
              synced: true
            });
          }
        }
      } catch (error: any) {
        console.error('Error syncing subscription:', error);
      }
    }

    // Si l'abonnement a un stripe_subscription_id, vérifier qu'il est toujours valide dans Stripe
    if (subscription.stripe_subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        
        // Si le statut dans Stripe est différent, mettre à jour
        if ((stripeSubscription.status === 'trialing' && subscription.status !== 'trial') ||
            (stripeSubscription.status === 'active' && subscription.status !== 'active')) {
          const updateData: any = {
            status: stripeSubscription.status === 'trialing' ? 'trial' : 'active',
          };

          if (stripeSubscription.trial_start) {
            updateData.trial_start = new Date(stripeSubscription.trial_start * 1000).toISOString();
          }
          if (stripeSubscription.trial_end) {
            updateData.trial_end = new Date(stripeSubscription.trial_end * 1000).toISOString();
          }
          if ('current_period_start' in stripeSubscription && typeof stripeSubscription.current_period_start === 'number') {
            updateData.current_period_start = new Date(stripeSubscription.current_period_start * 1000).toISOString();
          }
          if ('current_period_end' in stripeSubscription && typeof stripeSubscription.current_period_end === 'number') {
            updateData.current_period_end = new Date(stripeSubscription.current_period_end * 1000).toISOString();
          }

          await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('id', subscription.id);

          // Recharger l'abonnement mis à jour
          const { data: updatedSub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', subscription.id)
            .single();

          return NextResponse.json({
            subscription: updatedSub,
            status: updatedSub?.status || 'free',
            planType: updatedSub?.plan_type || 'free',
            synced: true
          });
        }
      } catch (error: any) {
        console.error('Error checking Stripe subscription:', error);
      }
    }

    // Déterminer le statut utilisateur basé sur l'abonnement
    let userStatus: string = 'free';
    
    if (subscription.status === 'trial' || subscription.status === 'active') {
      if (subscription.plan_type === 'kickoff') {
        userStatus = 'kickoff';
      } else if (subscription.plan_type === 'pro_league') {
        userStatus = 'pro_league';
      } else if (subscription.plan_type === 'vip') {
        userStatus = 'vip';
      } else {
        userStatus = 'trial';
      }
    } else if (subscription.status === 'incomplete' && subscription.stripe_subscription_id) {
      if (subscription.plan_type === 'kickoff') {
        userStatus = 'kickoff';
      } else if (subscription.plan_type === 'pro_league') {
        userStatus = 'pro_league';
      } else if (subscription.plan_type === 'vip') {
        userStatus = 'vip';
      } else {
        userStatus = 'trial';
      }
    }

    return NextResponse.json({
      subscription,
      status: userStatus,
      planType: subscription.plan_type,
      synced: false
    });
  } catch (error: any) {
    console.error('Error syncing subscription status:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

