'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollapsibleCardProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  onReset?: () => void;
  bgColor?: string;
}

export function CollapsibleCard({
  title,
  subtitle,
  icon,
  children,
  defaultExpanded = false,
  onReset,
  bgColor = 'bg-[#1a1a1a]'
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`${bgColor} border border-[#3498DB]/30 rounded-2xl p-4`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#3498DB] flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white uppercase">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-white/70 font-sans">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onReset && isExpanded && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
              title="Réinitialiser"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  );
}

