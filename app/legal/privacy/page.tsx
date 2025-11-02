import Link from "next/link";
import { Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-[#3498DB]" />
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white uppercase">
              Politique de Confidentialité
            </h1>
          </div>
          <p className="text-white/60 font-sans mb-8">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <div className="space-y-8 text-white/80 font-sans">
            {/* Introduction */}
            <section>
              <p className="leading-relaxed">
                ORYZ STREAM (ci-après « ORYZ » ou « nous ») s'engage à protéger la vie privée de ses utilisateurs. Cette Politique de Confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
              </p>
            </section>

            {/* 1. Données collectées */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                1. Données Collectées
              </h2>
              
              <h3 className="text-lg font-label font-semibold text-white mt-4 mb-2">
                1.1 Données obligatoires
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Nom d'utilisateur (username) :</strong> Identifiant unique choisi lors de l'inscription</li>
                <li><strong>Adresse email :</strong> Nécessaire pour la création du compte et la récupération du mot de passe</li>
                <li><strong>Mot de passe :</strong> Stocké de manière chiffrée pour la sécurité de votre compte</li>
              </ul>

              <h3 className="text-lg font-label font-semibold text-white mt-4 mb-2">
                1.2 Données optionnelles
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Photo de profil :</strong> Image personnalisée pour votre compte</li>
                <li><strong>Nom et prénom :</strong> Informations personnelles facultatives</li>
                <li><strong>Date de naissance :</strong> Information facultative</li>
              </ul>

              <h3 className="text-lg font-label font-semibold text-white mt-4 mb-2">
                1.3 Données automatiques
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Données de navigation :</strong> Pages visitées, durée de visite, contenu consulté</li>
                <li><strong>Favoris et préférences :</strong> Contenus que vous avez marqués comme favoris</li>
                <li><strong>Données techniques :</strong> Adresse IP, type de navigateur, système d'exploitation</li>
                <li><strong>Cookies :</strong> Identifiant de session, préférences utilisateur</li>
                <li><strong>Notifications push :</strong> Statut d'activation et préférences</li>
              </ul>
            </section>

            {/* 2. Finalités */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                2. Finalités du Traitement
              </h2>
              <p className="leading-relaxed mb-3">
                Vos données personnelles sont collectées et traitées pour les finalités suivantes :
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Gestion de votre compte utilisateur</li>
                <li>Personnalisation de votre expérience sur le Service</li>
                <li>Envoi de notifications push (avec votre consentement)</li>
                <li>Amélioration du Service et analyses statistiques</li>
                <li>Communication d'informations importantes sur le Service</li>
                <li>Sécurité et prévention de la fraude</li>
                <li>Respect des obligations légales</li>
              </ul>
            </section>

            {/* 3. Base légale */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                3. Base Légale du Traitement
              </h2>
              <p className="leading-relaxed">
                Le traitement de vos données personnelles repose sur :
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li><strong>Votre consentement :</strong> Pour les notifications push et données optionnelles</li>
                <li><strong>L'exécution du contrat :</strong> Pour la fourniture du Service</li>
                <li><strong>Notre intérêt légitime :</strong> Pour l'amélioration du Service et la sécurité</li>
                <li><strong>Les obligations légales :</strong> Conservation de certaines données selon la loi</li>
              </ul>
            </section>

            {/* 4. Durée de conservation */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                4. Durée de Conservation
              </h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Compte actif :</strong> Vos données sont conservées tant que votre compte est actif</li>
                <li><strong>Compte supprimé :</strong> Suppression sous 30 jours maximum après la demande</li>
                <li><strong>Données de navigation :</strong> Conservées 13 mois maximum</li>
                <li><strong>Logs de sécurité :</strong> Conservés 1 an pour la sécurité du Service</li>
              </ul>
            </section>

            {/* 5. Partage des données */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                5. Partage des Données
              </h2>
              <p className="leading-relaxed">
                ORYZ ne vend, ne loue et ne partage jamais vos données personnelles avec des tiers à des fins commerciales.
              </p>
              <p className="leading-relaxed mt-3">
                Vos données peuvent être partagées uniquement dans les cas suivants :
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li><strong>Prestataires techniques :</strong> Hébergement (Vercel, Supabase) avec contrats de sous-traitance conformes au RGPD</li>
                <li><strong>Obligations légales :</strong> Si requis par la loi ou une décision judiciaire</li>
                <li><strong>Protection des droits :</strong> Pour protéger nos droits et la sécurité du Service</li>
              </ul>
            </section>

            {/* 6. Sécurité */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                6. Sécurité des Données
              </h2>
              <p className="leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>Chiffrement SSL/TLS pour toutes les communications</li>
                <li>Stockage sécurisé des mots de passe (hachage bcrypt)</li>
                <li>Authentification sécurisée via Supabase Auth</li>
                <li>Sauvegardes régulières des données</li>
                <li>Contrôle d'accès strict aux données personnelles</li>
                <li>Surveillance et détection des incidents de sécurité</li>
              </ul>
            </section>

            {/* 7. Vos droits */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                7. Vos Droits
              </h2>
              <p className="leading-relaxed mb-3">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-white">Droit d'accès</h3>
                  <p>Vous pouvez accéder à vos données personnelles depuis votre profil.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white">Droit de rectification</h3>
                  <p>Vous pouvez modifier vos informations personnelles à tout moment.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white">Droit à l'effacement</h3>
                  <p>Vous pouvez supprimer votre compte et toutes vos données associées.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white">Droit à la limitation</h3>
                  <p>Vous pouvez demander la limitation du traitement de vos données.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white">Droit à la portabilité</h3>
                  <p>Vous pouvez récupérer vos données dans un format structuré.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white">Droit d'opposition</h3>
                  <p>Vous pouvez vous opposer au traitement de vos données (ex: notifications).</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white">Droit de retirer votre consentement</h3>
                  <p>Vous pouvez retirer votre consentement aux notifications à tout moment.</p>
                </div>
              </div>

              <p className="leading-relaxed mt-4">
                Pour exercer vos droits, contactez-nous à : <span className="text-[#3498DB] font-semibold">admin@oryz.stream</span>
              </p>
            </section>

            {/* 8. Cookies */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                8. Cookies et Technologies Similaires
              </h2>
              <p className="leading-relaxed">
                ORYZ utilise des cookies pour :
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li><strong>Cookies essentiels :</strong> Authentification et sécurité (obligatoires)</li>
                <li><strong>Cookies de performance :</strong> Analyse de l'utilisation du Service</li>
                <li><strong>Cookies de préférences :</strong> Mémorisation de vos choix (thème, favoris)</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Vous pouvez configurer votre navigateur pour bloquer les cookies, mais certaines fonctionnalités du Service peuvent être limitées.
              </p>
            </section>

            {/* 9. Transferts internationaux */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                9. Transferts Internationaux
              </h2>
              <p className="leading-relaxed">
                Vos données sont hébergées au sein de l'Union Européenne (Supabase EU). Si un transfert hors UE était nécessaire, nous nous assurerions qu'il soit encadré par des garanties appropriées (clauses contractuelles types de la Commission européenne).
              </p>
            </section>

            {/* 10. Modifications */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                10. Modifications de la Politique
              </h2>
              <p className="leading-relaxed">
                Nous pouvons modifier cette Politique de Confidentialité à tout moment. Les modifications seront communiquées via le Service et prendront effet dès leur publication. Nous vous encourageons à consulter régulièrement cette page.
              </p>
            </section>

            {/* 11. Réclamation */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                11. Réclamation
              </h2>
              <p className="leading-relaxed">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
              </p>
              <p className="mt-3">
                <strong>CNIL</strong><br />
                3 Place de Fontenoy<br />
                TSA 80715<br />
                75334 PARIS CEDEX 07<br />
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#3498DB] hover:underline">
                  www.cnil.fr
                </a>
              </p>
            </section>

            {/* 12. Contact */}
            <section>
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">
                12. Contact
              </h2>
              <p className="leading-relaxed">
                Pour toute question concernant cette Politique de Confidentialité ou l'exercice de vos droits :
              </p>
              <p className="mt-3 text-[#3498DB] font-semibold">
                Email : admin@oryz.stream
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
            <Link href="/legal/cgu" className="flex-1">
              <Button variant="outline" className="w-full border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label">
                Conditions d'utilisation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

