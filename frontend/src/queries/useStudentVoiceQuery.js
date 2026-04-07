import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// 1. Get Stats (Total, Level, Status)
export const useVoiceStatsQuery = () => {
  return useQuery({
    queryKey: ['student-voice', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/student-voice/stats');
      return data.data;
    },
  });
};

// 2. Get Aspiration List (Paginated)
export const useVoiceListQuery = (page = 1) => {
  return useQuery({
    queryKey: ['student-voice', 'list', page],
    queryFn: async () => {
      const { data } = await api.get(`/student-voice/?page=${page}`);
      return data.data;
    },
  });
};

// 3. Get Aspiration Detail
export const useVoiceDetailQuery = (id) => {
  return useQuery({
    queryKey: ['student-voice', 'detail', id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/student-voice/${id}`);
        return data.data;
      } catch (error) {
        // Melempar error yang lebih jelas agar bisa ditangani UI
        if (error.response) {
          throw {
            status: error.response.status,
            message: error.response.data?.message || 'Gagal memuat detail aspirasi',
          };
        }
        throw error;
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      // Jangan retry jika error adalah 404 (Data Tidak Ditemukan)
      if (error?.status === 404) return false;
      // Untuk error lain, retry maksimal 2 kali
      return failureCount < 2;
    },
  });
};

// 4. Create New Aspiration (Multipart)
export const useCreateVoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/student-voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-voice'] });
    },
  });
};

// 5. Cancel Aspiration
export const useCancelVoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.put(`/student-voice/${id}/cancel`, {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-voice'] });
    },
  });
};
