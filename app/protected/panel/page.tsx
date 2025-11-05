'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  getActiveHeroConfig,
  getAllHeroes,
  createHero,
  updateHeroConfig,
  deleteHero,
  updateHeroOrder,
  toggleHeroActive,
  getActiveVisitorsCount,
  getTopPages24h,
  getTopPages7d,
  getGlobalStats,
  isAdmin,
  getAppSetting,
  updateAppSetting,
  getAllAppSettings,
  type HeroConfig,
  type TopPage
} from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageCropUpload } from '@/components/admin/image-crop-upload';
import { NotificationManager } from '@/components/admin/notification-manager';
import { NotificationStatsCard } from '@/components/admin/notification-stats-card';
import { PushDevicesList } from '@/components/admin/push-devices-list';
import { NotificationDiagnostic } from '@/components/admin/notification-diagnostic';
import { TestNotificationAll } from '@/components/admin/test-notification-all';
import { NotificationDebugPanel } from '@/components/admin/notification-debug-panel';
import { ScheduledNotificationsManager } from '@/components/admin/scheduled-notifications-manager';
import {
  Save, Users, Eye, TrendingUp, Calendar,
  Loader2, Lock, AlertCircle, CheckCircle2, KeyRound, LogOut, Home, ArrowLeft,
  Plus, Edit, Trash2, ArrowUp, ArrowDown, X, ChevronDown, ChevronRight, Clock, Settings, Image, Bell, Calendar as CalendarIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Hero Config State
  const [heroes, setHeroes] = useState<HeroConfig[]>([]);
  const [editingHero, setEditingHero] = useState<HeroConfig | null>(null);
  const [isCreatingHero, setIsCreatingHero] = useState(false);
  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_url: '',
    image_url: '',
    mobile_aspect_ratio: 16 / 9 // Ratio mobile par défaut
  });

  // Analytics State
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [topPages24h, setTopPages24h] = useState<TopPage[]>([]);
  const [topPages7d, setTopPages7d] = useState<TopPage[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalViews24h: 0,
    totalViews7d: 0,
    uniqueVisitors24h: 0,
    uniqueVisitors7d: 0
  });

  // App Settings State
  const [iframeSandboxEnabled, setIframeSandboxEnabled] = useState(false);
  const [isSavingSandbox, setIsSavingSandbox] = useState(false);
  const [freePreviewEnabled, setFreePreviewEnabled] = useState(true);
  const [isSavingFreePreview, setIsSavingFreePreview] = useState(false);

  // Sports Schedule State
  const [isSportsScheduleOpen, setIsSportsScheduleOpen] = useState(false);
  const [sportsScheduleText, setSportsScheduleText] = useState('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleSaveStatus, setScheduleSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scheduleSaveMessage, setScheduleSaveMessage] = useState('');
  
  // Subscriptions State
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  
  // Sections State - Pour organiser le panel
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Vérifier l'authentification
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?redirect=/protected/panel');
        return;
      }

      // Vérifier si l'utilisateur est admin
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error || !admin || !admin.is_super_admin) {
        router.push('/');
        return;
      }

      setIsAuthenticated(true);
      loadData();
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/auth/login?redirect=/protected/panel');
    }
  };

  // Charger les abonnements actifs
  const loadSubscriptions = async () => {
    setIsLoadingSubscriptions(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('active_subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading subscriptions:', error);
        setActiveSubscriptions([]);
      } else {
        setActiveSubscriptions(data || []);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setActiveSubscriptions([]);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  // Charger les données
  const loadData = async () => {
    setIsLoading(true);

    try {
      const [allHeroes, visitors, pages24h, pages7d, stats, sandboxSetting, freePreviewSetting] = await Promise.all([
        getAllHeroes(),
        getActiveVisitorsCount(),
        getTopPages24h(),
        getTopPages7d(),
        getGlobalStats(),
        getAppSetting('iframe_sandbox_enabled'),
        getAppSetting('free_preview_enabled')
      ]);

      setHeroes(allHeroes);
      setActiveVisitors(visitors);
      setTopPages24h(pages24h);
      setTopPages7d(pages7d);
      setGlobalStats(stats);
      setIframeSandboxEnabled(sandboxSetting !== 'false');
      setFreePreviewEnabled(freePreviewSetting !== 'false');
      
      // Charger les abonnements actifs
      await loadSubscriptions();
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir les analytics et les abonnements toutes les 10 secondes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const visitors = await getActiveVisitorsCount();
      setActiveVisitors(visitors);
      // Rafraîchir les abonnements actifs
      await loadSubscriptions();
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Rafraîchir automatiquement lors du focus de la fenêtre
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleFocus = () => {
      loadSubscriptions();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated]);

  // Sauvegarder le paramètre sandbox
  const handleSaveSandbox = async () => {
    setIsSavingSandbox(true);
    setSaveStatus('idle');

    try {
      const success = await updateAppSetting(
        'iframe_sandbox_enabled',
        iframeSandboxEnabled ? 'true' : 'false',
        'Active ou désactive l\'attribut sandbox sur les iframes de lecture vidéo'
      );

      if (success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving sandbox setting:', error);
      setSaveStatus('error');
    } finally {
      setIsSavingSandbox(false);
    }
  };

  // Sauvegarder le paramètre free preview
  const handleSaveFreePreview = async () => {
    setIsSavingFreePreview(true);
    setSaveStatus('idle');

    try {
      const success = await updateAppSetting(
        'free_preview_enabled',
        freePreviewEnabled ? 'true' : 'false',
        'Active ou désactive le visionnage gratuit de 15 minutes pour les chaînes premium'
      );

      if (success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving free preview setting:', error);
      setSaveStatus('error');
    } finally {
      setIsSavingFreePreview(false);
    }
  };

  // Sauvegarder le planning sportif
  const handleSaveSportsSchedule = async () => {
    if (!sportsScheduleText.trim()) {
      setScheduleSaveStatus('error');
      setScheduleSaveMessage('Veuillez coller le planning sportif');
      return;
    }

    setIsSavingSchedule(true);
    setScheduleSaveStatus('idle');
    setScheduleSaveMessage('');

    try {
      const response = await fetch('/api/admin/sports-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduleText: sportsScheduleText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      setScheduleSaveStatus('success');
      setScheduleSaveMessage(
        `✅ Planning mis à jour : ${data.stats?.totalMatches || 0} matches, ${data.stats?.totalChannels || 0} jours. ` +
        `⚠️ Note : Vous devez redémarrer le serveur pour voir les changements.`
      );
      setSportsScheduleText(''); // Vider le texte après sauvegarde
    } catch (error: any) {
      console.error('Error saving sports schedule:', error);
      setScheduleSaveStatus('error');
      setScheduleSaveMessage(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Ouvrir le formulaire de création
  const handleCreateHero = () => {
    setIsCreatingHero(true);
    setEditingHero(null);
    setHeroConfig({
      title: '',
      subtitle: '',
      cta_text: '',
      cta_url: '',
      image_url: ''
    });
  };

  // Ouvrir le formulaire d'édition
  const handleEditHero = (hero: HeroConfig) => {
    setEditingHero(hero);
    setIsCreatingHero(false);
    setHeroConfig({
      title: hero.title,
      subtitle: hero.subtitle,
      cta_text: hero.cta_text,
      cta_url: hero.cta_url,
      image_url: hero.image_url,
      image_mobile_url: hero.image_mobile_url,
      image_desktop_url: hero.image_desktop_url,
      mobile_aspect_ratio: hero.mobile_aspect_ratio || 16 / 9 // Charger le ratio mobile depuis la base
    });
  };

  // Annuler l'édition/création
  const handleCancelHero = () => {
    setIsCreatingHero(false);
    setEditingHero(null);
    setHeroConfig({
      title: '',
      subtitle: '',
      cta_text: '',
      cta_url: '',
      image_url: '',
      mobile_aspect_ratio: 16 / 9 // Réinitialiser au ratio par défaut
    });
  };

  // Sauvegarder le hero (création ou modification)
  const handleSaveHero = async () => {
    // Validation des champs requis
    if (!heroConfig.title || !heroConfig.subtitle || !heroConfig.cta_text || !heroConfig.cta_url) {
      setSaveStatus('error');
      alert('Veuillez remplir tous les champs requis (Titre, Sous-titre, Texte CTA, URL CTA)');
      return;
    }

    // Vérifier qu'au moins une image est présente
    if (!heroConfig.image_url && !heroConfig.image_mobile_url && !heroConfig.image_desktop_url) {
      setSaveStatus('error');
      alert('Veuillez uploader au moins une image (image principale, mobile ou desktop)');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      let success = false;
      if (editingHero?.id) {
        // Modifier un hero existant - inclure le ratio mobile dans la sauvegarde
        success = await updateHeroConfig({
          ...heroConfig,
          mobile_aspect_ratio: heroConfig.mobile_aspect_ratio || 16 / 9
        }, editingHero.id);
      } else {
        // Créer un nouveau hero - inclure le ratio mobile dans la création
        const result = await createHero({
          ...heroConfig,
          mobile_aspect_ratio: heroConfig.mobile_aspect_ratio || 16 / 9
        });
        success = result.success;
      }

    if (success) {
      setSaveStatus('success');
        await loadData(); // Recharger la liste
        setTimeout(() => {
          setSaveStatus('idle');
          handleCancelHero();
        }, 2000);
    } else {
      setSaveStatus('error');
        alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error saving hero:', error);
      setSaveStatus('error');
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
    setIsSaving(false);
    }
  };

  // Supprimer un hero
  const handleDeleteHero = async (heroId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce hero ? Cette action est irréversible et supprimera aussi les images du storage.')) {
      return;
    }

    try {
      const success = await deleteHero(heroId);
      if (success) {
        await loadData(); // Recharger la liste
        // Afficher un message de succès
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        alert('Erreur lors de la suppression. Veuillez réessayer.');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Error deleting hero:', error);
      setSaveStatus('error');
      alert('Erreur lors de la suppression. Veuillez réessayer.');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Changer l'ordre d'un hero
  const handleMoveHero = async (heroId: string, direction: 'up' | 'down') => {
    const heroIndex = heroes.findIndex(h => h.id === heroId);
    if (heroIndex === -1) return;

    const targetIndex = direction === 'up' ? heroIndex - 1 : heroIndex + 1;
    if (targetIndex < 0 || targetIndex >= heroes.length) return;

    const hero = heroes[heroIndex];
    const targetHero = heroes[targetIndex];
    
    const tempOrder = hero.display_order || 0;
    const newOrder = targetHero.display_order || 0;

    await Promise.all([
      updateHeroOrder(heroId, newOrder),
      updateHeroOrder(targetHero.id!, tempOrder)
    ]);

    await loadData(); // Recharger la liste
  };

  // Activer/désactiver un hero
  const handleToggleHeroActive = async (heroId: string, isActive: boolean) => {
    const success = await toggleHeroActive(heroId, isActive);
    if (success) {
      await loadData(); // Recharger la liste
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth/login';
    }
  };

  // Changer le mot de passe
  const handleChangePassword = async () => {
    setPasswordError('');

    // Validations
    if (!newPassword || !confirmPassword) {
      setPasswordError('Tous les champs sont requis');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        // Réinitialiser et fermer
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(false);
        alert('✅ Mot de passe changé avec succès !');
      } else {
        setPasswordError(data.error || 'Erreur lors du changement');
      }
    } catch (error) {
      setPasswordError('Erreur de connexion');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">
            VÉRIFICATION...
          </h2>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#3498DB]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white uppercase">
                ADMIN ORYZ
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-1">
                Tableau de bord administrateur
              </p>
            </div>
            <div className="flex gap-2">
              {/* Bouton Retour page précédente - Visible partout */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.back()}
                className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white"
                title="Page précédente"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {/* Bouton Accueil - Toujours visible */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/')}
                className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white"
                title="Retour à l'accueil"
              >
                <Home className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPasswordModal(true)}
                className="border-[#3498DB]/50 text-[#3498DB] hover:bg-[#3498DB] hover:border-[#3498DB] hover:text-white bg-[#3498DB]/10 transition-all shadow-sm hover:shadow-[#3498DB]/30"
                title="Changer le mot de passe"
              >
                <KeyRound className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white hidden sm:flex"
              >
                Retour au site
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Visiteurs actifs */}
          <div className="bg-gradient-to-br from-[#0F4C81]/20 to-[#3498DB]/20 border border-[#3498DB]/30 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#3498DB]" />
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-display font-bold text-white">
              {activeVisitors}
            </p>
            <p className="text-xs text-white/60 font-sans mt-1">
              Visiteurs en ligne
            </p>
          </div>

          {/* Vues 24h */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 sm:p-6">
            <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mb-2" />
            <p className="text-2xl sm:text-3xl font-display font-bold text-white">
              {globalStats.totalViews24h}
            </p>
            <p className="text-xs text-white/60 font-sans mt-1">
              Vues (24h)
            </p>
          </div>

          {/* Visiteurs uniques 24h */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 sm:p-6">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mb-2" />
            <p className="text-2xl sm:text-3xl font-display font-bold text-white">
              {globalStats.uniqueVisitors24h}
            </p>
            <p className="text-xs text-white/60 font-sans mt-1">
              Visiteurs uniques (24h)
            </p>
          </div>

          {/* Vues 7j */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 sm:p-6">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400 mb-2" />
            <p className="text-2xl sm:text-3xl font-display font-bold text-white">
              {globalStats.totalViews7d}
            </p>
            <p className="text-xs text-white/60 font-sans mt-1">
              Vues (7 jours)
            </p>
          </div>
        </div>

        {/* Navigation par sections */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-3 p-1 bg-white/5 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-label font-semibold rounded-md transition-all ${
                activeSection === 'overview'
                  ? 'bg-gradient-to-r from-[#3498DB] to-[#0F4C81] text-white shadow-lg shadow-[#3498DB]/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1.5 sm:mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveSection('content')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-label font-semibold rounded-md transition-all ${
                activeSection === 'content'
                  ? 'bg-gradient-to-r from-[#3498DB] to-[#0F4C81] text-white shadow-lg shadow-[#3498DB]/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Image className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1.5 sm:mr-2" />
              Contenu
            </button>
            <button
              onClick={() => setActiveSection('settings')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-label font-semibold rounded-md transition-all ${
                activeSection === 'settings'
                  ? 'bg-gradient-to-r from-[#3498DB] to-[#0F4C81] text-white shadow-lg shadow-[#3498DB]/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1.5 sm:mr-2" />
              Paramètres
            </button>
            <button
              onClick={() => setActiveSection('notifications')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-label font-semibold rounded-md transition-all ${
                activeSection === 'notifications'
                  ? 'bg-gradient-to-r from-[#3498DB] to-[#0F4C81] text-white shadow-lg shadow-[#3498DB]/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1.5 sm:mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveSection('sports')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-label font-semibold rounded-md transition-all ${
                activeSection === 'sports'
                  ? 'bg-gradient-to-r from-[#3498DB] to-[#0F4C81] text-white shadow-lg shadow-[#3498DB]/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1.5 sm:mr-2" />
              Sports
            </button>
          </div>
        </div>

        {/* Section Vue d'ensemble */}
        {activeSection === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Abonnements Actifs */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-display font-bold text-white uppercase">
                  Abonnements Actifs ({activeSubscriptions.length})
                </h2>
                <Button
                  onClick={loadSubscriptions}
                  disabled={isLoadingSubscriptions}
                  className="bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-semibold text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                >
                  {isLoadingSubscriptions ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    'Actualiser'
                  )}
                </Button>
              </div>
              {isLoadingSubscriptions && activeSubscriptions.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#3498DB]" />
                </div>
              ) : activeSubscriptions.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activeSubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${
                            sub.status === 'trial' ? 'bg-yellow-400' :
                            sub.status === 'active' ? 'bg-green-400' :
                            'bg-red-400'
                          }`} />
                          <p className="text-sm text-white font-sans font-semibold truncate">
                            {sub.username || sub.email || 'Utilisateur'}
                          </p>
                          <span className={`px-2 py-0.5 rounded text-xs font-label font-semibold ${
                            sub.status === 'trial' ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' :
                            sub.status === 'active' ? 'bg-green-400/20 text-green-400 border border-green-400/30' :
                            'bg-red-400/20 text-red-400 border border-red-400/30'
                          }`}>
                            {sub.status === 'trial' ? 'Essai' :
                             sub.status === 'active' ? 'Actif' :
                             sub.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/60">
                          <p>
                            <span className="font-semibold">Plan:</span>{' '}
                            {sub.plan_type === 'kickoff' ? 'Kick-Off' :
                             sub.plan_type === 'pro_league' ? 'Pro League' :
                             sub.plan_type === 'vip' ? 'VIP' : 'Premium'}
                          </p>
                          {sub.trial_end && (
                            <p>
                              <span className="font-semibold">Fin essai:</span>{' '}
                              {new Date(sub.trial_end).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                          {sub.current_period_end && (
                            <p>
                              <span className="font-semibold">Fin période:</span>{' '}
                              {new Date(sub.current_period_end).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 text-right flex-shrink-0">
                        {sub.price_monthly && (
                          <p className="text-lg font-display font-bold text-[#3498DB]">
                            {sub.price_monthly.toFixed(2)}€
                          </p>
                        )}
                        <p className="text-xs text-white/60">
                          /mois
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-white/40 py-8 font-sans">
                  Aucun abonnement actif
                </p>
              )}
            </div>

            {/* Top Pages 24h */}
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-4 uppercase">
                Top Pages (24h)
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {topPages24h.slice(0, 10).map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#333333]/50 rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-sans truncate">
                        {page.page_title || page.page_url}
                      </p>
                      <p className="text-xs text-white/40 font-mono truncate">
                        {page.page_url}
                      </p>
                    </div>
                    <div className="ml-4 text-right flex-shrink-0">
                      <p className="text-lg font-display font-bold text-[#3498DB]">
                        {page.view_count}
                      </p>
                      <p className="text-xs text-white/60">
                        {page.unique_visitors} uniques
                      </p>
                    </div>
                  </div>
                ))}
                {topPages24h.length === 0 && (
                  <p className="text-center text-white/40 py-8 font-sans">
                    Aucune donnée disponible
                  </p>
                )}
              </div>
            </div>

            {/* Top Pages 7 jours */}
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-4 uppercase">
                Top Pages (7 jours)
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {topPages7d.slice(0, 10).map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#333333]/50 rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-sans truncate">
                        {page.page_title || page.page_url}
                      </p>
                      <p className="text-xs text-white/40 font-mono truncate">
                        {page.page_url}
                      </p>
                    </div>
                    <div className="ml-4 text-right flex-shrink-0">
                      <p className="text-lg font-display font-bold text-[#3498DB]">
                        {page.view_count}
                      </p>
                      <p className="text-xs text-white/60">
                        {page.unique_visitors} uniques
                      </p>
                    </div>
                  </div>
                ))}
                {topPages7d.length === 0 && (
                  <p className="text-center text-white/40 py-8 font-sans">
                    Aucune donnée disponible
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section Contenu */}
        {activeSection === 'content' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Heroes List */}
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-display font-bold text-white uppercase">
                  Gestion des Heroes
                </h2>
                <Button
                  onClick={handleCreateHero}
                  className="bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-semibold text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Nouveau Hero</span>
                  <span className="sm:hidden">Nouveau</span>
                </Button>
              </div>

              {/* Liste des heroes */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {heroes.map((hero, index) => (
                  <div
                    key={hero.id}
                    className={`p-3 sm:p-4 rounded-lg border ${
                      hero.is_active
                        ? 'bg-[#333333]/50 border-[#3498DB]/30'
                        : 'bg-[#333333]/30 border-[#333333] opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {/* Image thumbnail */}
                      {hero.image_url && (
                        <div className="w-16 h-10 sm:w-20 sm:h-12 rounded overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                          <img
                            src={hero.image_url}
                            alt={hero.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-display font-bold text-xs sm:text-sm line-clamp-1">
                              {hero.title || 'Sans titre'}
                            </h3>
                            <p className="text-white/60 font-sans text-[10px] sm:text-xs line-clamp-1 mt-1">
                              {hero.subtitle || 'Sans sous-titre'}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 sm:mt-2 flex-wrap">
                              {hero.is_active ? (
                                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs bg-green-600/20 text-green-400 border border-green-600/30">
                                  Actif
                                </span>
                              ) : (
                                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs bg-gray-600/20 text-gray-400 border border-gray-600/30">
                                  Inactif
                                </span>
                              )}
                              <span className="text-[10px] sm:text-xs text-white/40">
                                Ordre: {hero.display_order || 0}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                            <Button
                              onClick={() => handleMoveHero(hero.id!, 'up')}
                              disabled={index === 0}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                              title="Déplacer vers le haut"
                            >
                              <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              onClick={() => handleMoveHero(hero.id!, 'down')}
                              disabled={index === heroes.length - 1}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                              title="Déplacer vers le bas"
                            >
                              <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              onClick={() => handleEditHero(hero)}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-white/70 hover:text-[#3498DB] hover:bg-[#3498DB]/10"
                              title="Modifier"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              onClick={() => handleToggleHeroActive(hero.id!, !hero.is_active)}
                              variant="ghost"
                              size="icon"
                              className={`h-7 w-7 sm:h-8 sm:w-8 ${
                                hero.is_active
                                  ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10'
                                  : 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                              }`}
                              title={hero.is_active ? 'Désactiver' : 'Activer'}
                            >
                              <Eye className={`h-3 w-3 sm:h-4 sm:w-4 ${hero.is_active ? '' : 'opacity-50'}`} />
                            </Button>
                            <Button
                              onClick={() => handleDeleteHero(hero.id!)}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {heroes.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    <p className="font-sans text-sm sm:text-base">Aucun hero configuré</p>
                    <Button
                      onClick={handleCreateHero}
                      className="mt-4 bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-semibold text-xs sm:text-sm h-9 sm:h-10 px-4 sm:px-6"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Créer le premier hero
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Formulaire de création/édition */}
            {(isCreatingHero || editingHero) && (
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-white uppercase">
                    {editingHero ? 'Modifier le Hero' : 'Nouveau Hero'}
                  </h2>
                  <Button
                    onClick={handleCancelHero}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>

              <div className="space-y-4">
                <div>
                    <Label htmlFor="title" className="text-white font-label text-xs sm:text-sm">
                    Titre
                  </Label>
                  <Input
                    id="title"
                    value={heroConfig.title}
                    onChange={(e) => setHeroConfig({ ...heroConfig, title: e.target.value })}
                      className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white text-xs sm:text-sm h-9 sm:h-10"
                    placeholder="Titre du hero"
                  />
                </div>

                <div>
                    <Label htmlFor="subtitle" className="text-white font-label text-xs sm:text-sm">
                    Sous-titre
                  </Label>
                  <Input
                    id="subtitle"
                    value={heroConfig.subtitle}
                    onChange={(e) => setHeroConfig({ ...heroConfig, subtitle: e.target.value })}
                      className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white text-xs sm:text-sm h-9 sm:h-10"
                    placeholder="Description"
                  />
                </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                      <Label htmlFor="cta_text" className="text-white font-label text-xs sm:text-sm">
                      Texte du bouton
                    </Label>
                    <Input
                      id="cta_text"
                      value={heroConfig.cta_text}
                      onChange={(e) => setHeroConfig({ ...heroConfig, cta_text: e.target.value })}
                        className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white text-xs sm:text-sm h-9 sm:h-10"
                      placeholder="Ex: Regarder"
                    />
                  </div>

                  <div>
                      <Label htmlFor="cta_url" className="text-white font-label text-xs sm:text-sm">
                      Lien du bouton
                    </Label>
                    <Input
                      id="cta_url"
                      value={heroConfig.cta_url}
                      onChange={(e) => setHeroConfig({ ...heroConfig, cta_url: e.target.value })}
                        className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white text-xs sm:text-sm h-9 sm:h-10"
                      placeholder="/watch/1"
                    />
                  </div>
                </div>

                  {/* Ratio Mobile */}
                  <div>
                    <Label htmlFor="mobile-aspect-ratio" className="text-white font-label text-xs sm:text-sm mb-2 block">
                      Ratio Mobile
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto min-w-[180px] sm:min-w-[200px] justify-between bg-[#333333] border-[#3498DB]/30 text-white hover:border-[#3498DB]/50 hover:bg-[#3498DB]/10 text-xs sm:text-sm h-9 sm:h-10"
                        >
                          <span className="font-label">
                            {(() => {
                            const ratio = heroConfig.mobile_aspect_ratio || 16 / 9;
                            if (Math.abs(ratio - (16 / 9)) < 0.001) return '16:9 (Cinéma)';
                            if (Math.abs(ratio - (21 / 9)) < 0.001) return '21:9 (Ultra large)';
                            if (Math.abs(ratio - (4 / 3)) < 0.001) return '4:3 (Classique)';
                            if (Math.abs(ratio - 1) < 0.001) return '1:1 (Carré)';
                            if (Math.abs(ratio - (9 / 16)) < 0.001) return '9:16 (Portrait)';
                            if (Math.abs(ratio - (3 / 4)) < 0.001) return '3:4 (Portrait classique)';
                            if (Math.abs(ratio - (2 / 3)) < 0.001) return '2:3 (Portrait)';
                            if (Math.abs(ratio - (4 / 5)) < 0.001) return '4:5 (Portrait Instagram)';
                            return `${ratio.toFixed(2)}:1`;
                            })()}
                          </span>
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-2 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-[180px] sm:w-[200px] bg-[#1a1a1a] border-[#333333]"
                        align="start"
                      >
                        <DropdownMenuItem
                          onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 16 / 9 })}
                          className={`cursor-pointer text-xs sm:text-sm ${
                            Math.abs((heroConfig.mobile_aspect_ratio || 16 / 9) - (16 / 9)) < 0.001 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                          }`}
                        >
                          16:9 (Cinéma)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 21 / 9 })}
                          className={`cursor-pointer text-xs sm:text-sm ${
                            Math.abs((heroConfig.mobile_aspect_ratio || 16 / 9) - (21 / 9)) < 0.001 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                          }`}
                        >
                          21:9 (Ultra large)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 4 / 3 })}
                          className={`cursor-pointer text-xs sm:text-sm ${
                            Math.abs((heroConfig.mobile_aspect_ratio || 16 / 9) - (4 / 3)) < 0.001 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                          }`}
                        >
                          4:3 (Classique)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 1 })}
                          className={`cursor-pointer text-xs sm:text-sm ${
                            Math.abs((heroConfig.mobile_aspect_ratio || 16 / 9) - 1) < 0.001 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                          }`}
                        >
                          1:1 (Carré)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 9 / 16 })}
                          className={`cursor-pointer text-xs sm:text-sm ${
                            Math.abs((heroConfig.mobile_aspect_ratio || 16 / 9) - (9 / 16)) < 0.001 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                          }`}
                        >
                          9:16 (Portrait)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 3 / 4 })}
                          className={`cursor-pointer text-xs sm:text-sm ${
                            Math.abs((heroConfig.mobile_aspect_ratio || 16 / 9) - (3 / 4)) < 0.001 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                          }`}
                        >
                          3:4 (Portrait classique)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 2 / 3 })}
                          className={`cursor-pointer text-xs sm:text-sm ${
                            Math.abs((heroConfig.mobile_aspect_ratio || 16 / 9) - (2 / 3)) < 0.001 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                          }`}
                        >
                          2:3 (Portrait)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 4 / 5 })}
                          className={`cursor-pointer text-xs sm:text-sm ${
                            Math.abs((heroConfig.mobile_aspect_ratio || 16 / 9) - (4 / 5)) < 0.001 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                          }`}
                        >
                          4:5 (Portrait Instagram)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-[10px] sm:text-xs text-white/50 mt-1.5 sm:mt-2 font-sans">
                      Sélectionnez le ratio souhaité pour le recadrage mobile
                    </p>
                  </div>

                {/* Image Upload with Crop */}
                <ImageCropUpload
                  bucket="hero-images"
                  currentImage={heroConfig.image_url}
                    currentMobileImage={heroConfig.image_mobile_url}
                    currentDesktopImage={heroConfig.image_desktop_url}
                    label="Image Hero"
                    onUploadComplete={(url) => {
                      setHeroConfig(prev => ({ 
                        ...prev, 
                        image_url: url || '' 
                      }));
                      if (!url) {
                        setTimeout(() => loadData(), 500);
                      }
                    }}
                    onUploadCompleteMobile={(url) => {
                      setHeroConfig(prev => ({ 
                        ...prev, 
                        image_mobile_url: url || undefined 
                      }));
                      if (!url) {
                        setTimeout(() => loadData(), 500);
                      }
                    }}
                    onUploadCompleteDesktop={(url) => {
                      setHeroConfig(prev => ({ 
                        ...prev, 
                        image_desktop_url: url || undefined 
                      }));
                      if (!url) {
                        setTimeout(() => loadData(), 500);
                      }
                    }}
                  maxSizeMB={10}
                  aspectRatio={21 / 9}
                    mobileAspectRatio={heroConfig.mobile_aspect_ratio || 16 / 9}
                    allowSeparateMobileDesktop={true}
                />

                <div>
                    <Label htmlFor="image_url" className="text-white font-label text-[10px] sm:text-xs text-white/60">
                    Ou entrez une URL manuellement
                  </Label>
                  <Input
                    id="image_url"
                    value={heroConfig.image_url}
                    onChange={(e) => setHeroConfig({ ...heroConfig, image_url: e.target.value })}
                      className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white text-xs sm:text-sm h-9 sm:h-10"
                    placeholder="https://... ou /images/hero/banner.jpg"
                  />
                </div>

                {/* Preview */}
                {heroConfig.image_url && (
                    <div className="mt-3 sm:mt-4">
                      <Label className="text-white font-label text-xs sm:text-sm mb-2 block">
                      Aperçu
                    </Label>
                      <div className="relative h-24 sm:h-32 rounded-lg overflow-hidden bg-gradient-to-br from-[#0F4C81]/10 to-[#3498DB]/10">
                      <img
                        src={heroConfig.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-3 sm:p-4">
                        <div>
                            <p className="text-white font-display font-bold text-xs sm:text-sm line-clamp-1">
                            {heroConfig.title || 'Titre'}
                          </p>
                            <p className="text-white/70 font-sans text-[10px] sm:text-xs line-clamp-1 mt-1">
                            {heroConfig.subtitle || 'Sous-titre'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSaveHero}
                  disabled={isSaving}
                    className="w-full bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-bold text-xs sm:text-sm h-10 sm:h-12"
                >
                  {isSaving ? (
                      <><Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" /> Enregistrement...</>
                  ) : saveStatus === 'success' ? (
                      <><CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Enregistré !</>
                  ) : saveStatus === 'error' ? (
                      <><AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Erreur</>
                  ) : (
                      <><Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Enregistrer</>
                  )}
                </Button>
              </div>
            </div>
            )}
          </div>
        )}

        {/* Section Paramètres */}
        {activeSection === 'settings' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Paramètres Iframe - Sandbox */}
            <div className="bg-gradient-to-br from-[#0F4C81]/20 to-[#3498DB]/20 border border-[#3498DB]/30 rounded-xl p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#0F4C81] to-[#3498DB] flex-shrink-0">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                    Paramètres Iframe
              </h2>
                  <p className="text-xs sm:text-sm text-white/60 font-sans">
                    Gérer l'attribut sandbox des iframes de lecture vidéo
                      </p>
                    </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <Label htmlFor="sandbox-toggle" className="text-white font-label font-semibold text-sm sm:text-base mb-1 block">
                      Activer le sandbox
                    </Label>
                    <p className="text-xs sm:text-sm text-white/60 font-sans">
                      Active l'attribut sandbox sur les iframes pour plus de sécurité. 
                      Désactivez si certains lecteurs vidéo ne fonctionnent pas correctement.
                      </p>
                    </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={iframeSandboxEnabled}
                        onChange={(e) => setIframeSandboxEnabled(e.target.checked)}
                        className="sr-only peer"
                        id="sandbox-toggle"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3498DB]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3498DB]"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    onClick={handleSaveSandbox}
                    disabled={isSavingSandbox}
                    className="bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-semibold text-xs sm:text-sm h-9 sm:h-10 px-4 sm:px-6"
                  >
                    {isSavingSandbox ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                  {saveStatus === 'success' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-label">Enregistré !</span>
                    </div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-label">Erreur</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Paramètres Free Preview */}
            <div className="bg-gradient-to-br from-[#0F4C81]/20 to-[#3498DB]/20 border border-[#3498DB]/30 rounded-xl p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#0F4C81] to-[#3498DB] flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                    Visionnage Gratuit
              </h2>
                  <p className="text-xs sm:text-sm text-white/60 font-sans">
                    Gérer le visionnage gratuit de 15 minutes pour les chaînes premium
                      </p>
                    </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <Label htmlFor="free-preview-toggle" className="text-white font-label font-semibold text-sm sm:text-base mb-1 block">
                      Activer le visionnage gratuit de 15 minutes
                    </Label>
                    <p className="text-xs sm:text-sm text-white/60 font-sans">
                      Permet aux utilisateurs non abonnés de regarder 15 minutes gratuites des chaînes premium avant de devoir s'abonner.
                      </p>
                    </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={freePreviewEnabled}
                        onChange={(e) => setFreePreviewEnabled(e.target.checked)}
                        className="sr-only peer"
                        id="free-preview-toggle"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3498DB]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3498DB]"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    onClick={handleSaveFreePreview}
                    disabled={isSavingFreePreview}
                    className="bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-semibold text-xs sm:text-sm h-9 sm:h-10 px-4 sm:px-6"
                  >
                    {isSavingFreePreview ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                  {saveStatus === 'success' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-label">Enregistré !</span>
              </div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-label">Erreur</span>
            </div>
                  )}
          </div>
        </div>
            </div>
          </div>
        )}

        {/* Section Notifications */}
        {activeSection === 'notifications' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Statistiques des Notifications */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-4 sm:mb-6">
                Statistiques des Notifications
              </h2>
              <NotificationStatsCard />
          </div>

            {/* Envoi de Notification */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-4 sm:mb-6">
                Envoyer une Notification
              </h2>
              <NotificationManager />
            </div>

            {/* Notifications Programmées */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-4 sm:mb-6">
                Notifications Programmées
              </h2>
              <ScheduledNotificationsManager />
            </div>

            {/* Liste des Appareils Push */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-4 sm:mb-6">
                Appareils avec Notifications Push
              </h2>
              <PushDevicesList />
            </div>

            {/* Test de Notification */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-4 sm:mb-6">
                Test de Notification
              </h2>
            <TestNotificationAll />
          </div>

            {/* Diagnostic des Notifications */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-4 sm:mb-6">
                Diagnostic des Notifications
              </h2>
              <NotificationDiagnostic />
        </div>

            {/* Panel de Debug */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-4 sm:mb-6">
                Panel de Debug
              </h2>
          <NotificationDebugPanel />
        </div>
          </div>
        )}

        {/* Section Sports */}
        {activeSection === 'sports' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Planning Sportif */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#0F4C81] to-[#3498DB] flex-shrink-0">
                    <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-white">
                      Planning Sportif
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 font-label">
                      Collez le planning sportif pour mise à jour automatique
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsSportsScheduleOpen(!isSportsScheduleOpen)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 text-white/70 hover:text-white hover:bg-white/10"
                >
                    {isSportsScheduleOpen ? (
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                </Button>
        </div>

              {isSportsScheduleOpen && (
                <div className="space-y-4 mt-4 sm:mt-6">
                  <div>
                    <Label htmlFor="sports-schedule" className="text-white font-label text-xs sm:text-sm mb-2 block">
                      Planning Sportif
                    </Label>
                    <textarea
                      id="sports-schedule"
                      value={sportsScheduleText}
                      onChange={(e) => setSportsScheduleText(e.target.value)}
                      className="w-full h-48 sm:h-64 md:h-80 p-3 sm:p-4 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white text-xs sm:text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                      placeholder={`Exemple:
SATURDAY

HD1 ENGLISH
HD2 ENGLISH
...

04:00   Match 1 | https://...
06:00   Match 2 | https://...
...`}
                    />
        </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <Button
                      onClick={handleSaveSportsSchedule}
                      disabled={isSavingSchedule || !sportsScheduleText.trim()}
                      className="bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-semibold text-xs sm:text-sm h-9 sm:h-10 px-4 sm:px-6"
                    >
                      {isSavingSchedule ? (
                        <>
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          Mettre à jour le planning
                        </>
                      )}
                    </Button>
                    {scheduleSaveStatus === 'success' && (
                      <div className="flex items-center gap-2 text-green-400 text-xs sm:text-sm">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="font-label">{scheduleSaveMessage}</span>
        </div>
                    )}
                    {scheduleSaveStatus === 'error' && (
                      <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="font-label">{scheduleSaveMessage}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Changement de Mot de Passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border-2 border-[#3498DB]/30 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl shadow-[#3498DB]/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#3498DB]/20 rounded-lg">
                <KeyRound className="h-6 w-6 text-[#3498DB]" />
                </div>
                <h3 className="text-xl font-display font-bold text-white uppercase">
                  Changer le mot de passe
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Erreur */}
            {passwordError && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500 font-sans">{passwordError}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Nouveau mot de passe */}
              <div>
                <Label htmlFor="new-password" className="text-white font-label mb-2 block">
                  Nouveau mot de passe
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#333333] border-[#3498DB]/30 text-white h-12"
                  placeholder="Au moins 8 caractères"
                  disabled={isChangingPassword}
                />
              </div>

              {/* Confirmer nouveau mot de passe */}
              <div>
                <Label htmlFor="confirm-password" className="text-white font-label mb-2 block">
                  Confirmer le nouveau mot de passe
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#333333] border-[#3498DB]/30 text-white h-12"
                  placeholder="Retapez votre nouveau mot de passe"
                  disabled={isChangingPassword}
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={isChangingPassword}
                  className="flex-1 h-12 border-[#333333] hover:bg-[#333333] text-white"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="flex-1 h-12 bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-bold"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Changement...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Confirmer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

