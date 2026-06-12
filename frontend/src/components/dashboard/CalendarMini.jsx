import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageCard, PageCardHeader } from '@/components/ui/page';

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const CATEGORY_COLORS = {
  kencana: 'bg-primary',
  beasiswa: 'bg-success',
  konseling: 'bg-secondary',
  kampus: 'bg-info',
  organisasi: 'bg-error',
};

export default function CalendarMini({ events }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Sun=0, Mon=1...
  // Convert Sun=0 to Mon=0, Sun=6
  const startDay = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Filter events to only show in the currently viewed month
  const viewedEvents = events?.filter(e => {
    const d = new Date(e.tanggal_mulai || e.tanggal);
    return d.getMonth() === month && d.getFullYear() === year;
  }) || [];

  const eventDates = viewedEvents.map(e => new Date(e.tanggal_mulai || e.tanggal).getDate());

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const renderDays = () => {
    const cells = [];
    // Padding
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`pad-${i}`} className="h-10"></div>);
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const hasEvent = eventDates.includes(d);
      const isPast = d < today.getDate() && month === today.getMonth() && year === today.getFullYear();

      cells.push(
        <div key={d} className="relative group/day flex flex-col items-center justify-center h-10 cursor-pointer">
          <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
            isToday ? 'bg-primary text-white shadow-md' : 
            isPast ? 'text-text-muted/40' : 'text-bku-text hover:bg-background'
          }`}>
            {d}
          </div>
          {hasEvent && (
            <div className={`absolute bottom-0 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-primary'}`}></div>
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <PageCard className="flex flex-col h-full overflow-hidden">
      <PageCardHeader 
        title="Kalender Kegiatan"
        icon="calendar_month"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-background rounded-lg transition-colors"><ChevronLeft size={16} /></button>
            <span className="text-xs font-bold w-28 text-center">{MONTHS[month]} {year}</span>
            <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-background rounded-lg transition-colors"><ChevronRight size={16} /></button>
          </div>
        }
      />

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-[10px] font-black text-text-muted uppercase text-center py-2 tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-8">
        {renderDays()}
      </div>

      <div className="flex-1 flex flex-col gap-4 border-t border-border-muted pt-6">
         <h4 className="text-[13px] font-bold text-slate-800 font-headline mb-2">Kegiatan di Bulan {MONTHS[month]}</h4>
         {viewedEvents?.length > 0 ? (
           <div className="space-y-3">
              {viewedEvents.map((e, idx) => (
                <div key={idx} className="flex items-center gap-3 group/event">
                   <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[e.kategori] || 'bg-text-muted'}`}></div>
                   <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between w-full">
                         <span className="text-[10px] font-bold text-text-muted">{new Date(e.tanggal_mulai || e.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-current/10 opacity-70 ${CATEGORY_COLORS[e.kategori] ? 'text-current' : 'text-text-muted'} uppercase`}>{e.kategori}</span>
                      </div>
                      <p className="text-sm font-bold text-bku-text leading-tight line-clamp-1">{e.judul || e.nama}</p>
                   </div>
                </div>
              ))}
           </div>
         ) : (
           <p className="text-[13px] text-slate-500 font-medium">Tidak ada kegiatan terjadwal di bulan ini.</p>
         )}
      </div>
    </PageCard>
  );
}
