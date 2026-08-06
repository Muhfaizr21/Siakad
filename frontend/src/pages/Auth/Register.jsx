import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/axios';

const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus mengandung huruf besar')
    .regex(/[a-z]/, 'Harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Harus mengandung angka'),
  confirm_password: z.string(),
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Password dan konfirmasi tidak cocok',
  path: ['confirm_password'],
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const newPassword = watch('password', '');

  const getStrength = (pwd) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    return (score / 4) * 100;
  };

  const strength = getStrength(newPassword);

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register/mahasiswa', {
        email: data.email,
        password: data.password,
        nama: data.nama,
      });

      if (response.data.success) {
        setSuccessMsg('Registrasi berhasil!');

        const token = response.data.data?.access_token;
        if (token) {
          localStorage.setItem('token', token);
          if (response.data.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
          }
        }

        setTimeout(() => {
          navigate('/student/dashboard', { replace: true });
        }, 1500);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else if (error.response?.data?.error) {
        setErrorMsg(error.response.data.error);
      } else {
        setErrorMsg('Terjadi kesalahan. Coba lagi nanti.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex relative overflow-hidden bg-[var(--theme-primary)]">
      <div className="absolute inset-0">
        <img
          src="/images/unnamed.webp"
          alt="Kampus UBK"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[var(--theme-primary)]/70" />
      </div>

      <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-[var(--theme-secondary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[640px]"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-white shadow-md border border-slate-100 p-2 mb-3">
                <img src="/images/bku logo.png" alt="UBK" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-extrabold font-headline text-[var(--theme-primary)]">
                Daftar Akun Baru
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Isi data diri Anda untuk mendaftar sebagai mahasiswa UBK
              </p>
            </div>

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-100 text-green-600 px-4 py-3.5 rounded-2xl mb-6 text-sm flex items-start gap-3"
              >
                <svg className="size-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">{successMsg}</span>
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3.5 rounded-2xl mb-6 text-sm flex items-start gap-3"
              >
                <svg className="size-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="nama">
                  Nama Lengkap
                </label>
                <input
                  id="nama"
                  type="text"
                  className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all ${
                    errors.nama
                      ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/50 focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/5 focus:bg-white'
                  } focus:outline-none`}
                  placeholder="Nama lengkap"
                  {...register('nama')}
                  disabled={isLoading}
                />
                {errors.nama && (
                  <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center gap-1">
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.nama.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="email">
                  Email Pribadi
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all ${
                    errors.email
                      ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/50 focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/5 focus:bg-white'
                  } focus:outline-none`}
                  placeholder="email@pribadi.com"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center gap-1">
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all pr-12 ${
                        errors.password
                          ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/50 focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/5 focus:bg-white'
                      } focus:outline-none`}
                      placeholder="Minimal 8 karakter"
                      {...register('password')}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center gap-1">
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="confirm_password">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm_password"
                      type={showConfirm ? 'text' : 'password'}
                      className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all pr-12 ${
                        errors.confirm_password
                          ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/50 focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/5 focus:bg-white'
                      } focus:outline-none`}
                      placeholder="Ulangi password"
                      {...register('confirm_password')}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={() => setShowConfirm(!showConfirm)}
                      tabIndex="-1"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center gap-1">
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="-mt-1 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      strength < 25 ? 'bg-red-400' :
                      strength < 50 ? 'bg-orange-400' :
                      strength < 75 ? 'bg-yellow-400' : 'bg-green-500'
                    }`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 min-w-[70px] text-right">
                  {strength === 0 ? '' :
                   strength < 25 ? 'Lemah' :
                   strength < 50 ? 'Cukup' :
                   strength < 75 ? 'Kuat' : 'Sangat Kuat'}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 bg-[var(--theme-primary)] hover:bg-[#152F58]"
                  style={{
                    boxShadow: isLoading ? 'none' : '0 4px 16px rgba(27, 58, 107, 0.3)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Mendaftarkan...
                    </>
                  ) : (
                    <>
                      Daftar Sekarang
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-center text-sm text-slate-500">
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  className="font-bold text-[var(--theme-primary)] hover:text-[var(--theme-primary-hover)] hover:underline transition-colors"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>

            <div className="mt-3 text-center">
              <Link
                to="/"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
              >
                &larr; Kembali ke Beranda
              </Link>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} Universitas Bhakti Kencana
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
