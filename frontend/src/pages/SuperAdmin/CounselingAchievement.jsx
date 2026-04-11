import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Calendar, User, UserCheck, CheckCircle2, AlertCircle, Save, X, Loader2 } from 'lucide-react';

const CounselingAchievement = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedID, setSelectedID] = useState(null);

    const [form, setForm] = useState({
        MahasiswaID: '',
        DosenID: '',
        Topik: '',
        Status: 'Diproses',
        Tanggal: new Date().toISOString().split('T')[0],
        Catatan: ''
    });

    const [students, setStudents] = useState([]);
    const [lecturers, setLecturers] = useState([]);

    useEffect(() => {
        loadData();
        loadDropdowns();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllCounseling();
            if (res.status === 'success') {
                setSessions(res.data || []);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error(error.message || 'Gagal memuat data konseling');
        } finally {
            setLoading(false);
        }
    };

    const loadDropdowns = async () => {
        try {
            const [stdRes, lecRes] = await Promise.all([
                adminService.getAllStudents(),
                adminService.getAllLecturers()
            ]);
            if (stdRes.status === 'success') setStudents(stdRes.data || []);
            if (lecRes.status === 'success') setLecturers(lecRes.data || []);
        } catch (error) {
            console.error('Failed to load dropdown data');
        }
    };

    const handleOpenAdd = () => {
        setIsEditMode(false);
        setForm({
            MahasiswaID: '',
            DosenID: '',
            Topik: '',
            Status: 'Diproses',
            Tanggal: new Date().toISOString().split('T')[0],
            Catatan: ''
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (s) => {
        setIsEditMode(true);
        setSelectedID(s.ID);
        setForm({
            MahasiswaID: s.MahasiswaID,
            DosenID: s.DosenID,
            Topik: s.Topik,
            Status: s.Status,
            Tanggal: s.Tanggal ? s.Tanggal.split('T')[0] : '',
            Catatan: s.Catatan || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus sesi konseling ini?')) return;
        try {
            await adminService.deleteCounseling(id);
            toast.success('Sesi berhasil dihapus');
            loadData();
        } catch (error) {
            toast.error('Gagal menghapus sesi');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Bersihkan data sebelum dikirim
            const payload = {
                MahasiswaID: parseInt(form.MahasiswaID),
                DosenID: parseInt(form.DosenID),
                Topik: form.Topik,
                Status: form.Status,
                Catatan: form.Catatan,
                Tanggal: new Date(form.Tanggal).toISOString() // Kirim dalam format ISO8601 agar Go bisa baca
            };

            const res = isEditMode 
                ? await adminService.updateCounseling(selectedID, payload)
                : await adminService.createCounseling(payload);

            if (res.status === 'success') {
                toast.success(isEditMode ? 'Sesi diperbarui' : 'Sesi berhasil dibuat');
                setIsModalOpen(false);
                loadData();
            } else {
                toast.error(res.message || 'Gagal menyimpan data');
            }
        } catch (error) {
            console.error('Submission Error:', error);
            toast.error(error.message || 'Terjadi kesalahan sistem');
        } finally {
            setIsSubmitting(false);
        }
    };

    const pendingSessions = sessions.filter(s => s.Status !== 'Selesai').length;

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none">
            <Sidebar />
            <Toaster position="top-right" />
            <main className="pl-72 pt-20 flex flex-col min-h-screen w-full font-body">

                <TopNavBar />
                <div className="p-8 space-y-8">
                    <header className="flex justify-between items-end">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Calendar className="size-6" /></div>
                                <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">Global Welfare & Counseling</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cross-faculty monitoring of student mental health and consultation sessions.</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleOpenAdd}
                            className="bg-primary px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95">
                            <Plus className="size-4 stroke-[3px]" />
                            Record New Session
                        </button>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Achievement Verification Queue */}
                        <section className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-200/60 space-y-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-20" />
                            <div className="flex justify-between items-center font-body">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-tight flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    Consultation Pipeline
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-black tracking-widest uppercase border border-primary/10">
                                        {loading ? '...' : pendingSessions} Active Sessions
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 font-body">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400 uppercase font-black text-[10px] tracking-widest">
                                        <Loader2 className="size-8 animate-spin text-primary/40" />
                                        Mensinkronkan sesi konseling...
                                    </div>
                                ) : sessions.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest flex flex-col items-center gap-4">
                                        <div className="size-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100"><Calendar className="size-8 opacity-20" /></div>
                                        Tidak ada record sesi ditemukan.
                                    </div>
                                ) : sessions.map((s) => (
                                    <div key={s.ID} className="flex items-center justify-between p-6 bg-slate-50/30 rounded-[2.5rem] border border-slate-100 group hover:border-primary/40 hover:bg-white hover:scale-[1.01] transition-all duration-300">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                <UserCheck className="size-6 stroke-[2.5px]" />
                                            </div>
                                            <div className="font-body space-y-1">
                                                <p className="font-black text-slate-900 leading-tight uppercase tracking-tight text-sm">{s.Topik}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">
                                                        <User className="size-3" />
                                                        Pasien: {s.Mahasiswa?.Nama || 'Mahasiswa'} (NIM: {s.Mahasiswa?.NIM || '-'})
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        <UserCheck className="size-3" />
                                                        Dosen: {s.Dosen?.Nama || 'Dosen'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-right font-body">
                                            <div>
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                                    s.Status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                    {s.Status}
                                                </span>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 italic">{new Date(s.Tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenEdit(s)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all"><Pencil className="size-4" /></button>
                                                <button onClick={() => handleDelete(s.ID)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all"><Trash2 className="size-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Counseling Activity Stats */}
                        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-200 space-y-8 shadow-sm font-body relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><Calendar className="size-32 rotate-12" /></div>
                            <div className="space-y-2 relative z-10">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <div className="w-3 h-1 bg-primary/30 rounded-full" />
                                    Total Record
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{sessions.length.toString().padStart(2, '0')}</h3>
                            </div>
                            
                            <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] flex flex-col gap-5 font-body">
                                <div className="size-12 rounded-[1.5rem] bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm">
                                    <CheckCircle2 className="size-6" />
                                </div>
                                <p className="text-[11px] text-slate-500 font-bold leading-relaxed italic">
                                    Data ini merupakan agregat sesi konseling tingkat universitas untuk memantau beban kerja bimbingan akademik dan kesehatan mental mahasiswa.
                                </p>
                            </div>

                            <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                                Export Summary Report
                            </button>
                        </section>
                    </div>
                </div>

                {/* CRUD MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
                            <header className="p-10 pb-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-xl text-primary">{isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4" />}</div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Welfare Management</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter font-headline">{isEditMode ? 'Edit Session Record' : 'Record New Counseling'}</h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white rounded-3xl text-slate-400 hover:text-slate-900 shadow-sm border border-slate-200 hover:rotate-90 transition-all duration-500"><X className="size-5" /></button>
                            </header>

                            <form onSubmit={handleSubmit} className="p-10 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nama Mahasiswa</label>
                                        <select 
                                            required
                                            value={form.MahasiswaID}
                                            onChange={e => setForm({...form, MahasiswaID: e.target.value})}
                                            className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white focus:ring-2 ring-primary/20 transition-all appearance-none outline-none"
                                        >
                                            <option value="">Pilih Mahasiswa...</option>
                                            {students.map(s => <option key={s.ID} value={s.ID}>{s.Nama} ({s.NIM})</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Dosen Pembimbing</label>
                                        <select 
                                            required
                                            value={form.DosenID}
                                            onChange={e => setForm({...form, DosenID: e.target.value})}
                                            className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white focus:ring-2 ring-primary/20 transition-all appearance-none outline-none"
                                        >
                                            <option value="">Pilih Dosen...</option>
                                            {lecturers.map(l => <option key={l.ID} value={l.ID}>{l.Nama} ({l.NIDN})</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Topik Konseling</label>
                                    <input 
                                        required
                                        value={form.Topik}
                                        onChange={e => setForm({...form, Topik: e.target.value})}
                                        placeholder="Masukan topik bimbingan/keluhan..."
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white focus:ring-2 ring-primary/20 transition-all outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tanggal Sesi</label>
                                        <input 
                                            type="date"
                                            required
                                            value={form.Tanggal}
                                            onChange={e => setForm({...form, Tanggal: e.target.value})}
                                            className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white focus:ring-2 ring-primary/20 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Status</label>
                                        <select 
                                            value={form.Status}
                                            onChange={e => setForm({...form, Status: e.target.value})}
                                            className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white focus:ring-2 ring-primary/20 transition-all appearance-none outline-none"
                                        >
                                            <option value="Diproses">Diproses</option>
                                            <option value="Selesai">Selesai</option>
                                            <option value="Batal">Batal</option>
                                        </select>
                                    </div>
                                </div>

                                <footer className="pt-6 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-16 rounded-2xl border border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] h-16 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3">
                                        {isSubmitting ? <Loader2 className="animate-spin size-4" /> : <Save className="size-4" />}
                                        {isEditMode ? 'Update Session' : 'Save Session'}
                                    </button>
                                </footer>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CounselingAchievement;
