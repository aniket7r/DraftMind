import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HelpIconProps {
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function HelpIcon({ content, side = 'top', className }: HelpIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Help"
          className={cn(
            'inline-flex items-center justify-center w-4 h-4 rounded-full',
            'bg-muted/30 hover:bg-muted/50 transition-colors',
            'text-muted-foreground hover:text-foreground',
            className
          )}
        >
          <HelpCircle className="w-3 h-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-[250px] text-sm"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
