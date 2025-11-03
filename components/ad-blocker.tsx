'use client';

import { useEffect } from 'react';
import { useAdBlocker } from '@/hooks/use-ad-blocker';

/**
 * Composant global pour activer le bloqueur de publicités
 * Comme Brave - agressif mais ne perturbe pas la diffusion vidéo
 */
export function AdBlocker() {
  // Activer le bloqueur de publicités sur toute l'application
  useAdBlocker(true);

  return null;
}

