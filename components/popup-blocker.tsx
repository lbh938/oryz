'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

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
    ];

    // Vérifier si on est dans une iframe (ne pas bloquer si on est dans une iframe)
    const isInIframe = window.self !== window.top;
    
    // Intercepter window.open de manière intelligente (seulement si pas dans une iframe)
    const originalWindowOpen = window.open;
    const openWindows: Window[] = [];

    // Ne pas intercepter window.open si on est dans une iframe
    if (!isInIframe) {
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
          logger.debug('🚫 Pop-up suspecte bloquée:', urlString);
          return null;
        }

        // Autoriser les pop-ups légitimes
        const result = originalWindowOpen.call(window, url, target, features);
        if (result) {
          openWindows.push(result);
        }
        return result;
      };
    }

    // Bloquer les redirections suspectes de manière intelligente (seulement si pas dans une iframe)
    let userInitiatedNavigation = false;
    let locationCheckInterval: NodeJS.Timeout | null = null;
    let clickListener: ((e: Event) => void) | null = null;

    // Ne pas surveiller les redirections si on est dans une iframe
    if (!isInIframe) {
      // Détecter les clics utilisateur légitimes
      clickListener = (e: Event) => {
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
      locationCheckInterval = setInterval(() => {
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
            logger.debug('🚫 Redirection suspecte bloquée:', newLocation);
            window.history.back();
            return;
          }

          currentLocation = newLocation;
        }
      }, 500);
    }

    // Bloquer les meta refresh suspectes (seulement si pas dans une iframe)
    let metaObserver: MutationObserver | null = null;
    if (!isInIframe) {
      metaObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const element = node as HTMLElement;
              if (element.tagName === 'META' && element.getAttribute('http-equiv') === 'refresh') {
                const content = element.getAttribute('content') || '';
                // Bloquer uniquement les meta refresh avec redirections suspectes
                if (/url=.*(ad|popup|redirect|offer|promo)/i.test(content)) {
                  element.remove();
                  logger.debug('🚫 Meta refresh suspecte supprimée');
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
    }

    // NE PAS modifier les iframes - les laisser fonctionner normalement
    // Les iframes doivent être libres de fonctionner sans interférence du bloqueur de pub

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
              logger.debug('🚫 Fenêtre suspecte fermée:', href);
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
      if (locationCheckInterval) {
        clearInterval(locationCheckInterval);
      }
      clearInterval(cleanupInterval);
      if (!isInIframe) {
        window.open = originalWindowOpen;
        if (metaObserver) {
          metaObserver.disconnect();
        }
        if (clickListener) {
          document.removeEventListener('click', clickListener, true);
        }
      }
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