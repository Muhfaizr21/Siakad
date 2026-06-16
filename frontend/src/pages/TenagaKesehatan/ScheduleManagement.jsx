import React, { useEffect, useMemo, useState } from 'react';
import { tenagaKesehatanService } from '../../services/api';
import { DashboardHero } from '@/components/ui/dashboard';
import { PageContent } from '@/components/ui/page';
import { toast } from 'react-hot-toast';
import { PrimaryStatsCard } from '@/components/ui/StatsCard';
const cn = (...classes) => classes.filter(Boolean).join(' ');
import { SelectField, SelectOption } from '@/components/ui/SelectField';

// Fallback Icons
const CalendarToday = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;
const ScheduleIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const GroupIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;

const SERVICE_TYPES = [
  'Pemeriksaan Umum',
  'Konsultasi Gizi',
  'Screening Khusus',
  'Pemeriksaan Gigi',
  'Rujukan Eksternal',
  'Lainnya'
];

const defaultSchedule = [
  { day: 'Senin', enabled: false, slots: [] },
  { day: 'Selasa', enabled: false, slots: [] },
  { day: 'Rabu', enabled: false, slots: [] },
  { day: 'Kamis', enabled: false, slots: [] },
  { day: 'Jumat', enabled: false, slots: [] },
  { day: 'Sabtu', enabled: false, slots: [] },
  { day: 'Minggu', enabled: false, slots: [] }
]

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const getEnglishDay = (dayName) => {
  const map = { 'Minggu': 'Sunday', 'Senin': 'Monday', 'Selasa': 'Tuesday', 'Rabu': 'Wednesday', 'Kamis': 'Thursday', 'Jumat': 'Friday', 'Sabtu': 'Saturday' }
  return map[dayName] || 'Monday'
}

const getNextDateForDay = (dayName) => {
  const dayMap = { 'Minggu': 0, 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6 }
  const target = dayMap[dayName]
  const d = new Date()
  d.setDate(d.getDate() + ((target + 7 - d.getDay()) % 7))
  return d.toISOString().split('T')[0]
}

const dayIcons = {
  Senin: 'calendar_today',
  Selasa: 'event',
  Rabu: 'calendar_month',
  Kamis: 'event_note',
  Jumat: 'event_available',
  Sabtu: 'weekend',
  Minggu: 'hotel',
};

