import { NextRequest, NextResponse } from 'next/server';

/**
 * API pour nettoyer le HTML des iframes et bloquer les scripts malveillants
 * Utilisé pour filtrer le contenu avant de l'afficher dans une iframe
 */
export async function POST(request: NextRequest) {
  try {
    const { html, url } = await request.json();

    if (!html || !url) {
      return new NextResponse('HTML and URL are required', { status: 400 });
    }

    let cleanedHtml = html;

    // Supprimer les scripts de pop-ups
    cleanedHtml = cleanedHtml.replace(
      /<script[^>]*>[\s\S]*?(?:window\.open|popup|advertisement|ads)[\s\S]*?<\/script>/gi,
      ''
    );

    // Supprimer les event listeners suspectes (onload, onclick avec window.open)
    cleanedHtml = cleanedHtml.replace(
      /on(load|click|mouseover|focus)\s*=\s*["']?[^"']*(?:window\.open|popup|ad)[^"']*["']?/gi,
      ''
    );

    // Supprimer les balises <a> avec des href suspects vers des publicités
    cleanedHtml = cleanedHtml.replace(
      /<a[^>]*href\s*=\s*["'][^"']*(?:ad|ads|advertisement|popup|click|offer)[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,
      ''
    );

    // Bloquer les redirections automatiques
    cleanedHtml = cleanedHtml.replace(
      /window\.location\s*=\s*["']([^"']*(?:ad|popup|download)[^"']*)["']/gi,
      '// Bloqué: $1'
    );

    // Bloquer les setTimeout/setInterval avec window.open
    cleanedHtml = cleanedHtml.replace(
      /(setTimeout|setInterval)\s*\(\s*function[^}]*window\.open[^}]*\}/gi,
      '// Bloqué'
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
    if (!cleanedHtml.includes('<head')) {
      cleanedHtml = `<head>${cspMeta}</head>${cleanedHtml}`;
    } else {
      cleanedHtml = cleanedHtml.replace(
        /<head[^>]*>/i,
        `$&${cspMeta}`
      );
    }

    return new NextResponse(cleanedHtml, {
      headers: {
        'Content-Type': 'text/html',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        // Headers PWA : ne pas mettre en cache
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error cleaning HTML:', error);
    return new NextResponse('Error processing HTML', { status: 500 });
  }
}

