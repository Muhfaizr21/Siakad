import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useOrganisasiListQuery = () => {
  return useQuery({
    queryKey: ['organisasi', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/admin/ormawa');
      return data.data;
    },
  });
};

export const useCreateOrganisasiMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post('/admin/ormawa', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organisasi'] }),
  });
};

export const useUpdateOrganisasiMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.put(`/admin/ormawa/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organisasi'] }),
  });
};

export const useDeleteOrganisasiMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/ormawa/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organisasi'] }),
  });
};

