/**
 * Device Fingerprint - Génération d'un identifiant unique pour chaque appareil
 * Utilisé pour tracker les essais gratuits par IP + device
 */

export async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  const components: string[] = [];

  // User Agent
  if (navigator.userAgent) {
    components.push(navigator.userAgent);
  }

  // Language
  if (navigator.language) {
    components.push(navigator.language);
  }

  // Screen resolution
  if (screen.width && screen.height) {
    components.push(`${screen.width}x${screen.height}`);
  }

  // Color depth
  if (screen.colorDepth) {
    components.push(`color:${screen.colorDepth}`);
  }

  // Timezone
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      components.push(timezone);
    }
  } catch (e) {
    // Ignore
  }

  // Platform
  if (navigator.platform) {
    components.push(navigator.platform);
  }

  // Hardware concurrency
  if (navigator.hardwareConcurrency) {
    components.push(`cores:${navigator.hardwareConcurrency}`);
  }

  // Device memory (if available)
  if ('deviceMemory' in navigator) {
    components.push(`memory:${(navigator as any).deviceMemory}`);
  }

  // Canvas fingerprint (simplified)
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Device fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device fingerprint', 4, 17);
      const canvasHash = canvas.toDataURL().slice(-50);
      components.push(canvasHash);
    }
  } catch (e) {
    // Ignore canvas errors
  }

  // Combine all components
  const fingerprintString = components.join('|');

  // Hash the fingerprint (simple hash function)
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

export function generateDeviceFingerprintSync(): string {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  const components: string[] = [];

  // User Agent
  if (navigator.userAgent) {
    components.push(navigator.userAgent);
  }

  // Language
  if (navigator.language) {
    components.push(navigator.language);
  }

  // Screen resolution
  if (screen.width && screen.height) {
    components.push(`${screen.width}x${screen.height}`);
  }

  // Color depth
  if (screen.colorDepth) {
    components.push(`color:${screen.colorDepth}`);
  }

  // Platform
  if (navigator.platform) {
    components.push(navigator.platform);
  }

  // Hardware concurrency
  if (navigator.hardwareConcurrency) {
    components.push(`cores:${navigator.hardwareConcurrency}`);
  }

  // Combine all components
  const fingerprintString = components.join('|');

  // Hash the fingerprint (simple hash function)
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}
