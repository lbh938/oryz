'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { searchContent } from "@/lib/content";
import { ContentCard } from "@/components/content-card";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { SkeletonGrid } from '@/components/skeleton-grid';

const ITEMS_PER_PAGE = 24; // 4 lignes de 6 items

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Récupérer tous les résultats
  const allResults = useMemo(() => {
    return query.length >= 2 ? searchContent(query) : [];
  }, [query]);

  // Extraire les genres uniques
  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    allResults.forEach(item => {
      item.genre?.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [allResults]);

  // Extraire les années uniques
  const uniqueYears = useMemo(() => {
    const years = new Set<number>();
    allResults.forEach(item => {
      if (item.year) years.add(item.year);
    });
    return Array.from(years).sort((a, b) => b - a); // Plus récents en premier
  }, [allResults]);

  // Filtrer les résultats selon le filtre sélectionné
  const filteredResults = useMemo(() => {
    if (selectedFilter === 'all') return allResults;
    if (selectedFilter === 'movies') return allResults.filter(item => item.type === 'movie');
    if (selectedFilter === 'channels') return allResults.filter(item => item.type === 'channel');
    if (selectedFilter === 'documentaries') return allResults.filter(item => item.category === 'Documentaries');
    if (selectedFilter === 'series') return allResults.filter(item => item.category === 'Series');
    if (selectedFilter.startsWith('genre:')) {
      const genre = selectedFilter.replace('genre:', '');
      return allResults.filter(item => item.genre?.includes(genre));
    }
    if (selectedFilter.startsWith('year:')) {
      const year = parseInt(selectedFilter.replace('year:', ''));
      return allResults.filter(item => item.year === year);
    }
    return allResults;
  }, [allResults, selectedFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  // Réinitialiser la page quand le filtre change
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Search className="h-8 w-8 text-[#3498DB]" />
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white uppercase">
            Résultats de recherche
          </h1>
        </div>
        {query && (
          <p className="text-white/60 font-sans">
            {allResults.length > 0 
              ? `${allResults.length} résultat${allResults.length > 1 ? 's' : ''} pour "${query}"`
              : `Aucun résultat pour "${query}"`
            }
          </p>
        )}
      </div>

      {/* Filtres - Sous-catégories */}
      {allResults.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-gradient-to-r from-[#0F4C81] to-[#3498DB] text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              TOUS
            </button>
            <button
              onClick={() => handleFilterChange('movies')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                selectedFilter === 'movies'
                  ? 'bg-gradient-to-r from-[#0F4C81] to-[#3498DB] text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              FILMS
            </button>
            <button
              onClick={() => handleFilterChange('channels')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                selectedFilter === 'channels'
                  ? 'bg-gradient-to-r from-[#0F4C81] to-[#3498DB] text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              CHAÎNES
            </button>
            <button
              onClick={() => handleFilterChange('documentaries')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                selectedFilter === 'documentaries'
                  ? 'bg-gradient-to-r from-[#0F4C81] to-[#3498DB] text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              DOCUMENTAIRES
            </button>
            <button
              onClick={() => handleFilterChange('series')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                selectedFilter === 'series'
                  ? 'bg-gradient-to-r from-[#0F4C81] to-[#3498DB] text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              SÉRIES
            </button>
            
            {/* Genres */}
            {uniqueGenres.slice(0, 10).map(genre => (
              <button
                key={genre}
                onClick={() => handleFilterChange(`genre:${genre}`)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  selectedFilter === `genre:${genre}`
                    ? 'bg-gradient-to-r from-[#0F4C81] to-[#3498DB] text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {genre.toUpperCase()}
              </button>
            ))}

            {/* Années */}
            {uniqueYears.slice(0, 5).map(year => (
              <button
                key={year}
                onClick={() => handleFilterChange(`year:${year}`)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  selectedFilter === `year:${year}`
                    ? 'bg-gradient-to-r from-[#0F4C81] to-[#3498DB] text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Résultats filtrés */}
      {filteredResults.length > 0 && (
        <div className="mb-6">
          <p className="text-white/60 font-sans text-sm">
            {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''} {selectedFilter !== 'all' ? 'après filtrage' : ''}
          </p>
        </div>
      )}

      {/* Résultats */}
      {!query && (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 font-sans text-lg">
            Utilisez la barre de recherche pour trouver des chaînes, séries ou films
          </p>
        </div>
      )}

      {query && allResults.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 font-sans text-lg mb-2">
            Aucun résultat trouvé
          </p>
          <p className="text-white/40 font-sans text-sm">
            Essayez avec d'autres mots-clés
          </p>
        </div>
      )}

      {paginatedResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
          {paginatedResults.map((item) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-[#0F4C81] to-[#3498DB] text-white shadow-lg'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Page suivante"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <SkeletonGrid count={24} variant="card" />
        </div>
      }>
        <SearchResults />
      </Suspense>
    </MainLayout>
  );
}

