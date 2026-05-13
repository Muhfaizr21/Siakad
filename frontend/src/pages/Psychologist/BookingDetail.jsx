import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { 
  ArrowLeft, Calendar, Clock, User, 
  Mail, Phone, BookOpen, AlertCircle,
  CheckCircle2, XCircle, FileText,
  MessageSquare, ShieldCheck,
  Activity, ExternalLink
} from 'lucide-react';
import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    let ignore = false;
    psychologistService.getBookingDetail(id).then((res) => {
      if (!ignore) setBooking({ ...res.data, color: 'bg-primary' });
    });
    return () => { ignore = true; };
  }, [id]);

  const handleStatus = async (status) => {
    await psychologistService.updateBookingStatus(id, status);
    setBooking((prev) => ({ ...prev, status }));
  };

  if (!booking) {
    return <div className="bg-surface text-on-surface min-h-screen"><Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} /><main className={UI.layout.main}><TopNavBar setIsOpen={setSidebarOpen} /><div className={UI.layout.canvas}>Memuat detail booking...</div></main></div>;
  }

  const history = (booking.history || []).map((item) => ({ ...item, icon: item.type === 'created' ? MessageSquare : Clock, color: item.type === 'created' ? 'text-blue-500' : 'text-amber-500' }));

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className={UI.layout.canvas}>
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all mb-4 group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Kembali</span>
          </button>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            <div className="xl:col-span-2 space-y-6">
              
              {/* Compact Profile Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-24 bg-primary-container relative">
                   <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/80 to-transparent"></div>
                   <div className="absolute -bottom-8 left-8">
                      <div className={`size-16 rounded-2xl ${booking.color} text-white flex items-center justify-center text-xl font-black border-4 border-white shadow-md`}>
                        {booking.avatar}
                      </div>
                   </div>
                </div>
                <div className="pt-10 pb-6 px-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-primary uppercase tracking-tight">{booking.name}</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.nim} • {booking.prodi}</p>
                    </div>
                    <span className="px-4 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-widest self-start md:self-center">
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    {[
                      { label: 'Email', value: booking.email, icon: Mail },
                      { label: 'WhatsApp', value: booking.phone, icon: Phone },
                      { label: 'Akademik', value: `Smt ${booking.semester}`, icon: BookOpen },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50">
                         <item.icon className="size-3.5 text-slate-400" />
                         <div className="overflow-hidden">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                            <p className="text-[10px] font-bold text-slate-700 truncate">{item.value}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compact Details */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                         <Calendar className="size-4 text-primary" />
                         <div>
                            <p className="text-[8px] font-black uppercase text-slate-400">Tanggal</p>
                            <p className="text-xs font-bold text-slate-900">{booking.date}</p>
                         </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                         <Clock className="size-4 text-primary" />
                         <div>
                            <p className="text-[8px] font-black uppercase text-slate-400">Waktu</p>
                            <p className="text-xs font-bold text-slate-900">{booking.time}</p>
                         </div>
                      </div>
                   </div>
                   <div className="p-6 rounded-2xl bg-primary text-white space-y-2 relative overflow-hidden">
                      <Activity className="absolute -right-4 -bottom-4 size-24 text-white/10" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/60">Isu Utama</p>
                      <p className="text-xl font-black uppercase tracking-tight">{booking.issue}</p>
                   </div>
                </div>

                <div className="space-y-3">
                   <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">Catatan Mahasiswa</h4>
                   <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs font-medium text-slate-600 italic">"{booking.note}"</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                 <h3 className="text-[9px] font-black text-primary uppercase tracking-widest">Tindakan</h3>
                 <div className="space-y-2">
                     <button onClick={() => handleStatus('Dikonfirmasi')} className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
                        Konfirmasi
                     </button>
                     <button onClick={() => handleStatus('Ditolak')} className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                        Tolak
                     </button>
                 </div>
                 <button className="w-full py-3 border border-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <FileText size={14} /> Rekam Medis
                 </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                 <h3 className="text-[9px] font-black text-primary uppercase tracking-widest mb-6">Riwayat</h3>
                 <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                     {history.map((item, i) => (
                      <div key={i} className="flex gap-4 relative z-10">
                         <div className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                            <item.icon className={`size-4 ${item.color}`} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase">{item.action}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.time}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
