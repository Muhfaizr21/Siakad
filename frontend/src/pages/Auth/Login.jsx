import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import useAuthStore from '../../store/useAuthStore';

// Validation Schema
const loginSchema = z.object({
  identifier: z
    .string()
    .min(4, 'Email atau NIM minimal 4 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const getRoleFromToken = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return '';
    const decoded = JSON.parse(atob(payload));
    return String(decoded?.role || '').toLowerCase();
  } catch {
    return '';
  }
};

const getRouteByRole = (role) => {
  const r = String(role || '').toLowerCase().trim();
  if (r === 'super_admin') return '/admin';
  if (r === 'faculty_admin') return '/faculty';
  if (r === 'ormawa_admin') return '/ormawa';
  if (r === 'dosen') return '/faculty';
  return '/student/dashboard';
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      const response = await api.post('/auth/login', {
        identifier: data.identifier,
        password: data.password,
      });
      if (response.data.success || response.data.status === 'success') {
        const payload = response.data.data || {};
        const token = payload.access_token || payload.token;
        if (!token) {
          setErrorMsg('Token login tidak ditemukan dari server.');
          return;
        }

        const roleFromResponse = payload?.user?.role;
        const role = roleFromResponse || getRoleFromToken(token);

        const userData = (payload.mahasiswa && payload.mahasiswa.nim) ? payload.mahasiswa : payload.user;
        setAuth(token, userData || null);
        navigate(getRouteByRole(role), { replace: true });
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('Terjadi kesalahan pada server. Coba lagi nanti.');
      }
    }
  };

  return (
    <div className="min-h-screen flex font-inter text-neutral-900 bg-neutral-50">
      {/* Kolom Kiri - Branding BKU */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#00236F] to-[#0B4FAE] flex-col justify-center items-center p-12 text-white relative">
        <div className="z-10 text-center max-w-md">
          <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md inline-block mb-8 shadow-xl">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center overflow-hidden p-2">
              <img src="/images/bku logo.png" alt="Logo Universitas" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-jakarta mb-4">Portal Mahasiswa</h1>
          <p className="text-blue-50 text-lg">
            Sistem Informasi Akademik Terpadu Universitas Bhakti Kencana
          </p>
        </div>
        
        {/* Dekoratif */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#001B57]/35 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Kolom Kanan - Form Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 bg-white">
        <div className="w-full max-w-sm mx-auto">
          
          <div className="md:hidden flex items-center gap-3 mb-10">
             <div className="w-10 h-10 bg-white border border-[#e5e5e5] rounded-lg flex items-center justify-center overflow-hidden p-1">
               <img src="/images/bku logo.png" alt="Logo Universitas" className="w-full h-full object-contain" />
             </div>
             <h2 className="text-xl font-bold font-jakarta text-[#00236F]">Portal Mahasiswa</h2>
           </div>

          <h2 className="text-3xl font-bold font-jakarta mb-2">Selamat Datang 👋</h2>
          <p className="text-neutral-600 mb-8">Silakan masuk menggunakan Email atau NIM dan Password SIAKAD Anda.</p>

          {errorMsg && (
            <div className="bg-[#EAF1FF] border border-[#C9D8FF] text-[#0B4FAE] px-4 py-3 rounded-lg mb-6 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5" htmlFor="identifier">
                Email atau NIM
              </label>
              <input
                id="identifier"
                type="text"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.identifier ? 'border-[#0B4FAE] focus:ring-[#0B4FAE]' : 'border-neutral-200 focus:border-[#00236F] focus:ring-[#00236F]'} focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-200`}
                placeholder="Misal: student@bku.ac.id atau BKU2024001"
                {...register('identifier')}
                disabled={isSubmitting}
              />
              {errors.identifier && (
                <p className="mt-1.5 text-sm text-[#0B4FAE]">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.password ? 'border-[#0B4FAE] focus:ring-[#0B4FAE]' : 'border-neutral-200 focus:border-[#00236F] focus:ring-[#00236F]'} focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-200 pr-10`}
                  placeholder="Masukkan password Anda"
                  {...register('password')}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-[#0B4FAE]">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-[#00236F] focus:ring-[#00236F]" />
                <span className="text-sm text-neutral-600">Ingat saya</span>
              </label>
              <a href="/forgot-password" className="text-sm font-medium text-[#00236F] hover:text-[#0B4FAE] transition-colors">
                Lupa password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00236F] hover:bg-[#0B4FAE] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-sm hover:shadow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Memproses...
                </>
              ) : (
                'Masuk ke Portal'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
