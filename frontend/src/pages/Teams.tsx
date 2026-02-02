import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Trophy, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '@/hooks/useTeams';
import { useMeta } from '@/hooks/useMeta';
import { ChampionPortrait } from '@/components/shared/ChampionPortrait';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Team } from '@/lib/api';

function getWinRateColor(winRate: number): string {
  if (winRate > 0.55) return 'from-success/20 to-success/5';
  if (winRate < 0.45) return 'from-danger/20 to-danger/5';
  return 'from-muted/20 to-muted/5';
}

function getWinRateBarColor(winRate: number): string {
  if (winRate > 0.55) return 'bg-success';
  if (winRate < 0.45) return 'bg-danger';
  return 'bg-muted';
}

export default function Teams() {
  const navigate = useNavigate();
  const { data: teams, isLoading, isError, refetch } = useTeams();
  const { data: meta } = useMeta();
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    
    return teams.filter((team) => {
      const query = searchQuery.toLowerCase();
      return (
        team.name.toLowerCase().includes(query) ||
        team.acronym.toLowerCase().includes(query)
      );
    });
  }, [teams, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-6">
        <div className="space-y-4">
          <div className="h-10 w-64 bg-card rounded-lg animate-pulse" />
          <div className="h-6 w-48 bg-card rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-full max-w-md bg-card rounded-lg animate-pulse" />
        <LoadingState variant="card-grid" count={9} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState
          title="Could not load teams"
          message="We encountered an error loading the team data. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Scouting Database</h1>
          <p className="text-muted-foreground">
            {meta ? `${teams?.length ?? 0} teams analyzed across ${meta.series_count.toLocaleString()} series` : 'Loading team data...'}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Teams:</span>
            <span className="font-mono text-foreground">{teams?.length ?? 0}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Total Games:</span>
            <span className="font-mono text-foreground">{meta?.games_count.toLocaleString() ?? 0}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Series:</span>
            <span className="font-mono text-foreground">{meta?.series_count ?? 0}</span>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-card-border"
        />
      </motion.div>

      {/* Team Grid */}
      {filteredTeams.length === 0 ? (
        <EmptyState
          variant="search"
          title="No teams found"
          message={`No teams match "${searchQuery}". Try a different search term.`}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filteredTeams.map((team, index) => (
            <TeamCard
              key={team.id}
              team={team}
              index={index}
              onClick={() => navigate(`/teams/${team.id}`)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

interface TeamCardProps {
  team: Team;
  index: number;
  onClick: () => void;
}

function TeamCard({ team, index, onClick }: TeamCardProps) {
  const wins = Math.round(team.games_played * team.win_rate);
  const losses = team.games_played - wins;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'bg-card rounded-xl border border-card-border p-5 cursor-pointer',
        'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200',
        'group'
      )}
    >
      {/* Team Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
            {team.name}
          </h3>
          <p className="text-sm text-muted-foreground font-mono">
            {team.games_played} games • {team.series_played} series
          </p>
        </div>
        <div className={cn(
          'px-3 py-1.5 rounded-full text-sm font-bold font-mono',
          team.win_rate > 0.55 ? 'bg-success/20 text-success' :
          team.win_rate < 0.45 ? 'bg-danger/20 text-danger' :
          'bg-muted/20 text-muted-foreground'
        )}>
          {(team.win_rate * 100).toFixed(1)}%
        </div>
      </div>

      {/* Win Rate Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Win Rate: {wins}W - {losses}L</span>
        </div>
        <div className="h-2 rounded-full bg-card-border overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', getWinRateBarColor(team.win_rate))}
            initial={{ width: 0 }}
            animate={{ width: `${team.win_rate * 100}%` }}
            transition={{ duration: 0.5, delay: index * 0.03 + 0.2 }}
          />
        </div>
      </div>

      {/* Top Picks */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Top Picks:</p>
        <div className="flex gap-1.5">
          {team.top_picks?.slice(0, 5).map((pick) => (
            <ChampionPortrait
              key={pick.champion_name}
              name={pick.champion_name}
              size="sm"
              showTooltip
              winRate={pick.win_rate}
            />
          )) ?? (
            <span className="text-xs text-muted-foreground">No data</span>
          )}
        </div>
      </div>

      {/* Top Bans */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground">
          Top Bans:{' '}
          {team.top_bans?.slice(0, 2).map((ban, i) => (
            <span key={ban.champion_name}>
              <span className="text-foreground">{ban.champion_name}</span>
              <span className="text-gold font-mono"> ({ban.count})</span>
              {i < 1 && team.top_bans && team.top_bans.length > 1 ? ', ' : ''}
            </span>
          )) ?? <span>No data</span>}
        </p>
      </div>

      {/* View Report Button */}
      <Button
        variant="outline"
        className="w-full border-card-border group-hover:border-primary group-hover:text-primary transition-all"
      >
        View Scouting Report
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.div>
  );
}
