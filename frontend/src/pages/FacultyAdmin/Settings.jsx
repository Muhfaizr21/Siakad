"use client"

import React, { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"

import api from "../../lib/axios"
import { cn } from "@/lib/utils"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const User = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;
const Lock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>lock</span>;



export default function Settings() {
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [profile, setProfile]       = useState({ email: '', role: '' })
  const [showOld, setShowOld]       = useState(false)
  const [showNew, setShowNew]       = useState(false)
  const [showConfirm, setShowConfirm]= useState(false)
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' })

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/faculty/profile')
      if (data.success) setProfile({ email: data.data.email, role: data.data.role })
    } catch { toast.error('Gagal memuat profil') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProfile() }, [])

  const handleUpdateEmail = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const { data } = await api.put('/faculty/profile', { email: profile.email })
      if (data.success) toast.success('Email berhasil diperbarui')
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal memperbarui email') }
    finally { setSubmitting(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) return toast.error('Konfirmasi password tidak cocok')
    setSubmitting(true)
    try {
      const { data } = await api.put('/faculty/change-password', passwordData)
      if (data.success) { toast.success('Password berhasil diperbarui'); setPasswordData({ old_password: '', new_password: '', confirm_password: '' }) }
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal memperbarui password') }
    finally { setSubmitting(false) }
  }

  const setPwd = (k, v) => setPasswordData(p => ({ ...p, [k]: v }))

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined w-10 h-10 text-primary animate-spin" >sync</span>
        <p className="text-sm text-[#a3a3a3] font-medium">Memuat profil...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] font-body">
      <Toaster position="top-right" />
      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-6">

        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl h-auto md:h-48 flex flex-col md:flex-row items-center group shadow-sm p-6 md:p-8 border border-slate-200/80 bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-1.5 bg-primary rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Keamanan & Akses Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
              Pengaturan <span className="text-primary">Akun</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
              Kelola informasi akun, email kontak, dan keamanan password portal admin fakultas.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Profile Info */}
          <div className="space-y-4">
            {/* Avatar Card */}
            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00236F] to-[#003db5] rounded-2xl flex items-center justify-center shadow-xl shadow-[#00236F]/20 mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h3 className="font-extrabold text-lg text-[#171717] leading-tight">Admin Fakultas</h3>
                <p className="text-sm text-[#737373] font-medium mt-1">{profile.email || '—'}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#fafafa] border border-[#f0f0f0]">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }} Check >security</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-[0.18em]">Status Role</p>
                    <p className="text-sm font-bold text-[#171717] uppercase">{profile.role?.replace('_', ' ') || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }} Check >security</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.18em]">Akun Terverifikasi</p>
                    <p className="text-xs font-semibold text-emerald-700">Akses Penuh Sistem</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex gap-4">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-rose-500 flex-shrink-0 shadow-sm border border-rose-200">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >error</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900 mb-1">Peringatan Keamanan</h4>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Jangan berikan akses akun kepada pihak lain di luar otoritas resmi instansi.
                </p>
              </div>
            </div>
          </div>

          {/* Right — Forms */}
          <div className="lg:col-span-2 space-y-5">

            {/* Email Form */}
            <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center gap-3">
                <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex items-center justify-center text-[#00236F]">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >mail</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#171717]">Alamat Email</h3>
                  <p className="text-xs text-[#a3a3a3] font-medium">Kontak utama administrator</p>
                </div>
              </div>
              <form onSubmit={handleUpdateEmail} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Email Pengguna</label>
                  <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} required
                    className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all" />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={submitting}
                    className="h-11 px-8 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20 disabled:opacity-60 flex items-center gap-2">
                    {submitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >save</span>} Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>

            {/* Password Form */}
            <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-[#525252]">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#171717]">Ganti Password</h3>
                  <p className="text-xs text-[#a3a3a3] font-medium">Pembaruan kode keamanan akun</p>
                </div>
              </div>
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                {/* Old password */}
                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Password Saat Ini</label>
                  <div className="relative">
                    <input type={showOld ? 'text' : 'password'} value={passwordData.old_password} onChange={e => setPwd('old_password', e.target.value)} required placeholder="••••••••"
                      className="w-full h-11 px-4 pr-11 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all" />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c4c4c4] hover:text-[#737373] transition-colors">
                      {showOld ? <span className="material-symbols-outlined" style={{ fontSize: '16px' }} Off >visibility</span> : <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span>}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* New password */}
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Password Baru</label>
                    <div className="relative">
                      <input type={showNew ? 'text' : 'password'} value={passwordData.new_password} onChange={e => setPwd('new_password', e.target.value)} required
                        className="w-full h-11 px-4 pr-11 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all" />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c4c4c4] hover:text-[#737373] transition-colors">
                        {showNew ? <span className="material-symbols-outlined" style={{ fontSize: '16px' }} Off >visibility</span> : <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span>}
                      </button>
                    </div>
                  </div>
                  {/* Confirm */}
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Konfirmasi</label>
                    <div className="relative">
                      <input type={showConfirm ? 'text' : 'password'} value={passwordData.confirm_password} onChange={e => setPwd('confirm_password', e.target.value)} required
                        className={cn('w-full h-11 px-4 pr-11 rounded-xl border bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:bg-white transition-all',
                          passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password ? 'border-rose-400 focus:border-rose-400' : 'border-[#e5e5e5] focus:border-primary')} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c4c4c4] hover:text-[#737373] transition-colors">
                        {showConfirm ? <span className="material-symbols-outlined" style={{ fontSize: '16px' }} Off >visibility</span> : <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span>}
                      </button>
                    </div>
                    {passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                      <p className="text-[10px] text-rose-500 font-medium mt-1">Password tidak cocok</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button type="submit" disabled={submitting}
                    className="h-11 px-8 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-black/10 disabled:opacity-60 flex items-center gap-2">
                    {submitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <Lock size={14} />} Update Password
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
