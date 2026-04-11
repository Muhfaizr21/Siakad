import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { Calendar, Settings, ShieldCheck, Info, ToggleLeft, ToggleRight, Upload, Zap, Loader2, Save } from 'lucide-react';
import api from '../../lib/axios';
import { toast, Toaster } from 'react-hot-toast';

const AcademicPortal = () => {
    const [activeTab, setActiveTab] = useState('akademik');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [settings, setSettings] = useState({
        TahunAkademik: '2024 / 2025',
        Semester: 'Ganjil',
        IsKRSOpen: false,
        IsNilaiOpen: false,
        IsMBKMOpen: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/academic-settings');
            if (res.data.status === 'success') {
                setSettings(res.data.data);
            }
        } catch (err) {
            toast.error('Gagal memuat konfigurasi akademik');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setSubmitting(true);
        try {
            const res = await api.put('/admin/academic-settings', settings);
            if (res.data.status === 'success') {
                toast.success('Konfigurasi berhasil disimpan');
            }
        } catch (err) {
            toast.error('Gagal menyimpan konfigurasi');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const tabs = [
        { id: 'akademik', label: 'Jadwal Akademik', icon: Calendar },
        { id: 'profil', label: 'Profil Kampus', icon: Settings },
        { id: 'keamanan', label: 'Keamanan & Sistem', icon: ShieldCheck },
        { id: 'integrasi', label: 'Koneksi API', icon: Zap },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="size-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-sans select-none">
            <Toaster position="top-right" />
            <Sidebar />
            <main className="pl-72 pt-20 flex flex-col min-h-screen w-full">
                <TopNavBar />
                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Settings className="size-6" /></div>
                                <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">Konfigurasi Global</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">SIAKAD Engine / Systems & Governance</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleUpdate}
                            disabled={submitting}
                            className="px-10 h-14 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-primary hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Commit Changes
                        </button>
                    </div>

                    {/* Sub-Navigation Tabs */}
                    <div className="flex gap-1.5 bg-slate-100/50 p-1.5 rounded-[2rem] w-fit">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 h-12 rounded-[1.5rem] flex items-center gap-2 font-black text-[9px] uppercase tracking-widest transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <tab.icon className={`size-3.5 ${activeTab === tab.id ? 'text-primary' : 'text-slate-300'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content: Akademik */}
                    {activeTab === 'akademik' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 space-y-8 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12"><Calendar className="size-40" /></div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Kontrol Fase Akademik</h3>
                                <div className="space-y-4">
                                    <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex justify-between items-center group transition-all hover:bg-white hover:shadow-md">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Tahun Akademik</p>
                                            <input 
                                                value={settings.TahunAkademik}
                                                onChange={(e) => setSettings({...settings, TahunAkademik: e.target.value})}
                                                className="text-xl font-black text-primary font-headline bg-transparent border-none outline-none p-0 w-40"
                                            />
                                        </div>
                                        <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-inner group-hover:text-primary transition-colors"><Calendar className="size-6" /></div>
                                    </div>
                                    <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex justify-between items-center group transition-all hover:bg-white hover:shadow-md">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Semester Aktif</p>
                                            <select 
                                                value={settings.Semester}
                                                onChange={(e) => setSettings({...settings, Semester: e.target.value})}
                                                className="text-xl font-black text-primary font-headline bg-transparent border-none outline-none p-0 cursor-pointer"
                                            >
                                                <option value="Ganjil">GANJIL (ODD)</option>
                                                <option value="Genap">GENAP (EVEN)</option>
                                                <option value="Antara">ANTARA (SUMMER)</option>
                                            </select>
                                        </div>
                                        <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-inner group-hover:text-primary transition-colors"><Zap className="size-6" /></div>
                                    </div>
                                </div>
                                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] space-y-2">
                                    <div className="flex gap-2 items-center font-black text-[10px] text-blue-700 uppercase tracking-widest">
                                        <Info className="size-4" /> System Governance Notice
                                    </div>
                                    <p className="text-[10px] text-blue-600/80 font-medium leading-relaxed uppercase tracking-tighter">Pengubahan fase akan memicu sinkronisasi data pada seluruh infrastruktur fakultas secara otomatis.</p>
                                </div>
                            </div>

                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 space-y-8 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12"><ShieldCheck className="size-40" /></div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Otorisasi Keadaan Sistem</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between group cursor-pointer transition-all p-4 hover:bg-slate-50 rounded-3xl" onClick={() => toggleSetting('IsKRSOpen')}>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900 uppercase font-headline leading-tight">Masa KRS War (Pendaftaran)</p>
                                            <p className="text-[10px] text-slate-400 font-bold">Izinkan seluruh mahasiswa melakukan pendaftaran mata kuliah.</p>
                                        </div>
                                        {settings.IsKRSOpen ? <ToggleRight className="size-10 text-emerald-500" /> : <ToggleLeft className="size-10 text-slate-200" />}
                                    </div>
                                    
                                    <div className="flex items-center justify-between group cursor-pointer transition-all p-4 hover:bg-slate-50 rounded-3xl" onClick={() => toggleSetting('IsNilaiOpen')}>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900 uppercase font-headline leading-tight">Periode Input Nilai (Dosen)</p>
                                            <p className="text-[10px] text-slate-400 font-bold">Buka akses penginputan nilai untuk seluruh koordinator MK.</p>
                                        </div>
                                        {settings.IsNilaiOpen ? <ToggleRight className="size-10 text-emerald-500" /> : <ToggleLeft className="size-10 text-slate-200" />}
                                    </div>

                                    <div className="flex items-center justify-between group cursor-pointer transition-all p-4 hover:bg-slate-50 rounded-3xl" onClick={() => toggleSetting('IsMBKMOpen')}>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900 uppercase font-headline leading-tight">Registrasi Modul MBKM</p>
                                            <p className="text-[10px] text-slate-400 font-bold">Aktifkan sinkronisasi pendaftaran program MBKM tingkat universitas.</p>
                                        </div>
                                        {settings.IsMBKMOpen ? <ToggleRight className="size-10 text-emerald-500" /> : <ToggleLeft className="size-10 text-slate-200" />}
                                    </div>

                                    <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-center justify-between mt-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-rose-700 uppercase tracking-widest font-headline leading-tight">Emergency Shutdown</p>
                                            <p className="text-[9px] text-rose-600/70 font-bold uppercase tracking-tighter">Matikan akses publik ke SI-Engine secara instan.</p>
                                        </div>
                                        <button className="px-8 h-10 bg-rose-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:scale-105 transition-all">
                                            EKSEKUSI
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Content: Profil */}
                    {activeTab === 'profil' && (
                        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 space-y-10 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-16 opacity-[0.03] rotate-12"><Settings className="size-60" /></div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                        <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><Settings className="size-5" /></div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Identitas Institusi</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Universitas Resmi Handle</label>
                                            <input className="w-full bg-slate-50/50 p-5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 ring-primary/5 transition-all" defaultValue="Universitas Bhakti Kencana" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Primary Brand Identity</label>
                                            <div className="flex gap-4">
                                                <div className="size-14 bg-primary rounded-2xl border-4 border-white shadow-xl shadow-primary/20 shrink-0"></div>
                                                <input className="flex-1 bg-slate-50/50 p-5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:bg-white transition-all uppercase" defaultValue="#0056B3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-8 border-l border-slate-100 pl-12">
                                    <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                        <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Upload className="size-5" /></div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Corporate Digital Assets</h3>
                                    </div>
                                    <div className="w-full h-56 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group shadow-inner relative overflow-hidden">
                                        <div className="absolute inset-0 bg-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Upload className="size-10 mb-3 group-hover:text-primary transition-all group-hover:-translate-y-1" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors mb-1">Update Brandmark (.PNG)</p>
                                        <p className="text-[8px] font-medium opacity-50 uppercase tracking-widest">Max file: 2MB | 1024x1024 px</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'keamanan' && (
                        <div className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
                            <div className="size-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                                <ShieldCheck className="size-10 text-slate-200" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-headline mb-4">Security Node Maintenance</h2>
                            <div className="h-1.5 w-48 bg-slate-100 rounded-full overflow-hidden mb-6">
                                <div className="h-full w-2/3 bg-primary rounded-full animate-pulse" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 max-w-sm leading-relaxed">System core is currently undergoing cryptographic upgrades. This module will be available shortly.</p>
                        </div>
                    )}

                    {activeTab === 'integrasi' && (
                        <div className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
                            <div className="size-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-indigo-100 shadow-inner">
                                <Zap className="size-10 text-indigo-300" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-headline mb-4">Integrations Hub Gateway</h2>
                            <div className="h-1.5 w-48 bg-indigo-100/50 rounded-full overflow-hidden mb-6">
                                <div className="h-full w-1/3 bg-indigo-500 rounded-full animate-pulse" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200 max-w-sm leading-relaxed">Discovery of upstream API endpoints in progress. Standby for initialization.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AcademicPortal;
