import { NextRequest, NextResponse } from 'next/server';

/**
 * API de vérification de preview - DÉSACTIVÉE
 * Système de blocage supprimé - Accès libre pour tous
 */
export async function POST(request: NextRequest) {
  // Toujours autoriser l'accès
  return NextResponse.json({
    canUse: true,
    reason: 'Accès libre',
    trustScore: 1.0,
    isVPN: false,
    isProxy: false,
    isTor: false,
    remainingMs: null,
  });
}

