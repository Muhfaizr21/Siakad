"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Button } from '../components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';

export default function FacultyMbkm() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pengajuan');

  const mbkmData = [
    { id: 1, mhs: "Sarah Amalia", nim: "21055", program: "Kampus Mengajar", lokasi: "SDN 1 Cimahi", sks: 20, status: "pending" },
    { id: 2, mhs: "Kevin Sanjaya", nim: "21088", program: "Magang Bersertifikat", lokasi: "PT Telkom Indonesia", sks: 20, status: "aktif" },
    { id: 3, mhs: "Dian Sastro", nim: "21045", program: "Pertukaran Mahasiswa", lokasi: "Universitas Gadjah Mada", sks: 20, status: "selesai" },
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-on-surface font-headline">Manajemen MBKM</h1>
              <p className="text-on-surface-variant text-sm mt-1">Validasi program Merdeka Belajar Kampus Merdeka dan konversi SKS.</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-outline-variant/10 pb-4">
             {['pengajuan', 'aktif', 'konversi SKS'].map(tab => (
                <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-5 py-2 rounded-full text-xs font-medium uppercase tracking-wider ${activeTab === tab || (tab === 'konversi SKS' && activeTab === 'konversi') ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
                >
                   {tab}
                </button>
             ))}
          </div>

          <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fcfcfd] hover:bg-[#fcfcfd] border-b border-outline-variant/5">
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Mahasiswa</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant w-[35%]">Program & Instansi</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Konversi SKS</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Status</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mbkmData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
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
                      <span className="block font-medium text-[14px] text-on-surface mb-1">{item.program}</span>
                      <span className="text-[11px] font-medium text-on-surface-variant opacity-70 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">corporate_fare</span> {item.lokasi}</span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-center">
                      <span className="font-medium text-primary bg-primary/10 px-2.5 py-1 rounded">{item.sks} SKS</span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-center">
                      <span className={`px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${
                        item.status === 'aktif' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        item.status === 'selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                         {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <Button size="sm" className="rounded-xl bg-primary text-white hover:bg-primary-fixed shadow-md shadow-primary/20 font-medium text-[10px] uppercase tracking-widest px-4 h-8">
                         {item.status === 'pending' ? 'Validasi' : item.status === 'aktif' ? 'Logbook' : 'Input Nilai'}
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
