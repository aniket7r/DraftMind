import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { ChampionPortrait } from '@/components/shared/ChampionPortrait';
import { ScoreBar } from '@/components/shared/ScoreBar';
import { Badge } from '@/components/ui/badge';
import type { TeamDetail } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TeamPlayerPoolsTabProps {
  team: TeamDetail;
}

function getPoolDepth(count: number): { label: string; color: string; variant: 'destructive' | 'secondary' | 'default' } {
  if (count < 4) return { label: 'Shallow', color: 'text-red-400', variant: 'destructive' };
  if (count < 8) return { label: 'Medium', color: 'text-amber-400', variant: 'secondary' };
  return { label: 'Deep', color: 'text-green-400', variant: 'default' };
}

function getWinRateColor(winRate: number): string {
  if (winRate > 0.55) return 'text-green-400';
  if (winRate < 0.48) return 'text-red-400';
  return 'text-foreground';
}

export function TeamPlayerPoolsTab({ team }: TeamPlayerPoolsTabProps) {
  // Sort players by total games played
  const sortedPlayers = [...team.player_pools].sort((a, b) => {
    const aGames = a.champions.reduce((sum, c) => sum + c.games, 0);
    const bGames = b.champions.reduce((sum, c) => sum + c.games, 0);
    return bGames - aGames;
  });

  return (
    <div className="space-y-6">
      {sortedPlayers.map((player, playerIndex) => {
        const poolInfo = getPoolDepth(player.champions.length);
        const maxGames = Math.max(...player.champions.map(c => c.games));

        return (
          <motion.div
            key={player.player_name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: playerIndex * 0.1 }}
            className="glass-card p-5 space-y-4"
          >
            {/* Player Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{player.player_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Champion Pool ({player.champions.length} unique champions)
                  </p>
                </div>
              </div>
              <Badge 
                variant={poolInfo.variant}
                className={cn(
                  'text-xs',
                  poolInfo.variant === 'default' && 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                )}
              >
                {poolInfo.label} Pool
              </Badge>
            </div>

            {/* Champion List */}
            <div className="space-y-2">
              {player.champions.map((champ, champIndex) => (
                <motion.div
                  key={champ.champion_name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: playerIndex * 0.1 + champIndex * 0.03 }}
                  className="flex items-center gap-3 py-1"
                >
                  <ChampionPortrait name={champ.champion_name} size="sm" showTooltip={false} />
                  <span className="w-28 font-medium text-foreground truncate">{champ.champion_name}</span>
                  <span className="text-sm text-muted-foreground w-20">{champ.games} games</span>
                  <span className={cn('font-mono text-sm w-16', getWinRateColor(champ.win_rate))}>
                    {(champ.win_rate * 100).toFixed(1)}% WR
                  </span>
                  <div className="flex-1 max-w-xs">
                    <div className="h-2 rounded-full bg-card-border overflow-hidden">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          champ.win_rate > 0.55 ? 'bg-green-500' : champ.win_rate < 0.45 ? 'bg-red-500' : 'bg-primary'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${(champ.games / maxGames) * 100}%` }}
                        transition={{ delay: playerIndex * 0.1 + champIndex * 0.03, duration: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pool Depth Indicator */}
            <div className="pt-3 border-t border-card-border">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Pool depth:</span>
                <div className="flex-1 max-w-[200px] h-2 rounded-full bg-card-border overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      player.champions.length >= 8 ? 'bg-green-500' :
                      player.champions.length >= 4 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((player.champions.length / 10) * 100, 100)}%` }}
                    transition={{ delay: playerIndex * 0.1 + 0.2, duration: 0.5 }}
                  />
                </div>
                <span className={cn('text-xs', poolInfo.color)}>
                  ({player.champions.length} champs, {poolInfo.label.toLowerCase()})
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
