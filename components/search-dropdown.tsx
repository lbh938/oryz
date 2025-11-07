'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchContent } from '@/lib/content';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SearchDropdownProps {
  className?: string;
}

export function SearchDropdown({ className }: SearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Recherche en temps réel
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const searchResults = searchContent(searchQuery.trim());
      setResults(searchResults.slice(0, 5)); // Limiter à 5 résultats
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [searchQuery]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 sm:h-5 sm:w-5" />
          <Input
            type="search"
            placeholder="Rechercher chaînes, séries, films..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length >= 2 && results.length > 0) {
                setIsOpen(true);
              }
            }}
            className="w-full pl-7 sm:pl-12 h-8 sm:h-12 text-xs sm:text-base rounded-lg bg-[#1a1a1a] border border-[#333333] placeholder:text-white/50 focus:border-[#3498DB]/50 focus:ring-[#3498DB]/30 font-label"
          />
        </div>
      </form>

      {/* Dropdown des résultats */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl shadow-black/50 z-50 max-h-[70vh] sm:max-h-[400px] overflow-y-auto">
          {/* Résultats */}
          <div className="p-1 sm:p-2">
            {results.map((item) => (
              <Link
                key={item.id}
                href={`/watch/${item.id}`}
                onClick={handleResultClick}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-[#3498DB]/20 transition-colors group"
              >
                {/* Image */}
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-md overflow-hidden bg-[#1a1a1a] border border-[#333333]">
                  {item.thumbnail && !item.thumbnail.includes('placeholder.jpg') && item.thumbnail.startsWith('http') ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 48px, 64px"
                      unoptimized={false}
                    />
                  ) : item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src && !target.src.includes('placeholder')) {
                          target.src = '/images/placeholder-movie.jpg';
                        } else {
                          target.style.display = 'none';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40">
                      <Search className="h-6 w-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-label font-semibold text-white text-xs sm:text-sm truncate group-hover:text-[#3498DB] transition-colors">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="hidden sm:block text-xs text-white/60 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                    {item.category && (
                      <span className="text-[10px] sm:text-xs text-[#3498DB] font-label uppercase">
                        {item.category}
                      </span>
                    )}
                    {item.genre && item.genre.length > 0 && (
                      <span className="hidden sm:inline text-xs text-white/40">
                        • {item.genre.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Icône */}
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white/40 group-hover:text-[#3498DB] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>

          {/* Bouton "Voir plus" */}
          <div className="border-t border-[#333333] p-2">
            <Link
              href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
              onClick={handleResultClick}
              className="flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg bg-[#3498DB] hover:bg-[#3498DB]/90 text-white font-label font-semibold text-xs sm:text-sm transition-colors"
            >
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Voir tous les résultats
            </Link>
          </div>
        </div>
      )}

      {/* Message "Aucun résultat" */}
      {isOpen && searchQuery.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl shadow-black/50 z-50 p-6 text-center">
          <Search className="h-12 w-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60 font-sans mb-2">
            Aucun résultat pour "{searchQuery}"
          </p>
          <p className="text-white/40 font-sans text-sm">
            Essayez avec d'autres mots-clés
          </p>
        </div>
      )}
    </div>
  );
}

