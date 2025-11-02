'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Globe, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface PushDevice {
  id: string;
  user_id: string | null;
  browser: string;
  device_info: string;
  is_active: boolean;
  created_at: string;
  last_notification_at: string | null;
  endpoint: string;
}

export function PushDevicesList() {
  const [devices, setDevices] = useState<PushDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des appareils:', error);
      } else {
        setDevices(data || []);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeDevice = async (deviceId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet appareil ?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('id', deviceId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      } else {
        await loadDevices();
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const toggleDeviceStatus = async (deviceId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: !currentStatus })
        .eq('id', deviceId);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour');
      } else {
        await loadDevices();
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  useEffect(() => {
    loadDevices();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (deviceInfo: string) => {
    const info = deviceInfo.toLowerCase();
    if (info.includes('mobile') || info.includes('android') || info.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (info.includes('tablet') || info.includes('ipad')) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getBrowserBadge = (browser: string) => {
    const colors: { [key: string]: string } = {
      'Chrome': 'bg-yellow-500/20 text-yellow-300',
      'Firefox': 'bg-orange-500/20 text-orange-300',
      'Safari': 'bg-blue-500/20 text-blue-300',
      'Edge': 'bg-cyan-500/20 text-cyan-300',
    };
    return colors[browser] || 'bg-gray-500/20 text-gray-300';
  };

  if (isLoading && devices.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#3498DB]/30 rounded-2xl p-6">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-[#3498DB]/30 border-t-[#3498DB] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#3498DB]/30 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#3498DB] flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white uppercase">
              Appareils Inscrits
            </h3>
            <p className="text-xs text-white/70 font-sans">
              {devices.length} appareil(s) · {devices.filter(d => d.is_active).length} actif(s)
            </p>
          </div>
        </div>
        
        <Button
          onClick={loadDevices}
          disabled={isLoading}
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Liste des appareils */}
      {devices.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 font-sans text-sm">
            Aucun appareil inscrit pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {devices.map((device) => (
            <div
              key={device.id}
              className={`bg-white/5 border ${
                device.is_active ? 'border-green-500/30' : 'border-red-500/30'
              } rounded-xl p-4 hover:bg-white/10 transition-colors`}
            >
              <div className="flex items-start gap-3">
                {/* Icône d'appareil */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${
                  device.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                } flex items-center justify-center`}>
                  {getDeviceIcon(device.device_info)}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs font-label rounded-md ${getBrowserBadge(device.browser)}`}>
                      {device.browser}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-sans ${
                      device.is_active ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {device.is_active ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          <span>Actif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>Inactif</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-white/60 font-sans truncate mb-2">
                    {device.user_id ? `Utilisateur: ${device.user_id.substring(0, 8)}...` : 'Anonyme'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-white/40 font-sans">
                    <span suppressHydrationWarning>
                      Inscrit: {new Date(device.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    {device.last_notification_at && (
                      <span suppressHydrationWarning>
                        Dernière notif: {new Date(device.last_notification_at).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => toggleDeviceStatus(device.id, device.is_active)}
                    size="sm"
                    variant="ghost"
                    className={`text-xs ${
                      device.is_active ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-green-400 hover:bg-green-500/10'
                    }`}
                  >
                    {device.is_active ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button
                    onClick={() => removeDevice(device.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/10 text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dernière mise à jour */}
      {lastUpdate && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/50 font-sans text-center" suppressHydrationWarning>
            Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
        </div>
      )}
    </div>
  );
}

