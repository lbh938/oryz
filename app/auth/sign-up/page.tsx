'use client';

import { SignUpForm } from "@/components/sign-up-form";
import Link from "next/link";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
      if (user) {
        router.replace('/');
        return;
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [router]);

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB]"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
      {/* Bouton retour accueil */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-label"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Accueil</span>
      </Link>

      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
