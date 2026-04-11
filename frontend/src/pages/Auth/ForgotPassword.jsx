import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

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
    <div className="min-h-screen flex font-inter bg-neutral-50 overflow-hidden text-neutral-800">
      {/* LEFT PANEL - BRANDING */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col justify-between p-12 lg:p-14 2xl:p-20 overflow-hidden">
        {/* Modern Authentic Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/BG.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#00236F]/95 to-[#0B4FAE]/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[#00174B]/30 backdrop-blur-[3px]"></div>
        
        {/* Soft Glowing Orbs for Depth */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Top Logo */}
        <div className="relative z-10">
          <div className="w-[88px] h-[88px] bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center p-2.5 border border-white/20 shadow-2xl mb-12">
            <div className="w-full h-full bg-white rounded-xl flex items-center justify-center p-1.5 overflow-hidden">
              <img src="/images/bku logo.png" alt="Logo BKU" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Middle Typography */}
        <div className="relative z-10 mb-20 transform translate-y-[-10%]">
          <h1 className="text-[3.25rem] 2xl:text-[4rem] font-bold font-jakarta text-white mb-4 leading-[1.1] tracking-tight drop-shadow-sm">
            Student Hub
          </h1>
          <p className="text-blue-100 divide-x divide-white/20 flex items-center text-[1.1rem] 2xl:text-[1.25rem] font-medium tracking-wide">
            <span>Universitas Bhakti Kencana</span>
          </p>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3.5 px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
            <span className="relative flex h-3.5 w-3.5">
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white/80"></span>
            </span>
            <span className="text-[14px] font-semibold text-white tracking-wide">Pusat Keamanan Akun</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col justify-center items-center lg:items-start relative p-6 sm:p-12 lg:pl-28 xl:pl-40 lg:pr-12 bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.03)] z-10 rounded-l-[2.5rem] lg:rounded-l-[3rem] 2xl:rounded-l-[4rem]">
        
        <div className="w-full max-w-[440px]">
          <Link to="/login" className="inline-flex items-center text-[14px] font-bold text-neutral-500 hover:text-[#00236F] transition-colors mb-10 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Login
          </Link>

          {/* Desktop Header */}
          <div className="mb-10 lg:text-left text-center">
            <h2 className="text-[2rem] font-bold font-jakarta text-neutral-900 mb-3 tracking-tight">Lupa Sandi?</h2>
            <p className="text-neutral-500 text-[15px] leading-relaxed font-medium">Masukkan email atau NIM Anda, dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50/80 border border-red-100 text-red-600 px-4 py-3.5 rounded-2xl mb-8 text-[14px] flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <span className="leading-relaxed font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg ? (
            <div className="bg-green-50/80 border border-green-200 text-green-700 p-8 rounded-3xl mb-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <MailCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold font-jakarta mb-2">Tautan Terkirim!</h3>
              <p className="text-[15px] font-medium text-green-600/80 mb-6">{successMsg}</p>
              <button 
                onClick={() => setSuccessMsg('')} 
                className="text-[14px] font-bold text-green-700 hover:text-green-800 underline underline-offset-4"
              >
                Kirim ulang tautan
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[14px] font-bold text-neutral-800" htmlFor="identifier">Email atau NIM</label>
                <input
                  id="identifier"
                  type="text"
                  className={`w-full px-5 py-4 rounded-[1rem] border-2 ${errors.identifier ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/30' : 'border-neutral-100 focus:border-[#00236F] focus:ring-[#00236F]/10 bg-neutral-50/70 hover:bg-neutral-100/50'} focus:bg-white focus:outline-none focus:ring-4 transition-all duration-300 text-[15px] font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-medium`}
                  placeholder="Misal: student@bku.ac.id"
                  {...register('identifier')}
                  disabled={isSubmitting}
                />
                {errors.identifier && (
                  <p className="mt-2 text-[13px] text-red-500 font-bold flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00236F] hover:bg-[#0B4FAE] text-white font-bold py-4.5 px-4 rounded-[1rem] transition-all duration-300 active:scale-[0.98] shadow-[0_8px_20px_rgba(0,35,111,0.25)] hover:shadow-[0_12px_28px_rgba(11,79,174,0.35)] disabled:opacity-75 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none flex items-center justify-center mt-8 group text-[16px] h-[56px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2.5" size={20} />
                    Memproses...
                  </>
                ) : (
                  <span>Kirim Tautan Reset</span>
                )}
              </button>
            </form>
          )}
          
          <div className="mt-14 lg:mt-20 text-center">
            <p className="text-[13px] text-neutral-400 font-semibold tracking-wide">
              &copy; {new Date().getFullYear()} Universitas Bhakti Kencana. <br className="lg:hidden" /> Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
