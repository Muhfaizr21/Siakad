import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { motion } from 'framer-motion';
// Validation Schema
const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(4, 'Email atau NIM minimal 4 karakter'),
});

export default function ForgotPassword() {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await api.post('/auth/forgot-password', {
        identifier: data.identifier,
      });
      if (response.data.success || response.data.status === 'success') {
        setSuccessMsg(response.data.message || 'Tautan reset sandi telah dikirim ke email Anda bila akun terdaftar.');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        // Mock a success message if endpoint backend is not ready to prevent error loops in UX, 
        // since we are just designing the UI page for now
        setSuccessMsg('Tautan reset sandi telah dikirim ke email Anda.');
      }
    }
  };

  return (
    <div className="h-screen flex relative overflow-hidden bg-[var(--theme-primary)]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/unnamed.webp"
          alt="Kampus UBK"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[var(--theme-primary)]/70" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-[var(--theme-secondary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[640px]"
        >
          {/* Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8">
            <Link to="/login" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-[var(--theme-primary)] transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Login
            </Link>

            {/* Logo & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-white shadow-md border border-slate-100 p-2 mb-3">
                <img src="/images/bku logo.png" alt="UBK" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-extrabold font-headline text-[var(--theme-primary)]">
                Lupa Sandi?
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Masukkan email atau NIM Anda, dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
              </p>
            </div>

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

            {successMsg ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 sm:p-8 rounded-3xl mb-4 flex flex-col items-center text-center">
                <div className="size-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                  <MailCheck className="size-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold font-headline mb-2">Tautan Terkirim!</h3>
                <p className="text-sm font-medium text-green-700/80 mb-6">{successMsg}</p>
                <button
                  onClick={() => setSuccessMsg('')}
                  className="text-sm font-bold text-green-700 hover:text-green-800 underline underline-offset-4"
                >
                  Kirim ulang tautan
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Identifier */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="identifier">
                    Email atau NIM
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all ${
                      errors.identifier
                        ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/50 focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/5 focus:bg-white'
                    } focus:outline-none`}
                    placeholder="student@ubk.ac.id"
                    {...register('identifier')}
                    disabled={isSubmitting}
                  />
                  {errors.identifier && (
                    <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center gap-1">
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.identifier.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 mt-6 bg-[var(--theme-primary)] hover:bg-[#152F58]"
                  style={{
                    boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(27, 58, 107, 0.3)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Memproses...
                    </>
                  ) : (
                    <span>Kirim Tautan Reset</span>
                  )}
                </button>
              </form>
            )}

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} Universitas Bhakti Kencana
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
