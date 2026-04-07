"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Button } from '../components/button';

const mabaData = [
  { nim: "230001", name: "Siti Aminah", jalur: "SNMPTN", asal: "SMAN 1 Jakarta", statusRegistrasi: "Lengkap" },
  { nim: "230002", name: "Agus Setiawan", jalur: "SBMPTN", asal: "SMAN 3 Bandung", statusRegistrasi: "Proses" },
  { nim: "230003", name: "Linda Permata", jalur: "Mandiri", asal: "SMAK Penabur", statusRegistrasi: "Lengkap" },
];

export default function FacultyMahasiswaBaru() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold font-headline tracking-tight uppercase mb-1">Mahasiswa Baru</h1>
              <p className="text-on-surface-variant font-medium">Monitoring pendaftaran dan daftar ulang (registrasi) mahasiswa baru.</p>
            </div>
            <Button className="bg-primary hover:bg-primary-fixed text-white rounded-xl shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-[10px] px-6 h-10 flex items-center gap-2">
               <span className="material-symbols-outlined text-[16px]">file_download</span>
               Export Data Maba
            </Button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl overflow-hidden shadow-sm">
             <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
                <h3 className="font-bold text-lg font-headline text-on-surface flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary">escalator_warning</span>
                   Daftar Antrian Registrasi
                </h3>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-on-surface">
                   <thead className="bg-surface-container/50 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                      <tr>
                         <th className="px-6 py-4">Mahasiswa & NIM Sementara</th>
                         <th className="px-6 py-4">Jalur Masuk</th>
                         <th className="px-6 py-4">Asal Sekolah</th>
                         <th className="px-6 py-4 text-center">Status Registrasi</th>
                         <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-outline-variant/10 font-medium">
                      {mabaData.map((item, i) => (
                         <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                                     {item.name.charAt(0)}
                                  </div>
                                  <div>
                                     <span className="block font-bold text-on-surface">{item.name}</span>
                                     <span className="text-xs text-on-surface-variant font-mono">{item.nim}</span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="font-bold text-on-surface-variant">{item.jalur}</span>
                            </td>
                            <td className="px-6 py-4">
                               <span className="font-bold text-on-surface">{item.asal}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                                 item.statusRegistrasi === 'Lengkap' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                               }`}>
                                  {item.statusRegistrasi}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <Button size="sm" className="rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-bold text-[10px] uppercase tracking-widest px-4 h-8">
                                  Verifikasi Dokuemen
                               </Button>
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
