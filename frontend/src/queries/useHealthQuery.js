import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const parseVitalsFromRecord = (rec = {}) => {
  const hasil = String(rec?.Hasil || rec?.hasil || '');

  const systolicMatch = hasil.match(/(sistolik|sys|sbp)\s*[:=]?\s*(\d{2,3})/i);
  const diastolicMatch = hasil.match(/(diastolik|dia|dbp)\s*[:=]?\s*(\d{2,3})/i);
  const heightMatch = hasil.match(/(tinggi|tb|height)\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)/i);
  const weightMatch = hasil.match(/(berat|bb|weight)\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)/i);
  const bloodTypeMatch = hasil.match(/(goldar|gol(?:ongan)?\s*darah|blood\s*type)\s*[:=]?\s*([ABO]{1,2}[+-]?)/i);

  const tinggi = toNumber(heightMatch?.[2], toNumber(rec?.tinggi_badan, 0));
  const berat = toNumber(weightMatch?.[2], toNumber(rec?.berat_badan, 0));
  const sistolik = toNumber(systolicMatch?.[2], toNumber(rec?.sistolik, 0));
  const diastolik = toNumber(diastolicMatch?.[2], toNumber(rec?.diastolik, 0));
  const bmi = tinggi > 0 ? Number((berat / ((tinggi / 100) * (tinggi / 100))).toFixed(1)) : toNumber(rec?.bmi, 0);

  const status = rec?.status_kesehatan || (bmi === 0 ? 'pending' : bmi < 25 ? 'sehat' : 'tindak_lanjut');

  return {
    id: rec?.ID ?? rec?.id,
    tanggal_periksa: rec?.Tanggal || rec?.tanggal || rec?.tanggal_periksa,
    sumber: rec?.sumber || 'mandiri',
    tinggi_badan: tinggi,
    berat_badan: berat,
    sistolik,
    diastolik,
    golongan_darah: rec?.golongan_darah || bloodTypeMatch?.[2] || '',
    bmi,
    status_kesehatan: status,
    catatan: rec?.Catatan || rec?.catatan || '',
  };
};

// Get Health Summary (Hero Card)
export const useHealthRingkasanQuery = () => {
  return useQuery({
    queryKey: ['health', 'ringkasan'],
    queryFn: async () => {
      const { data } = await api.get('/health/ringkasan');
      const raw = data?.data?.terakhir || data?.data || {};
      return parseVitalsFromRecord(raw);
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
      const list = Array.isArray(data?.data) ? data.data : [];
      return list.map(parseVitalsFromRecord);
    },
  });
};

// Get Health Detail (Action Modal)
export const useHealthDetailQuery = (id) => {
  return useQuery({
    queryKey: ['health', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/health/riwayat/${id}`);
      return parseVitalsFromRecord(data?.data || {});
    },
    enabled: !!id,
  });
};

// Input Mandiri Mutation
export const useHealthMandiriMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const mappedPayload = {
        tanggal: payload?.tanggal_periksa || payload?.tanggal || new Date().toISOString(),
        jenis_pemeriksaan: payload?.jenis_pemeriksaan || 'Self Assessment',
        hasil: JSON.stringify({
          tinggi_badan: payload?.tinggi_badan,
          berat_badan: payload?.berat_badan,
          sistolik: payload?.sistolik,
          diastolik: payload?.diastolik,
          golongan_darah: payload?.golongan_darah,
          bmi: payload?.bmi,
          status_kesehatan: payload?.status_kesehatan,
        }),
        catatan: payload?.catatan || '',
      };
      const { data } = await api.post('/health/mandiri', mappedPayload);
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
