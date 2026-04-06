import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// Get Voice Stats
export const useVoiceStatsQuery = () => {
  return useQuery({
    queryKey: ['voice', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/student-voice/stats');
      return data.data;
    },
  });
};

// Get Ticket List
export const useVoiceListQuery = () => {
  return useQuery({
    queryKey: ['voice', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/student-voice');
      return data.data; // List of TiketAspirasi
    },
  });
};

// Create New Ticket
export const useCreateVoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/student-voice', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['voice', 'stats'] });
    },
  });
};

// Get Ticket Detail
export const useVoiceDetailQuery = (id) => {
  return useQuery({
    queryKey: ['voice', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/student-voice/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};
