'use client';

import { useState, useEffect } from 'react';
import { Bug, Copy, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function NotificationDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const collectDebugInfo = async () => {
    const supabase = createClient();
    
    // Récupérer les stats
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .order('created_at', { ascending: false });

    const info = {
      timestamp: new Date().toISOString(),
      environment: {
        vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'Configurée' : 'MANQUANTE',
        vapidKeyPrefix: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.substring(0, 20) || 'N/A',
      },
      database: {
        totalSubscriptions: subscriptions?.length || 0,
        activeSubscriptions: subscriptions?.filter(s => s.is_active).length || 0,
        totalPreferences: preferences?.length || 0,
        acceptedPreferences: preferences?.filter(p => p.status === 'accepted').length || 0,
        declinedPreferences: preferences?.filter(p => p.status === 'declined').length || 0,
      },
      subscriptions: subscriptions?.map(s => ({
        id: s.id.substring(0, 8),
        browser: s.browser,
        userId: s.user_id ? 'Connecté' : 'Anonyme',
        isActive: s.is_active,
        createdAt: new Date(s.created_at).toLocaleString('fr-FR'),
      })) || [],
      preferences: preferences?.slice(0, 10).map(p => ({
        id: p.id.substring(0, 8),
        status: p.status,
        userId: p.user_id ? 'Connecté' : 'Anonyme',
        createdAt: new Date(p.created_at).toLocaleString('fr-FR'),
      })) || [],
    };

    setDebugInfo(info);
  };

  useEffect(() => {
    collectDebugInfo();
  }, []);

  const copyToClipboard = () => {
    if (debugInfo) {
      navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!debugInfo) return null;

  return (
    <div className="bg-[#1a1a1a] border border-orange-500/30 rounded-2xl p-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Bug className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white uppercase">
              Debug Notifications
            </h3>
            <p className="text-xs text-white/70 font-sans">
              {isExpanded ? 'Cliquez pour masquer' : `${debugInfo?.database.activeSubscriptions || 0} actifs • Cliquez pour détails`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isExpanded && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="space-y-4">
        {/* Environnement */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-sm font-label font-bold text-white mb-2">Environnement</h4>
          <div className="space-y-1 text-xs font-sans text-white/70">
            <div className="flex justify-between">
              <span>VAPID Key :</span>
              <span className={debugInfo.environment.vapidKey === 'MANQUANTE' ? 'text-red-400' : 'text-green-400'}>
                {debugInfo.environment.vapidKey}
              </span>
            </div>
            {debugInfo.environment.vapidKey !== 'MANQUANTE' && (
              <div className="flex justify-between">
                <span>Préfixe :</span>
                <span className="text-white/50 font-mono text-[10px]">{debugInfo.environment.vapidKeyPrefix}...</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats globales */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-sm font-label font-bold text-white mb-2">Statistiques</h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-sans">
            <div>
              <div className="text-white/50">Abonnements actifs</div>
              <div className="text-2xl font-bold text-green-400">{debugInfo.database.activeSubscriptions}</div>
            </div>
            <div>
              <div className="text-white/50">Total abonnements</div>
              <div className="text-2xl font-bold text-white">{debugInfo.database.totalSubscriptions}</div>
            </div>
            <div>
              <div className="text-white/50">Préférences acceptées</div>
              <div className="text-2xl font-bold text-blue-400">{debugInfo.database.acceptedPreferences}</div>
            </div>
            <div>
              <div className="text-white/50">Préférences refusées</div>
              <div className="text-2xl font-bold text-red-400">{debugInfo.database.declinedPreferences}</div>
            </div>
          </div>
        </div>

        {/* Derniers abonnements */}
        {debugInfo.subscriptions.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-sm font-label font-bold text-white mb-2">
              Derniers abonnements ({debugInfo.subscriptions.length})
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {debugInfo.subscriptions.map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between text-xs bg-white/5 rounded p-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${sub.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-white/70">{sub.browser}</span>
                    <span className="text-white/50">• {sub.userId}</span>
                  </div>
                  <span className="text-white/40 text-[10px]">{sub.createdAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyse */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <h4 className="text-sm font-label font-bold text-orange-400 mb-2">Analyse</h4>
          <div className="space-y-2 text-xs font-sans text-white/70">
            {debugInfo.database.activeSubscriptions === 0 && (
              <div className="flex items-start gap-2">
                <span className="text-red-400">❌</span>
                <span>Aucun appareil inscrit - Le popup ne fonctionne pas ou personne ne l'a accepté</span>
              </div>
            )}
            {debugInfo.database.activeSubscriptions === 1 && (
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">⚠️</span>
                <span>Seul 1 appareil (probablement vous) - Testez avec un autre appareil</span>
              </div>
            )}
            {debugInfo.database.declinedPreferences > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-blue-400">ℹ️</span>
                <span>{debugInfo.database.declinedPreferences} utilisateur(s) ont refusé les notifications</span>
              </div>
            )}
            {debugInfo.environment.vapidKey === 'MANQUANTE' && (
              <div className="flex items-start gap-2">
                <span className="text-red-400">🔥</span>
                <span className="text-red-400 font-semibold">CRITIQUE: VAPID_PUBLIC_KEY non configurée !</span>
              </div>
            )}
          </div>
        </div>
          </div>
        </div>
      )}
    </div>
  );
}

