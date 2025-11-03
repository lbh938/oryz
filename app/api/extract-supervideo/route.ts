import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint pour extraire les URLs de streaming depuis Supervideo
 * Convertit les URLs Supervideo en M3U8 (HLS) si possible
 * Fallback vers l'URL originale si extraction échoue
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { success: false, error: 'URL manquante' },
      { status: 400 }
    );
  }

  // Vérifier que c'est bien une URL Supervideo
  if (!url.includes('supervideo.') && !url.includes('supervideo.cc') && !url.includes('supervideo.my')) {
    return NextResponse.json(
      { success: false, error: 'URL Supervideo invalide' },
      { status: 400 }
    );
  }

  try {
    // Scraper directement depuis Supervideo
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': url,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const html = await response.text();
        
        // Chercher des patterns M3U8 dans le HTML
        const m3u8Patterns = [
          /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/gi,
          /source:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/gi,
          /file:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/gi,
          /hls:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/gi,
        ];

        for (const pattern of m3u8Patterns) {
          const matches = html.match(pattern);
          if (matches && matches.length > 0) {
            // Extraire l'URL M3U8
            const match = matches[0];
            const m3u8Url = match.replace(/["']/g, '').trim();
            
            if (m3u8Url && m3u8Url.includes('.m3u8')) {
              return NextResponse.json({
                success: true,
                hls_url: m3u8Url,
                source: 'direct-scrape',
                original_url: url,
              });
            }
          }
        }

        // Chercher dans les scripts JavaScript
        const scriptPattern = /eval\(.*?source.*?m3u8.*?\)/gi;
        const scriptMatches = html.match(scriptPattern);
        if (scriptMatches) {
          // Essayer d'extraire depuis le code JS (complexe, pourrait nécessiter plus de parsing)
          console.log('🔍 Pattern M3U8 trouvé dans scripts JS, nécessite parsing avancé');
        }
      }
    } catch (error) {
      console.log('⚠️ Scraping direct échoué:', error);
    }

    // Méthode 3: Fallback - retourner l'URL originale (sera utilisée via iframe)
    return NextResponse.json({
      success: false,
      error: 'Extraction échouée, utilisation iframe',
      original_url: url,
      fallback: true,
    });

  } catch (error: any) {
    console.error('❌ Erreur extraction Supervideo:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de l\'extraction',
      original_url: url,
      fallback: true,
    }, { status: 500 });
  }
}
