import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Shield, Swords, Target, Users, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChampions } from '@/hooks/useChampions';
import { useMeta } from '@/hooks/useMeta';
import { ChampionPortrait } from '@/components/shared/ChampionPortrait';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Champion } from '@/lib/api';

type Role = 'all' | 'top' | 'jungle' | 'mid' | 'bot' | 'support';
type SortOption = 'presence' | 'win_rate' | 'pick_rate' | 'ban_rate' | 'games';

const roleIcons: Record<Role, React.ReactNode> = {
  all: <Users className="w-4 h-4" />,
  top: <Shield className="w-4 h-4" />,
  jungle: <Target className="w-4 h-4" />,
  mid: <Crown className="w-4 h-4" />,
  bot: <Swords className="w-4 h-4" />,
  support: <Users className="w-4 h-4" />,
};

const roleLabels: Record<Role, string> = {
  all: 'All',
  top: 'Top',
  jungle: 'Jungle',
  mid: 'Mid',
  bot: 'Bot',
  support: 'Support',
};

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'presence', label: 'Presence' },
  { value: 'win_rate', label: 'Win Rate' },
  { value: 'pick_rate', label: 'Pick Rate' },
  { value: 'ban_rate', label: 'Ban Rate' },
  { value: 'games', label: 'Games Played' },
];

function getPresenceColor(presence: number): string {
  if (presence > 0.5) return 'bg-red-500';
  if (presence > 0.3) return 'bg-orange-500';
  return 'bg-primary';
}

function getWinRateColor(winRate: number): string {
  if (winRate > 0.52) return 'text-green-400';
  if (winRate < 0.48) return 'text-red-400';
  return 'text-foreground';
}

export default function Champions() {
  const navigate = useNavigate();
  const { data: champions, isLoading: championsLoading, isError, refetch } = useChampions();
  const { data: meta, isLoading: metaLoading } = useMeta();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('all');
  const [sortBy, setSortBy] = useState<SortOption>('presence');

  const filteredAndSortedChampions = useMemo(() => {
    if (!champions) return [];

    let filtered = champions.filter((champ) => {
      const matchesSearch = champ.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'all' || champ.role === selectedRole;
      return matchesSearch && matchesRole;
    });

    // Sort champions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'presence':
          return (b.pick_rate + b.ban_rate) - (a.pick_rate + a.ban_rate);
        case 'win_rate':
          return b.win_rate - a.win_rate;
        case 'pick_rate':
          return b.pick_rate - a.pick_rate;
        case 'ban_rate':
          return b.ban_rate - a.ban_rate;
        case 'games':
          // Estimate games from pick_rate * total games
          return b.pick_rate - a.pick_rate;
        default:
          return 0;
      }
    });

    return filtered;
  }, [champions, searchQuery, selectedRole, sortBy]);

  const totalGames = meta?.games_count ?? 2282;

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState
          title="Could not load champions"
          message="We encountered an error loading champion data. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Champion Intelligence</h1>
          <p className="text-muted-foreground">
            Pro play statistics across {totalGames.toLocaleString()} games
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex gap-6">
          {metaLoading ? (
            <>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Champions:</span>
                <span className="font-mono text-foreground">{champions?.length ?? 0}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Total Games:</span>
                <span className="font-mono text-foreground">{totalGames.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Series:</span>
                <span className="font-mono text-foreground">{meta?.series_count ?? 0}</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search champions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-card-border"
          />
        </div>

        {/* Role Filter Pills */}
        <div className="flex gap-1">
          {(Object.keys(roleLabels) as Role[]).map((role) => (
            <Button
              key={role}
              variant={selectedRole === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole(role)}
              className={cn(
                'gap-1.5',
                selectedRole === role
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border-card-border hover:bg-card-hover'
              )}
            >
              {roleIcons[role]}
              {roleLabels[role]}
            </Button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[160px] bg-card border-card-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Champion Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-3"
      >
        {championsLoading ? (
          // Loading skeletons
          Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : filteredAndSortedChampions.length === 0 ? (
          <EmptyState
            variant="search"
            title="No champions found"
            message="No champions match your current filters. Try adjusting your search or role selection."
          />
        ) : (
          filteredAndSortedChampions.map((champion, index) => (
            <ChampionCard
              key={champion.id}
              champion={champion}
              totalGames={totalGames}
              index={index}
              onClick={() => navigate(`/champions/${champion.name.toLowerCase()}`)}
            />
          ))
        )}
      </motion.div>
    </div>
  );
}

interface ChampionCardProps {
  champion: Champion;
  totalGames: number;
  index: number;
  onClick: () => void;
}

function ChampionCard({ champion, totalGames, index, onClick }: ChampionCardProps) {
  const presence = champion.pick_rate + champion.ban_rate;
  const estimatedGames = Math.round(champion.pick_rate * totalGames);
  const estimatedBans = Math.round(champion.ban_rate * totalGames);
  
  // Mock blue/red side win rates (would come from API in real implementation)
  const blueWinRate = champion.win_rate + (Math.random() * 0.06 - 0.03);
  const redWinRate = champion.win_rate - (Math.random() * 0.06 - 0.03);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      onClick={onClick}
      className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-all duration-200 group"
    >
      <div className="flex items-center gap-4">
        {/* Portrait & Basic Info */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <ChampionPortrait
            name={champion.name}
            size="md"
            className="group-hover:ring-2 ring-primary/50 transition-all"
          />
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {champion.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="uppercase tracking-wider">{champion.role}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Win Rate */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className={cn('font-mono font-semibold', getWinRateColor(champion.win_rate))}>
              {(champion.win_rate * 100).toFixed(1)}%
            </p>
          </div>

          {/* Pick Rate */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Pick Rate</p>
            <p className="font-mono text-foreground">
              {(champion.pick_rate * 100).toFixed(1)}%
            </p>
          </div>

          {/* Ban Rate */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Ban Rate</p>
            <p className="font-mono text-foreground">
              {(champion.ban_rate * 100).toFixed(1)}%
            </p>
          </div>

          {/* Games */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Games</p>
            <p className="font-mono text-foreground">{estimatedGames}</p>
          </div>
        </div>

        {/* Presence Bar */}
        <div className="hidden lg:block min-w-[160px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Presence</span>
            <span className="text-xs font-mono text-foreground">
              {(presence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-card-border overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', getPresenceColor(presence))}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(presence * 100, 100)}%` }}
              transition={{ duration: 0.5, delay: index * 0.02 }}
            />
          </div>
        </div>

        {/* Side Win Rates */}
        <div className="hidden xl:flex gap-4 min-w-[140px]">
          <div className="space-y-1">
            <p className="text-xs text-blue-side">Blue WR</p>
            <p className={cn('font-mono text-sm', getWinRateColor(blueWinRate))}>
              {(blueWinRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-red-side">Red WR</p>
            <p className={cn('font-mono text-sm', getWinRateColor(redWinRate))}>
              {(redWinRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
