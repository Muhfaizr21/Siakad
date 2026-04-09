import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getAuditLogs()
        ]);
        
        if (statsRes.status === 'success') {
          const s = statsRes.data;
          setStats([
            { label: "Total Mahasiswa", value: s.total_mahasiswa.toLocaleString(), icon: "person", trend: "Global", color: "text-primary" },
            { label: "Aspirasi Aktif", value: s.aspirasi_aktif, icon: "forum", trend: "SLA", color: "text-primary" },
            { label: "SLA Overdue", value: s.sla_overdue, icon: "warning", trend: "Urgent", color: "text-rose-600" },
            { label: "Selesai Hari Ini", value: s.resolved_today, icon: "check_circle", trend: "Today", color: "text-emerald-600" },
            { label: "Antrean Proposal", value: s.antrean_proposal, icon: "task", trend: "Urgen", color: "text-amber-600" },
            { label: "Total Anggota Ormawa", value: s.total_anggota_ormawa.toLocaleString(), icon: "groups", trend: "Aktif", color: "text-indigo-600" },
          ]);
        }

        if (logsRes.status === 'success') {
          setLogs(logsRes.data || []);
        }
      } catch (err) {
        console.error("Gagal load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white text-slate-900 min-h-screen flex font-body select-none">
      <Sidebar />
      <main className="pl-80 flex flex-col min-h-screen w-full ">
        <TopNavBar />
        <div className="p-10 space-y-10 ">
          <header className="flex justify-between items-end ">
            <div className=" leading-none font-body">
              <h1 className="text-3xl font-black text-primary tracking-tighter uppercase  leading-none">Pusat Komando Strategis</h1>
              <p className="text-slate-600 mt-3 font-medium  opacity-90">Visibilitas waktu-nyata terhadap ekosistem kemahasiswaan BKU Student Hub.</p>
            </div>
            <div className="bg-white border border-slate-200 px-8 py-3.5 rounded-xl flex items-center gap-3 font-black text-[10px] shadow-sm  uppercase tracking-widest leading-none">
                <span className="material-symbols-outlined text-primary text-sm  leading-none">calendar_today</span>
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5  font-body">
            {loading ? (
                 Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-slate-50 h-32 rounded-[2.5rem] animate-pulse"></div>
                 ))
            ) : stats.map((stat, i) => (
              <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 flex flex-col justify-between shadow-sm hover:border-primary/50 transition-all cursor-pointer group ">
                <div className="flex justify-between items-start mb-10  leading-none font-body">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 shadow-inner group-hover:scale-110 transition-transform `}>
                    <span className={`material-symbols-outlined ${stat.color} text-xl `}>{stat.icon}</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none ">{stat.trend}</span>
                </div>
                <div className=" leading-none font-body">
                  <h3 className="text-2xl font-black text-primary tracking-tighter  leading-none  uppercase">{stat.value}</h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mt-2.5 group-hover:text-primary transition-colors leading-none ">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8  font-body">
            <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-slate-100 space-y-10 shadow-sm ">
              <div className="flex justify-between items-center px-2  uppercase">
                <h3 className="text-xl font-black text-primary uppercase tracking-[0.1em]  leading-none font-body">Aktivitas Lintas Unit</h3>
                <Link to="/admin/audit" className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline ">Lihat Semua Log</Link>
              </div>
              <div className="space-y-6 ">
                {loading ? (
                    <p className="text-center py-10 text-slate-400">Memuat log...</p>
                ) : logs.length === 0 ? (
                    <p className="text-center py-10 text-slate-400">Belum ada aktivitas.</p>
                ) : logs.slice(0, 5).map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-7 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:border-primary/30 transition-all  font-body cursor-pointer">
                    <div className="flex items-center gap-6  leading-none">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100 ">
                         <span className="material-symbols-outlined ">security</span>
                      </div>
                      <div className=" leading-none">
                        <p className="font-extrabold text-primary group-hover:text-blue-700 transition-colors uppercase  tracking-tighter leading-none  font-body truncate max-w-md">{log.Aktivitas.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-slate-600 font-bold opacity-90  uppercase tracking-widest mt-1 ">{log.Deskripsi}</p>
                        <p className="text-[8px] text-slate-400 mt-1 uppercase font-black">{new Date(log.CreatedAt).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-200 transform group-hover:translate-x-2 transition-transform ">chevron_right</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary p-12 rounded-[4rem] text-white space-y-12 shadow-xl shadow-primary/10 relative overflow-hidden group border border-white/5 ">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000  leading-none">
                    <span className="material-symbols-outlined text-[150px] text-white  leading-none">account_balance</span>
                </div>
                <div className="">
                  <h3 className="text-2xl font-black uppercase tracking-widest  leading-none  font-body">Agregat <br/> Institusional</h3>
                  <p className="text-xs text-white/60 font-medium leading-relaxed max-w-sm mt-5  font-body">Ringkasan status infrastruktur dan validasi data global.</p>
                </div>

                <div className="space-y-7  leading-none font-body">
                   {[ 
                      { label: "Ruang Kelas Global", val: "450 Node", icon: "meeting_room" },
                      { label: "Total Pengguna Aktif", val: loading ? "..." : stats[0]?.value + "+", icon: "person" },
                      { label: "Integritas Data", val: "99.8%", icon: "verified" }
                   ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-2xl  font-body">
                      <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center ">
                        <span className="material-symbols-outlined text-xl  leading-none">{item.icon}</span>
                      </div>
                      <div className=" leading-none">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest ">{item.label}</p>
                        <p className="text-[18px] font-black text-white  leading-none mt-1.5  font-body">{item.val}</p>
                      </div>
                    </div>
                   ))}
                </div>

                <button className="w-full py-5 bg-white text-primary rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/5 hover:scale-[1.03] active:scale-95 transition-all  leading-none font-body">
                    Lihat Analisis Detail
                </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
