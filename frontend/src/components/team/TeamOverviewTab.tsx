import { motion } from 'framer-motion';
import { Trophy, Swords, Shield } from 'lucide-react';
import { ChampionPortrait } from '@/components/shared/ChampionPortrait';
import { ScoreBar } from '@/components/shared/ScoreBar';
import type { TeamDetail } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TeamOverviewTabProps {
  team: TeamDetail;
}

function getWinRateColor(winRate: number): string {
  if (winRate > 0.55) return 'text-green-400';
  if (winRate < 0.48) return 'text-red-400';
  return 'text-foreground';
}

export function TeamOverviewTab({ team }: TeamOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Champion Picks Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 space-y-4"
      >
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          Champion Picks
        </h3>
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 text-xs text-muted-foreground pb-2 border-b border-card-border">
            <div className="w-10" />
            <div>Champion</div>
            <div className="w-12 text-center">Games</div>
            <div className="w-12 text-center">Wins</div>
            <div className="w-24 text-right">Win Rate</div>
          </div>
          {/* Rows */}
          {team.champion_picks.slice(0, 15).map((pick, index) => (
            <motion.div
              key={pick.champion_name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center py-1.5 hover:bg-card-hover rounded-lg px-1"
            >
              <ChampionPortrait name={pick.champion_name} size="sm" showTooltip={false} />
              <span className="font-medium text-foreground">{pick.champion_name}</span>
              <span className="w-12 text-center font-mono text-sm">{pick.games}</span>
              <span className="w-12 text-center font-mono text-sm text-green-400">{pick.wins}</span>
              <div className="w-24 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-card-border overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      pick.win_rate > 0.55 ? 'bg-green-500' : pick.win_rate < 0.45 ? 'bg-red-500' : 'bg-primary'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${pick.win_rate * 100}%` }}
                    transition={{ delay: index * 0.03, duration: 0.4 }}
                  />
                </div>
                <span className={cn('font-mono text-xs', getWinRateColor(pick.win_rate))}>
                  {(pick.win_rate * 100).toFixed(1)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Ban Analysis */}
      <div className="space-y-6">
        {/* Bans BY this team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Bans BY {team.name}
          </h3>
          <p className="text-xs text-muted-foreground">What this team prioritizes banning</p>
          <div className="space-y-2">
            {team.bans_by_team.slice(0, 10).map((ban, index) => (
              <motion.div
                key={ban.champion_name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                className="flex items-center gap-3"
              >
                <ChampionPortrait name={ban.champion_name} size="sm" showTooltip={false} />
                <span className="flex-1 font-medium text-foreground">{ban.champion_name}</span>
                <span className="font-mono text-sm text-muted-foreground">{ban.count} bans</span>
                <span className="font-mono text-xs text-primary">
                  {(ban.rate * 100).toFixed(0)}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bans AGAINST this team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Bans AGAINST {team.name}
          </h3>
          <p className="text-xs text-muted-foreground">What opponents fear about this team</p>
          <div className="space-y-2">
            {team.bans_against_team.slice(0, 10).map((ban, index) => (
              <motion.div
                key={ban.champion_name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.03 }}
                className="flex items-center gap-3"
              >
                <ChampionPortrait name={ban.champion_name} size="sm" showTooltip={false} />
                <span className="flex-1 font-medium text-foreground">{ban.champion_name}</span>
                <span 
                  className={cn(
                    'font-mono text-sm',
                    ban.count > 10 ? 'text-amber-400 font-bold' : 'text-muted-foreground'
                  )}
                >
                  {ban.count} bans
                </span>
                <span className={cn(
                  'font-mono text-xs',
                  ban.rate > 0.3 ? 'text-amber-400' : 'text-primary'
                )}>
                  {(ban.rate * 100).toFixed(0)}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
