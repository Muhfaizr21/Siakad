import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';
import { ormawaService } from '../../services/api';

const AbsensiKegiatan = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (ormawaId) {
      loadInitialData();
    }
  }, [ormawaId]);

  useEffect(() => {
    if (activeSession) {
      fetchAttendance(activeSession.id);
    }
  }, [activeSession]);

  const loadInitialData = async () => {
    try {
      const [eventsData, membersData] = await Promise.all([
        ormawaService.getEvents(ormawaId),
        ormawaService.getMembers(ormawaId)
      ]);

      if (eventsData.status === 'success') {
        const list = (eventsData.data || []).map(ev => ({
          id: ev.id,
          eventName: ev.title,
          date: new Date(ev.startDate).toLocaleDateString(),
          isActive: new Date(ev.endDate) > new Date(),
          codeData: `siakad-attendance-${ev.id}`
        }));
        setSessions(list);
        if (list.length > 0 && !activeSession) setActiveSession(list[0]);
      }

      if (membersData.status === 'success') setMembers(membersData.data || []);
    } catch (e) {
      console.error("Gagal memuat data absensi:", e);
    }
  };

  const fetchAttendance = async (eventId) => {
    try {
      const data = await ormawaService.getAttendance(eventId);
      if (data.status === 'success') setAttendees(data.data || []);
    } catch (e) { console.error(e); }
  };

  const handleStatusChange = async (studentObj, newStatus) => {
    try {
      const data = await ormawaService.recordAttendance({
        eventScheduleId: activeSession.id,
        studentId: studentObj.id,
        status: newStatus,
        timeIn: new Date().toISOString()
      });
      if (data.status === 'success') fetchAttendance(activeSession.id);
    } catch (e) { 
      alert(`⚠️ Gagal mencatat absensi: ${e.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'hadir':
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-200">Hadir</span>;
      case 'izin':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-amber-200">Izin</span>;
      case 'alpa':
        return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-rose-200">Alpa</span>;
      case 'sakit':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-blue-200">Sakit</span>;
      default:
        return <span className="text-xs uppercase font-bold text-on-surface-variant">Pending</span>;
    }
  };

  if (!activeSession && sessions.length === 0) return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 min-h-screen pb-12 transition-all duration-300 flex items-center justify-center p-4">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="text-center bg-surface-container-lowest p-8 lg:p-12 rounded-[3rem] border border-outline-variant/10 shadow-xl max-w-lg w-full">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
             <span className="material-symbols-outlined text-4xl">calendar_today</span>
          </div>
          <h2 className="text-2xl font-black font-headline text-on-surface mb-2">Sesi Tidak Ditemukan</h2>
          <p className="text-on-surface-variant mb-8 text-sm font-medium leading-relaxed ">Belum ada sesi kegiatan aktif untuk organisasi Anda saat ini.</p>
          <button onClick={() => window.location.href='/ormawa/jadwal'} className="bg-primary hover:bg-primary-fixed text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all active:scale-95 w-full lg:w-auto">Buat Jadwal Di Sini</button>
        </div>
      </main>
    </div>
  );

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold font-headline mb-2 text-on-surface">Generator Presensi QR</h1>
              <p className="text-on-surface-variant text-sm font-medium">Buat sesi absensi kegiatan secara instan, lacak kehadiran via pindai (scan), dan kelola rekapan otomatis.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1 border border-outline-variant/20 rounded-3xl bg-surface-container-lowest shadow-sm flex flex-col p-6 items-center text-center">
              <div className="w-full flex justify-between items-center mb-6">
                <span className="text-sm font-bold font-headline text-primary">Live Session</span>
                {activeSession?.isActive ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-[10px] uppercase rounded-full tracking-widest animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface-container text-on-surface-variant font-bold text-[10px] uppercase rounded-full tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> Ended
                  </span>
                )}
              </div>
              
              <div className="mb-2 w-full text-left">
                <h2 className="text-xl font-bold font-headline leading-tight">{activeSession?.eventName}</h2>
                <p className="text-xs font-semibold text-on-surface-variant mt-1 mb-8">{activeSession?.date} • ID: {activeSession?.id}</p>
              </div>
              
              <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 mb-8 relative group">
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${activeSession?.codeData}&color=00236f&bgcolor=ffffff`}
                   alt="Session QR"
                   className="w-56 h-56 object-contain"
                 />
              </div>

              <p className="text-xs text-on-surface-variant mb-4 px-4 font-medium leading-relaxed">
                Tampilkan layar ini di meja registrasi. Anggota dapat memindai kehadiran via aplikasi.
              </p>

              <div className="w-full pt-6 border-t border-outline-variant/20 mt-auto">
                <label className="text-[10px] font-black text-primary text-left block mb-3 uppercase tracking-[0.2em]">Pilih Sesi Kegiatan</label>
                <div className="relative group/select">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/select:text-primary transition-colors z-10 pointer-events-none">calendar_month</span>
                  <select 
                    className="w-full bg-surface-container-low/50 border border-outline-variant/30 hover:border-primary/30 pl-12 pr-4 py-4 rounded-[1.25rem] focus:ring-2 focus:ring-primary/10 focus:border-primary font-black text-sm outline-none appearance-none cursor-pointer transition-all shadow-inner"
                    value={activeSession?.id}
                    onChange={(e) => setActiveSession((sessions || []).find(s => s.id.toString() === e.target.value))}
                  >
                    {(sessions || []).map(s => (
                      <option key={s.id} value={s.id}>{s.eventName} — {s.date}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            </div>

            <div className="xl:col-span-2 border border-outline-variant/20 rounded-3xl bg-surface-container-lowest shadow-sm flex flex-col overflow-hidden">
               <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
                  <h3 className="font-bold text-lg font-headline flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">groups</span>
                    Rekap Kehadiran
                  </h3>
               </div>
               
               <div className="p-6 grid grid-cols-3 gap-4 border-b border-outline-variant/10 bg-surface">
                 <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex flex-col justify-center items-center">
                   <h4 className="text-3xl font-extrabold text-emerald-700 font-headline">{attendees.filter(a => a.status === 'hadir').length}</h4>
                   <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Hadir</p>
                 </div>
                 <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 flex flex-col justify-center items-center">
                   <h4 className="text-3xl font-extrabold text-rose-700 font-headline">{attendees.filter(a => a.status === 'alpa').length}</h4>
                   <p className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Alpa</p>
                 </div>
                 <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex flex-col justify-center items-center">
                   <h4 className="text-3xl font-extrabold text-amber-700 font-headline">{attendees.filter(a => a.status === 'izin' || a.status === 'sakit').length}</h4>
                   <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Izin / Sakit</p>
                 </div>
               </div>

               <div className="overflow-x-auto flex-grow h-full bg-surface-container-lowest">
                  <table className="w-full text-left text-sm text-on-surface">
                    <thead className="text-xs text-on-surface-variant uppercase bg-surface border-b border-outline-variant/20 font-label tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 font-bold">Mahasiswa</th>
                        <th className="px-6 py-4 font-bold text-center">Status</th>
                        <th className="px-6 py-4 font-bold text-right pr-10">Tandai Manual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {(members || []).map(m => {
                        const att = (attendees || []).find(a => a.studentId === m.studentId);
                        return (
                          <tr key={m.id} className="hover:bg-surface-container-low/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-sm font-headline group-hover:text-primary transition-colors">
                                {m.student?.name}
                              </div>
                              <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                                NIM: {m.student?.nim} {att ? `• Tercatat: ${new Date(att.timeIn).toLocaleTimeString()}` : '• Belum Absen'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {getStatusBadge(att?.status)}
                            </td>
                            <td className="px-6 py-4 text-right pr-6">
                               <select 
                                 className="text-[11px] font-bold border border-outline-variant/30 rounded-lg p-2 outline-none bg-surface-container-low"
                                 value={att?.status || ''}
                                 onChange={(e) => handleStatusChange(m.student, e.target.value)}
                               >
                                 <option value="">-- Set Status --</option>
                                 <option value="hadir">Hadir</option>
                                 <option value="izin">Izin</option>
                                 <option value="sakit">Sakit</option>
                                 <option value="alpa">Alpa</option>
                               </select>
                            </td>
                          </tr>
                        );
                      })}
                      {(members || []).length === 0 && <tr><td colSpan="3" className="text-center py-12  text-on-surface-variant">Belum ada data anggota</td></tr>}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AbsensiKegiatan;
