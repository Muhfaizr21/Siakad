import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      mahasiswa: null,
      
      setAuth: (accessToken, mahasiswa) => set({ accessToken, mahasiswa }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => {
        try {
          localStorage.removeItem('siakad_auth');
          localStorage.removeItem('auth-storage');
        } catch {
          // ignore storage errors
        }
        set({ accessToken: null, mahasiswa: null });
      }
    }),
    {
      name: 'auth-storage', // local storage key
    }
  )
);

export default useAuthStore;
