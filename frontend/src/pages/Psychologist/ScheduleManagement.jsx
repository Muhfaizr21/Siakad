import React, { useEffect, useMemo, useState } from 'react';
import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';
import { toast } from 'react-hot-toast';

const defaultSchedule = [
  { day: 'Senin', enabled: true, slots: [{ kategori: 'Personal', start: '09:00', end: '12:00', lokasi: 'Ruang Konseling A', kuota: 3 }, { kategori: 'Akademik', start: '13:00', end: '16:00', lokasi: 'Ruang Konseling A', kuota: 3 }] },
  { day: 'Selasa', enabled: true, slots: [{ kategori: 'Karir', start: '10:00', end: '15:00', lokasi: 'Ruang Konseling A', kuota: 4 }] },
  { day: 'Rabu', enabled: true, slots: [{ kategori: 'Personal', start: '09:00', end: '12:00', lokasi: 'Ruang Konseling B', kuota: 3 }] },
  { day: 'Kamis', enabled: false, slots: [] },
  { day: 'Jumat', enabled: true, slots: [{ kategori: 'Akademik', start: '08:00', end: '11:00', lokasi: 'Ruang Konseling A', kuota: 2 }] },
  { day: 'Sabtu', enabled: false, slots: [] },
  { day: 'Minggu', enabled: false, slots: [] },
];

const scheduleTypes = ['Personal', 'Akademik', 'Karir'];

const dayIcons = {
  Senin: 'light_mode',
  Jumat: 'coffee',
};

const normalizeSchedule = (items) => {
  const byDay = new Map((items || []).map((item) => [item.day, item]));

  return defaultSchedule.map((fallback) => {
    const source = byDay.get(fallback.day) || fallback;
    return {
      ...fallback,
      ...source,
      slots: (source.slots || []).map((slot) => ({
        kategori: slot.kategori || slot.Kategori || 'Personal',
        start: slot.start || '09:00',
        end: slot.end || '10:00',
        lokasi: slot.lokasi || 'Ruang Konseling A',
        kuota: Number(slot.kuota || 1),
      })),
    };
  });
};

const toMinutes = (value) => {
  const [hours, minutes] = String(value || '00:00').split(':').map(Number);
  return (hours * 60) + minutes;
};

