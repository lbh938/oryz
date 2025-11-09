import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * API de vérification de preview avec IP et fingerprinting
 * Pour les utilisateurs free uniquement (pas anonymous)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceFingerprint, channelId } = body;

    if (!deviceFingerprint) {
      return NextResponse.json(
        { error: 'Device fingerprint requis' },
        { status: 400 }
      );
    }

    // Récupérer l'IP de la requête
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0]?.trim() || realIp || '0.0.0.0';

    // Récupérer l'utilisateur (si connecté)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Seuls les utilisateurs free (pas anonymous) peuvent utiliser la preview
    // Les anonymous n'ont pas accès
    if (!user) {
      return NextResponse.json({
        canUse: false,
        reason: 'Vous devez créer un compte pour accéder à la preview gratuite',
        trustScore: 0.0,
        isVPN: false,
        isProxy: false,
        isTor: false,
        remainingMs: 0,
      });
    }

    // Vérifier le statut de l'utilisateur (doit être free)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan_type')
      .eq('user_id', user.id)
      .maybeSingle();

    const userStatus = subscription?.status || 'free';
    const planType = subscription?.plan_type || 'free';

    // Si l'utilisateur a un statut premium, autoriser l'accès
    if (['trial', 'kickoff', 'admin'].includes(userStatus) || planType !== 'free') {
      return NextResponse.json({
        canUse: true,
        reason: 'Utilisateur premium',
        trustScore: 1.0,
        isVPN: false,
        isProxy: false,
        isTor: false,
        remainingMs: null,
      });
    }

    // Vérifier VPN/Proxy/Tor (optionnel, avec timeout)
    let isVPN = false;
    let isProxy = false;
    let isTor = false;
    let countryCode: string | null = null;
    let city: string | null = null;
    let asn: string | null = null;
    let trustScore = 1.0;

    try {
      const ipCheckResponse = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,countryCode,city,as,proxy,hosting`, {
        signal: AbortSignal.timeout(3000), // 3 secondes max
      });

      if (ipCheckResponse.ok) {
        const ipData = await ipCheckResponse.json();
        if (ipData.status === 'success') {
          countryCode = ipData.countryCode || null;
          city = ipData.city || null;
          asn = ipData.as || null;
          
          // Détecter VPN/Proxy (simplifié)
          if (ipData.hosting === true || ipData.proxy === true) {
            isVPN = true;
            trustScore = 0.3;
          }
        }
      }
    } catch (error) {
      // En cas d'erreur, continuer sans bloquer
      console.warn('Erreur lors de la vérification IP:', error);
    }

    // Utiliser le client admin pour appeler la fonction RPC
    const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL
      ? createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : supabase;

    // Appeler la fonction RPC pour vérifier l'éligibilité
    const { data: checkResult, error: checkError } = await supabaseAdmin
      .rpc('can_use_free_preview', {
        p_ip_address: ipAddress,
        p_device_fingerprint: deviceFingerprint,
        p_user_id: user.id,
      });

    if (checkError) {
      console.error('Erreur RPC can_use_free_preview:', checkError);
      // En cas d'erreur, autoriser par défaut pour éviter de bloquer les utilisateurs
      return NextResponse.json({
        canUse: true,
        reason: 'Vérification en cours',
        trustScore: 1.0,
        isVPN: false,
        isProxy: false,
        isTor: false,
        remainingMs: 15 * 60 * 1000,
      });
    }

    const result = checkResult as any;

    // Enregistrer l'utilisation (non-bloquant)
    (async () => {
      try {
        const { error: recordError } = await supabaseAdmin.rpc('record_free_preview', {
          p_ip_address: ipAddress,
          p_device_fingerprint: deviceFingerprint,
          p_user_id: user.id,
          p_user_agent: request.headers.get('user-agent') || null,
          p_is_vpn: isVPN,
          p_is_proxy: isProxy,
          p_is_tor: isTor,
          p_trust_score: trustScore,
          p_country_code: countryCode,
          p_city: city,
          p_asn: asn,
        });
        if (recordError) {
          console.error('Erreur lors de l\'enregistrement:', recordError);
        }
      } catch (error: any) {
        console.error('Erreur lors de l\'enregistrement (catch):', error);
      }
    })();

    return NextResponse.json({
      canUse: result.can_use === true,
      reason: result.reason || 'Vérification effectuée',
      trustScore: result.trust_score || trustScore,
      isVPN: result.is_vpn || isVPN,
      isProxy: result.is_proxy || isProxy,
      isTor: result.is_tor || isTor,
      remainingMs: result.remaining_ms || null,
    });
  } catch (error: any) {
    console.error('Error in check-preview:', error);
    
    // En cas d'erreur, autoriser par défaut pour éviter de bloquer les utilisateurs
    return NextResponse.json({
      canUse: true,
      reason: 'Erreur de vérification - Accès autorisé',
      trustScore: 1.0,
      isVPN: false,
      isProxy: false,
      isTor: false,
      remainingMs: 15 * 60 * 1000,
    });
  }
}
