'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CollapsibleCard } from './collapsible-card';
import { sendNotification } from '@/lib/notifications';
import { Bell, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function NotificationManager() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [icon, setIcon] = useState('/icon-192x192.png');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = () => {
    setTitle('');
    setBody('');
    setIcon('/icon-192x192.png');
    setStatus('idle');
    setErrorMessage('');
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      setStatus('error');
      setErrorMessage('Le titre et le message sont requis');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setIsSending(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Envoyer via l'API pour distribution aux utilisateurs
      const response = await fetch('/api/admin/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          icon,
          badge: '/icon-192x192.png',
          tag: 'admin-notification',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }

      // Afficher une notification de test locale pour l'admin
      if (Notification.permission === 'granted') {
        await sendNotification(title, {
          body,
          icon,
          badge: '/icon-192x192.png',
          tag: 'admin-preview',
          requireInteraction: false,
        });
      }

      setStatus('success');
      setTitle('');
      setBody('');
      setIcon('/icon-192x192.png');
      
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Erreur lors de l\'envoi de la notification');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setIsSending(false);
    }
  };

  // Templates prédéfinis
  const templates = [
    {
      name: 'Nouvelle chaîne',
      title: 'Nouvelle chaîne disponible',
      body: 'Une nouvelle chaîne vient d\'être ajoutée sur ORYZ',
    },
    {
      name: 'Match en direct',
      title: 'Match en direct',
      body: 'Un match vient de commencer sur ORYZ',
    },
    {
      name: 'Nouveau film',
      title: 'Nouveau film disponible',
      body: 'Un nouveau film est maintenant disponible sur ORYZ',
    },
    {
      name: 'Maintenance',
      title: 'Maintenance programmée',
      body: 'Le site sera en maintenance pour améliorer votre expérience',
    },
  ];

  const useTemplate = (template: typeof templates[0]) => {
    setTitle(template.title);
    setBody(template.body);
  };

  return (
    <CollapsibleCard
      title="Notification Rapide"
      subtitle="Envoyer immédiatement à tous"
      icon={<Bell className="h-5 w-5 text-white" />}
      onReset={handleReset}
      defaultExpanded={false}
    >
      {/* Templates rapides */}
      <div className="mb-6">
        <Label className="text-white font-label mb-2 block text-sm">
          Templates rapides
        </Label>
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              key={template.name}
              onClick={() => useTemplate(template)}
              className="px-3 py-1.5 rounded-lg bg-[#333333] hover:bg-[#3498DB]/20 text-white text-xs font-label transition-all border border-[#3498DB]/30"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Titre */}
        <div>
          <Label htmlFor="notif-title" className="text-white font-label">
            Titre de la notification
          </Label>
          <Input
            id="notif-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white"
            placeholder="Ex: Nouvelle chaîne disponible"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {title.length}/50 caractères
          </p>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="notif-body" className="text-white font-label">
            Message
          </Label>
          <textarea
            id="notif-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full min-h-[80px] px-3 py-2 bg-[#333333] border border-[#3498DB]/30 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3498DB] resize-none"
            placeholder="Ex: Une nouvelle chaîne vient d'être ajoutée sur ORYZ"
            maxLength={120}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {body.length}/120 caractères
          </p>
        </div>

        {/* Icône (optionnel) */}
        <div>
          <Label htmlFor="notif-icon" className="text-white font-label text-xs">
            URL de l'icône (optionnel)
          </Label>
          <Input
            id="notif-icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white text-sm"
            placeholder="/icon-192x192.png"
          />
        </div>

        {/* Messages de statut */}
        {status === 'error' && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500 font-sans">{errorMessage}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-500 font-sans">
              Notification envoyée avec succès !
            </p>
          </div>
        )}

        {/* Bouton d'envoi */}
        <Button
          onClick={handleSendNotification}
          disabled={isSending || !title.trim() || !body.trim()}
          className="w-full bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-bold h-12"
        >
          {isSending ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Envoyée !
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Envoyer la notification
            </>
          )}
        </Button>

        {/* Info */}
        <div className="p-3 bg-[#3498DB]/10 border border-[#3498DB]/30 rounded-lg">
          <p className="text-xs text-white/70 font-sans leading-relaxed">
            <Bell className="h-3.5 w-3.5 inline-block mr-1 text-[#3498DB]" />
            <strong>Notification immédiate :</strong> Une notification de test sera affichée sur votre navigateur pour vérifier le format et le contenu.
          </p>
        </div>
      </div>
    </CollapsibleCard>
  );
}

