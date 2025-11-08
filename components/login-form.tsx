"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { invalidateUserCache } from "@/lib/auth-cache";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function LoginFormContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true); // Par défaut activé
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Afficher le message de succès après inscription
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
      // Retirer le message après 5 secondes
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams]);

  // Fonction pour analyser l'erreur et retourner un message précis
  const getErrorMessage = (error: any): string => {
    if (!error) return "Une erreur est survenue";
    
    const errorCode = error.code || error.status;
    const errorMessage = error.message || "";
    
    // Vérifier si c'est un problème d'email (format invalide)
    if (errorCode === 'validation_failed' || errorMessage.toLowerCase().includes('email')) {
      return "L'adresse email n'est pas valide. Veuillez vérifier votre email.";
    }
    
    // Vérifier si c'est un problème de mot de passe
    if (errorCode === 'invalid_credentials' || errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('mot de passe')) {
      // Essayer de déterminer si c'est l'email ou le mot de passe
      // Si l'email semble valide (format), c'est probablement le mot de passe
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        return "Le mot de passe est incorrect. Veuillez réessayer ou utiliser 'Mot de passe oublié ?'";
      } else {
        return "L'adresse email ou le mot de passe est incorrect. Vérifiez vos identifiants.";
      }
    }
    
    // Email non confirmé
    if (errorCode === 'email_not_confirmed' || errorMessage.toLowerCase().includes('email not confirmed')) {
      return "Votre email n'a pas été confirmé. Vérifiez votre boîte de réception pour le lien de confirmation.";
    }
    
    // Trop de tentatives
    if (errorCode === 'too_many_requests' || errorMessage.toLowerCase().includes('too many')) {
      return "Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de réessayer.";
    }
    
    // Erreur générique avec le message original
    if (errorMessage.toLowerCase().includes('invalid login credentials') || errorMessage.toLowerCase().includes('invalid credentials')) {
      // Essayer de déterminer si c'est l'email ou le mot de passe
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        return "Le mot de passe est incorrect. Veuillez réessayer ou utiliser 'Mot de passe oublié ?'";
      } else {
        return "L'adresse email est incorrecte ou n'existe pas. Vérifiez votre email.";
      }
    }
    
    // Message d'erreur par défaut
    return errorMessage || "Une erreur est survenue lors de la connexion. Veuillez réessayer.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Validation basique de l'email avant l'envoi
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("L'adresse email n'est pas valide. Veuillez vérifier votre email.");
        setIsLoading(false);
        return;
      }
      
      if (!password || password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        setIsLoading(false);
        return;
      }
      
      // Supabase persiste la session par défaut, mais on peut contrôler la durée
      // L'option persistSession est true par défaut, mais on peut la forcer
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        // Utiliser la fonction pour obtenir un message d'erreur précis
        setError(getErrorMessage(error));
        setIsLoading(false);
        return;
      }
      
      // Invalider le cache pour forcer le rechargement des données utilisateur
      invalidateUserCache();
      
      // Si "rester connecté" est activé, stocker la préférence dans localStorage
      if (rememberMe && data.session) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      // NE PAS attendre refreshSession() - cela peut bloquer la connexion
      // La session est déjà valide après signInWithPassword()
      // Le refresh se fera automatiquement via useAuthRefresh si nécessaire
      
      // Rediriger immédiatement vers la page d'accueil après connexion réussie
      router.push("/");
    } catch (error: unknown) {
      setError(getErrorMessage(error));
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-display">Connexion</CardTitle>
          <CardDescription>
            Entrez votre email pour vous connecter à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              {/* Message de succès après inscription */}
              {successMessage && (
                <div className="p-4 bg-green-500/20 border-2 border-green-500 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-base text-green-600 dark:text-green-400 font-semibold text-center">
                    {successMessage}
                  </p>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* Option "rester connecté" */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#3498DB] focus:ring-[#3498DB] cursor-pointer"
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                  Rester connecté
                </Label>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90" disabled={isLoading}>
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Vous n&apos;avez pas de compte ?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4 text-[#3498DB] hover:text-[#0F4C81]"
              >
                S&apos;inscrire
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <Suspense fallback={
      <div className={cn("flex flex-col gap-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-display">Connexion</CardTitle>
            <CardDescription>
              Chargement...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498DB]"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginFormContent className={className} {...props} />
    </Suspense>
  );
}
