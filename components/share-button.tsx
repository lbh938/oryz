'use client';

import { useState } from 'react';
import { Share2, Check, Facebook, Twitter, MessageCircle, Link as LinkIcon, QrCode } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  channelId: string;
  channelName: string;
  className?: string;
  variant?: 'default' | 'icon';
}

export function ShareButton({ channelId, channelName, className, variant = 'default' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/watch/${channelId}` : '';
  const shareText = `Regardez ${channelName} en direct sur ORYZ Stream !`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-green-500',
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-600',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-sky-500',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: copied ? 'Copié !' : 'Copier',
      icon: copied ? Check : LinkIcon,
      color: 'hover:bg-purple-500',
      action: handleCopyLink
    }
  ];

  if (variant === 'icon') {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn("rounded-full hover:bg-[#3498DB]/10 hover:text-[#3498DB]", className)}
        >
          <Share2 className="h-5 w-5" />
        </Button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Share Menu */}
            <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-[#333333] border border-[#3498DB]/30 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.name}
                    onClick={() => {
                      option.action();
                      if (option.name !== 'Copier' && option.name !== 'Copié !') {
                        setIsOpen(false);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-white hover:text-white transition-all",
                      option.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-label font-medium text-sm">{option.name}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default variant avec modal
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label font-semibold rounded-lg",
          className
        )}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Partager
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Share Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-[#1a1a1a] border border-[#3498DB]/30 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-[#333333]">
                <h3 className="text-xl font-display font-bold text-white uppercase">
                  Partager {channelName}
                </h3>
                <p className="text-sm text-muted-foreground font-sans mt-1">
                  Partagez cette chaîne avec vos amis
                </p>
              </div>

              {/* Share Options */}
              <div className="p-6 grid grid-cols-2 gap-3">
                {shareOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.name}
                      onClick={() => {
                        option.action();
                        if (option.name !== 'Copier' && option.name !== 'Copié !') {
                          setIsOpen(false);
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl bg-[#333333] hover:scale-105 transition-all text-white",
                        option.color
                      )}
                    >
                      <Icon className="h-8 w-8" />
                      <span className="font-label font-medium text-sm">{option.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* URL Display */}
              <div className="p-6 pt-0">
                <div className="flex items-center gap-2 p-3 bg-[#333333] rounded-lg">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-white text-sm font-mono outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex-shrink-0 p-2 rounded-lg bg-[#3498DB] hover:bg-[#3498DB]/90 text-white transition-all"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <div className="p-6 pt-0">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="w-full border-[#333333] hover:bg-[#333333] text-white"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

