'use client';

import { useState, useEffect } from 'react';
import { channels } from '@/lib/channels';
import { movies } from '@/lib/movies';
import { IframePlayer } from '@/components/iframe-player';
import { VideoPlayer } from '@/components/video-player';
import { useSourceDetection } from '@/hooks/use-source-detection';
import { Play, Tv, Film } from 'lucide-react';

type ContentType = 'channel' | 'movie';

interface ContentItem {
  id: string;
  name: string;
  url: string;
  type: ContentType;
  thumbnail?: string;
}

export default function TVPage() {
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<'channels' | 'movies' | 'series' | 'documentaries'>('channels');

  // Détecter le type de source
  const sourceDetection = useSourceDetection(selectedContent?.url || '');
  const useHLS = sourceDetection.type === 'hls' && !sourceDetection.isLoading && !sourceDetection.error;

  useEffect(() => {
    // Préparer la liste de contenu
    if (activeTab === 'channels') {
      const channelList: ContentItem[] = channels.map(ch => ({
        id: ch.id,
        name: ch.name,
        url: ch.url,
        type: 'channel' as ContentType,
        thumbnail: ch.thumbnail
      }));
      setContentList(channelList);
      // Sélectionner la première chaîne par défaut
      if (!selectedContent || selectedContent.type !== 'channel') {
        setSelectedContent(channelList[0]);
      }
    } else if (activeTab === 'movies') {
      const movieList: ContentItem[] = movies
        .filter(m => m.category === 'film' && m.sources && m.sources.length > 0)
        .slice(0, 50) // Limiter à 50 films pour performance
        .map(m => ({
          id: m.id,
          name: m.title,
          url: m.sources[0].url,
          type: 'movie' as ContentType,
          thumbnail: m.thumbnail
        }));
      setContentList(movieList);
      // Sélectionner le premier film par défaut
      if (!selectedContent || selectedContent.type !== 'movie') {
        setSelectedContent(movieList[0]);
      }
    } else if (activeTab === 'series') {
      const seriesList: ContentItem[] = movies
        .filter(m => m.category === 'series' && m.sources && m.sources.length > 0)
        .slice(0, 50)
        .map(m => ({
          id: m.id,
          name: m.title,
          url: m.sources[0].url,
          type: 'movie' as ContentType,
          thumbnail: m.thumbnail
        }));
      setContentList(seriesList);
      if (!selectedContent || selectedContent.type !== 'movie') {
        setSelectedContent(seriesList[0]);
      }
    } else if (activeTab === 'documentaries') {
      const docList: ContentItem[] = movies
        .filter(m => m.category === 'documentary' && m.sources && m.sources.length > 0)
        .slice(0, 50)
        .map(m => ({
          id: m.id,
          name: m.title,
          url: m.sources[0].url,
          type: 'movie' as ContentType,
          thumbnail: m.thumbnail
        }));
      setContentList(docList);
      if (!selectedContent || selectedContent.type !== 'movie') {
        setSelectedContent(docList[0]);
      }
    }
  }, [activeTab]);

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Header simplifié */}
      <header className="bg-gradient-to-r from-[#0F4C81] to-[#3498DB] p-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="ORYZ" className="h-12" />
          <h1 className="text-white text-3xl font-display font-bold">MODE TV</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-lg font-label font-semibold transition-all ${
              activeTab === 'channels'
                ? 'bg-white text-[#0F4C81]'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Tv className="h-5 w-5" />
            Chaînes
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-lg font-label font-semibold transition-all ${
              activeTab === 'movies'
                ? 'bg-white text-[#0F4C81]'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Film className="h-5 w-5" />
            Films
          </button>
          <button
            onClick={() => setActiveTab('series')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-lg font-label font-semibold transition-all ${
              activeTab === 'series'
                ? 'bg-white text-[#0F4C81]'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2" strokeWidth="2"/>
              <polyline points="17 2 12 7 7 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Séries
          </button>
          <button
            onClick={() => setActiveTab('documentaries')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-lg font-label font-semibold transition-all ${
              activeTab === 'documentaries'
                ? 'bg-white text-[#0F4C81]'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Docs
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Liste de contenu à gauche */}
        <aside className="w-96 bg-[#1a1a1a] border-r border-[#333333] overflow-y-auto">
          <div className="p-4">
            <h2 className="text-white text-xl font-label font-semibold mb-4">
              {activeTab === 'channels' && 'Toutes les chaînes'}
              {activeTab === 'movies' && 'Films disponibles'}
              {activeTab === 'series' && 'Séries disponibles'}
              {activeTab === 'documentaries' && 'Documentaires disponibles'}
            </h2>
            <div className="space-y-2">
              {contentList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedContent(item)}
                  className={`w-full text-left p-4 rounded-lg transition-all flex items-center gap-3 ${
                    selectedContent?.id === item.id
                      ? 'bg-gradient-to-r from-[#0F4C81] to-[#3498DB] text-white'
                      : 'bg-[#2a2a2a] text-white/80 hover:bg-[#3a3a3a]'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#3498DB]/20 rounded flex items-center justify-center">
                        {item.type === 'channel' ? (
                          <Tv className="h-8 w-8 text-[#3498DB]" />
                        ) : (
                          <Film className="h-8 w-8 text-[#3498DB]" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-label font-semibold truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-white/60">
                      {item.type === 'channel' ? 'Chaîne TV' : 
                       activeTab === 'series' ? 'Série' :
                       activeTab === 'documentaries' ? 'Documentaire' : 'Film'}
                    </p>
                  </div>
                  {selectedContent?.id === item.id && (
                    <Play className="h-6 w-6 text-white flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Player à droite */}
        <main className="flex-1 bg-black flex flex-col">
          {selectedContent ? (
            <>
              {/* Titre du contenu */}
              <div className="bg-[#1a1a1a] p-6 border-b border-[#333333] flex-shrink-0">
                <h2 className="text-white text-2xl font-display font-bold">
                  {selectedContent.name}
                </h2>
                <p className="text-white/60 text-lg mt-1">
                  {selectedContent.type === 'channel' ? 'En direct' : 'À la demande'}
                </p>
              </div>

              {/* Player */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full h-full max-w-7xl max-h-full">
                  <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl">
                    {sourceDetection.isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3498DB] mx-auto mb-4"></div>
                          <p className="text-white text-xl">Chargement...</p>
                        </div>
                      </div>
                    ) : useHLS ? (
                      <VideoPlayer 
                        src={sourceDetection.url} 
                        channelId={selectedContent.id}
                      />
                    ) : (
                      <IframePlayer src={selectedContent.url} />
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Tv className="h-24 w-24 text-[#3498DB] mx-auto mb-4" />
                <p className="text-white text-2xl font-label">
                  Sélectionnez un contenu pour commencer
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

