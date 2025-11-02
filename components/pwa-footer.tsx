'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function PWAFooter() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Détecter le mode PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true ||
                          document.referrer.includes('android-app://');
      setIsPWA(isStandalone);
    };

    checkPWA();
  }, []);

  if (!isPWA) return null;

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ORYZ STREAM" className="h-6 md:h-8 w-auto" />
            <p className="text-xs sm:text-sm text-muted-foreground font-sans">
              Tous droits réservés.
            </p>
          </div>
          <div className="flex gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm font-label font-medium text-muted-foreground">
            <Link href="/channels" className="hover:text-[#3498DB] transition-colors">
              Chaînes
            </Link>
            <Link href="/favorites" className="hover:text-[#3498DB] transition-colors">
              Favoris
            </Link>
            <Link href="/protected" className="hover:text-[#3498DB] transition-colors">
              Compte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

