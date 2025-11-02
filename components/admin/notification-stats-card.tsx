'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Users, Smartphone, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { getNotificationStats, type NotificationStats } from '@/lib/notification-stats';
import { Button } from '@/components/ui/button';

export function NotificationStatsCard() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await getNotificationStats();
      setStats(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="bg-gradient-to-br from-[#0F4C81] to-[#3498DB] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0F4C81] to-[#3498DB] rounded-2xl p-4 shadow-xl border border-[#3498DB]/30">
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white uppercase">
              Statistiques
            </h3>
            <p className="text-xs text-white/70 font-sans">
              {stats ? `${stats.totalEnabled} actifs • ${stats.activeDevices} appareils` : 'Chargement...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              loadStats();
            }}
            disabled={isLoading}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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

      {isExpanded && stats && (
        <div className="mt-4 pt-4 border-t border-white/20">

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Utilisateurs avec notifications activées */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4 text-green-400" />
            <span className="text-xs font-label text-white/80">Activées</span>
          </div>
          <div className="text-3xl font-display font-bold text-white">
            {stats?.totalEnabled || 0}
          </div>
          <div className="text-xs text-white/60 font-sans mt-1">
            {stats?.usersWithNotifications || 0} connectés + {stats?.anonymousWithNotifications || 0} anonymes
          </div>
        </div>

        {/* Utilisateurs ayant refusé */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <BellOff className="h-4 w-4 text-red-400" />
            <span className="text-xs font-label text-white/80">Refusées</span>
          </div>
          <div className="text-3xl font-display font-bold text-white">
            {stats?.usersDeclined || 0}
          </div>
          <div className="text-xs text-white/60 font-sans mt-1">
            Utilisateurs ayant refusé
          </div>
        </div>

        {/* Appareils actifs */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-label text-white/80">Appareils</span>
          </div>
          <div className="text-3xl font-display font-bold text-white">
            {stats?.activeDevices || 0}
          </div>
          <div className="text-xs text-white/60 font-sans mt-1">
            Appareils enregistrés
          </div>
        </div>

        {/* Total des préférences */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-label text-white/80">Total</span>
          </div>
          <div className="text-3xl font-display font-bold text-white">
            {stats?.totalPreferences || 0}
          </div>
          <div className="text-xs text-white/60 font-sans mt-1">
            Préférences enregistrées
          </div>
        </div>
      </div>

      {/* Taux de conversion */}
      {stats && stats.totalPreferences > 0 && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-label text-white/80">Taux d'acceptation</span>
            <span className="text-sm font-display font-bold text-white">
              {Math.round((stats.totalEnabled / stats.totalPreferences) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
              style={{ width: `${(stats.totalEnabled / stats.totalPreferences) * 100}%` }}
            />
          </div>
        </div>
      )}

        {/* Dernière mise à jour */}
        {lastUpdate && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/50 font-sans text-center" suppressHydrationWarning>
              Mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

