'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TestNotificationAll() {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const sendTestToAll = async () => {
    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test ORYZ',
          body: 'Notification de test envoyée à tous les utilisateurs',
          icon: '/icon-192x192.png',
          tag: 'test-notification'
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✅ Envoyé à ${data.sentTo}/${data.total} utilisateur(s)${data.failed > 0 ? ` (${data.failed} échoués)` : ''}${data.expired > 0 ? ` (${data.expired} expirés)` : ''}`);
      } else {
        setResult(`❌ Erreur: ${data.error}`);
      }
    } catch (error: any) {
      setResult(`❌ Erreur: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4">
      <h4 className="text-sm font-label font-bold text-white mb-3">
        Test rapide - Tous les utilisateurs
      </h4>
      
      <Button
        onClick={sendTestToAll}
        disabled={isSending}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Envoyer test à TOUS
          </>
        )}
      </Button>

      {result && (
        <div className={`mt-3 p-3 rounded-lg text-xs font-sans ${
          result.startsWith('✅') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {result}
        </div>
      )}
    </div>
  );
}

