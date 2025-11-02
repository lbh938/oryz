'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  getActiveHeroConfig,
  updateHeroConfig,
  getActiveVisitorsCount,
  getTopPages24h,
  getTopPages7d,
  getGlobalStats,
  isAdmin,
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
  Loader2, Lock, AlertCircle, CheckCircle2, KeyRound, LogOut, Home, ArrowLeft
} from 'lucide-react';

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
  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_url: '',
    image_url: ''
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
      const [hero, visitors, pages24h, pages7d, stats] = await Promise.all([
        getActiveHeroConfig(),
        getActiveVisitorsCount(),
        getTopPages24h(),
        getTopPages7d(),
        getGlobalStats()
      ]);

      if (hero) {
        setHeroConfig(hero);
      }

      setActiveVisitors(visitors);
      setTopPages24h(pages24h);
      setTopPages7d(pages7d);
      setGlobalStats(stats);
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

  // Sauvegarder le hero
  const handleSaveHero = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    const success = await updateHeroConfig(heroConfig);

    if (success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }

    setIsSaving(false);
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
                className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Hero Editor */}
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-4 uppercase">
                Modifier le Hero
              </h2>

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

                {/* Image Upload with Crop */}
                <ImageCropUpload
                  bucket="hero-images"
                  currentImage={heroConfig.image_url}
                  label="Image Hero (21:9 recommandé)"
                  onUploadComplete={(url) => setHeroConfig({ ...heroConfig, image_url: url })}
                  maxSizeMB={10}
                  aspectRatio={21 / 9}
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
          <div className="bg-[#1a1a1a] border-2 border-[#3498DB]/30 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <KeyRound className="h-6 w-6 text-[#3498DB]" />
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

