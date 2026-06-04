import React, { useEffect, useMemo, useState } from 'react';
import { tenagaKesehatanService } from '../../services/api';

const AddIcon = () => <span className="material-symbols-outlined text-sm">add</span>;
const EditIcon = () => <span className="material-symbols-outlined text-sm">edit</span>;
const DeleteIcon = () => <span className="material-symbols-outlined text-sm">delete</span>;
const RefreshIcon = ({ className }) => <span className={`material-symbols-outlined text-sm ${className || ''}`}>sync</span>;

const SERVICE_TYPES = [
  'Pemeriksaan Umum',
  'Konsultasi Gizi',
  'Screening Khusus',
  'Pemeriksaan Gigi',
  'Rujukan Eksternal',
  'Lainnya'
];

const REPEAT_DAYS_OPTIONS = [
  { label: 'Senin', value: 'Monday' },
  { label: 'Selasa', value: 'Tuesday' },
  { label: 'Rabu', value: 'Wednesday' },
  { label: 'Kamis', value: 'Thursday' },
  { label: 'Jumat', value: 'Friday' },
  { label: 'Sabtu', value: 'Saturday' },
  { label: 'Minggu', value: 'Sunday' }
];

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  // Form States
  const [tanggal, setTanggal] = useState('');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('12:00');
  const [kuota, setKuota] = useState(10);
  const [lokasi, setLokasi] = useState('Klinik Kampus BKU');
  const [tipeLayanan, setTipeLayanan] = useState('Pemeriksaan Umum');
  const [catatan, setCatatan] = useState('');
  const [isRepeat, setIsRepeat] = useState(false);
  const [selectedRepeatDays, setSelectedRepeatDays] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    tenagaKesehatanService.getSchedules()
      .then((res) => {
        setSchedules(res.data || []);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat data jadwal.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalSlots = schedules.length;
    const totalQuota = schedules.reduce((acc, curr) => acc + (curr.kuota || 0), 0);
    const uniqueDays = new Set(schedules.map(s => (s.tanggal || '').split('T')[0])).size;
    return { totalSlots, totalQuota, uniqueDays };
  }, [schedules]);

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setTanggal(new Date().toISOString().split('T')[0]);
    setJamMulai('08:00');
    setJamSelesai('12:00');
    setKuota(10);
    setLokasi('Klinik Kampus BKU');
    setTipeLayanan('Pemeriksaan Umum');
    setCatatan('');
    setIsRepeat(false);
    setSelectedRepeatDays([]);
    setShowModal(true);
  };

  const handleOpenEdit = (sch) => {
    setEditingSchedule(sch);
    // Parse Tanggal (remove time part if any)
    const rawDate = sch.tanggal ? sch.tanggal.split('T')[0] : '';
    setTanggal(rawDate);
    setJamMulai(sch.jam_mulai || '08:00');
    setJamSelesai(sch.jam_selesai || '12:00');
    setKuota(sch.kuota || 10);
    setLokasi(sch.lokasi || 'Klinik Kampus BKU');
    setTipeLayanan(sch.tipe_layanan || 'Pemeriksaan Umum');
    setCatatan(sch.catatan || '');
    setIsRepeat(sch.is_repeat || false);
    setSelectedRepeatDays(sch.repeat_days ? sch.repeat_days.split(',') : []);
    setShowModal(true);
  };

  const handleToggleDay = (dayValue) => {
    setSelectedRepeatDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue) 
        : [...prev, dayValue]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tanggal) {
      alert('Harap pilih tanggal.');
      return;
    }
    if (jamSelesai <= jamMulai) {
      alert('Jam selesai harus setelah jam mulai.');
      return;
    }

    const payload = {
      tanggal,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      kuota: Number(kuota),
      lokasi,
      tipe_layanan: tipeLayanan,
      catatan,
      is_repeat: isRepeat,
      repeat_days: isRepeat ? selectedRepeatDays.join(',') : ''
    };

    setSubmitting(true);
    try {
      if (editingSchedule) {
        await tenagaKesehatanService.updateSchedule(editingSchedule.id, payload);
      } else {
        await tenagaKesehatanService.createSchedule(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan jadwal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus slot jadwal ini?')) return;
    try {
      await tenagaKesehatanService.deleteSchedule(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Gagal menghapus jadwal.');
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '-';
    const cleanStr = dateStr.split('T')[0];
    const date = new Date(cleanStr);
    if (isNaN(date)) return cleanStr;
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Welcome Banner Card */}
        <section className="relative overflow-hidden rounded-2xl bg-[radial-gradient(at_0%_0%,rgba(0,35,111,0.05)_0px,transparent_50%)] border border-slate-200/60 p-6 shadow-sm flex flex-col gap-5 group glass-card">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-bku-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between w-full">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-bku-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-bku-primary">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                Klinik Kampus BKU
              </div>
              <h1 className="mt-3 text-2xl font-black text-slate-800 uppercase tracking-tight font-headline">Jadwal Praktik</h1>
              <p className="text-xs font-bold leading-5 text-slate-500">
                Atur ketersediaan slot jam layanan kesehatan Klinik Kampus untuk booking janji temu mahasiswa secara reguler.
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50"
              >
                <RefreshIcon className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-bku-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-bku-primary/10 transition-all hover:bg-bku-hover hover:scale-[1.02] active:scale-[0.98]"
              >
                <AddIcon />
                Tambah Slot Praktik
              </button>
            </div>
          </div>
        </section>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 w-full">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-sm transition-all duration-300 hover:shadow-md glass-card">
            <div className="absolute -right-8 -top-5 w-24 h-24 bg-bku-primary/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-bku-primary/5 text-bku-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                <span className="material-symbols-outlined text-xl">event</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                AKTIF
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-5">Hari Pelayanan</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-800 tracking-tight leading-none">{stats.uniqueDays}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">jumlah hari buka pelayanan</p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-sm transition-all duration-300 hover:shadow-md glass-card">
            <div className="absolute -right-8 -top-5 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                <span className="material-symbols-outlined text-xl">list_alt</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                TOTAL
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-5">Total Slot</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-800 tracking-tight leading-none">{stats.totalSlots}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">seluruh slot aktif terdaftar</p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-sm transition-all duration-300 hover:shadow-md glass-card">
            <div className="absolute -right-8 -top-5 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                <span className="material-symbols-outlined text-xl">group</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                KUOTA
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-5">Kuota Layanan</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-800 tracking-tight leading-none">{stats.totalQuota}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">pasien yang bisa ditampung</p>
          </div>
        </div>

        {/* Schedule List Section */}
        <section className="bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4 glass-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-bku-primary font-headline">Jadwal Aktif Terdaftar</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1">Daftar hari pelayanan yang terlihat oleh mahasiswa</p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-400">
              <span className="material-symbols-outlined text-3xl animate-spin text-bku-primary/50">sync</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Memuat daftar jadwal...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-xs text-rose-500 font-bold">{error}</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center text-center p-6">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-300">
                <span className="material-symbols-outlined text-xl">event_busy</span>
              </div>
              <h3 className="mt-4 text-xs font-black uppercase tracking-tight text-slate-700">Belum Ada Jadwal Praktik</h3>
              <p className="mt-1 max-w-sm text-xs font-semibold text-slate-500">Silakan tambahkan jadwal praktik agar mahasiswa dapat memilih waktu berobat/konsultasi.</p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-4 rounded-xl bg-bku-primary px-4 py-2 text-xs font-bold text-white hover:bg-bku-hover transition-all"
              >
                Buat Jadwal Pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Tanggal Pelayanan</th>
                    <th className="py-3 px-4">Waktu Praktik</th>
                    <th className="py-3 px-4">Tipe Layanan</th>
                    <th className="py-3 px-4">Lokasi</th>
                    <th className="py-3 px-4">Kuota Pasien</th>
                    <th className="py-3 px-4">Catatan Khusus</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                  {schedules.map((sch) => (
                    <tr key={sch.id} className="hover:bg-bku-primary/5 transition-colors duration-150">
                      <td className="py-4 px-4 font-bold text-slate-800">
                        {formatDisplayDate(sch.tanggal)}
                        {sch.is_repeat && (
                          <div className="mt-1 text-[8px] font-extrabold text-bku-primary bg-bku-primary/5 px-2 py-0.5 rounded-full w-fit uppercase tracking-widest">
                            Berulang: {sch.repeat_days}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700">
                        {sch.jam_mulai} - {sch.jam_selesai}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-bku-primary/5 text-bku-primary rounded-lg border border-bku-primary/10 font-bold uppercase tracking-wider text-[9px]">
                          {sch.tipe_layanan}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-500">{sch.lokasi || '-'}</td>
                      <td className="py-4 px-4 font-bold text-slate-800">{sch.kuota} Pasien</td>
                      <td className="py-4 px-4 font-medium text-slate-400 italic max-w-xs truncate">
                        {sch.catatan ? `"${sch.catatan}"` : '-'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(sch)}
                            className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                            title="Edit Jadwal"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(sch.id)}
                            className="inline-flex size-8 items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-100 transition-colors"
                            title="Hapus Jadwal"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>

      {/* Create / Edit Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-bku-primary px-6 py-5 text-white">
              <h3 className="text-base font-bold uppercase tracking-tight font-headline">
                {editingSchedule ? 'Edit Slot Jadwal Praktik' : 'Buat Slot Jadwal Praktik Baru'}
              </h3>
              <p className="text-xs text-white/70 mt-1">Isi formulir berikut untuk merilis slot praktik medis Klinik Kampus.</p>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Tanggal Praktik</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Kuota Pasien</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={kuota}
                    onChange={(e) => setKuota(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Tipe Layanan</label>
                  <select
                    value={tipeLayanan}
                    onChange={(e) => setTipeLayanan(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                  >
                    {SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Lokasi Pemeriksaan</label>
                  <input
                    type="text"
                    required
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    placeholder="Misal: Klinik Utama Kampus A"
                    className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Misal: Harap bawa kartu mahasiswa dan obat pribadi jika ada."
                  className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                />
              </div>

              {/* Repeat options */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRepeat}
                    onChange={(e) => setIsRepeat(e.target.checked)}
                    className="rounded text-bku-primary focus:ring-bku-primary size-4"
                  />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Ulangi Jadwal Tiap Minggu</span>
                </label>

                {isRepeat && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-headline">Pilih Hari Berulang</label>
                    <div className="flex flex-wrap gap-2">
                      {REPEAT_DAYS_OPTIONS.map((day) => {
                        const active = selectedRepeatDays.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => handleToggleDay(day.value)}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                              active
                                ? 'bg-bku-primary text-white border-bku-primary'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-bku-primary/30'
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-bku-primary hover:bg-bku-hover text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-bku-primary/10 flex items-center justify-center gap-1"
                >
                  {submitting && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                  {editingSchedule ? 'Simpan' : 'Buat Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
