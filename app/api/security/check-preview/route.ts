import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Service pour détecter VPN/Proxy
async function detectVPNProxy(ip: string): Promise<{
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  countryCode?: string;
  city?: string;
  asn?: string;
}> {
  try {
    // Utiliser un service gratuit comme ipapi.co ou ip-api.com
    // Pour production, utiliser un service payant plus fiable comme MaxMind GeoIP2
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,city,as,proxy,hosting`);
    
    if (!response.ok) {
      // Fallback : retourner des valeurs par défaut
      return {
        isVPN: false,
        isProxy: false,
        isTor: false,
      };
    }

    const data = await response.json();
    
    // ip-api.com retourne 'proxy' pour proxy et VPN
    // 'hosting' indique généralement un datacenter/VPS
    return {
      isVPN: data.hosting === true || data.proxy === true,
      isProxy: data.proxy === true,
      isTor: false, // ip-api.com ne détecte pas Tor, utiliser un service spécialisé si nécessaire
      countryCode: data.countryCode,
      city: data.city,
      asn: data.as,
    };
  } catch (error) {
    console.error('Error detecting VPN/Proxy:', error);
    return {
      isVPN: false,
      isProxy: false,
      isTor: false,
    };
  }
}

// Calculer le score de confiance
function calculateTrustScore(
  isVPN: boolean,
  isProxy: boolean,
  isTor: boolean,
  previewCount: number,
  hasAccount: boolean
): number {
  let score = 1.0;

  // Réduire le score si VPN/Proxy/Tor
  if (isVPN) score -= 0.4;
  if (isProxy) score -= 0.3;
  if (isTor) score -= 0.5;

  // Réduire le score si déjà utilisé plusieurs fois
  if (previewCount > 1) score -= 0.2;

  // Augmenter le score si l'utilisateur a un compte
  if (hasAccount) score += 0.1;

  // S'assurer que le score est entre 0 et 1
  return Math.max(0, Math.min(1, score));
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { deviceFingerprint, userAgent } = await request.json();

    if (!deviceFingerprint) {
      return NextResponse.json(
        { error: 'Device fingerprint is required' },
        { status: 400 }
      );
    }

    // Récupérer l'IP depuis les headers de la requête
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || cfConnectingIp || 'unknown';

    // Détecter VPN/Proxy
    const vpnProxyInfo = await detectVPNProxy(clientIp);

    // Vérifier dans la base de données si l'IP/device peut utiliser l'essai
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: checkResult, error: checkError } = await supabaseAdmin.rpc(
      'can_use_free_preview',
      {
        p_ip_address: clientIp,
        p_device_fingerprint: deviceFingerprint,
        p_user_id: user?.id || null,
      }
    );

    if (checkError) {
      console.error('Error checking free preview:', checkError);
      return NextResponse.json(
        { error: 'Error checking preview eligibility' },
        { status: 500 }
      );
    }

    const canUse = checkResult?.can_use || false;
    const previewCount = checkResult?.preview_count || 0;

    // Calculer le score de confiance
    const trustScore = calculateTrustScore(
      vpnProxyInfo.isVPN,
      vpnProxyInfo.isProxy,
      vpnProxyInfo.isTor,
      previewCount,
      !!user
    );

    // Si la base de données dit non, bloquer
    if (!canUse) {
      return NextResponse.json({
        canUse: false,
        reason: checkResult?.reason || 'Accès restreint',
        trustScore,
        isVPN: vpnProxyInfo.isVPN,
        isProxy: vpnProxyInfo.isProxy,
        isTor: vpnProxyInfo.isTor,
      });
    }

    // Si VPN/Proxy/Tor détecté, bloquer
    if (vpnProxyInfo.isVPN || vpnProxyInfo.isProxy || vpnProxyInfo.isTor) {
      return NextResponse.json({
        canUse: false,
        reason: 'VPN/Proxy/Tor détecté - Accès restreint',
        trustScore,
        isVPN: vpnProxyInfo.isVPN,
        isProxy: vpnProxyInfo.isProxy,
        isTor: vpnProxyInfo.isTor,
      });
    }

    // Si le score de confiance est trop bas, bloquer
    if (trustScore < 0.5) {
      return NextResponse.json({
        canUse: false,
        reason: 'Score de confiance trop bas',
        trustScore,
        isVPN: vpnProxyInfo.isVPN,
        isProxy: vpnProxyInfo.isProxy,
        isTor: vpnProxyInfo.isTor,
      });
    }

    // Enregistrer l'essai si autorisé
    if (canUse) {
      const { error: recordError } = await supabaseAdmin.rpc('record_free_preview', {
        p_ip_address: clientIp,
        p_device_fingerprint: deviceFingerprint,
        p_user_id: user?.id || null,
        p_user_agent: userAgent || null,
        p_is_vpn: vpnProxyInfo.isVPN,
        p_is_proxy: vpnProxyInfo.isProxy,
        p_is_tor: vpnProxyInfo.isTor,
        p_trust_score: trustScore,
        p_country_code: vpnProxyInfo.countryCode || null,
        p_city: vpnProxyInfo.city || null,
        p_asn: vpnProxyInfo.asn || null,
      });

      if (recordError) {
        console.error('Error recording free preview:', recordError);
      }
    }

    return NextResponse.json({
      canUse: true,
      reason: 'Autorisé',
      trustScore,
      previewCount: previewCount + 1,
      isVPN: vpnProxyInfo.isVPN,
      isProxy: vpnProxyInfo.isProxy,
      isTor: vpnProxyInfo.isTor,
    });
  } catch (error: any) {
    console.error('Error in check-preview:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