export default function ScheduleManagement() {
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(defaultSchedule));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    psychologistService.getSchedules()
      .then((res) => {
        if (ignore) return;
        const nextSchedule = Array.isArray(res.data) && res.data.length > 0
          ? normalizeSchedule(res.data)
          : defaultSchedule;

        setSchedule(nextSchedule);
        setSavedSnapshot(JSON.stringify(nextSchedule));
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  const currentDayData = schedule.find((item) => item.day === selectedDay) || { day: selectedDay, enabled: false, slots: [] };
  const currentDayIcon = dayIcons[selectedDay] || 'schedule';
  const hasUnsavedChanges = savedSnapshot !== JSON.stringify(schedule);

  const summary = useMemo(() => {
    const activeDays = schedule.filter((item) => item.enabled).length;
    const totalSlots = schedule.reduce((total, item) => total + (item.enabled ? item.slots.length : 0), 0);
    const totalQuota = schedule.reduce((total, item) => {
      if (!item.enabled) return total;
      return total + item.slots.reduce((slotTotal, slot) => slotTotal + Number(slot.kuota || 0), 0);
    }, 0);

    return { activeDays, totalSlots, totalQuota };
  }, [schedule]);

  const toggleDay = (day) => {
    setSchedule((prev) => prev.map((item) => {
      if (item.day !== day) return item;

      const nextEnabled = !item.enabled;
      return {
        ...item,
        enabled: nextEnabled,
        slots: nextEnabled && item.slots.length === 0
          ? [{ kategori: 'Personal', start: '09:00', end: '12:00', lokasi: 'Ruang Konseling A', kuota: 1 }]
          : item.slots,
      };
    }));
  };

  const addSlot = (day) => {
    setSchedule((prev) => prev.map((item) => item.day === day
      ? { ...item, enabled: true, slots: [...item.slots, { kategori: 'Personal', start: '09:00', end: '10:00', lokasi: 'Ruang Konseling A', kuota: 1 }] }
      : item));
  };

  const removeSlot = (day, index) => {
    setSchedule((prev) => prev.map((item) => item.day === day
      ? { ...item, slots: item.slots.filter((_, slotIndex) => slotIndex !== index) }
      : item));
  };

  const updateSlot = (day, index, key, value) => {
    setSchedule((prev) => prev.map((item) => item.day === day
      ? { ...item, slots: item.slots.map((slot, slotIndex) => slotIndex === index ? { ...slot, [key]: value } : slot) }
      : item));
  };

  const resetChanges = () => {
    const restored = JSON.parse(savedSnapshot);
    setSchedule(restored);
    toast.success('Perubahan jadwal dikembalikan ke versi tersimpan.');
  };

  const saveSchedule = async () => {
    const invalidSlot = schedule
      .flatMap((item) => item.slots.map((slot, index) => ({ ...slot, day: item.day, index, enabled: item.enabled })))
      .find((slot) => slot.enabled && toMinutes(slot.end) <= toMinutes(slot.start));

    if (invalidSlot) {
      toast.error(`${invalidSlot.day} slot ${invalidSlot.index + 1}: jam selesai harus setelah jam mulai.`);
      return;
    }

    setSaving(true);
    try {
      const res = await psychologistService.saveSchedules(schedule);
      const nextSchedule = Array.isArray(res.data) ? normalizeSchedule(res.data) : schedule;
      setSchedule(nextSchedule);
      setSavedSnapshot(JSON.stringify(nextSchedule));
      toast.success('Jadwal berhasil disimpan dan tersinkron ke portal mahasiswa.');
    } catch (error) {
      toast.error(error?.message || 'Gagal menyimpan jadwal. Coba lagi.');
      // Keep the form state intact when save fails.
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="w-full relative space-y-6 min-h-screen bg-transparent font-inter pb-8">
          {/* Welcome Banner Card */}
          <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col xl:flex-row xl:items-center gap-6 group shadow-sm border border-slate-200/60 bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-slate-50/80" />
            <div className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 left-20 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm relative overflow-hidden">
                    <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '26px' }}>settings_accessibility</span>
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                        Ketersediaan Konseling
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                      Manajemen Jadwal
                    </h1>
                    <p className="mt-2 text-xs md:text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
                      Atur hari aktif, jenis layanan, slot waktu, lokasi, dan kuota agar mahasiswa melihat jadwal yang jelas saat melakukan booking.
                    </p>
                 </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-3 sm:flex-row shrink-0 border-t xl:border-t-0 xl:border-l border-slate-100 pt-4 xl:pt-0 xl:pl-6 w-full xl:w-auto">
                <button
                  type="button"
                  onClick={resetChanges}
                  disabled={!hasUnsavedChanges || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-base shrink-0">history</span>
                  Reset
                </button>
                <button
                  type="button"
                  onClick={saveSchedule}
                  disabled={saving || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
                >
                  {saving ? <span className="material-symbols-outlined text-base shrink-0 animate-spin" >sync</span> : <span className="material-symbols-outlined text-base shrink-0" >save</span>}
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
          </section>

          {/* Bento Grid Stats Card (Diluar dan dibawah banner utama) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 w-full">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-xl transition-colors duration-500 -z-10" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <span className="material-symbols-outlined text-[20px] shrink-0">calendar_today</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AKTIF
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Hari Aktif</p>
              <p className="text-2xl font-extrabold text-slate-800 font-headline mb-3 tabular-nums">{summary.activeDays}</p>
              <p className="text-[10px] font-bold text-slate-400">hari pelayanan aktif</p>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl transition-colors duration-500 -z-10" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <span className="material-symbols-outlined text-[20px] shrink-0">schedule</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-50/80 px-2 py-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Slot</p>
              <p className="text-2xl font-extrabold text-slate-800 font-headline mb-3 tabular-nums">{summary.totalSlots}</p>
              <p className="text-[10px] font-bold text-slate-400">slot konseling tersedia</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl transition-colors duration-500 -z-10" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <span className="material-symbols-outlined text-[20px] shrink-0">group</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-amber-50/80 px-2 py-1 text-[9px] font-black text-amber-600 uppercase tracking-widest">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  KUOTA
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Kuota Mingguan</p>
              <p className="text-2xl font-extrabold text-slate-800 font-headline mb-3 tabular-nums">{summary.totalQuota}</p>
              <p className="text-[10px] font-bold text-slate-400">maksimal kuota pasien</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 w-full">
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                <div className="mb-4 flex items-center justify-between px-2">
                  <h2 className="text-[10px] font-black font-headline uppercase tracking-widest text-slate-800">Pilih Hari</h2>
                  {loading && <span className="material-symbols-outlined text-base shrink-0 animate-spin text-primary/60" >sync</span>}
                </div>

                <div className="space-y-2">
                  {schedule.map((item) => {
                    const isSelected = selectedDay === item.day;
                    const Icon = dayIcons[item.day] || 'calendar_month';

                    return (
                      <button
                        key={item.day}
                        type="button"
                        onClick={() => setSelectedDay(item.day)}
                        className={`
                          w-full rounded-2xl border p-4 text-left transition-all duration-300 relative overflow-hidden group/day
                          ${isSelected
                            ? 'border-primary bg-primary text-white shadow-md shadow-primary/20 translate-x-1'
                            : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'}
                        `}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full" />
                        )}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-[18px] shrink-0 ${isSelected ? 'text-white' : 'text-primary'}`}>{Icon}</span>
                            <span className="text-xs font-black">{item.day}</span>
                          </div>
                          <span className={`size-2.5 rounded-full ${item.enabled ? (isSelected ? 'bg-white' : 'bg-emerald-500') : 'bg-slate-300'}`} />
                        </div>
                        <p className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                          {item.enabled ? `${item.slots.length} slot aktif` : 'Tidak aktif'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <section className="lg:col-span-8 xl:col-span-9">
              <div className="bg-white overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm transition-all duration-300">
                <div className={`border-b border-slate-100 p-4 ${currentDayData.enabled ? 'bg-slate-50/50' : 'bg-rose-50/30'}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex w-10 h-10 items-center justify-center rounded-xl shadow-sm ${currentDayData.enabled ? 'bg-primary text-white' : 'border border-slate-100 bg-white text-slate-300'}`}>
                        <span className="material-symbols-outlined text-[20px] shrink-0">{currentDayIcon}</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-black font-headline uppercase tracking-tight text-slate-800">{selectedDay}</h2>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {currentDayData.enabled ? 'Menerima booking' : 'Tidak menerima booking'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDay(selectedDay)}
                      className={`rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentDayData.enabled ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/95'}`}
                    >
                      {currentDayData.enabled ? 'Nonaktifkan Hari' : 'Aktifkan Hari'}
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {currentDayData.enabled ? (
                    <div className="space-y-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                            <span className="material-symbols-outlined text-base shrink-0" >schedule</span>
                            Slot Waktu
                          </h3>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">Setiap slot bisa punya jenis layanan, lokasi, dan kuota berbeda.</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => addSlot(selectedDay)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-white"
                        >
                          <span className="material-symbols-outlined text-[16px] shrink-0">add</span>
                          Tambah Slot
                        </button>
                      </div>

                      {currentDayData.slots.length === 0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
                          <span className="material-symbols-outlined text-[28px] shrink-0 text-slate-300" >schedule</span>
                          <h4 className="mt-3 text-sm font-black font-headline uppercase tracking-tight text-slate-600">Belum Ada Slot</h4>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">Tambahkan slot agar mahasiswa bisa memilih jadwal konseling.</p>
                          <button
                            type="button"
                            onClick={() => addSlot(selectedDay)}
                            className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm hover:bg-primary/95 transition-all duration-300"
                          >
                            Tambah Slot Pertama
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentDayData.slots.map((slot, index) => {
                            const invalidTime = toMinutes(slot.end) <= toMinutes(slot.start);

                            return (
                              <div key={`${selectedDay}-${index}`} className={`rounded-xl border p-4 transition-all duration-300 ${invalidTime ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-slate-50/40 hover:border-primary/20 hover:bg-white hover:shadow-md'}`}>
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                                  <div className="grid flex-1 grid-cols-2 gap-3">
                                    <label className="space-y-1.5">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mulai</span>
                                      <input
                                        type="time"
                                        value={slot.start}
                                        onChange={(event) => updateSlot(selectedDay, index, 'start', event.target.value)}
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                                      />
                                    </label>
                                    <label className="space-y-1.5">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Selesai</span>
                                      <input
                                        type="time"
                                        value={slot.end}
                                        onChange={(event) => updateSlot(selectedDay, index, 'end', event.target.value)}
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                                      />
                                    </label>
                                  </div>

                                  <div className="grid flex-[1.7] grid-cols-1 gap-3 sm:grid-cols-[130px_1fr_90px]">
                                    <label className="space-y-1.5">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jenis</span>
                                      <select
                                        value={slot.kategori || 'Personal'}
                                        onChange={(event) => updateSlot(selectedDay, index, 'kategori', event.target.value)}
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-black text-slate-700 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                                      >
                                        {scheduleTypes.map((type) => (
                                          <option key={type} value={type}>{type}</option>
                                        ))}
                                      </select>
                                    </label>
                                    <label className="space-y-1.5">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lokasi</span>
                                      <input
                                        value={slot.lokasi || ''}
                                        onChange={(event) => updateSlot(selectedDay, index, 'lokasi', event.target.value)}
                                        placeholder="Ruang Konseling A"
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                      />
                                    </label>
                                    <label className="space-y-1.5">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Kuota</span>
                                      <input
                                        type="number"
                                        min="1"
                                        value={slot.kuota || 1}
                                        onChange={(event) => updateSlot(selectedDay, index, 'kuota', Number(event.target.value))}
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-700 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                                      />
                                    </label>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeSlot(selectedDay, index)}
                                    aria-label={`Hapus slot ${selectedDay} ${index + 1}`}
                                    className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95 duration-300 mt-5 xl:mt-0"
                                  >
                                    <span className="material-symbols-outlined text-[18px] shrink-0" >delete</span>
                                  </button>
                                </div>

                                {invalidTime && (
                                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-amber-700">Jam selesai harus setelah jam mulai.</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                      <div className="flex w-16 h-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-300">
                        <span className="material-symbols-outlined text-[32px] shrink-0">dark_mode</span>
                      </div>
                      <h3 className="mt-4 text-sm font-black font-headline uppercase tracking-tight text-slate-800">Hari Tidak Aktif</h3>
                      <p className="mt-1 max-w-md text-[11px] font-semibold leading-5 text-slate-500">
                        Mahasiswa tidak akan melihat slot booking untuk hari {selectedDay}. Aktifkan hari ini jika ingin membuka layanan.
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleDay(selectedDay)}
                        className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all duration-300 hover:bg-primary/95"
                      >
                        Aktifkan {selectedDay}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
    </>
  );
}
