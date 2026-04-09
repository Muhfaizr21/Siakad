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
  identifier: z.string().min(4, 'NIM atau Email minimal 4 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

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
    console.log('Bypass Login Attempt:', data);
    setErrorMsg('');
    
    // Hardcode auth session for bypass
    localStorage.setItem('token', 'bypass_token_superadmin');
    setAuth('bypass_token_superadmin', null, { id: 1, email: 'admin@siakad.com', role: 'SuperAdmin' });

    console.log('Forcing redirect to /admin...');
    window.location.href = '/admin';
  };

  const validationErrors = Object.values(errors).map(err => err.message);

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
          <h1 className="text-4xl font-bold font-jakarta mb-4">Portal Akademik</h1>
          <p className="text-blue-50 text-lg">
            Sistem Informasi Terpadu Universitas Bhakti Kencana
          </p>
        </div>
      </div>

      {/* Kolom Kanan - Form Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-3xl font-bold font-jakarta mb-2">Selamat Datang 👋</h2>
          <p className="text-neutral-600 mb-8">Silakan masuk menggunakan NIM/Email dan Password Anda.</p>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {errorMsg}
            </div>
          )}

          {validationErrors.length > 0 && (
             <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-6 text-sm">
               <ul className="list-disc ml-4">
                 {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
               </ul>
             </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5" htmlFor="identifier">
                NIM atau Email
              </label>
              <input
                id="identifier"
                type="text"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.identifier ? 'border-red-400 focus:ring-red-100' : 'border-neutral-200 focus:border-primary focus:ring-primary'} focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-200`}
                placeholder="Misal: 10123456 atau admin@siakad.com"
                {...register('identifier')}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.password ? 'border-red-400 focus:ring-red-100' : 'border-neutral-200 focus:border-primary focus:ring-primary'} focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-200 pr-10`}
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
