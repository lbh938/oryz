'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Bell, BellOff, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { requestNotificationPermission, isNotificationPermissionGranted } from '@/lib/notifications';
import { 
  getNotificationStatus, 
  resetNotificationPreferences,
  saveNotificationAcceptance,
  saveNotificationDecline,
  getNotificationStatusMessage 
} from '@/lib/notification-manager';
import { subscribeToPushNotifications } from '@/lib/push-subscription';

export function NotificationSettings() {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  // S'assurer qu'on est côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Vérifier le statut actuel
    if (mounted && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [mounted]);

  const handleEnable = async () => {
    console.log('✅ Tentative d\'activation des notifications');
    setIsLoading(true);
    setStatus('idle');

    try {
      const granted = await requestNotificationPermission();
      
      if (granted) {
        console.log('🎉 Notifications ACTIVÉES');
        
        // Sauvegarder le choix de manière PERSISTANTE
        saveNotificationAcceptance();
        
        // S'abonner aux notifications push (Web Push)
        const subscriptionResult = await subscribeToPushNotifications();
        if (subscriptionResult.success) {
          console.log('✅ Abonnement push créé');
        } else if (subscriptionResult.error) {
          console.warn('⚠️ Abonnement push:', subscriptionResult.error);
        }
        
        setPermission('granted');
        setStatus('success');
        setMessage('Notifications activées avec succès ! Vous recevrez maintenant toutes les actualités importantes.');
        
        // Envoyer une notification de test
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification('Bienvenue sur ORYZ', {
            body: 'Vous recevrez maintenant toutes les notifications importantes.',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: 'settings-enabled',
            requireInteraction: false,
          });
        }
      } else {
        console.log('❌ Permission REFUSÉE');
        
        // Sauvegarder le refus
        saveNotificationDecline();
        
        setPermission('denied');
        setStatus('error');
        setMessage('Permission refusée. Modifiez les paramètres de votre navigateur pour autoriser les notifications.');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setStatus('error');
      setMessage('Erreur lors de l\'activation des notifications');
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleDisable = () => {
    setStatus('error');
    setMessage('Pour désactiver les notifications, modifiez les paramètres de votre navigateur (icône 🔒 dans la barre d\'adresse)');
    setTimeout(() => setStatus('idle'), 7000);
  };

  const handleReset = () => {
    console.log('🔄 Réinitialisation des préférences de notification');
    
    // Utiliser la fonction du gestionnaire de notifications
    resetNotificationPreferences();
    
    setStatus('success');
    setMessage('Préférences réinitialisées avec succès ! Rechargez la page pour recevoir à nouveau la demande de notification.');
    
    setTimeout(() => {
      setStatus('idle');
      // Suggérer un rechargement de la page
      if (confirm('Voulez-vous recharger la page maintenant pour voir le popup de notification ?')) {
        window.location.reload();
      }
    }, 3000);
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#3498DB]/10 border border-[#3498DB]/30">
          <Bell className="h-6 w-6 text-[#3498DB]" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-display font-bold text-white uppercase mb-2">
            Notifications
          </h2>
          <p className="text-sm text-white/60 font-sans">
            Gérez vos préférences de notifications push
          </p>
        </div>
      </div>

      {/* État actuel */}
      <div className="mb-6 p-4 rounded-lg bg-[#333333]/50 border border-[#333333]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {permission === 'granted' ? (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-label text-white">Notifications activées</span>
              </>
            ) : permission === 'denied' ? (
              <>
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm font-label text-white">Notifications bloquées</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm font-label text-white">Notifications non configurées</span>
              </>
            )}
          </div>
          {permission === 'granted' && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
        </div>
      </div>

      {/* Messages de statut */}
      {status === 'success' && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-500 font-sans">{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500 font-sans">{message}</p>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="space-y-3">
        {permission === 'granted' ? (
          <>
            <Button
              onClick={handleDisable}
              variant="outline"
              className="w-full h-12 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-label"
            >
              <BellOff className="mr-2 h-5 w-5" />
              Désactiver les notifications
            </Button>
            <p className="text-xs text-white/40 font-sans text-center">
              Les notifications sont gérées par votre navigateur
            </p>
          </>
        ) : permission === 'denied' ? (
          <>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 font-sans mb-3">
                Vous avez bloqué les notifications. Pour les réactiver :
              </p>
              <ol className="text-xs text-white/60 font-sans space-y-2 list-decimal list-inside">
                <li>Cliquez sur l'icône 🔒 (cadenas) dans la barre d'adresse</li>
                <li>Trouvez "Notifications" dans les paramètres</li>
                <li>Changez de "Bloquer" à "Autoriser"</li>
                <li>Rechargez la page</li>
              </ol>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full h-12 border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label"
            >
              Réinitialiser les préférences
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleEnable}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-bold shadow-lg shadow-[#3498DB]/30"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Activation...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-5 w-5" />
                  Activer les notifications
                </>
              )}
            </Button>
            <p className="text-xs text-white/40 font-sans text-center">
              Recevez les dernières actualités et matchs en direct
            </p>
          </>
        )}
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-6 p-4 bg-[#3498DB]/10 border border-[#3498DB]/30 rounded-lg">
        <p className="text-xs text-white/70 font-sans leading-relaxed">
          <Bell className="h-3.5 w-3.5 inline-block mr-1 text-[#3498DB]" />
          <strong>À propos des notifications :</strong> Vous recevrez des alertes pour les nouveaux contenus, matchs en direct, et actualités importantes. Vous pouvez modifier ces préférences à tout moment.
        </p>
      </div>
    </div>
  );
}

