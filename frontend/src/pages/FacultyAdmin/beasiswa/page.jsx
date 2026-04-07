import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';
import { toast, Toaster } from 'react-hot-toast';

export default function FacultyScholarship() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('programs'); // programs, applications
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProgModal, setShowProgModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterScholarship, setFilterScholarship] = useState(null);
  
  const [progForm, setProgForm] = useState({
    name: '', provider: '', description: '', minGpa: 3.5, quota: 10, deadline: '', status: 'buka'
  });

  const [appForm, setAppForm] = useState({
    status: 'proses', notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'programs') {
        const res = await axios.get('http://localhost:8000/api/faculty/scholarships');
        setScholarships(res.data.data);
      } else {
        const res = await axios.get('http://localhost:8000/api/faculty/scholarships/applications');
        setApplications(res.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleProgSubmit = async () => {
    try {
      const url = progForm.id 
        ? `http://localhost:8000/api/faculty/scholarships/${progForm.id}`
        : 'http://localhost:8000/api/faculty/scholarships';
      const method = progForm.id ? 'put' : 'post';
      
      const res = await axios[method](url, progForm);
      if (res.data.status === 'success') {
        toast.success(progForm.id ? 'Beasiswa diperbarui' : 'Beasiswa dibuat');
        setShowProgModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleAppUpdate = async () => {
    try {
      // Ensure we have a valid ID
      if (!selectedItem || !selectedItem.id) {
        toast.error("ID Pendaftaran tidak valid");
        return;
      }
      const res = await axios.put(`http://localhost:8000/api/faculty/scholarships/applications/${selectedItem.id}`, appForm);
      if (res.data.status === 'success') {
        toast.success('Status pendaftaran berhasil diperbarui');
        setShowAppModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui status');
    }
  };

  const filteredApplications = filterScholarship 
    ? applications.filter(a => Number(a.scholarshipId) === Number(filterScholarship))
    : applications;

  return (
    <div className="bg-surface text-on-surface min-h-screen text-left">
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-left">
            <div className="text-left">
              <h1 className="text-3xl font-extrabold font-headline tracking-tight uppercase">Manajemen Beasiswa</h1>
              <p className="text-on-surface-variant font-medium italic">Kelola program bantuan biaya pendidikan dan seleksi penerima.</p>
            </div>
            {activeTab === 'programs' && (
              <Button 
                onClick={() => { setProgForm({name: '', provider: '', description: '', minGpa: 3.5, quota: 10, deadline: '', status: 'buka'}); setShowProgModal(true); }}
                className="bg-primary text-white rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Buat Program Baru
              </Button>
            )}
          </div>

          <div className="flex gap-4 border-b border-outline-variant/10 pb-4 justify-between items-center">
            <div className="flex gap-4">
              <button 
                onClick={() => { setActiveTab('programs'); setFilterScholarship(null); }}
                className={`text-xs font-bold uppercase tracking-[0.2em] pb-2 transition-all ${activeTab === 'programs' && !filterScholarship ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant opacity-60'}`}
              >
                Daftar Program
              </button>
              <button 
                onClick={() => { setActiveTab('applications'); setFilterScholarship(null); }}
                className={`text-xs font-bold uppercase tracking-[0.2em] pb-2 transition-all ${activeTab === 'applications' && !filterScholarship ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant opacity-60'}`}
              >
                Pendaftar Mahasiswa {filterScholarship && '(Filtered)'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fcfcfd]">
                  {activeTab === 'programs' ? (
                    <>
                      <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest">Nama Program</TableHead>
                      <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest">Provider</TableHead>
                      <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-center">Kuota</TableHead>
                      <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest">Deadline</TableHead>
                      <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                      <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-right">Aksi</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest">Mahasiswa</TableHead>
                      <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest">Program Beasiswa</TableHead>
                      <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-center">Dokumen</TableHead>
                      <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                      <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-right">Aksi</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan="6" className="py-20 text-center animate-pulse font-bold text-on-surface-variant uppercase tracking-widest text-[11px]">Memuat Data...</TableCell></TableRow>
                ) : activeTab === 'programs' ? (
                  scholarships.map(s => (
                    <TableRow key={s.id} className="hover:bg-slate-50/50">
                      <TableCell className="px-8 py-6 font-bold text-on-surface">{s.name}</TableCell>
                      <TableCell className="px-8 py-6 text-on-surface-variant italic font-medium">{s.provider}</TableCell>
                      <TableCell className="px-8 py-6 text-center lg:px-12">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-primary text-base">{s.acceptedCount} / {s.quota}</span>
                          <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant opacity-50">Terisi</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 font-mono text-[11px] font-bold text-rose-500">{new Date(s.deadline).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${s.status === 'buka' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                          {s.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => { setFilterScholarship(s.id); setActiveTab('applications'); }}
                          className="px-4 py-2 bg-primary-container text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          Pendaftar
                        </button>
                        <button onClick={() => { 
                          setProgForm({
                            ...s,
                            deadline: s.deadline?.split('T')[0] // Fix date format for input
                          }); 
                          setShowProgModal(true); 
                        }} className="p-2 bg-surface-container rounded-lg hover:bg-primary-fixed hover:text-white transition-all"><span className="material-symbols-outlined text-sm">edit</span></button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredApplications.map(a => (
                    <TableRow key={a.id} className="hover:bg-slate-50/50">
                      <TableCell className="px-8 py-6">
                        <span className="block font-bold text-on-surface">{a.student?.name}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant/60 font-mono italic">{a.student?.nim}</span>
                      </TableCell>
                      <TableCell className="px-8 py-6 font-bold text-primary">{a.scholarship?.name}</TableCell>
                      <TableCell className="px-8 py-6 text-center">
                        <a href={a.documentUrl} target="_blank" className="text-primary hover:underline text-[11px] font-bold">Lihat Berkas</a>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <span className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase border ${
                          a.status === 'diterima' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          a.status === 'ditolak' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {a.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <button onClick={() => { setSelectedItem(a); setAppForm({status: a.status, notes: a.adminNotes}); setShowAppModal(true); }} className="bg-primary text-white text-[10px] font-bold px-4 py-2 rounded-xl uppercase tracking-widest shadow-md">Detail Seleksi</button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Modal Program */}
        {showProgModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-sm">
            <Card className="w-full max-w-xl bg-white rounded-[2.5rem] p-10 text-left">
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">Program Beasiswa</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2 px-1">Nama Program</label>
                  <input value={progForm.name} onChange={e => setProgForm({...progForm, name: e.target.value})} className="w-full p-4 rounded-2xl bg-surface border border-outline-variant/20 font-bold text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2 px-1">Pemberi / Provider</label>
                  <input value={progForm.provider} onChange={e => setProgForm({...progForm, provider: e.target.value})} className="w-full p-4 rounded-2xl bg-surface border border-outline-variant/20 font-bold text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2 px-1">Min. IPK</label>
                  <input type="number" step="0.1" value={progForm.minGpa} onChange={e => setProgForm({...progForm, minGpa: parseFloat(e.target.value)})} className="w-full p-4 rounded-2xl bg-surface border border-outline-variant/20 font-bold text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2 px-1">Kuota Mahasiswa</label>
                  <input type="number" value={progForm.quota} onChange={e => setProgForm({...progForm, quota: parseInt(e.target.value)})} className="w-full p-4 rounded-2xl bg-surface border border-outline-variant/20 font-bold text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2 px-1">Deadline</label>
                  <input type="date" value={progForm.deadline} onChange={e => setProgForm({...progForm, deadline: e.target.value})} className="w-full p-4 rounded-2xl bg-surface border border-outline-variant/20 font-bold text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2 px-1">Status</label>
                  <select value={progForm.status} onChange={e => setProgForm({...progForm, status: e.target.value})} className="w-full p-4 rounded-2xl bg-surface border border-outline-variant/20 font-bold text-sm outline-none focus:border-primary">
                    <option value="buka">Buka</option>
                    <option value="tutup">Tutup</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 py-4 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50" onClick={() => setShowProgModal(false)}>BATAL</Button>
                <Button className="flex-1 py-4 font-bold text-[10px] uppercase tracking-widest rounded-xl bg-primary text-white shadow-lg" onClick={handleProgSubmit}>SIMPAN PROGRAM</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal Aplikasi */}
        {showAppModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-sm">
            <Card className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 text-left">
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">Seleksi Pendaftar</h2>
              <p className="text-sm italic text-on-surface-variant mb-6">{selectedItem?.student?.name} - {selectedItem?.scholarship?.name}</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2 px-1">Status Seleksi</label>
                  <select value={appForm.status} onChange={e => setAppForm({...appForm, status: e.target.value})} className="w-full p-4 rounded-2xl bg-surface border border-outline-variant/20 font-bold text-sm outline-none focus:border-primary">
                    <option value="proses">Proses Seleksi</option>
                    <option value="wawancara">Tahap Wawancara</option>
                    <option value="diterima">Diterima</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2 px-1">Catatan Admin</label>
                  <textarea value={appForm.notes} onChange={e => setAppForm({...appForm, notes: e.target.value})} className="w-full p-4 rounded-2xl bg-surface border border-outline-variant/20 font-bold text-sm outline-none focus:border-primary h-32" placeholder="Alasan penerimaan/penolakan..." />
                </div>
              </div>
              <div className="flex gap-4">
                 <Button variant="outline" className="flex-1 py-4 font-bold text-[10px] uppercase tracking-widest rounded-xl" onClick={() => setShowAppModal(false)}>BATAL</Button>
                 <Button className="flex-1 py-4 font-bold text-[10px] uppercase tracking-widest rounded-xl bg-primary text-white shadow-lg" onClick={handleAppUpdate}>UPDATE STATUS</Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
