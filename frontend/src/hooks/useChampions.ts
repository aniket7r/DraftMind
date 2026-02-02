import { useQuery } from '@tanstack/react-query';
import { api, USE_MOCK_DATA, type Champion } from '@/lib/api';
import { mockChampions } from '@/lib/mockData';

export function useChampions() {
  return useQuery<Champion[]>({
    queryKey: ['champions'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockChampions;
      }
      return api.getChampions();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
