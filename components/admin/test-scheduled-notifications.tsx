'use client';

import { useState } from 'react';
import { Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TestScheduledNotifications() {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testScheduled = async () => {
    setIsTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/scheduled-notifications/send');
      const data = await response.json();

      setResult(data);
    } catch (error: any) {
      setResult({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
      <h4 className="text-sm font-label font-bold text-white mb-3">
        Test notifications programmées
      </h4>
      
      <Button
        onClick={testScheduled}
        disabled={isTesting}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white mb-3"
      >
        {isTesting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Vérification...
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 mr-2" />
            Déclencher maintenant
          </>
        )}
      </Button>

      {result && (
        <div className={`p-3 rounded-lg text-xs font-sans ${
          result.success 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {result.success ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-semibold">{result.message}</span>
              </div>
              {result.notifications > 0 && (
                <div className="text-[10px] text-green-200/70 ml-6">
                  {result.notifications} notification(s) • {result.sentTo} appareil(s)
                </div>
              )}
              {result.sent === 0 && (
                <div className="text-[10px] text-green-200/70 ml-6">
                  Aucune notification programmée pour le moment
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Erreur</div>
                <div className="text-[10px] text-red-200/70">{result.error || result.details}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 p-2 bg-white/5 rounded text-[10px] text-white/50 font-sans">
        💡 Créez une notification programmée et cliquez ici pour la déclencher manuellement
      </div>
    </div>
  );
}

