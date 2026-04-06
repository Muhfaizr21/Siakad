import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// Get Health Summary (Hero Card)
export const useHealthRingkasanQuery = () => {
  return useQuery({
    queryKey: ['health', 'ringkasan'],
    queryFn: async () => {
      const { data } = await api.get('/health/ringkasan');
      return data.data;
    },
  });
};

// Alias to maintain compatibility if any component still uses the old name
export const useHealthTerbaruQuery = useHealthRingkasanQuery;

// Get Health History (Paginated & Filtered)
export const useHealthRiwayatQuery = (filters = { sumber: 'Semua' }) => {
  return useQuery({
    queryKey: ['health', 'riwayat', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.sumber !== 'Semua') params.append('sumber', filters.sumber);
      
      const { data } = await api.get(`/health/riwayat?${params.toString()}`);
      return data.data;
    },
  });
};

// Get Health Detail (Action Modal)
export const useHealthDetailQuery = (id) => {
  return useQuery({
    queryKey: ['health', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/health/riwayat/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Input Mandiri Mutation
export const useHealthMandiriMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/health/mandiri', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
    },
  });
};

// Get Health Tips (BMI based)
export const useHealthTipsQuery = (bmi) => {
  return useQuery({
    queryKey: ['health', 'tips', bmi],
    queryFn: async () => {
      const { data } = await api.get(`/health/tips?bmi=${bmi}`);
      return data.tips;
    },
    enabled: !!bmi,
  });
};
