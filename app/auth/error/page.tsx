import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a1a] p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-white">
            Erreur d'authentification
          </h1>
          <p className="text-white/60 font-sans">
            Une erreur s'est produite lors de la connexion.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button asChild className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90">
            <Link href="/auth/login">
              Retour à la connexion
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

