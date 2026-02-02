import { useQuery } from '@tanstack/react-query';
import { api, USE_MOCK_DATA, type TeamDetail, type DraftPattern, type MatchupAnalysis } from '@/lib/api';
import { generateMockTeamDetail, generateMockDraftPatterns, generateMockMatchupAnalysis } from '@/lib/mockData';

export function useTeamDetail(teamId: string | undefined) {
  return useQuery<TeamDetail | null>({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return generateMockTeamDetail(teamId);
      }
      return api.getTeamDetail(teamId);
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeamPatterns(teamId: string | undefined) {
  return useQuery<DraftPattern | null>({
    queryKey: ['teamPatterns', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return generateMockDraftPatterns(teamId);
      }
      return api.getTeamPatterns(teamId);
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMatchupAnalysis(team1Id: string | undefined, team2Id: string | undefined) {
  return useQuery<MatchupAnalysis | null>({
    queryKey: ['matchup', team1Id, team2Id],
    queryFn: async () => {
      if (!team1Id || !team2Id) return null;
      
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return generateMockMatchupAnalysis(team1Id, team2Id);
      }
      return api.getMatchupAnalysis(team1Id, team2Id);
    },
    enabled: !!team1Id && !!team2Id,
    staleTime: 5 * 60 * 1000,
  });
}
