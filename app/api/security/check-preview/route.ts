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
    
    // OPTIMISATION: Ajouter un timeout de 3 secondes pour éviter les blocages
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,countryCode,city,as,proxy,hosting`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
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
  } catch (error: any) {
    // En cas de timeout ou d'erreur réseau, ne pas bloquer l'utilisateur
    if (error.name === 'AbortError' || error.code === 'ECONNRESET') {
      console.warn('VPN/Proxy detection timed out or connection error, allowing access');
    } else {
    console.error('Error detecting VPN/Proxy:', error);
    }
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
    
    // Pour les API routes, utiliser getUser() pour la sécurité (authentifie auprès du serveur)
    // C'est plus sécurisé que getSession() qui vient directement du stockage
    // getUser() contacte le serveur Supabase Auth pour authentifier l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Si erreur d'authentification, user sera null (utilisateur non authentifié)
    // Ce n'est pas une erreur fatale pour cette route car les utilisateurs anonymes peuvent aussi utiliser le preview

    // Si l'utilisateur est admin, autoriser l'accès sans restriction
    if (user) {
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('is_super_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (adminData?.is_super_admin === true) {
        return NextResponse.json({
          canUse: true,
          reason: 'Admin - Accès complet',
          trustScore: 1.0,
          isVPN: false,
          isProxy: false,
          isTor: false,
        });
      }
    }

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

    // Créer le client Supabase admin avec Service Role Key si disponible
    // Sinon, utiliser le client normal (ANON_KEY) - app_settings est lisible publiquement
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let supabaseAdmin;
    
    if (serviceRoleKey) {
      // Utiliser Service Role Key pour bypass RLS si disponible (recommandé)
      supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      );
    } else {
      // Fallback vers client normal - app_settings a une politique RLS publique
      // Note: La fonction RPC can_use_free_preview devrait aussi fonctionner avec ANON_KEY
      console.warn('SUPABASE_SERVICE_ROLE_KEY not configured, using ANON_KEY. Consider adding it for better security.');
      supabaseAdmin = supabase; // Utiliser le client normal déjà créé
    }

    // Vérifier si le free preview est activé dans les paramètres
    // OPTIMISATION: Ajouter un timeout pour cette requête
    const settingsPromise = supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'free_preview_enabled')
      .maybeSingle();
    
    const { data: freePreviewSetting, error: settingError } = await Promise.race([
      settingsPromise,
      new Promise<{ data: null; error: any }>((_, reject) => 
        setTimeout(() => reject(new Error('Settings query timeout')), 3000)
      )
    ]).catch(() => ({ data: null, error: { message: 'Timeout' } }));

    // Si erreur ou free preview désactivé, bloquer l'accès
    if (settingError) {
      console.error('Error checking free preview setting:', settingError);
      // En cas d'erreur, bloquer par sécurité
    }

    if (freePreviewSetting?.value === 'false') {
      return NextResponse.json({
        canUse: false,
        reason: 'Visionnage gratuit désactivé',
        trustScore: 0,
        isVPN: false,
        isProxy: false,
        isTor: false,
      });
    }

    // Détecter VPN/Proxy
    const vpnProxyInfo = await detectVPNProxy(clientIp);

    // OPTIMISATION: Ajouter un timeout pour la RPC call
    const rpcPromise = supabaseAdmin.rpc(
      'can_use_free_preview',
      {
        p_ip_address: clientIp,
        p_device_fingerprint: deviceFingerprint,
        p_user_id: user?.id || null,
      }
    );
    
    const { data: checkResult, error: checkError } = await Promise.race([
      rpcPromise,
      new Promise<{ data: null; error: any }>((_, reject) => 
        setTimeout(() => reject(new Error('RPC timeout')), 5000)
      )
    ]).catch((err) => {
      console.error('RPC call failed or timed out:', err);
      return { data: null, error: err };
    });

    if (checkError) {
      console.error('Error checking free preview:', checkError);
      
      // En cas d'erreur de timeout ou de connexion, autoriser l'accès pour ne pas bloquer les utilisateurs
      if (checkError.message?.includes('timeout') || 
          checkError.message?.includes('Timeout') ||
          checkError.code === 'ECONNRESET' ||
          checkError.code === 'ETIMEDOUT' ||
          checkError.message?.includes('aborted')) {
        console.warn('Preview check timed out or connection error, allowing access by default');
        return NextResponse.json({
          canUse: true,
          reason: 'Vérification temporairement indisponible',
          trustScore: 0.5,
          isVPN: false,
          isProxy: false,
          isTor: false,
          remainingMs: 15 * 60 * 1000,
        });
      }
      
      return NextResponse.json(
        { error: 'Error checking preview eligibility' },
        { status: 500 }
      );
    }

    const canUse = checkResult?.can_use || false;
    const previewCount = checkResult?.preview_count || 0;
    const remainingMs = typeof checkResult?.remaining_ms === 'number' ? checkResult.remaining_ms : null;

    // Calculer le score de confiance
    const trustScore = calculateTrustScore(
      vpnProxyInfo.isVPN,
      vpnProxyInfo.isProxy,
      vpnProxyInfo.isTor,
      previewCount,
      !!user
    );

    // Si VPN/Proxy/Tor détecté, bloquer (priorité absolue)
    if (vpnProxyInfo.isVPN || vpnProxyInfo.isProxy || vpnProxyInfo.isTor) {
      return NextResponse.json({
        canUse: false,
        reason: 'VPN/Proxy/Tor détecté - Accès restreint',
        trustScore,
        isVPN: vpnProxyInfo.isVPN,
        isProxy: vpnProxyInfo.isProxy,
        isTor: vpnProxyInfo.isTor,
        remainingMs: remainingMs ?? 0,
      });
    }

    // Si la base de données dit non ET que ce n'est pas juste un nouveau compte, bloquer
    // Permettre aux nouveaux utilisateurs d'utiliser leur essai gratuit
    if (!canUse && checkResult?.reason && !checkResult.reason.includes('Premier essai')) {
      // Si l'utilisateur a un compte mais n'a pas encore utilisé l'essai, autoriser
      if (user && checkResult?.preview_count === 0) {
        // Autoriser même si la DB dit non (première fois pour cet utilisateur)
        // Enregistrer l'essai si autorisé
        const { error: recordError } = await supabaseAdmin.rpc('record_free_preview', {
          p_ip_address: clientIp,
          p_device_fingerprint: deviceFingerprint,
          p_user_id: user.id,
          p_user_agent: userAgent || null,
          p_is_vpn: vpnProxyInfo.isVPN,
          p_is_proxy: vpnProxyInfo.isProxy,
          p_is_tor: vpnProxyInfo.isTor,
          p_trust_score: 1.0, // Score maximal pour nouveau compte
          p_country_code: vpnProxyInfo.countryCode || null,
          p_city: vpnProxyInfo.city || null,
          p_asn: vpnProxyInfo.asn || null,
        });

        if (recordError) {
          console.error('Error recording free preview:', recordError);
        }

        return NextResponse.json({
          canUse: true,
          reason: 'Autorisé - Premier essai',
          trustScore: 1.0,
          previewCount: 1,
          isVPN: vpnProxyInfo.isVPN,
          isProxy: vpnProxyInfo.isProxy,
          isTor: vpnProxyInfo.isTor,
        });
      }
      
      return NextResponse.json({
        canUse: false,
        reason: checkResult?.reason || 'Accès restreint',
        trustScore,
        isVPN: vpnProxyInfo.isVPN,
        isProxy: vpnProxyInfo.isProxy,
        isTor: vpnProxyInfo.isTor,
        remainingMs: remainingMs ?? 0,
      });
    }

    // Si le score de confiance est trop bas ET que ce n'est pas un nouveau compte, bloquer
    if (trustScore < 0.5 && previewCount > 0) {
      return NextResponse.json({
        canUse: false,
        reason: 'Score de confiance trop bas',
        trustScore,
        isVPN: vpnProxyInfo.isVPN,
        isProxy: vpnProxyInfo.isProxy,
        isTor: vpnProxyInfo.isTor,
        remainingMs: remainingMs ?? 0,
      });
    }

    // Enregistrer l'essai si autorisé (en arrière-plan, ne pas bloquer la réponse)
    if (canUse) {
      // Ne pas attendre cette opération pour ne pas ralentir la réponse
      // Utiliser .then() pour exécuter en arrière-plan sans bloquer
      supabaseAdmin.rpc('record_free_preview', {
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
      }).then(({ error: recordError }) => {
        if (recordError) {
          console.error('Failed to record preview (non-blocking):', recordError);
        }
      });
    }

    return NextResponse.json({
      canUse: true,
      reason: 'Autorisé',
      trustScore,
      previewCount: previewCount + 1,
      isVPN: vpnProxyInfo.isVPN,
      isProxy: vpnProxyInfo.isProxy,
      isTor: vpnProxyInfo.isTor,
      remainingMs: remainingMs ?? (15 * 60 * 1000),
    });
  } catch (error: any) {
    console.error('Error in check-preview:', error);
    
    // En cas d'erreur ECONNRESET, ETIMEDOUT ou timeout, autoriser l'accès par défaut
    // pour ne pas bloquer les utilisateurs légitimes lors de problèmes réseau temporaires
    if (error.code === 'ECONNRESET' || 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ENOTFOUND' ||
        error.message?.includes('aborted') ||
        error.message?.includes('timeout')) {
      console.warn('Connection error in check-preview, allowing access by default');
      return NextResponse.json({
        canUse: true,
        reason: 'Vérification temporairement indisponible',
        trustScore: 0.5,
        isVPN: false,
        isProxy: false,
        isTor: false,
        remainingMs: 15 * 60 * 1000,
      });
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

