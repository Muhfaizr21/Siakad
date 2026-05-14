import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import {
  Calendar,
  Clock,
  Coffee,
  Loader2,
  Moon,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react';
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
  Senin: Sun,
  Jumat: Coffee,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const currentDayIcon = dayIcons[selectedDay] || Clock;
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
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className={UI.layout.canvas}>
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <Sparkles className="size-3.5" />
                  Ketersediaan Konseling
                </div>
                <h1 className="mt-3 text-2xl font-black text-primary uppercase tracking-tight font-headline">Manajemen Jadwal</h1>
                <p className="mt-1 max-w-2xl text-xs font-bold leading-5 text-slate-500">
                  Atur hari aktif, jenis layanan, slot waktu, lokasi, dan kuota agar mahasiswa melihat jadwal yang jelas saat melakukan booking.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={resetChanges}
                  disabled={!hasUnsavedChanges || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw className="size-4" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={saveSchedule}
                  disabled={saving || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 disabled:cursor-wait disabled:opacity-70"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hari Aktif</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{summary.activeDays}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Slot</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{summary.totalSlots}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kuota Mingguan</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{summary.totalQuota}</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between px-2">
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Hari</h2>
                  {loading && <Loader2 className="size-4 animate-spin text-primary/60" />}
                </div>

                <div className="space-y-2">
                  {schedule.map((item) => {
                    const isSelected = selectedDay === item.day;
                    const Icon = dayIcons[item.day] || Calendar;

                    return (
                      <button
                        key={item.day}
                        type="button"
                        onClick={() => setSelectedDay(item.day)}
                        className={`
                          w-full rounded-2xl border p-4 text-left transition-all
                          ${isSelected
                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                            : 'border-transparent bg-slate-50 text-slate-600 hover:border-primary/20 hover:bg-white'}
                        `}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Icon className={`size-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
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
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className={`border-b border-slate-100 p-5 ${currentDayData.enabled ? 'bg-slate-50/70' : 'bg-rose-50/60'}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex size-12 items-center justify-center rounded-2xl shadow-sm ${currentDayData.enabled ? 'bg-primary text-white' : 'border border-slate-100 bg-white text-slate-300'}`}>
                        {React.createElement(currentDayIcon, { size: 24 })}
                      </div>
                      <div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">{selectedDay}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {currentDayData.enabled ? 'Menerima booking' : 'Tidak menerima booking'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDay(selectedDay)}
                      className={`rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${currentDayData.enabled ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                    >
                      {currentDayData.enabled ? 'Nonaktifkan Hari' : 'Aktifkan Hari'}
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {currentDayData.enabled ? (
                    <div className="space-y-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                            <Clock className="size-4" />
                            Slot Waktu
                          </h3>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">Setiap slot bisa punya jenis layanan, lokasi, dan kuota berbeda.</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => addSlot(selectedDay)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
                        >
                          <Plus className="size-4" />
                          Tambah Slot
                        </button>
                      </div>

                      {currentDayData.slots.length === 0 ? (
                        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
                          <Clock className="size-9 text-slate-300" />
                          <h4 className="mt-4 text-sm font-black uppercase tracking-tight text-slate-900">Belum Ada Slot</h4>
                          <p className="mt-1 text-xs font-semibold text-slate-500">Tambahkan slot agar mahasiswa bisa memilih jadwal konseling.</p>
                          <button
                            type="button"
                            onClick={() => addSlot(selectedDay)}
                            className="mt-5 rounded-2xl bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm"
                          >
                            Tambah Slot Pertama
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentDayData.slots.map((slot, index) => {
                            const invalidTime = toMinutes(slot.end) <= toMinutes(slot.start);

                            return (
                              <div key={`${selectedDay}-${index}`} className={`rounded-2xl border p-4 transition-all ${invalidTime ? 'border-amber-200 bg-amber-50/60' : 'border-slate-100 bg-slate-50/80 hover:bg-white hover:shadow-sm'}`}>
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
                                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-600"
                                  >
                                    <Trash2 className="size-4" />
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
                        <Moon className="size-10" />
                      </div>
                      <h3 className="mt-5 text-sm font-black uppercase tracking-tight text-slate-900">Hari Tidak Aktif</h3>
                      <p className="mt-1 max-w-md text-xs font-semibold leading-5 text-slate-500">
                        Mahasiswa tidak akan melihat slot booking untuk hari {selectedDay}. Aktifkan hari ini jika ingin membuka layanan.
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleDay(selectedDay)}
                        className="mt-5 rounded-2xl bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm"
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
      </main>
    </div>
  );
}
