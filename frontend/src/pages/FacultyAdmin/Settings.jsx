"use client"

import React, { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"
import {
  User,
  Loader2,
  ShieldCheck
} from "lucide-react"
import api from "../../lib/axios"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

export default function Settings() {
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [profile, setProfile]       = useState({ email: '', role: '' })
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [activeTab, setActiveTab]   = useState('profile')

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/faculty/profile')
      if (data.success) {
        setProfile({ email: data.data.email, role: data.data.role })
      }
    } catch {
      toast.error('Gagal memuat profil')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUpdateEmail = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.put('/faculty/profile', { email: profile.email })
      if (data.success) {
        toast.success('Email berhasil diperbarui')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui email')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast.error('Konfirmasi password tidak cocok')
    }
    setSubmitting(true)
    try {
      const { data } = await api.put('/faculty/change-password', passwordData)
      if (data.success) {
        toast.success('Password berhasil diperbarui')
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui password')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 font-inter">
        <Loader2 className="animate-spin size-8 text-primary" />
        <p className="text-sm text-slate-400 font-medium">Memuat konfigurasi profil...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 font-inter animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* ── Minimalist Page Header ────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6 pt-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Akun</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola identitas dan keamanan portal fakultas Anda.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold tracking-wider uppercase border border-emerald-100 shadow-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Sistem Aktif
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ── Navigation Sidebar ───────────────────────────────── */}
        <aside className="lg:col-span-3 space-y-2">
          {[
            { id: 'profile', label: 'Informasi Profil', icon: User, desc: 'Email & Username' },
            { id: 'security', label: 'Keamanan', icon: ShieldCheck, desc: 'Kata Sandi & Akses' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 text-left border",
                activeTab === tab.id 
                  ? "bg-white border-slate-200 shadow-lg shadow-slate-100 ring-4 ring-slate-50" 
                  : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
                activeTab === tab.id ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-white text-slate-400 border-slate-100"
              )}>
                <tab.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-bold transition-colors", activeTab === tab.id ? "text-slate-900" : "text-slate-600")}>{tab.label}</p>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{tab.desc}</p>
              </div>
            </button>
          ))}
        </aside>

        {/* ── Main Content Area ────────────────────────────────── */}
        <main className="lg:col-span-9">
          
          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Informasi Profil</h2>
                <p className="text-sm text-slate-500 font-medium">Data ini digunakan untuk login dan korespondensi sistem.</p>
              </div>

              <form onSubmit={handleUpdateEmail} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-slate-600 ml-1">Alamat Email Resmi</Label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-sm placeholder:text-slate-300"
                      placeholder="contoh@bku.ac.id"
                      required
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-slate-600 ml-1">Username Admin</Label>
                    <Input
                      type="text"
                      value={profile.email ? profile.email.split('@')[0] : 'admin'}
                      className="h-12 rounded-xl bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed font-semibold text-sm"
                      disabled
                    />
                    <p className="text-[10px] text-slate-400 font-medium italic ml-1">Username otomatis mengikuti prefix email.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-8 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold text-xs tracking-wide transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="animate-spin size-4" />}
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1 text-left">
                <h2 className="text-lg font-bold text-slate-900">Keamanan & Password</h2>
                <p className="text-sm text-slate-500 font-medium">Pastikan Anda menggunakan kombinasi password yang kuat.</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-8 text-left">
                <div className="max-w-md space-y-6">
                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-slate-600 ml-1">Password Saat Ini</Label>
                    <Input
                      type="password"
                      value={passwordData.old_password}
                      onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-sm"
                      placeholder="Masukkan password lama"
                      required
                    />
                  </div>

                  <div className="h-px bg-slate-50 w-full" />

                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-slate-600 ml-1 text-left">Password Baru</Label>
                    <Input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-sm"
                      placeholder="Min. 8 karakter"
                      required
                    />
                  </div>

                  <div className="space-y-2.5 text-left">
                    <Label className="text-xs font-bold text-slate-600 ml-1 text-left">Konfirmasi Password Baru</Label>
                    <Input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-sm"
                      placeholder="Ulangi password baru"
                      required
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50 flex justify-start">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs tracking-wide transition-all shadow-lg shadow-slate-200 active:scale-95 flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="animate-spin size-4" />}
                    Update Password Keamanan
                  </Button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
