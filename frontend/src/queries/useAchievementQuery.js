import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// Get Achievements List
export const useAchievementsQuery = (search = '') => {
  return useQuery({
    queryKey: ['achievements', search],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (search) p.append('search', search);
      const { data } = await api.get(`/achievement?${p.toString()}`);
      return data.data; // { stats: {...}, list: [...] }
    },
    keepPreviousData: true,
  });
};

// Get Achievement Detail
export const useAchievementDetailQuery = (id) => {
  return useQuery({
    queryKey: ['achievement', id],
    queryFn: async () => {
      const { data } = await api.get(`/achievement/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Create Achievement (FormData)
export const useCreateAchievementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/achievement', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};

export const useCreatePrestasiMandiriMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/prestasi-mandiri', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};

export const useUpdatePrestasiMandiriMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/prestasi-mandiri/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};

export const useSubmitPrestasiMandiriMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/prestasi-mandiri/${id}/submit`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};

// Delete Achievement
export const useDeleteAchievementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/achievement/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};
