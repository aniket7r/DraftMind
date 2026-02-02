import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Target, Shield, AlertCircle } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { useMatchupAnalysis } from '@/hooks/useTeamDetail';
import { ChampionPortrait } from '@/components/shared/ChampionPortrait';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TeamDetail } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TeamMatchupToolTabProps {
  team: TeamDetail;
}

function getPriorityColor(priority: 'HIGH' | 'MEDIUM' | 'LOW'): string {
  switch (priority) {
    case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'LOW': return 'bg-muted text-muted-foreground border-card-border';
  }
}

export function TeamMatchupToolTab({ team }: TeamMatchupToolTabProps) {
  const { data: allTeams } = useTeams();
  const [selectedOpponent, setSelectedOpponent] = useState<string | undefined>();
  const { data: matchup, isLoading } = useMatchupAnalysis(team.id, selectedOpponent);

  const opponentTeams = allTeams?.filter(t => t.id !== team.id) ?? [];

  return (
    <div className="space-y-6">
      {/* Opponent Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          Select Opponent Team
        </h3>
        <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
          <SelectTrigger className="w-full max-w-md bg-card border-card-border">
            <SelectValue placeholder="Choose an opponent to analyze..." />
          </SelectTrigger>
          <SelectContent>
            {opponentTeams.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ({(t.win_rate * 100).toFixed(1)}% WR)
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Matchup Analysis */}
      {selectedOpponent && (
        <>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
            </div>
          ) : matchup ? (
            <>
              {/* Head-to-Head Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-center gap-8">
                  {/* Team 1 */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-side/20 flex items-center justify-center mx-auto mb-2">
                      <span className="font-bold text-blue-side text-xl">{matchup.team1.acronym}</span>
                    </div>
                    <p className="font-semibold text-foreground">{matchup.team1.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(matchup.team1.win_rate * 100).toFixed(1)}% WR • {matchup.team1.games} games
                    </p>
                    {matchup.head_to_head && (
                      <p className="text-2xl font-bold text-blue-side mt-2">{matchup.head_to_head.team1_wins}</p>
                    )}
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <p className="text-3xl font-bold text-muted-foreground">VS</p>
                    {matchup.head_to_head && (
                      <p className="text-xs text-muted-foreground mt-1">Head-to-Head</p>
                    )}
                  </div>

                  {/* Team 2 */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-side/20 flex items-center justify-center mx-auto mb-2">
                      <span className="font-bold text-red-side text-xl">{matchup.team2.acronym}</span>
                    </div>
                    <p className="font-semibold text-foreground">{matchup.team2.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(matchup.team2.win_rate * 100).toFixed(1)}% WR • {matchup.team2.games} games
                    </p>
                    {matchup.head_to_head && (
                      <p className="text-2xl font-bold text-red-side mt-2">{matchup.head_to_head.team2_wins}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Shared Priority Champions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shared Priority Picks */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-5 space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Shared Priority Picks
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Champions both teams want — key draft battlegrounds
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {matchup.shared_priority_picks.map((name, i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="flex items-center gap-2 bg-card-hover rounded-lg px-3 py-2"
                      >
                        <ChampionPortrait name={name} size="sm" showTooltip={false} />
                        <span className="font-medium text-foreground text-sm">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Shared Priority Bans */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="glass-card p-5 space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-500" />
                    Shared Priority Bans
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Bans both teams make often
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {matchup.shared_priority_bans.map((name, i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                        className="flex items-center gap-2 bg-card-hover rounded-lg px-3 py-2"
                      >
                        <ChampionPortrait name={name} size="sm" showTooltip={false} state="banned" />
                        <span className="font-medium text-foreground text-sm">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Ban Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bans vs Team 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-5 space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-side" />
                    Bans Against {matchup.team1.acronym}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    If you're playing against {matchup.team1.name}
                  </p>
                  <div className="space-y-3">
                    {matchup.ban_recommendations_vs_team1.map((rec, i) => (
                      <motion.div
                        key={rec.champion_name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-card-hover"
                      >
                        <ChampionPortrait name={rec.champion_name} size="sm" showTooltip={false} />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{rec.champion_name}</p>
                          <p className="text-xs text-muted-foreground">{rec.reason}</p>
                        </div>
                        <Badge className={cn('text-xs border', getPriorityColor(rec.priority))}>
                          {rec.priority}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Bans vs Team 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="glass-card p-5 space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-side" />
                    Bans Against {matchup.team2.acronym}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    If you're playing against {matchup.team2.name}
                  </p>
                  <div className="space-y-3">
                    {matchup.ban_recommendations_vs_team2.map((rec, i) => (
                      <motion.div
                        key={rec.champion_name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-card-hover"
                      >
                        <ChampionPortrait name={rec.champion_name} size="sm" showTooltip={false} />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{rec.champion_name}</p>
                          <p className="text-xs text-muted-foreground">{rec.reason}</p>
                        </div>
                        <Badge className={cn('text-xs border', getPriorityColor(rec.priority))}>
                          {rec.priority}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Failed to load matchup analysis
            </div>
          )}
        </>
      )}

      {!selectedOpponent && (
        <div className="text-center py-12 text-muted-foreground">
          Select an opponent team to see matchup analysis
        </div>
      )}
    </div>
  );
}
