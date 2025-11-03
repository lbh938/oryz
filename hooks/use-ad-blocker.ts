'use client';

import { useEffect, useRef } from 'react';

/**
 * Bloqueur de publicités agressif comme Brave
 * Bloque les pubs sans perturber la diffusion vidéo
 */
export function useAdBlocker(isActive: boolean = true) {
  const blockedDomains = useRef<Set<string>>(new Set());
  const blockedElements = useRef<Set<HTMLElement>>(new Set());

  useEffect(() => {
    if (!isActive) return;

    // Liste étendue de domaines de publicités connus
    const adDomains = [
      // Google Ads
      'googleadservices.com',
      'googlesyndication.com',
      'googleads.g.doubleclick.net',
      'doubleclick.net',
      'adsafeprotected.com',
      
      // Facebook/Meta Ads
      'facebook.com/ads',
      'fbcdn.net/ads',
      'atdmt.com',
      
      // Amazon Ads
      'amazon-adsystem.com',
      'aax-us-east.amazon-adsystem.com',
      
      // Générique
      'advertising.com',
      'adserver.com',
      'adnxs.com',
      'adsrvr.org',
      'adtechus.com',
      'pubmatic.com',
      'openx.net',
      'rubiconproject.com',
      'indexexchange.com',
      'outbrain.com',
      'taboola.com',
      
      // Tracker/analytics qui servent aussi des pubs
      'scorecardresearch.com',
      'quantserve.com',
      'criteo.com',
      'moatads.com',
      
      // Pop-ups et redirects
      'popads.net',
      'popcash.net',
      'propellerads.com',
      'zeropark.com',
      
      // Malware/Spam
      'abmr.net',
      'adbrite.com',
      'adbutler.com',
      'adclick.com',
      'adform.com',
      'admeld.com',
      'admob.com',
      'adsafeprotected.com',
      'adsrvr.org',
      'adtechus.com',
      'advertising.com',
      'adzerk.net',
      'aerserv.com',
      'affiliate-network.com',
      'amazon-adsystem.com',
      'appnexus.com',
      'atdmt.com',
      'bidswitch.net',
      'brightroll.com',
      'buysellads.com',
      'casalemedia.com',
      'casale.media',
      'cdn.media.net',
      'contextweb.com',
      'conversantmedia.com',
      'criteo.com',
      'crwdcntrl.net',
      'doubleclick.net',
      'dotomi.com',
      'dyntrk.com',
      'federatedmedia.net',
      'feedads.com',
      'flurry.com',
      'googleadservices.com',
      'googlesyndication.com',
      'imrworldwide.com',
      'indexexchange.com',
      'integralads.com',
      'media.net',
      'mediaplex.com',
      'moatads.com',
      'mopub.com',
      'nexage.com',
      'openx.net',
      'outbrain.com',
      'pixel.quantserve.com',
      'pubmatic.com',
      'quantserve.com',
      'radiumone.com',
      'rightmedia.com',
      'rubiconproject.com',
      'scorecardresearch.com',
      'serving-sys.com',
      'sonobi.com',
      'spotxchange.com',
      'stickyadstv.com',
      'taboola.com',
      'tapad.com',
      'technoratimedia.com',
      'themig.com',
      'tremorhub.com',
      'turn.com',
      'undertone.com',
      'unrulymedia.com',
      'valueclick.com',
      'vertamedia.com',
      'videohub.tv',
      'xaxis.com',
      'yieldmanager.com',
      'zedo.com',
    ];

    // Patterns d'identifiants et classes suspectes (mais exclure "content-card", "channel-card", etc.)
    const adPatterns = [
      /^ad(s)?[_-]?[a-z0-9_-]*$/i, // Commence par "ad" et n'est pas "ad" dans un mot plus long
      /advertising/i,
      /advertisement/i,
      /adsense/i,
      /adsbygoogle/i,
      /^(?!.*(card|content|channel|movie)).*advert.*$/i, // "advert" mais pas dans un contexte de carte de contenu
      /^(?!.*(card|content|channel|movie)).*sponsor.*$/i, // "sponsor" mais pas dans un contexte de carte
      /^(?!.*(card|content|channel|movie)).*promo.*$/i, // "promo" mais pas dans un contexte de carte
      /^(?!.*(card|content|channel|movie)).*banner.*$/i, // "banner" mais pas dans un contexte de carte
      /popup/i,
      /pop-up/i,
      /popunder/i,
      /interstitial/i,
      /google_ads/i,
      /doubleclick/i,
      /googlesyndication/i,
      /facebook.*ad/i,
      /fb.*ad/i,
    ];

    // Bloqueur de requêtes fetch/XMLHttpRequest
    const originalFetch = window.fetch;
    window.fetch = function(...args: Parameters<typeof window.fetch>) {
      const url = args[0] as string;
      
      if (typeof url === 'string') {
        const urlObj = new URL(url, window.location.origin);
        const hostname = urlObj.hostname.toLowerCase();
        
        // Vérifier si c'est un domaine de pub
        const isAdDomain = adDomains.some(domain => 
          hostname === domain || hostname.endsWith('.' + domain)
        );
        
        if (isAdDomain) {
          console.warn('[Ad Blocker] Requête publicitaire bloquée:', url);
          blockedDomains.current.add(hostname);
          // Retourner une réponse vide pour ne pas perturber le flux
          return Promise.resolve(new Response('', { status: 204 }));
        }
      }
      
      return originalFetch.apply(window, args);
    };

    // Bloqueur XHR
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
      if (typeof url === 'string') {
        try {
          const urlObj = new URL(url, window.location.origin);
          const hostname = urlObj.hostname.toLowerCase();
          
          const isAdDomain = adDomains.some(domain => 
            hostname === domain || hostname.endsWith('.' + domain)
          );
          
          if (isAdDomain) {
            console.warn('[Ad Blocker] XHR publicitaire bloquée:', url);
            blockedDomains.current.add(hostname);
            // Empêcher l'envoi
            this.addEventListener = () => {};
            this.send = () => {};
            return;
          }
        } catch (e) {
          // URL invalide, continuer
        }
      }
      
      // Passer les arguments avec la valeur par défaut pour async (true)
      if (async !== undefined) {
        return originalXHROpen.call(this, method, url, async, username, password);
      } else {
        return originalXHROpen.call(this, method, url, true, username, password);
      }
    };

    // Observer pour bloquer les éléments DOM suspects
    // MAIS JAMAIS bloquer le contenu de l'application
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            
            // PROTECTION MAXIMALE : Ne JAMAIS bloquer le contenu de l'app
            // Vérifier IMMÉDIATEMENT si c'est dans une section, main, ou conteneur de l'app
            if (element.closest('section') || 
                element.closest('main') || 
                element.closest('[class*="container"]') ||
                element.closest('[data-hero]') ||
                element.closest('[data-hero-section]') ||
                element.closest('[data-slider]') ||
                element.closest('[data-channels]') ||
                element.closest('[data-channels-section]') ||
                element.closest('[data-live-matches]') ||
                element.closest('[data-recommended]') ||
                element.closest('[data-content-card]') ||
                element.closest('[class*="HeroSlider"]') ||
                element.closest('[class*="ChannelsSlider"]') ||
                element.closest('[class*="LiveMatches"]') ||
                element.closest('[class*="RecommendedChannels"]') ||
                element.closest('a[href*="/watch/"]') ||
                element.closest('a[href*="/category/"]')) {
              return; // IGNORER IMMÉDIATEMENT - Ne pas analyser plus loin
            }
            
            // Vérifier les patterns suspects
            const id = element.id || '';
            const className = element.className || '';
            const src = (element as HTMLImageElement).src || '';
            const tagName = element.tagName.toLowerCase();
            
            // Ne pas bloquer les éléments vidéo légitimes
            const isVideoElement = 
              tagName === 'video' ||
              tagName === 'audio' ||
              element.closest('[data-video-player]') ||
              element.closest('.video-player') ||
              element.closest('.vjs-player') ||
              element.closest('video-js') ||
              className.includes('video') ||
              className.includes('player') ||
              element.querySelector('video') ||
              element.querySelector('audio');
            
            const isSuspicious = 
              !isVideoElement &&
              // Vérifier les patterns suspects
              (adPatterns.some(pattern => 
                pattern.test(id) || 
                pattern.test(className) || 
                pattern.test(src)
              ) ||
              // Scripts suspects
              (tagName === 'script' && adPatterns.some(pattern => pattern.test(src))) ||
              // Iframes suspects (mais pas les players vidéo)
              (tagName === 'iframe' && adPatterns.some(pattern => pattern.test(src)) && 
               !src.includes('player') && 
               !src.includes('video') && 
               !src.includes('stream') &&
               !src.includes('embed')));
            
            if (isSuspicious && !blockedElements.current.has(element) && !isVideoElement) {
              console.warn('[Ad Blocker] Élément publicitaire détecté et bloqué:', {
                id,
                className,
                tagName
              });
              
              // Masquer et bloquer l'élément
              element.style.display = 'none';
              element.style.visibility = 'hidden';
              element.style.opacity = '0';
              element.style.height = '0';
              element.style.width = '0';
              element.style.overflow = 'hidden';
              
              // Empêcher l'exécution des scripts
              if (tagName === 'script') {
                element.remove();
              }
              
              // Empêcher TOUS les événements sur les éléments de pub (même les clics)
              if (element.addEventListener) {
                const originalAddEventListener = element.addEventListener.bind(element);
                element.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
                  // Bloquer TOUS les événements sur les pubs (même les clics)
                  // Ne pas permettre d'événements qui pourraient réactiver les pubs
                  return; // Bloquer tous les événements
                };
              }
              
              // Empêcher aussi les événements via onclick et autres attributs
              if (element.hasAttribute('onclick')) {
                element.removeAttribute('onclick');
              }
              if (element.hasAttribute('onload')) {
                element.removeAttribute('onload');
              }
              
              blockedElements.current.add(element);
            }
          }
        });
      });
    });

    // Observer les changements dans le DOM - ACTIVATION IMMÉDIATE pour bloquer les pubs dès leur apparition
    // Observer immédiatement, mais ignorer le contenu de l'app dans la logique
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id', 'class', 'src']
    });

    // Bloquer les scripts de pub déjà présents
    const blockExistingAds = () => {
      // Scripts Google Ads
      const scripts = document.querySelectorAll('script[src*="googlesyndication"], script[src*="googleadservices"], script[src*="doubleclick"], script[src*="ads"]');
      scripts.forEach((script) => {
        (script as HTMLElement).remove();
      });

      // Iframes de pub
      const iframes = document.querySelectorAll('iframe[src*="doubleclick"], iframe[src*="googlesyndication"], iframe[src*="ads"]');
      iframes.forEach((iframe) => {
        const iframeElement = iframe as HTMLElement;
        iframeElement.style.display = 'none';
        iframeElement.remove();
      });

      // Divs suspects - mais exclure les players vidéo, les cartes de contenu ET toutes les sections de l'app
      const suspiciousDivs = document.querySelectorAll('[id*="ad"]:not([id*="video"]):not([id*="player"]):not([id*="card"]), [class*="ad"]:not([class*="video"]):not([class*="player"]):not([class*="card"])');
      suspiciousDivs.forEach((div) => {
        // Ne pas bloquer les éléments vidéo ou les conteneurs vidéo
        const divElement = div as HTMLElement;
        const isVideoContainer = 
          divElement.querySelector('video') || 
          divElement.querySelector('audio') ||
          divElement.querySelector('iframe[src*="player"]') ||
          divElement.querySelector('iframe[src*="video"]') ||
          divElement.querySelector('iframe[src*="stream"]') ||
          divElement.querySelector('iframe[src*="embed"]') ||
          divElement.closest('[data-video]') ||
          divElement.closest('.video-player') ||
          divElement.closest('.vjs-player') ||
          divElement.closest('video-js');
        
        // Ne JAMAIS bloquer si c'est dans une section de l'app
        const isAppContent = 
          divElement.closest('section') ||
          divElement.closest('main') ||
          divElement.closest('[class*="container"]') ||
          divElement.closest('[data-hero]') ||
          divElement.closest('[data-hero-section]') ||
          divElement.closest('[data-slider]') ||
          divElement.closest('[data-channels]') ||
          divElement.closest('[data-channels-section]') ||
          divElement.closest('[data-live-matches]') ||
          divElement.closest('[data-recommended]') ||
          divElement.closest('[data-content-card]') ||
          divElement.closest('.content-card') ||
          divElement.closest('[class*="Card"]') ||
          divElement.closest('[class*="HeroSlider"]') ||
          divElement.closest('[class*="ChannelsSlider"]') ||
          divElement.closest('[class*="LiveMatches"]') ||
          divElement.closest('[class*="RecommendedChannels"]') ||
          divElement.closest('a[href*="/watch/"]') ||
          divElement.closest('a[href*="/category/"]') ||
          divElement.closest('[data-channel]') ||
          divElement.closest('[data-movie]') ||
          divElement.closest('[data-content]');
        
        if (!isVideoContainer && !isAppContent) {
          divElement.style.display = 'none';
          blockedElements.current.add(divElement);
        }
      });
    };

    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    // Bloquer les pubs existantes immédiatement - et périodiquement après
    blockExistingAds();
    // Bloquer périodiquement les nouvelles pubs (plus fréquent pour être plus agressif)
    intervalId = setInterval(blockExistingAds, 1000); // Vérifier toutes les secondes

    // Cleanup
    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
      observer.disconnect();
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      blockedDomains.current.clear();
      blockedElements.current.clear();
    };
  }, [isActive]);
}

/**
 * Fonction utilitaire pour vérifier si une URL est une publicité
 */
export function isAdUrl(url: string): boolean {
  const adDomains = [
    'googleadservices.com',
    'googlesyndication.com',
    'doubleclick.net',
    'facebook.com/ads',
    'amazon-adsystem.com',
    // ... autres domaines
  ];
  
  try {
    const urlObj = new URL(url, window.location.origin);
    return adDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

