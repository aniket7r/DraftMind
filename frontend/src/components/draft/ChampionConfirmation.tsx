import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getChampionSplashUrl, mockChampions } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface ChampionConfirmationProps {
  championName: string | null;
  actionType: 'ban' | 'pick';
  side: 'blue' | 'red';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChampionConfirmation({
  championName,
  actionType,
  side,
  onConfirm,
  onCancel,
}: ChampionConfirmationProps) {
  const champion = mockChampions.find((c) => c.name === championName);

  const sideColor = side === 'blue' ? 'text-blue-side' : 'text-red-side';
  const sideBg = side === 'blue' ? 'bg-blue-side' : 'bg-red-side';
  const sideGradient = side === 'blue' 
    ? 'from-blue-side/30 to-transparent' 
    : 'from-red-side/30 to-transparent';

  return (
    <AnimatePresence>
      {championName && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: 20 }}
            className="relative w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card */}
            <div className="bg-card rounded-2xl border border-card-border overflow-hidden shadow-2xl">
              {/* Splash image */}
              <div className="relative h-48">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${getChampionSplashUrl(championName)})`,
                  }}
                />
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-t',
                  'from-card via-card/50 to-transparent'
                )} />
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-r',
                  sideGradient
                )} />
                
                {/* Action type badge */}
                <div className="absolute top-4 left-4">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-bold uppercase',
                    actionType === 'ban' 
                      ? 'bg-danger text-danger-foreground' 
                      : cn(sideBg, 'text-white')
                  )}>
                    {actionType === 'ban' ? 'Banning' : 'Picking'}
                  </span>
                </div>

                {/* Close button */}
                <button
                  onClick={onCancel}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/80 flex items-center justify-center hover:bg-card transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 -mt-12 relative">
                <h2 className="text-3xl font-bold text-foreground mb-1">
                  {championName}
                </h2>
                {champion && (
                  <p className="text-muted-foreground capitalize mb-4">
                    {champion.role}
                  </p>
                )}

                {/* Stats */}
                {champion && (
                  <div className="flex gap-6 mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p className="text-lg font-mono font-bold text-success">
                        {(champion.win_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pick Rate</p>
                      <p className="text-lg font-mono font-bold text-primary">
                        {(champion.pick_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ban Rate</p>
                      <p className="text-lg font-mono font-bold text-danger">
                        {(champion.ban_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 border-card-border hover:bg-card-hover"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={onConfirm}
                    className={cn(
                      'flex-1 font-semibold',
                      actionType === 'ban'
                        ? 'bg-danger hover:bg-danger/90 text-danger-foreground'
                        : 'bg-primary hover:bg-primary-hover text-primary-foreground'
                    )}
                  >
                    {actionType === 'ban' ? (
                      <>
                        <Ban className="w-4 h-4 mr-2" />
                        Confirm Ban
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Confirm Pick
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
