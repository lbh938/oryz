/**
 * Validation des variables d'environnement requises
 * Appeler cette fonction au démarrage de l'application
 */

export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const optionalButRecommended = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY', // Recommandé pour les opérations admin, mais pas strictement requis
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file.`
    );
  }

  const missingRecommended = optionalButRecommended.filter(key => !process.env[key]);
  if (missingRecommended.length > 0) {
    console.warn(
      `⚠️  Missing recommended environment variables: ${missingRecommended.join(', ')}\n` +
      `Some features may not work correctly.`
    );
  }

  // Validation spécifique pour les routes Stripe
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    throw new Error('STRIPE_SECRET_KEY appears to be invalid (should start with sk_)');
  }

  // Validation spécifique pour les routes webhook
  if (process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET.length < 20) {
    console.warn('STRIPE_WEBHOOK_SECRET appears to be too short');
  }

  // Validation spécifique pour Service Role Key
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Vérifier que c'est bien une service_role key (contient "service_role" dans le payload JWT)
    // Note: On ne peut pas décoder le JWT facilement ici, mais on peut vérifier la longueur minimale
    if (process.env.SUPABASE_SERVICE_ROLE_KEY.length < 100) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY appears to be too short - verify it is the correct key');
    } else {
      console.log('✅ SUPABASE_SERVICE_ROLE_KEY is configured');
    }
  }
}

// Valider au chargement du module (en développement)
if (process.env.NODE_ENV === 'development') {
  try {
    validateEnv();
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
  }
}

