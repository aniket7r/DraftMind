import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Grid3X3, Sparkles, HelpCircle } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamSelectionModal } from './TeamSelectionModal';
import { TeamColumn } from './TeamColumn';
import { ChampionGrid } from './ChampionGrid';
import { RecommendationPanel } from './RecommendationPanel';
import { ChampionConfirmation } from './ChampionConfirmation';
import { CompositionAnalysis } from './CompositionAnalysis';
import { NarratorPanel } from './NarratorPanel';
import { DraftTimeline } from './DraftTimeline';
import { LockInAnimation } from './LockInAnimation';
import { OnboardingDialog } from '@/components/onboarding/OnboardingDialog';
import { HelpIcon } from '@/components/onboarding/HelpIcon';
import { useDraft } from '@/hooks/useDraft';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useExportShare } from '@/hooks/useExportShare';
import { ExportShareMenu } from '@/components/shared/ExportShareMenu';
import { cn } from '@/lib/utils';
import type { Team } from '@/lib/api';

type CenterView = 'champions' | 'recommendations';

export function DraftBoard() {
  const {
    currentSequence,
    phase,
    phaseLabel,
    currentAction,
    blueTeam,
    redTeam,
    selectedChampion,
    actions,
    bans,
    picks,
    usedChampions,
    recommendations,
    recommendationsLoading,
    simulation,
    simulationLoading,
    narration,
    narrationLoading,
    startDraft,
    selectChampion,
    clearSelection,
    confirmAction,
    resetDraft,
  } = useDraft();

  const [centerView, setCenterView] = useState<CenterView>('champions');
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const prevPhaseRef = useRef(phase);
  const draftBoardRef = useRef<HTMLDivElement>(null);

  const exportShare = useExportShare({
    targetRef: draftBoardRef,
    filename: `draftmind-draft-${blueTeam?.acronym ?? 'blue'}-vs-${redTeam?.acronym ?? 'red'}`,
    title: `Draft: ${blueTeam?.name ?? 'Blue'} vs ${redTeam?.name ?? 'Red'}`,
    subtitle: phase === 'complete' ? 'Completed Draft' : `Phase: ${phaseLabel}`,
  });

  // Detect phase transitions
  useEffect(() => {
    if (prevPhaseRef.current !== phase && phase !== 'team-select') {
      setShowPhaseTransition(true);
      const timer = setTimeout(() => setShowPhaseTransition(false), 1500);
      prevPhaseRef.current = phase;
      return () => clearTimeout(timer);
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  const {
    showWelcome,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    dismissWelcome,
    resetOnboarding,
  } = useOnboarding();

  const handleStartDraft = (blueTeam: Team | null, redTeam: Team | null) => {
    startDraft(blueTeam, redTeam);
  };

  const handleSelectChampion = (championName: string) => {
    selectChampion(championName);
  };

  const [lockIn, setLockIn] = useState<{
    champion: string;
    side: 'blue' | 'red';
    type: 'ban' | 'pick';
  } | null>(null);

  const handleConfirmAction = () => {
    if (!currentAction || !selectedChampion) {
      confirmAction();
      return;
    }
    // 1. Show dramatic lock-in animation
    setLockIn({
      champion: selectedChampion,
      side: currentAction.side,
      type: currentAction.type,
    });
    // 2. Fire confirmAction() NOW so narration request starts immediately
    //    (AI + TTS processing runs during the animation)
    confirmAction();
    // 3. Clear the animation after it plays
    setTimeout(() => setLockIn(null), 2000);
  };

  const isTeamSelectPhase = phase === 'team-select';
  const isDraftComplete = phase === 'complete';
  const hasPicks = picks.blue.length > 0 || picks.red.length > 0;

  // Get phase badge color
  const getPhaseBadgeClass = () => {
    if (phase.includes('ban')) return 'bg-danger/20 text-danger border-danger/30';
    if (phase.includes('pick')) return 'bg-primary/20 text-primary border-primary/30';
    if (phase === 'complete') return 'bg-success/20 text-success border-success/30';
    return 'bg-card text-muted-foreground border-card-border';
  };

  return (
    <div ref={draftBoardRef} className="h-screen w-full flex flex-col overflow-hidden">
      {/* Onboarding Welcome Dialog (first visit only) */}
      <OnboardingDialog
        open={showWelcome && isTeamSelectPhase}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={nextStep}
        onPrev={prevStep}
        onDismiss={dismissWelcome}
      />

      {/* Team Selection Modal */}
      <TeamSelectionModal open={isTeamSelectPhase && !showWelcome} onStartDraft={handleStartDraft} />

      {/* Champion Confirmation Modal */}
      {currentAction && (
        <ChampionConfirmation
          championName={selectedChampion}
          actionType={currentAction.type}
          side={currentAction.side}
          onConfirm={handleConfirmAction}
          onCancel={clearSelection}
        />
      )}

      {/* Lock-In Animation (random variant each time) */}
      <LockInAnimation lockIn={lockIn} />

      {/* Phase Transition Banner */}
      <AnimatePresence>
        {showPhaseTransition && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, exit: { duration: 0.5 } }}
            className={cn(
              'fixed inset-x-0 top-0 z-40 flex items-center justify-center py-3',
              'bg-gradient-to-r',
              phase.includes('ban')
                ? 'from-danger/20 via-danger/40 to-danger/20'
                : phase.includes('pick')
                  ? 'from-primary/20 via-primary/40 to-primary/20'
                  : 'from-success/20 via-success/40 to-success/20',
              'backdrop-blur-md border-b',
              phase.includes('ban') ? 'border-danger/30' : phase.includes('pick') ? 'border-primary/30' : 'border-success/30'
            )}
          >
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className={cn(
                'text-xl font-bold uppercase tracking-widest',
                phase.includes('ban') ? 'text-danger' : phase.includes('pick') ? 'text-primary' : 'text-success'
              )}
            >
              {phaseLabel}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-16 border-b border-card-border bg-card/50 backdrop-blur-sm flex items-center px-6 flex-shrink-0">
        {/* Left - Logo */}
        <div className="flex items-center gap-3 w-[220px] xl:w-[250px] shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <Logo className="w-8 h-8" />
          </div>
          <span className="font-bold text-lg">
            DraftMind <span className="text-primary">AI</span>
          </span>
        </div>

        {/* Center - Phase indicator */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2">
            <motion.div
              key={phaseLabel}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border',
                getPhaseBadgeClass()
              )}
            >
              {phaseLabel}
            </motion.div>
            {!isTeamSelectPhase && !isDraftComplete && (
              <HelpIcon
                content="The draft has 20 steps: 6 bans, 6 picks, 4 bans, 4 picks. Blue and Red sides alternate turns."
                side="bottom"
              />
            )}
          </div>
          {!isTeamSelectPhase && !isDraftComplete && currentAction && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm mt-1 text-muted-foreground"
            >
              <span className="font-mono">{currentSequence}/20</span>
              <span className="mx-2">—</span>
              <span className={cn(
                'font-medium',
                currentAction.side === 'blue' ? 'text-blue-side' : 'text-red-side'
              )}>
                {currentAction.side === 'blue' ? 'Blue' : 'Red'} Side {currentAction.type === 'ban' ? 'Ban' : 'Pick'}
              </span>
            </motion.p>
          )}
        </div>

        {/* Right - Reset button */}
        <div className="w-[220px] xl:w-[250px] shrink-0 flex justify-end gap-2">
          {!isTeamSelectPhase && (
            <>
              <ExportShareMenu
                isCapturing={exportShare.isCapturing}
                onDownloadPDF={exportShare.downloadPDF}
                onDownloadPNG={exportShare.downloadPNG}
                onShareTwitter={exportShare.shareToTwitter}
                onShareReddit={exportShare.shareToReddit}
                onCopyShareText={exportShare.copyShareText}
                onNativeShare={exportShare.nativeShare}
                canNativeShare={exportShare.canNativeShare}
                variant="ghost"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={resetOnboarding}
                className="text-muted-foreground hover:text-foreground"
                title="Replay tutorial"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={resetDraft}
                className="border-card-border hover:bg-card-hover"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                New Draft
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Draft Timeline */}
      {!isTeamSelectPhase && (
        <div className="h-8 border-b border-card-border bg-card/30 flex items-center justify-center flex-shrink-0">
          <DraftTimeline currentSequence={currentSequence} actions={actions} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Blue Team Column */}
        <div className="p-4 flex-shrink-0 overflow-hidden">
          <TeamColumn
            side="blue"
            teamName={blueTeam?.name ?? null}
            winRate={blueTeam?.win_rate}
            bans={bans.blue}
            picks={picks.blue}
            currentAction={currentAction}
            currentSequence={currentSequence}
          />
        </div>

        {/* Center Panel */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col min-w-0">
          {/* View toggle */}
          <div className="flex justify-center mb-4">
            <Tabs value={centerView} onValueChange={(v) => setCenterView(v as CenterView)}>
              <TabsList className="bg-card border border-card-border">
                <TabsTrigger
                  value="champions"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Champions
                </TabsTrigger>
                <TabsTrigger
                  value="recommendations"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Recommendations
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-hidden bg-card rounded-xl border border-card-border p-4">
            {centerView === 'champions' ? (
              <ChampionGrid
                usedChampions={usedChampions}
                bannedChampions={[...bans.blue, ...bans.red]}
                pickedChampions={[...picks.blue, ...picks.red]}
                onSelectChampion={handleSelectChampion}
              />
            ) : (
              <RecommendationPanel
                recommendations={recommendations}
                isLoading={recommendationsLoading}
                onSelectChampion={handleSelectChampion}
                actionType={currentAction?.type ?? 'pick'}
              />
            )}
          </div>

          {/* AI Narrator */}
          {!isTeamSelectPhase && (
            <div className="mt-2 flex-shrink-0">
              <NarratorPanel
                narration={narration}
                isLoading={narrationLoading}
                actionCount={actions.length}
              />
            </div>
          )}
        </div>

        {/* Red Team Column */}
        <div className="p-4 flex-shrink-0 overflow-hidden">
          <TeamColumn
            side="red"
            teamName={redTeam?.name ?? null}
            winRate={redTeam?.win_rate}
            bans={bans.red}
            picks={picks.red}
            currentAction={currentAction}
            currentSequence={currentSequence}
          />
        </div>
      </div>

      {/* Bottom Bar - Composition Analysis */}
      <div className="px-4 py-2 border-t border-card-border flex-shrink-0 overflow-hidden">
        <CompositionAnalysis
          simulation={simulation ?? null}
          isLoading={simulationLoading}
          hasPicks={hasPicks}
        />
      </div>
    </div>
  );
}
