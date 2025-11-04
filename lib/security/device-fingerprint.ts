/**
 * Génère un fingerprint unique du device pour le tracking anti-fraude (async)
 */
export async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Collecter les informations du device
  const fingerprint = {
    // User Agent
    userAgent: navigator.userAgent,
    
    // Screen
    screenWidth: screen.width,
    screenHeight: screen.height,
    screenColorDepth: screen.colorDepth,
    
    // Timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Language
    language: navigator.language,
    languages: navigator.languages?.join(',') || '',
    
    // Platform
    platform: navigator.platform,
    
    // Hardware
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || 0,
    
    // Canvas fingerprint
    canvas: '',
    
    // WebGL
    webgl: '',
    
    // Fonts
    fonts: '',
  };

  // Canvas fingerprint
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    fingerprint.canvas = canvas.toDataURL();
  }

  // WebGL fingerprint
  try {
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        fingerprint.webgl = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) {
    // Ignore
  }

  // Créer un hash du fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  return await hashString(fingerprintString);
}

/**
 * Hash simple pour fallback
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Hash une chaîne de caractères en SHA-256 (async)
 */
async function hashString(str: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto) {
    // Fallback pour Node.js
    return simpleHash(str);
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return simpleHash(str);
  }
}

/**
 * Génère un hash synchrone (pour les cas où async n'est pas possible)
 */
export function generateDeviceFingerprintSync(): string {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  const fingerprint = {
    userAgent: navigator.userAgent,
    screenWidth: screen.width,
    screenHeight: screen.height,
    screenColorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || 0,
  };

  return simpleHash(JSON.stringify(fingerprint));
}

