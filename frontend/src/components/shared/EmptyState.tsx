import { Search, Users, BarChart3, FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 'search' | 'team' | 'data' | 'default';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  message?: string;
  className?: string;
  action?: React.ReactNode;
}

const variantConfig: Record<EmptyStateVariant, { icon: React.ElementType; defaultTitle: string; defaultMessage: string }> = {
  search: {
    icon: Search,
    defaultTitle: 'No results found',
    defaultMessage: 'No items match your search criteria. Try adjusting your filters.',
  },
  team: {
    icon: Users,
    defaultTitle: 'Select a team',
    defaultMessage: 'Choose a team to view their scouting report and analysis.',
  },
  data: {
    icon: BarChart3,
    defaultTitle: 'No data available',
    defaultMessage: 'There is no data to display at the moment.',
  },
  default: {
    icon: FileQuestion,
    defaultTitle: 'Nothing here',
    defaultMessage: 'There is nothing to display.',
  },
};

export function EmptyState({
  variant = 'default',
  title,
  message,
  className,
  action,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center gap-4',
      className
    )}>
      <div className="w-20 h-20 rounded-full bg-card border border-card-border flex items-center justify-center">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          {title ?? config.defaultTitle}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {message ?? config.defaultMessage}
        </p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
