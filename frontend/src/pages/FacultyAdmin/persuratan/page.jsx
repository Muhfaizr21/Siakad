"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Button } from '../components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';

export default function FacultyPersuratan() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pengajuan');

  const suratData = [
    { id: 'SRT-001', mhs: "John Doe", nim: "210001", jenis: "Surat Keterangan Aktif", tgl: "06 Apr 2026", status: "pending" },
    { id: 'SRT-002', mhs: "Jane Smith", nim: "210002", jenis: "Surat Izin Penelitian", tgl: "05 Apr 2026", status: "proses" },
    { id: 'SRT-003', mhs: "Budi Santoso", nim: "210003", jenis: "Surat Pengantar Magang", tgl: "04 Apr 2026", status: "selesai" }
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-on-surface font-headline">Layanan E-Persuratan</h1>
              <p className="text-on-surface-variant text-sm mt-1">Kelola pengajuan surat menyurat akademik mahasiswa (Aktif Kuliah, Izin Penelitian, dll).</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-outline-variant/10 pb-4">
             {['pengajuan', 'diproses', 'riwayat'].map(tab => (
                <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-5 py-2 rounded-full text-xs font-medium uppercase tracking-wider ${activeTab === tab ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
                >
                   {tab}
                </button>
             ))}
          </div>

          <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fcfcfd] hover:bg-[#fcfcfd] border-b border-outline-variant/5">
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Kode & Tanggal</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Mahasiswa</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant w-[35%]">Jenis Surat</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Status</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suratData.map((item, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
                    <TableCell className="px-8 py-6">
                      <span className="block font-medium text-[13px] text-on-surface-variant mb-1">{item.id}</span>
                      <span className="text-[11px] font-medium text-on-surface-variant opacity-70">{item.tgl}</span>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-medium text-xs uppercase border border-primary/10">
                          {item.mhs.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-medium text-[14px] text-on-surface leading-tight mb-1">{item.mhs}</span>
                          <span className="text-[11px] font-medium text-on-surface-variant opacity-70 font-mono">{item.nim}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <span className="block font-medium text-[14px] text-on-surface">{item.jenis}</span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-center">
                      <span className={`px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${
                        item.status === 'selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        item.status === 'proses' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                         {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <Button size="sm" className="rounded-xl bg-primary text-white hover:bg-primary-fixed shadow-md shadow-primary/20 font-medium text-[10px] uppercase tracking-widest px-6 h-8">
                         {item.status === 'pending' ? 'Verifikasi' : item.status === 'proses' ? 'Cetak Surat' : 'Lihat'}
                      </Button>
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
