import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

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
      return data.data; // List of clean BookingResponse
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
