import React, { useState, useEffect } from 'react';
import { 
    User, Mail, KeyRound, Save, Loader2, 
    ShieldCheck, Bell, Activity, Clock, ShieldAlert,
    ChevronRight, Camera, UserCircle2
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import api from '../../lib/axios';
import { toast, Toaster } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';

const AdminProfile = () => {
    const { user: authUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [profile, setProfile] = useState({ Email: '' });
    const [passwords, setPasswords] = useState({
        OldPassword: '',
        NewPassword: '',
        ConfirmPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/admin/profile');
                if (res.data.status === 'success') {
                    setProfile(res.data.data);
                }
            } catch (err) {
                toast.error('Gagal memuat profil admin');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.put('/admin/profile', { Email: profile.Email });
            if (res.data.status === 'success') {
                toast.success('Profil berhasil diperbarui');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.NewPassword !== passwords.ConfirmPassword) {
            toast.error('Konfirmasi password baru tidak cocok');
            return;
        }
        setSubmitting(true);
        try {
            const res = await api.put('/admin/profile', {
                OldPassword: passwords.OldPassword,
                NewPassword: passwords.NewPassword
            });
            if (res.data.status === 'success') {
                toast.success('Password berhasil diperbarui');
                setPasswords({ OldPassword: '', NewPassword: '', ConfirmPassword: '' });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui password');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="size-10 text-[#00236f] animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-sans select-none">
            <Toaster position="top-right" />
            <Sidebar />
            <main className="pl-72 pt-20 flex flex-col min-h-screen w-full">
                <TopNavBar />
                
                <div className="p-8 lg:p-12 space-y-10 max-w-6xl mx-auto w-full">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="hover:text-[#00236f] transition-colors cursor-pointer">Super Admin Hub</span>
                        <ChevronRight className="size-3" />
                        <span className="text-slate-900">Administrator Profile</span>
                    </div>

                    {/* Header Card */}
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 transition-transform duration-700 hover:rotate-0">
                            <ShieldCheck className="size-48" />
                        </div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            <div className="relative group">
                                <div className="size-28 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-[#00236f] flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white/10 group-hover:scale-105 transition-all duration-500">
                                    {profile.Email?.[0]?.toUpperCase() || <UserCircle2 className="size-12" />}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2 bg-white text-[#00236f] rounded-xl shadow-lg hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                                    <Camera className="size-4" />
                                </button>
                            </div>
                            
                            <div className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                        <h1 className="text-3xl font-black font-headline tracking-tighter uppercase">{profile.Email?.split('@')[0] || 'Super Administrator'}</h1>
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/20 backdrop-blur-sm">Root Authority</span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium tracking-tight flex items-center justify-center md:justify-start gap-2">
                                        <Mail className="size-4 opacity-50" /> {profile.Email}
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-center md:justify-start gap-6 border-t border-white/10 pt-4 mt-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Session Active</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-3 text-slate-400" />
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Registered {new Date(profile.CreatedAt).getFullYear()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Forms */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* General Settings */}
                            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
                                <form onSubmit={handleUpdateProfile} className="p-10 space-y-8">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-primary/5 rounded-xl text-primary"><User className="size-5" /></div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Identity Configuration</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Pengaturan Informasi Dasar Akun Admin</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2.5">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Administrative Email</label>
                                            <div className="relative flex items-center">
                                                <Mail className="absolute left-5 size-4 text-slate-300" />
                                                <input 
                                                    type="email" 
                                                    value={profile.Email}
                                                    onChange={(e) => setProfile({...profile, Email: e.target.value})}
                                                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            disabled={submitting}
                                            className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-primary hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                            Simpan Perubahan Identitas
                                        </button>
                                    </div>
                                </form>
                            </section>

                            {/* Security Settings */}
                            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
                                <form onSubmit={handleChangePassword} className="p-10 space-y-8">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600"><ShieldAlert className="size-5" /></div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Security Protocol Override</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Perbarui Kredensial Akses Root</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2 space-y-2.5">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Access Key</label>
                                            <div className="relative flex items-center">
                                                <KeyRound className="absolute left-5 size-4 text-slate-300" />
                                                <input 
                                                    type="password" 
                                                    value={passwords.OldPassword}
                                                    onChange={(e) => setPasswords({...passwords, OldPassword: e.target.value})}
                                                    placeholder="Input current password"
                                                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white transition-all outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 text-primary">New Access Key</label>
                                            <div className="relative flex items-center">
                                                <KeyRound className="absolute left-5 size-4 text-primary opacity-30" />
                                                <input 
                                                    type="password" 
                                                    value={passwords.NewPassword}
                                                    onChange={(e) => setPasswords({...passwords, NewPassword: e.target.value})}
                                                    placeholder="Strong security expected"
                                                    className="w-full h-14 pl-14 pr-6 bg-primary/5 border border-primary/10 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white transition-all outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm Access Key</label>
                                            <div className="relative flex items-center">
                                                <KeyRound className="absolute left-5 size-4 text-slate-300" />
                                                <input 
                                                    type="password" 
                                                    value={passwords.ConfirmPassword}
                                                    onChange={(e) => setPasswords({...passwords, ConfirmPassword: e.target.value})}
                                                    placeholder="Confirm new key"
                                                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white transition-all outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            disabled={submitting}
                                            className="w-full h-14 bg-rose-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 hover:bg-rose-500 hover:shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            {submitting ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                                            Update Security Credential
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </div>

                        {/* Right Column: Mini Stats */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-headline border-b border-slate-50 pb-4">Audit Transparency</h4>
                                
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="size-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Activity className="size-5" /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 uppercase">Recent Activity</p>
                                            <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-tight leading-none italic">Updated Global RBAC</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">{new Date().toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="size-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0"><Bell className="size-5" /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 uppercase">System Alerts</p>
                                            <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-tight leading-none italic">0 Unguarded Nodes</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">Status: Optimal</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#00236f] to-indigo-700 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-500/20 text-white overflow-hidden relative group">
                                <div className="absolute -bottom-8 -right-8 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <ShieldCheck className="size-32" />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] font-headline mb-4">Node Security</h4>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase text-white/70">Master Cryptography</span>
                                        <span className="text-xs font-black">256-bit AES</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-[95%] h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                    </div>
                                    <p className="text-[9px] font-medium text-white/50 italic">Last verified by System Core @ 15:44 UTC</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminProfile;
