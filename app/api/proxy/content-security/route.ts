import { NextRequest, NextResponse } from 'next/server';

/**
 * API pour nettoyer le HTML des iframes et bloquer les scripts malveillants
 */
export async function POST(request: NextRequest) {
  try {
    const { html, url } = await request.json();

    if (!html || !url) {
      return new NextResponse('HTML and URL are required', { status: 400 });
    }

    let cleanedHtml = html;

    // Supprimer les scripts de téléchargement automatique
    cleanedHtml = cleanedHtml.replace(
      /<script[^>]*>[\s\S]*?(?:download|\.exe|\.zip|\.rar|window\.open)[\s\S]*?<\/script>/gi,
      ''
    );

    // Supprimer les event listeners suspectes
    cleanedHtml = cleanedHtml.replace(
      /onload\s*=\s*["']?[\s\S]*?(?:download|\.exe|window\.open)[\s\S]*?["']?/gi,
      ''
    );

    // Bloquer les redirections automatiques suspectes
    cleanedHtml = cleanedHtml.replace(
      /window\.location\s*=\s*["']([^"']*(?:download|\.exe|\.zip)[^"']*)["']/gi,
      '// Bloqué: $1'
    );

    // Ajouter Content-Security-Policy restrictive
    const cspMeta = `
      <meta http-equiv="Content-Security-Policy" content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' https:;
        media-src 'self' https:;
        frame-src 'self' https:;
        frame-ancestors 'self';
        base-uri 'self';
        form-action 'self';
      ">
    `;

    // Injecter la CSP dans le head
    cleanedHtml = cleanedHtml.replace(
      /<head[^>]*>/i,
      `$&${cspMeta}`
    );

    return new NextResponse(cleanedHtml, {
      headers: {
        'Content-Type': 'text/html',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
      }
    });
  } catch (error) {
    console.error('Error cleaning HTML:', error);
    return new NextResponse('Error processing HTML', { status: 500 });
  }
}

