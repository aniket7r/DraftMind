import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScoreBarProps {
  value: number; // 0-1
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gradient' | 'primary' | 'blue' | 'red';
  className?: string;
  animate?: boolean;
}

export function ScoreBar({
  value,
  label,
  showValue = true,
  size = 'md',
  variant = 'gradient',
  className,
  animate = true,
}: ScoreBarProps) {
  const clampedValue = Math.max(0, Math.min(1, value));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const barClasses = {
    gradient: 'score-gradient',
    primary: 'bg-primary',
    blue: 'bg-blue-side',
    red: 'bg-red-side',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-xs text-muted-foreground">{label}</span>
          )}
          {showValue && (
            <span className="text-xs font-mono text-foreground">
              {(clampedValue * 100).toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-card-border overflow-hidden',
          heightClasses[size]
        )}
      >
        <motion.div
          className={cn('h-full rounded-full', barClasses[variant])}
          initial={animate ? { width: 0 } : { width: `${clampedValue * 100}%` }}
          animate={{ width: `${clampedValue * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
