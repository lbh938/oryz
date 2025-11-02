import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm text-white font-label">Bonjour, {user.email?.split('@')[0]}!</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <Button variant="outline" className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label font-semibold rounded-lg h-11 px-6" asChild>
        <Link href="/auth/sign-up">Inscription</Link>
      </Button>
      <Button className="bg-[#3498DB] hover:bg-[#3498DB]/90 text-white font-label font-semibold rounded-lg h-11 px-6" asChild>
        <Link href="/auth/login" className="flex items-center gap-2">
          Connexion
        </Link>
      </Button>
    </div>
  );
}
