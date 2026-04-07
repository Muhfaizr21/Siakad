"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Button } from '../components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';

const aspirasiData = [
  { id: 1, ormawa: "BEM Fakultas", ketum: "Alvin Jonathan", topik: "Permohonan Sekretariat Baru", tanggal: "2024-04-05", status: "Proses" },
  { id: 2, ormawa: "DPM Fakultas", ketum: "Bella Safitra", topik: "Evaluasi Pelayanan Akademik", tanggal: "2024-04-03", status: "Selesai" },
  { id: 3, ormawa: "HIMA Informatika", ketum: "Caca Maheswari", topik: "Dukungan Dana Lomba Nasional", tanggal: "2024-04-06", status: "Klarifikasi" },
];

export default function FacultyOrmawaAspirasi() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-on-surface font-headline uppercase leading-tight">Aspirasi Organisasi</h1>
              <p className="text-on-surface-variant text-sm mt-1">Tampung dan tindak lanjuti aspirasi serta keluhan dari ORMAWA Fakultas.</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fcfcfd] hover:bg-[#fcfcfd] border-b border-outline-variant/5">
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">ORMAWA & Ketua</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Topik Aspirasi</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Tanggal</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Status</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aspirasiData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
                    <TableCell className="px-8 py-6">
                      <span className="block font-medium text-[14px] text-on-surface mb-0.5">{item.ormawa}</span>
                      <span className="text-[11px] font-medium text-on-surface-variant opacity-70 uppercase tracking-widest">{item.ketum}</span>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <span className="text-[14px] font-medium text-on-surface line-clamp-1">{item.topik}</span>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <span className="text-[13px] font-medium text-on-surface-variant">{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-center">
                      <span className={`px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${
                        item.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        item.status === 'Proses' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                         {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5">
                          <span className="material-symbols-outlined text-[18px]">forum</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  )
}
