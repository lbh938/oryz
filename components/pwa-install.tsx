'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà refusé l'installation
    const hasRefusedInstall = localStorage.getItem('pwa-install-refused');
    if (hasRefusedInstall) {
      setShowInstallBanner(false);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installé avec succès');
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    // Marquer que l'utilisateur a refusé l'installation
    localStorage.setItem('pwa-install-refused', 'true');
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg p-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-[#0F4C81] to-[#3498DB] rounded-lg flex items-center justify-center flex-shrink-0">
          <img src="/Oryz/b.png" alt="ORYZ" className="w-8 h-8" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-sm text-foreground mb-1">
            Installer ORYZ
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Installez l'app pour une expérience optimale
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleInstallClick}
              size="sm"
              className="bg-[#3498DB] hover:bg-[#3498DB]/90 text-white text-xs px-3 py-1 h-auto"
            >
              <Download className="w-3 h-3 mr-1" />
              Installer
            </Button>
            
            <Button 
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-xs px-3 py-1 h-auto"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
