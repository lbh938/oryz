import { NextResponse } from 'next/server';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Gestionnaire d'erreurs pour les API routes
 * Fournit une gestion d'erreur cohérente et structurée
 */

export interface ApiErrorContext {
  route?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Gère les erreurs d'API de manière cohérente
 */
export function handleApiError(
  error: unknown,
  context?: ApiErrorContext
): NextResponse {
  const timestamp = new Date().toISOString();
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Log structuré de l'erreur
  console.error(`[API Error ${errorId}]`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp,
  });

  // Gestion des erreurs Supabase
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as PostgrestError;
    return NextResponse.json(
      {
        error: 'Database error',
        message: supabaseError.message,
        details: supabaseError.details,
        hint: supabaseError.hint,
        code: supabaseError.code,
        errorId,
        timestamp,
      },
      { status: 500 }
    );
  }

  // Gestion des erreurs standard
  if (error instanceof Error) {
    // Erreurs de validation
    if (error.message.includes('required') || error.message.includes('invalid')) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: error.message,
          errorId,
          timestamp,
        },
        { status: 400 }
      );
    }

    // Erreurs d'authentification
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return NextResponse.json(
        {
          error: 'Authentication error',
          message: error.message,
          errorId,
          timestamp,
        },
        { status: 401 }
      );
    }

    // Erreurs de permission
    if (error.message.includes('permission') || error.message.includes('forbidden')) {
      return NextResponse.json(
        {
          error: 'Permission denied',
          message: error.message,
          errorId,
          timestamp,
        },
        { status: 403 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
        errorId,
        timestamp,
      },
      { status: 500 }
    );
  }

  // Erreur inconnue
  return NextResponse.json(
    {
      error: 'Unknown error',
      errorId,
      timestamp,
    },
    { status: 500 }
  );
}

/**
 * Gère spécifiquement les erreurs Supabase
 */
export function handleSupabaseError(
  error: PostgrestError | null,
  context?: ApiErrorContext
): NextResponse | null {
  if (!error) return null;

  const timestamp = new Date().toISOString();
  const errorId = `supabase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.error(`[Supabase Error ${errorId}]`, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
    context,
    timestamp,
  });

  // Codes d'erreur spécifiques
  if (error.code === 'PGRST116') {
    // Aucun résultat trouvé
    return NextResponse.json(
      {
        error: 'Not found',
        message: error.message,
        errorId,
        timestamp,
      },
      { status: 404 }
    );
  }

  if (error.code === '23505') {
    // Violation de contrainte unique
    return NextResponse.json(
      {
        error: 'Duplicate entry',
        message: error.message,
        details: error.details,
        errorId,
        timestamp,
      },
      { status: 409 }
    );
  }

  if (error.code === '23503') {
    // Violation de clé étrangère
    return NextResponse.json(
      {
        error: 'Foreign key violation',
        message: error.message,
        details: error.details,
        errorId,
        timestamp,
      },
      { status: 400 }
    );
  }

  // Erreur générique Supabase
  return NextResponse.json(
    {
      error: 'Database error',
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      errorId,
      timestamp,
    },
    { status: 500 }
  );
}

