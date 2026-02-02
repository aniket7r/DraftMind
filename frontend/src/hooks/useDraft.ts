import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, USE_MOCK_DATA, type DraftAction, type Team, type NarrateSpeakResponse } from '@/lib/api';
import { generateMockRecommendations, generateMockSimulation } from '@/lib/mockData';

// Draft sequence: 20 actions total
// Ban Phase 1: 1-Blue, 2-Red, 3-Blue, 4-Red, 5-Blue, 6-Red
// Pick Phase 1: 7-Blue, 8-Red, 9-Red, 10-Blue, 11-Blue, 12-Red
// Ban Phase 2: 13-Red, 14-Blue, 15-Red, 16-Blue
// Pick Phase 2: 17-Red, 18-Blue, 19-Blue, 20-Red

export type DraftPhase = 
  | 'team-select'
  | 'ban-phase-1'
  | 'pick-phase-1'
  | 'ban-phase-2'
  | 'pick-phase-2'
  | 'complete';

interface DraftState {
  currentSequence: number;
  actions: DraftAction[];
  blueTeam: Team | null;
  redTeam: Team | null;
  selectedChampion: string | null;
  phase: DraftPhase;
}

const DRAFT_SEQUENCE: { side: 'blue' | 'red'; type: 'ban' | 'pick' }[] = [
  // Ban Phase 1: 1-6
  { side: 'blue', type: 'ban' },
  { side: 'red', type: 'ban' },
  { side: 'blue', type: 'ban' },
  { side: 'red', type: 'ban' },
  { side: 'blue', type: 'ban' },
  { side: 'red', type: 'ban' },
  // Pick Phase 1: 7-12
  { side: 'blue', type: 'pick' },
  { side: 'red', type: 'pick' },
  { side: 'red', type: 'pick' },
  { side: 'blue', type: 'pick' },
  { side: 'blue', type: 'pick' },
  { side: 'red', type: 'pick' },
  // Ban Phase 2: 13-16
  { side: 'red', type: 'ban' },
  { side: 'blue', type: 'ban' },
  { side: 'red', type: 'ban' },
  { side: 'blue', type: 'ban' },
  // Pick Phase 2: 17-20
  { side: 'red', type: 'pick' },
  { side: 'blue', type: 'pick' },
  { side: 'blue', type: 'pick' },
  { side: 'red', type: 'pick' },
];

function getPhaseFromSequence(sequence: number): DraftPhase {
  if (sequence <= 0) return 'team-select';
  if (sequence <= 6) return 'ban-phase-1';
  if (sequence <= 12) return 'pick-phase-1';
  if (sequence <= 16) return 'ban-phase-2';
  if (sequence <= 20) return 'pick-phase-2';
  return 'complete';
}

function getPhaseLabel(phase: DraftPhase): string {
  switch (phase) {
    case 'team-select': return 'TEAM SELECT';
    case 'ban-phase-1': return 'BAN PHASE 1';
    case 'pick-phase-1': return 'PICK PHASE 1';
    case 'ban-phase-2': return 'BAN PHASE 2';
    case 'pick-phase-2': return 'PICK PHASE 2';
    case 'complete': return 'DRAFT COMPLETE';
  }
}

