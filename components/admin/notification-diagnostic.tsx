'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export function NotificationDiagnostic() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    // 1. Vérifier Service Worker
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          diagnosticResults.push({
            name: 'Service Worker',
            status: 'success',
            message: 'Enregistré et actif'
          });
        } else {
          diagnosticResults.push({
            name: 'Service Worker',
            status: 'error',
            message: 'Non enregistré'
          });
        }
      } else {
        diagnosticResults.push({
          name: 'Service Worker',
          status: 'error',
          message: 'Non supporté par ce navigateur'
        });
      }
    } catch (err) {
      diagnosticResults.push({
        name: 'Service Worker',
        status: 'error',
        message: 'Erreur de vérification'
      });
    }

    // 2. Vérifier Push Manager
    if ('PushManager' in window) {
      diagnosticResults.push({
        name: 'Push Manager',
        status: 'success',
        message: 'Supporté'
      });
    } else {
      diagnosticResults.push({
        name: 'Push Manager',
        status: 'error',
        message: 'Non supporté'
      });
    }

    // 3. Vérifier Notification Permission
    if ('Notification' in window) {
      diagnosticResults.push({
        name: 'Permission Notifications',
        status: Notification.permission === 'granted' ? 'success' : 
                Notification.permission === 'denied' ? 'error' : 'warning',
        message: `Statut: ${Notification.permission}`
      });
    }

    // 4. Vérifier VAPID Key
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (vapidKey) {
      diagnosticResults.push({
        name: 'VAPID Public Key',
        status: 'success',
        message: `Configurée (${vapidKey.substring(0, 20)}...)`
      });
    } else {
      diagnosticResults.push({
        name: 'VAPID Public Key',
        status: 'error',
        message: 'Non configurée dans les variables d\'environnement'
      });
    }

    // 5. Vérifier Push Subscription
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            diagnosticResults.push({
              name: 'Push Subscription',
              status: 'success',
              message: 'Active'
            });
          } else {
            diagnosticResults.push({
              name: 'Push Subscription',
              status: 'warning',
              message: 'Aucune subscription active'
            });
          }
        }
      }
    } catch (err) {
      diagnosticResults.push({
        name: 'Push Subscription',
        status: 'error',
        message: 'Erreur lors de la vérification'
      });
    }

    // 6. Vérifier l'API Supabase
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'OPTIONS'
      });
      diagnosticResults.push({
        name: 'API Supabase (/api/push/subscribe)',
        status: response.status === 200 || response.status === 405 ? 'success' : 'warning',
        message: `Disponible (${response.status})`
      });
    } catch (err) {
      diagnosticResults.push({
        name: 'API Supabase',
        status: 'error',
        message: 'Erreur de connexion'
      });
    }

    // 7. Vérifier localStorage
    try {
      const status = localStorage.getItem('oryz_notification_status');
      diagnosticResults.push({
        name: 'LocalStorage',
        status: 'success',
        message: status ? `Statut enregistré: ${status}` : 'Pas de statut enregistré'
      });
    } catch (err) {
      diagnosticResults.push({
        name: 'LocalStorage',
        status: 'error',
        message: 'Non accessible'
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;

  return (
    <div className="bg-[#1a1a1a] border border-[#3498DB]/30 rounded-2xl p-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <h3 className="text-base font-display font-bold text-white uppercase">
            Diagnostic Notifications
          </h3>
          <p className="text-xs text-white/70 font-sans mt-1">
            {results.length > 0 ? `${successCount}/${results.length} OK` : 'Cliquez pour lancer'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              runDiagnostic();
            }}
            disabled={isRunning}
            size="sm"
            className="bg-[#3498DB] hover:bg-[#3498DB]/90 text-white"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Test'
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isExpanded && results.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                result.status === 'success' ? 'bg-green-500/10 border-green-500/30' :
                result.status === 'error' ? 'bg-red-500/10 border-red-500/30' :
                'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(result.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-label font-semibold text-white">
                  {result.name}
                </p>
                <p className="text-xs text-white/70 font-sans mt-1">
                  {result.message}
                </p>
              </div>
            </div>
          ))}

          {/* Résumé */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-white/70">Résultat global:</span>
              <span className={`font-semibold ${
                results.every(r => r.status === 'success') ? 'text-green-400' :
                results.some(r => r.status === 'error') ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {results.filter(r => r.status === 'success').length} / {results.length} OK
              </span>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

