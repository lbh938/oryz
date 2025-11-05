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

    // Vérifier si l'utilisateur est admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (!adminData || !adminData.is_super_admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer tous les abonnements "incomplete" avec stripe_customer_id
    const { data: incompleteSubs } = await supabase
      .from('subscriptions')
      .select('id, user_id, stripe_customer_id, plan_type, created_at')
      .eq('status', 'incomplete')
      .not('stripe_customer_id', 'is', null)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // 30 derniers jours
      .order('created_at', { ascending: false });

    if (!incompleteSubs || incompleteSubs.length === 0) {
      return NextResponse.json({ 
        message: 'Aucun abonnement à synchroniser',
        synced: 0 
      });
    }

    const results = {
      synced: 0,
      errors: 0,
      details: [] as any[],
    };

    // Pour chaque abonnement incomplet, chercher dans Stripe
    for (const sub of incompleteSubs) {
      try {
        if (!sub.stripe_customer_id) continue;

        // Récupérer le customer Stripe
        const customer = await stripe.customers.retrieve(sub.stripe_customer_id);
        if (customer.deleted) continue;

        // Récupérer les subscriptions actives du customer
        const subscriptions = await stripe.subscriptions.list({
          customer: sub.stripe_customer_id,
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
            .eq('id', sub.id);

          if (updateError) {
            results.errors++;
            results.details.push({
              subscription_id: sub.id,
              user_id: sub.user_id,
              error: updateError.message,
            });
          } else {
            results.synced++;
            results.details.push({
              subscription_id: sub.id,
              user_id: sub.user_id,
              stripe_subscription_id: matchingSubscription.id,
              status: updateData.status,
              synced: true,
            });
          }
        } else {
          results.errors++;
          results.details.push({
            subscription_id: sub.id,
            user_id: sub.user_id,
            error: 'Aucune subscription active trouvée dans Stripe',
          });
        }
      } catch (error: any) {
        results.errors++;
        results.details.push({
          subscription_id: sub.id,
          user_id: sub.user_id,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: `Synchronisation terminée: ${results.synced} synchronisés, ${results.errors} erreurs`,
      ...results,
    });
  } catch (error: any) {
    console.error('Error syncing subscriptions:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

