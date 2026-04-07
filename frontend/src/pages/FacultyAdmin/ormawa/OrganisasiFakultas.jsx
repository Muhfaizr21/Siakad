"use client"

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Button } from '../components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

export default function FacultyOrganisasi() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({ orgCode: '', name: '', leaderName: '', memberCount: 0, status: 'Aktif' });

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/faculty/organizations');
      if (res.data.status === 'success') {
        setOrganizations(res.data.data);
      }
    } catch (error) {
      toast.error("Gagal mengambil data organisasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrg) {
        await axios.put(`http://localhost:8000/api/faculty/organizations/${editingOrg.id}`, formData);
        toast.success("Organisasi diperbarui");
      } else {
        await axios.post('http://localhost:8000/api/faculty/organizations', formData);
        toast.success("Organisasi ditambahkan");
      }
      setShowModal(false);
      setEditingOrg(null);
      setFormData({ orgCode: '', name: '', leaderName: '', memberCount: 0, status: 'Aktif' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus organisasi ini?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/faculty/organizations/${id}`);
      toast.success("Organisasi dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus");
    }
  };

  const openEdit = (org) => {
    setEditingOrg(org);
    setFormData({
        orgCode: org.orgCode,
        name: org.name,
        leaderName: org.leaderName,
        memberCount: org.memberCount,
        status: org.status
    });
    setShowModal(true);
  };

  return (
    <div className="bg-[#fcfdfe] text-slate-900 min-h-screen font-sans">
      <Toaster />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-12 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 font-headline">Organisasi Fakultas</h1>
              <p className="text-slate-500 text-sm mt-2 font-medium">Manajemen data organisasi kemahasiswaan tingkat Fakultas.</p>
            </div>
            <button 
              onClick={() => { setEditingOrg(null); setFormData({ orgCode: '', name: '', leaderName: '', memberCount: 0, status: 'Aktif' }); setShowModal(true); }}
              className="rounded-2xl px-8 py-4 gap-3 bg-primary hover:bg-primary-fixed text-white shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all flex items-center font-bold text-xs uppercase tracking-widest"
            >
               <span className="material-symbols-outlined text-[20px]">add_circle</span>
               Tambah ORMAWA
            </button>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                  <TableHead className="px-10 py-6 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400">Kode & Organisasi</TableHead>
                  <TableHead className="px-10 py-6 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400">Ketua Umum</TableHead>
                  <TableHead className="px-10 py-6 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 text-center">Jml Anggota</TableHead>
                  <TableHead className="px-10 py-6 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 text-center">Status</TableHead>
                  <TableHead className="px-10 py-6 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">Memuat data organisasi...</TableCell></TableRow>
                ) : organizations.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">Belum ada organisasi terdaftar.</TableCell></TableRow>
                ) : organizations.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-all border-b border-slate-50/50">
                    <TableCell className="px-10 py-8">
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/60 mb-1.5 block">{item.orgCode}</span>
                      <span className="block font-bold text-[15px] text-slate-800 tracking-tight">{item.name}</span>
                    </TableCell>
                    <TableCell className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shadow-inner">
                          {item.leaderName?.charAt(0)}
                        </div>
                        <span className="font-bold text-[14px] text-slate-700">{item.leaderName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-10 py-8 text-center text-primary">
                      <span className="font-black text-lg">{item.memberCount}</span>
                      <span className="text-[10px] text-slate-400 ml-1 font-bold uppercase">Orang</span>
                    </TableCell>
                    <TableCell className="px-10 py-8 text-center">
                      <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        item.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-600/5' : 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-600/5'
                      }`}>
                         {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEdit(item)} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-primary hover:text-white transition-all active:scale-95">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 border border-rose-100">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[3.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
              <form onSubmit={handleSubmit} className="p-12 space-y-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingOrg ? 'Edit ORMAWA' : 'Tambah ORMAWA Baru'}</h2>
                  <button type="button" onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Kode Org</label>
                       <input value={formData.orgCode} onChange={(e) => setFormData({...formData, orgCode: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all" placeholder="ORG-001" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                       <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                          <option value="Aktif">Aktif</option>
                          <option value="Pembekuan">Pembekuan</option>
                       </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Organisasi</label>
                     <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all" placeholder="Contoh: BEM Fakultas Teknik" required />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ketua Umum</label>
                     <input value={formData.leaderName} onChange={(e) => setFormData({...formData, leaderName: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all" placeholder="Nama Lengkap Ketua" required />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Anggota</label>
                     <input type="number" value={formData.memberCount} onChange={(e) => setFormData({...formData, memberCount: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all" required />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-primary shadow-xl shadow-slate-900/10 hover:shadow-primary/20 transition-all active:scale-95">Simpan Data</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-slate-100 transition-all">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
