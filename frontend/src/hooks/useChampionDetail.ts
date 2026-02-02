import { useQuery } from '@tanstack/react-query';
import { api, USE_MOCK_DATA, type ChampionDetail } from '@/lib/api';
import { generateMockChampionDetail } from '@/lib/mockData';

export function useChampionDetail(championName: string | undefined) {
  return useQuery<ChampionDetail | null>({
    queryKey: ['champion', championName],
    queryFn: async () => {
      if (!championName) return null;
      
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return generateMockChampionDetail(championName);
      }
      return api.getChampionDetail(championName);
    },
    enabled: !!championName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
