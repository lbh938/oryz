import { NextRequest, NextResponse } from 'next/server';

/**
 * API proxy pour Omega player
 * Utilisé pour Supervideo via Omega player
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

  // Utiliser directement l'URL fournie (sans API externe movix)
  try {
    // Récupérer la page depuis l'URL fournie
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': url,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      // Si l'API Omega ne fonctionne pas, retourner un HTML simple avec iframe
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Omega Player</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; overflow: hidden; }
    #player-container { width: 100%; height: 100vh; position: relative; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <div id="player-container">
    <iframe 
      src="${url}" 
      allowfullscreen 
      frameborder="0" 
      scrolling="no"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
</body>
</html>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    }

    // Injecter une protection intelligente minimale
    const html = await response.text();
    
    // Injection minimale et ciblée uniquement pour bloquer les pop-ups de pub
    let protectedHtml = html;
    
    if (protectedHtml.includes('</head>')) {
      protectedHtml = protectedHtml.replace(
        '</head>',
        `<script>
          (function() {
            'use strict';
            // Protection INTELLIGENTE : bloquer uniquement les pop-ups suspectes
            const originalOpen = window.open;
            const allowedDomains = [window.location.hostname];
            
            window.open = function(url, target, features) {
              const urlString = url?.toString() || '';
              
              // Patterns suspectes pour les pubs
              const suspiciousPatterns = [
                /ad[s]?[0-9]*\./i,
                /doubleclick/i,
                /googleadservices/i,
                /googlesyndication/i,
                /popup/i,
                /redirect/i,
                /\.exe$/i,
                /offer|promo|bonus/i,
              ];
              
              const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(urlString));
              const isAllowed = urlString && allowedDomains.some(domain => urlString.includes(domain));
              
              // Bloquer uniquement les pop-ups suspectes
              if (isSuspicious && !isAllowed) {
                console.log('🚫 Pop-up suspecte bloquée (Omega):', urlString);
                return null;
              }
              
              // Autoriser les pop-ups légitimes
              return originalOpen.call(window, url, target, features);
            };
          })();
        </script>
        </head>`
      );
    }
    
    return new NextResponse(protectedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
  } catch (error: any) {
    console.error('❌ Erreur proxy Omega:', error);
    
    // Fallback : retourner un HTML simple avec iframe
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Omega Player</title>
  <style>body { margin: 0; padding: 0; } iframe { width: 100%; height: 100vh; border: none; }</style>
</head>
<body>
  <iframe src="${url}" allowfullscreen frameborder="0"></iframe>
</body>
</html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }
}
