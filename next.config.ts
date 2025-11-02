import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Optimisation des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tutvlive.ru',
      },
      {
        protocol: 'https',
        hostname: 'directfr.sbs',
      },
      {
        protocol: 'https',
        hostname: 'fstv.lol',
      },
      {
        protocol: 'https',
        hostname: 'match-live.lol',
      },
      {
        protocol: 'https',
        hostname: 'directfr.lat',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Compression
  compress: true,
};

export default nextConfig;