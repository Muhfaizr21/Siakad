"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/card';
import { Button } from '../components/button';

const counselingData = [
  { id: 1, student: "Andi Wijaya", nim: "2024001", type: "Akademik", date: "2024-04-10", time: "09:00", status: "pending", counselor: "-" },
  { id: 2, student: "Budi Setiawan", nim: "2024002", type: "Karir", date: "2024-04-11", time: "11:00", status: "scheduled", counselor: "Dr. Hamzah" },
  { id: 3, student: "Siti Nurjanah", nim: "2024005", type: "Masalah Pribadi", date: "2024-04-12", time: "14:00", status: "scheduled", counselor: "Dra. Elly" },
];

export default function FacultyKonseling() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 pb-12 px-4 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                 <h1 className="text-3xl font-bold font-headline tracking-tight uppercase">Manajemen Konseling</h1>
                 <p className="text-on-surface-variant font-medium">Kelola antrian permintaan dan jadwal konseling mahasiswa fakultas.</p>
              </div>
              <div className="flex bg-surface-container-high p-1 rounded-2xl border border-outline-variant/10">
                 {['all', 'pending', 'scheduled'].map(t => (
                    <button 
                       key={t}
                       onClick={() => setActiveTab(t)}
                       className={`px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === t ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                       {t === 'all' ? 'Semua' : t === 'pending' ? 'Antrian' : 'Terjadwal'}
                    </button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-4">
                <div className="bg-white border border-outline-variant/10 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                   <div className="p-8 border-b border-outline-variant/5 flex justify-between items-center bg-white">
                      <div>
                         <h3 className="font-bold text-xl font-headline text-on-surface flex items-center gap-3">
                         <span className="material-symbols-outlined text-primary text-[28px]">support_agent</span>
                         Daftar Sesi Konseling
                         </h3>
                      </div>
                   </div>
                   
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-on-surface">
                         <thead className="bg-[#fcfcfd] border-b border-outline-variant/5 text-[10px] uppercase text-on-surface-variant font-bold tracking-[0.15em]">
                            <tr>
                               <th className="px-8 py-5">Mahasiswa</th>
                               <th className="px-8 py-5">Kategori</th>
                               <th className="px-8 py-5">Jadwal Sesi</th>
                               <th className="px-8 py-5">Status</th>
                               <th className="px-8 py-5 text-right w-[120px]">Aksi</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-outline-variant/5 font-medium bg-white text-[13px]">
                            {counselingData.filter(d => activeTab === 'all' || d.status === activeTab).map((item) => (
                               <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-8 py-6">
                                     <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                           {item.student.charAt(0)}
                                        </div>
                                        <div>
                                           <span className="font-bold text-on-surface block leading-tight">{item.student}</span>
                                           <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{item.nim}</span>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6">
                                     <span className="text-[9px] font-bold tracking-widest text-[#00236f] bg-[#00236f]/10 px-2.5 py-1 rounded-sm uppercase inline-block">{item.type}</span>
                                  </td>
                                  <td className="px-8 py-6">
                                     <div className="font-bold text-on-surface">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                     <div className="text-[11px] text-primary font-bold">{item.time} WIB</div>
                                  </td>
                                  <td className="px-8 py-6">
                                     <span className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${item.status === 'scheduled' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {item.status === 'pending' ? 'ANTRIAN' : 'TERJADWAL'}
                                     </span>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                     <div className="flex justify-end gap-2">
                                        <button className="h-8 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-bold text-[10px] uppercase tracking-widest flex items-center justify-center">
                                           Detail
                                        </button>
                                        <button className="h-8 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors font-bold text-[10px] uppercase tracking-widest flex items-center justify-center text-nowrap">
                                           {item.status === 'pending' ? 'Jadwalkan' : 'Ubah'}
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

              {/* Sidebar: Mini Calendar & Stats */}
              <div className="space-y-6">
                 <Card>
                    <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-primary">Kalender Harian</CardTitle></CardHeader>
                    <CardContent>
                       <div className="p-4 bg-surface rounded-2xl border border-outline-variant/5 text-center">
                          <div className="text-4xl font-bold text-primary mb-1">10</div>
                          <div className="text-[10px] font-bold uppercase text-on-surface-variant tracking-[0.3em]">APRIL 2024</div>
                          <div className="mt-6 space-y-3">
                             <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-blue-700">09:00 WIB</span>
                                <span className="text-[10px] font-bold text-blue-800 uppercase">Sesi 1</span>
                             </div>
                             <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center opacity-60">
                                <span className="text-xs font-bold text-emerald-700">11:00 WIB</span>
                                <span className="text-[10px] font-bold text-emerald-800 uppercase">Kosong</span>
                             </div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
                 
                 <Card className="bg-primary text-white">
                    <CardContent className="p-6">
                       <h3 className="text-lg font-bold mb-2">Butuh Bantuan?</h3>
                       <p className="text-white/70 text-xs mb-6">Jangan lupa konfirmasi penjadwalan via email agar mahasiswa menerima notifikasi otomatis.</p>
                       <Button className="w-full bg-white text-primary font-bold py-4 rounded-[1.5rem] text-[10px] uppercase tracking-widest">Kirim Notifikasi</Button>
                    </CardContent>
                 </Card>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
