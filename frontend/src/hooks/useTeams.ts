import { useQuery } from '@tanstack/react-query';
import { api, USE_MOCK_DATA, type Team } from '@/lib/api';
import { mockTeams } from '@/lib/mockData';

export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockTeams;
      }
      return api.getTeams();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
