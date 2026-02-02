import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X, Swords, Zap, Shield } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { HelpIcon } from '@/components/onboarding/HelpIcon';
import { useTeams } from '@/hooks/useTeams';
import type { Team } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TeamSelectionModalProps {
  open: boolean;
  onStartDraft: (blueTeam: Team | null, redTeam: Team | null) => void;
}

// ── Animated background grid ──────────────────────────────────
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)]" />

      {/* Horizontal scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Blue glow left */}
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-side/10 rounded-full blur-[120px]" />
      {/* Red glow right */}
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-red-side/10 rounded-full blur-[120px]" />
    </div>
  );
}

// ── Team Selector Card ────────────────────────────────────────
function TeamSelectorCard({
  label,
  side,
  selectedTeam,
  onSelect,
  excludeTeamId,
}: {
  label: string;
  side: 'blue' | 'red';
  selectedTeam: Team | null;
  onSelect: (team: Team | null) => void;
  excludeTeamId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: teams, isLoading } = useTeams();

  const filteredTeams = teams?.filter((team) =>
    team.id !== excludeTeamId &&
    (team.name.toLowerCase().includes(search.toLowerCase()) ||
     team.acronym.toLowerCase().includes(search.toLowerCase()))
  );

  const isBlue = side === 'blue';
  const sideColor = isBlue ? 'text-blue-side' : 'text-red-side';
  const sideBg = isBlue ? 'bg-blue-side' : 'bg-red-side';
  const sideGlow = isBlue ? 'shadow-blue-side/20' : 'shadow-red-side/20';
  const sideBorderGlow = isBlue ? 'border-blue-side/40' : 'border-red-side/40';
  const sideGradient = isBlue
    ? 'from-blue-side/10 via-transparent to-transparent'
    : 'from-transparent via-transparent to-red-side/10';

  return (
    <motion.div
      initial={{ opacity: 0, x: isBlue ? -60 : 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: isBlue ? 0.2 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex flex-col items-center"
    >
      {/* Side Label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isBlue ? 0.4 : 0.6 }}
        className="flex items-center gap-2 mb-4"
      >
        <Shield className={cn('w-4 h-4', sideColor)} />
        <span className={cn('text-sm font-bold uppercase tracking-[0.2em]', sideColor)}>
          {label}
        </span>
      </motion.div>

      {/* Team Card */}
      <div className={cn(
        'relative w-full max-w-[280px] rounded-2xl border transition-all duration-300',
        selectedTeam
          ? cn(sideBorderGlow, 'shadow-lg', sideGlow)
          : 'border-card-border'
      )}>
        {/* Gradient overlay */}
        <div className={cn('absolute inset-0 rounded-2xl bg-gradient-to-r opacity-50', sideGradient)} />

        <div className="relative p-6">
          {/* Team Display */}
          <AnimatePresence mode="wait">
            {selectedTeam ? (
              <motion.div
                key={selectedTeam.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center space-y-3"
              >
                {/* Team badge */}
                <div className={cn(
                  'w-20 h-20 rounded-2xl flex items-center justify-center',
                  isBlue ? 'bg-blue-side/20 ring-2 ring-blue-side/30' : 'bg-red-side/20 ring-2 ring-red-side/30'
                )}>
                  <span className={cn('font-black text-2xl', sideColor)}>
                    {selectedTeam.acronym}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{selectedTeam.name}</p>
                  <div className="flex items-center gap-3 justify-center mt-1">
                    <span className={cn(
                      'text-sm font-mono font-bold',
                      selectedTeam.win_rate > 50 ? 'text-success' : selectedTeam.win_rate < 45 ? 'text-danger' : 'text-foreground'
                    )}>
                      {selectedTeam.win_rate.toFixed(1)}% WR
                    </span>
                    <span className="text-xs text-muted-foreground">{selectedTeam.games_played} games</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3 mr-1" /> Change team
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                {/* Empty state pulsing icon */}
                <motion.div
                  className={cn(
                    'w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center',
                    isBlue ? 'border-blue-side/30' : 'border-red-side/30'
                  )}
                  animate={{ borderColor: [isBlue ? 'hsl(var(--blue-side) / 0.2)' : 'hsl(var(--red-side) / 0.2)', isBlue ? 'hsl(var(--blue-side) / 0.5)' : 'hsl(var(--red-side) / 0.5)'] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                >
                  <span className="text-3xl text-muted-foreground">?</span>
                </motion.div>
                <p className="text-sm text-muted-foreground">No team selected</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selector Popover */}
          <div className="mt-4">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-between h-11 bg-card/50 border-card-border hover:bg-card-hover backdrop-blur-sm',
                    selectedTeam && sideBorderGlow
                  )}
                >
                  <span className="text-sm text-muted-foreground">
                    {selectedTeam ? 'Switch team...' : 'Choose team...'}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 bg-popover border-card-border" align="center">
                <div className="p-2 border-b border-card-border">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search teams..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 bg-card border-card-border"
                    />
                  </div>
                </div>
                <div className="max-h-[280px] overflow-y-auto p-1" onWheel={(e) => e.stopPropagation()}>
                  {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading teams...</div>
                  ) : filteredTeams?.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No teams found</div>
                  ) : (
                    filteredTeams?.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => {
                          onSelect(team);
                          setOpen(false);
                          setSearch('');
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors',
                          'hover:bg-accent text-left',
                          selectedTeam?.id === team.id && 'bg-accent'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center',
                          isBlue ? 'bg-blue-side/15' : 'bg-red-side/15'
                        )}>
                          <span className={cn('font-bold text-xs', sideColor)}>{team.acronym}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{team.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={team.win_rate > 50 ? 'text-success' : 'text-danger'}>
                              {team.win_rate.toFixed(0)}% WR
                            </span>
                            <span>•</span>
                            <span>{team.games_played} games</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── VS Divider ────────────────────────────────────────────────
function VSDivider() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.5, type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center justify-center gap-2 px-4"
    >
      {/* Vertical line top */}
      <motion.div
        className="w-px h-12 bg-gradient-to-b from-transparent via-primary/50 to-primary"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      />

      {/* VS badge */}
      <motion.div
        className="relative"
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-sm">
          <Swords className="w-6 h-6 text-primary" />
        </div>
        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-primary/30"
          animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>

      {/* Vertical line bottom */}
      <motion.div
        className="w-px h-12 bg-gradient-to-b from-primary via-primary/50 to-transparent"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      />
    </motion.div>
  );
}

// ── Main Modal ────────────────────────────────────────────────
export function TeamSelectionModal({ open, onStartDraft }: TeamSelectionModalProps) {
  const { data: teams } = useTeams();
  const [blueTeam, setBlueTeam] = useState<Team | null>(null);
  const [redTeam, setRedTeam] = useState<Team | null>(null);

  // Pre-select Cloud9 Kia on blue side
  useState(() => {
    if (teams) {
      const c9 = teams.find((t) => t.id === '47351');
      if (c9) setBlueTeam(c9);
    }
  });

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      <GridBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <Logo className="w-12 h-12" />
          </motion.div>

          <h1 className="text-3xl font-black text-foreground tracking-tight">
            DraftMind <span className="text-primary">AI</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mt-2 max-w-md mx-auto inline-flex items-center gap-1 justify-center flex-wrap"
          >
            Select teams to begin the draft. AI recommendations personalized to team data.
            <HelpIcon
              content="Selecting teams enables personalized signals: comfort picks, draft patterns, and player pool analysis. Skip for general meta-based recommendations."
              side="bottom"
              className="inline-flex align-middle"
            />
          </motion.p>
        </motion.div>

        {/* Team Selection Arena */}
        <div className="flex items-center justify-center w-full mb-10">
          <TeamSelectorCard
            label="Blue Side"
            side="blue"
            selectedTeam={blueTeam}
            onSelect={setBlueTeam}
            excludeTeamId={redTeam?.id}
          />

          <VSDivider />

          <TeamSelectorCard
            label="Red Side"
            side="red"
            selectedTeam={redTeam}
            onSelect={setRedTeam}
            excludeTeamId={blueTeam?.id}
          />
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-3 w-full max-w-md"
        >
          <Button
            size="lg"
            onClick={() => onStartDraft(blueTeam, redTeam)}
            className={cn(
              'relative w-full h-14 text-lg font-bold uppercase tracking-wider',
              'bg-primary hover:bg-primary-hover text-primary-foreground',
              'shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30',
              'transition-all duration-300'
            )}
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Draft
            {/* Pulsing glow */}
            <motion.div
              className="absolute inset-0 rounded-md bg-primary/20"
              animate={{ scale: [1, 1.05, 1], opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </Button>

          <Button
            variant="ghost"
            onClick={() => onStartDraft(null, null)}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Skip — use general meta recommendations
          </Button>
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-blue-side/50 via-primary/50 to-red-side/50"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      />
    </motion.div>
  );
}
