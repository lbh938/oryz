'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook pour bloquer les pop-ups et les ouvertures involontaires de pages
 * Utilisé pendant la lecture vidéo pour protéger l'utilisateur
 */
export function usePopupBlocker(isActive: boolean = true) {
  const blockedPopups = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isActive) return;

    // Bloquer window.open
    const originalWindowOpen = window.open;
    window.open = function(...args: Parameters<typeof window.open>) {
      const url = args[0] as string;
      
      // Vérifier si c'est une pop-up déjà bloquée
      if (url && blockedPopups.current.has(url)) {
        console.warn('[Popup Blocker] Pop-up déjà bloquée:', url);
        return null;
      }

      // Autoriser seulement les URLs de notre domaine
      try {
        if (url) {
          const urlObj = new URL(url, window.location.origin);
          const currentOrigin = new URL(window.location.origin);
          
          // Autoriser les URLs du même domaine
          if (urlObj.origin === currentOrigin.origin) {
            console.log('[Popup Blocker] Autorisation pop-up interne:', url);
            blockedPopups.current.add(url);
            return originalWindowOpen.apply(window, args);
          }
          
          // Bloquer les URLs suspectes (publicité, trackers, etc.)
          const suspiciousPatterns = [
            /doubleclick|googleads|googlesyndication|adsense|adservice|advertising/i,
            /popup|redirect|advert|sponsor/i,
            /click|track|analytics|pixel/i
          ];
          
          if (suspiciousPatterns.some(pattern => pattern.test(urlObj.hostname) || pattern.test(urlObj.pathname))) {
            console.warn('[Popup Blocker] Pop-up suspecte bloquée:', url);
            blockedPopups.current.add(url);
            showBlockedNotification();
            return null;
          }
        }
      } catch (e) {
        // Si l'URL est invalide, bloquer
      }

      // Bloquer TOUTES les pop-ups externes pendant la lecture vidéo
      // Même si l'utilisateur clique, on bloque toujours les pop-ups externes
      console.warn('[Popup Blocker] Pop-up externe bloquée:', url);
      blockedPopups.current.add(url || 'unknown');
      
      // Afficher une notification discrète à l'utilisateur
      showBlockedNotification();
      
      // TOUJOURS bloquer, même après un clic utilisateur
      return null;
    };

    // Bloquer window.open dans les iframes - RENFORCÉ pour fonctionner même sans sandbox
    const handleIframeMessage = (event: MessageEvent) => {
      // Vérifier l'origine du message
      try {
        // Bloquer les messages qui tentent d'ouvrir des fenêtres
        if (event.data && (
          (typeof event.data === 'object' && (
            event.data.type === 'openWindow' ||
            event.data.action === 'open' ||
            event.data.method === 'open' ||
            event.data.command === 'open'
          )) ||
          (typeof event.data === 'string' && (
            event.data.includes('window.open') ||
            event.data.includes('openWindow') ||
            event.data.includes('popup') ||
            event.data.includes('target=_blank')
          ))
        )) {
          console.warn('[Popup Blocker] Tentative d\'ouverture bloquée depuis iframe:', event.origin, event.data);
          event.stopPropagation();
          event.preventDefault();
          return false;
        }

        // Bloquer les redirections suspectes depuis les iframes
        if (event.data && typeof event.data === 'object' && (
          event.data.type === 'redirect' ||
          event.data.action === 'redirect' ||
          event.data.method === 'redirect' ||
          (event.data.url && !event.data.url.includes(window.location.origin) && (
            event.data.url.includes('ad') ||
            event.data.url.includes('popup') ||
            event.data.url.includes('click')
          ))
        )) {
          console.warn('[Popup Blocker] Redirection suspecte bloquée depuis iframe:', event.data);
          event.stopPropagation();
          return false;
        }
      } catch (e) {
        // Ignorer les erreurs
      }
    };

    // Utiliser capture phase pour intercepter tôt
    window.addEventListener('message', handleIframeMessage, true);

    // Bloquer les clics sur les liens qui ouvrent de nouvelles fenêtres
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Vérifier si c'est un lien qui ouvre une nouvelle fenêtre
      const link = target.closest('a[target="_blank"]');
      if (link && !link.hasAttribute('data-allowed')) {
        const href = (link as HTMLAnchorElement).href;
        
        // Vérifier si c'est une URL externe suspecte
        try {
          const linkUrl = new URL(href);
          const currentUrl = new URL(window.location.href);
          
          // Bloquer si c'est un domaine différent
          if (linkUrl.origin !== currentUrl.origin && !isAllowedDomain(linkUrl.hostname)) {
            console.warn('[Popup Blocker] Lien externe bloqué:', href);
            e.preventDefault();
            e.stopPropagation();
            showBlockedNotification();
            return false;
          }
            } catch (e) {
              // Bloquer si l'URL est invalide
              if (e instanceof Event) {
                e.preventDefault();
                e.stopPropagation();
              }
            }
      }
    };

    // Ajouter un listener avec capture pour intercepter tôt
    document.addEventListener('click', handleClick, true);

    // Blocage de beforeunload suspect (tentative de redirection)
    let isUserAction = false;
    const handleUserAction = () => {
      isUserAction = true;
      setTimeout(() => { isUserAction = false; }, 1000);
    };

    ['mousedown', 'keydown', 'touchstart'].forEach(event => {
      document.addEventListener(event, handleUserAction, true);
    });

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Ne bloquer que si ce n'est pas une action utilisateur
      if (!isUserAction) {
        // Permettre la navigation seulement si c'est l'utilisateur qui le demande
        // Mais bloquer les redirections automatiques
        console.log('[Popup Blocker] Tentative de navigation détectée');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.open = originalWindowOpen;
      window.removeEventListener('message', handleIframeMessage);
      document.removeEventListener('click', handleClick, true);
      ['mousedown', 'keydown', 'touchstart'].forEach(event => {
        document.removeEventListener(event, handleUserAction, true);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      blockedPopups.current.clear();
    };
  }, [isActive]);
}

/**
 * Domaines autorisés pour les liens externes (optionnel)
 */
function isAllowedDomain(hostname: string): boolean {
  const allowedDomains = [
    'localhost',
    '127.0.0.1',
    // Ajoutez ici les domaines de confiance si nécessaire
  ];
  
  return allowedDomains.some(domain => hostname.includes(domain));
}

/**
 * Affiche une notification discrète que quelque chose a été bloqué
 */
function showBlockedNotification() {
  // Éviter les doublons - vérifier si une notification existe déjà
  const existingNotification = document.querySelector('[data-popup-blocker-notification]');
  if (existingNotification) {
    return;
  }

  // Créer une notification toast discrète avec glass morphism
  const notification = document.createElement('div');
  notification.setAttribute('data-popup-blocker-notification', 'true');
  notification.className = 'fixed bottom-4 right-4 bg-white/10 backdrop-blur-2xl border border-white/20 text-white px-4 py-3 rounded-xl shadow-2xl shadow-[#3498DB]/30 z-[9999] text-sm font-label flex items-center gap-2';
  notification.innerHTML = '<span class="text-lg">🔒</span><span>Pop-up bloquée - Protection active</span>';
  
  // Styles pour l'animation
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(20px)';
  notification.style.transition = 'all 0.3s ease-out';
  
  document.body.appendChild(notification);
  
  // Animer l'apparition
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Supprimer après 3 secondes avec animation
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
