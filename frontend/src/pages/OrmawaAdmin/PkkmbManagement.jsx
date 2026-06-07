import React, { useState, useEffect } from 'react';
import { PageContent, PageHeader } from '@/components/ui/page';


import { ormawaService, fetchWithAuth, getAuthToken, API_BASE_URL } from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import { DialogModal } from '@/components/ui/DialogModal';

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
        if (status === 'Lulus') return 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]';
        if (status === 'Proses') return 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning-light)]';
        return 'bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-error-light)]';
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
            id: item.id || item.ID,
            judul: item.Judul || item.judul,
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
            id: q.id || q.ID,
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
        <PageContent className="font-body">

            {/* ── Welcome Banner ─────────────────────────────────────────── */}
            <PageHeader
                icon="school"
                title="Manajemen Kencana"
                subtitle="Pusat kendali evaluasi dan monitoring progres mahasiswa baru pada program Pengenalan Kehidupan Kampus (PKKMB)."
             
        breadcrumbs={[ { label: 'Dashboard', path: '/ormawa' }, { label: 'Manajemen Kencana', path: '#' } ]} 
      />

            {/* ── Stat Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Peserta', value: summary.totalMaba, icon: Users, color: 'text-[var(--theme-info)]', bg: 'bg-[var(--theme-info-light)]', accent: 'from-[var(--theme-info-light)]/10' },
                    { label: 'Selesai / Lulus', value: summary.totalLulus, icon: CheckCircle, color: 'text-[var(--theme-success)]', bg: 'bg-[var(--theme-success-light)]', accent: 'from-[var(--theme-success-light)]/10' },
                    { label: 'Berproses', value: summary.totalProses, icon: Clock, color: 'text-[var(--theme-warning)]', bg: 'bg-[var(--theme-warning-light)]', accent: 'from-[var(--theme-warning-light)]/10' },
                ].map((s, idx) => (
                    <div key={idx} className="group bg-[var(--theme-surface)] rounded-2xl border border-border shadow-sm p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${s.accent} to-transparent rounded-bl-full opacity-40`} />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <s.icon size={18} />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-[var(--theme-text-subtle)] tracking-[0.15em] mb-1 font-headline uppercase">{s.label}</p>
                            <p className="text-3xl font-bold text-[var(--theme-text)] leading-none tabular-nums font-headline">
                                {loading ? '...' : s.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tab Navigation ─────────────────────────────────────────── */}
            <div className="flex items-center gap-2 bg-[var(--theme-surface)]/50 backdrop-blur-md p-1.5 rounded-2xl border border-border shadow-sm overflow-x-auto no-scrollbar max-w-fit">
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
                        className={`relative px-5 py-2.5 rounded-xl font-bold text-[11px] tracking-widest transition-colors duration-300 whitespace-nowrap outline-none ${activeTab === tab.id
                                ? 'text-[var(--theme-primary)]'
                                : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                            }`}
                    >
                        <span className="relative z-10">{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabBackground"
                                className="absolute inset-0 bg-[var(--theme-primary-light)] rounded-xl z-0"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Content Area ───────────────────────────────────────────── */}
            <div className="bg-[var(--theme-surface)] rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'ringkasan' && (
                            <div>
                                <div className="p-6 border-b border-[var(--theme-border-muted)]">
                                    <h2 className="text-[13px] font-bold text-[var(--theme-text)] tracking-widest font-headline uppercase">Breakdown Per Program Studi</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="bg-[var(--theme-bg)] border-b border-[var(--theme-border-muted)]">
                                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest uppercase">Program Studi</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest uppercase">Tingkat Partisipasi</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest text-center uppercase">Rata-rata Nilai</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest text-right uppercase">Status Kinerja</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--theme-border-muted)]">
                                            {loading ? (
                                                <tr><td colSpan="4" className="p-8 text-center text-[11px] font-bold text-[var(--theme-text-muted)] tracking-widest uppercase">Memuat data...</td></tr>
                                            ) : prodiData.length === 0 ? (
                                                <tr><td colSpan="4" className="p-8 text-center text-[11px] font-bold text-[var(--theme-text-muted)] tracking-widest uppercase">Belum ada data</td></tr>
                                            ) : (
                                                prodiData.map((item) => (
                                                    <tr key={item.id} className="hover:bg-[var(--theme-primary-light)] transition-colors">
                                                        <td className="px-6 py-4 font-bold text-[var(--theme-text)] text-sm">{item.prodi}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-[var(--theme-primary)] text-sm">{item.partisipasi.toFixed(1)}%</span>
                                                                <div className="flex-1 h-2 bg-[var(--theme-bg)] rounded-full max-w-[120px]">
                                                                    <div className="h-full bg-[var(--theme-primary)] rounded-full shadow-sm" style={{ width: `${Math.min(item.partisipasi, 100)}%` }} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold text-[var(--theme-text-muted)] text-sm">{item.nilai.toFixed(1)}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`inline-block px-3 py-1 text-[9px] font-bold tracking-widest rounded-lg border ${item.status === 'Optimal' ? 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]' : 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning-light)]'}`}>
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
                                        <span className="material-symbols-outlined size-4 text-[var(--theme-primary)]" >calendar_month</span>
                                        <h2 className="text-[13px] font-bold text-[var(--theme-text)] tracking-widest font-headline uppercase">Agenda & Kegiatan</h2>
                                    </div>
                                    <button
                                        onClick={() => { setFormData({ id: null, judul: '', deskripsi: '', tanggal: '', lokasi: '' }); setShowModal(true); }}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >add</span> Tambah Kegiatan
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {kegiatans.length === 0 && !loading && (
                                        <div className="col-span-full p-8 text-center text-[var(--theme-text-muted)] border-2 border-dashed border-border rounded-2xl text-[11px] font-bold tracking-widest uppercase">
                                            Belum ada kegiatan yang terdaftar
                                        </div>
                                    )}
                                    {kegiatans.map(k => (
                                        <div key={k.id || k.ID} className="group border border-border p-5 rounded-2xl bg-[var(--theme-surface)] hover:border-[var(--theme-primary)]/30 hover:shadow-md transition-all relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="bg-[var(--theme-primary-light)] text-[var(--theme-primary)] px-3 py-1 rounded-xl text-[10px] font-bold tracking-widest">
                                                    {new Date(k.Tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                </span>
                                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditModal(k)} className="p-1.5 bg-[var(--theme-surface)] border border-border text-[var(--theme-text)] rounded-lg shadow-sm hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)]">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteKegiatan(k.id || k.ID)} className="p-1.5 bg-[var(--theme-surface)] border border-border text-[var(--theme-error)] rounded-lg shadow-sm hover:border-[var(--theme-error)] hover:bg-[var(--theme-error-light)]">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-[var(--theme-text)] text-[15px] mb-2 leading-tight font-headline">{k.Judul}</h3>
                                            <p className="text-[12px] text-[var(--theme-text-muted)] mb-4 line-clamp-2 leading-relaxed">{k.Deskripsi}</p>
                                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--theme-border-muted)] text-[11px] font-bold text-[var(--theme-text-muted)]">
                                                <div className="w-6 h-6 rounded-full bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-muted)]">
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
                                        <span className="material-symbols-outlined size-4 text-[var(--theme-primary)]" >check_circle</span>
                                        <h2 className="text-[13px] font-bold text-[var(--theme-text)] tracking-widest font-headline uppercase">Manajemen Kuis</h2>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setQuizFormData({
                                                id: null, judul: '', deskripsi: '', durasi: 30,
                                                questions: [{ pertanyaan: '', tipe: 'multiple_choice', point: 10, options: [{ opsi: '', is_benar: false }] }]
                                            });
                                            setShowQuizModal(true);
                                        }}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >add</span> Buat Kuis Baru
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {quizzes.length === 0 && !loading && (
                                        <div className="col-span-full p-8 text-center text-[var(--theme-text-muted)] border-2 border-dashed border-border rounded-2xl text-[11px] font-bold tracking-widest uppercase">
                                            Belum ada kuis yang dibuat
                                        </div>
                                    )}
                                    {quizzes.map(q => (
                                        <div key={q.id || q.ID} className="group border border-border p-5 rounded-2xl bg-[var(--theme-surface)] hover:border-[var(--theme-primary)]/30 hover:shadow-md transition-all relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`px-3 py-1 rounded-xl text-[10px] font-bold tracking-widest ${q.is_active ? 'bg-[var(--theme-success-light)] text-[var(--theme-success)]' : 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)]'}`}>
                                                    {q.is_active ? 'Aktif' : 'Non-Aktif'}
                                                </span>
                                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditQuiz(q)} className="p-1.5 bg-[var(--theme-surface)] border border-border text-[var(--theme-text)] rounded-lg shadow-sm hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)]">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteQuiz(q.id || q.ID)} className="p-1.5 bg-[var(--theme-surface)] border border-border text-[var(--theme-error)] rounded-lg shadow-sm hover:border-[var(--theme-error)] hover:bg-[var(--theme-error-light)]">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-[var(--theme-text)] text-[15px] mb-2 leading-tight font-headline">{q.judul}</h3>
                                            <p className="text-[12px] text-[var(--theme-text-muted)] mb-4 line-clamp-2 leading-relaxed">{q.deskripsi}</p>
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--theme-border-muted)] text-[11px] font-bold text-[var(--theme-text-muted)]">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[var(--theme-text-subtle)]" style={{ fontSize: '14px' }} >schedule</span> {q.durasi} Menit
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[var(--theme-text-subtle)]" style={{ fontSize: '14px' }} >group</span> {q.questions?.length || 0} Soal
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'peserta' && (
                            <div>
                                <div className="p-6 border-b border-[var(--theme-border-muted)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined size-4 text-[var(--theme-primary)]" >group</span>
                                        <h2 className="text-[13px] font-bold text-[var(--theme-text)] tracking-widest font-headline uppercase">Data Peserta</h2>
                                    </div>
                                    <div className="relative w-full sm:w-64">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-subtle)]" style={{ fontSize: '14px' }} >search</span>
                                        <input
                                            type="text"
                                            placeholder="Cari NIM atau Nama..."
                                            className="w-full pl-9 pr-4 py-2 bg-[var(--theme-bg)] border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] transition-all placeholder:text-[var(--theme-text-subtle)]"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="bg-[var(--theme-bg)] border-b border-[var(--theme-border-muted)]">
                                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest uppercase">Mahasiswa</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest uppercase">Fakultas / Prodi</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest text-center uppercase">Nilai</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest text-right uppercase">Status Akhir</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--theme-border-muted)]">
                                            {loading ? (
                                                <tr><td colSpan="4" className="p-8 text-center text-[11px] font-bold text-[var(--theme-text-muted)] tracking-widest uppercase">Memuat data...</td></tr>
                                            ) : students.length === 0 ? (
                                                <tr><td colSpan="4" className="p-8 text-center text-[11px] font-bold text-[var(--theme-text-muted)] tracking-widest uppercase">Belum ada peserta</td></tr>
                                            ) : (
                                                students.map((s) => (
                                                    <tr key={s.id || s.ID} className="hover:bg-[var(--theme-primary-light)] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-[var(--theme-text)] text-[13px]">{s.Mahasiswa?.Nama}</span>
                                                                <span className="text-[10px] font-bold text-[var(--theme-text-subtle)] tracking-wider">{s.Mahasiswa?.NIM}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[11px] font-bold text-[var(--theme-text-muted)] bg-[var(--theme-bg)] px-2.5 py-1 rounded-lg">
                                                                {s.Mahasiswa?.ProgramStudi?.Nama || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold text-[var(--theme-primary)] text-sm">{s.Nilai?.toFixed(1) || '0.0'}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`inline-block px-3 py-1 text-[9px] font-bold tracking-widest rounded-lg border ${getStatusColor(s.StatusKelulusan)}`}>
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
                                        <span className="material-symbols-outlined size-4 text-[var(--theme-warning)]" >error</span>
                                        <h2 className="text-[13px] font-bold text-[var(--theme-text)] tracking-widest font-headline uppercase">Antrean Banding</h2>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {mockBanding.map(b => (
                                        <div key={b.id} className="border border-border p-5 rounded-2xl bg-[var(--theme-surface)] shadow-sm flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--theme-text-subtle)] tracking-widest mb-1">{b.nim}</p>
                                                    <h4 className="font-bold text-[var(--theme-text)] text-[13px]">{b.nama}</h4>
                                                </div>
                                                <span className="bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border border-[var(--theme-warning-light)] text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-lg">
                                                    Menunggu
                                                </span>
                                            </div>
                                            <div className="bg-[var(--theme-bg)] p-4 rounded-xl border border-border mb-5 flex-1">
                                                <p className="text-[11px] font-bold text-[var(--theme-text)] mb-1.5">{b.kuis}</p>
                                                <p className="text-[11px] text-[var(--theme-text-muted)] mb-3">
                                                    Nilai awal: <strong className="text-[var(--theme-primary)]">{b.nilaiLama}</strong>
                                                </p>
                                                <div className="h-px bg-[var(--theme-border)] my-3" />
                                                <p className="text-[11px] text-[var(--theme-text-muted)] leading-relaxed relative pl-3 border-l-2 border-[var(--theme-primary)]/20">"{b.alasan}"</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="flex-1 py-2 text-[11px] font-bold text-[var(--theme-error)] bg-[var(--theme-error-light)] border border-[var(--theme-error-light)] hover:bg-[var(--theme-error)] hover:text-white rounded-xl transition-colors">Tolak</button>
                                                <button className="flex-1 py-2 text-[11px] font-bold text-white bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] rounded-xl transition-colors shadow-sm">Review</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* MODAL FORM KEGIATAN */}
            <DialogModal
                open={showModal}
                onOpenChange={setShowModal}
                title={formData.id ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
                description="Lengkapi detail agenda kegiatan PKKMB mahasiswa baru."
            >
                <form onSubmit={handleSaveKegiatan} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest mb-1.5 uppercase">Judul Kegiatan</label>
                        <input
                            type="text" required value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                            className="w-full h-10 px-4 bg-[var(--theme-bg)]/50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--theme-primary)] transition-all placeholder:font-medium text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)]" placeholder="Contoh: Pengenalan Visi Misi"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest mb-1.5 uppercase">Tanggal Pelaksanaan</label>
                        <input
                            type="datetime-local" required value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                            className="w-full h-10 px-4 bg-[var(--theme-bg)]/50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--theme-primary)] transition-all text-[var(--theme-text)]"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest mb-1.5 uppercase">Lokasi / Ruangan</label>
                        <input
                            type="text" required value={formData.lokasi} onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                            className="w-full h-10 px-4 bg-[var(--theme-bg)]/50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--theme-primary)] transition-all placeholder:font-medium text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)]" placeholder="Contoh: Gedung A / Zoom"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest mb-1.5 uppercase">Deskripsi Singkat</label>
                        <textarea
                            required value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[var(--theme-bg)]/50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--theme-primary)] transition-all min-h-[100px] resize-y placeholder:font-medium text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)]" placeholder="Penjelasan singkat mengenai materi..."
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={() => setShowModal(false)} className="h-10 px-5 text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] rounded-xl font-bold transition-colors text-[11px] tracking-widest uppercase">Batal</button>
                        <button type="submit" className="h-10 px-6 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-[11px] tracking-widest uppercase">Simpan</button>
                    </div>
                </form>
            </DialogModal>

            {/* MODAL FORM KUIS */}
            <DialogModal
                open={showQuizModal}
                onOpenChange={setShowQuizModal}
                title={quizFormData.id ? 'Edit Kuis' : 'Buat Kuis Baru'}
                description="Lengkapi detail materi kuis dan butir soal evaluasi PKKMB."
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSaveQuiz} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest mb-1.5 uppercase">Judul Kuis</label>
                            <input
                                type="text" required value={quizFormData.judul} onChange={(e) => setQuizFormData({ ...quizFormData, judul: e.target.value })}
                                className="w-full h-10 px-4 bg-[var(--theme-bg)]/50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--theme-primary)] transition-all placeholder:font-medium text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)]" placeholder="Misal: Kuis Wawasan Kebangsaan"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest mb-1.5 uppercase">Deskripsi</label>
                            <textarea
                                required value={quizFormData.deskripsi} onChange={(e) => setQuizFormData({ ...quizFormData, deskripsi: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[var(--theme-bg)]/50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--theme-primary)] min-h-[80px] text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest mb-1.5 uppercase">Durasi (Menit)</label>
                            <input
                                type="number" required value={quizFormData.durasi} onChange={(e) => setQuizFormData({ ...quizFormData, durasi: parseInt(e.target.value) })}
                                className="w-full h-10 px-4 bg-[var(--theme-bg)]/50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--theme-primary)] text-[var(--theme-text)]"
                            />
                        </div>
                    </div>

                    <div className="border-t border-border pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[11px] font-bold text-[var(--theme-text)] tracking-widest uppercase">Daftar Pertanyaan</h4>
                            <button type="button" onClick={() => {
                                const newQuestions = [...quizFormData.questions, { pertanyaan: '', tipe: 'multiple_choice', point: 10, options: [{ opsi: '', is_benar: false }] }];
                                setQuizFormData({ ...quizFormData, questions: newQuestions });
                            }}
                                className="text-[10px] font-bold text-[var(--theme-primary)] hover:underline flex items-center gap-1 tracking-widest uppercase"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >add</span> Tambah Soal
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            {quizFormData.questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-5 bg-[var(--theme-surface)] border border-border rounded-2xl relative group shadow-sm">
                                    <button type="button" onClick={() => {
                                        const newQ = quizFormData.questions.filter((_, i) => i !== qIndex);
                                        setQuizFormData({ ...quizFormData, questions: newQ });
                                    }}
                                        className="absolute -right-2 -top-2 w-6 h-6 bg-[var(--theme-error-light)] text-[var(--theme-error)] rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--theme-error)] hover:text-white"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >close</span>
                                    </button>

                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold text-[var(--theme-primary)] tracking-widest mb-1.5 uppercase">Soal #{qIndex + 1}</label>
                                        <input
                                            type="text" required value={q.pertanyaan} onChange={(e) => {
                                                const newQ = [...quizFormData.questions]; newQ[qIndex].pertanyaan = e.target.value; setQuizFormData({ ...quizFormData, questions: newQ });
                                            }}
                                            className="w-full h-10 px-4 bg-[var(--theme-bg)]/50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--theme-primary)] text-[var(--theme-text)]" placeholder="Tulis pertanyaan..."
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] tracking-widest uppercase">Pilihan Jawaban</label>
                                            <button type="button" onClick={() => {
                                                const newQ = [...quizFormData.questions]; newQ[qIndex].options.push({ opsi: '', is_benar: false }); setQuizFormData({ ...quizFormData, questions: newQ });
                                            }}
                                                className="text-[9px] font-bold text-[var(--theme-primary)] tracking-widest bg-[var(--theme-primary-light)] px-2 py-1 rounded-lg uppercase"
                                            >
                                                + Opsi
                                            </button>
                                        </div>
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex gap-3 items-center">
                                                <label className="relative flex items-center cursor-pointer">
                                                    <input type="radio" name={`correct-${qIndex}`} checked={opt.is_benar} onChange={() => {
                                                        const newQ = [...quizFormData.questions]; newQ[qIndex].options.forEach((o, i) => o.is_benar = i === oIndex); setQuizFormData({ ...quizFormData, questions: newQ });
                                                    }}
                                                        className="peer sr-only"
                                                    />
                                                    <div className="w-5 h-5 rounded-full border-2 border-border peer-checked:border-[var(--theme-primary)] peer-checked:bg-[var(--theme-primary)] transition-all flex items-center justify-center">
                                                        {opt.is_benar && <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }} >check_circle</span>}
                                                    </div>
                                                </label>
                                                <input type="text" required value={opt.opsi} onChange={(e) => {
                                                    const newQ = [...quizFormData.questions]; newQ[qIndex].options[oIndex].opsi = e.target.value; setQuizFormData({ ...quizFormData, questions: newQ });
                                                }}
                                                    className="flex-1 h-10 px-4 bg-[var(--theme-bg)]/50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--theme-primary)] text-[var(--theme-text)]" placeholder={`Opsi ${String.fromCharCode(65 + oIndex)}`}
                                                />
                                                <button type="button" onClick={() => {
                                                    const newQ = [...quizFormData.questions]; newQ[qIndex].options = newQ[qIndex].options.filter((_, i) => i !== oIndex); setQuizFormData({ ...quizFormData, questions: newQ });
                                                }}
                                                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-error)] transition-colors p-1"
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
                        <button type="button" onClick={() => setShowQuizModal(false)} className="h-10 px-5 text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] rounded-xl font-bold transition-colors text-[11px] tracking-widest uppercase">Batal</button>
                        <button type="submit" className="h-10 px-6 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-[11px] tracking-widest uppercase">Simpan Kuis</button>
                    </div>
                </form>
            </DialogModal>

        </PageContent>
    );
};

export default PkkmbManagement;
