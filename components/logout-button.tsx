"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      // Forcer un rafraîchissement complet
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      window.location.href = '/auth/login';
    }
  };

  return (
    <Button 
      onClick={logout}
      variant="outline"
      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-label font-semibold rounded-lg h-11 px-6"
    >
      Déconnexion
    </Button>
  );
}
