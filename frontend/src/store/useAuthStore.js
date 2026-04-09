import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      mahasiswa: null,
      user: null,
      
      setAuth: (accessToken, mahasiswa, user) => set({ accessToken, mahasiswa, user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ accessToken: null, mahasiswa: null, user: null })
    }),
    {
      name: 'auth-storage', // local storage key
    }
  )
);

export default useAuthStore;
