"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Card, CardContent } from '../components/card';
import { Badge } from '../components/badge';
import { Button } from '../components/button';

export default function FacultyYudisium() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const yudisiumData = [
    { nim: "190001", name: "Ahmad Fauzi", prodi: "Teknik Informatika", ipk: "3.85", status: "Sudah Verifikasi", docStatus: "Lengkap" },
    { nim: "190002", name: "Rina Kumala", prodi: "Teknik Informatika", ipk: "3.70", status: "Belum Verifikasi", docStatus: "Revisi" },
    { nim: "190003", name: "Doni Pratama", prodi: "Sistem Informasi", ipk: "3.45", status: "Belum Verifikasi", docStatus: "Lengkap" }
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold font-headline tracking-tight uppercase mb-1">Pendaftaran Yudisium</h1>
            <p className="text-on-surface-variant font-medium">Validasi berkas prasyarat kelulusan mahasiswa sebelum diajukan ke SK Rektor.</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl overflow-hidden shadow-sm">
             <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
                <h3 className="font-bold text-lg font-headline text-on-surface flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary">school</span>
                   Daftar Pendaftar Yudisium
                </h3>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-on-surface">
                   <thead className="bg-surface-container/50 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                      <tr>
                         <th className="px-6 py-4">Mahasiswa & NIM</th>
                         <th className="px-6 py-4">Program Studi</th>
                         <th className="px-6 py-4 text-center">IPK</th>
                         <th className="px-6 py-4 text-center">Status Berkas</th>
                         <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-outline-variant/10 font-medium">
                      {yudisiumData.map((item, i) => (
                         <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs uppercase">
                                     {item.name.charAt(0)}
                                  </div>
                                  <div>
                                     <span className="block font-bold text-on-surface">{item.name}</span>
                                     <span className="text-xs text-on-surface-variant font-mono">{item.nim}</span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest bg-outline-variant/10 px-2 py-1 rounded">{item.prodi}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className="font-bold text-emerald-600 border border-emerald-100 bg-emerald-50 px-2 py-1 rounded">{item.ipk}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                                 item.docStatus === 'Lengkap' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                               }`}>
                                  {item.docStatus}
                               </span>
                               <div className="mt-1 text-[9px] uppercase tracking-widest text-on-surface-variant/60">{item.status}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <Button size="sm" className={`rounded-xl px-4 h-8 font-bold text-[10px] uppercase tracking-widest ${item.docStatus === 'Lengkap' ? 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-fixed' : 'bg-surface-container text-on-surface-variant hover:bg-outline-variant/20'}`}>
                                  {item.docStatus === 'Lengkap' ? 'Setujui' : 'Cek Berkas'}
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
