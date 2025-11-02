import { SignUpForm } from "@/components/sign-up-form";
import Link from "next/link";
import { Home } from "lucide-react";

export default function Page() {
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
