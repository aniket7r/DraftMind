import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Target, Puzzle, BarChart3 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { ChampionPortrait } from '@/components/shared/ChampionPortrait';
import { ScoreBar } from '@/components/shared/ScoreBar';
import { Spinner } from '@/components/shared/Spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpIcon } from '@/components/onboarding/HelpIcon';
import type { Recommendation } from '@/lib/api';
import { cn } from '@/lib/utils';

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  isLoading: boolean;
  onSelectChampion: (name: string) => void;
  actionType: 'ban' | 'pick';
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const normalizedConfidence = confidence.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW';
  const colors = {
    HIGH: 'bg-success/20 text-success border-success/30',
    MEDIUM: 'bg-warning/20 text-warning border-warning/30',
    LOW: 'bg-muted/20 text-muted-foreground border-muted/30',
  };

  return (
    <span className={cn(
      'px-2 py-0.5 rounded-full text-xs font-medium border',
      colors[normalizedConfidence] || colors.LOW
    )}>
      {normalizedConfidence}
    </span>
  );
}

function SignalBar({
  icon: Icon,
  label,
  value,
  helpText,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  helpText?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3 h-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground w-12">{label}</span>
      {helpText && <HelpIcon content={helpText} side="top" className="shrink-0" />}
      <div className="flex-1 h-1.5 bg-card-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-8">
        {value.toFixed(2)}
      </span>
    </div>
  );
}

function SignalRadar({ signals }: { signals: Recommendation['signals'] }) {
  const data = [
    { axis: 'Meta', value: signals.meta * 100 },
    { axis: 'Team', value: signals.team * 100 },
    { axis: 'Counter', value: signals.counter * 100 },
    { axis: 'Comp', value: signals.composition * 100 },
  ];

  return (
    <div className="w-[120px] h-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid
            stroke="hsl(222 20% 20%)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: 'hsl(215 16% 47%)', fontSize: 9 }}
          />
          <Radar
            name="Signals"
            dataKey="value"
            stroke="hsl(197 100% 50%)"
            fill="hsl(197 100% 50%)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  onSelect,
  actionType,
  index,
}: {
  recommendation: Recommendation;
  onSelect: () => void;
  actionType: 'ban' | 'pick';
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-card rounded-xl border border-card-border p-4 hover:border-primary/50 transition-colors"
    >
      <div className="flex gap-4">
        {/* Champion portrait + radar for top recommendation */}
        <div className="flex flex-col items-center gap-2">
          <ChampionPortrait
            name={recommendation.champion_name}
            size="lg"
            showTooltip={false}
          />
          {index === 0 && <SignalRadar signals={recommendation.signals} />}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-foreground">
                {index === 0 && <span className="text-gold mr-1.5">#1</span>}
                {recommendation.champion_name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <ConfidenceBadge confidence={recommendation.confidence} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="text-2xl font-bold font-mono text-primary">
                {recommendation.score.toFixed(3)}
              </p>
            </div>
          </div>

          {/* Score bar */}
          <ScoreBar
            value={recommendation.score}
            showValue={false}
            size="sm"
            variant="gradient"
          />

          {/* Signal breakdown */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <SignalBar icon={BarChart3} label="Meta" value={recommendation.signals.meta} helpText="How strong this champion is in the current pro meta based on win rate, pick rate, and presence." />
            <SignalBar icon={TrendingUp} label="Team" value={recommendation.signals.team} helpText="How well this champion fits the selected team's playstyle, champion pool, and comfort picks." />
            <SignalBar icon={Target} label="Counter" value={recommendation.signals.counter} helpText="How effectively this champion counters the opponent's already-picked champions." />
            <SignalBar icon={Puzzle} label="Comp" value={recommendation.signals.composition} helpText="How well this champion completes your team composition — damage balance, CC, and scaling." />
          </div>

          {/* Reasons */}
          <div className="space-y-1">
            {recommendation.reasons.map((reason, i) => (
              <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {reason}
              </p>
            ))}
          </div>

          {/* Select button */}
          <Button
            onClick={onSelect}
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            Select This Champion
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border border-card-border p-4">
          <div className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecommendationPanel({
  recommendations,
  isLoading,
  onSelectChampion,
  actionType,
}: RecommendationPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Spinner size="sm" />
          <span className="font-semibold animate-pulse">Analyzing...</span>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No recommendations available yet.</p>
        <p className="text-sm">Start the draft to see AI-powered suggestions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="w-5 h-5" />
        <span className="font-semibold">AI Recommendations</span>
        <span className="text-xs text-muted-foreground ml-auto">
          Top 5 {actionType === 'ban' ? 'bans' : 'picks'}
        </span>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
        {recommendations.map((rec, index) => (
          <RecommendationCard
            key={rec.champion_name}
            recommendation={rec}
            onSelect={() => onSelectChampion(rec.champion_name)}
            actionType={actionType}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
