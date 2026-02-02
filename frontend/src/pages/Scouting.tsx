import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Shield, Target, AlertTriangle, Swords, TrendingUp,
  ChevronDown, X, Star, Lightbulb, Eye, Crosshair,
  FileText, CheckCircle, Zap,
} from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { useTeamDetail, useTeamPatterns, useMatchupAnalysis } from '@/hooks/useTeamDetail';
import { ChampionPortrait } from '@/components/shared/ChampionPortrait';
import { ScoreBar } from '@/components/shared/ScoreBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useExportShare } from '@/hooks/useExportShare';
import { ExportShareMenu } from '@/components/shared/ExportShareMenu';
import type { Team } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Helpers ──────────────────────────────────────────────────────

function getWinRateColor(wr: number): string {
  if (wr > 0.55) return 'text-green-400';
  if (wr < 0.45) return 'text-red-400';
  return 'text-foreground';
}

function getVerdict(yourWR: number, oppWR: number) {
  const diff = yourWR - oppWR;
  if (diff > 0.08) return { label: 'FAVORABLE', color: 'text-green-400 bg-green-500/15 border-green-500/30', Icon: TrendingUp };
  if (diff < -0.08) return { label: 'UNFAVORABLE', color: 'text-red-400 bg-red-500/15 border-red-500/30', Icon: AlertTriangle };
  return { label: 'EVEN', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30', Icon: Swords };
}

function getPriorityColor(p: 'HIGH' | 'MEDIUM' | 'LOW') {
  if (p === 'HIGH') return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (p === 'MEDIUM') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-muted text-muted-foreground border-card-border';
}

function SectionLabel({ number, title, icon: Icon }: { number: string; title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
        <span className="text-primary font-bold text-sm font-mono">{number}</span>
      </div>
      <Icon className="w-5 h-5 text-primary" />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    </div>
  );
}

// ── Team Selector ────────────────────────────────────────────────

function ScoutingTeamSelector({
  label, side, selectedTeam, onSelect, excludeTeamId,
}: {
  label: string;
  side: 'blue' | 'red';
  selectedTeam: Team | null;
  onSelect: (t: Team | null) => void;
  excludeTeamId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: teams, isLoading } = useTeams();

  const filtered = teams?.filter((t) =>
    t.id !== excludeTeamId &&
    (t.name.toLowerCase().includes(search.toLowerCase()) ||
     t.acronym.toLowerCase().includes(search.toLowerCase()))
  );

  const sideColor = side === 'blue' ? 'text-blue-side' : 'text-red-side';
  const sideBorder = side === 'blue' ? 'border-blue-side/40' : 'border-red-side/40';
  const sideBg = side === 'blue' ? 'bg-blue-side/10' : 'bg-red-side/10';

  return (
    <div className="flex-1 space-y-2">
      <label className={cn('text-sm font-semibold uppercase tracking-wider', sideColor)}>{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              'w-full justify-between h-16 bg-card border-card-border hover:bg-card-hover',
              selectedTeam && cn(sideBorder, sideBg)
            )}
          >
            {selectedTeam ? (
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', side === 'blue' ? 'bg-blue-side/20' : 'bg-red-side/20')}>
                  <span className={cn('font-bold text-sm', sideColor)}>{selectedTeam.acronym}</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold">{selectedTeam.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTeam.win_rate.toFixed(1)}% WR</p>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Select team...</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 bg-popover border-card-border" align="start">
          <div className="p-2 border-b border-card-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search teams..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 bg-card border-card-border" />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1" onWheel={(e) => e.stopPropagation()}>
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : filtered?.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No teams found</div>
            ) : (
              filtered?.map((team) => (
                <button
                  key={team.id}
                  onClick={() => { onSelect(team); setOpen(false); setSearch(''); }}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-accent text-left',
                    selectedTeam?.id === team.id && 'bg-accent'
                  )}
                >
                  <div className="w-8 h-8 rounded bg-card-hover flex items-center justify-center">
                    <span className="font-bold text-xs">{team.acronym}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{team.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={team.win_rate > 50 ? 'text-success' : 'text-danger'}>{team.win_rate.toFixed(0)}% WR</span>
                      <span>{team.games_played} games</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      {selectedTeam && (
        <Button variant="ghost" size="sm" onClick={() => onSelect(null)} className="text-xs text-muted-foreground hover:text-foreground">
          <X className="w-3 h-3 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────

export default function Scouting() {
  const [yourTeam, setYourTeam] = useState<Team | null>(null);
  const [opponent, setOpponent] = useState<Team | null>(null);

  const { data: opponentPatterns, isLoading: patternsLoading } = useTeamPatterns(opponent?.id);
  const { data: matchup, isLoading: matchupLoading } = useMatchupAnalysis(yourTeam?.id, opponent?.id);

  const bothSelected = !!yourTeam && !!opponent;
  const isLoading = patternsLoading || matchupLoading;
  const hasData = !!opponentPatterns && !!matchup;

  const verdict = useMemo(() => {
    if (!matchup) return null;
    return getVerdict(matchup.team1.win_rate / 100, matchup.team2.win_rate / 100);
  }, [matchup]);

  const reportRef = useRef<HTMLDivElement>(null);
  const exportShare = useExportShare({
    targetRef: reportRef,
    filename: `draftmind-scouting-${yourTeam?.acronym ?? ''}-vs-${opponent?.acronym ?? ''}`,
    title: `Scouting Report: ${yourTeam?.name ?? ''} vs ${opponent?.name ?? ''}`,
    subtitle: verdict ? `Verdict: ${verdict.label}` : undefined,
  });

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Scouting Report</h1>
            <p className="text-sm text-muted-foreground">Pre-game intelligence — select both teams to generate actionable insights</p>
          </div>
        </div>
      </motion.div>

      {/* Team Selection Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          <ScoutingTeamSelector label="Your Team" side="blue" selectedTeam={yourTeam} onSelect={setYourTeam} excludeTeamId={opponent?.id} />
          <div className="flex items-center justify-center lg:pt-6">
            <div className="w-12 h-12 rounded-full bg-card border border-card-border flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground">VS</span>
            </div>
          </div>
          <ScoutingTeamSelector label="Opponent" side="red" selectedTeam={opponent} onSelect={setOpponent} excludeTeamId={yourTeam?.id} />
        </div>
      </motion.div>

      {/* Empty State */}
      {!bothSelected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <EmptyState
            variant="team"
            title="Select Both Teams"
            message="Choose your team and the opponent to generate a detailed scouting report with ban recommendations, danger picks, and draft tendencies."
          />
        </motion.div>
      )}

      {/* Loading */}
      {bothSelected && isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      )}

      {/* ── REPORT ── */}
      {bothSelected && !isLoading && hasData && (
        <div ref={reportRef} className="space-y-6">
          {/* Report stamp + share */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="uppercase tracking-widest font-semibold">
                Scouting Report — {matchup.team1.name} vs {matchup.team2.name}
              </span>
            </div>
            <ExportShareMenu
              isCapturing={exportShare.isCapturing}
              onDownloadPDF={exportShare.downloadPDF}
              onDownloadPNG={exportShare.downloadPNG}
              onShareTwitter={exportShare.shareToTwitter}
              onShareReddit={exportShare.shareToReddit}
              onCopyShareText={exportShare.copyShareText}
              onNativeShare={exportShare.nativeShare}
              canNativeShare={exportShare.canNativeShare}
              variant="outline"
            />
          </motion.div>

          {/* ── Section A: Intel Summary ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
            <SectionLabel number="A" title="Intel Summary" icon={Crosshair} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Your Team */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-blue-side/20 flex items-center justify-center mx-auto">
                  <span className="font-bold text-blue-side text-xl">{matchup.team1.acronym}</span>
                </div>
                <p className="font-semibold text-foreground">{matchup.team1.name}</p>
                <p className={cn('text-2xl font-bold font-mono', getWinRateColor(matchup.team1.win_rate / 100))}>
                  {matchup.team1.win_rate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">{matchup.team1.games} games</p>
              </div>

              {/* Verdict */}
              <div className="text-center space-y-3">
                {verdict && (
                  <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm', verdict.color)}>
                    <verdict.Icon className="w-4 h-4" />
                    {verdict.label}
                  </div>
                )}
                {matchup.head_to_head && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Head-to-Head</p>
                    <p className="text-lg font-mono">
                      <span className="text-blue-side font-bold">{matchup.head_to_head.team1_wins}</span>
                      <span className="text-muted-foreground mx-2">-</span>
                      <span className="text-red-side font-bold">{matchup.head_to_head.team2_wins}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Opponent */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-red-side/20 flex items-center justify-center mx-auto">
                  <span className="font-bold text-red-side text-xl">{matchup.team2.acronym}</span>
                </div>
                <p className="font-semibold text-foreground">{matchup.team2.name}</p>
                <p className={cn('text-2xl font-bold font-mono', getWinRateColor(matchup.team2.win_rate / 100))}>
                  {matchup.team2.win_rate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">{matchup.team2.games} games</p>
              </div>
            </div>
          </motion.div>

          {/* ── Section B: Target Bans ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <SectionLabel number="B" title="Target Bans" icon={Target} />
            <p className="text-sm text-muted-foreground mb-4">
              Priority ban targets when playing against <span className="text-red-side font-semibold">{matchup.team2.name}</span>
            </p>
            {matchup.ban_recommendations_vs_team2.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchup.ban_recommendations_vs_team2.slice(0, 5).map((rec, i) => (
                  <motion.div
                    key={rec.champion_name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    className={cn(
                      'relative bg-card-hover rounded-xl p-4 space-y-3 border',
                      rec.priority === 'HIGH' ? 'border-red-500/40' : rec.priority === 'MEDIUM' ? 'border-amber-500/30' : 'border-card-border'
                    )}
                  >
                    <Badge className={cn('absolute top-3 right-3 text-xs border', getPriorityColor(rec.priority))}>{rec.priority}</Badge>
                    <div className="flex items-center gap-3">
                      <ChampionPortrait name={rec.champion_name} size="lg" showTooltip={false} />
                      <div>
                        <p className="font-semibold text-foreground text-lg">{rec.champion_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific ban recommendations available.</p>
            )}
          </motion.div>

          {/* ── Section C: Opponent Danger Picks ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <SectionLabel number="C" title="Opponent Danger Picks" icon={Zap} />
            <p className="text-sm text-muted-foreground mb-4">Champions the opponent excels on — consider banning or preparing counters</p>
            {opponentPatterns.comfort_picks.length > 0 ? (
              <div className="space-y-3">
                {opponentPatterns.comfort_picks.slice(0, 6).map((pick, i) => (
                  <motion.div
                    key={pick.champion_name}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className="flex items-center gap-4 bg-card-hover rounded-lg p-3"
                  >
                    <span className="font-mono text-sm text-muted-foreground w-6 text-center">{i + 1}</span>
                    <ChampionPortrait name={pick.champion_name} size="md" showTooltip={false} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{pick.champion_name}</p>
                      <p className="text-xs text-muted-foreground">{pick.games} games</p>
                    </div>
                    <div className="w-32 hidden sm:block">
                      <ScoreBar value={pick.win_rate} size="sm" variant={pick.win_rate > 0.55 ? 'red' : 'gradient'} showValue={false} />
                    </div>
                    <div className="text-right">
                      <p className={cn('font-mono text-sm', pick.win_rate > 0.55 ? 'text-red-400' : 'text-foreground')}>
                        {(pick.win_rate * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">{(pick.pick_rate * 100).toFixed(0)}% PR</p>
                    </div>
                    {pick.above_average && (
                      <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs border">THREAT</Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No comfort pick data available.</p>
            )}
          </motion.div>

          {/* ── Section D: One-Trick Alerts ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <SectionLabel number="D" title="One-Trick Alerts" icon={AlertTriangle} />
            {opponentPatterns.one_tricks.length > 0 ? (
              <div className="space-y-3">
                {opponentPatterns.one_tricks.map((otp, i) => (
                  <motion.div
                    key={`${otp.player_name}-${otp.champion_name}`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground">{otp.player_name}</span>
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs border">
                            {(otp.percentage * 100).toFixed(0)}% PICK RATE
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Plays <span className="text-red-400 font-semibold">{otp.champion_name}</span> in {otp.games}/{otp.total_games} games.{' '}
                          <span className="text-amber-400">Ban or prepare a hard counter.</span>
                        </p>
                      </div>
                      <ChampionPortrait name={otp.champion_name} size="lg" showTooltip={false} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">No one-trick vulnerabilities detected in opponent's roster</span>
              </div>
            )}
          </motion.div>

          {/* ── Section E: Draft Tendencies ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
            <SectionLabel number="E" title="Opponent Draft Tendencies" icon={Eye} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* First Picks */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Blue-Side First Picks
                </h4>
                <div className="space-y-2">
                  {opponentPatterns.first_pick_blue.slice(0, 4).map((pick, i) => (
                    <motion.div
                      key={pick.champion_name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.04 }}
                      className="flex items-center gap-3 bg-card-hover rounded-lg p-2"
                    >
                      <ChampionPortrait name={pick.champion_name} size="sm" showTooltip={false} />
                      <span className="flex-1 font-medium text-foreground text-sm">{pick.champion_name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{pick.count}x</span>
                      <span className={cn('font-mono text-xs', getWinRateColor(pick.win_rate / 100))}>
                        {pick.win_rate.toFixed(0)}% WR
                      </span>
                    </motion.div>
                  ))}
                  {opponentPatterns.first_pick_blue.length === 0 && (
                    <p className="text-sm text-muted-foreground">No first-pick data available.</p>
                  )}
                </div>
              </div>

              {/* Bans */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-side" /> What They Ban
                </h4>
                <div className="space-y-2">
                  {opponentPatterns.bans_by_team.slice(0, 4).map((ban, i) => (
                    <motion.div
                      key={ban.champion_name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.04 }}
                      className="flex items-center gap-3 bg-card-hover rounded-lg p-2"
                    >
                      <ChampionPortrait name={ban.champion_name} size="sm" showTooltip={false} />
                      <span className="flex-1 font-medium text-foreground text-sm">{ban.champion_name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{ban.count}x ({ban.rate.toFixed(0)}%)</span>
                    </motion.div>
                  ))}
                  {opponentPatterns.bans_by_team.length === 0 && (
                    <p className="text-sm text-muted-foreground">No ban data available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Adaptation Notes */}
            {opponentPatterns.adaptation_notes.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> Adaptation Patterns
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {opponentPatterns.adaptation_notes.map((note, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.04 }}
                      className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground">{note}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Section F: Shared Battleground ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
            <SectionLabel number="F" title="Shared Battleground" icon={Swords} />
            <p className="text-sm text-muted-foreground mb-4">Champions both teams prioritize — expect these to be contested in draft</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contested Picks */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Contested Picks</h4>
                {matchup.shared_priority_picks.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {matchup.shared_priority_picks.map((name, i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.05 }}
                        className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2"
                      >
                        <ChampionPortrait name={name} size="sm" showTooltip={false} />
                        <span className="font-medium text-foreground text-sm">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No shared priority picks detected.</p>
                )}
              </div>

              {/* Contested Bans */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Contested Bans</h4>
                {matchup.shared_priority_bans.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {matchup.shared_priority_bans.map((name, i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.65 + i * 0.05 }}
                        className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2"
                      >
                        <ChampionPortrait name={name} size="sm" state="banned" showTooltip={false} />
                        <span className="font-medium text-foreground text-sm">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No shared priority bans detected.</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
