import { motion } from 'framer-motion';
import { ChampionPortrait } from '@/components/shared/ChampionPortrait';
import { cn } from '@/lib/utils';
import { getChampionSplashUrl } from '@/lib/mockData';

interface TeamColumnProps {
  side: 'blue' | 'red';
  teamName: string | null;
  winRate?: number;
  bans: string[];
  picks: string[];
  currentAction: { type: 'ban' | 'pick'; side: 'blue' | 'red' } | null;
  currentSequence: number;
}

const roleLabels = ['Top', 'Jungle', 'Mid', 'Bot', 'Support'];

// Get pick slot index from sequence number
function getPickSlotFromSequence(sequence: number, side: 'blue' | 'red'): number {
  const pickSequences = {
    blue: [7, 10, 11, 18, 19],
    red: [8, 9, 12, 17, 20],
  };
  return pickSequences[side].indexOf(sequence);
}

export function TeamColumn({
  side,
  teamName,
  winRate,
  bans,
  picks,
  currentAction,
  currentSequence,
}: TeamColumnProps) {
  const isActiveSide = currentAction?.side === side;
  const isPickAction = currentAction?.type === 'pick';
  const isBanAction = currentAction?.type === 'ban';

  const sideColor = side === 'blue' ? 'text-blue-side' : 'text-red-side';
  const sideBg = side === 'blue' ? 'bg-blue-side' : 'bg-red-side';
  const sideGlow = side === 'blue' ? 'glow-blue' : 'glow-red';
  const sidePulse = side === 'blue' ? 'pulse-border' : 'pulse-border-red';
  const sideBorder = side === 'blue' ? 'border-blue-side' : 'border-red-side';

  // Determine which pick slot is active
  const activePickSlot = isActiveSide && isPickAction 
    ? getPickSlotFromSequence(currentSequence, side)
    : -1;

  // Determine which ban slot is active
  const activeBanSlot = isActiveSide && isBanAction ? bans.length : -1;

  return (
    <motion.div
      className="w-[220px] xl:w-[250px] flex flex-col gap-4"
      initial={{ opacity: 0, x: side === 'blue' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Team Header */}
      <div className="flex items-center gap-3">
        <div className={cn('w-1 h-10 rounded-full', sideBg)} />
        <div>
          <h3 className={cn('font-bold text-lg', sideColor)}>
            {teamName || `${side === 'blue' ? 'Blue' : 'Red'} Side`}
          </h3>
          {winRate !== undefined && (
            <span className="text-xs text-muted-foreground font-mono">
              {(winRate * 100).toFixed(0)}% WR
            </span>
          )}
        </div>
      </div>

      {/* Bans Row */}
      <div className="bg-card rounded-xl p-3 border border-card-border">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Bans</p>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const bannedChamp = bans[index];
            const isActive = activeBanSlot === index;

            return (
              <motion.div
                key={index}
                className={cn(
                  'w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center',
                  bannedChamp ? 'border-transparent' : 'border-card-border',
                  isActive && !bannedChamp && cn(sidePulse, sideBorder, 'border-solid')
                )}
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {bannedChamp ? (
                  <ChampionPortrait
                    name={bannedChamp}
                    size="sm"
                    state="banned"
                    showTooltip={false}
                  />
                ) : isActive ? (
                  <span className="text-[8px] text-muted-foreground">BAN</span>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Picks Column */}
      <div className="bg-card rounded-xl p-3 border border-card-border flex-1">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Picks</p>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const pickedChamp = picks[index];
            const isActive = activePickSlot === index;

            return (
              <motion.div
                key={index}
                className={cn(
                  'h-[60px] rounded-lg border-2 border-dashed overflow-hidden relative',
                  pickedChamp ? 'border-transparent' : 'border-card-border',
                  isActive && !pickedChamp && cn(sidePulse, sideBorder, 'border-solid'),
                  pickedChamp && sideGlow
                )}
                animate={isActive && !pickedChamp ? { scale: [1, 1.02, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {pickedChamp ? (
                  <>
                    {/* Champion splash background */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${getChampionSplashUrl(pickedChamp)})`,
                        filter: 'brightness(0.7)',
                      }}
                    />
                    {/* Gradient overlay */}
                    <div className={cn(
                      'absolute inset-0',
                      side === 'blue' 
                        ? 'bg-gradient-to-r from-blue-side/60 to-transparent' 
                        : 'bg-gradient-to-l from-red-side/60 to-transparent'
                    )} />
                    {/* Champion name */}
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="font-bold text-sm text-white drop-shadow-lg">
                        {pickedChamp}
                      </span>
                    </div>
                    {/* Role indicator */}
                    <div className="absolute bottom-1 right-2">
                      <span className="text-[10px] text-white/70 font-medium">
                        {roleLabels[index]}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      {isActive ? (
                        <motion.span
                          className={cn('text-sm font-medium', sideColor)}
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          PICKING...
                        </motion.span>
                      ) : (
                        <>
                          <span className="text-xs text-muted-foreground block">
                            Pick {index + 1}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">
                            {roleLabels[index]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
