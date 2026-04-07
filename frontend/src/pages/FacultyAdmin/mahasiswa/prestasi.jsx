"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';

const prestasiData = [
  { id: 1, student: "Andi Wijaya", nim: "2024001", title: "Juara 1 Lomba Coding Nasional", category: "Akademik", date: "2024-03-20", status: "pending", proof: "sertifikat_andi.pdf" },
  { id: 2, student: "Budi Setiawan", nim: "2024002", title: "Medali Emas Karate POMNAS", category: "Non-Akademik", date: "2024-03-15", status: "pending", proof: "sertifikat_budi.pdf" },
  { id: 3, student: "Citra Dewi", nim: "2024003", title: "Juara Harapan 3 Debat B. Inggris", category: "Akademik", date: "2024-03-10", status: "rejected", proof: "dokumen_citra.pdf" },
];

export default function FacultyPrestasi() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 pb-12 px-4 lg:px-8">
           <div className="mb-8">
              <h1 className="text-3xl font-bold font-headline tracking-tight uppercase">Verifikasi Prestasi</h1>
              <p className="text-on-surface-variant font-medium">Review dan verifikasi pencapaian mahasiswa untuk database resmi universitas.</p>
           </div>

           <div className="bg-white border border-outline-variant/10 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="p-8 border-b border-outline-variant/5 flex justify-between items-center bg-white">
                 <h3 className="font-bold text-xl font-headline text-on-surface flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary text-[28px]">workspace_premium</span>
                 Antrian Verifikasi Berkas Prestasi
                 </h3>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-on-surface">
                    <thead className="bg-[#fcfcfd] border-b border-outline-variant/5 text-[10px] uppercase text-on-surface-variant font-bold tracking-[0.15em]">
                       <tr>
                          <th className="px-8 py-5">Tanggal & Kategori</th>
                          <th className="px-8 py-5">Mahasiswa</th>
                          <th className="px-8 py-5 w-[30%]">Nama Prestasi</th>
                          <th className="px-8 py-5">Bukti File</th>
                          <th className="px-8 py-5 text-right w-[180px]">Status / Aksi</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5 font-medium bg-white text-[13px]">
                       {prestasiData.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="px-8 py-6">
                                <div className="text-[11px] font-bold text-on-surface-variant/80 mb-1.5 flex items-center gap-1.5">
                                   <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                   {item.date}
                                </div>
                                <span className="text-[9px] font-bold tracking-widest text-[#00236f] bg-[#00236f]/10 px-2.5 py-1 rounded-sm uppercase inline-block">{item.category}</span>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/10 text-primary flex items-center justify-center font-bold text-xs">
                                      {item.student.charAt(0)}
                                   </div>
                                   <div>
                                      <span className="font-bold text-on-surface block leading-tight">{item.student}</span>
                                      <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{item.nim}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{item.title}</h4>
                             </td>
                             <td className="px-8 py-6">
                                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/5 group/btn">
                                   <span className="material-symbols-outlined text-[16px] text-primary group-hover/btn:scale-110 transition-transform">picture_as_pdf</span>
                                   <span className="text-[10px] font-bold truncate max-w-[100px]">{item.proof}</span>
                                </button>
                             </td>
                             <td className="px-8 py-6 text-right">
                                {item.status === 'pending' ? (
                                   <div className="flex justify-end gap-2">
                                      <button className="h-8 px-4 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors font-bold text-[9px] uppercase tracking-widest border border-rose-100">
                                         Tolak
                                      </button>
                                      <button className="h-8 px-4 rounded-lg bg-primary text-white hover:bg-primary-fixed shadow-md shadow-primary/20 transition-colors font-bold text-[9px] uppercase tracking-widest">
                                         Setujui
                                      </button>
                                   </div>
                                ) : (
                                   <span className="px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border shadow-sm bg-rose-50 text-rose-600 border-rose-100">
                                      DITOLAK
                                   </span>
                                )}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
