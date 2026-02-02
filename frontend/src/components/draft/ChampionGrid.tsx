import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChampionPortrait } from '@/components/shared/ChampionPortrait';
import { EmptyState } from '@/components/shared/EmptyState';
import { useChampions } from '@/hooks/useChampions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChampionGridProps {
  usedChampions: Set<string>;
  bannedChampions: string[];
  pickedChampions: string[];
  onSelectChampion: (name: string) => void;
}

const roles = ['all', 'top', 'jungle', 'mid', 'bot', 'support'] as const;
type Role = (typeof roles)[number];

const roleLabels: Record<Role, string> = {
  all: 'All',
  top: 'Top',
  jungle: 'Jungle',
  mid: 'Mid',
  bot: 'Bot',
  support: 'Support',
};

export function ChampionGrid({
  usedChampions,
  bannedChampions,
  pickedChampions,
  onSelectChampion,
}: ChampionGridProps) {
  const { data: champions, isLoading } = useChampions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('all');

  const filteredChampions = useMemo(() => {
    if (!champions) return [];

    return champions.filter((champ) => {
      // Filter by search
      if (
        searchQuery &&
        !champ.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter by role
      if (selectedRole !== 'all' && champ.role !== selectedRole) {
        return false;
      }

      return true;
    });
  }, [champions, searchQuery, selectedRole]);

  const getChampionState = (name: string) => {
    if (bannedChampions.includes(name)) return 'banned';
    if (pickedChampions.includes(name)) return 'picked';
    return 'available';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          {roles.map((role) => (
            <Skeleton key={role} className="h-8 w-16" />
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2">
          {Array.from({ length: 48 }).map((_, i) => (
            <Skeleton key={i} className="w-12 h-12 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search champions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-card-border focus:border-primary"
        />
      </div>

      {/* Role filters */}
      <div className="flex gap-2 flex-wrap">
        {roles.map((role) => (
          <Button
            key={role}
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRole(role)}
            className={cn(
              'rounded-full px-4 transition-all',
              selectedRole === role
                ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                : 'bg-card border border-card-border text-muted-foreground hover:text-foreground hover:bg-card-hover'
            )}
          >
            {roleLabels[role]}
          </Button>
        ))}
      </div>

      {/* Champion grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2 flex-1 overflow-y-auto no-scrollbar p-1">
        <AnimatePresence mode="popLayout">
          {filteredChampions.map((champion, index) => (
            <motion.div
              key={champion.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, delay: index * 0.01 }}
              className="flex flex-col items-center gap-1"
            >
              <ChampionPortrait
                name={champion.name}
                size="md"
                state={getChampionState(champion.name)}
                winRate={champion.win_rate}
                pickRate={champion.pick_rate}
                role={champion.role}
                onClick={() => onSelectChampion(champion.name)}
              />
              <span className="text-[10px] text-muted-foreground truncate max-w-[48px] text-center">
                {champion.name}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredChampions.length === 0 && (
        <EmptyState
          variant="search"
          title="No champions found"
          message="No champions match your search. Try a different name or role filter."
          className="py-8"
        />
      )}
    </div>
  );
}
