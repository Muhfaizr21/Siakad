import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useOrganisasiListQuery = () => {
  return useQuery({
    queryKey: ['organisasi', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/organisasi');
      return data.data;
    },
  });
};

export const useCreateOrganisasiMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post('/organisasi', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organisasi'] }),
  });
};

export const useUpdateOrganisasiMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.put(`/organisasi/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organisasi'] }),
  });
};

export const useDeleteOrganisasiMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/organisasi/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organisasi'] }),
  });
};
