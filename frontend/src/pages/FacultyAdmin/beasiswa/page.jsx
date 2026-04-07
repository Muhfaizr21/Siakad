"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Button } from '../components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';

export default function FacultyBeasiswa() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const beasiswaData = [
    { nama: "Djarum Plus 2024", pendaftar: 45, kuota: 10, deadline: "15 Mei 2026", status: "Buka" },
    { nama: "KIP Kuliah Mandiri", pendaftar: 120, kuota: 50, deadline: "01 Jun 2026", status: "Buka" },
    { nama: "Beasiswa Prestasi Fakultas", pendaftar: 30, kuota: 5, deadline: "30 Apr 2026", status: "Tutup" }
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-on-surface font-headline">Program Beasiswa</h1>
              <p className="text-on-surface-variant text-sm mt-1">Kelola kuota, verifikasi pelamar, dan pantau penyaluran beasiswa mahasiswa.</p>
            </div>
            <Button className="rounded-full px-6 gap-2 bg-primary hover:bg-primary-fixed text-white shadow-lg hover:-translate-y-1 transition-all">
               <span className="material-symbols-outlined text-[16px]">add_circle</span>
               Tambah Program
            </Button>
          </div>

          <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fcfcfd] hover:bg-[#fcfcfd] border-b border-outline-variant/5">
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant w-[40%]">Nama Program & Deadline</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Pendaftar</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Kuota</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Status Pendaftaran</TableHead>
                  <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beasiswaData.map((item, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
                    <TableCell className="px-8 py-6">
                      <span className="block font-medium text-[14px] text-on-surface mb-1">{item.nama}</span>
                      <span className="text-[11px] font-medium text-on-surface-variant opacity-70 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        Ditutup: {item.deadline}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-center">
                      <span className="font-medium text-primary text-lg">{item.pendaftar}</span>
                      <span className="text-[10px] uppercase text-on-surface-variant/60 block tracking-widest font-medium">Orang</span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-center">
                      <span className="font-medium text-on-surface text-lg">{item.kuota}</span>
                      <span className="text-[10px] uppercase text-on-surface-variant/60 block tracking-widest font-medium">Orang</span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-center">
                      <span className={`px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${
                        item.status === 'Buka' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                         {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <Button size="sm" variant="outline" className="rounded-xl border-outline-variant/20 hover:bg-[#00236f]/10 transition-colors font-medium text-[10px] uppercase tracking-widest px-4 h-8 text-[#00236f]">
                         Lihat Pelamar
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
