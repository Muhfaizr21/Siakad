"use client"

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Button } from '../components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

export default function FacultyProposalApproval() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ status: '', adminNotes: '' });

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/faculty/ormawa/proposals');
      if (res.data.status === 'success') {
        setProposals(res.data.data);
      }
    } catch (error) {
      toast.error("Gagal mengambil data proposal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, status, notes = "") => {
    try {
      const res = await axios.put(`http://localhost:8000/api/faculty/ormawa/proposals/${id}`, {
        status: status,
        adminNotes: notes || form.adminNotes
      });
      if (res.data.status === 'success') {
        toast.success(`Proposal berhasil di-${status}`);
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Gagal memperbarui status");
    }
  };

  const openActionModal = (proposal) => {
    setSelectedProposal(proposal);
    setForm({ status: proposal.status, adminNotes: proposal.adminNotes || '' });
    setShowModal(true);
  };

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'disetujui': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'ditolak': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'revisi': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen font-sans">
      <Toaster />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 pb-12 px-4 lg:px-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Proposal ORMAWA</h1>
                <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Validasi dan setujui anggaran kegiatan organisasi mahasiswa tingkat fakultas.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest block">Total Proposal</span>
                  <span className="text-2xl font-black text-primary">{proposals.length}</span>
                </div>
              </div>
            </div>

           <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50 transition-all hover:shadow-2xl hover:shadow-slate-200/60">
             <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                    <TableHead className="px-8 py-6 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 w-[30%]">Kegiatan & Tanggal</TableHead>
                    <TableHead className="px-8 py-6 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400">Organisasi</TableHead>
                    <TableHead className="px-8 py-6 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400">Dana Diajukan</TableHead>
                    <TableHead className="px-8 py-6 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 text-center">Status</TableHead>
                    <TableHead className="px-8 py-6 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">Sedang memuat data...</TableCell></TableRow>
                  ) : proposals.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">Belum ada proposal yang masuk.</TableCell></TableRow>
                  ) : proposals.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/80 transition-all border-b border-slate-50">
                      <TableCell className="px-8 py-7">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-[15px] text-slate-800 leading-tight">{item.title}</span>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-7">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 self-start px-3 py-1 rounded-full">{item.ormawaName}</span>
                          <span className="text-[11px] font-medium text-slate-400">Oleh: {item.student?.nama || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-7">
                        <span className="font-bold text-emerald-600 tabular-nums text-[15px]">{formatIDR(item.budget)}</span>
                      </TableCell>
                      <TableCell className="px-8 py-7 text-center">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${getStatusBadge(item.status)}`}>
                           {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-8 py-7 text-right">
                        <button 
                          onClick={() => openActionModal(item)}
                          className="bg-slate-900 text-white text-[10px] font-bold px-6 py-3 rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 hover:bg-primary hover:shadow-primary/20 transition-all active:scale-95"
                        >
                          Detail & Aksi
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
           </div>
        </div>

        {/* Modal Aksi */}
        {showModal && selectedProposal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{selectedProposal.ormawaName}</span>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedProposal.title}</h2>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dana Diajukan</span>
                    <p className="text-xl font-bold text-emerald-600">{formatIDR(selectedProposal.budget)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dokumen Proposal</span>
                    <a href={selectedProposal.documentUrl} target="_blank" className="block text-primary font-bold text-sm underline hover:text-primary-fixed transition-all tracking-wide">Lihat Berkas PDF</a>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Catatan Persetujuan / Alasan Penolakan</label>
                    <textarea 
                      value={form.adminNotes}
                      onChange={(e) => setForm({...form, adminNotes: e.target.value})}
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all h-32 resize-none font-medium placeholder:text-slate-300"
                      placeholder="Masukkan catatan untuk ormawa..."
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-50 mt-4">
                  <button onClick={() => handleUpdateStatus(selectedProposal.id, 'disetujui')} className="flex-1 bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">Setujui</button>
                  <button onClick={() => handleUpdateStatus(selectedProposal.id, 'revisi')} className="flex-1 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Minta Revisi</button>
                  <button onClick={() => handleUpdateStatus(selectedProposal.id, 'ditolak')} className="flex-1 bg-rose-600 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-600/20 active:scale-95 transition-all">Tolak</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
