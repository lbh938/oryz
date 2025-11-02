'use client';

import { useEffect } from 'react';

/**
 * Bloqueur de pub INTELLIGENT pour bloquer les pop-ups et redirections
 * Optimisé pour éviter les saccades et les faux positifs
 */
export function PopupBlocker() {
  useEffect(() => {
    // Liste des domaines autorisés pour les pop-ups légitimes
    const allowedDomains = [
      window.location.hostname,
      'twitter.com',
      'facebook.com',
      'whatsapp.com',
      'telegram.org',
      'movix.club', // Omega player
      'api.movix.club', // API Omega
    ];

    // Intercepter window.open de manière intelligente
    const originalWindowOpen = window.open;
    const openWindows: Window[] = [];

    window.open = function(url?: string | URL, target?: string, features?: string) {
      const urlString = url?.toString() || '';

      // Patterns suspectes pour détecter les pop-ups de pub
      const suspiciousPatterns = [
        // Publicités
        /ad[s]?[0-9]*\./i,
        /doubleclick/i,
        /googleadservices/i,
        /googlesyndication/i,
        /adsafeprotected/i,
        /adserver/i,
        /advertising/i,
        // Pop-ups et redirections
        /popup/i,
        /pop-under/i,
        /redirect/i,
        // Téléchargements suspects
        /\.exe$/i,
        /\.zip$/i,
        /download.*\.(exe|zip|msi)/i,
        // Offres suspectes
        /offer|promo|bonus|win|prize/i,
      ];

      // Vérifier si c'est suspect
      const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(urlString));

      // Vérifier si c'est autorisé
      const isAllowed = urlString && allowedDomains.some(domain => urlString.includes(domain));

      // Bloquer uniquement les pop-ups suspectes
      if (isSuspicious && !isAllowed) {
        console.log('🚫 Pop-up suspecte bloquée:', urlString);
        return null;
      }

      // Autoriser les pop-ups légitimes
      const result = originalWindowOpen.call(window, url, target, features);
      if (result) {
        openWindows.push(result);
      }
      return result;
    };

    // Bloquer les redirections suspectes de manière intelligente
    let userInitiatedNavigation = false;

    // Détecter les clics utilisateur légitimes
    const clickListener = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      if (link && (e as MouseEvent).isTrusted) {
        userInitiatedNavigation = true;
        setTimeout(() => {
          userInitiatedNavigation = false;
        }, 100);
      }
    };

    document.addEventListener('click', clickListener, true);

    // Surveiller les changements de location (redirections automatiques)
    let currentLocation = window.location.href;
    const locationCheckInterval = setInterval(() => {
      if (!userInitiatedNavigation && window.location.href !== currentLocation) {
        const newLocation = window.location.href;
        
        // Vérifier si la redirection est suspecte
        const suspiciousRedirectPatterns = [
          /ad[s]?[0-9]*\./i,
          /popup/i,
          /redirect/i,
          /offer|promo|bonus/i,
          /download.*\.(exe|zip|msi)/i,
        ];

        const isSuspiciousRedirect = suspiciousRedirectPatterns.some(pattern =>
          pattern.test(newLocation)
        );

        if (isSuspiciousRedirect) {
          console.log('🚫 Redirection suspecte bloquée:', newLocation);
          window.history.back();
          return;
        }

        currentLocation = newLocation;
      }
    }, 500);

    // Bloquer les meta refresh suspectes
    const metaObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node as HTMLElement;
            if (element.tagName === 'META' && element.getAttribute('http-equiv') === 'refresh') {
              const content = element.getAttribute('content') || '';
              // Bloquer uniquement les meta refresh avec redirections suspectes
              if (/url=.*(ad|popup|redirect|offer|promo)/i.test(content)) {
                element.remove();
                console.log('🚫 Meta refresh suspecte supprimée');
              }
            }
          }
        });
      });
    });

    metaObserver.observe(document.head, {
      childList: true,
      subtree: true,
    });

    // Protection intelligente pour les iframes (spécialement Omega player)
    const protectIframes = () => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        try {
          const iframeSrc = (iframe as HTMLIFrameElement).src || '';
          const isOmegaIframe = iframeSrc.includes('api.movix.club/api/omega') ||
                                iframeSrc.includes('/api/proxy/omega') ||
                                iframeSrc.includes('omega');

          // Pour Omega player, on bloque uniquement window.open si accessible
          if (iframe.contentWindow && isOmegaIframe) {
            try {
              const iframeWindow = iframe.contentWindow as any;
              if (iframeWindow.open && typeof iframeWindow.open === 'function') {
                const originalIframeOpen = iframeWindow.open;
                iframeWindow.open = function(...args: any[]) {
                  const urlString = args[0]?.toString() || '';
                  
                  // Bloquer uniquement les pop-ups suspectes
                  const suspiciousPatterns = [
                    /ad[s]?[0-9]*\./i,
                    /doubleclick/i,
                    /googleadservices/i,
                    /popup/i,
                    /redirect/i,
                    /\.exe$/i,
                    /offer|promo|bonus/i,
                  ];

                  if (suspiciousPatterns.some(pattern => pattern.test(urlString))) {
                    console.log('🚫 Pop-up suspecte depuis Omega player bloquée:', urlString);
                    return null;
                  }

                  // Autoriser les pop-ups légitimes
                  return originalIframeOpen.call(this, ...args);
                };
              }
            } catch (e) {
              // CORS normal pour iframes cross-origin
            }
          }
        } catch (e) {
          // Erreur normale (CORS)
        }
      });
    };

    // Protéger les iframes existantes
    protectIframes();

    // Observer les nouveaux iframes (avec debounce pour éviter les saccades)
    let protectIframesTimeout: NodeJS.Timeout | null = null;
    const iframeObserver = new MutationObserver(() => {
      if (protectIframesTimeout) {
        clearTimeout(protectIframesTimeout);
      }
      protectIframesTimeout = setTimeout(() => {
        protectIframes();
      }, 300);
    });

    iframeObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Nettoyer les fenêtres ouvertes suspectes périodiquement (pas trop fréquent)
    const cleanupInterval = setInterval(() => {
      openWindows.forEach((win, index) => {
        try {
          if (win.closed) {
            openWindows.splice(index, 1);
            return;
          }

          // Vérifier uniquement les fenêtres accessibles
          try {
            const href = win.location.href;
            const suspiciousPatterns = [
              /ad[s]?[0-9]*\./i,
              /popup/i,
              /redirect/i,
              /offer|promo|bonus/i,
            ];

            if (suspiciousPatterns.some(pattern => pattern.test(href))) {
              win.close();
              openWindows.splice(index, 1);
              console.log('🚫 Fenêtre suspecte fermée:', href);
            }
          } catch (e) {
            // CORS - ne pas fermer automatiquement (évite les faux positifs)
          }
        } catch (e) {
          // Fenêtre inaccessible
        }
      });
    }, 2000); // Vérifier toutes les 2 secondes (pas trop fréquent)

    // Nettoyage
    return () => {
      clearInterval(locationCheckInterval);
      clearInterval(cleanupInterval);
      if (protectIframesTimeout) {
        clearTimeout(protectIframesTimeout);
      }
      window.open = originalWindowOpen;
      document.removeEventListener('click', clickListener, true);
      metaObserver.disconnect();
      iframeObserver.disconnect();
      // Fermer les fenêtres ouvertes suspectes
      openWindows.forEach(win => {
        try {
          if (!win.closed) {
            win.close();
          }
        } catch (e) {
          // Erreur normale
        }
      });
    };
  }, []);

  return null; // Composant invisible
}