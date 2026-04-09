import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

const mapCounselingItem = (item = {}) => ({
  id: item.ID ?? item.id,
  tanggal: item.Tanggal || item.tanggal,
  tipe: item.tipe || 'Akademik',
  status: item.Status || item.status || 'Menunggu',
  nama_konselor: item?.Dosen?.Nama || item.nama_konselor || '-',
  jam_mulai: item.jam_mulai || '09:00',
});

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
      return list.map(mapCounselingItem);
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
