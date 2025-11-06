'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getCurrentUserProfile,
  updateUserProfile,
  updateUsername,
  canChangeUsername,
  type UserProfile
} from '@/lib/user-profile';
import {
  User, Mail, Calendar, Edit2, Save, X, AlertCircle,
  CheckCircle2, Loader2, LogOut, Trash2, Lock
} from 'lucide-react';
import { AvatarCropUpload } from '@/components/avatar-crop-upload';
import { createClient } from '@/lib/supabase/client';
import { deleteUserAccount } from '@/lib/delete-account';

export function UserProfileEditor({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // États d'édition
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Valeurs du formulaire
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // Changement de mot de passe
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // États UI
  const [canChangeUsernameNow, setCanChangeUsernameNow] = useState(false);
  const [nextUsernameChangeDate, setNextUsernameChangeDate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    
    // OPTIMISATION: Charger le profil en premier
    const profileData = await getCurrentUserProfile();
    
    if (profileData) {
      setProfile(profileData);
      setUsername(profileData.username);
      setFirstName(profileData.first_name || '');
      setLastName(profileData.last_name || '');
      setBirthDate(profileData.birth_date || '');
    
      // OPTIMISATION: Utiliser l'ID du profil pour vérifier le changement de username
      // Cela évite les appels getUser() multiples
      const { canChange, nextChangeDate } = await canChangeUsername(profileData.id);
      setCanChangeUsernameNow(canChange);
      setNextUsernameChangeDate(nextChangeDate || null);
    } else {
      // Si pas de profil, vérifier quand même le changement de username
    const { canChange, nextChangeDate } = await canChangeUsername();
    setCanChangeUsernameNow(canChange);
    setNextUsernameChangeDate(nextChangeDate || null);
    }
    
    setIsLoading(false);
  };

  const handleSaveUsername = async () => {
    if (!canChangeUsernameNow) {
      setStatus('error');
      setErrorMessage('Vous ne pouvez changer votre username qu\'une fois par an');
      return;
    }

    setIsSaving(true);
    setStatus('idle');
    
    const result = await updateUsername(username);
    
    if (result.success) {
      setStatus('success');
      setIsEditingUsername(false);
      await loadProfile(); // Recharger pour mettre à jour la date
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Erreur lors de la mise à jour');
      setTimeout(() => setStatus('idle'), 3000);
    }
    
    setIsSaving(false);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setStatus('idle');
    
    const result = await updateUserProfile({
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      birth_date: birthDate || undefined
    });
    
    if (result.success) {
      setStatus('success');
      setIsEditingProfile(false);
      await loadProfile();
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Erreur lors de la mise à jour');
      setTimeout(() => setStatus('idle'), 3000);
    }
    
    setIsSaving(false);
  };

  const handleAvatarUploadSuccess = async (url: string) => {
    // Mettre à jour immédiatement avec la nouvelle URL
    setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
    // Recharger aussi pour être sûr
    await loadProfile();
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleAvatarUploadError = (error: string) => {
    setStatus('error');
    setErrorMessage(error);
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleAvatarDeleteSuccess = async () => {
    // Mettre à jour immédiatement pour retirer l'avatar
    setProfile(prev => prev ? { ...prev, avatar_url: undefined } : null);
    // Recharger le profil
    await loadProfile();
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setStatus('error');
      setErrorMessage('Veuillez remplir tous les champs');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Les mots de passe ne correspondent pas');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    if (newPassword.length < 6) {
      setStatus('error');
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setIsSaving(true);
    setStatus('idle');

    try {
      const supabase = createClient();
      
      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setStatus('error');
        setErrorMessage(updateError.message);
        setIsSaving(false);
        return;
      }

      // Succès !
      setStatus('success');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Une erreur est survenue');
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      'ATTENTION: Cette action est irréversible.\n\n' +
      'Toutes vos données seront supprimées définitivement :\n' +
      '- Votre profil et avatar\n' +
      '- Vos préférences de notifications\n' +
      '- Vos favoris et historique\n\n' +
      'Pour confirmer, tapez "SUPPRIMER" (en majuscules) :'
    );

    if (confirmation !== 'SUPPRIMER') {
      if (confirmation !== null) {
        setStatus('error');
        setErrorMessage('Suppression annulée');
        setTimeout(() => setStatus('idle'), 3000);
      }
      return;
    }

    setIsDeleting(true);
    setStatus('idle');

    const result = await deleteUserAccount();

    if (result.success) {
      // Redirection vers la page d'accueil
      window.location.href = '/?message=' + encodeURIComponent('Votre compte a été supprimé avec succès');
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Erreur lors de la suppression du compte');
      setIsDeleting(false);
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#3498DB]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-white">Impossible de charger le profil</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Photo de profil avec crop */}
      <AvatarCropUpload
        currentAvatarUrl={profile.avatar_url}
        onUploadSuccess={handleAvatarUploadSuccess}
        onUploadError={handleAvatarUploadError}
        onDeleteSuccess={handleAvatarDeleteSuccess}
      />

      {/* Messages de statut */}
      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-500">Profil mis à jour !</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-500">{errorMessage}</p>
        </div>
      )}

      {/* Username */}
      <div className="bg-[#333333] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-white font-label font-semibold">Username</Label>
          {!isEditingUsername && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingUsername(true)}
              disabled={!canChangeUsernameNow}
              className="text-[#3498DB] hover:bg-[#3498DB]/10"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isEditingUsername ? (
          <div className="space-y-3">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#1a1a1a] border-[#3498DB]/30 text-white"
              placeholder="nouveau_username"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSaveUsername}
                disabled={isSaving || !canChangeUsernameNow}
                className="flex-1 bg-[#3498DB] hover:bg-[#3498DB]/90"
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingUsername(false);
                  setUsername(profile.username);
                }}
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-white text-lg">@{profile.username}</p>
        )}

        {!canChangeUsernameNow && nextUsernameChangeDate && (
          <p className="text-xs text-white/40 mt-2">
            Prochain changement disponible le{' '}
            {new Date(nextUsernameChangeDate).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>

      {/* Email (non modifiable) */}
      <div className="bg-[#333333] rounded-xl p-6">
        <Label className="text-white font-label font-semibold mb-3 block">Email</Label>
        <div className="flex items-center gap-2 text-white">
          <Mail className="h-5 w-5 text-[#3498DB]" />
          <p>{userEmail}</p>
        </div>
        <p className="text-xs text-white/40 mt-2">
          L'email ne peut pas être modifié
        </p>
      </div>

      {/* Informations personnelles */}
      <div className="bg-[#333333] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-white font-label font-semibold">
            Informations personnelles (optionnel)
          </Label>
          {!isEditingProfile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
              className="text-[#3498DB] hover:bg-[#3498DB]/10"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName" className="text-white text-sm">Prénom</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 bg-[#1a1a1a] border-[#3498DB]/30 text-white"
                placeholder="Votre prénom"
              />
            </div>

            <div>
              <Label htmlFor="lastName" className="text-white text-sm">Nom</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 bg-[#1a1a1a] border-[#3498DB]/30 text-white"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <Label htmlFor="birthDate" className="text-white text-sm">Date de naissance</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-1 bg-[#1a1a1a] border-[#3498DB]/30 text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 bg-[#3498DB] hover:bg-[#3498DB]/90"
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingProfile(false);
                  setFirstName(profile.first_name || '');
                  setLastName(profile.last_name || '');
                  setBirthDate(profile.birth_date || '');
                }}
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-white">
            {firstName && (
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Prénom:</span>
                <span>{firstName}</span>
              </div>
            )}
            {lastName && (
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Nom:</span>
                <span>{lastName}</span>
              </div>
            )}
            {birthDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#3498DB]" />
                <span className="text-white/60 text-sm">Né(e) le:</span>
                <span>{new Date(birthDate).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            {!firstName && !lastName && !birthDate && (
              <p className="text-white/40 text-sm">Aucune information renseignée</p>
            )}
          </div>
        )}
      </div>

      {/* Section Sécurité - Changement de mot de passe */}
      <div className="bg-[#333333] rounded-xl p-6 space-y-4">
        <h3 className="text-white font-label font-semibold text-lg border-b border-white/10 pb-3">
          Sécurité
        </h3>

        {/* Changement de mot de passe */}
        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#3498DB]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-semibold">Changer le mot de passe</p>
              <p className="text-xs text-white/60 mt-1">Mettez à jour votre mot de passe</p>
            </div>
            {!isChangingPassword && (
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outline"
                size="sm"
                className="border-[#3498DB]/30 text-[#3498DB] hover:bg-[#3498DB]/10"
              >
                <Lock className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>

          {isChangingPassword && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="grid gap-2">
                <Label htmlFor="newPassword" className="text-white">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#0a0a0a] border-[#3498DB]/30 text-white"
                  placeholder="••••••••"
                  minLength={6}
                />
                <p className="text-xs text-white/50">Au moins 6 caractères</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmNewPassword" className="text-white">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#0a0a0a] border-[#3498DB]/30 text-white"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                  className="flex-1 bg-[#3498DB] hover:bg-[#3498DB]/90"
                  size="sm"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Déconnexion et Suppression de compte */}
      <div className="bg-[#333333] rounded-xl p-6 space-y-4">
        <h3 className="text-white font-label font-semibold text-lg border-b border-white/10 pb-3">
          Actions du compte
        </h3>

        {/* Bouton Déconnexion */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#3498DB]/20">
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold">Se déconnecter</p>
            <p className="text-xs text-white/60 mt-1">Fermer votre session actuelle</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full sm:w-auto border-[#3498DB]/30 text-[#3498DB] hover:bg-[#3498DB]/10 whitespace-nowrap"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Bouton Suppression de compte */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 bg-red-500/5 rounded-lg border border-red-500/20">
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold">Supprimer mon compte</p>
            <p className="text-xs text-red-400 mt-1">
              ⚠️ Action irréversible - toutes vos données seront perdues
            </p>
          </div>
          <Button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            variant="outline"
            className="w-full sm:w-auto border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500 whitespace-nowrap"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

