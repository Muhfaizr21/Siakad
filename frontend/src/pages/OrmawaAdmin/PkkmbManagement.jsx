import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, GraduationCap, AlertCircle, Search, CalendarDays, Plus, Edit2, Trash2, X } from 'lucide-react';
import { ormawaService, fetchWithAuth, getAuthToken } from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="bg-[#fafafa] text-[#171717] min-h-screen font-body">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="px-4 lg:px-8 py-8 mt-16 max-w-7xl mx-auto">
          {/* Header BKU Style */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden mb-8"
          >
            <div className="bg-gradient-to-r from-[#00236F] to-[#0B4FAE] p-6 lg:p-8 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white">
                  <GraduationCap size={28} />
                </div>
                <h1 className="text-2xl lg:text-3xl font-black font-headline uppercase tracking-wide">
                  Manajemen KENCANA (PKKMB)
                </h1>
              </div>
              <p className="text-[#dbe7ff] text-sm lg:text-base font-medium max-w-2xl mt-2 leading-relaxed">
                Pusat kendali evaluasi dan monitoring progres mahasiswa baru pada program Pengenalan Kehidupan Kampus (KENCANA).
              </p>
            </div>
            
            <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6">
              <div className="bg-[#f5f5f5] rounded-2xl p-4 lg:p-5 border border-[#e5e5e5] hover:border-[#00236F] transition-colors">
                <div className="flex items-center gap-3 mb-2 lg:mb-3">
                  <Users className="text-[#00236F]" size={18} />
                  <h3 className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-widest">Total Peserta</h3>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-[#171717]">{loading ? '...' : summary.totalMaba}</p>
              </div>
              <div className="bg-[#f0fdf4] rounded-2xl p-4 lg:p-5 border border-[#bbf7d0] hover:border-[#16a34a] transition-colors">
                <div className="flex items-center gap-3 mb-2 lg:mb-3">
                  <CheckCircle className="text-[#16a34a]" size={18} />
                  <h3 className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest">Selesai / Lulus</h3>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-[#16a34a]">{loading ? '...' : summary.totalLulus}</p>
              </div>
              <div className="bg-[#fffbeb] rounded-2xl p-4 lg:p-5 border border-[#fde68a] hover:border-[#d97706] transition-colors">
                <div className="flex items-center gap-3 mb-2 lg:mb-3">
                  <Clock className="text-[#d97706]" size={18} />
                  <h3 className="text-[10px] font-bold text-[#d97706] uppercase tracking-widest">Berproses</h3>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-[#d97706]">{loading ? '...' : summary.totalProses}</p>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mb-6 bg-white p-2 rounded-2xl border border-[#e5e5e5] shadow-sm overflow-x-auto no-scrollbar scroll-smooth">
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
                className={`px-4 py-2 rounded-xl font-bold text-[11px] md:text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#00236F] text-white shadow-md' 
                    : 'text-[#737373] hover:bg-[#f5f5f5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden min-h-[400px]">
            
            {activeTab === 'ringkasan' && (
              <div className="p-6">
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-lg font-black text-[#171717] uppercase tracking-wide">Breakdown Per Program Studi</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-[#e5e5e5]">
                        <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest">Program Studi</th>
                        <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest">Tingkat Partisipasi</th>
                        <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest text-center">Rata-rata Nilai</th>
                        <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest text-right">Status Kinerja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f5]">
                      {loading ? (
                        <tr><td colSpan="4" className="p-8 text-center text-[#a3a3a3]">Memuat data...</td></tr>
                      ) : prodiData.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-[#a3a3a3]">Belum ada data</td></tr>
                      ) : (
                        prodiData.map((item) => (
                          <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
                            <td className="p-4 font-bold text-[#171717]">{item.prodi}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <span className="font-black text-[#00236F]">{item.partisipasi.toFixed(1)}%</span>
                                <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full max-w-[100px]">
                                  <div className="h-full bg-[#00236F] rounded-full" style={{ width: `${Math.min(item.partisipasi, 100)}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center font-bold text-[#525252]">{item.nilai.toFixed(1)}</td>
                            <td className="p-4 text-right">
                              <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${item.status === 'Optimal' ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' : 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'}`}>
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
                  <h2 className="text-lg font-black text-[#171717] uppercase tracking-wide flex items-center gap-2">
                    <CalendarDays className="text-[#00236F]" size={20} />
                    Agenda & Kegiatan
                  </h2>
                  <button 
                    onClick={() => { setFormData({ id: null, judul: '', deskripsi: '', tanggal: '', lokasi: '' }); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00236F] hover:bg-[#0B4FAE] text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                  >
                    <Plus size={16} /> Tambah Kegiatan
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kegiatans.length === 0 && !loading && (
                    <div className="col-span-full p-8 text-center text-[#a3a3a3] border-2 border-dashed border-[#e5e5e5] rounded-2xl">
                      Belum ada kegiatan yang terdaftar
                    </div>
                  )}
                  {kegiatans.map(k => (
                    <div key={k.ID} className="group border border-[#e5e5e5] p-5 rounded-2xl bg-[#fafafa] hover:border-[#00236F]/30 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-[#e0e7ff] text-[#3730a3] px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {new Date(k.Tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </span>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(k)} className="p-1.5 bg-white border border-[#e5e5e5] text-[#171717] rounded-lg shadow-sm hover:text-[#00236F] hover:border-[#00236F]">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDeleteKegiatan(k.ID)} className="p-1.5 bg-white border border-[#e5e5e5] text-[#dc2626] rounded-lg shadow-sm hover:border-[#dc2626] hover:bg-rose-50">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-[#171717] text-[15px] mb-1 leading-tight">{k.Judul}</h3>
                      <p className="text-[12px] text-[#737373] mb-3 line-clamp-2 leading-relaxed">{k.Deskripsi}</p>
                      <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-[#e5e5e5]/60 text-[11px] font-bold text-[#525252]">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
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
                  <h2 className="text-lg font-black text-[#171717] uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle className="text-[#00236F]" size={20} />
                    Manajemen Kuis Evaluasi
                  </h2>
                  <button 
                    onClick={() => { 
                      setQuizFormData({ 
                        id: null, judul: '', deskripsi: '', durasi: 30, 
                        questions: [{ pertanyaan: '', tipe: 'multiple_choice', point: 10, options: [{ opsi: '', is_benar: false }] }] 
                      }); 
                      setShowQuizModal(true); 
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00236F] hover:bg-[#0B4FAE] text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                  >
                    <Plus size={16} /> Buat Kuis Baru
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzes.length === 0 && !loading && (
                    <div className="col-span-full p-8 text-center text-[#a3a3a3] border-2 border-dashed border-[#e5e5e5] rounded-2xl">
                      Belum ada kuis yang dibuat
                    </div>
                  )}
                  {quizzes.map(q => (
                    <div key={q.ID} className="group border border-[#e5e5e5] p-5 rounded-2xl bg-[#fafafa] hover:border-[#00236F]/30 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${q.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                          {q.is_active ? 'Aktif' : 'Non-Aktif'}
                        </span>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditQuiz(q)} className="p-1.5 bg-white border border-[#e5e5e5] text-[#171717] rounded-lg shadow-sm hover:text-[#00236F] hover:border-[#00236F]">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDeleteQuiz(q.ID)} className="p-1.5 bg-white border border-[#e5e5e5] text-[#dc2626] rounded-lg shadow-sm hover:border-[#dc2626] hover:bg-rose-50">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-[#171717] text-[15px] mb-1 leading-tight">{q.judul}</h3>
                      <p className="text-[12px] text-[#737373] mb-3 line-clamp-2 leading-relaxed">{q.deskripsi}</p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#e5e5e5]/60 text-[11px] font-bold text-[#525252]">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {q.durasi} Menit
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {q.questions?.length || 0} Soal
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'peserta' && (
              <div className="p-6">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-lg font-black text-[#171717] uppercase tracking-wide">Data Peserta KENCANA</h2>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" size={16} />
                    <input 
                      type="text" 
                      placeholder="Cari NIM atau Nama..." 
                      className="w-full pl-9 pr-4 py-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-[#e5e5e5]">
                        <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest">Mahasiswa</th>
                        <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest">Fakultas / Prodi</th>
                        <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest text-center">Nilai</th>
                        <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest text-right">Status Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f5]">
                      {loading ? (
                        <tr><td colSpan="4" className="p-8 text-center text-[#a3a3a3]">Memuat data...</td></tr>
                      ) : students.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-[#a3a3a3]">Belum ada peserta</td></tr>
                      ) : (
                        students.map((s) => (
                          <tr key={s.ID} className="hover:bg-[#fafafa] transition-colors">
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#171717] text-sm">{s.Mahasiswa?.Nama}</span>
                                <span className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-wider">{s.Mahasiswa?.NIM}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-bold text-[#525252] bg-[#f5f5f5] px-2.5 py-1 rounded-lg">
                                {s.Mahasiswa?.ProgramStudi?.Nama || '-'}
                              </span>
                            </td>
                            <td className="p-4 text-center font-black text-[#00236F]">{s.Nilai?.toFixed(1) || '0.0'}</td>
                            <td className="p-4 text-right">
                              <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${getStatusColor(s.StatusKelulusan)}`}>
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
                  <h2 className="text-lg font-black text-[#171717] uppercase tracking-wide flex items-center gap-2">
                    <AlertCircle className="text-[#d97706]" size={20} />
                    Antrean Banding Kuis
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockBanding.map(b => (
                    <div key={b.id} className="border border-[#e5e5e5] p-5 rounded-2xl bg-[#fafafa]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-widest mb-1">{b.nim}</p>
                          <h4 className="font-black text-[#171717] text-sm">{b.nama}</h4>
                        </div>
                        <span className="bg-[#fffbeb] text-[#d97706] border border-[#fde68a] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                          Menunggu
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#e5e5e5] mb-4">
                        <p className="text-xs font-bold text-[#525252] mb-1">{b.kuis}</p>
                        <p className="text-xs text-[#737373]">
                          Nilai awal: <strong className="text-[#00236F]">{b.nilaiLama}</strong>
                        </p>
                        <div className="h-px bg-[#f5f5f5] my-2" />
                        <p className="text-xs text-[#525252] italic">"{b.alasan}"</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 text-xs font-bold text-[#dc2626] bg-[#fef2f2] hover:bg-red-100 rounded-xl transition-colors">Tolak</button>
                        <button className="flex-1 py-2 text-xs font-bold text-white bg-[#00236F] hover:bg-[#0B4FAE] rounded-xl transition-colors">Review & Terima</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* MODAL FORM KEGIATAN */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99] flex justify-center items-start pt-4 sm:items-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg sm:max-w-md md:max-w-lg shadow-2xl overflow-hidden  max-h-[90dvh] overflow-y-auto"
            >
              <div className="p-6 bg-gradient-to-r from-[#00236F] to-[#0B4FAE] text-white flex justify-between items-center">
                <h3 className="font-black font-headline text-lg tracking-wide uppercase">
                  {formData.id ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
                </h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSaveKegiatan} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#737373] uppercase tracking-widest mb-1.5">Judul Kegiatan</label>
                  <input
                    type="text"
                    required
                    value={formData.judul}
                    onChange={(e) => setFormData({...formData, judul: e.target.value})}
                    className="w-full px-4 py-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all"
                    placeholder="Contoh: Pengenalan Visi Misi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#737373] uppercase tracking-widest mb-1.5">Tanggal Pelaksanaan</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                    className="w-full px-4 py-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#737373] uppercase tracking-widest mb-1.5">Lokasi / Ruangan</label>
                  <input
                    type="text"
                    required
                    value={formData.lokasi}
                    onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
                    className="w-full px-4 py-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all"
                    placeholder="Contoh: Gedung A / Zoom"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#737373] uppercase tracking-widest mb-1.5">Deskripsi Singkat</label>
                  <textarea
                    required
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    className="w-full px-4 py-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all min-h-[100px] resize-y"
                    placeholder="Penjelasan singkat mengenai materi atau kegiatan..."
                  />
                </div>
                
                <div className="pt-4 flex justify-end gap-2 border-t border-[#e5e5e5]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-[#525252] hover:bg-[#f5f5f5] rounded-xl font-bold transition-colors text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#00236F] hover:bg-[#0B4FAE] text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-sm"
                  >
                    Simpan Kegiatan
                  </button>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99] flex justify-center items-start pt-4 sm:items-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl md:max-w-xl lg:max-w-2xl shadow-2xl overflow-hidden my-8  max-h-[90dvh] overflow-y-auto"
            >
              <div className="p-6 bg-gradient-to-r from-[#00236F] to-[#0B4FAE] text-white flex justify-between items-center">
                <h3 className="font-black font-headline text-lg tracking-wide uppercase">
                  {quizFormData.id ? 'Edit Kuis Evaluasi' : 'Buat Kuis Evaluasi Baru'}
                </h3>
                <button onClick={() => setShowQuizModal(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              <form onSubmit={handleSaveQuiz} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-[#737373] uppercase tracking-widest mb-1.5">Judul Kuis</label>
                    <input
                      type="text" required
                      value={quizFormData.judul}
                      onChange={(e) => setQuizFormData({...quizFormData, judul: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00236F] transition-all"
                      placeholder="Misal: Kuis Wawasan Kebangsaan"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-[#737373] uppercase tracking-widest mb-1.5">Deskripsi</label>
                    <textarea
                      required
                      value={quizFormData.deskripsi}
                      onChange={(e) => setQuizFormData({...quizFormData, deskripsi: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00236F] min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#737373] uppercase tracking-widest mb-1.5">Durasi (Menit)</label>
                    <input
                      type="number" required
                      value={quizFormData.durasi}
                      onChange={(e) => setQuizFormData({...quizFormData, durasi: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00236F]"
                    />
                  </div>
                </div>

                <div className="border-t border-[#f5f5f5] pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-black text-[#171717] uppercase tracking-wide">Daftar Pertanyaan</h4>
                    <button 
                      type="button"
                      onClick={() => {
                        const newQuestions = [...quizFormData.questions, { pertanyaan: '', tipe: 'multiple_choice', point: 10, options: [{ opsi: '', is_benar: false }] }];
                        setQuizFormData({...quizFormData, questions: newQuestions});
                      }}
                      className="text-xs font-black text-[#00236F] hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Tambah Soal
                    </button>
                  </div>

                  <div className="space-y-6">
                    {quizFormData.questions.map((q, qIndex) => (
                      <div key={qIndex} className="p-4 bg-[#fafafa] rounded-2xl border border-[#e5e5e5] relative group">
                        <button 
                          type="button"
                          onClick={() => {
                            const newQ = quizFormData.questions.filter((_, i) => i !== qIndex);
                            setQuizFormData({...quizFormData, questions: newQ});
                          }}
                          className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        
                        <div className="mb-4">
                          <label className="block text-[10px] font-black text-[#a3a3a3] uppercase mb-1">Pertanyaan #{qIndex + 1}</label>
                          <input
                            type="text" required
                            value={q.pertanyaan}
                            onChange={(e) => {
                              const newQ = [...quizFormData.questions];
                              newQ[qIndex].pertanyaan = e.target.value;
                              setQuizFormData({...quizFormData, questions: newQ});
                            }}
                            className="w-full px-4 py-2 bg-white border border-[#e5e5e5] rounded-xl text-sm"
                            placeholder="Tulis soal di sini..."
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="block text-[10px] font-black text-[#a3a3a3] uppercase">Pilihan Jawaban</label>
                            <button 
                              type="button"
                              onClick={() => {
                                const newQ = [...quizFormData.questions];
                                newQ[qIndex].options.push({ opsi: '', is_benar: false });
                                setQuizFormData({...quizFormData, questions: newQ});
                              }}
                              className="text-[10px] font-black text-[#00236F]"
                            >
                              + Opsi
                            </button>
                          </div>
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex gap-2 items-center">
                              <input 
                                type="radio" 
                                name={`correct-${qIndex}`}
                                checked={opt.is_benar}
                                onChange={() => {
                                  const newQ = [...quizFormData.questions];
                                  newQ[qIndex].options.forEach((o, i) => o.is_benar = i === oIndex);
                                  setQuizFormData({...quizFormData, questions: newQ});
                                }}
                              />
                              <input
                                type="text" required
                                value={opt.opsi}
                                onChange={(e) => {
                                  const newQ = [...quizFormData.questions];
                                  newQ[qIndex].options[oIndex].opsi = e.target.value;
                                  setQuizFormData({...quizFormData, questions: newQ});
                                }}
                                className="flex-1 px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-lg text-xs"
                                placeholder={`Opsi ${oIndex + 1}`}
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newQ = [...quizFormData.questions];
                                  newQ[qIndex].options = newQ[qIndex].options.filter((_, i) => i !== oIndex);
                                  setQuizFormData({...quizFormData, questions: newQ});
                                }}
                                className="text-rose-500"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-6 flex justify-end gap-2 border-t border-[#e5e5e5]">
                  <button
                    type="button"
                    onClick={() => setShowQuizModal(false)}
                    className="px-5 py-2.5 text-[#525252] hover:bg-[#f5f5f5] rounded-xl font-bold transition-colors text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#00236F] hover:bg-[#0B4FAE] text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-sm"
                  >
                    Simpan Seluruh Kuis
                  </button>
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
