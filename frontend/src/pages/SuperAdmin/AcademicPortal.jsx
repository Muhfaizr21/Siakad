import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { Calendar, Settings, ShieldCheck, Info, ToggleLeft, ToggleRight, Upload, Zap } from 'lucide-react';

const AcademicPortal = () => {
    const [activeTab, setActiveTab] = useState('akademik');

    const tabs = [
        { id: 'akademik', label: 'Jadwal Akademik', icon: Calendar },
        { id: 'profil', label: 'Profil Kampus', icon: Settings },
        { id: 'keamanan', label: 'Keamanan & Sistem', icon: ShieldCheck },
        { id: 'integrasi', label: 'Koneksi API', icon: Zap },
    ];

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-sans select-none">
            <Sidebar />
            <main className="pl-72 flex flex-col min-h-screen w-full">
                <TopNavBar />
                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Settings className="size-6" /></div>
                                <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Konfigurasi Global</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Otoritas pusat untuk sinkronisasi fase universitas dan kontrol keadaan sistem.</p>
                            </div>
                        </div>
                        <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 transition-all">
                            Simpan Semua Perubahan
                        </button>
                    </div>

                    {/* Sub-Navigation Tabs */}
                    <div className="flex gap-3 border-b border-slate-200 pb-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-t-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all border-b-2 ${
                                    activeTab === tab.id
                                        ? 'bg-white text-primary border-primary shadow-sm'
                                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 border-transparent'
                                }`}
                            >
                                <tab.icon className="size-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content: Akademik */}
                    {activeTab === 'akademik' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-8 shadow-sm">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Kontrol Fase Akademik</h3>
                                <div className="space-y-4">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahun Ajaran Target</p>
                                            <p className="text-xl font-black text-primary font-headline leading-none mt-1">2024 / 2025</p>
                                        </div>
                                        <Calendar className="text-slate-200 size-8" />
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester Aktif</p>
                                            <p className="text-xl font-black text-primary font-headline leading-none mt-1 uppercase">Ganjil (Odd)</p>
                                        </div>
                                        <Settings className="text-slate-200 size-8" />
                                    </div>
                                </div>
                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] space-y-2">
                                    <div className="flex gap-2 items-center font-black text-xs text-blue-700 uppercase">
                                        <Info className="size-4" /> Status: Siap Eksekusi
                                    </div>
                                    <p className="text-xs text-blue-600 font-medium leading-relaxed">Pengubahan fase akan memicu kalkulasi ulang data untuk 12,000+ mahasiswa.</p>
                                </div>
                            </div>

                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-8 shadow-sm">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Otorisasi Keadaan Sistem</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900 uppercase font-headline leading-tight">Masa KRS War (Pendaftaran)</p>
                                            <p className="text-[10px] text-slate-400 font-bold">Tombol pendaftaran KRS menjadi aktif untuk seluruh mahasiswa.</p>
                                        </div>
                                        <ToggleRight className="size-10 text-emerald-500 shrink-0" />
                                    </div>
                                    <div className="h-[1px] bg-slate-100" />
                                    <div className="flex items-center justify-between opacity-40 cursor-not-allowed">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900 uppercase font-headline leading-tight">Periode Input Nilai (Dosen)</p>
                                            <p className="text-[10px] text-slate-400 font-bold">Fungsi saat ini terkunci berdasarkan kalender akademik.</p>
                                        </div>
                                        <ToggleLeft className="size-10 text-slate-300 shrink-0" />
                                    </div>
                                    <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-rose-700 uppercase tracking-widest font-headline leading-tight">Global Emergency Lockdown</p>
                                            <p className="text-[9px] text-rose-600 font-medium">Matikan seluruh sesi fakultas dan mahasiswa secara instan.</p>
                                        </div>
                                        <button className="px-6 py-2.5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-all shrink-0 ml-4">
                                            Eksekusi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Profil */}
                    {activeTab === 'profil' && (
                        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 space-y-8 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Identitas Institusi</h3>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Universitas</label>
                                        <input className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-900 font-bold outline-none focus:ring-2 ring-primary/20 transition-all" defaultValue="Universitas Bhakti Kencana" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Warna Tema Primer</label>
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-primary rounded-xl border border-slate-200"></div>
                                            <input className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-900 font-bold outline-none" defaultValue="#0056B3" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6 border-l border-slate-100 pl-10">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Aset Branding</h3>
                                    <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                                        <Upload className="size-8 mb-2 group-hover:text-primary transition-colors" />
                                        <p className="text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">Unggah Logo Resmi (.PNG)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'keamanan' && (
                        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                            <ShieldCheck className="size-16 text-slate-200 mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Modul Konfigurasi Keamanan Lanjutan Sedang Disiapkan</p>
                        </div>
                    )}

                    {activeTab === 'integrasi' && (
                        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                            <Zap className="size-16 text-slate-200 mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Modul Koneksi API Belum Dikonfigurasi</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AcademicPortal;
