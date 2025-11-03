'use client';

import { useEffect, useState } from 'react';
import { useAdBlocker } from '@/hooks/use-ad-blocker';
import { usePathname } from 'next/navigation';

/**
 * Composant global pour activer le bloqueur de publicités
 * Comme Brave - agressif mais ne perturbe pas la diffusion vidéo
 * DÉSACTIVÉ sur la page d'accueil pour éviter de bloquer le contenu légitime
 */
export function AdBlocker() {
  const pathname = usePathname();
  
  // Désactiver le bloqueur sur la page d'accueil et les pages de catégories
  // pour éviter de bloquer le hero, channels, films, séries, etc.
  // Activer seulement sur les pages de visionnage où on veut vraiment bloquer les pubs
  const shouldBlock = pathname?.startsWith('/watch');
  
  useAdBlocker(shouldBlock || false); // Désactiver pour l'instant sur toutes les pages

  return null;
}

