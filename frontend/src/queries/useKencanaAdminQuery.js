import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

const unwrap = (res) => res.data?.data ?? res.data;

// ─── Periods ───
export const usePeriodsQuery = () => useQuery({
  queryKey: ['kencana-admin', 'periods'],
  queryFn: async () => unwrap(await api.get('/kencana-admin/periods')),
});

export const useCreatePeriodMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post('/kencana-admin/periods', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin', 'periods'] }),
  });
};

export const useUpdatePeriodMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => unwrap(await api.put(`/kencana-admin/periods/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin', 'periods'] }),
  });
};

// ─── Stages ───
export const useStagesQuery = (periodId) => useQuery({
  queryKey: ['kencana-admin', 'stages', periodId],
  queryFn: async () => unwrap(await api.get('/kencana-admin/stages', { params: { period_id: periodId } })),
  enabled: !!periodId,
});

export const useCreateStageMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post('/kencana-admin/stages', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin', 'stages'] }),
  });
};

export const useUpdateStageMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => unwrap(await api.put(`/kencana-admin/stages/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin', 'stages'] }),
  });
};

// ─── Sessions ───
export const useSessionsQuery = (stageId) => useQuery({
  queryKey: ['kencana-admin', 'sessions', stageId],
  queryFn: async () => unwrap(await api.get('/kencana-admin/sessions', { params: { stage_id: stageId } })),
  enabled: !!stageId,
});

export const useCreateSessionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post('/kencana-admin/sessions', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin', 'sessions'] }),
  });
};

export const useUpdateSessionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => unwrap(await api.put(`/kencana-admin/sessions/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin', 'sessions'] }),
  });
};

// ─── Materials, Quizzes, Questions, Assignments ───
export const useCreateMaterialMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post('/kencana-admin/materials', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin'] }),
  });
};

export const useCreateQuizMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post('/kencana-admin/quizzes', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin'] }),
  });
};

export const useAdminQuizQuery = (quizId) => useQuery({
  queryKey: ['kencana-admin', 'quiz', quizId],
  queryFn: async () => unwrap(await api.get(`/kencana-admin/quizzes/${quizId}`)),
  enabled: !!quizId,
});

export const useCreateQuestionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post('/kencana-admin/questions', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin'] }),
  });
};

export const useUpdateQuestionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => unwrap(await api.put(`/kencana-admin/questions/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin'] }),
  });
};

export const useCreateAssignmentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post('/kencana-admin/assignments', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin'] }),
  });
};

// ─── Participants & Scores ───
export const useParticipantsQuery = (params = {}) => useQuery({
  queryKey: ['kencana-admin', 'participants', params],
  queryFn: async () => unwrap(await api.get('/kencana-admin/participants', { params })),
});

export const useScoresQuery = (params = {}) => useQuery({
  queryKey: ['kencana-admin', 'scores', params],
  queryFn: async () => unwrap(await api.get('/kencana-admin/scores', { params })),
});

// ─── Remedials & Certificates ───
export const useCreateRemedialMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post('/kencana-admin/remedials', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin'] }),
  });
};

export const useGenerateCertificateMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post('/kencana-admin/certificates/generate', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin'] }),
  });
};

// ─── Mentors ───
const kencanaBase = (portal = 'admin') => portal === 'fakultas' ? '/kencana-fakultas' : '/kencana-admin';

export const useMentorsQuery = (portal = 'admin') => useQuery({
  queryKey: [`kencana-${portal}`, 'mentors'],
  queryFn: async () => unwrap(await api.get(`${kencanaBase(portal)}/mentors`)),
});

export const useCreateMentorMutation = (portal = 'admin') => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post(`${kencanaBase(portal)}/mentors`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [`kencana-${portal}`, 'mentors'] }),
  });
};

export const useUpdateMentorMutation = (portal = 'admin') => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => unwrap(await api.put(`${kencanaBase(portal)}/mentors/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [`kencana-${portal}`, 'mentors'] }),
  });
};

export const useDeleteMentorMutation = (portal = 'admin') => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => unwrap(await api.delete(`${kencanaBase(portal)}/mentors/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [`kencana-${portal}`, 'mentors'] }),
  });
};

// ─── Mentor Assignments ───
export const useMentorAssignmentsQuery = () => useQuery({
  queryKey: ['kencana-admin', 'mentor-assignments'],
  queryFn: async () => unwrap(await api.get('/kencana-admin/mentor-assignments')),
});

export const useCreateMentorAssignmentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrap(await api.post('/kencana-admin/mentor-assignments', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin', 'mentor-assignments'] }),
  });
};

export const useMoveMentorAssignmentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => unwrap(await api.put(`/kencana-admin/mentor-assignments/${id}/move`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin', 'mentor-assignments'] }),
  });
};

export const useDeleteMentorAssignmentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => unwrap(await api.delete(`/kencana-admin/mentor-assignments/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kencana-admin', 'mentor-assignments'] }),
  });
};
