import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-[#3498DB] transition-colors">
              <Home className="h-5 w-5" />
              <span className="font-label">Accueil</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white uppercase mb-2">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-white/60 font-sans mb-8">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <div className="space-y-8 text-white/80 font-sans">
            {/* Article 1 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 1 - Objet
              </h2>
              <p className="leading-relaxed">
                Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation du service ORYZ STREAM (ci-après « le Service »), ainsi que les droits et obligations des utilisateurs dans ce cadre.
              </p>
              <p className="leading-relaxed mt-3">
                L'accès et l'utilisation du Service impliquent l'acceptation sans réserve des présentes CGU.
              </p>
            </section>

            {/* Article 2 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 2 - Définitions
              </h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Service :</strong> Plateforme de streaming ORYZ accessible via le site web et l'application mobile.</li>
                <li><strong>Utilisateur :</strong> Toute personne physique accédant au Service.</li>
                <li><strong>Compte utilisateur :</strong> Espace personnel créé par l'Utilisateur après inscription.</li>
                <li><strong>Contenu :</strong> Ensemble des éléments diffusés sur le Service (vidéos, images, textes).</li>
              </ul>
            </section>

            {/* Article 3 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 3 - Accès au Service
              </h2>
              <p className="leading-relaxed">
                Le Service est accessible gratuitement à tout Utilisateur disposant d'un accès à Internet. L'ensemble des frais liés à l'accès au Service, que ce soit les frais matériels, logiciels ou d'accès à Internet, sont exclusivement à la charge de l'Utilisateur.
              </p>
              <p className="leading-relaxed mt-3">
                ORYZ se réserve le droit de modifier, suspendre ou interrompre temporairement ou définitivement tout ou partie du Service sans préavis et sans obligation de justification.
              </p>
            </section>

            {/* Article 4 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 4 - Inscription et Compte Utilisateur
              </h2>
              <p className="leading-relaxed">
                Pour accéder à certaines fonctionnalités du Service, l'Utilisateur doit créer un compte en fournissant :
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>Un nom d'utilisateur (username) unique</li>
                <li>Une adresse email valide</li>
                <li>Un mot de passe sécurisé</li>
              </ul>
              <p className="leading-relaxed mt-3">
                L'Utilisateur garantit que toutes les informations fournies sont exactes et à jour. Il s'engage à mettre à jour ses informations en cas de modification.
              </p>
              <p className="leading-relaxed mt-3">
                L'Utilisateur est responsable de la confidentialité de ses identifiants de connexion et de toute activité effectuée via son compte.
              </p>
              <p className="leading-relaxed mt-3">
                Le nom d'utilisateur peut être modifié une fois par an maximum.
              </p>
            </section>

            {/* Article 5 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 5 - Utilisation du Service
              </h2>
              <p className="leading-relaxed mb-3">
                L'Utilisateur s'engage à utiliser le Service de manière conforme aux présentes CGU et à la législation en vigueur. Il est strictement interdit de :
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Utiliser le Service à des fins illégales ou non autorisées</li>
                <li>Télécharger, enregistrer ou redistribuer le Contenu sans autorisation</li>
                <li>Tenter d'accéder de manière non autorisée au Service ou aux systèmes</li>
                <li>Utiliser des robots, scrapers ou autres outils automatisés</li>
                <li>Usurper l'identité d'une autre personne</li>
                <li>Diffuser des virus ou codes malveillants</li>
                <li>Harceler, menacer ou nuire à d'autres utilisateurs</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Toute violation de ces règles peut entraîner la suspension ou la suppression immédiate du compte de l'Utilisateur.
              </p>
            </section>

            {/* Article 6 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 6 - Propriété Intellectuelle
              </h2>
              <p className="leading-relaxed">
                L'ensemble des éléments du Service (structure, design, textes, images, vidéos, logos, marques) est la propriété exclusive d'ORYZ ou de ses partenaires. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie du Service est interdite, sauf autorisation préalable écrite d'ORYZ.
              </p>
              <p className="leading-relaxed mt-3">
                Le Contenu diffusé sur le Service est protégé par des droits d'auteur et ne peut être utilisé qu'à des fins de visionnage personnel et non commercial.
              </p>
            </section>

            {/* Article 7 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 7 - Données Personnelles
              </h2>
              <p className="leading-relaxed">
                ORYZ s'engage à protéger les données personnelles des Utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD).
              </p>
              <p className="leading-relaxed mt-3">
                Les données collectées incluent :
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>Nom d'utilisateur, email (obligatoires)</li>
                <li>Nom, prénom, date de naissance (optionnels)</li>
                <li>Photo de profil (optionnelle)</li>
                <li>Préférences de notifications</li>
                <li>Historique de navigation et favoris</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Ces données sont utilisées uniquement pour le fonctionnement du Service et ne sont jamais vendues à des tiers.
              </p>
              <p className="leading-relaxed mt-3">
                L'Utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données personnelles.
              </p>
            </section>

            {/* Article 8 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 8 - Notifications Push
              </h2>
              <p className="leading-relaxed">
                Le Service propose un système de notifications push pour informer les Utilisateurs des nouveaux contenus et actualités.
              </p>
              <p className="leading-relaxed mt-3">
                L'activation des notifications est facultative et peut être modifiée à tout moment depuis les paramètres du profil utilisateur.
              </p>
              <p className="leading-relaxed mt-3">
                Les notifications sont envoyées uniquement aux utilisateurs ayant explicitement accepté de les recevoir.
              </p>
            </section>

            {/* Article 9 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 9 - Responsabilité
              </h2>
              <p className="leading-relaxed">
                ORYZ ne peut être tenu responsable :
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>Des interruptions ou dysfonctionnements du Service</li>
                <li>De la perte de données ou de contenus</li>
                <li>Des dommages directs ou indirects résultant de l'utilisation du Service</li>
                <li>Du contenu de sites tiers accessibles via des liens</li>
              </ul>
              <p className="leading-relaxed mt-3">
                L'Utilisateur est seul responsable de l'utilisation qu'il fait du Service et des conséquences qui en découlent.
              </p>
            </section>

            {/* Article 10 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 10 - Cookies
              </h2>
              <p className="leading-relaxed">
                Le Service utilise des cookies pour améliorer l'expérience utilisateur et analyser l'utilisation du site. L'Utilisateur peut configurer son navigateur pour refuser les cookies, mais certaines fonctionnalités du Service peuvent être limitées.
              </p>
            </section>

            {/* Article 11 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 11 - Modification des CGU
              </h2>
              <p className="leading-relaxed">
                ORYZ se réserve le droit de modifier les présentes CGU à tout moment. Les nouvelles CGU seront communiquées aux Utilisateurs et prendront effet dès leur publication sur le Service.
              </p>
              <p className="leading-relaxed mt-3">
                La poursuite de l'utilisation du Service après modification des CGU vaut acceptation des nouvelles conditions.
              </p>
            </section>

            {/* Article 12 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 12 - Résiliation
              </h2>
              <p className="leading-relaxed">
                L'Utilisateur peut supprimer son compte à tout moment depuis son profil. ORYZ se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.
              </p>
            </section>

            {/* Article 13 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 13 - Droit Applicable et Juridiction
              </h2>
              <p className="leading-relaxed">
                Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </section>

            {/* Article 14 */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                Article 14 - Contact
              </h2>
              <p className="leading-relaxed">
                Pour toute question concernant les présentes CGU, l'Utilisateur peut contacter ORYZ à l'adresse :
              </p>
              <p className="mt-3 text-[#3498DB] font-semibold">
                admin@oryz.stream
              </p>
            </section>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-[#333333]">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90 text-white font-label">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
            <Link href="/legal/privacy" className="flex-1">
              <Button variant="outline" className="w-full border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label">
                Politique de confidentialité
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

