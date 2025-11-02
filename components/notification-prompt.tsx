'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Radio, Sparkles, Star, Film } from 'lucide-react';
import { Button } from './ui/button';
import { requestNotificationPermission, isNotificationPermissionGranted } from '@/lib/notifications';
import { saveNotificationPreference } from '@/lib/notification-stats';
import { subscribeToPushNotifications } from '@/lib/push-subscription';

export function NotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // S'assurer BM qu'on est côté client avant d'accéder à localStorage/Notification
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const checkNotificationStatus = () => {
      // VÉRIFIER SI L'APP EST EN MODE PWA (STANDALONE)
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as any).standalone === true || // iOS
                    document.referrer.includes('android-app://');

      console.log('📱 Mode PWA:', isPWA);

      // NE PAS AFFICHER si pas en mode PWA
      if (!isPWA) {
        console.log('🚫 Pas en mode PWA, popup désactivé');
        return;
      }

      // Vérifier le statut sauvegardé (persistant)
      const notificationStatus = localStorage.getItem('oryz_notification_status');
      const browserPermission = 'Notification' in window ? Notification.permission : 'default';

      console.log('🔔 Vérification notifications:', { 
        savedStatus: notificationStatus, 
        browserPermission,
        isPWA
      });

      // Si l'utilisateur a déjà répondu (accepté OU refusé), ne plus afficher
      if (notificationStatus === 'accepted' || notificationStatus === 'declined') {
        console.log('✅ Utilisateur a déjà répondu, ne pas afficher le prompt');
        return;
      }

      // Si la permission navigateur est accordée, sauvegarder automatiquement
      if (browserPermission === 'granted' && notificationStatus !== 'accepted') {
        console.log('✅ Permission accordée dans le navigateur, sauvegarde...');
        localStorage.setItem('oryz_notification_status', 'accepted');
        localStorage.setItem('oryz_notification_date', new Date().toISOString());
        return;
      }

      // Si la permission navigateur est refusée, sauvegarder automatiquement
      if (browserPermission === 'denied' && notificationStatus !== 'declined') {
        console.log('❌ Permission refusée dans le navigateur, sauvegarde...');
        localStorage.setItem('oryz_notification_status', 'declined');
        localStorage.setItem('oryz_notification_date', new Date().toISOString());
        return;
      }

      // Afficher le prompt SEULEMENT si en mode PWA + jamais demandé + permission = default
      if (!notificationStatus && browserPermission === 'default') {
        console.log('📢 PWA + Première visite, affichage du prompt dans 3 secondes...');
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    checkNotificationStatus();
  }, [mounted]);

  const handleAllow = async () => {
    console.log('✅ Utilisateur clique sur ACTIVER');
    setIsLoading(true);
    
    // Timeout de sécurité - maximum 10 secondes
    const timeoutId = setTimeout(() => {
      console.warn('⏱️ Timeout: fermeture du popup');
      setIsLoading(false);
      setIsVisible(false);
    }, 10000);
    
    try {
      // ÉTAPE 1 : Demander la permission
      console.log('🔔 Demande de permission...');
      const granted = await requestNotificationPermission();
      
      if (!granted) {
        console.log('❌ Permission REFUSÉE par l\'utilisateur');
        localStorage.setItem('oryz_notification_status', 'declined');
        localStorage.setItem('oryz_notification_date', new Date().toISOString());
        await saveNotificationPreference('declined', 'denied');
        clearTimeout(timeoutId);
        setIsLoading(false);
        setIsVisible(false);
        return;
      }

      console.log('🎉 Permission ACCORDÉE !');
      
      // ÉTAPE 2 : Sauvegarder immédiatement dans localStorage
      localStorage.setItem('oryz_notification_status', 'accepted');
      localStorage.setItem('oryz_notification_date', new Date().toISOString());
      
      // ÉTAPE 3 : S'abonner aux notifications push (avec timeout propre)
      console.log('🔄 Création de l\'abonnement push...');
      
      // Lancer l'abonnement en arrière-plan (ne pas bloquer)
      subscribeToPushNotifications()
        .then(async (result) => {
          if (result.success) {
            console.log('✅ Abonnement push créé et enregistré');
            // Notification de bienvenue
            try {
              if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration && registration.active) {
                  await registration.showNotification('Bienvenue sur ORYZ', {
                    body: 'Vous recevrez toutes nos notifications.',
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    tag: 'welcome',
                    requireInteraction: false,
                  });
                }
              }
            } catch (notifErr) {
              console.warn('⚠️ Erreur notification de bienvenue:', notifErr);
            }
          } else {
            console.warn('⚠️ Abonnement push échoué:', result.error);
          }
          
          // Sauvegarder dans Supabase (stats)
          await saveNotificationPreference('accepted', 'granted');
        })
        .catch((err) => {
          console.error('❌ Erreur abonnement:', err);
          // Sauvegarder quand même les stats
          saveNotificationPreference('accepted', 'granted').catch(() => {});
        });
      
      // ÉTAPE 4 : Fermer le popup IMMÉDIATEMENT (ne pas attendre l'abonnement)
      console.log('✅ Permission enregistrée, fermeture du popup');
      window.dispatchEvent(new CustomEvent('oryzNotificationsEnabled'));
      
    } catch (error) {
      console.error('❌ Erreur générale:', error);
      localStorage.setItem('oryz_notification_status', 'error');
      localStorage.setItem('oryz_notification_date', new Date().toISOString());
      
      try {
        await saveNotificationPreference('error', 'default');
      } catch (saveErr) {
        console.error('❌ Erreur sauvegarde:', saveErr);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      setIsVisible(false);
    }
  };

  const handleDismiss = async () => {
    console.log('❌ Utilisateur clique sur PLUS TARD (refus)');
    
    try {
      // Sauvegarder le REFUS de manière PERSISTANTE dans localStorage
      localStorage.setItem('oryz_notification_status', 'declined');
      localStorage.setItem('oryz_notification_date', new Date().toISOString());
      
      // Sauvegarder dans Supabase
      const browserPermission = 'Notification' in window ? Notification.permission : 'default';
      await saveNotificationPreference('declined', browserPermission);
      
      console.log('✅ Refus sauvegardé dans localStorage et Supabase');
      
      // Déclencher un événement personnalisé
      window.dispatchEvent(new CustomEvent('oryzNotificationsDeclined'));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du refus:', error);
    }
    
    setIsVisible(false);
  };

  // Ne rien rendre avant que le montage soit terminé (évite erreur d'hydratation)
  if (!mounted || !isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in" />

      {/* Notification Prompt - Compact et minimaliste */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[calc(100%-2rem)] max-w-sm animate-in zoom-in-95 fade-in">
        <div className="bg-[#1a1a1a] border border-[#3498DB]/30 rounded-lg shadow-2xl overflow-hidden">
          {/* Header compact */}
          <div className="relative bg-gradient-to-r from-[#0F4C81] to-[#3498DB] p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-base font-display font-bold text-white uppercase flex-1">
              Notifications
            </h3>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content compact */}
          <div className="p-4 space-y-3">
            <p className="text-sm text-white/80 font-sans">
              Restez informé des nouveautés :
            </p>
            
            <ul className="space-y-2 text-xs text-white/60 font-sans">
              <li className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-[#3498DB] flex-shrink-0" />
                <span>Matchs en direct</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#3498DB] flex-shrink-0" />
                <span>Nouvelles chaînes</span>
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-[#3498DB] flex-shrink-0" />
                <span>Contenus recommandés</span>
              </li>
              <li className="flex items-center gap-2">
                <Film className="h-3.5 w-3.5 text-[#3498DB] flex-shrink-0" />
                <span>Films et séries</span>
              </li>
            </ul>

            {/* Buttons compacts */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="flex-1 text-white/50 hover:text-white hover:bg-white/5 font-label text-xs h-9"
              >
                Plus tard
              </Button>
              <Button
                onClick={handleAllow}
                disabled={isLoading}
                className="flex-1 bg-[#3498DB] hover:bg-[#3498DB]/90 text-white font-label font-semibold text-xs h-9"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5" />
                    <span>Activer</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

