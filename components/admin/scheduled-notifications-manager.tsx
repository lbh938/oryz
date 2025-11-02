'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CollapsibleCard } from './collapsible-card';
import {
  createScheduledNotification,
  getScheduledNotifications,
  deleteScheduledNotification,
  activateScheduledNotification,
  deactivateScheduledNotification,
  type ScheduledNotification,
} from '@/lib/scheduled-notifications';
import {
  Clock, Plus, Trash2, Loader2, CheckCircle2, AlertCircle,
  Calendar, Repeat, PlayCircle, PauseCircle
} from 'lucide-react';

export function ScheduledNotificationsManager() {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [repeatType, setRepeatType] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Debug logs visible
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  // Charger les notifications
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    const data = await getScheduledNotifications(false);
    setNotifications(data);
    setIsLoading(false);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    setDebugLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const handleSubmit = async () => {
    addLog('📝 Tentative de création de notification programmée');
    setShowDebug(true);
    
    // Debug: vérifier l'utilisateur actuel
    const supabase = await import('@/lib/supabase/client').then(m => m.createClient());
    const { data: { user } } = await supabase.auth.getUser();
    addLog(`👤 User ID: ${user?.id || 'NON CONNECTÉ'}`);
    addLog(`📧 Email: ${user?.email || 'AUCUN'}`);
    
    if (!title.trim() || !body.trim() || !scheduledFor) {
      addLog('❌ ERREUR: Champs manquants');
      setStatus('error');
      setErrorMessage('Tous les champs sont requis');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    // Convertir la date locale en ISO pour Supabase
    const localDate = new Date(scheduledFor);
    
    // Vérifier que la date est dans le futur
    if (localDate <= new Date()) {
      addLog('❌ ERREUR: Date dans le passé');
      setStatus('error');
      setErrorMessage('La date doit être dans le futur');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setIsSaving(true);
    setStatus('idle');

    addLog(`🔄 Données à envoyer: Titre="${title}", Date=${localDate.toISOString()}, Répétition=${repeatType}`);

    // Détecter le fuseau horaire
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    addLog(`🌍 Fuseau horaire détecté: ${userTimezone}`);

    // Envoyer en ISO format avec le bon fuseau horaire
    const result = await createScheduledNotification({
      title,
      body,
      icon: '/icon-192x192.png',
      scheduled_for: localDate.toISOString(),
      repeat_type: repeatType,
      timezone: userTimezone,
    });

    if (result.success) {
      addLog(`✅ SUCCÈS: Notification créée avec ID: ${result.id}`);
      setStatus('success');
      setTitle('');
      setBody('');
      setScheduledFor('');
      setRepeatType('once');
      setShowForm(false);
      await loadNotifications();
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      addLog(`❌ ERREUR SUPABASE: ${result.error}`);
      setStatus('error');
      setErrorMessage(result.error || 'Erreur lors de la création');
      setTimeout(() => setStatus('idle'), 3000);
    }

    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette notification ?')) return;

    const success = await deleteScheduledNotification(id);
    if (success) {
      await loadNotifications();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const success = currentStatus
      ? await deactivateScheduledNotification(id)
      : await activateScheduledNotification(id);

    if (success) {
      await loadNotifications();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const getRepeatLabel = (type: string) => {
    const labels = {
      once: 'Une fois',
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-[#3498DB]" />
          <h2 className="text-lg sm:text-xl font-display font-bold text-white uppercase">
            Notifications programmées
          </h2>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle
        </Button>
      </div>

      {/* Zone de debug visible */}
      {showDebug && debugLogs.length > 0 && (
        <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-orange-500 font-label font-semibold text-sm">📊 Debug Mobile</h4>
            <button
              onClick={() => setDebugLogs([])}
              className="text-xs text-orange-500/70 hover:text-orange-500"
            >
              Effacer
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {debugLogs.map((log, idx) => (
              <p key={idx} className="text-xs font-mono text-orange-400/90 break-all">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire de création */}
      {showForm && (
        <div className="mb-6 p-4 bg-[#333333]/50 rounded-lg border border-[#3498DB]/30">
          <h3 className="text-white font-label font-semibold mb-4">Programmer une notification</h3>
          
          <div className="space-y-4">
            {/* Titre */}
            <div>
              <Label htmlFor="sched-title" className="text-white font-label text-sm">
                Titre
              </Label>
              <Input
                id="sched-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 bg-[#1a1a1a] border-[#3498DB]/30 text-white"
                placeholder="Ex: Match ce soir"
                maxLength={50}
              />
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="sched-body" className="text-white font-label text-sm">
                Message
              </Label>
              <textarea
                id="sched-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1 w-full min-h-[60px] px-3 py-2 bg-[#1a1a1a] border border-[#3498DB]/30 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3498DB] text-sm resize-none"
                placeholder="Ex: PSG vs OM à 21h sur ORYZ"
                maxLength={120}
              />
            </div>

            {/* Date et heure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sched-date" className="text-white font-label text-sm">
                  Date et heure (heure locale)
                </Label>
                <Input
                  id="sched-date"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="mt-1 bg-[#1a1a1a] border-[#3498DB]/30 text-white"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-white/40 mt-1">
                  {new Date().toLocaleString('fr-FR', { timeZoneName: 'short' })}
                </p>
              </div>

              <div>
                <Label htmlFor="sched-repeat" className="text-white font-label text-sm">
                  Répétition
                </Label>
                <select
                  id="sched-repeat"
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as any)}
                  className="mt-1 w-full h-10 px-3 bg-[#1a1a1a] border border-[#3498DB]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3498DB] text-sm"
                >
                  <option value="once">Une fois</option>
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                </select>
              </div>
            </div>

            {/* Messages de statut */}
            {status === 'error' && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-500 font-sans">{errorMessage}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-500 font-sans">Notification programmée !</p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label"
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Programmer
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="border-[#333333] hover:bg-[#333333] text-white"
                size="sm"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des notifications */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-[#3498DB] animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 font-sans text-sm">
              Aucune notification programmée
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-4 bg-[#333333]/50 rounded-lg border border-[#3498DB]/20 hover:border-[#3498DB]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-label font-semibold text-sm mb-1 line-clamp-1">
                    {notif.title}
                  </h4>
                  <p className="text-white/70 font-sans text-xs mb-2 line-clamp-2">
                    {notif.body}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(notif.scheduled_for)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat className="h-3 w-3" />
                      {getRepeatLabel(notif.repeat_type)}
                    </span>
                    {notif.is_sent && (
                      <span className="text-green-500">✓ Envoyée</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(notif.id!, notif.is_active!)}
                    className="p-2 hover:bg-[#3498DB]/20 rounded-lg transition-colors"
                    title={notif.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {notif.is_active ? (
                      <PauseCircle className="h-4 w-4 text-[#3498DB]" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-white/40" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(notif.id!)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

