import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// Get Kencana Progress (tahap-based structure)
export const useKencanaProgressQuery = () => {
  return useQuery({
    queryKey: ['kencana', 'progress'],
    queryFn: async () => {
      const { data } = await api.get('/kencana/progress');
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Get Soal Kuis (tanpa kunci jawaban)
export const useSoalKuisQuery = (kuisId) => {
  return useQuery({
    queryKey: ['kencana', 'kuis', kuisId],
    queryFn: async () => {
      const { data } = await api.get(`/kencana/kuis/${kuisId}/soal`);
      return data.data; // { kuis_id, judul, passing_grade, durasi_menit, bobot_persen, soal: [] }
    },
    enabled: !!kuisId,
  });
};

// Submit Jawaban Kuis
export const useSubmitKuisMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ kuisId, jawaban }) => {
      const { data } = await api.post(`/kencana/kuis/${kuisId}/submit`, { jawaban });
      return data.data; // { nilai, lulus, jumlah_benar, total_soal, nilai_kumulatif_terbaru, eligible_sertifikat }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kencana'] });
    },
  });
};

// Cek Sertifikat
export const useSertifikatQuery = () => {
  return useQuery({
    queryKey: ['kencana', 'sertifikat'],
    queryFn: async () => {
      const { data } = await api.get('/kencana/sertifikat');
      return data.data; // { has_sertifikat, eligible, nilai_kumulatif, file_url, nomor }
    },
  });
};

// Generate Sertifikat
export const useGenerateSertifikatMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/kencana/sertifikat/generate');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kencana'] });
    },
  });
};

// Get Banding Status
export const useBandingQuery = () => {
  return useQuery({
    queryKey: ['kencana', 'banding'],
    queryFn: async () => {
      const { data } = await api.get('/kencana/banding');
      return data.data; // array of banding
    },
  });
};

// Ajukan Banding (multipart form data)
export const useAjukanBandingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/kencana/banding', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kencana', 'banding'] });
      queryClient.invalidateQueries({ queryKey: ['kencana', 'progress'] });
    },
  });
};
