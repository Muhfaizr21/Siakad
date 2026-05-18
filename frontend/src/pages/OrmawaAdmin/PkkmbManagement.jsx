import React, { useState, useEffect } from 'react';

import { ormawaService, fetchWithAuth, getAuthToken, API_BASE_URL } from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const API = `${API_BASE_URL}/ormawa`;
import { motion, AnimatePresence } from 'framer-motion';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const CheckCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;



const PkkmbManagement = () => {
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [activeTab, setActiveTab] = useState('ringkasan');
 const [loading, setLoading] = useState(true);
 const [summary, setSummary] = useState({ totalMaba: 0, totalLulus: 0, totalProses: 0 });
 const [prodiData, setProdiData] = useState([]);
 const [students, setStudents] = useState([]);
 const [kegiatans, setKegiatans] = useState([]);
 const [quizzes, setQuizzes] = useState([]);

 // CRUD Kegiatan States
 const [showModal, setShowModal] = useState(false);
 const [formData, setFormData] = useState({ id: null, judul: '', deskripsi: '', tanggal: '', lokasi: '' });

 // CRUD Quiz States
 const [showQuizModal, setShowQuizModal] = useState(false);
 const [quizFormData, setQuizFormData] = useState({ 
 id: null, 
 judul: '', 
 deskripsi: '', 
 durasi: 30, 
 questions: [
 { pertanyaan: '', tipe: 'multiple_choice', point: 10, options: [{ opsi: '', is_benar: false }] }
 ] 
 });

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 setLoading(true);
 try {
 const dataSummary = await ormawaService.getKencanaSummary();
 if (dataSummary.status === 'success') {
 setSummary(dataSummary.stats);
 setProdiData(dataSummary.prodiBreakdown);
 }

 const dataStudents = await ormawaService.getKencanaStudents();
 if (dataStudents.status === 'success') {
 setStudents(dataStudents.data);
 }

 const dataKegiatan = await ormawaService.getKencanaEvents();
 if (dataKegiatan.status === 'success') {
 setKegiatans(dataKegiatan.data);
 }

 const dataQuizzes = await ormawaService.getKencanaQuizzes();
 if (dataQuizzes.status === 'success') {
 setQuizzes(dataQuizzes.data);
 }
 } catch (e) {
 console.error(e);
 } finally {
 setLoading(false);
 }
 };

 const getStatusColor = (status) => {
 if (status === 'Lulus') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
 if (status === 'Proses') return 'bg-amber-100 text-amber-700 border-amber-200';
 return 'bg-rose-100 text-rose-700 border-rose-200';
 };

 const handleSaveKegiatan = async (e) => {
 e.preventDefault();
 const isEditing = !!formData.id;

 try {
 const payload = { 
 Judul: formData.judul, 
 Deskripsi: formData.deskripsi, 
 Tanggal: formData.tanggal ? new Date(formData.tanggal).toISOString() : new Date().toISOString(), 
 Lokasi: formData.lokasi 
 };

 const data = isEditing 
 ? await ormawaService.updateKencanaEvent(formData.id, payload)
 : await ormawaService.createKencanaEvent(payload);
 if (data.status === 'success') {
 setShowModal(false);
 fetchData();
 setFormData({ id: null, judul: '', deskripsi: '', tanggal: '', lokasi: '' });
 } else {
 alert(data.message || 'Terjadi kesalahan saat menyimpan');
 }
 } catch (error) {
 console.error(error);
 alert('Gagal menyambung ke server');
 }
 };

 const handleDeleteKegiatan = async (id) => {
 if (!confirm('Yakin ingin menghapus kegiatan ini?')) return;
 try {
 const data = await ormawaService.deleteKencanaEvent(id);
 if (data.status === 'success') {
 fetchData();
 }
 } catch (error) {
 console.error(error);
 }
 };

 const openEditModal = (item) => {
 const d = new Date(item.Tanggal);
 const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
 const localISOTime = (new Date(d - tzOffset)).toISOString().slice(0, 16);
 
 setFormData({
 id: item.ID,
 judul: item.Judul,
 deskripsi: item.Deskripsi,
 tanggal: localISOTime,
 lokasi: item.Lokasi
 });
 setShowModal(true);
 };

 const handleSaveQuiz = async (e) => {
 e.preventDefault();
 const isEditing = !!quizFormData.id;
 try {
 const data = isEditing 
 ? await ormawaService.updateKencanaQuiz(quizFormData.id, quizFormData)
 : await ormawaService.createKencanaQuiz(quizFormData);
 if (data.status === 'success') {
 setShowQuizModal(false);
 fetchData();
 alert('Kuis berhasil disimpan');
 }
 } catch (e) {
 console.error(e);
 alert('Gagal menyimpan kuis');
 }
 };

 const openEditQuiz = (q) => {
 setQuizFormData({
 id: q.ID,
 judul: q.judul,
 deskripsi: q.deskripsi,
 durasi: q.durasi,
 questions: q.questions || []
 });
 setShowQuizModal(true);
 };

 const handleDeleteQuiz = async (id) => {
 if (!confirm('Hapus kuis ini?')) return;
 try {
 await ormawaService.deleteKencanaQuiz(id);
 fetchData();
 } catch (e) { console.error(e); }
 };

 const mockBanding = [
 { id: 1, nama: 'Budi Santoso', nim: 'BKU2024001', kuis: 'Kuis Sejarah Kampus', nilaiLama: 60, alasan: 'Ada gangguan koneksi saat submit', status: 'Menunggu' },
 { id: 2, nama: 'Siti Aminah', nim: 'BKU2024102', kuis: 'Kuis Etika Akademik', nilaiLama: 65, alasan: 'Waktu kurang cukup untuk soal esai', status: 'Menunggu' },
 ];

 return (
 <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
 
 {/* ── Welcome Banner ─────────────────────────────────────────── */}
 <section className="relative overflow-hidden rounded-3xl h-52 flex items-center group shadow-sm">
 <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
 <div className="absolute inset-0 opacity-[0.03]"
 style={{
 backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
 backgroundSize: '60px 60px'
 }}
 />
 <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
 <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

 <div className="relative z-10 px-10 flex-1">
 <div className="flex items-center gap-2 mb-3">
 <span className="h-1.5 w-6 bg-primary/40 rounded-full" />
 <span className="text-[10px] font-bold text-slate-400 tracking-[0.25em]">
 Ormawa Admin
 </span>
 </div>
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-primary/10 backdrop-blur-md rounded-xl text-primary shadow-inner">
 <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >school</span>
 </div>
 <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
 Manajemen Kencana
 </h1>
 </div>
 <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
 Pusat kendali evaluasi dan monitoring progres mahasiswa baru pada program Pengenalan Kehidupan Kampus (PKKMB).
 </p>
 </div>
 </section>

 {/* ── Stat Cards ─────────────────────────────────────────────── */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 { label: 'Total Peserta', value: summary.totalMaba, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', accent: 'from-blue-500/10' },
 { label: 'Selesai / Lulus', value: summary.totalLulus, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'from-emerald-500/10' },
 { label: 'Berproses', value: summary.totalProses, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', accent: 'from-amber-500/10' },
 ].map((s, idx) => (
 <div key={idx} className="group bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
 <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${s.accent} to-transparent rounded-bl-full opacity-40`} />
 <div className="relative">
 <div className="flex items-center justify-between mb-4">
 <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform duration-300`}>
 <s.icon size={18} />
 </div>
 </div>
 <p className="text-[10px] font-black text-[#a3a3a3] tracking-[0.15em] mb-1 font-headline">{s.label}</p>
 <p className="text-3xl font-black text-[#171717] leading-none tabular-nums font-headline">
 {loading ? '...' : s.value}
 </p>
 </div>
 </div>
 ))}
 </div>

 {/* ── Tab Navigation ─────────────────────────────────────────── */}
 <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-[#e5e5e5] shadow-sm overflow-x-auto no-scrollbar max-w-fit">
 {[
 { id: 'ringkasan', label: 'Ringkasan' },
 { id: 'kegiatan', label: 'Kegiatan' },
 { id: 'kuis', label: 'Kuis' },
 { id: 'peserta', label: 'Peserta' },
 { id: 'banding', label: 'Banding' }
 ].map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`px-5 py-2.5 rounded-xl font-bold text-[11px] tracking-widest transition-all whitespace-nowrap ${
 activeTab === tab.id 
 ? 'bg-white text-primary shadow-sm border border-[#e5e5e5]' 
 : 'text-[#737373] hover:text-[#171717] hover:bg-white/50'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {/* ── Content Area ───────────────────────────────────────────── */}
 <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden min-h-[400px]">
 {activeTab === 'ringkasan' && (
 <div>
 <div className="p-6 border-b border-[#f0f0f0]">
 <h2 className="text-[13px] font-black text-[#171717] tracking-widest font-headline">Breakdown Per Program Studi</h2>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[600px]">
 <thead>
 <tr className="bg-[#fcfcfc] border-b border-[#f0f0f0]">
 <th className="px-6 py-4 text-[10px] font-black text-[#a3a3a3] tracking-widest">Program Studi</th>
 <th className="px-6 py-4 text-[10px] font-black text-[#a3a3a3] tracking-widest">Tingkat Partisipasi</th>
 <th className="px-6 py-4 text-[10px] font-black text-[#a3a3a3] tracking-widest text-center">Rata-rata Nilai</th>
 <th className="px-6 py-4 text-[10px] font-black text-[#a3a3a3] tracking-widest text-right">Status Kinerja</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#f0f0f0]">
 {loading ? (
 <tr><td colSpan="4" className="p-8 text-center text-[11px] font-bold text-[#a3a3a3] tracking-widest">Memuat data...</td></tr>
 ) : prodiData.length === 0 ? (
 <tr><td colSpan="4" className="p-8 text-center text-[11px] font-bold text-[#a3a3a3] tracking-widest">Belum ada data</td></tr>
 ) : (
 prodiData.map((item) => (
 <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
 <td className="px-6 py-4 font-bold text-[#171717] text-sm">{item.prodi}</td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <span className="font-black text-primary text-sm">{item.partisipasi.toFixed(1)}%</span>
 <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full max-w-[120px]">
 <div className="h-full bg-primary rounded-full shadow-sm" style={{ width: `${Math.min(item.partisipasi, 100)}%` }} />
 </div>
 </div>
 </td>
 <td className="px-6 py-4 text-center font-bold text-[#525252] text-sm">{item.nilai.toFixed(1)}</td>
 <td className="px-6 py-4 text-right">
 <span className={`inline-block px-3 py-1 text-[9px] font-black tracking-widest rounded-lg border ${item.status === 'Optimal' ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' : 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'}`}>
 {item.status}
 </span>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {activeTab === 'kegiatan' && (
 <div className="p-6">
 <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-2">
 <span className="material-symbols-outlined size-4 text-primary" Days>calendar_month</span>
 <h2 className="text-[13px] font-black text-[#171717] tracking-widest font-headline">Agenda & Kegiatan</h2>
 </div>
 <button 
 onClick={() => { setFormData({ id: null, judul: '', deskripsi: '', tanggal: '', lokasi: '' }); setShowModal(true); }}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs"
 >
 <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >add</span> Tambah Kegiatan
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {kegiatans.length === 0 && !loading && (
 <div className="col-span-full p-8 text-center text-[#a3a3a3] border-2 border-dashed border-[#e5e5e5] rounded-2xl text-[11px] font-bold tracking-widest">
 Belum ada kegiatan yang terdaftar
 </div>
 )}
 {kegiatans.map(k => (
 <div key={k.ID} className="group border border-[#e5e5e5] p-5 rounded-2xl bg-white hover:border-primary/30 hover:shadow-md transition-all relative overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <span className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-[10px] font-black tracking-widest">
 {new Date(k.Tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
 </span>
 <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
 <button onClick={() => openEditModal(k)} className="p-1.5 bg-white border border-[#e5e5e5] text-[#171717] rounded-lg shadow-sm hover:text-primary hover:border-primary">
 <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >edit</span>
 </button>
 <button onClick={() => handleDeleteKegiatan(k.ID)} className="p-1.5 bg-white border border-[#e5e5e5] text-[#dc2626] rounded-lg shadow-sm hover:border-[#dc2626] hover:bg-rose-50">
 <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >delete</span>
 </button>
 </div>
 </div>
 <h3 className="font-black text-[#171717] text-[15px] mb-2 leading-tight font-headline">{k.Judul}</h3>
 <p className="text-[12px] text-[#737373] mb-4 line-clamp-2 leading-relaxed">{k.Deskripsi}</p>
 <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[#f0f0f0] text-[11px] font-bold text-[#525252]">
 <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
 <span className="material-symbols-outlined text-[12px]">location_on</span>
 </div>
 {k.Lokasi}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {activeTab === 'kuis' && (
 <div className="p-6">
 <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-2">
 <span className="material-symbols-outlined size-4 text-primary" >check_circle</span>
 <h2 className="text-[13px] font-black text-[#171717] tracking-widest font-headline">Manajemen Kuis</h2>
 </div>
 <button 
 onClick={() => { 
 setQuizFormData({ 
 id: null, judul: '', deskripsi: '', durasi: 30, 
 questions: [{ pertanyaan: '', tipe: 'multiple_choice', point: 10, options: [{ opsi: '', is_benar: false }] }] 
 }); 
 setShowQuizModal(true); 
 }}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs"
 >
 <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >add</span> Buat Kuis Baru
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {quizzes.length === 0 && !loading && (
 <div className="col-span-full p-8 text-center text-[#a3a3a3] border-2 border-dashed border-[#e5e5e5] rounded-2xl text-[11px] font-bold tracking-widest">
 Belum ada kuis yang dibuat
 </div>
 )}
 {quizzes.map(q => (
 <div key={q.ID} className="group border border-[#e5e5e5] p-5 rounded-2xl bg-white hover:border-primary/30 hover:shadow-md transition-all relative overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <span className={`px-3 py-1 rounded-xl text-[10px] font-black tracking-widest ${q.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
 {q.is_active ? 'Aktif' : 'Non-Aktif'}
 </span>
 <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
 <button onClick={() => openEditQuiz(q)} className="p-1.5 bg-white border border-[#e5e5e5] text-[#171717] rounded-lg shadow-sm hover:text-primary hover:border-primary">
 <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >edit</span>
 </button>
 <button onClick={() => handleDeleteQuiz(q.ID)} className="p-1.5 bg-white border border-[#e5e5e5] text-[#dc2626] rounded-lg shadow-sm hover:border-[#dc2626] hover:bg-rose-50">
 <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >delete</span>
 </button>
 </div>
 </div>
 <h3 className="font-black text-[#171717] text-[15px] mb-2 leading-tight font-headline">{q.judul}</h3>
 <p className="text-[12px] text-[#737373] mb-4 line-clamp-2 leading-relaxed">{q.deskripsi}</p>
 <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#f0f0f0] text-[11px] font-bold text-[#525252]">
 <span className="flex items-center gap-1.5">
 <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }} >schedule</span> {q.durasi} Menit
 </span>
 <span className="flex items-center gap-1.5">
 <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }} >group</span> {q.questions?.length || 0} Soal
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {activeTab === 'peserta' && (
 <div>
 <div className="p-6 border-b border-[#f0f0f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-2">
 <span className="material-symbols-outlined size-4 text-primary" >group</span>
 <h2 className="text-[13px] font-black text-[#171717] tracking-widest font-headline">Data Peserta</h2>
 </div>
 <div className="relative w-full sm:w-64">
 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
 <input 
 type="text" 
 placeholder="Cari NIM atau Nama..." 
 className="w-full pl-9 pr-4 py-2 bg-[#fcfcfc] border border-[#e5e5e5] rounded-xl text-xs font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-[#a3a3a3]"
 />
 </div>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[600px]">
 <thead>
 <tr className="bg-[#fcfcfc] border-b border-[#f0f0f0]">
 <th className="px-6 py-4 text-[10px] font-black text-[#a3a3a3] tracking-widest">Mahasiswa</th>
 <th className="px-6 py-4 text-[10px] font-black text-[#a3a3a3] tracking-widest">Fakultas / Prodi</th>
 <th className="px-6 py-4 text-[10px] font-black text-[#a3a3a3] tracking-widest text-center">Nilai</th>
 <th className="px-6 py-4 text-[10px] font-black text-[#a3a3a3] tracking-widest text-right">Status Akhir</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#f0f0f0]">
 {loading ? (
 <tr><td colSpan="4" className="p-8 text-center text-[11px] font-bold text-[#a3a3a3] tracking-widest">Memuat data...</td></tr>
 ) : students.length === 0 ? (
 <tr><td colSpan="4" className="p-8 text-center text-[11px] font-bold text-[#a3a3a3] tracking-widest">Belum ada peserta</td></tr>
 ) : (
 students.map((s) => (
 <tr key={s.ID} className="hover:bg-[#fafafa] transition-colors">
 <td className="px-6 py-4">
 <div className="flex flex-col">
 <span className="font-bold text-[#171717] text-[13px]">{s.Mahasiswa?.Nama}</span>
 <span className="text-[10px] font-black text-[#a3a3a3] tracking-wider">{s.Mahasiswa?.NIM}</span>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="text-[11px] font-bold text-[#525252] bg-[#f5f5f5] px-2.5 py-1 rounded-lg">
 {s.Mahasiswa?.ProgramStudi?.Nama || '-'}
 </span>
 </td>
 <td className="px-6 py-4 text-center font-black text-primary text-sm">{s.Nilai?.toFixed(1) || '0.0'}</td>
 <td className="px-6 py-4 text-right">
 <span className={`inline-block px-3 py-1 text-[9px] font-black tracking-widest rounded-lg border ${getStatusColor(s.StatusKelulusan)}`}>
 {s.StatusKelulusan || 'Belum'}
 </span>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {activeTab === 'banding' && (
 <div className="p-6">
 <div className="mb-6 flex justify-between items-center">
 <div className="flex items-center gap-2">
 <span className="material-symbols-outlined size-4 text-amber-500" >error</span>
 <h2 className="text-[13px] font-black text-[#171717] tracking-widest font-headline">Antrean Banding</h2>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {mockBanding.map(b => (
 <div key={b.id} className="border border-[#e5e5e5] p-5 rounded-2xl bg-white shadow-sm flex flex-col">
 <div className="flex justify-between items-start mb-4">
 <div>
 <p className="text-[10px] font-black text-[#a3a3a3] tracking-widest mb-1">{b.nim}</p>
 <h4 className="font-black text-[#171717] text-[13px]">{b.nama}</h4>
 </div>
 <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-lg">
 Menunggu
 </span>
 </div>
 <div className="bg-[#fafafa] p-4 rounded-xl border border-[#e5e5e5] mb-5 flex-1">
 <p className="text-[11px] font-bold text-[#525252] mb-1.5">{b.kuis}</p>
 <p className="text-[11px] text-[#737373] mb-3">
 Nilai awal: <strong className="text-primary">{b.nilaiLama}</strong>
 </p>
 <div className="h-px bg-[#e5e5e5] my-3" />
 <p className="text-[11px] text-[#525252] leading-relaxed relative pl-3 border-l-2 border-primary/20">"{b.alasan}"</p>
 </div>
 <div className="flex gap-2">
 <button className="flex-1 py-2 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition-colors">Tolak</button>
 <button className="flex-1 py-2 text-[11px] font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-sm">Review</button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* MODAL FORM KEGIATAN */}
 <AnimatePresence>
 {showModal && (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex justify-center items-start pt-4 sm:items-center p-4 overflow-y-auto"
 >
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col"
 >
 <div className="px-6 py-5 border-b border-[#f0f0f0] flex justify-between items-center">
 <h3 className="font-black font-headline text-[13px] text-[#171717] tracking-widest ">
 {formData.id ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
 </h3>
 <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors">
 <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >close</span>
 </button>
 </div>
 <form onSubmit={handleSaveKegiatan} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
 <div>
 <label className="block text-[10px] font-black text-[#a3a3a3] tracking-widest mb-1.5">Judul Kegiatan</label>
 <input
 type="text" required value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})}
 className="w-full px-4 py-2.5 bg-[#fcfcfc] border border-[#e5e5e5] rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-all placeholder:font-medium" placeholder="Contoh: Pengenalan Visi Misi"
 />
 </div>
 <div>
 <label className="block text-[10px] font-black text-[#a3a3a3] tracking-widest mb-1.5">Tanggal Pelaksanaan</label>
 <input
 type="datetime-local" required value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
 className="w-full px-4 py-2.5 bg-[#fcfcfc] border border-[#e5e5e5] rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-all"
 />
 </div>
 <div>
 <label className="block text-[10px] font-black text-[#a3a3a3] tracking-widest mb-1.5">Lokasi / Ruangan</label>
 <input
 type="text" required value={formData.lokasi} onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
 className="w-full px-4 py-2.5 bg-[#fcfcfc] border border-[#e5e5e5] rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-all placeholder:font-medium" placeholder="Contoh: Gedung A / Zoom"
 />
 </div>
 <div>
 <label className="block text-[10px] font-black text-[#a3a3a3] tracking-widest mb-1.5">Deskripsi Singkat</label>
 <textarea
 required value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
 className="w-full px-4 py-2.5 bg-[#fcfcfc] border border-[#e5e5e5] rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-all min-h-[100px] resize-y placeholder:font-medium" placeholder="Penjelasan singkat mengenai materi..."
 />
 </div>
 <div className="pt-2 flex justify-end gap-2">
 <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-[#737373] hover:bg-[#f5f5f5] rounded-xl font-bold transition-colors text-[11px] tracking-widest">Batal</button>
 <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-[11px] tracking-widest">Simpan</button>
 </div>
 </form>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* MODAL FORM KUIS */}
 <AnimatePresence>
 {showQuizModal && (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex justify-center items-start pt-4 sm:items-center p-4 overflow-y-auto"
 >
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-4 max-h-[90dvh] flex flex-col"
 >
 <div className="px-6 py-5 border-b border-[#f0f0f0] flex justify-between items-center">
 <h3 className="font-black font-headline text-[13px] text-[#171717] tracking-widest ">
 {quizFormData.id ? 'Edit Kuis' : 'Buat Kuis Baru'}
 </h3>
 <button onClick={() => setShowQuizModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors">
 <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >close</span>
 </button>
 </div>
 
 <form onSubmit={handleSaveQuiz} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="md:col-span-2">
 <label className="block text-[10px] font-black text-[#a3a3a3] tracking-widest mb-1.5">Judul Kuis</label>
 <input
 type="text" required value={quizFormData.judul} onChange={(e) => setQuizFormData({...quizFormData, judul: e.target.value})}
 className="w-full px-4 py-2.5 bg-[#fcfcfc] border border-[#e5e5e5] rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-all placeholder:font-medium" placeholder="Misal: Kuis Wawasan Kebangsaan"
 />
 </div>
 <div className="md:col-span-2">
 <label className="block text-[10px] font-black text-[#a3a3a3] tracking-widest mb-1.5">Deskripsi</label>
 <textarea
 required value={quizFormData.deskripsi} onChange={(e) => setQuizFormData({...quizFormData, deskripsi: e.target.value})}
 className="w-full px-4 py-2.5 bg-[#fcfcfc] border border-[#e5e5e5] rounded-xl text-xs font-bold focus:outline-none focus:border-primary min-h-[80px] placeholder:font-medium"
 />
 </div>
 <div>
 <label className="block text-[10px] font-black text-[#a3a3a3] tracking-widest mb-1.5">Durasi (Menit)</label>
 <input
 type="number" required value={quizFormData.durasi} onChange={(e) => setQuizFormData({...quizFormData, durasi: parseInt(e.target.value)})}
 className="w-full px-4 py-2.5 bg-[#fcfcfc] border border-[#e5e5e5] rounded-xl text-xs font-bold focus:outline-none focus:border-primary"
 />
 </div>
 </div>

 <div className="border-t border-[#f0f0f0] pt-6">
 <div className="flex justify-between items-center mb-4">
 <h4 className="text-[11px] font-black text-[#171717] tracking-widest">Daftar Pertanyaan</h4>
 <button type="button" onClick={() => {
 const newQuestions = [...quizFormData.questions, { pertanyaan: '', tipe: 'multiple_choice', point: 10, options: [{ opsi: '', is_benar: false }] }];
 setQuizFormData({...quizFormData, questions: newQuestions});
 }}
 className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 tracking-widest"
 >
 <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >add</span> Tambah Soal
 </button>
 </div>

 <div className="space-y-4">
 {quizFormData.questions.map((q, qIndex) => (
 <div key={qIndex} className="p-5 bg-white border border-[#e5e5e5] rounded-2xl relative group shadow-sm">
 <button type="button" onClick={() => {
 const newQ = quizFormData.questions.filter((_, i) => i !== qIndex);
 setQuizFormData({...quizFormData, questions: newQ});
 }}
 className="absolute -right-2 -top-2 w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
 >
 <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >close</span>
 </button>
 
 <div className="mb-4">
 <label className="block text-[10px] font-black text-primary tracking-widest mb-1.5">Soal #{qIndex + 1}</label>
 <input
 type="text" required value={q.pertanyaan} onChange={(e) => {
 const newQ = [...quizFormData.questions]; newQ[qIndex].pertanyaan = e.target.value; setQuizFormData({...quizFormData, questions: newQ});
 }}
 className="w-full px-4 py-2.5 bg-[#fcfcfc] border border-[#e5e5e5] rounded-xl text-xs font-bold focus:outline-none focus:border-primary" placeholder="Tulis pertanyaan..."
 />
 </div>

 <div className="space-y-3">
 <div className="flex justify-between items-center">
 <label className="block text-[10px] font-black text-[#a3a3a3] tracking-widest">Pilihan Jawaban</label>
 <button type="button" onClick={() => {
 const newQ = [...quizFormData.questions]; newQ[qIndex].options.push({ opsi: '', is_benar: false }); setQuizFormData({...quizFormData, questions: newQ});
 }}
 className="text-[9px] font-black text-primary tracking-widest bg-primary/10 px-2 py-1 rounded-lg"
 >
 + Opsi
 </button>
 </div>
 {q.options.map((opt, oIndex) => (
 <div key={oIndex} className="flex gap-3 items-center">
 <label className="relative flex items-center cursor-pointer">
 <input type="radio" name={`correct-${qIndex}`} checked={opt.is_benar} onChange={() => {
 const newQ = [...quizFormData.questions]; newQ[qIndex].options.forEach((o, i) => o.is_benar = i === oIndex); setQuizFormData({...quizFormData, questions: newQ});
 }}
 className="peer sr-only"
 />
 <div className="w-5 h-5 rounded-full border-2 border-[#e5e5e5] peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
 {opt.is_benar && <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }} >check_circle</span>}
 </div>
 </label>
 <input type="text" required value={opt.opsi} onChange={(e) => {
 const newQ = [...quizFormData.questions]; newQ[qIndex].options[oIndex].opsi = e.target.value; setQuizFormData({...quizFormData, questions: newQ});
 }}
 className="flex-1 px-4 py-2 bg-[#fcfcfc] border border-[#e5e5e5] rounded-xl text-xs font-medium focus:outline-none focus:border-primary" placeholder={`Opsi ${String.fromCharCode(65 + oIndex)}`}
 />
 <button type="button" onClick={() => {
 const newQ = [...quizFormData.questions]; newQ[qIndex].options = newQ[qIndex].options.filter((_, i) => i !== oIndex); setQuizFormData({...quizFormData, questions: newQ});
 }}
 className="text-slate-400 hover:text-rose-500 transition-colors p-1"
 >
 <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >close</span>
 </button>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 
 <div className="pt-4 flex justify-end gap-2">
 <button type="button" onClick={() => setShowQuizModal(false)} className="px-5 py-2.5 text-[#737373] hover:bg-[#f5f5f5] rounded-xl font-bold transition-colors text-[11px] tracking-widest">Batal</button>
 <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-[11px] tracking-widest">Simpan Kuis</button>
 </div>
 </form>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 </div>
 );
};

export default PkkmbManagement;
