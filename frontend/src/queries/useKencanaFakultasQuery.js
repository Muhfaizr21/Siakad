import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

const unwrap = (res) => res.data?.data ?? res.data;

export const useFakultasParticipantsQuery = (params = {}) => useQuery({
  queryKey: ['kencana-fakultas', 'participants', params],
  queryFn: async () => unwrap(await api.get('/kencana-fakultas/participants', { params })),
});

export const useFakultasScoresQuery = (params = {}) => useQuery({
  queryKey: ['kencana-fakultas', 'scores', params],
  queryFn: async () => unwrap(await api.get('/kencana-fakultas/scores', { params })),
});

export const useFakultasStagesQuery = (periodId) => useQuery({
  queryKey: ['kencana-fakultas', 'stages', periodId],
  queryFn: async () => unwrap(await api.get('/kencana-fakultas/stages', { params: { period_id: periodId } })),
});

export const useFakultasMentorsQuery = () => useQuery({
  queryKey: ['kencana-fakultas', 'mentors'],
  queryFn: async () => unwrap(await api.get('/kencana-fakultas/mentors')),
});

export const useCreateFakultasMentorMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post('/kencana-fakultas/mentors', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-fakultas', 'mentors'] }),
  });
};
