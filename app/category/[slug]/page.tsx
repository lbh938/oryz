'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import { ContentCard } from '@/components/content-card';
import { getContentByCategory, type ContentItem } from '@/lib/content';
import { Tv, Film, Trophy, TrendingUp, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Configuration des catégories
const categoryConfig = {
  foot: {
    title: 'FOOT EN DIRECT',
    description: 'Tous les matchs de football en direct',
    icon: Trophy,
    filter: 'Sports',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  series: {
    title: 'SÉRIES',
    description: 'Vos séries préférées en streaming',
    icon: Tv,
    filter: 'Series',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  films: {
    title: 'FILMS',
    description: 'Films et cinéma en streaming',
    icon: Film,
    filter: 'Movies',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  documentaries: {
    title: 'DOCUMENTAIRES',
    description: 'Documentaires et films éducatifs',
    icon: BookOpen,
    filter: 'Documentaries',
    gradient: 'from-amber-500/20 to-orange-500/20'
  },
  sports: {
    title: 'SPORTS',
    description: 'Tous les sports en direct',
    icon: Trophy,
    filter: 'Sports',
    gradient: 'from-orange-500/20 to-red-500/20'
  }
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const config = categoryConfig[slug as keyof typeof categoryConfig];

  // Calculer le contenu filtré immédiatement pour éviter le flash "aucun contenu"
  const filteredContent = useMemo<ContentItem[]>(() => {
    if (!config) return [];
    return getContentByCategory(config.filter);
  }, [config]);

  if (!config) {
    return (
      <MainLayout>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            CATÉGORIE NON TROUVÉE
          </h1>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3498DB] hover:bg-[#3498DB]/90 text-white font-label font-semibold rounded-lg transition-all"
          >
            Retour à l'accueil
          </Link>
        </div>
      </MainLayout>
    );
  }

  const IconComponent = config.icon;

  return (
    <MainLayout>
      {/* Catégories - Desktop uniquement */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 md:pt-8">
        <div className="mb-4 sm:mb-6 md:mb-8 hidden lg:block">
          <div className="flex items-center gap-8 xl:gap-12 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link href="/" className={`group relative text-white text-base xl:text-lg font-display font-bold transition-colors duration-200 hover:text-[#3498DB] uppercase ${slug === 'home' ? 'text-[#3498DB]' : ''}`}>
              HOME
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#3498DB] transition-all duration-200 ${slug === 'home' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link href="/category/foot" className={`group relative text-white text-base xl:text-lg font-display font-bold transition-colors duration-200 hover:text-[#3498DB] uppercase ${slug === 'foot' ? 'text-[#3498DB]' : ''}`}>
              FOOT EN DIRECTE
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#3498DB] transition-all duration-200 ${slug === 'foot' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link href="/category/series" className={`group relative text-white text-base xl:text-lg font-display font-bold transition-colors duration-200 hover:text-[#3498DB] uppercase ${slug === 'series' ? 'text-[#3498DB]' : ''}`}>
              SÉRIE
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#3498DB] transition-all duration-200 ${slug === 'series' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link href="/category/films" className={`group relative text-white text-base xl:text-lg font-display font-bold transition-colors duration-200 hover:text-[#3498DB] uppercase ${slug === 'films' ? 'text-[#3498DB]' : ''}`}>
              FILME
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#3498DB] transition-all duration-200 ${slug === 'films' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link href="/category/documentaries" className={`group relative text-white text-base xl:text-lg font-display font-bold transition-colors duration-200 hover:text-[#3498DB] uppercase ${slug === 'documentaries' ? 'text-[#3498DB]' : ''}`}>
              DOCUMENTAIRES
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#3498DB] transition-all duration-200 ${slug === 'documentaries' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12 md:pb-16">
        {filteredContent.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${config.gradient} mb-6`}>
              <IconComponent className="w-10 h-10 text-[#3498DB]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 uppercase">
              AUCUN CONTENU DISPONIBLE
            </h3>
            <p className="text-muted-foreground font-sans mb-8 max-w-md mx-auto">
              Nous travaillons à ajouter plus de contenu dans cette catégorie
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3498DB] hover:bg-[#3498DB]/90 text-white font-label font-semibold rounded-lg transition-all shadow-lg shadow-[#3498DB]/30"
            >
              <Tv className="h-5 w-5" />
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          <>
            {/* Titre de la catégorie */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {config.title}
              </h2>
              <p className="text-white/60 font-sans">
                {config.description}
              </p>
            </div>

            {/* Grille de contenu */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
              {filteredContent.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          </>
        )}
      </section>
    </MainLayout>
  );
}

