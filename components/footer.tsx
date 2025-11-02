import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] border-t border-[#333333] mt-auto">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <h3 className="font-display font-bold text-white uppercase mb-4">
              ORYZ STREAM
            </h3>
            <p className="text-white/60 text-sm font-sans leading-relaxed">
              Votre plateforme de streaming sports en direct. Profitez de vos événements sportifs préférés en qualité HD, 24/7.
            </p>
          </div>

          {/* Liens légaux */}
          <div>
            <h3 className="font-display font-bold text-white uppercase mb-4">
              Informations légales
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/cgu"
                  className="text-white/60 hover:text-[#3498DB] text-sm font-sans transition-colors"
                >
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-white/60 hover:text-[#3498DB] text-sm font-sans transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <a
                  href="mailto:admin@oryz.stream"
                  className="text-white/60 hover:text-[#3498DB] text-sm font-sans transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-display font-bold text-white uppercase mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-white/60 hover:text-[#3498DB] text-sm font-sans transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="text-white/60 hover:text-[#3498DB] text-sm font-sans transition-colors"
                >
                  Mes favoris
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="text-white/60 hover:text-[#3498DB] text-sm font-sans transition-colors"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/sign-up"
                  className="text-white/60 hover:text-[#3498DB] text-sm font-sans transition-colors"
                >
                  Inscription
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#333333] mt-8 pt-6 text-center">
          <p className="text-white/40 text-sm font-sans">
            © {currentYear} ORYZ STREAM. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

