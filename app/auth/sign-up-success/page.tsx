import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a1a] p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-white">
            Inscription réussie !
          </h1>
          <p className="text-white/60 font-sans">
            Votre compte a été créé avec succès.
          </p>
        </div>

        <div className="bg-[#333333] rounded-lg p-6 space-y-3 text-left">
          <h2 className="font-semibold text-white">Prochaines étapes :</h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Votre compte est actif</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Vous pouvez maintenant vous connecter</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Profitez de tous nos contenus</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button asChild className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90">
            <Link href="/auth/login">
              Se connecter maintenant
              <ArrowRight className="h-4 w-4 ml-2" />
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

