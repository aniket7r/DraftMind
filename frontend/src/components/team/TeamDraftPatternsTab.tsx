import { motion } from 'framer-motion';
import { Shield, Target, Star, AlertTriangle, Lightbulb, PieChart, CheckCircle } from 'lucide-react';
import { useTeamPatterns } from '@/hooks/useTeamDetail';
import { ChampionPortrait } from '@/components/shared/ChampionPortrait';
import { ScoreBar } from '@/components/shared/ScoreBar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TeamDraftPatternsTabProps {
  teamId: string;
}

export function TeamDraftPatternsTab({ teamId }: TeamDraftPatternsTabProps) {
  const { data: patterns, isLoading } = useTeamPatterns(teamId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (!patterns) {
    return <div className="text-muted-foreground">No pattern data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Ban Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Their Bans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-side" />
            Their Bans
          </h3>
          <div className="space-y-3">
            {patterns.bans_by_team.slice(0, 8).map((ban, index) => (
              <motion.div
                key={ban.champion_name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <ChampionPortrait name={ban.champion_name} size="sm" showTooltip={false} />
                <span className="flex-1 font-medium text-foreground">{ban.champion_name}</span>
                <div className="w-20">
                  <ScoreBar value={ban.rate / 40} size="sm" variant="blue" showValue={false} />
                </div>
                <span className="font-mono text-sm w-16 text-right">{ban.count}x ({ban.rate.toFixed(0)}%)</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bans Against */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-red-side" />
            Bans Against Them
          </h3>
          <div className="space-y-3">
            {patterns.bans_against_team.slice(0, 8).map((ban, index) => (
              <motion.div
                key={ban.champion_name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center gap-3"
              >
                <ChampionPortrait name={ban.champion_name} size="sm" showTooltip={false} />
                <span className="flex-1 font-medium text-foreground">{ban.champion_name}</span>
                <div className="w-20">
                  <ScoreBar value={ban.rate / 40} size="sm" variant="red" showValue={false} />
                </div>
                <span className="font-mono text-sm w-16 text-right">{ban.count}x ({ban.rate.toFixed(0)}%)</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Section 2: First Pick Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 space-y-4"
      >
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          First Pick Preferences
        </h3>
        <div className="flex flex-wrap gap-4">
          {patterns.first_pick_blue.slice(0, 5).map((pick, index) => (
            <motion.div
              key={pick.champion_name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="flex items-center gap-2 bg-card-hover rounded-lg px-3 py-2"
            >
              <ChampionPortrait name={pick.champion_name} size="sm" showTooltip={false} />
              <div>
                <p className="font-medium text-foreground text-sm">{pick.champion_name}</p>
                <p className="text-xs text-muted-foreground">
                  {pick.count}x &bull; {pick.win_rate.toFixed(0)}% WR
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        {patterns.first_pick_blue[0] && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm">
            <span className="text-primary font-medium">Insight:</span>{' '}
            <span className="text-foreground">
              Prioritizes {patterns.first_pick_blue[0].champion_name} first pick on blue side ({patterns.first_pick_blue[0].count} times)
            </span>
          </div>
        )}
      </motion.div>

      {/* Section 3: Comfort Picks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5 space-y-4"
      >
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Comfort Picks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {patterns.comfort_picks.map((pick, index) => (
            <motion.div
              key={pick.champion_name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.03 }}
              className="bg-card-hover rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <ChampionPortrait name={pick.champion_name} size="sm" showTooltip={false} />
                <span className="font-medium text-foreground">{pick.champion_name}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Pick Rate: {(pick.pick_rate * 100).toFixed(1)}%</p>
                <p>Win Rate: <span className={pick.win_rate > 0.55 ? 'text-green-400' : ''}>{(pick.win_rate * 100).toFixed(1)}%</span></p>
                <p>{pick.games} games</p>
              </div>
              {pick.above_average && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                  ● ABOVE TEAM AVERAGE
                </Badge>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Section 4: One-Trick Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5 space-y-4"
      >
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          One-Trick Alerts
        </h3>
        {patterns.one_tricks.length > 0 ? (
          <div className="space-y-3">
            {patterns.one_tricks.map((otp, index) => (
              <motion.div
                key={`${otp.player_name}-${otp.champion_name}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div className="flex-1">
                    <p className="text-red-400 font-semibold">
                      HIGH SEVERITY: {otp.player_name} plays {otp.champion_name} in {(otp.percentage * 100).toFixed(0)}% of games ({otp.games}/{otp.total_games})
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recommendation: <span className="text-amber-400 font-medium">BAN THIS CHAMPION</span>
                    </p>
                  </div>
                  <ChampionPortrait name={otp.champion_name} size="md" showTooltip={false} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span>No one-trick vulnerabilities detected</span>
          </div>
        )}
      </motion.div>

      {/* Section 5: Composition Tendencies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-5 space-y-4"
      >
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          Composition Tendencies
        </h3>
        <div className="space-y-3">
          {patterns.composition_tags.map((tag, index) => (
            <div key={tag.tag} className="flex items-center gap-3">
              <span className="w-20 text-sm text-muted-foreground">{tag.tag}</span>
              <div className="flex-1 h-4 rounded-full bg-card-border overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${tag.percentage}%` }}
                  transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
                />
              </div>
              <span className="font-mono text-sm w-12 text-right">{tag.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 6: Adaptation Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-5 space-y-4"
      >
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          Adaptation Notes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {patterns.adaptation_notes.map((note, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className="flex items-start gap-3 bg-card-hover rounded-lg p-3"
            >
              <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{note}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
