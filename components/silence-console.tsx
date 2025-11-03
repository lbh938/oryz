'use client';

import { useEffect } from 'react';
import { silenceThirdPartyLogs } from '@/lib/silence-logs';

/**
 * Composant pour désactiver les logs de console des scripts tiers
 */
export function SilenceConsole() {
  useEffect(() => {
    silenceThirdPartyLogs();
  }, []);

  return null;
}

