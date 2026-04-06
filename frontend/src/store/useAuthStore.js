import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      mahasiswa: null,
      
      setAuth: (accessToken, mahasiswa) => set({ accessToken, mahasiswa }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ accessToken: null, mahasiswa: null })
    }),
    {
      name: 'auth-storage', // local storage key
    }
  )
);

export default useAuthStore;
