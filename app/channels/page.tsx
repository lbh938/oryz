'use client';

import { useState } from 'react';
import { channels } from '@/lib/channels';
import { MainLayout } from '@/components/main-layout';
import { ContentCard } from '@/components/content-card';
import { Tv, Star, Sparkles, Calendar, List } from 'lucide-react';
import Link from 'next/link';

type TabType = 'all' | 'exclusives' | 'new' | 'popular' | 'events' | 'other';

export default function ChannelsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const allChannelItems = channels.map(channel => ({
    id: channel.id,
    name: channel.name,
    description: channel.description,
    thumbnail: channel.thumbnail,
    url: `/watch/${channel.id}`,
    category: channel.category,
    isLive: channel.isLive,
    useIframe: channel.useIframe,
    sources: channel.sources,
    isNew: channel.isNew,
    isPopular: channel.isPopular,
    quality: channel.quality,
    viewCount: channel.viewCount,
    type: 'channel' as const
  }));

  const getFilteredChannels = () => {
    switch (activeTab) {
      case 'exclusives':
        return allChannelItems.filter(item => item.isPopular && item.isLive);
      case 'new':
        return allChannelItems.filter(item => item.isNew);
      case 'popular':
        return allChannelItems.filter(item => item.isPopular);
      case 'events':
        return allChannelItems.filter(item => item.category === 'Sports' && item.isLive);
      case 'other':
        return allChannelItems.filter(item => !item.isNew && !item.isPopular && !item.isLive);
      case 'all':
      default:
        return allChannelItems;
    }
  };

  const channelItems = getFilteredChannels();

  const tabs = [
    { id: 'all' as TabType, label: 'TOUTES LES CHAÎNES', icon: List },
    { id: 'exclusives' as TabType, label: 'EXCLUSIVITÉS', icon: Star },
    { id: 'new' as TabType, label: 'NOUVEAUTÉS', icon: Sparkles },
    { id: 'popular' as TabType, label: 'POPULAIRE', icon: Star },
    { id: 'events' as TabType, label: 'ÉVÉNEMENTS', icon: Calendar },
    { id: 'other' as TabType, label: 'AUTRES', icon: Tv }
  ];

  return (
    <MainLayout>
      {/* Tabs Navigation */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base font-display font-bold transition-colors duration-200 uppercase whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#3498DB]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{tab.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-[#3498DB] transition-all duration-200 ${
                    activeTab === tab.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Channels Grid */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12 md:pb-16 pt-6">
        {channelItems.length === 0 ? (
          /* Empty State si pas de chaînes */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <Tv className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-display mb-2">AUCUNE CHAÎNE DISPONIBLE</h3>
            <p className="text-muted-foreground font-sans">
              Les chaînes seront bientôt disponibles
            </p>
          </div>
        ) : (
          /* Grille de chaînes */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
            {channelItems.map((item) => (
              <ContentCard key={item.id} content={item as any} />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}

