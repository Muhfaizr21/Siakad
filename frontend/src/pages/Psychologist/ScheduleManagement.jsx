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
      <div className="w-full relative space-y-6 scroll-smooth">
          {/* Welcome Banner Card */}
          <section className="relative overflow-hidden rounded-xl border p-5 shadow-sm flex flex-col gap-5 group"
            style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
            {/* Soft decorative blur nodes */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)' }}></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)' }}></div>
            
            <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between w-full">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined text-base shrink-0">stars</span>
                  Ketersediaan Konseling
                </div>
                <h1 className="mt-3 text-2xl font-black text-primary uppercase tracking-tight font-headline">Manajemen Jadwal</h1>
                <p className="mt-1 max-w-2xl text-xs font-bold leading-5 text-slate-500">
                  Atur hari aktif, jenis layanan, slot waktu, lokasi, dan kuota agar mahasiswa melihat jadwal yang jelas saat melakukan booking.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row shrink-0 relative z-20">
                <button
                  type="button"
                  onClick={resetChanges}
                  disabled={!hasUnsavedChanges || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-base shrink-0">history</span>
                  Reset
                </button>
                <button
                  type="button"
                  onClick={saveSchedule}
                  disabled={saving || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 disabled:cursor-wait disabled:opacity-70"
                >
                  {saving ? <span className="material-symbols-outlined text-base shrink-0 animate-spin" >sync</span> : <span className="material-symbols-outlined text-base shrink-0" >save</span>}
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </section>

          {/* Bento Grid Stats Card (Diluar dan dibawah banner utama) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 w-full">
            {/* Card 1 */}
            <div className="group relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
              <div className="absolute -right-8 -top-5 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-base shrink-0">calendar_today</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-primary/5 px-2 py-0.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AKTIF
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-5">Hari Aktif</p>
              <p className="mt-1 text-xl font-bold text-slate-900 tracking-tight leading-none">{summary.activeDays}</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">hari pelayanan aktif</p>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
              <div className="absolute -right-8 -top-5 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-base shrink-0">schedule</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-50/80 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-5">Total Slot</p>
              <p className="mt-1 text-xl font-bold text-slate-900 tracking-tight leading-none">{summary.totalSlots}</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">slot konseling tersedia</p>
            </div>

            <div className="group relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
              <div className="absolute -right-8 -top-5 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-base shrink-0">group</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-amber-50/80 border border-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  KUOTA
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-5">Kuota Mingguan</p>
              <p className="mt-1 text-xl font-bold text-slate-900 tracking-tight leading-none">{summary.totalQuota}</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">maksimal kuota pasien</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 w-full">
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="rounded-xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                <div className="mb-4 flex items-center justify-between px-2">
                  <h2 className="text-[10px] font-black font-headline uppercase tracking-widest" style={{ color: 'var(--theme-h2)' }}>Pilih Hari</h2>
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
                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25 translate-x-1'
                            : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-primary/20 hover:bg-white hover:-translate-y-0.5'}
                        `}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full" />
                        )}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined text-base shrink-0 ${isSelected ? 'text-white' : 'text-primary'}`}>{Icon}</span>
                            <span className="text-sm font-black">{item.day}</span>
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
              <div className="overflow-hidden rounded-xl border shadow-sm transition-all duration-300" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                <div className={`border-b border-slate-100 p-5 ${currentDayData.enabled ? 'bg-slate-50/50' : 'bg-rose-50/30'}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex size-12 items-center justify-center rounded-2xl shadow-sm ${currentDayData.enabled ? 'bg-primary text-white' : 'border border-slate-100 bg-white text-slate-300'}`}>
                        <span className="material-symbols-outlined text-2xl shrink-0">{currentDayIcon}</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-black font-headline uppercase tracking-tight" style={{ color: 'var(--theme-h2)' }}>{selectedDay}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {currentDayData.enabled ? 'Menerima booking' : 'Tidak menerima booking'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDay(selectedDay)}
                      className={`rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentDayData.enabled ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/95'}`}
                    >
                      {currentDayData.enabled ? 'Nonaktifkan Hari' : 'Aktifkan Hari'}
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-5">
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
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-white"
                        >
                          <span className="material-symbols-outlined text-base shrink-0">add</span>
                          Tambah Slot
                        </button>
                      </div>

                      {currentDayData.slots.length === 0 ? (
                        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
                          <span className="material-symbols-outlined text-3xl shrink-0 text-slate-300" >schedule</span>
                          <h4 className="mt-4 text-sm font-black font-headline uppercase tracking-tight" style={{ color: 'var(--theme-h4)' }}>Belum Ada Slot</h4>
                          <p className="mt-1 text-xs font-semibold text-slate-500">Tambahkan slot agar mahasiswa bisa memilih jadwal konseling.</p>
                          <button
                            type="button"
                            onClick={() => addSlot(selectedDay)}
                            className="mt-5 rounded-2xl bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm hover:bg-primary/95 transition-all duration-300"
                          >
                            Tambah Slot Pertama
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentDayData.slots.map((slot, index) => {
                            const invalidTime = toMinutes(slot.end) <= toMinutes(slot.start);

                            return (
                              <div key={`${selectedDay}-${index}`} className={`rounded-xl border p-5 transition-all duration-300 ${invalidTime ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-slate-50/40 hover:border-primary/20 hover:bg-white hover:shadow-md'}`}>
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                                  <div className="grid flex-1 grid-cols-2 gap-3">
                                    <label className="space-y-2">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mulai</span>
                                      <input
                                        type="time"
                                        value={slot.start}
                                        onChange={(event) => updateSlot(selectedDay, index, 'start', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-800 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                      />
                                    </label>
                                    <label className="space-y-2">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Selesai</span>
                                      <input
                                        type="time"
                                        value={slot.end}
                                        onChange={(event) => updateSlot(selectedDay, index, 'end', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-800 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                      />
                                    </label>
                                  </div>

                                  <div className="grid flex-[1.7] grid-cols-1 gap-3 sm:grid-cols-[150px_1fr_110px]">
                                    <label className="space-y-2">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jenis</span>
                                      <select
                                        value={slot.kategori || 'Personal'}
                                        onChange={(event) => updateSlot(selectedDay, index, 'kategori', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                      >
                                        {scheduleTypes.map((type) => (
                                          <option key={type} value={type}>{type}</option>
                                        ))}
                                      </select>
                                    </label>
                                    <label className="space-y-2">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lokasi</span>
                                      <input
                                        value={slot.lokasi || ''}
                                        onChange={(event) => updateSlot(selectedDay, index, 'lokasi', event.target.value)}
                                        placeholder="Ruang Konseling A"
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                      />
                                    </label>
                                    <label className="space-y-2">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Kuota</span>
                                      <input
                                        type="number"
                                        min="1"
                                        value={slot.kuota || 1}
                                        onChange={(event) => updateSlot(selectedDay, index, 'kuota', Number(event.target.value))}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                      />
                                    </label>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeSlot(selectedDay, index)}
                                    aria-label={`Hapus slot ${selectedDay} ${index + 1}`}
                                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 duration-300"
                                  >
                                    <span className="material-symbols-outlined text-base shrink-0" >delete</span>
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
                    <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
                      <div className="flex size-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-300">
                        <span className="material-symbols-outlined text-4xl shrink-0">dark_mode</span>
                      </div>
                      <h3 className="mt-5 text-sm font-black font-headline uppercase tracking-tight" style={{ color: 'var(--theme-h3)' }}>Hari Tidak Aktif</h3>
                      <p className="mt-1 max-w-md text-xs font-semibold leading-5 text-slate-500">
                        Mahasiswa tidak akan melihat slot booking untuk hari {selectedDay}. Aktifkan hari ini jika ingin membuka layanan.
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleDay(selectedDay)}
                        className="mt-5 rounded-2xl bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all duration-300 hover:bg-primary/95"
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
