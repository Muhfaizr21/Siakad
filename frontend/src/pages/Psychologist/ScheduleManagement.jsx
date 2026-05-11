import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { 
  Calendar, Clock, Save, Plus, Trash2, 
  CheckCircle2, AlertCircle, Info, Coffee,
  Moon, Sun, Sparkles
} from 'lucide-react';
import { UI } from '../../constants/designSystem';

export default function ScheduleManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Senin');
  
  const [schedule, setSchedule] = useState([
    { day: 'Senin', enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '16:00' }] },
    { day: 'Selasa', enabled: true, slots: [{ start: '10:00', end: '15:00' }] },
    { day: 'Rabu', enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
    { day: 'Kamis', enabled: false, slots: [] },
    { day: 'Jumat', enabled: true, slots: [{ start: '08:00', end: '11:00' }] },
  ]);

  const currentDayData = schedule.find(s => s.day === selectedDay);

  const toggleDay = (day) => {
    setSchedule(prev => prev.map(s => s.day === day ? { ...s, enabled: !s.enabled, slots: !s.enabled ? [{ start: '09:00', end: '12:00' }] : [] } : s));
  };

  const addSlot = (day) => {
    setSchedule(prev => prev.map(s => s.day === day ? { ...s, slots: [...s.slots, { start: '00:00', end: '00:00' }] } : s));
  };

  const removeSlot = (day, index) => {
    setSchedule(prev => prev.map(s => s.day === day ? { ...s, slots: s.slots.filter((_, i) => i !== index) } : s));
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className={UI.layout.canvas}>
          
          {/* Header Section (Compact but Vibrant) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden mb-6">
             <div className="absolute right-0 top-0 h-full w-1/4 bg-gradient-to-l from-primary/5 to-transparent"></div>
             <Sparkles className="absolute right-8 top-1/2 -translate-y-1/2 size-16 text-primary/5" />
             
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <h1 className="text-xl font-black text-primary uppercase tracking-tight font-headline">Manajemen Jadwal</h1>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Atur jam ketersediaan konseling harian Anda</p>
                </div>
                <button className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2">
                   <Save size={16} /> Simpan Semua Perubahan
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Day Selector Sidebar (Col 3) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Pilih Hari</h3>
                {schedule.map((item) => (
                  <button
                    key={item.day}
                    onClick={() => setSelectedDay(item.day)}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm
                      ${selectedDay === item.day 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                        : 'bg-surface-container-low text-slate-600 hover:bg-slate-50 border border-transparent'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                       <Calendar size={16} className={selectedDay === item.day ? 'text-white' : 'text-primary'} />
                       <span>{item.day}</span>
                    </div>
                    {item.enabled ? (
                      <div className={`size-2 rounded-full ${selectedDay === item.day ? 'bg-white' : 'bg-emerald-500'} animate-pulse`}></div>
                    ) : (
                      <div className="size-2 rounded-full bg-slate-200"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Status Info Card */}
              <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col gap-3">
                 <ShieldCheck size={24} className="text-emerald-600" />
                 <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide leading-relaxed">
                    Jadwal Anda disinkronkan secara otomatis dengan Portal Mahasiswa.
                 </p>
              </div>
            </div>

            {/* Time Slots Config (Col 9) */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Current Day Detail Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`p-6 flex items-center justify-between border-b border-slate-50 ${currentDayData.enabled ? 'bg-slate-50/50' : 'bg-rose-50/30'}`}>
                   <div className="flex items-center gap-4">
                      <div className={`size-12 rounded-2xl flex items-center justify-center shadow-sm ${currentDayData.enabled ? 'bg-primary text-white' : 'bg-white text-slate-300 border border-slate-100'}`}>
                         {selectedDay === 'Senin' ? <Sun size={24} /> : selectedDay === 'Jumat' ? <Coffee size={24} /> : <Clock size={24} />}
                      </div>
                      <div>
                         <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight font-headline">{selectedDay}</h2>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {currentDayData.enabled ? 'Klinik Dibuka' : 'Klinik Ditutup'}
                         </p>
                      </div>
                   </div>
                   <button 
                    onClick={() => toggleDay(selectedDay)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentDayData.enabled ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-primary text-white shadow-lg'}`}
                   >
                     {currentDayData.enabled ? 'Set Libur' : 'Set Aktif'}
                   </button>
                </div>

                <div className="p-10">
                  {currentDayData.enabled ? (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                         <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <Clock size={16} /> Atur Slot Waktu
                         </h3>
                         <button 
                          onClick={() => addSlot(selectedDay)}
                          className="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors"
                         >
                            <Plus size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Tambah Slot</span>
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {currentDayData.slots.map((slot, index) => (
                           <div key={index} className="group relative p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                              <div className="flex items-center gap-6">
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase">Mulai</span>
                                    <input type="time" defaultValue={slot.start} className="bg-transparent text-sm font-black focus:outline-none focus:text-primary transition-colors cursor-pointer" />
                                 </div>
                                 <div className="h-8 w-[1px] bg-slate-200"></div>
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase">Selesai</span>
                                    <input type="time" defaultValue={slot.end} className="bg-transparent text-sm font-black focus:outline-none focus:text-primary transition-colors cursor-pointer" />
                                 </div>
                              </div>
                              <button 
                                onClick={() => removeSlot(selectedDay, index)}
                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                         ))}
                      </div>

                      {currentDayData.slots.length === 0 && (
                        <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum ada slot waktu. Klik tambah slot.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                       <div className="size-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-300">
                          <Moon size={40} />
                       </div>
                       <div>
                          <h3 className="text-sm font-black text-slate-900 uppercase">Hari Libur</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Anda tidak melayani konseling pada hari {selectedDay}</p>
                       </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Help Hint */}
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4">
                 <Info size={20} className="text-blue-500 shrink-0" />
                 <div>
                    <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wide leading-relaxed">
                       Tips: Pastikan ada jeda istirahat minimal 30 menit di antara slot waktu konseling agar sesi Anda tetap optimal.
                    </p>
                 </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

const ShieldCheck = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
