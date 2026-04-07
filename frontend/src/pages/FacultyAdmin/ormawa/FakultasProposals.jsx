"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Button } from '../components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';

const proposalData = [
  { id: 1, pemohon: "Panitia PKKMB Fakultas", title: "Anggaran PKKMB 2026", date: "2026-06-10", budget: "Rp 25.000.000", status: "diajukan" },
  { id: 2, pemohon: "Departemen Kemahasiswaan", title: "Lomba Esai Tingkat Nasional", date: "2026-07-15", budget: "Rp 15.000.000", status: "diajukan" },
];

export default function FacultyInternalProposals() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
             <div>
                <h1 className="text-2xl font-medium tracking-tight text-on-surface font-headline">Review Proposal Fakultas</h1>
                <p className="text-on-surface-variant text-sm mt-1">Tinjau pengajuan proposal kegiatan internal Fakultas (Bukan dari ORMAWA).</p>
             </div>
             <Button className="rounded-full px-6 gap-2 bg-primary hover:bg-primary-fixed text-white shadow-lg hover:-translate-y-1 transition-all">
                + Ajukan Proposal Internal
             </Button>
           </div>

           <div className="bg-white border border-outline-variant/10 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             <Table>
               <TableHeader>
                 <TableRow className="bg-[#fcfcfd] hover:bg-[#fcfcfd] border-b border-outline-variant/5">
                   <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant w-[35%]">Nama Kegiatan Internal</TableHead>
                   <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Pemohon</TableHead>
                   <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Anggaran</TableHead>
                   <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Status</TableHead>
                   <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Aksi</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {proposalData.map((item) => (
                   <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
                     <TableCell className="px-8 py-6">
                       <span className="block font-medium text-[14px] text-on-surface mb-1">{item.title}</span>
                       <span className="text-[11px] font-medium text-on-surface-variant opacity-70">Rencana: {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                     </TableCell>
                     <TableCell className="px-8 py-6">
                       <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-[0.1em] bg-[#f4f4f5] px-2.5 py-1 rounded">{item.pemohon}</span>
                     </TableCell>
                     <TableCell className="px-8 py-6">
                       <span className="font-medium text-emerald-600">{item.budget}</span>
                     </TableCell>
                     <TableCell className="px-8 py-6 text-center">
                       <span className="px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap bg-amber-50 text-amber-600 border border-amber-100">
                          {item.status}
                       </span>
                     </TableCell>
                     <TableCell className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="outline" size="sm" className="rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-medium text-[10px] uppercase tracking-widest h-8 px-4">Tolak</Button>
                         <Button size="sm" className="rounded-xl bg-primary text-white hover:bg-primary-fixed shadow-md shadow-primary/20 font-medium text-[10px] uppercase tracking-widest h-8 px-4">Setujui</Button>
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
