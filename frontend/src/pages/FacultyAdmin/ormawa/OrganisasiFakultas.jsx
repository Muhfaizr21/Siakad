"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Button } from '../components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';

const organisasiData = [
  { id: "ORG-001", name: "BEM Fakultas", ketum: "Alvin Jonathan", anggota: 45, status: "Aktif" },
  { id: "ORG-002", name: "DPM Fakultas", ketum: "Bella Safitra", anggota: 25, status: "Aktif" },
  { id: "ORG-003", name: "HIMA Informatika", ketum: "Caca Maheswari", anggota: 80, status: "Aktif" },
  { id: "ORG-004", name: "HIMA Sistem Informasi", ketum: "Dicky Fernando", anggota: 65, status: "Pembekuan" },
];

export default function FacultyOrganisasi() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-on-surface font-headline">Organisasi Fakultas</h1>
              <p className="text-on-surface-variant text-sm mt-1">Manajemen data organisasi kemahasiswaan (BEM, DPM, HIMA) tingkat Fakultas.</p>
            </div>
            <Button className="rounded-full px-6 gap-2 bg-primary hover:bg-primary-fixed text-white shadow-lg hover:-translate-y-1 transition-all">
               <span className="material-symbols-outlined text-[16px]">add_circle</span>
               Tambah ORMAWA
            </Button>
          </div>

          <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fcfcfd] hover:bg-[#fcfcfd] border-b border-outline-variant/5">
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Kode & Organisasi</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Ketua Umum</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Jml Anggota</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Status Rekognisi</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organisasiData.map((item, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
                    <TableCell className="px-8 py-6">
                      <span className="text-[10px] uppercase font-medium tracking-widest text-on-surface-variant/70 mb-0.5 block">{item.id}</span>
                      <span className="block font-medium text-[14px] text-on-surface">{item.name}</span>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center font-medium text-[10px] uppercase border border-primary/10">
                          {item.ketum.charAt(0)}
                        </div>
                        <span className="font-medium text-[13px] text-on-surface-variant">{item.ketum}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-center">
                      <span className="font-medium text-primary">{item.anggota}</span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-center">
                      <span className={`px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${
                        item.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                         {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <Button size="sm" className="rounded-xl bg-[#f4f4f5] text-on-surface hover:bg-outline-variant/20 transition-colors font-medium text-[10px] uppercase tracking-widest px-4 h-8">
                         Detail ORMAWA
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
