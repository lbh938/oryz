import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  // Décoder l'URL
  let decodedUrl = decodeURIComponent(url);
  
  // Essayer /embed/ si l'URL utilise /iframe/
  if (decodedUrl.includes('/iframe/')) {
    decodedUrl = decodedUrl.replace('/iframe/', '/embed/');
  }

  try {
    console.log('Proxying ShareCloudy URL:', decodedUrl);

    // Récupérer le contenu de l'iframe avec timeout pour PWA
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 secondes max pour PWA
    
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Referer': 'https://sharecloudy.com/',
        'Origin': 'https://sharecloudy.com',
        'Sec-Fetch-Dest': 'iframe',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    let html = await response.text();
    const baseUrl = new URL(decodedUrl).origin;

    // Nettoyer les entêtes X-Frame-Options et CSP qui bloquent l'embed
    html = html.replace(/X-Frame-Options[^;]*;?/gi, '');
    html = html.replace(/Content-Security-Policy[^;]*;?/gi, '');
    html = html.replace(/frame-ancestors[^;]*;?/gi, '');

    // Corriger les URLs relatives vers absolues
    html = html.replace(/src="\//g, `src="${baseUrl}/`);
    html = html.replace(/href="\//g, `href="${baseUrl}/`);
    
    // Corriger les URLs de scripts et autres ressources
    html = html.replace(/src="([^"]*\.js[^"]*)"/g, (match, url) => {
      if (url.startsWith('http')) return match;
      return `src="${baseUrl}${url.startsWith('/') ? url : '/' + url}"`;
    });

    // Retourner le HTML avec les bons headers optimisés pour PWA
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "frame-ancestors *;",
        // Headers PWA : ne pas mettre en cache pour avoir toujours du contenu frais
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        // Headers pour permettre l'embed en PWA
        'X-Frame-Options': 'ALLOWALL',
        'X-Content-Type-Options': 'nosniff',
        // Headers pour améliorer la compatibilité PWA
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error proxying ShareCloudy:', error);
    
    // En cas d'erreur, retourner un HTML minimal pour PWA
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShareCloudy Player</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #000; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      color: #fff; 
      font-family: Arial, sans-serif;
    }
    .error { text-align: center; padding: 20px; }
  </style>
</head>
<body>
  <div class="error">
    <p>Erreur de chargement du lecteur</p>
    <p style="font-size: 0.8em; margin-top: 10px; opacity: 0.7;">${error instanceof Error ? error.message : 'Erreur inconnue'}</p>
  </div>
</body>
</html>`;
    
    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
}

