import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Target, TrendingUp, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { HelpIcon } from '@/components/onboarding/HelpIcon';
import type { SimulationResult } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CompositionAnalysisProps {
  simulation: SimulationResult | null;
  isLoading: boolean;
  hasPicks: boolean;
}

function CompositionCard({
  side,
  composition,
}: {
  side: 'blue' | 'red';
  composition: SimulationResult['blue_composition'];
}) {
  const sideColor = side === 'blue' ? 'text-blue-side' : 'text-red-side';
  const sideBg = side === 'blue' ? 'bg-blue-side' : 'bg-red-side';

  const physicalPct = composition.physical_damage;
  const magicPct = composition.magic_damage;
  const truePct = 100 - physicalPct - magicPct;

  return (
    <div className="flex-1 space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full', sideBg)} />
        <span className={cn('font-semibold text-sm', sideColor)}>
          {side === 'blue' ? 'Blue' : 'Red'} Side
        </span>
      </div>

      {/* Composition type */}
      <div className="bg-card-hover rounded-lg p-2">
        <p className="text-xs text-muted-foreground">Composition</p>
        <p className="font-bold text-foreground">{composition.type}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Damage split */}
        <div className="col-span-2 bg-card-hover rounded-lg p-2">
          <p className="text-xs text-muted-foreground mb-1">Damage Split</p>
          <div className="flex h-2 rounded-full overflow-hidden">
            <div
              className="bg-warning"
              style={{ width: `${physicalPct}%` }}
              title={`Physical: ${physicalPct.toFixed(0)}%`}
            />
            <div
              className="bg-secondary"
              style={{ width: `${magicPct}%` }}
              title={`Magic: ${magicPct.toFixed(0)}%`}
            />
            {truePct > 0 && (
              <div
                className="bg-muted"
                style={{ width: `${truePct}%` }}
                title={`True: ${truePct.toFixed(0)}%`}
              />
            )}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span className="text-warning">Phys {physicalPct.toFixed(0)}%</span>
            <span className="text-secondary">Magic {magicPct.toFixed(0)}%</span>
          </div>
        </div>

        {/* CC Rating */}
        <div className="bg-card-hover rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <Shield className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">CC Rating</p>
          </div>
          <p className="font-mono font-bold text-foreground">
            {composition.cc_rating.toFixed(1)}/3
          </p>
        </div>

        {/* Engage */}
        <div className="bg-card-hover rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <Target className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Engage</p>
          </div>
          <p className="font-mono font-bold text-foreground">
            {composition.engage_threats} threats
          </p>
        </div>

        {/* Scaling */}
        <div className="bg-card-hover rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Scaling</p>
          </div>
          <p className="font-bold text-foreground text-sm">
            {composition.scaling}
          </p>
        </div>

        {/* Synergy */}
        <div className="bg-card-hover rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Synergy</p>
          </div>
          <p className="font-mono font-bold text-foreground">
            {(composition.synergy * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}

// Prominent compact summary — always visible
function CompactSummary({ simulation }: { simulation: SimulationResult }) {
  const blue = simulation.blue_composition;
  const red = simulation.red_composition;
  const blueWP = (simulation.blue_win_probability * 100).toFixed(0);
  const redWP = ((1 - simulation.blue_win_probability) * 100).toFixed(0);

  const blueLeading = simulation.blue_win_probability > 0.5;
  const redLeading = simulation.blue_win_probability < 0.5;

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Blue side */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-side" />
        <motion.span
          key={`blue-${blueWP}`}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={cn(
            'text-base font-black font-mono tabular-nums',
            blueLeading ? 'text-blue-side' : 'text-blue-side/60'
          )}
        >
          {blueWP}%
        </motion.span>
        <span className="text-xs text-blue-side/70 font-medium hidden lg:inline">{blue.type}</span>
      </div>

      {/* Tug-of-war bar */}
      <div className="flex-1 relative">
        <div className="h-3.5 rounded-full overflow-hidden bg-card-border/50 relative shadow-inner">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-side to-blue-side/70 rounded-l-full"
            animate={{ width: `${simulation.blue_win_probability * 100}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-side to-red-side/70 rounded-r-full"
            animate={{ width: `${(1 - simulation.blue_win_probability) * 100}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          />
          {/* Center line */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-px w-0.5 bg-foreground/30 z-10" />
        </div>
        {/* Labels */}
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] text-blue-side/50 font-semibold uppercase tracking-wider">Blue</span>
          <span className="text-[9px] text-muted-foreground/40">Win Probability</span>
          <span className="text-[9px] text-red-side/50 font-semibold uppercase tracking-wider">Red</span>
        </div>
      </div>

      {/* Red side */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-red-side/70 font-medium hidden lg:inline">{red.type}</span>
        <motion.span
          key={`red-${redWP}`}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={cn(
            'text-base font-black font-mono tabular-nums',
            redLeading ? 'text-red-side' : 'text-red-side/60'
          )}
        >
          {redWP}%
        </motion.span>
        <div className="w-2.5 h-2.5 rounded-full bg-red-side" />
      </div>
    </div>
  );
}

export function CompositionAnalysis({
  simulation,
  isLoading,
  hasPicks,
}: CompositionAnalysisProps) {
  const [expanded, setExpanded] = useState(false);

  if (!hasPicks) {
    return null;
  }

  if (isLoading || !simulation) {
    return (
      <div className="bg-card rounded-xl border border-card-border px-4 py-3">
        <div className="flex items-center gap-2 justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Zap className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="text-muted-foreground text-sm">Analyzing compositions...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-card-border"
    >
      {/* Clickable header — always visible with prominent compact summary */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none hover:bg-card-hover/50 rounded-xl transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2 shrink-0">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wide">Comp</span>
        </div>

        {/* Compact summary when collapsed */}
        {!expanded && (
          <div className="flex-1 mx-1">
            <CompactSummary simulation={simulation} />
          </div>
        )}

        {expanded && (
          <HelpIcon
            content="Real-time analysis of both teams. Shows damage split, CC rating, scaling, synergy, and predicted win probability."
            side="top"
          />
        )}

        <button className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 ml-auto">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="flex gap-6">
                <CompositionCard side="blue" composition={simulation.blue_composition} />

                {/* Win Probability Tug-of-War */}
                <div className="flex flex-col items-center justify-center px-4 w-[180px] shrink-0">
                  <p className="text-xs text-muted-foreground mb-2">Win Probability</p>

                  <div className="flex justify-between w-full mb-1">
                    <motion.span
                      className="text-sm font-bold text-blue-side font-mono"
                      key={simulation.blue_win_probability}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {(simulation.blue_win_probability * 100).toFixed(0)}%
                    </motion.span>
                    <motion.span
                      className="text-sm font-bold text-red-side font-mono"
                      key={1 - simulation.blue_win_probability}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {((1 - simulation.blue_win_probability) * 100).toFixed(0)}%
                    </motion.span>
                  </div>

                  <div className="relative w-full h-3 rounded-full overflow-hidden bg-card-border">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-side to-blue-side/70 rounded-l-full"
                      initial={{ width: '50%' }}
                      animate={{ width: `${simulation.blue_win_probability * 100}%` }}
                      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                    />
                    <motion.div
                      className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-side to-red-side/70 rounded-r-full"
                      initial={{ width: '50%' }}
                      animate={{ width: `${(1 - simulation.blue_win_probability) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                    />
                    <div className="absolute inset-y-0 left-1/2 -translate-x-px w-0.5 bg-foreground/30 z-10" />
                  </div>

                  <div className="flex justify-between w-full mt-1">
                    <span className="text-[10px] text-blue-side/70">BLUE</span>
                    <span className="text-[10px] text-red-side/70">RED</span>
                  </div>
                </div>

                <CompositionCard side="red" composition={simulation.red_composition} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
