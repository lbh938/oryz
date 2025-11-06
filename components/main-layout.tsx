'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn, Heart, User, Crown } from "lucide-react";
import { ReactNode, useState, useEffect, useRef } from "react";
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
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  // Tracking analytics automatique
  useAnalytics();

  // Charger le compteur de favoris
  useEffect(() => {
    // Activer un léger fade-in au montage pour adoucir les transitions
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

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
  const authCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        // OPTIMISATION: Utiliser getSession() en premier pour un état initial rapide
        // Cela évite de montrer l'utilisateur comme déconnecté pendant le chargement
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Si une session existe, mettre à jour immédiatement l'état pour éviter le flash "déconnecté"
        if (session?.user) {
          setUser(session.user);
          
          // Charger le profil en parallèle
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('username, avatar_url')
            .eq('id', session.user.id)
            .single();
          
          setUserProfile(profile);
          setIsLoading(false);
        } else if (sessionError) {
          // Pas de session, utilisateur déconnecté
          setUser(null);
          setUserProfile(null);
          setIsLoading(false);
          return;
        } else {
          // Pas de session
          setUser(null);
          setUserProfile(null);
          setIsLoading(false);
          return;
        }
        
        // SÉCURITÉ: Vérifier ensuite avec getUser() pour authentifier auprès du serveur
        // Cela garantit que les informations utilisateur sont authentiques et non manipulables
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          // Si getUser() échoue, l'utilisateur n'est pas vraiment authentifié
          setUser(null);
          setUserProfile(null);
          return;
        }
        
        // Utiliser user authentifié pour l'affichage (mise à jour si nécessaire)
        if (user.id !== session.user.id) {
          setUser(user);
          
          // Recharger le profil si l'utilisateur a changé
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();
          
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setIsLoading(false);
      }
    };

    checkUser();

    // Écouter les changements d'auth et réauthentifier à chaque fois
    // Utiliser un debounce pour éviter les appels multiples lors de la navigation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Debounce les vérifications d'authentification pour éviter les appels multiples
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current);
      }
      
      authCheckTimeoutRef.current = setTimeout(async () => {
        // SÉCURITÉ: Réauthentifier l'utilisateur à chaque changement d'état
        // Ne pas utiliser session.user directement car il vient du stockage local
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            setUser(null);
            setUserProfile(null);
            return;
          }
          
          setUser(user ?? null);
      
          // Recharger le profil seulement si l'utilisateur a changé
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
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
      }, 100); // Debounce de 100ms pour éviter les appels multiples
    });

    return () => {
      subscription.unsubscribe();
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current);
      }
    };
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

            {/* Bouton Premium - Desktop only */}
            <Link
              href="/subscription"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-semibold transition-all shadow-lg shadow-[#3498DB]/30"
            >
              <Crown className="h-4 w-4" />
              <span>Premium</span>
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

      {/* Contenu avec padding pour la nav - Réduit sur mobile pour voir le hero entièrement */}
      <div className={`pt-14 sm:pt-20 flex-1 flex flex-col transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
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

