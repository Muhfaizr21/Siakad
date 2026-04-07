"use client"

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { Card } from './components/card';
import { Button } from './components/button';

const FacultyAspirationManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock Data
  const aspirations = [
    { id: 1, student: "Andi", title: "AC Ruang 301 Mati", description: "Sudah 1 minggu AC di ruang 301 mati, mohon segera diperbaiki karena sangat panas.", status: "proses", category: "Fasilitas", date: "2024-04-01" },
    { id: 2, student: "Budi", title: "Klarifikasi Nilai", description: "Saya ingin menanyakan terkait nilai UAS Basis Data yang belum keluar.", status: "klarifikasi", category: "Akademik", date: "2024-04-02" },
    { id: 3, student: "Siti", title: "Peminjaman Aula", description: "Izin meminjam aula fakultas untuk kegiatan donor darah.", status: "selesai", category: "Kegiatan", date: "2024-03-28", response: "Aula sudah dibooking untuk tanggal tersebut." },
  ];

  const filteredAspirations = activeTab === 'all' 
    ? aspirations 
    : aspirations.filter(a => a.status === activeTab);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <h1 className="text-3xl font-bold font-headline uppercase">Kelola Tiket Aspirasi</h1>
              <p className="text-on-surface-variant font-medium">Monitoring dan tindak lanjut aspirasi mahasiswa fakultas.</p>
            </div>

            <div className="flex bg-surface-container-high p-1.5 rounded-[1.5rem] border border-outline-variant/10 shadow-sm overflow-x-auto no-scrollbar">
              {['all', 'proses', 'klarifikasi', 'selesai'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-6 py-2.5 rounded-[1.2rem] text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {t === 'all' ? 'Semua' : t === 'proses' ? 'Diproses' : t === 'klarifikasi' ? 'Klarifikasi' : 'Selesai'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-outline-variant/10 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="p-8 border-b border-outline-variant/5 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-xl font-headline text-on-surface flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[28px]">record_voice_over</span>
                  Antrian Tiket Aspirasi
                </h3>
                <p className="text-sm font-medium text-on-surface-variant mt-1">Daftar keluhan dan masukan dari mahasiswa</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-on-surface">
                <thead className="bg-[#fcfcfd] border-b border-outline-variant/5 text-[10px] uppercase text-on-surface-variant font-bold tracking-[0.15em]">
                  <tr>
                    <th className="px-8 py-5">Tiket & Tanggal</th>
                    <th className="px-8 py-5">Mahasiswa</th>
                    <th className="px-8 py-5 w-[30%]">Topik & Detail</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right w-[150px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5 font-medium bg-white text-[13px]">
                  {filteredAspirations.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-mono text-xs font-bold text-on-surface-variant uppercase tracking-widest">#{item.id}024</div>
                        <div className="text-[11px] font-bold text-on-surface-variant/60 mt-1">{item.date}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {item.student.charAt(0)}
                          </div>
                          <span className="font-bold text-on-surface">{item.student}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="mb-2">
                           <span className="text-[9px] font-bold tracking-widest text-[#00236f] bg-[#00236f]/10 px-2.5 py-1 rounded-sm uppercase inline-block mb-1">{item.category}</span>
                           <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{item.title}</h4>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-1">{item.description}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                          item.status === 'proses' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          item.status === 'klarifikasi' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {item.status === 'proses' ? 'DIPROSES' : item.status === 'klarifikasi' ? 'KLARIFIKASI' : 'SELESAI'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setSelectedItem(item); setShowModal(true); }} className="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface flex items-center justify-center" title="Update Status">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button className="w-8 h-8 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center" title="Hubungi Mahasiswa">
                            <span className="material-symbols-outlined text-[16px]">forum</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Status Update */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
             <Card className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                <h2 className="text-2xl font-bold text-on-surface mb-2 uppercase tracking-tight">Update Progres</h2>
                <p className="text-sm text-on-surface-variant mb-8">Pilih status terbaru untuk tiket ini.</p>
                
                <div className="space-y-3 mb-10">
                   {[
                      { id: 'proses', label: 'SEDANG DIPROSES', desc: 'Tim sedang mengecek keluhan.', color: 'text-blue-600 bg-blue-50' },
                      { id: 'klarifikasi', label: 'PERLU KLARIFIKASI', desc: 'Butuh info tambahan dari mhs.', color: 'text-amber-600 bg-amber-50' },
                      { id: 'selesai', label: 'SELESAI', desc: 'Masalah sudah tuntas.', color: 'text-emerald-600 bg-emerald-50' },
                   ].map(s => (
                      <button 
                         key={s.id}
                         onClick={() => setShowModal(false)}
                         className={`w-full text-left p-5 rounded-2xl border border-outline-variant/10 hover:border-primary transition-all flex items-center gap-4 ${s.color}`}
                      >
                         <span className="material-symbols-outlined">{s.id === 'selesai' ? 'check_circle' : s.id === 'proses' ? 'sync' : 'help'}</span>
                         <div>
                            <p className="text-[11px] font-bold tracking-widest">{s.label}</p>
                            <p className="text-[10px] opacity-70 font-medium">{s.desc}</p>
                         </div>
                      </button>
                   ))}
                </div>
                
                <Button variant="outline" className="w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest" onClick={() => setShowModal(false)}>BATAL</Button>
             </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyAspirationManagement;