export function useDraft() {
  const [state, setState] = useState<DraftState>({
    currentSequence: 0,
    actions: [],
    blueTeam: null,
    redTeam: null,
    selectedChampion: null,
    phase: 'team-select',
  });

  // Get current action info
  const currentAction = useMemo(() => {
    if (state.currentSequence < 1 || state.currentSequence > 20) return null;
    return DRAFT_SEQUENCE[state.currentSequence - 1];
  }, [state.currentSequence]);

  // Get all bans
  const bans = useMemo(() => ({
    blue: state.actions.filter(a => a.team_side === 'blue' && a.action_type === 'ban').map(a => a.champion_name),
    red: state.actions.filter(a => a.team_side === 'red' && a.action_type === 'ban').map(a => a.champion_name),
  }), [state.actions]);

  // Get all picks
  const picks = useMemo(() => ({
    blue: state.actions.filter(a => a.team_side === 'blue' && a.action_type === 'pick').map(a => a.champion_name),
    red: state.actions.filter(a => a.team_side === 'red' && a.action_type === 'pick').map(a => a.champion_name),
  }), [state.actions]);

  // All used champions (banned + picked)
  const usedChampions = useMemo(() => 
    new Set(state.actions.map(a => a.champion_name)),
    [state.actions]
  );

  // Start draft with selected teams
  const startDraft = useCallback((blueTeam: Team | null, redTeam: Team | null) => {
    setState({
      currentSequence: 1,
      actions: [],
      blueTeam,
      redTeam,
      selectedChampion: null,
      phase: 'ban-phase-1',
    });
  }, []);

  // Select a champion (before confirming)
  const selectChampion = useCallback((championName: string) => {
    setState(prev => ({ ...prev, selectedChampion: championName }));
  }, []);

  // Clear champion selection
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedChampion: null }));
  }, []);

  // Confirm the current action
  const confirmAction = useCallback(() => {
    if (!state.selectedChampion || !currentAction) return;

    const newAction: DraftAction = {
      sequence_number: state.currentSequence,
      action_type: currentAction.type,
      team_side: currentAction.side,
      champion_name: state.selectedChampion,
    };

    const nextSequence = state.currentSequence + 1;
    const nextPhase = getPhaseFromSequence(nextSequence);

    setState(prev => ({
      ...prev,
      actions: [...prev.actions, newAction],
      currentSequence: nextSequence,
      selectedChampion: null,
      phase: nextPhase,
    }));
  }, [state.selectedChampion, state.currentSequence, currentAction]);

  // Reset draft
  const resetDraft = useCallback(() => {
    setState({
      currentSequence: 0,
      actions: [],
      blueTeam: null,
      redTeam: null,
      selectedChampion: null,
      phase: 'team-select',
    });
  }, []);

  // Fetch recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['recommendations', state.actions, state.currentSequence],
    queryFn: async () => {
      if (state.phase === 'team-select' || state.phase === 'complete') return [];
      
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return generateMockRecommendations(state.actions, state.currentSequence);
      }
      
      const response = await api.getRecommendations({
        current_actions: state.actions,
        blue_team_id: state.blueTeam?.id,
        red_team_id: state.redTeam?.id,
        next_action_sequence: state.currentSequence,
      });
      
      // Extract recommendations from the response object
      return response.recommendations;
    },
    enabled: state.phase !== 'team-select' && state.phase !== 'complete',
    staleTime: 0, // Always refetch on action changes
  });

  // Fetch simulation when we have picks
  const { data: simulation, isLoading: simulationLoading } = useQuery({
    queryKey: ['simulation', picks.blue, picks.red],
    queryFn: async () => {
      if (picks.blue.length === 0 && picks.red.length === 0) return null;

      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return generateMockSimulation(picks.blue, picks.red);
      }

      return api.simulateDraft({
        blue_picks: picks.blue,
        red_picks: picks.red,
        blue_team_id: state.blueTeam?.id,
        red_team_id: state.redTeam?.id,
      });
    },
    enabled: picks.blue.length > 0 || picks.red.length > 0,
    staleTime: 0,
  });

  // Fetch narration + TTS audio in a single call
  const { data: narration, isLoading: narrationLoading } = useQuery({
    queryKey: ['narration', state.actions.length],
    queryFn: async (): Promise<NarrateSpeakResponse | null> => {
      if (state.actions.length === 0) return null;

      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const latest = state.actions[state.actions.length - 1];
        return {
          narrative: `${latest.team_side === 'blue' ? 'Blue' : 'Red'} side ${latest.action_type === 'ban' ? 'bans' : 'picks'} ${latest.champion_name}. A strategic choice for this phase of the draft.`,
          tone: latest.action_type === 'ban' ? 'cautious' : 'analytical' as const,
          audio_base64: '',
        };
      }

      return api.getNarrationWithAudio({
        current_actions: state.actions,
        blue_team_id: state.blueTeam?.id,
        red_team_id: state.redTeam?.id,
        blue_team_name: state.blueTeam?.name,
        red_team_name: state.redTeam?.name,
        win_probability: simulation?.blue_win_probability,
      });
    },
    enabled: state.actions.length > 0,
    staleTime: Infinity,
  });

  return {
    // State
    currentSequence: state.currentSequence,
    phase: state.phase,
    phaseLabel: getPhaseLabel(state.phase),
    currentAction,
    blueTeam: state.blueTeam,
    redTeam: state.redTeam,
    selectedChampion: state.selectedChampion,
    actions: state.actions,
    bans,
    picks,
    usedChampions,
    
    // Data
    recommendations: recommendations ?? [],
    recommendationsLoading,
    simulation,
    simulationLoading,
    narration: narration ?? null,
    narrationLoading,
    
    // Actions
    startDraft,
    selectChampion,
    clearSelection,
    confirmAction,
    resetDraft,
  };
}
