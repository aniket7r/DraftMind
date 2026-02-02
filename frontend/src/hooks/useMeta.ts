import { useQuery } from '@tanstack/react-query';
import { api, USE_MOCK_DATA, type MetaStats } from '@/lib/api';
import { mockMeta } from '@/lib/mockData';

export function useMeta() {
  return useQuery<MetaStats>({
    queryKey: ['meta'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockMeta;
      }
      return api.getMeta();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
