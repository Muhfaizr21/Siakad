import React from 'react';

const DAYS = [
  { id: 1, name: "Senin" },
  { id: 2, name: "Selasa" },
  { id: 3, name: "Rabu" },
  { id: 4, name: "Kamis" },
  { id: 5, name: "Jumat" },
  { id: 6, name: "Sabtu" }
];

const START_HOUR = 7;
const END_HOUR = 18;
const HOURS = Array.from({length: END_HOUR - START_HOUR + 1}, (_, i) => START_HOUR + i);

export default function ScheduleCalendarGrid({ krsSaya }) {
  const details = krsSaya?.details || [];

  // Helper to convert "HH:mm" to minutes since 00:00
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const startOfDayMins = START_HOUR * 60;
  const totalDayMins = (END_HOUR - START_HOUR) * 60;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col font-inter overflow-hidden h-[700px]">
      <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
        <h2 className="text-lg font-bold font-jakarta text-neutral-900">Jadwal Kalender</h2>
        <div className="text-xs text-neutral-500 font-medium bg-white px-3 py-1 rounded-full border border-neutral-200 shadow-sm">
          {details.length} Kelas Dipilih
        </div>
      </div>

      <div className="flex-1 overflow-auto relative p-4">
        <div className="min-w-[800px] h-full flex pt-6 relative">
          
          {/* Time Y-Axis */}
          <div className="w-14 shrink-0 border-r border-neutral-200 pr-2 flex flex-col relative" style={{ height: `${HOURS.length * 60}px` }}>
            {HOURS.map(hour => (
              <div 
                key={hour} 
                className="absolute w-full text-[10px] text-neutral-400 font-medium text-right pr-2"
                style={{ top: `${(hour - START_HOUR) * 60}px`, transform: 'translateY(-50%)' }}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Grid Area */}
          <div className="flex-1 flex border-t border-neutral-200 relative">
            
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {HOURS.map(hour => (
                <div 
                  key={hour} 
                  className="w-full border-b border-neutral-100 border-dashed absolute"
                  style={{ top: `${(hour - START_HOUR) * 60}px` }}
                ></div>
              ))}
            </div>

            {/* Days Columns */}
            {DAYS.map(day => {
              // Placed Events for this day
              const dayEvents = details.filter(d => d.JadwalKuliah.Hari === day.id);

              return (
                <div key={day.id} className="flex-1 border-r border-neutral-100 relative">
                  {/* Column Header */}
                  <div className="absolute -top-7 left-0 w-full text-center text-xs font-bold text-neutral-600 font-jakarta">
                    {day.name}
                  </div>

                  {/* Render Blocks */}
                  {dayEvents.map((det) => {
                    const mk = det.JadwalKuliah.MataKuliah;
                    const jMulai = timeToMinutes(det.JadwalKuliah.JamMulai);
                    const jSelesai = timeToMinutes(det.JadwalKuliah.JamSelesai);
                    
                    const topPx = jMulai - startOfDayMins;
                    const heightPx = jSelesai - jMulai;

                    // Ensure it stays within bounds logically
                    if (topPx < 0 || heightPx <= 0) return null;

                    return (
                      <div 
                        key={det.ID}
                        className="absolute w-[calc(100%-8px)] left-[4px] rounded-md bg-orange-100/80 border border-orange-300 p-1.5 shadow-sm overflow-hidden group hover:z-10 hover:shadow-md transition-all cursor-pointer"
                        style={{ 
                          top: `${topPx}px`, 
                          height: `${heightPx}px` 
                        }}
                      >
                        <div className="text-[10px] font-bold text-orange-800 leading-tight mb-0.5 break-words">
                          {mk.Name}
                        </div>
                        <div className="text-[9px] text-orange-600 font-medium">
                          {det.JadwalKuliah.Ruang}
                        </div>
                        <div className="text-[8px] text-orange-500/80 absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {det.JadwalKuliah.JamMulai}-{det.JadwalKuliah.JamSelesai}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            })}

          </div>
        </div>
      </div>
    </div>
  )
}
