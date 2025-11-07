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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Supabase persiste la session par défaut, mais on peut contrôler la durée
      // L'option persistSession est true par défaut, mais on peut la forcer
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Invalider le cache pour forcer le rechargement des données utilisateur
      invalidateUserCache();
      
      // Si "rester connecté" est activé, stocker la préférence dans localStorage
      // et rafraîchir la session immédiatement pour s'assurer qu'elle est persistée
      if (rememberMe && data.session) {
        localStorage.setItem('rememberMe', 'true');
        
        // Rafraîchir la session immédiatement pour s'assurer qu'elle est bien persistée
        // Cela garantit que la session sera maintenue même après fermeture du navigateur
        try {
          await supabase.auth.refreshSession();
        } catch (refreshError) {
          // Ignorer les erreurs de refresh, la session est déjà valide
          console.log('Session refresh skipped:', refreshError);
        }
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      // Rediriger vers la page d'accueil après connexion réussie
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
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
