import type { Viewport } from "next";

/**
 * Configuration viewport partagée pour toute l'application
 * Utilisé pour éviter les warnings Next.js 16+
 */
export const sharedViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F4C81",
};

