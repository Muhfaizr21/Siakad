import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const decodeToken = (token) => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      mahasiswa: null,
      isAuthenticated: false,
      
      setAuth: (token, user, mahasiswa) => {
        set({ 
          accessToken: token, 
          user: user || null,
          mahasiswa: mahasiswa || null,
          isAuthenticated: !!token 
        });
      },
      
      setAccessToken: (accessToken) => set({ accessToken }),
      
      logout: () => set({ 
        accessToken: null, 
        user: null, 
        mahasiswa: null, 
        isAuthenticated: false 
      })
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
