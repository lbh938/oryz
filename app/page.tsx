import { AuthButton } from "@/components/auth-button";
import { MainLayout } from "@/components/main-layout";
import { ChannelsSlider } from "@/components/channels-slider";
import { HeroSlider } from "@/components/hero-slider";
import { RecommendedChannels } from "@/components/recommended-channels";
import { SiteStats } from "@/components/site-stats";
import { LiveMatches } from "@/components/live-matches";
import { SubscriptionCards } from "@/components/subscription-cards";
import { getActiveHeroes } from "@/lib/admin-api";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { channels } from "@/lib/channels";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Récupérer les heroes depuis Supabase
  const heroes = await getActiveHeroes();

  return (
    <MainLayout>
      {/* Hero Featured Section - Full width sur mobile, sans padding, commence directement sous la nav */}
      <section className="w-full sm:container sm:max-w-7xl sm:mx-auto px-0 sm:px-4 md:px-6 -mt-14 sm:mt-0 pt-0 sm:pt-6 md:pt-8 pb-4 sm:pb-6" data-hero-section>
        {/* Catégories - Desktop uniquement */}
        <div className="mb-4 sm:mb-6 md:mb-8 hidden lg:block">
          <div className="flex items-center gap-8 xl:gap-12 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link href="/" className="group relative text-white text-base xl:text-lg font-display font-bold transition-colors duration-200 hover:text-[#3498DB] uppercase">
              HOME
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3498DB] transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/category/foot" className="group relative text-white text-base xl:text-lg font-display font-bold transition-colors duration-200 hover:text-[#3498DB] uppercase">
              📺 CHAÎNES FOOT
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3498DB] transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/category/series" className="group relative text-white text-base xl:text-lg font-display font-bold transition-colors duration-200 hover:text-[#3498DB] uppercase">
              SÉRIE
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3498DB] transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/category/films" className="group relative text-white text-base xl:text-lg font-display font-bold transition-colors duration-200 hover:text-[#3498DB] uppercase">
              FILME
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3498DB] transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/category/documentaries" className="group relative text-white text-base xl:text-lg font-display font-bold transition-colors duration-200 hover:text-[#3498DB] uppercase">
              DOCUMENTAIRES
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3498DB] transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </div>
        </div>

        <HeroSlider heroes={heroes} autoPlayInterval={5000} />
      </section>

      {/* Live Matches Section */}
      <LiveMatches />

      {/* Recommended Section */}
      <RecommendedChannels />

      {/* Channels Section */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" data-channels-section>
        <ChannelsSlider channels={channels} title="CHAÎNES DE SPORT" />
        <p className="text-center text-white/60 text-sm sm:text-base md:text-lg font-sans mt-3 sm:mt-4 px-4">
          Regardez vos sports préférés en direct 24/7
        </p>
      </section>

      {/* Subscription Cards Section */}
      <SubscriptionCards />

      {/* Site Statistics */}
      <SiteStats />
    </MainLayout>
  );
}
