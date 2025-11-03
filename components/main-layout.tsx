'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn, Heart, User } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { MobileMenu } from "@/components/mobile-menu";
import { Footer } from "@/components/footer";
import { SearchDropdown } from "@/components/search-dropdown";
import { getFavoritesCount } from "@/lib/favorites";
import { useAnalytics } from "@/hooks/use-analytics";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import dynamic from "next/dynamic";

// Charger NotificationPrompt uniquement côté client
const NotificationPrompt = dynamic(
  () => import("@/components/notification-prompt").then(mod => ({ default: mod.NotificationPrompt })),
  { ssr: false }
);

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Tracking analytics automatique
  useAnalytics();

  // Charger le compteur de favoris
  useEffect(() => {
    const updateCount = () => {
      setFavoritesCount(getFavoritesCount());
    };

    updateCount();

    // Écouter les changements
    window.addEventListener('favoritesChanged', updateCount);
    return () => window.removeEventListener('favoritesChanged', updateCount);
  }, []);

  // Vérifier l'état de connexion et charger le profil
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Charger le profil si l'utilisateur est connecté
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    };

    checkUser();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      // Recharger le profil
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single();
        
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Navigation - ORYZ Style - Gris opaque */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#1a1a1a] border-b border-[#333333] shadow-lg shadow-black/10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-2 sm:gap-6 h-14 sm:h-20">
            {/* Logo à gauche */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="ORYZ STREAM" 
                className="h-7 sm:h-10 md:h-12 w-auto"
              />
            </Link>

            {/* Barre de recherche au centre - VISIBLE SUR MOBILE */}
            <SearchDropdown className="flex-1 max-w-2xl" />

            {/* Bouton Favoris avec badge - Desktop only */}
            <Link 
              href="/favorites" 
              className="relative flex-shrink-0 hidden md:flex items-center justify-center h-12 w-12 rounded-lg border-2 border-[#3498DB]/50 bg-[#1a1a1a] text-[#3498DB] hover:bg-[#3498DB] hover:border-[#3498DB] hover:text-white transition-all group"
            >
              <Heart className="h-5 w-5 group-hover:fill-current transition-all" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-label font-bold rounded-full flex items-center justify-center shadow-lg">
                  {favoritesCount > 9 ? '9+' : favoritesCount}
                </span>
              )}
            </Link>

            {/* Boutons à droite */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Boutons desktop */}
              <div className="hidden lg:flex items-center gap-3">
                {user ? (
                  /* Utilisateur connecté - avec avatar */
                  <Button 
                    variant="outline" 
                    className="border-[#3498DB]/50 bg-[#1a1a1a] text-[#3498DB] hover:bg-[#3498DB] hover:border-[#3498DB] hover:text-white font-label font-semibold rounded-lg h-11 px-4 transition-all" 
                    asChild
                  >
                    <Link href="/protected" className="flex items-center gap-2">
                      {userProfile?.avatar_url ? (
                        <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-current">
                          {/* Use native img to avoid Next Image domain allowlist issues */}
                          <img
                            key={userProfile.avatar_url}
                            src={`${userProfile.avatar_url}${userProfile.avatar_url.includes('?') ? '&' : '?'}t=${Date.now()}`}
                            alt={userProfile.username || 'User'}
                            width={28}
                            height={28}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0F4C81] to-[#3498DB] flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <span>{userProfile?.username || user.email?.split('@')[0]}</span>
                    </Link>
                  </Button>
                ) : (
                  /* Non connecté */
                  <>
                    <Button variant="outline" className="border-[#3498DB]/50 bg-[#1a1a1a] text-[#3498DB] hover:bg-[#3498DB] hover:border-[#3498DB] hover:text-white font-label font-semibold rounded-lg h-11 px-6 transition-all" asChild>
                      <Link href="/auth/sign-up">Inscription</Link>
                    </Button>
                    <Button className="bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-semibold rounded-lg h-11 px-6 shadow-lg shadow-[#3498DB]/30 transition-all" asChild>
                      <Link href="/auth/login" className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Connexion
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Menu mobile - Toujours visible sur mobile */}
              <MobileMenu user={user} userProfile={userProfile} />
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu avec padding pour la nav */}
      <div className="pt-[88px] sm:pt-20 flex-1 flex flex-col">
        {children}
      </div>

      {/* Footer - Caché en PWA */}
      <div className="pwa-hidden">
        <Footer />
      </div>

      {/* Notification Prompt - Chargé uniquement côté client */}
      <NotificationPrompt />
    </main>
  );
}

