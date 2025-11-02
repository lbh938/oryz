"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Validation username
    if (username.length < 3 || username.length > 20) {
      setError("Le username doit contenir entre 3 et 20 caractères");
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Le username ne peut contenir que des lettres, chiffres et underscores");
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    try {
      // Vérifier si le username est déjà pris
      const { data: existingUsername } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUsername) {
        setError("Ce username est déjà pris");
        setIsLoading(false);
        return;
      }

      // Créer le compte avec le username dans metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: {
            username: username
          }
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Si l'inscription réussit, créer le profil avec le username choisi
      if (data.user) {
        // Attendre un peu que l'utilisateur soit bien créé
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            username: username
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Si le profil existe déjà (doublon), c'est OK
          if (profileError.code !== '23505') { // 23505 = unique violation
            // Essayer de mettre à jour le username au lieu d'insérer
            await supabase
              .from('user_profiles')
              .update({ username: username })
              .eq('id', data.user.id);
          }
        }
      }
      
      // Redirection directe vers la page de connexion avec message de succès
      router.push("/auth/login?message=" + encodeURIComponent("✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter."));
    } catch (error: unknown) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-display">Inscription</CardTitle>
          <CardDescription>Créez votre compte ORYZ</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="votre_username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                />
                <p className="text-xs text-muted-foreground">
                  3-20 caractères, lettres, chiffres et _ uniquement
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Confirmer le mot de passe</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90" disabled={isLoading}>
                {isLoading ? "Création du compte..." : "S'inscrire"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Vous avez déjà un compte ?{" "}
              <Link href="/auth/login" className="underline underline-offset-4 text-[#3498DB] hover:text-[#0F4C81]">
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
