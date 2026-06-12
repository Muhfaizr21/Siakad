import React, { useEffect, useMemo, useState } from 'react';
import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';
import { DashboardHero } from '@/components/ui/dashboard';
import { toast } from 'react-hot-toast';
import { PrimaryStatsCard } from '@/components/ui/StatsCard';

// Fallback Icons
const CalendarToday = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;
const ScheduleIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const GroupIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;

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
          <DashboardHero title="Manajemen" highlightedTitle="Jadwal" subtitle="Kelola jam praktik, cuti, dan ketersediaan waktu untuk sesi konseling." icon="event_note" badges={[{ label: 'Jadwal Saya', active: false }]} />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 w-full mb-6 mt-6">
            <PrimaryStatsCard
              title="Hari Aktif"
              value={summary.activeDays}
              icon={CalendarToday}
              colorTheme="success"
              badgeText="AKTIF"
              badgeIcon={<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            />
            <PrimaryStatsCard
              title="Total Slot"
              value={summary.totalSlots}
              icon={ScheduleIcon}
              colorTheme="info"
              badgeText="LIVE"
              badgeIcon={<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            />
            <PrimaryStatsCard
              title="Kuota Mingguan"
              value={summary.totalQuota}
              icon={GroupIcon}
              colorTheme="warning"
              badgeText="KUOTA"
              badgeIcon={<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            />
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
                          w-full rounded-2xl p-4 text-left transition-all duration-300 relative overflow-hidden group/day border-2 flex flex-col gap-1
                          ${isSelected
                            ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02] ring-4 ring-primary/10 z-10'
                            : 'border-transparent bg-slate-50/50 text-slate-600 hover:bg-white hover:border-slate-200 hover:shadow-md'}
                        `}
                      >
                        {isSelected && (
                          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
                        )}
                        <div className="flex items-center justify-between gap-3 w-full relative z-10">
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                              <span className="material-symbols-outlined text-[16px] shrink-0">{Icon}</span>
                            </div>
                            <span className="text-sm font-black tracking-tight">{item.day}</span>
                          </div>
                          <span className={`size-2.5 rounded-full shadow-sm ${item.enabled ? (isSelected ? 'bg-emerald-300' : 'bg-emerald-500') : 'bg-slate-300'}`} />
                        </div>
                        <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest relative z-10 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
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
                              <div key={`${selectedDay}-${index}`} className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 shadow-sm ${invalidTime ? 'border-rose-300 bg-rose-50/50 ring-4 ring-rose-50' : 'border-slate-100 bg-white hover:border-primary/30 hover:shadow-xl hover:-translate-y-1'}`}>
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${slot.kategori === 'Personal' ? 'bg-indigo-500' : slot.kategori === 'Akademik' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-center pl-2">
                                  <div className="grid flex-1 grid-cols-2 gap-4">
                                    <label className="space-y-1.5">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jam Mulai</span>
                                      <div className="relative">
                                        <input
                                          type="time"
                                          value={slot.start}
                                          onChange={(event) => updateSlot(selectedDay, index, 'start', event.target.value)}
                                          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs font-black text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">schedule</span>
                                      </div>
                                    </label>
                                    <label className="space-y-1.5">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jam Selesai</span>
                                      <div className="relative">
                                        <input
                                          type="time"
                                          value={slot.end}
                                          onChange={(event) => updateSlot(selectedDay, index, 'end', event.target.value)}
                                          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs font-black text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">update</span>
                                      </div>
                                    </label>
                                  </div>

                                  <div className="grid flex-[1.7] grid-cols-1 gap-4 sm:grid-cols-[140px_1fr_100px]">
                                    <label className="space-y-1.5">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jenis Layanan</span>
                                      <div className="relative">
                                        <select
                                          value={slot.kategori || 'Personal'}
                                          onChange={(event) => updateSlot(selectedDay, index, 'kategori', event.target.value)}
                                          className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-8 text-[11px] font-black text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                        >
                                          {scheduleTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                          ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">category</span>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">expand_more</span>
                                      </div>
                                    </label>
                                    <label className="space-y-1.5">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lokasi / Ruangan</span>
                                      <div className="relative">
                                        <input
                                          value={slot.lokasi || ''}
                                          onChange={(event) => updateSlot(selectedDay, index, 'lokasi', event.target.value)}
                                          placeholder="Ruang Konseling A"
                                          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-[11px] font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">meeting_room</span>
                                      </div>
                                    </label>
                                    <label className="space-y-1.5">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Kuota Pasien</span>
                                      <div className="relative">
                                        <input
                                          type="number"
                                          min="1"
                                          value={slot.kuota || 1}
                                          onChange={(event) => updateSlot(selectedDay, index, 'kuota', Number(event.target.value))}
                                          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-[11px] font-black text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">group</span>
                                      </div>
                                    </label>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeSlot(selectedDay, index)}
                                    aria-label={`Hapus slot ${selectedDay} ${index + 1}`}
                                    className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/30 active:scale-95 duration-300 mt-5 xl:mt-0"
                                  >
                                    <span className="material-symbols-outlined text-[20px] shrink-0">delete</span>
                                  </button>
                                </div>

                                {invalidTime && (
                                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-rose-700">
                                    <span className="material-symbols-outlined text-[16px]">error</span>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Jam selesai harus setelah jam mulai.</p>
                                  </div>
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


