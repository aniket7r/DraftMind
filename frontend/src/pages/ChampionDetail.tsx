import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Target, Crown, Swords, Users, TrendingUp, TrendingDown, Skull, Heart, Coins, Eye, Crosshair } from 'lucide-react';
import { useChampionDetail } from '@/hooks/useChampionDetail';
import { ChampionPortrait } from '@/components/shared/ChampionPortrait';
import { ScoreBar } from '@/components/shared/ScoreBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getChampionSplashUrl } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const roleIcons: Record<string, React.ReactNode> = {
  top: <Shield className="w-4 h-4" />,
  jungle: <Target className="w-4 h-4" />,
  mid: <Crown className="w-4 h-4" />,
  bot: <Swords className="w-4 h-4" />,
  support: <Users className="w-4 h-4" />,
};

function getWinRateColor(winRate: number): string {
  if (winRate > 0.52) return 'text-green-400';
  if (winRate < 0.48) return 'text-red-400';
  return 'text-foreground';
}

function StatCard({ label, value, subValue, icon, variant }: { 
  label: string; 
  value: string; 
  subValue?: string;
  icon?: React.ReactNode;
  variant?: 'success' | 'danger' | 'primary' | 'default';
}) {
  const colorClasses = {
    success: 'text-green-400',
    danger: 'text-red-400',
    primary: 'text-primary',
    default: 'text-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 text-center"
    >
      {icon && <div className="flex justify-center mb-2 text-muted-foreground">{icon}</div>}
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={cn('text-2xl font-bold font-mono', colorClasses[variant || 'default'])}>{value}</p>
      {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
    </motion.div>
  );
}

export default function ChampionDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { data: champion, isLoading, error } = useChampionDetail(name);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-6">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !champion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Champion Not Found</h2>
          <p className="text-muted-foreground">Could not find champion: {name}</p>
          <Button onClick={() => navigate('/champions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Champions
          </Button>
        </div>
      </div>
    );
  }

  const presence = champion.pick_rate + champion.ban_rate;
  const totalGames = champion.blue_side_picks + champion.red_side_picks;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {/* Background Splash */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getChampionSplashUrl(champion.name)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/champions')}
            className="absolute top-6 left-6 text-foreground/80 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-end gap-6">
            <ChampionPortrait name={champion.name} size="xl" showTooltip={false} />
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">{champion.name}</h1>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1.5 capitalize">
                  {roleIcons[champion.role]}
                  {champion.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Row */}
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <StatCard
            label="Win Rate"
            value={`${(champion.win_rate * 100).toFixed(1)}%`}
            variant={champion.win_rate > 0.52 ? 'success' : champion.win_rate < 0.48 ? 'danger' : 'default'}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            label="Pick Rate"
            value={`${(champion.pick_rate * 100).toFixed(1)}%`}
            variant="primary"
            icon={<Crosshair className="w-5 h-5" />}
          />
          <StatCard
            label="Ban Rate"
            value={`${(champion.ban_rate * 100).toFixed(1)}%`}
            variant={champion.ban_rate > 0.15 ? 'danger' : 'default'}
            icon={<Shield className="w-5 h-5" />}
          />
          <StatCard
            label="Presence"
            value={`${(presence * 100).toFixed(1)}%`}
            variant={presence > 0.5 ? 'danger' : 'default'}
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard
            label="Games Played"
            value={totalGames.toString()}
            icon={<Swords className="w-5 h-5" />}
          />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5 space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              Performance Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">K/D/A</p>
                <p className="text-xl font-mono">
                  <span className="text-green-400">{champion.avg_kills.toFixed(1)}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-red-400">{champion.avg_deaths.toFixed(1)}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-blue-400">{champion.avg_assists.toFixed(1)}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Skull className="w-3 h-3" /> Avg Damage
                </p>
                <p className="text-xl font-mono text-foreground">{Math.round(champion.avg_damage).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Coins className="w-3 h-3" /> Avg Gold
                </p>
                <p className="text-xl font-mono text-foreground">{Math.round(champion.avg_gold).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Vision Score
                </p>
                <p className="text-xl font-mono text-foreground">{champion.avg_vision_score.toFixed(1)}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-xs text-muted-foreground">Avg CS</p>
                <p className="text-xl font-mono text-foreground">{champion.avg_cs.toFixed(0)}</p>
              </div>
            </div>
          </motion.div>

          {/* Side Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-5 space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Side Analysis
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-side font-medium">Blue Side</span>
                  <span className="text-xs text-muted-foreground">{champion.blue_side_picks} games</span>
                </div>
                <ScoreBar 
                  value={champion.blue_side_win_rate} 
                  variant="blue"
                  size="md"
                />
                <p className={cn('text-lg font-mono', getWinRateColor(champion.blue_side_win_rate))}>
                  {(champion.blue_side_win_rate * 100).toFixed(1)}% Win Rate
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-side font-medium">Red Side</span>
                  <span className="text-xs text-muted-foreground">{champion.red_side_picks} games</span>
                </div>
                <ScoreBar 
                  value={champion.red_side_win_rate} 
                  variant="red"
                  size="md"
                />
                <p className={cn('text-lg font-mono', getWinRateColor(champion.red_side_win_rate))}>
                  {(champion.red_side_win_rate * 100).toFixed(1)}% Win Rate
                </p>
              </div>
              <div className="pt-2 border-t border-card-border">
                <p className="text-xs text-muted-foreground">
                  {champion.blue_side_win_rate > champion.red_side_win_rate 
                    ? '🔵 Stronger on Blue Side' 
                    : '🔴 Stronger on Red Side'}
                  {' by '}
                  <span className="font-mono text-foreground">
                    {Math.abs((champion.blue_side_win_rate - champion.red_side_win_rate) * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Best Synergies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5 space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-400" />
              Best Synergies
            </h3>
            <div className="space-y-3">
              {champion.synergies.map((synergy, index) => (
                <motion.div
                  key={synergy.champion_name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <ChampionPortrait name={synergy.champion_name} size="sm" showTooltip={false} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{synergy.champion_name}</p>
                    <p className="text-xs text-muted-foreground">{synergy.games_together} games</p>
                  </div>
                  <div className="w-24">
                    <ScoreBar value={synergy.win_rate} size="sm" showValue={false} />
                  </div>
                  <span className={cn('font-mono text-sm', getWinRateColor(synergy.win_rate))}>
                    {(synergy.win_rate * 100).toFixed(1)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Toughest Matchups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-5 space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Toughest Matchups
            </h3>
            <div className="space-y-3">
              {champion.counters.map((counter, index) => (
                <motion.div
                  key={counter.champion_name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <ChampionPortrait name={counter.champion_name} size="sm" showTooltip={false} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{counter.champion_name}</p>
                    <p className="text-xs text-muted-foreground">{counter.games_against} games</p>
                  </div>
                  <div className="w-24">
                    <ScoreBar value={counter.win_rate} size="sm" variant="red" showValue={false} />
                  </div>
                  <span className={cn('font-mono text-sm', getWinRateColor(counter.win_rate))}>
                    {(counter.win_rate * 100).toFixed(1)}%
                  </span>
                  {counter.win_rate < 0.45 && (
                    <Badge variant="destructive" className="text-xs">Countered</Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Teams That Pick This Champion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Teams That Pick {champion.name}
          </h3>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {champion.picked_by_teams.map((team, index) => (
                <motion.div
                  key={team.team_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="glass-card p-4 min-w-[180px] space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-primary text-sm">{team.team_acronym}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{team.team_name}</p>
                      <p className="text-xs text-muted-foreground">{team.games_played} games</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <ScoreBar value={team.win_rate} size="sm" />
                  </div>
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
}
