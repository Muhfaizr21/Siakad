import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/student-voice';

// 1. Get Stats (Total, Level, Status)
export const useVoiceStatsQuery = () => {
  return useQuery({
    queryKey: ['student-voice', 'stats'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/stats`, { withCredentials: true });
      return data.data;
    },
  });
};

// 2. Get Aspiration List (Paginated)
export const useVoiceListQuery = (page = 1) => {
  return useQuery({
    queryKey: ['student-voice', 'list', page],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/?page=${page}`, { withCredentials: true });
      return data.data;
    },
  });
};

// 3. Get Aspiration Detail
export const useVoiceDetailQuery = (id) => {
  return useQuery({
    queryKey: ['student-voice', 'detail', id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${id}`, { withCredentials: true });
      return data.data;
    },
    enabled: !!id,
  });
};

// 4. Create New Aspiration (Multipart)
export const useCreateVoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
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
      const { data } = await axios.put(`${API_URL}/${id}/cancel`, {}, { withCredentials: true });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-voice'] });
    },
  });
};
