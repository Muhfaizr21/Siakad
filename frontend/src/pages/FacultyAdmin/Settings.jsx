import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Save, 
  Loader2,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import api from '../../lib/axios';

// Re-using local minimalist components to be safe from import issues while keeping premium look
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden transition-all hover:shadow-md ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-8 ${className}`}>{children}</div>
);

const Input = ({ icon: Icon, label, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">{label}</label>}
    <div className="relative group">
      <input 
        {...props}
        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm font-headline"
      />
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />}
    </div>
  </div>
);

const CustomButton = ({ children, loading, icon: Icon, variant = "primary", ...props }) => {
  const baseClass = "h-12 px-10 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center font-headline border-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-white shadow-primary/20 hover:bg-primary/90",
    dark: "bg-slate-900 text-white shadow-slate-200 hover:bg-black"
  };
  
  return (
    <button className={`${baseClass} ${variants[variant]}`} disabled={loading} {...props}>
      {loading ? <Loader2 className="animate-spin size-4 mr-3" /> : Icon && <Icon className="size-4 mr-3" />}
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{children}</span>
    </button>
  );
};

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
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Pengaturan Akun</h1>
        </div>
        <div className="flex items-center gap-2">
           <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kelola Keamanan & Akses Portal Fakultas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Info & Help */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-2 relative bg-white group">
            <CardContent className="p-6 relative z-10">
              <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <User className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-black text-slate-900 font-headline uppercase tracking-tight mb-2">Informasi Akun</h3>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-6 uppercase">
                Pastikan email Anda aktif untuk menerima notifikasi sistem dan laporan berkala. Password harus diganti secara rutin.
              </p>
              
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 italic font-medium">
                <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="size-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Role</p>
                  <p className="text-[11px] font-black text-slate-900 mt-1 uppercase tracking-tight">{profile.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </CardContent>
            <div className="absolute -right-8 -bottom-8 size-32 bg-primary/5 rounded-full blur-2xl"></div>
          </Card>

          <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex gap-4">
            <div className="size-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shrink-0 shadow-sm border border-rose-200/50">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900 uppercase tracking-tight mb-1 font-headline">Keamanan Lapisan Ganda</h4>
              <p className="text-[10px] text-rose-700/80 leading-relaxed font-bold uppercase">
                Admin dilarang memberikan akses email dan password kepada pihak lain di luar administrator resmi.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Email Update Form */}
          <Card>
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm text-primary">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Alamat Email</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Kontak Utama Administrator</p>
                </div>
              </div>
            </div>
            <CardContent>
              <form onSubmit={handleUpdateEmail} className="space-y-6">
                <Input 
                  label="Email Pengguna"
                  icon={Mail}
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="nama@bku.ac.id" 
                  required
                />
                <div className="flex justify-end">
                  <CustomButton type="submit" loading={submitting} icon={Save}>
                    Simpan Perubahan
                  </CustomButton>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Change Form */}
          <Card>
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm text-primary">
                  <Lock className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Ganti Password</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Pembaruan Kode Keamanan</p>
                </div>
              </div>
            </div>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <Input 
                  label="Password Saat Ini"
                  icon={KeyRound}
                  type="password" 
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                  placeholder="••••••••" 
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Password Baru"
                    icon={Lock}
                    type="password" 
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    placeholder="Minimal 8 karakter" 
                    required
                    minLength={8}
                  />
                  <Input 
                    label="Konfirmasi Password"
                    icon={Lock}
                    type="password" 
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    placeholder="Ulangi password baru" 
                    required
                    minLength={8}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <CustomButton type="submit" variant="dark" loading={submitting} icon={Lock}>
                    Update Password
                  </CustomButton>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
