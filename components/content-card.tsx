import Link from 'next/link';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ContentItem } from '@/lib/content';
import { Play, Star } from 'lucide-react';

interface ContentCardProps {
  content: ContentItem;
}

export function ContentCard({ content }: ContentCardProps) {
  return (
    <Link href={`/watch/${content.id}`} className="block group" data-content-card>
      <Card className="content-card overflow-hidden hover:shadow-2xl hover:shadow-[#3498DB]/30 hover:border-white/20 transition-all duration-300 cursor-pointer border-white/10 bg-white/5 backdrop-blur-xl h-full flex flex-col">
        <div className="relative aspect-[3/4] bg-gradient-to-br from-black/20 to-black/40 overflow-hidden rounded-t-2xl flex-shrink-0">
          {content.thumbnail && !content.thumbnail.includes('placeholder.jpg') && content.thumbnail.startsWith('http') ? (
          <Image
            src={content.thumbnail}
            alt={content.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
              unoptimized={false}
            />
          ) : (
            <img
              src={content.thumbnail || '/images/placeholder-movie.jpg'}
              alt={content.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src && !target.src.includes('placeholder')) {
                  target.src = '/images/placeholder-movie.jpg';
                }
              }}
          />
          )}
          
          {/* Overlay avec icône play */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-[#3498DB] rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
            {content.isLive && (
              <div className="flex items-center gap-1.5 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-label font-bold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            )}
            {content.quality && (
              <Badge className="bg-[#3498DB] text-white border-none font-label text-xs">
                {content.quality}
              </Badge>
            )}
          </div>

          {/* Badges bas */}
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
            {content.isNew && (
              <Badge className="bg-green-600 text-white border-none font-label text-xs">
                NOUVEAU
              </Badge>
            )}
            {content.isPopular && (
              <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-label text-xs">
                POPULAIRE
              </Badge>
            )}
          </div>
        </div>

            <div className="p-2 sm:p-4 flex flex-col flex-1">
              <h3 className="font-display font-bold text-white text-xs sm:text-base line-clamp-2 group-hover:text-[#3498DB] transition-colors mb-1 sm:mb-2">
                {content.name}
              </h3>
          
              {/* Info supplémentaire */}
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-white/60 font-sans mb-1 sm:mb-2">
            {content.year && <span>{content.year}</span>}
            {content.duration && (
              <>
                {content.year && <span>•</span>}
                <span>{content.duration}</span>
              </>
            )}
            {content.rating && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span>{content.rating.toFixed(1)}</span>
                </div>
              </>
            )}
          </div>

              {/* Genre ou Description */}
              <div className="flex-1 min-h-0">
                {content.genre && content.genre.length > 0 ? (
                  <p className="text-[10px] sm:text-xs text-white/50 font-sans line-clamp-1">
                    {content.genre.slice(0, 2).join(', ')}
                  </p>
                ) : (
                  <p className="text-[10px] sm:text-xs text-white/50 font-sans line-clamp-1 sm:line-clamp-2">
                    {content.description}
                  </p>
                )}
              </div>
        </div>
      </Card>
    </Link>
  );
}

