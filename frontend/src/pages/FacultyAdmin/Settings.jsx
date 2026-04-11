"use client"

import React, { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Save, 
  Loader2,
  AlertCircle
} from "lucide-react"
import api from "../../lib/axios"
import { Button } from "./components/button"
import { Input } from "./components/input"
import { Label } from "./components/label"
import { Badge } from "./components/badge"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ email: '', role: '' });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/faculty/profile');
      if (data.success) {
        setProfile({
          email: data.data.email,
          role: data.data.role
        });
      }
    } catch (error) {
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.put('/faculty/profile', { email: profile.email });
      if (data.success) {
        toast.success('Email berhasil diperbarui');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast.error('Konfirmasi password tidak cocok');
    }

    setSubmitting(true);
    try {
      const { data } = await api.put('/faculty/change-password', passwordData);
      if (data.success) {
        toast.success('Password berhasil diperbarui');
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <PageContainer>
      <Toaster position="top-right" />
      
      <PageHeader
        icon={ShieldCheck}
        title="Pengaturan Akun"
        description="Kelola Keamanan & Akses Portal"
      />

      <ResponsiveGrid cols={3}>
        <div className="lg:col-span-1 space-y-6">
          <ResponsiveCard className="h-fit">
                <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                  <User className="size-8 text-primary" />
                </div>
                <h3 className="text-lg font-black text-slate-900 font-headline uppercase tracking-tight mb-2">Informasi Akun</h3>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed mb-6 uppercase">
                  Pastikan email Anda aktif untuk menerima notifikasi sistem dan laporan berkala.
                </p>
                
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <ShieldCheck className="size-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Role</p>
                    <p className="text-[11px] font-black text-slate-900 mt-1 uppercase tracking-tight">{profile.role?.replace('_', ' ')}</p>
                  </div>
                </div>
          </ResponsiveCard>

          <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex gap-4">
            <div className="size-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shrink-0 shadow-sm border border-rose-200/50">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900 uppercase tracking-tight mb-1 font-headline">Keamanan Akun</h4>
              <p className="text-[10px] text-rose-700/80 leading-relaxed font-bold uppercase">
                Jangan berikan akses akun anda kepada pihak lain di luar otoritas resmi.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <ResponsiveCard>
            <div className="flex items-center gap-4 mb-8">
              <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary">
                <Mail className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Alamat Email</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Kontak Utama Administrator</p>
              </div>
            </div>
            <form onSubmit={handleUpdateEmail} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Email Pengguna</Label>
                <Input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="h-12 rounded-2xl font-bold font-headline"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting} className="h-12 px-10 rounded-2xl font-headline">
                  {submitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">Simpan Perubahan</span>
                </Button>
              </div>
            </form>
          </ResponsiveCard>

          <ResponsiveCard>
            <div className="flex items-center gap-4 mb-8">
              <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary">
                <Lock className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Ganti Password</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Pembaruan Kode Keamanan</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Password Saat Ini</Label>
                <Input 
                  type="password" 
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                  className="h-12 rounded-2xl font-bold font-headline"
                  placeholder="••••••••"
                  required
                />
              </div>
              <ResponsiveGrid cols={2}>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Password Baru</Label>
                  <Input 
                    type="password" 
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="h-12 rounded-2xl font-bold font-headline"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Konfirmasi</Label>
                  <Input 
                    type="password" 
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    className="h-12 rounded-2xl font-bold font-headline"
                    required
                  />
                </div>
              </ResponsiveGrid>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={submitting} variant="outline" className="h-12 px-10 rounded-2xl font-headline bg-slate-900 text-white hover:bg-black border-none">
                  {submitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Lock className="size-4 mr-2" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">Update Password</span>
                </Button>
              </div>
            </form>
          </ResponsiveCard>
        </div>
      </ResponsiveGrid>
    </PageContainer>
  )
}
