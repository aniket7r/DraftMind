import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DraftAction } from '@/lib/api';

interface DraftTimelineProps {
  currentSequence: number;
  actions: DraftAction[];
}

// Draft sequence definition
const TIMELINE_STEPS: { side: 'blue' | 'red'; type: 'ban' | 'pick'; phase: string }[] = [
  // Ban Phase 1 (1-6)
  { side: 'blue', type: 'ban', phase: 'B1' },
  { side: 'red', type: 'ban', phase: 'B1' },
  { side: 'blue', type: 'ban', phase: 'B1' },
  { side: 'red', type: 'ban', phase: 'B1' },
  { side: 'blue', type: 'ban', phase: 'B1' },
  { side: 'red', type: 'ban', phase: 'B1' },
  // Pick Phase 1 (7-12)
  { side: 'blue', type: 'pick', phase: 'P1' },
  { side: 'red', type: 'pick', phase: 'P1' },
  { side: 'red', type: 'pick', phase: 'P1' },
  { side: 'blue', type: 'pick', phase: 'P1' },
  { side: 'blue', type: 'pick', phase: 'P1' },
  { side: 'red', type: 'pick', phase: 'P1' },
  // Ban Phase 2 (13-16)
  { side: 'red', type: 'ban', phase: 'B2' },
  { side: 'blue', type: 'ban', phase: 'B2' },
  { side: 'red', type: 'ban', phase: 'B2' },
  { side: 'blue', type: 'ban', phase: 'B2' },
  // Pick Phase 2 (17-20)
  { side: 'red', type: 'pick', phase: 'P2' },
  { side: 'blue', type: 'pick', phase: 'P2' },
  { side: 'blue', type: 'pick', phase: 'P2' },
  { side: 'red', type: 'pick', phase: 'P2' },
];

// Phase separator positions (after these indices, we draw a gap)
const PHASE_BREAKS = new Set([5, 11, 15]);

export function DraftTimeline({ currentSequence, actions }: DraftTimelineProps) {
  const actionMap = new Map(actions.map(a => [a.sequence_number, a]));

  return (
    <div className="flex items-center gap-0.5 px-2">
      {TIMELINE_STEPS.map((step, idx) => {
        const seqNum = idx + 1;
        const action = actionMap.get(seqNum);
        const isCompleted = seqNum < currentSequence;
        const isCurrent = seqNum === currentSequence;
        const isFuture = seqNum > currentSequence;
        const isPhaseBreak = PHASE_BREAKS.has(idx);

        const sideColor = step.side === 'blue'
          ? isCompleted ? 'bg-blue-side' : isCurrent ? 'bg-blue-side' : 'bg-blue-side/20'
          : isCompleted ? 'bg-red-side' : isCurrent ? 'bg-red-side' : 'bg-red-side/20';

        return (
          <div key={idx} className="flex items-center">
            <div className="relative group">
              <motion.div
                className={cn(
                  'rounded-sm transition-all',
                  step.type === 'ban' ? 'w-3 h-3' : 'w-4 h-3',
                  isCurrent ? cn(sideColor, 'ring-1 ring-offset-1 ring-offset-background',
                    step.side === 'blue' ? 'ring-blue-side' : 'ring-red-side'
                  ) : sideColor,
                  isFuture && 'opacity-40',
                )}
                animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                transition={isCurrent ? { repeat: Infinity, duration: 1.5 } : {}}
              >
                {step.type === 'ban' && isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[6px] font-bold text-white/80">X</span>
                  </div>
                )}
              </motion.div>

              {/* Tooltip on hover */}
              {action && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                  <div className="bg-card border border-card-border rounded px-2 py-1 text-[10px] whitespace-nowrap shadow-lg">
                    <span className={step.side === 'blue' ? 'text-blue-side' : 'text-red-side'}>
                      {step.type === 'ban' ? 'Ban' : 'Pick'}:
                    </span>{' '}
                    <span className="text-foreground font-medium">{action.champion_name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Phase break separator */}
            {isPhaseBreak && (
              <div className="w-1.5 h-3 mx-0.5 flex items-center">
                <div className="w-px h-3 bg-card-border" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
