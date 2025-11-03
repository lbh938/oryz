/**
 * Script pour désactiver les logs de console des scripts tiers en production
 */
export function silenceThirdPartyLogs() {
  if (typeof window === 'undefined') return;

  // En production, désactiver les logs verbeux
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Toujours activer pour filtrer les logs verbeux (peut être désactivé en dev si nécessaire)
  // if (!isProduction) return;

  // Sauvegarder les fonctions originales
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  const originalConsoleDebug = console.debug;
  const originalConsoleWarn = console.warn;

  // Patterns de filtrage pour les logs indésirables
  const filterPatterns = [
    // Browser detection
    /Browser detection/i,
    /Safari.*false/i,
    /Firefox.*false/i,
    /localStorage available/i,
    // Loading states
    /Loading states changed/i,
    /États de chargement/i,
    /Chargements en cours/i,
    /popup ads/i,
    // Video extraction
    /FStream/i,
    /Wiflix/i,
    /Supervideo/i,
    /VOE/i,
    /M3U8/i,
    /extraction/i,
    /HLSPlayer/i,
    /sourceGroups/i,
    /embedSources/i,
    // Alerts
    /Checking alerts/i,
    /Alerts to show/i,
    /Should run check/i,
    // Other
    /ScrollToTop/i,
    /Frembed/i,
    /watch route/i,
  ];

  // Fonction pour vérifier si un log doit être filtré
  const shouldFilter = (...args: any[]): boolean => {
    const message = args.join(' ').toLowerCase();
    return filterPatterns.some(pattern => pattern.test(message));
  };

  // Remplacer console.log
  console.log = function(...args: any[]) {
    if (!shouldFilter(...args)) {
      originalConsoleLog.apply(console, args);
    }
  };

  // Remplacer console.info
  console.info = function(...args: any[]) {
    if (!shouldFilter(...args)) {
      originalConsoleInfo.apply(console, args);
    }
  };

  // Remplacer console.debug
  console.debug = function(...args: any[]) {
    if (!shouldFilter(...args)) {
      originalConsoleDebug.apply(console, args);
    }
  };

  // Remplacer console.warn (garder seulement les warnings importants)
  console.warn = function(...args: any[]) {
    // Filtrer les warnings répétitifs mais garder les erreurs importantes
    const message = args.join(' ').toLowerCase();
    if (!message.includes('autoplay') && !message.includes('failed to load')) {
      if (!shouldFilter(...args)) {
        originalConsoleWarn.apply(console, args);
      }
    }
  };
}

