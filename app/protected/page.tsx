import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { User, Shield, Home, ArrowRight } from "lucide-react";
import { NotificationSettings } from "@/components/notification-settings";
import { UserProfileEditor } from "@/components/user-profile-editor";
import { SubscriptionStatus } from "@/components/subscription-status";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Vérifier si l'utilisateur est admin
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle(); // Utiliser maybeSingle() au lieu de single() pour éviter les erreurs

  // Debug logs désactivés pour éviter les erreurs d'hydratation en production

  // Force admin pour votre UUID spécifique (temporaire pour debug)
  const isAdmin = user.id === 'ff4f857b-35a5-4960-9049-48b54ab23405' || adminData?.is_super_admin === true;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation simple - Caché en PWA car déjà dans MainLayout */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-xl pwa-hidden">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-[#3498DB] transition-colors">
            <Home className="h-5 w-5" />
            <span className="font-label">Retour à l'accueil</span>
          </Link>
        </div>
      </nav>

      <div className="container max-w-4xl mx-auto px-4 py-12 pwa-pt">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#0F4C81] to-[#3498DB] mb-4 shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white uppercase mb-2">
            Mon Profil
          </h1>
          <p className="text-white/60 font-sans">
            Informations de votre compte ORYZ
          </p>
        </div>

        {/* Éditeur de profil */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-display font-bold text-white mb-6 uppercase">
            Mon Profil
          </h2>
          <UserProfileEditor userEmail={user.email || ''} />
        </div>

        {/* Statut d'abonnement - Affiché seulement si l'utilisateur n'est pas admin */}
        {!isAdmin && <SubscriptionStatus />}

        {/* Statut Admin */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                <Shield className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-white font-label font-semibold">Statut</p>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-500 text-xs font-label font-bold">
                  ADMINISTRATEUR
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bouton Admin */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-[#0F4C81]/20 to-[#3498DB]/20 border-2 border-[#3498DB]/30 rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#3498DB] shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
      </div>
      <div>
                  <h3 className="text-lg font-display font-bold text-white mb-1">
                    Panel Administrateur
                  </h3>
                  <p className="text-sm text-white/60 font-sans">
                    Accédez au tableau de bord admin et gérez votre site
                  </p>
                </div>
              </div>
              <Link href="/protected/panel">
                <Button className="bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-bold h-12 px-6 shadow-lg shadow-[#3498DB]/30">
                  Accéder au Panel
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Paramètres de notifications */}
        <NotificationSettings />

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <Link href="/" className="block">
            <Button variant="outline" className="w-full h-12 border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label">
              <Home className="mr-2 h-5 w-5" />
              Retour à l'accueil
            </Button>
          </Link>
          <Link href="/auth/update-password" className="block">
            <Button variant="outline" className="w-full h-12 border-[#333333] text-white hover:bg-[#333333] font-label">
              Changer le mot de passe
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
