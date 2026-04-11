import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { 
    Plus, Pencil, Trash2, Calendar, User, UserCheck, 
    CheckCircle2, AlertCircle, Save, X, Loader2,
    Clock, MapPin, Users, LayoutDashboard, ClipboardList
} from 'lucide-react';

const CounselingAchievement = () => {
    const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' or 'bookings'
    const [schedules, setSchedules] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedID, setSelectedID] = useState(null);

    // Form for Schedules
    const [scheduleForm, setScheduleForm] = useState({
        kategori: 'Akademik',
        nama_konselor: '',
        tanggal: new Date().toISOString().split('T')[0],
        jam_mulai: '09:00',
        jam_selesai: '10:00',
        lokasi: '',
        kuota: 10,
        is_aktif: true
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'schedules') {
                const res = await adminService.getAllCounselingSchedules();
                if (res.status === 'success') setSchedules(res.data || []);
            } else {
                const res = await adminService.getAllCounseling();
                if (res.status === 'success') setBookings(res.data || []);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setIsEditMode(false);
        setScheduleForm({
            kategori: 'Akademik',
            nama_konselor: '',
            tanggal: new Date().toISOString().split('T')[0],
            jam_mulai: '09:00',
            jam_selesai: '10:00',
            lokasi: '',
            kuota: 10,
            is_aktif: true
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (s) => {
        setIsEditMode(true);
        setSelectedID(s.ID);
        setScheduleForm({
            kategori: s.kategori || 'Akademik',
            nama_konselor: s.nama_konselor || '',
            tanggal: s.tanggal ? s.tanggal.split('T')[0] : '',
            jam_mulai: s.jam_mulai || '09:00',
            jam_selesai: s.jam_selesai || '10:00',
            lokasi: s.lokasi || '',
            kuota: s.kuota || 10,
            is_aktif: s.is_aktif
        });
        setIsModalOpen(true);
    };

    const handleDeleteSchedule = async (id) => {
        if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;
        try {
            await adminService.deleteCounselingSchedule(id);
            toast.success('Jadwal berhasil dihapus');
            loadData();
        } catch (error) {
            toast.error('Gagal menghapus jadwal');
        }
    };

    const handleUpdateBookingStatus = async (id, status) => {
        try {
            await adminService.updateCounseling(id, { Status: status });
            toast.success('Status booking diperbarui');
            loadData();
        } catch (error) {
            toast.error('Gagal memperbarui status');
        }
    };

    const handleSubmitSchedule = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...scheduleForm,
                kuota: parseInt(scheduleForm.kuota),
                tanggal: new Date(scheduleForm.tanggal).toISOString()
            };

            const res = isEditMode 
                ? await adminService.updateCounselingSchedule(selectedID, payload)
                : await adminService.createCounselingSchedule(payload);

            if (res.status === 'success') {
                toast.success(isEditMode ? 'Jadwal diperbarui' : 'Jadwal berhasil dibuat');
                setIsModalOpen(false);
                loadData();
            }
        } catch (error) {
            toast.error(error.message || 'Terjadi kesalahan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <Toaster position="top-right" />
            
            <header className="flex justify-between items-end">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary"><Calendar className="size-6" /></div>
                        <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">Counseling Hub</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-10 bg-primary rounded-full" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage consultation slots and student appointments.</p>
                    </div>
                </div>
                {activeTab === 'schedules' && (
                    <button 
                        onClick={handleOpenAdd}
                        className="bg-primary px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95">
                        <Plus className="size-4 stroke-[3px]" />
                        Create New Slot
                    </button>
                )}
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab('schedules')}
                    className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'schedules' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
                    Master Jadwal
                    {activeTab === 'schedules' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary-rgb),0.5)]" />}
                </button>
                <button 
                    onClick={() => setActiveTab('bookings')}
                    className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'bookings' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
                    Booking Mahasiswa
                    {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary-rgb),0.5)]" />}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <section className="bg-white p-10 rounded-[3.5rem] border border-slate-200/60 space-y-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-20" />
                    
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400 uppercase font-black text-[10px] tracking-widest">
                            <Loader2 className="size-8 animate-spin text-primary/40" />
                            Mensinkronkan data...
                        </div>
                    ) : activeTab === 'schedules' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {schedules.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest flex flex-col items-center gap-4">
                                    <div className="size-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100"><Calendar className="size-8 opacity-20" /></div>
                                    Belum ada jadwal yang dibuat.
                                </div>
                            ) : schedules.map((s) => (
                                <div key={s.ID} className="p-8 bg-slate-50/30 rounded-[2.5rem] border border-slate-100 space-y-6 hover:border-primary/40 hover:bg-white transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                s.kategori === 'Akademik' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                s.kategori === 'Karir' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                                {s.kategori}
                                            </span>
                                            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">{s.nama_konselor}</h3>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenEdit(s)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all"><Pencil className="size-3.5" /></button>
                                            <button onClick={() => handleDeleteSchedule(s.ID)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all"><Trash2 className="size-3.5" /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-500 font-bold text-[11px] uppercase tracking-tight">
                                            <Calendar className="size-4 text-primary" />
                                            {new Date(s.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 font-bold text-[11px] uppercase tracking-tight">
                                            <Clock className="size-4 text-primary" />
                                            {s.jam_mulai} - {s.jam_selesai}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 font-bold text-[11px] uppercase tracking-tight">
                                            <MapPin className="size-4 text-primary" />
                                            {s.lokasi}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Users className="size-4 text-slate-300" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kuota: {s.sisa_kuota} / {s.kuota}</span>
                                        </div>
                                        <div className={`size-3 rounded-full ${s.is_aktif ? 'bg-emerald-400' : 'bg-slate-300'}`} title={s.is_aktif ? 'Aktif' : 'Nonaktif'} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.length === 0 ? (
                                <div className="py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest flex flex-col items-center gap-4">
                                    <div className="size-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100"><ClipboardList className="size-8 opacity-20" /></div>
                                    Tidak ada riwayat booking ditemukan.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mahasiswa</th>
                                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sesi / Topik</th>
                                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {bookings.map((b) => (
                                                <tr key={b.ID} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                                                                {b.Mahasiswa?.Nama?.charAt(0) || 'M'}
                                                            </div>
                                                            <div>
                                                                <p className="text-[13px] font-black text-slate-900 tracking-tight uppercase">{b.Mahasiswa?.Nama || 'Mahasiswa'}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase italic">{b.Mahasiswa?.NIM || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6">
                                                        <p className="text-[12px] font-black text-slate-600 uppercase tracking-tight leading-tight">{b.Topik}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-[10px] font-bold text-slate-400">{b.Catatan?.split(',')[0] || 'Unknown Konselor'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-6">
                                                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">
                                                            {new Date(b.Tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                        </p>
                                                    </td>
                                                    <td className="py-6">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                            b.Status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            b.Status === 'Batal' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                            {b.Status}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {b.Status === 'Menunggu' && (
                                                                <>
                                                                    <button 
                                                                        onClick={() => handleUpdateBookingStatus(b.ID, 'Proses')}
                                                                        className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
                                                                        Confirm
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleUpdateBookingStatus(b.ID, 'Batal')}
                                                                        className="px-3 py-2 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all">
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            {b.Status === 'Proses' && (
                                                                <button 
                                                                    onClick={() => handleUpdateBookingStatus(b.ID, 'Selesai')}
                                                                    className="px-4 py-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all">
                                                                    Complete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* CRUD MODAL FOR SCHEDULES */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <header className="p-10 pb-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary">{isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4" />}</div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Schedule Configuration</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter font-headline">{isEditMode ? 'Edit consultation Slot' : 'Create New Slot'}</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white rounded-3xl text-slate-400 hover:text-slate-900 shadow-sm border border-slate-200 hover:rotate-90 transition-all duration-500"><X className="size-5" /></button>
                        </header>

                        <form onSubmit={handleSubmitSchedule} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Kategori</label>
                                    <select 
                                        required
                                        value={scheduleForm.kategori}
                                        onChange={e => setScheduleForm({...scheduleForm, kategori: e.target.value})}
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white focus:ring-2 ring-primary/20 transition-all outline-none"
                                    >
                                        <option value="Akademik">Akademik</option>
                                        <option value="Karir">Karir</option>
                                        <option value="Personal">Personal</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nama Psikiater / Konselor</label>
                                    <input 
                                        required
                                        value={scheduleForm.nama_konselor}
                                        onChange={e => setScheduleForm({...scheduleForm, nama_konselor: e.target.value})}
                                        placeholder="Nama lengkap konselor..."
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white focus:ring-2 ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tanggal</label>
                                    <input 
                                        type="date"
                                        required
                                        value={scheduleForm.tanggal}
                                        onChange={e => setScheduleForm({...scheduleForm, tanggal: e.target.value})}
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white outline-none ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Jam Mulai</label>
                                    <input 
                                        type="time"
                                        required
                                        value={scheduleForm.jam_mulai}
                                        onChange={e => setScheduleForm({...scheduleForm, jam_mulai: e.target.value})}
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Jam Selesai</label>
                                    <input 
                                        type="time"
                                        required
                                        value={scheduleForm.jam_selesai}
                                        onChange={e => setScheduleForm({...scheduleForm, jam_selesai: e.target.value})}
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Ruangan / Lokasi</label>
                                    <input 
                                        required
                                        value={scheduleForm.lokasi}
                                        onChange={e => setScheduleForm({...scheduleForm, lokasi: e.target.value})}
                                        placeholder="Contoh: Gedung A, Lantai 2"
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Kuota Siswa</label>
                                    <input 
                                        type="number"
                                        required
                                        min="1"
                                        value={scheduleForm.kuota}
                                        onChange={e => setScheduleForm({...scheduleForm, kuota: e.target.value})}
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:bg-white outline-none"
                                    />
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
                                    {isEditMode ? 'Update schedule' : 'Save schedule'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CounselingAchievement;
