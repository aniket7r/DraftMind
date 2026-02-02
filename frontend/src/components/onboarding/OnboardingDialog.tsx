import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Sparkles,
  Zap,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  TrendingUp,
  Target,
  Puzzle,
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface OnboardingDialogProps {
  open: boolean;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onDismiss: () => void;
}

const steps = [
  {
    icon: Logo,
    color: 'bg-primary/20 text-primary',
    title: 'Welcome to DraftMind AI',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          DraftMind AI is a <span className="text-foreground font-medium">data-driven draft recommendation engine</span> for
          League of Legends, built on <span className="text-foreground font-medium">2,282+ professional games</span> from
          GRID Esports Data.
        </p>
        <p>Let us show you around in 30 seconds.</p>
      </div>
    ),
  },
  {
    icon: Users,
    color: 'bg-blue-500/20 text-blue-400',
    title: 'Choose Your Teams',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Start by selecting <span className="text-blue-400 font-medium">Blue</span> and <span className="text-red-400 font-medium">Red</span> side
          teams. This lets the AI personalize recommendations based on each team's:
        </p>
        <ul className="space-y-1.5 ml-1">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Champion pools &amp; comfort picks
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Historical draft patterns
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Player-level champion mastery
          </li>
        </ul>
        <p className="text-xs opacity-75">
          You can also skip team selection for general meta-based recommendations.
        </p>
      </div>
    ),
  },
  {
    icon: Sparkles,
    color: 'bg-amber-500/20 text-amber-400',
    title: 'AI Recommendations',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Switch to the <span className="text-foreground font-medium">"AI Recommendations"</span> tab in the center panel
          to see the top 5 suggested champions for each draft step.
        </p>
        <p>Each recommendation is scored using 4 signals:</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center gap-2 bg-card-hover rounded-lg p-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-foreground text-xs">Meta</p>
              <p className="text-[11px]">Current meta strength</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card-hover rounded-lg p-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-foreground text-xs">Team</p>
              <p className="text-[11px]">Team playstyle fit</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card-hover rounded-lg p-2">
            <Target className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-foreground text-xs">Counter</p>
              <p className="text-[11px]">Counters opponent picks</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card-hover rounded-lg p-2">
            <Puzzle className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-foreground text-xs">Comp</p>
              <p className="text-[11px]">Composition fit</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Zap,
    color: 'bg-green-500/20 text-green-400',
    title: 'Draft & Analyze',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          The draft follows the standard <span className="text-foreground font-medium">20-step pro sequence</span>:
        </p>
        <div className="flex gap-1.5 text-xs font-mono">
          <span className="bg-danger/20 text-danger px-2 py-1 rounded">6 Bans</span>
          <span className="text-muted-foreground self-center">&rarr;</span>
          <span className="bg-primary/20 text-primary px-2 py-1 rounded">6 Picks</span>
          <span className="text-muted-foreground self-center">&rarr;</span>
          <span className="bg-danger/20 text-danger px-2 py-1 rounded">4 Bans</span>
          <span className="text-muted-foreground self-center">&rarr;</span>
          <span className="bg-primary/20 text-primary px-2 py-1 rounded">4 Picks</span>
        </div>
        <p>
          Watch the <span className="text-foreground font-medium">bottom bar</span> for live Composition Analysis — damage profiles,
          CC ratings, scaling, and win probability update in real time as you draft.
        </p>
      </div>
    ),
  },
];

export function OnboardingDialog({
  open,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onDismiss,
}: OnboardingDialogProps) {
  const step = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  if (!step) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <DialogContent className="sm:max-w-[480px] bg-card border-card-border gap-0">
        {/* Icon */}
        <div className="flex justify-center pt-2 pb-4">
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center',
              step.color
            )}
          >
            <step.icon className="w-7 h-7" />
          </motion.div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i === currentStep ? 'bg-primary w-6' : 'bg-card-border'
              )}
            />
          ))}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground text-center mb-3">
          {step.title}
        </h2>

        {/* Animated content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[160px]"
          >
            {step.content}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <DialogFooter className="flex justify-between sm:justify-between mt-4 gap-2">
          <div>
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={onPrev}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-muted-foreground"
            >
              Skip
            </Button>
            {isLastStep ? (
              <Button
                size="sm"
                onClick={onDismiss}
                className="bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                Start Drafting
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onNext}
                className="bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
