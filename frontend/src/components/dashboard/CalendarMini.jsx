import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Dot } from 'lucide-react';

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const CATEGORY_COLORS = {
  kencana: 'bg-[#00236F]',
  beasiswa: 'bg-[#16a34a]',
  konseling: 'bg-[#3b82f6]',
  kampus: 'bg-[#8b5cf6]',
  organisasi: 'bg-[#ef4444]',
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

  // Highlight dates with events
  const eventDates = events?.map(e => new Date(e.tanggal_mulai || e.tanggal).getDate()) || [];

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
            isToday ? 'bg-[#00236F] text-white shadow-md' : 
            isPast ? 'text-[#d4d4d4]' : 'text-[#525252] hover:bg-[#fafafa]'
          }`}>
            {d}
          </div>
          {hasEvent && (
            <div className={`absolute bottom-0 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-[#00236F]'}`}></div>
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold font-headline flex items-center gap-2.5">
          <CalendarDays size={20} className="text-[#00236F]" />
          Kalender Kegiatan
        </h3>
        <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-[#fafafa] rounded-lg transition-colors"><ChevronLeft size={18} /></button>
            <span className="text-sm font-bold w-32 text-center">{MONTHS[month]} {year}</span>
            <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-[#fafafa] rounded-lg transition-colors"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-[10px] font-black text-[#a3a3a3] uppercase text-center py-2 tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-8">
        {renderDays()}
      </div>

      <div className="flex-1 flex flex-col gap-4 border-t border-[#f5f5f5] pt-6">
         <h4 className="text-xs font-black text-[#a3a3a3] uppercase tracking-widest leading-none mb-2">Mendatang di Bulan Ini</h4>
         {events?.length > 0 ? (
           <div className="space-y-3">
              {events.map((e, idx) => (
                <div key={idx} className="flex items-center gap-3 group/event">
                   <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[e.kategori] || 'bg-[#a3a3a3]'}`}></div>
                   <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between w-full">
                         <span className="text-[10px] font-bold text-[#a3a3a3]">{new Date(e.tanggal_mulai || e.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-current/10 opacity-70 ${CATEGORY_COLORS[e.kategori] ? 'text-current' : 'text-[#525252]'} uppercase`}>{e.kategori}</span>
                      </div>
                      <p className="text-sm font-bold text-[#171717] leading-tight line-clamp-1">{e.judul || e.nama}</p>
                   </div>
                </div>
              ))}
           </div>
         ) : (
           <p className="text-xs font-bold text-[#d4d4d4] italic">Tidak ada kegiatan terjadwal di bulan ini.</p>
         )}
      </div>
    </div>
  );
}