const normalizeSchedule = (apiData) => {
  const grouped = defaultSchedule.map(g => ({ ...g, slots: [] }))

  // Group slots by day
  if (Array.isArray(apiData)) {
    apiData.forEach(sch => {
      const dateObj = new Date(sch.tanggal)
      const dayName = dayNames[dateObj.getDay()]
      const group = grouped.find(g => g.day === dayName)
      if (group) {
        group.enabled = true
        group.slots.push({
          id: sch.id,
          kategori: sch.tipe_layanan,
          start: sch.jam_mulai,
          end: sch.jam_selesai,
          lokasi: sch.lokasi,
          kuota: sch.kuota || 1
        })
      }
    })
  }
  return grouped
}

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

  const fetchSchedules = () => {
    setLoading(true);
    tenagaKesehatanService.getSchedules()
      .then((res) => {
        const nextSchedule = normalizeSchedule(res.data);
        setSchedule(nextSchedule);
        setSavedSnapshot(JSON.stringify(nextSchedule));
      })
      .catch(() => { })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const currentDayData = schedule.find((item) => item.day === selectedDay) || { day: selectedDay, enabled: false, slots: [] };
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
          ? [{ kategori: 'Pemeriksaan Umum', start: '08:00', end: '12:00', lokasi: 'Klinik Kampus BKU', kuota: 10 }]
          : item.slots,
      };
    }));
  };

  const addSlot = (day) => {
    setSchedule((prev) => prev.map((item) => item.day === day
      ? { ...item, enabled: true, slots: [...item.slots, { kategori: 'Pemeriksaan Umum', start: '08:00', end: '12:00', lokasi: 'Klinik Kampus BKU', kuota: 10 }] }
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
    let hasError = false;
    schedule.forEach((day) => {
      if (day.enabled) {
        day.slots.forEach((slot) => {
          if (toMinutes(slot.end) <= toMinutes(slot.start)) {
            hasError = true;
          }
        });
      }
    });

    if (hasError) {
      toast.error('Gagal menyimpan. Harap pastikan jam selesai diatur setelah jam mulai pada setiap slot.');
      return;
    }

    setSaving(true);
    try {
      const currentRes = await tenagaKesehatanService.getSchedules();
      const currentSlots = currentRes.data || [];
      const currentIds = currentSlots.map(s => s.id);

      const desiredIds = [];
      const createPromises = [];
      const updatePromises = [];

      for (const dayGrp of schedule) {
        if (dayGrp.enabled) {
          for (const slot of dayGrp.slots) {
            const nextDate = getNextDateForDay(dayGrp.day);
            const payload = {
              tanggal: nextDate,
              jam_mulai: slot.start,
              jam_selesai: slot.end,
              kuota: Number(slot.kuota),
              lokasi: slot.lokasi,
              tipe_layanan: slot.kategori,
              catatan: '',
              is_repeat: true,
              repeat_days: getEnglishDay(dayGrp.day)
            };

            if (slot.id) {
              desiredIds.push(slot.id);
              updatePromises.push(tenagaKesehatanService.updateSchedule(slot.id, payload));
            } else {
              createPromises.push(tenagaKesehatanService.createSchedule(payload));
            }
          }
        }
      }

      const deletePromises = currentIds
        .filter(id => !desiredIds.includes(id))
        .map(id => tenagaKesehatanService.deleteSchedule(id));

      await Promise.all([...createPromises, ...updatePromises, ...deletePromises]);

      toast.success('Jadwal berhasil disimpan dan tersinkron ke portal mahasiswa.');
      fetchSchedules(); // Reload fully from server
    } catch (error) {
      toast.error(error?.message || 'Gagal menyimpan jadwal. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContent>
      <DashboardHero
        title="Manajemen"
        highlightedTitle="Jadwal"
        subtitle="Kelola jam praktik, cuti, dan ketersediaan waktu untuk layanan medis."
        icon="event_note"
        badges={[{ label: 'Jadwal Saya', active: false }]}
        actions={hasUnsavedChanges ? (
          <div className="flex items-center gap-2">
            <button
              onClick={resetChanges}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Batal
            </button>
            <button
              onClick={saveSchedule}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--theme-primary)] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[var(--theme-primary-hover)] transition-colors shadow-md disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">
                {saving ? 'sync' : 'save'}
              </span>
              {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        ) : null}
      />

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

      {loading ? (
        <div className="h-[350px] flex items-center justify-center flex-col gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="material-symbols-outlined animate-spin text-bku-primary" style={{ fontSize: '40px' }}>sync</span>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Memuat Jadwal...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[450px] bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
          {/* Day Selector Aside */}
          <aside className="md:col-span-3 border-r border-[var(--theme-border)] p-4 bg-slate-50/50 overflow-y-auto space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block px-2 mb-2">Pilih Hari</span>
            {schedule.map((item) => {
              const isSelected = selectedDay === item.day;
              return (
                <button
                  key={item.day}
                  type="button"
                  onClick={() => setSelectedDay(item.day)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-all duration-200 relative overflow-hidden flex flex-col gap-1.5 cursor-pointer",
                    isSelected
                      ? "border-bku-primary bg-bku-primary/10 text-bku-primary shadow-sm"
                      : "border-neutral-200/60 bg-white text-neutral-600 hover:border-bku-primary/30"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold uppercase font-jakarta">{item.day}</span>
                    <span className={cn("size-2 rounded-full", item.enabled ? "bg-emerald-500" : "bg-neutral-300")} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                    {item.enabled ? `${item.slots?.length || 0} slot aktif` : 'Tidak Aktif'}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Slot Editor Area */}
          <section className="md:col-span-9 p-6 overflow-y-auto h-full no-scrollbar">
            {currentDayData.enabled ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900 font-jakarta flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }}>schedule</span>
                      Slot Hari {selectedDay}
                    </h3>
                    <p className="text-[10px] font-medium text-neutral-400">Tentukan jam mulai, selesai, jenis layanan, lokasi, dan kuota.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDay(selectedDay)}
                      className="h-9 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-rose-600 border border-rose-100 hover:bg-rose-50 hover:text-rose-700 cursor-pointer bg-white"
                    >
                      Nonaktifkan Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => addSlot(selectedDay)}
                      className="h-9 rounded-xl bg-bku-primary/10 text-bku-primary hover:bg-bku-primary hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center px-3 border border-bku-primary/20 cursor-pointer"
                    >
                      <span className="material-symbols-outlined mr-1" style={{ fontSize: '12px' }}>add</span>
                      Tambah Slot
                    </button>
                  </div>
                </div>

                {currentDayData.slots.length === 0 ? (
                  <div className="h-[240px] flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl bg-slate-50/50 text-center p-6">
                    <span className="material-symbols-outlined text-neutral-300 mb-2" style={{ fontSize: '32px' }}>schedule</span>
                    <h4 className="text-xs font-bold uppercase tracking-tight text-neutral-800">Belum Ada Slot Waktu</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 max-w-xs">Tambahkan slot waktu praktik agar pasien dapat memilih hari ini.</p>
                    <button
                      type="button"
                      onClick={() => addSlot(selectedDay)}
                      className="mt-4 h-9 bg-bku-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-pointer px-4 border-none"
                    >
                      Tambah Slot Pertama
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentDayData.slots.map((slot, index) => {
                      const invalidTime = toMinutes(slot.end) <= toMinutes(slot.start);
                      return (
                        <div key={index} className={cn("border rounded-xl p-4 bg-slate-50/30 transition-all hover:bg-white hover:shadow-sm", invalidTime ? "border-amber-200 bg-amber-50/20" : "border-neutral-200/60")}>
                          <div className="flex flex-col xl:flex-row gap-4 items-end xl:items-center justify-between">
                            <div className="grid grid-cols-2 md:grid-cols-[130px_130px_1fr_1fr_80px] gap-3 w-full items-start">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase">Mulai</label>
                                <input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) => updateSlot(selectedDay, index, 'start', e.target.value)}
                                  className="h-9 w-full px-3 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-bku-primary"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase">Selesai</label>
                                <input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => updateSlot(selectedDay, index, 'end', e.target.value)}
                                  className="h-9 w-full px-3 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-bku-primary"
                                />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase">Jenis</label>
                                <SelectField
                                  value={slot.kategori}
                                  onValueChange={(val) => updateSlot(selectedDay, index, 'kategori', val)}
                                  className="h-9 rounded-lg border-neutral-200 text-xs font-bold w-full truncate"
                                >
                                  {SERVICE_TYPES.map((type) => (
                                    <SelectOption key={type} value={type}>{type}</SelectOption>
                                  ))}
                                </SelectField>
                              </div>
                              <div className="space-y-1 min-w-0">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase">Lokasi</label>
                                <input
                                  value={slot.lokasi}
                                  placeholder="Lokasi..."
                                  onChange={(e) => updateSlot(selectedDay, index, 'lokasi', e.target.value)}
                                  className="h-9 w-full px-3 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-bku-primary truncate"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase">Kuota</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={slot.kuota}
                                  onChange={(e) => updateSlot(selectedDay, index, 'kuota', parseInt(e.target.value) || 1)}
                                  className="h-9 w-full px-3 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-bku-primary"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSlot(selectedDay, index)}
                              className="h-9 w-9 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 flex items-center justify-center border-none bg-transparent cursor-pointer"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                            </button>
                          </div>
                          {invalidTime && (
                            <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-amber-700">Jam selesai harus setelah jam mulai.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-neutral-300 mb-4 border border-neutral-100">
                  <span className="material-symbols-outlined text-[32px]">dark_mode</span>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-tight text-neutral-800">Hari Ini Tidak Aktif</h3>
                <p className="text-[11px] text-neutral-400 mt-1 max-w-xs leading-normal">
                  Tenaga medis tidak akan menerima pasien pada hari {selectedDay}. Aktifkan hari ini jika ingin membuka jadwal praktik.
                </p>
                <button
                  type="button"
                  onClick={() => toggleDay(selectedDay)}
                  className="mt-5 h-9 bg-bku-primary hover:bg-bku-primary/90 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-pointer px-4 border-none"
                >
                  Aktifkan Hari {selectedDay}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </PageContent>
  );
}
