'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, UserPlus, User, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MobileMenuProps {
  user: any;
  userProfile?: any;
}

export function MobileMenu({ user, userProfile }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  const categories = [
    { name: 'HOME', href: '/' },
    { name: 'FOOT EN DIRECTE', href: '/category/foot' },
    { name: 'SÉRIE', href: '/category/series' },
    { name: 'FILME', href: '/category/films' },
    { name: 'DOCUMENTAIRES', href: '/category/documentaries' },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsOpen(false);
      // Forcer le rafraîchissement de la page pour mettre à jour l'état
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Rafraîchir quand même en cas d'erreur
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Bouton Hamburger */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="lg:hidden text-white hover:bg-white/10"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[90] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Sidebar - Glass morphism avec plus d'opacité */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-black/95 backdrop-blur-2xl border-l border-white/30 shadow-2xl shadow-black/60 z-[100] transform transition-transform duration-300 lg:hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <img src="/logo.png" alt="ORYZ STREAM" className="h-8 w-auto" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* État de connexion dans le header */}
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#3498DB]/10 border border-[#3498DB]/30">
                {userProfile?.avatar_url ? (
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#3498DB]">
                    {/* Use native img to avoid Next Image remotePatterns constraints */}
                    <img
                      key={userProfile.avatar_url}
                      src={`${userProfile.avatar_url}${userProfile.avatar_url.includes('?') ? '&' : '?'}t=${Date.now()}`}
                      alt={userProfile.username || 'User'}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-[#0F4C81] to-[#3498DB] text-white">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-label font-semibold text-white truncate">
                    {userProfile?.username || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-white/60">
                    Connecté
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-6">
              {/* Catégories */}
              <div>
                <h3 className="text-sm font-label font-semibold text-white/80 uppercase tracking-wider mb-4">
                  Navigation
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-lg text-white font-display font-bold text-lg uppercase hover:bg-[#3498DB]/30 hover:text-[#3498DB] transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Liens supplémentaires */}
              <div>
                <h3 className="text-sm font-label font-semibold text-white/80 uppercase tracking-wider mb-4">
                  Autres
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/channels"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-lg text-white hover:bg-[#3498DB]/30 hover:text-[#3498DB] transition-colors font-label font-medium"
                  >
                    Toutes les chaînes
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-lg text-white hover:bg-[#3498DB]/30 hover:text-[#3498DB] transition-colors font-label font-medium"
                  >
                    ❤️ Favoris
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Footer avec boutons auth */}
          <div className="p-6 border-t border-white/20">
            {user ? (
              /* Utilisateur connecté */
              <div className="space-y-3">
                <Button 
                  asChild
                  className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90 text-white font-label font-semibold"
                >
                  <Link href="/protected" onClick={() => setIsOpen(false)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Mon Compte
                  </Link>
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-label font-semibold"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              /* Non connecté */
              <div className="space-y-3">
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label font-semibold"
                >
                  <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Inscription
                  </Link>
                </Button>
                <Button 
                  asChild
                  className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90 text-white font-label font-semibold"
                >
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Connexion
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
