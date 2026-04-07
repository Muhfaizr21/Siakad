import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const AcademicPortal = () => {
    const [activeTab, setActiveTab] = useState('akademik');

    const tabs = [
        { id: 'akademik', label: 'Jadwal Akademik', icon: 'calendar_month' },
        { id: 'profil', label: 'Profil Kampus', icon: 'domain' },
        { id: 'keamanan', label: 'Keamanan & Sistem', icon: 'shield_lock' },
        { id: 'integrasi', label: 'Koneksi API', icon: 'hub' },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8 ">
              <header className="flex justify-between items-end ">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase  tracking-widest leading-none">Konfigurasi Global</h1>
                  <p className="text-secondary mt-2 font-medium ">Otoritas pusat untuk sinkronisasi fase universitas dan kontrol keadaan sistem.</p>
                </div>
                <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all  leading-tight">
                    Simpan Semua Perubahan
                </button>
              </header>

              {/* Sub-Navigation Tabs */}
              <div className="flex gap-4 border-b border-outline-variant/30 pb-4 ">
                  {tabs.map((tab) => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-3 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${
                            activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'bg-white border border-outline-variant/30 text-secondary hover:bg-surface-container'
                        }`}
                      >
                          <span className="material-symbols-outlined text-[18px] ">{tab.icon}</span>
                          {tab.label}
                      </button>
                  ))}
              </div>

              {/* Tab Content: Akademik (Time-Gate) */}
              {activeTab === 'akademik' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
                    <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-8 shadow-sm ">
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest  leading-tight">Kontrol Fase Akademik</h3>
                        <div className="space-y-6">
                            <div className="p-6 bg-surface-container-low/50 rounded-3xl border border-outline-variant/10 flex justify-between items-center ">
                                <div>
                                    <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest ">Tahun Ajaran Target</p>
                                    <p className="text-xl font-black text-primary  leading-none">2024 / 2025</p>
                                </div>
                                <span className="material-symbols-outlined text-secondary opacity-20 ">calendar_today</span>
                            </div>
                            <div className="p-6 bg-surface-container-low/50 rounded-3xl border border-outline-variant/10 flex justify-between items-center ">
                                <div>
                                    <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest ">Semester Aktif</p>
                                    <p className="text-xl font-black text-primary  leading-none uppercase">Ganjil (Odd)</p>
                                </div>
                                <span className="material-symbols-outlined text-secondary opacity-20 ">swap_vert</span>
                            </div>
                        </div>
                        <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] space-y-4 ">
                            <div className="flex gap-4  leading-tight uppercase font-black text-xs text-blue-700">
                                <span className="material-symbols-outlined ">info</span>
                                Status: Siap Eksekusi
                            </div>
                            <p className="text-xs text-blue-600 font-medium  opacity-80 leading-relaxed font-body">Pengubahan fase akan memicu kalkulasi ulang data untuk 12,000+ mahasiswa.</p>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-8 shadow-sm  text-bold">
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest  leading-tight ">Otorisasi Keadaan Sistem</h3>
                        <div className="space-y-8 ">
                            <div className="flex items-center justify-between group cursor-pointer ">
                                <div className="space-y-1 ">
                                    <p className="text-sm font-black text-primary uppercase  leading-tight ">Masa KRS War (Pendaftaran)</p>
                                    <p className="text-[10px] text-secondary font-medium  opacity-80">Tombol pendaftaran KRS menjadi aktif untuk seluruh mahasiswa.</p>
                                </div>
                                <div className="w-16 h-8 bg-emerald-500 rounded-full relative flex items-center px-1">
                                    <div className="w-6 h-6 bg-white rounded-full translate-x-8 transition-all"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between group cursor-not-allowed opacity-40 ">
                                <div className="space-y-1 ">
                                    <p className="text-sm font-black text-primary uppercase  leading-tight ">Periode Input Nilai (Dosen)</p>
                                    <p className="text-[10px] text-secondary font-medium  opacity-80">Fungsi saat ini terkunci berdasarkan kalender akademik.</p>
                                </div>
                                <div className="w-16 h-8 bg-slate-200 rounded-full relative flex items-center px-1">
                                    <div className="w-6 h-6 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-center justify-between ">
                                <div className="space-y-1 ">
                                    <p className="text-xs font-black text-rose-700 uppercase tracking-widest  font-headline leading-tight ">Global Emergency Lockdown</p>
                                    <p className="text-[9px] text-rose-600 font-medium  opacity-90  font-body">Matikan seluruh sesi fakultas dan mahasiswa secara instan.</p>
                                </div>
                                <button className="px-6 py-2 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20  leading-tight">Eksekusi</button>
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* Tab: Profil (Teaser for expansion) */}
              {activeTab === 'profil' && (
                  <div className="bg-white p-12 rounded-[3.5rem] border border-outline-variant/30 space-y-8  shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10  leading-tight">
                          <div className="space-y-6  leading-tight">
                              <h3 className="text-sm font-black text-primary uppercase tracking-widest  leading-tight  leading-tight">Identitas Institusi</h3>
                              <div className="space-y-4  leading-tight">
                                  <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em]  leading-tight">Nama Universitas</label>
                                  <input className="w-full bg-slate-50 p-4 rounded-2xl border border-outline-variant/10 text-primary font-bold  outline-none focus:border-primary" defaultValue="Universitas BKU Student Hub" />
                              </div>
                              <div className="space-y-4  leading-tight">
                                  <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em]  leading-tight">Warna Tema Primer</label>
                                  <div className="flex gap-4  leading-tight">
                                      <div className="w-12 h-12 bg-[#0056B3] rounded-xl border border-outline-variant/30"></div>
                                      <input className="flex-1 bg-slate-50 p-4 rounded-2xl border border-outline-variant/10 text-primary font-bold  outline-none" defaultValue="#0056B3" />
                                  </div>
                              </div>
                          </div>
                          <div className="space-y-6  leading-tight border-l border-outline-variant/30 pl-10  leading-tight">
                              <h3 className="text-sm font-black text-primary uppercase tracking-widest  leading-tight  leading-tight">Aset Branding</h3>
                              <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-outline-variant/30 rounded-[2.5rem] flex flex-col items-center justify-center text-secondary/40  leading-tight">
                                  <span className="material-symbols-outlined text-4xl  leading-tight">upload_file</span>
                                  <p className="text-[10px] font-black uppercase tracking-widest mt-4  leading-tight">Unggah Logo Resmi (.PNG)</p>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'keamanan' && (
                   <div className="bg-white p-12 rounded-[3.5rem] border border-outline-variant/30  shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                        <span className="material-symbols-outlined text-6xl text-secondary/10 ">security_update_good</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40 mt-6 ">Modul Konfigurasi Keamanan Lanjutan Sedang Disiapkan</p>
                   </div>
              )}
            </div>
          </main>
        </div>
    )
}

export default AcademicPortal;
