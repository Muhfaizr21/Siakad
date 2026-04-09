import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

const toValidDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const normalizeRiwayatItem = (item = {}) => {
  const tanggalRaw = item.tanggal || item.Tanggal || item.created_at || item.CreatedAt;
  const tanggalDate = toValidDate(tanggalRaw);
  const dosen = item.dosen || item.Dosen || {};

  const jamMulai =
    item.jam_mulai ||
    item.JamMulai ||
    (tanggalDate
      ? tanggalDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
      : '-');

  return {
    id: item.id || item.ID || 0,
    tanggal: tanggalDate ? tanggalDate.toISOString() : null,
    status: item.status || item.Status || 'Menunggu',
    tipe: item.tipe || item.Tipe || item.topik || item.Topik || 'Konseling',
    nama_konselor: item.nama_konselor || item.NamaKonselor || dosen.nama || dosen.Nama || '-',
    jam_mulai: jamMulai,
  };
};

// Get Available Schedules
export const useCounselingJadwalQuery = () => {
  return useQuery({
    queryKey: ['counseling', 'jadwal'],
    queryFn: async () => {
      const { data } = await api.get('/counseling/jadwal');
      return data.data; // List of JadwalKonseling
    },
  });
};

// Get Booking History for Student
export const useCounselingRiwayatQuery = () => {
  return useQuery({
    queryKey: ['counseling', 'riwayat'],
    queryFn: async () => {
      const { data } = await api.get('/counseling/riwayat');
      const list = Array.isArray(data?.data) ? data.data : [];
      return list.map(normalizeRiwayatItem);
    },
  });
};

// Create New Booking
export const useBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/counseling/booking', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counseling', 'riwayat'] });
      queryClient.invalidateQueries({ queryKey: ['counseling', 'jadwal'] });
    },
  });
};

// Cancel Pending Booking
export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/counseling/riwayat/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counseling', 'riwayat'] });
      queryClient.invalidateQueries({ queryKey: ['counseling', 'jadwal'] });
    },
  });
};
