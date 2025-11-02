import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    
    // Ajouter un timestamp pour éviter le cache
    const timestamp = Date.now();
    const playerUrl = `https://tutvlive.ru/player/2/${channelId}?_t=${timestamp}`;
    
    console.log('Fetching stream from:', playerUrl);
    
    // Récupérer la page HTML du player
    const response = await fetch(playerUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://tutvlive.ru/',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch player page: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Chercher l'URL du flux M3U8 dans le HTML
    // Patterns courants pour les flux HLS
    const patterns = [
      // Pattern pour les URLs complètes .m3u8
      /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/gi,
      // Pattern pour source: "url"
      /source:\s*["']([^"']+\.m3u8[^"']*)["']/gi,
      // Pattern pour src="url"
      /src=["']([^"']+\.m3u8[^"']*)["']/gi,
      // Pattern pour file: "url"
      /file:\s*["']([^"']+\.m3u8[^"']*)["']/gi,
      // Pattern pour URL encodée
      /url=([^&\s"']+\.m3u8[^&\s"']*)/gi,
    ];
    
    let streamUrl = null;
    
    for (const pattern of patterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const url = match[1] || match[0];
        if (url && url.includes('.m3u8')) {
          // Nettoyer l'URL
          streamUrl = url.replace(/\\"/g, '"').replace(/\\/g, '').trim();
          console.log('Found stream URL:', streamUrl);
          break;
        }
      }
      if (streamUrl) break;
    }
    
    if (streamUrl) {
      return NextResponse.json({ 
        streamUrl,
        success: true,
        source: 'scraped',
        playerUrl
      });
    }
    
    // Si aucun flux trouvé, retourner une erreur avec le HTML pour debug
    console.error('No M3U8 URL found in HTML');
    console.log('HTML preview:', html.substring(0, 500));
    
    return NextResponse.json(
      { 
        error: 'No stream URL found in player page',
        success: false,
        playerUrl,
        htmlPreview: html.substring(0, 500)
      },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch stream URL',
        success: false 
      },
      { status: 500 }
    );
  }
}

