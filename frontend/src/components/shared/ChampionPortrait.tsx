import { useState } from 'react';
import { motion } from 'framer-motion';
import { getChampionImageUrl } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChampionPortraitProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'available' | 'banned' | 'picked';
  winRate?: number;
  pickRate?: number;
  role?: string;
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

export function ChampionPortrait({
  name,
  size = 'md',
  state = 'available',
  winRate,
  pickRate,
  role,
  showTooltip = true,
  onClick,
  className,
}: ChampionPortraitProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = getChampionImageUrl(name);

  const content = (
    <motion.div
      className={cn(
        'relative rounded-full overflow-hidden cursor-pointer transition-all duration-200',
        sizeClasses[size],
        state === 'available' && 'hover:ring-2 hover:ring-primary hover:scale-110',
        state === 'banned' && 'grayscale opacity-60 cursor-not-allowed',
        state === 'picked' && 'grayscale opacity-40 cursor-not-allowed',
        className
      )}
      whileHover={state === 'available' ? { scale: 1.1 } : undefined}
      whileTap={state === 'available' ? { scale: 0.95 } : undefined}
      onClick={state === 'available' ? onClick : undefined}
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <Skeleton className="absolute inset-0 rounded-full" />
      )}

      {/* Champion image */}
      <img
        src={imageUrl}
        alt={name}
        className={cn(
          'w-full h-full object-cover',
          !imageLoaded && 'opacity-0'
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
      />

      {/* Fallback for error */}
      {imageError && (
        <div className="absolute inset-0 bg-card flex items-center justify-center">
          <span className="text-xs font-bold text-muted-foreground">
            {name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}

      {/* Banned overlay */}
      {state === 'banned' && (
        <div className="absolute inset-0 flex items-center justify-center bg-danger/30">
          <svg
            className="w-3/4 h-3/4 text-danger"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="20" y1="4" x2="4" y2="20" />
          </svg>
        </div>
      )}

      {/* Picked overlay */}
      {state === 'picked' && (
        <div className="absolute inset-0 flex items-center justify-center bg-success/30">
          <svg
            className="w-1/2 h-1/2 text-success"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </motion.div>
  );

  if (!showTooltip || state !== 'available') {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-popover border-card-border p-3 min-w-[140px]"
      >
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{name}</p>
          {role && (
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          )}
          <div className="flex gap-3 text-xs">
            {winRate !== undefined && (
              <span className="font-mono">
                <span className="text-success">{(winRate * 100).toFixed(1)}%</span>
                <span className="text-muted-foreground ml-1">WR</span>
              </span>
            )}
            {pickRate !== undefined && (
              <span className="font-mono">
                <span className="text-primary">{(pickRate * 100).toFixed(1)}%</span>
                <span className="text-muted-foreground ml-1">PR</span>
              </span>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
