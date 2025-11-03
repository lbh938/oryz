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
import {
  Save, Users, Eye, TrendingUp, Calendar,
  Loader2, Lock, AlertCircle, CheckCircle2, KeyRound, LogOut, Home, ArrowLeft,
  Plus, Edit, Trash2, ArrowUp, ArrowDown, X, ChevronDown
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

  // Charger les données
  const loadData = async () => {
    setIsLoading(true);

    try {
      const [allHeroes, visitors, pages24h, pages7d, stats, sandboxSetting] = await Promise.all([
        getAllHeroes(),
        getActiveVisitorsCount(),
        getTopPages24h(),
        getTopPages7d(),
        getGlobalStats(),
        getAppSetting('iframe_sandbox_enabled')
      ]);

      setHeroes(allHeroes);

      setActiveVisitors(visitors);
      setTopPages24h(pages24h);
      setTopPages7d(pages7d);
      setGlobalStats(stats);
      setIframeSandboxEnabled(sandboxSetting === 'true');
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir les analytics toutes les 10 secondes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const visitors = await getActiveVisitorsCount();
      setActiveVisitors(visitors);
    }, 10000);

    return () => clearInterval(interval);
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
      }
    } catch (error) {
      console.error('Error saving hero:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Supprimer un hero
  const handleDeleteHero = async (heroId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce hero ?')) {
      return;
    }

    const success = await deleteHero(heroId);
    if (success) {
      await loadData(); // Recharger la liste
    } else {
      alert('Erreur lors de la suppression');
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

        {/* Paramètres Iframe - Sandbox */}
        <div className="bg-gradient-to-br from-[#0F4C81]/20 to-[#3498DB]/20 border border-[#3498DB]/30 rounded-xl p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#0F4C81] to-[#3498DB]">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white">
                Paramètres Iframe
              </h2>
              <p className="text-sm text-white/60 font-sans">
                Gérer l'attribut sandbox des iframes de lecture vidéo
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-1">
                <Label htmlFor="sandbox-toggle" className="text-white font-label font-semibold text-base mb-1 block">
                  Activer le sandbox
                </Label>
                <p className="text-sm text-white/60 font-sans">
                  Active l'attribut sandbox sur les iframes pour plus de sécurité. 
                  Désactivez si certains lecteurs vidéo ne fonctionnent pas correctement.
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
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
                className="bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-semibold"
              >
                {isSavingSandbox ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-label">Enregistré !</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-label">Erreur</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Heroes List */}
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-display font-bold text-white uppercase">
                  Gestion des Heroes
                </h2>
                <Button
                  onClick={handleCreateHero}
                  className="bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-semibold"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Hero
                </Button>
              </div>

              {/* Liste des heroes */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {heroes.map((hero, index) => (
                  <div
                    key={hero.id}
                    className={`p-4 rounded-lg border ${
                      hero.is_active
                        ? 'bg-[#333333]/50 border-[#3498DB]/30'
                        : 'bg-[#333333]/30 border-[#333333] opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Image thumbnail */}
                      {hero.image_url && (
                        <div className="w-20 h-12 rounded overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
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
                            <h3 className="text-white font-display font-bold text-sm line-clamp-1">
                              {hero.title || 'Sans titre'}
                            </h3>
                            <p className="text-white/60 font-sans text-xs line-clamp-1 mt-1">
                              {hero.subtitle || 'Sans sous-titre'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {hero.is_active ? (
                                <span className="px-2 py-0.5 rounded text-xs bg-green-600/20 text-green-400 border border-green-600/30">
                                  Actif
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-xs bg-gray-600/20 text-gray-400 border border-gray-600/30">
                                  Inactif
                                </span>
                              )}
                              <span className="text-xs text-white/40">
                                Ordre: {hero.display_order || 0}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              onClick={() => handleMoveHero(hero.id!, 'up')}
                              disabled={index === 0}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                              title="Déplacer vers le haut"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleMoveHero(hero.id!, 'down')}
                              disabled={index === heroes.length - 1}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                              title="Déplacer vers le bas"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleEditHero(hero)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-[#3498DB] hover:bg-[#3498DB]/10"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleToggleHeroActive(hero.id!, !hero.is_active)}
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                hero.is_active
                                  ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10'
                                  : 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                              }`}
                              title={hero.is_active ? 'Désactiver' : 'Activer'}
                            >
                              <Eye className={`h-4 w-4 ${hero.is_active ? '' : 'opacity-50'}`} />
                            </Button>
                            <Button
                              onClick={() => handleDeleteHero(hero.id!)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {heroes.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    <p className="font-sans">Aucun hero configuré</p>
                    <Button
                      onClick={handleCreateHero}
                      className="mt-4 bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-semibold"
                    >
                      <Plus className="h-4 w-4 mr-2" />
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
                  <h2 className="text-lg sm:text-xl font-display font-bold text-white uppercase">
                    {editingHero ? 'Modifier le Hero' : 'Nouveau Hero'}
                  </h2>
                  <Button
                    onClick={handleCancelHero}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white font-label">
                    Titre
                  </Label>
                  <Input
                    id="title"
                    value={heroConfig.title}
                    onChange={(e) => setHeroConfig({ ...heroConfig, title: e.target.value })}
                    className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white"
                    placeholder="Titre du hero"
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle" className="text-white font-label">
                    Sous-titre
                  </Label>
                  <Input
                    id="subtitle"
                    value={heroConfig.subtitle}
                    onChange={(e) => setHeroConfig({ ...heroConfig, subtitle: e.target.value })}
                    className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white"
                    placeholder="Description"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cta_text" className="text-white font-label">
                      Texte du bouton
                    </Label>
                    <Input
                      id="cta_text"
                      value={heroConfig.cta_text}
                      onChange={(e) => setHeroConfig({ ...heroConfig, cta_text: e.target.value })}
                      className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white"
                      placeholder="Ex: Regarder"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cta_url" className="text-white font-label">
                      Lien du bouton
                    </Label>
                    <Input
                      id="cta_url"
                      value={heroConfig.cta_url}
                      onChange={(e) => setHeroConfig({ ...heroConfig, cta_url: e.target.value })}
                      className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white"
                      placeholder="/watch/1"
                    />
                  </div>
                </div>

                {/* Ratio Mobile - Sélectionnable */}
                <div>
                  <Label htmlFor="mobile-aspect-ratio" className="text-white font-label mb-2 block">
                    Ratio Mobile
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto min-w-[200px] justify-between bg-[#333333] border-[#3498DB]/30 text-white hover:border-[#3498DB]/50 hover:bg-[#3498DB]/10"
                      >
                        <span className="font-label">
                          {(() => {
                            const ratio = heroConfig.mobile_aspect_ratio || 16 / 9;
                            if (ratio === 16 / 9) return '16:9 (Cinéma)';
                            if (ratio === 21 / 9) return '21:9 (Ultra large)';
                            if (ratio === 4 / 3) return '4:3 (Classique)';
                            if (ratio === 1) return '1:1 (Carré)';
                            if (ratio === 9 / 16) return '9:16 (Portrait)';
                            if (ratio === 3 / 4) return '3:4 (Portrait classique)';
                            if (ratio === 2 / 3) return '2:3 (Portrait)';
                            return `${ratio.toFixed(2)}:1`;
                          })()}
                        </span>
                        <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-[200px] bg-[#1a1a1a] border-[#333333]"
                      align="start"
                    >
                      <DropdownMenuItem
                        onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 16 / 9 })}
                        className={`cursor-pointer ${
                          (heroConfig.mobile_aspect_ratio || 16 / 9) === 16 / 9 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                        }`}
                      >
                        16:9 (Cinéma)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 21 / 9 })}
                        className={`cursor-pointer ${
                          (heroConfig.mobile_aspect_ratio || 16 / 9) === 21 / 9 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                        }`}
                      >
                        21:9 (Ultra large)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 4 / 3 })}
                        className={`cursor-pointer ${
                          (heroConfig.mobile_aspect_ratio || 16 / 9) === 4 / 3 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                        }`}
                      >
                        4:3 (Classique)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 1 })}
                        className={`cursor-pointer ${
                          (heroConfig.mobile_aspect_ratio || 16 / 9) === 1 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                        }`}
                      >
                        1:1 (Carré)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 9 / 16 })}
                        className={`cursor-pointer ${
                          (heroConfig.mobile_aspect_ratio || 16 / 9) === 9 / 16 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                        }`}
                      >
                        9:16 (Portrait)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 3 / 4 })}
                        className={`cursor-pointer ${
                          (heroConfig.mobile_aspect_ratio || 16 / 9) === 3 / 4 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                        }`}
                      >
                        3:4 (Portrait classique)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setHeroConfig({ ...heroConfig, mobile_aspect_ratio: 2 / 3 })}
                        className={`cursor-pointer ${
                          (heroConfig.mobile_aspect_ratio || 16 / 9) === 2 / 3 ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold' : ''
                        }`}
                      >
                        2:3 (Portrait)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <p className="text-xs text-white/50 mt-2 font-sans">
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
                  onUploadComplete={(url) => setHeroConfig({ ...heroConfig, image_url: url })}
                  onUploadCompleteMobile={(url) => setHeroConfig({ ...heroConfig, image_mobile_url: url })}
                  onUploadCompleteDesktop={(url) => setHeroConfig({ ...heroConfig, image_desktop_url: url })}
                  maxSizeMB={10}
                  aspectRatio={21 / 9}
                  mobileAspectRatio={heroConfig.mobile_aspect_ratio || 16 / 9} // Ratio mobile depuis la base de données
                  allowSeparateMobileDesktop={true}
                />

                <div>
                  <Label htmlFor="image_url" className="text-white font-label text-xs text-white/60">
                    Ou entrez une URL manuellement
                  </Label>
                  <Input
                    id="image_url"
                    value={heroConfig.image_url}
                    onChange={(e) => setHeroConfig({ ...heroConfig, image_url: e.target.value })}
                    className="mt-1 bg-[#333333] border-[#3498DB]/30 text-white text-sm"
                    placeholder="https://... ou /images/hero/banner.jpg"
                  />
                </div>

                {/* Preview */}
                {heroConfig.image_url && (
                  <div className="mt-4">
                    <Label className="text-white font-label mb-2 block">
                      Aperçu
                    </Label>
                    <div className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-[#0F4C81]/10 to-[#3498DB]/10">
                      <img
                        src={heroConfig.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-4">
                        <div>
                          <p className="text-white font-display font-bold text-sm line-clamp-1">
                            {heroConfig.title || 'Titre'}
                          </p>
                          <p className="text-white/70 font-sans text-xs line-clamp-1 mt-1">
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
                  className="w-full bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-bold h-12"
                >
                  {isSaving ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Enregistrement...</>
                  ) : saveStatus === 'success' ? (
                    <><CheckCircle2 className="h-5 w-5 mr-2" /> Enregistré !</>
                  ) : saveStatus === 'error' ? (
                    <><AlertCircle className="h-5 w-5 mr-2" /> Erreur</>
                  ) : (
                    <><Save className="h-5 w-5 mr-2" /> Enregistrer</>
                  )}
                </Button>
              </div>
            </div>
            )}
          </div>

          {/* Top Pages */}
          <div className="space-y-6">
            {/* Pages 24h */}
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

            {/* Pages 7 jours */}
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
        </div>

        {/* Diagnostic et Tests rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
          <div className="lg:col-span-2">
            <NotificationDiagnostic />
          </div>
          <div className="space-y-4">
            <TestNotificationAll />
          </div>
        </div>

        {/* Debug détaillé */}
        <div className="mt-8">
          <NotificationDebugPanel />
        </div>

        {/* Notifications Stats */}
        <div className="mt-8">
          <NotificationStatsCard />
        </div>

        {/* Appareils inscrits */}
        <div className="mt-8">
          <PushDevicesList />
        </div>

        {/* Notifications Management - Envoi immédiat uniquement */}
        <div className="mt-8">
          <NotificationManager />
        </div>
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

