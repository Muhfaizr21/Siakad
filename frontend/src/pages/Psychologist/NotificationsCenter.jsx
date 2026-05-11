import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { 
  Bell, CheckCircle2, Calendar, 
  ClipboardList, AlertCircle, Clock,
  MoreVertical, Check, Trash2,
  ChevronRight, MessageSquare
} from 'lucide-react';
import { UI } from '../../constants/designSystem';

export default function NotificationsCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Janji Temu Baru',
      desc: 'Ahmad Rizki Pratama menjadwalkan sesi konseling untuk besok pukul 09:00.',
      time: '10 menit yang lalu',
      type: 'booking',
      unread: true,
      icon: Calendar,
      color: 'bg-primary',
    },
    {
      id: 2,
      title: 'Submisi Asesmen',
      desc: 'Siti Rahayu baru saja menyelesaikan kuis "Kecemasan Akademik".',
      time: '1 jam yang lalu',
      type: 'assessment',
      unread: true,
      icon: ClipboardList,
      color: 'bg-indigo-500',
    },
    {
      id: 3,
      title: 'Kasus Mendesak',
      desc: 'Mahasiswa dengan NIM 2021310087 membutuhkan perhatian segera (Skor DASS Tinggi).',
      time: '3 jam yang lalu',
      type: 'alert',
      unread: false,
      icon: AlertCircle,
      color: 'bg-rose-500',
    },
    {
      id: 4,
      title: 'Laporan Siap',
      desc: 'Laporan bulanan untuk periode Mei 2026 telah berhasil di-generate.',
      time: 'Kemarin',
      type: 'report',
      unread: false,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
    }
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className={UI.layout.canvas}>
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
             <div>
                <h1 className="text-xl font-black text-primary uppercase tracking-tight font-headline">Pusat Notifikasi</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pantau aktivitas terbaru dan pengingat konseling</p>
             </div>
             <div className="flex gap-2">
                <button className="px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                   <Check size={16} /> Tandai Semua Dibaca
                </button>
             </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
             {notifications.map((noti) => (
                <div 
                  key={noti.id} 
                  className={`group relative bg-white p-6 rounded-[2.5rem] border transition-all cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 flex items-start gap-6 ${noti.unread ? 'border-primary/20 shadow-sm' : 'border-slate-100 opacity-80'}`}
                >
                   {/* Unread Indicator Dot */}
                   {noti.unread && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 size-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
                   )}

                   {/* Icon Box */}
                   <div className={`size-14 rounded-3xl ${noti.color} text-white flex items-center justify-center shrink-0 shadow-lg ${noti.color}/20 group-hover:scale-110 transition-transform duration-500`}>
                      <noti.icon size={24} />
                   </div>

                   {/* Content */}
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{noti.title}</h3>
                         <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1 shrink-0">
                            <Clock size={10} /> {noti.time}
                         </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed line-clamp-2">
                         {noti.desc}
                      </p>
                   </div>

                   {/* Actions */}
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-300 hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                         <ChevronRight size={20} />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50">
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
             ))}

             {/* Footer Info */}
             <div className="py-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                   <CheckCircle2 size={12} />
                   Semua notifikasi sudah ditampilkan
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
