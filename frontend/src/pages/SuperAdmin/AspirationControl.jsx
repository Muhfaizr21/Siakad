import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';

const AspirationControl = () => {
  const [aspirations, setAspirations] = useState([]);
  const [stats, setStats] = useState({ active: 0, overdue: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aspRes, statsRes] = await Promise.all([
        adminService.getGlobalAspirations(),
        adminService.getStats()
      ]);

      if (aspRes.status === 'success') {
        setAspirations(aspRes.data || []);
      }
      if (statsRes.status === 'success') {
        setStats({
          active: statsRes.data.aspirasi_aktif,
          overdue: statsRes.data.sla_overdue,
          resolved: statsRes.data.resolved_today
        });
      }
    } catch (error) {
      console.error('Gagal memuat pusat aspirasi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none">
      <Sidebar />
      <main className="pl-80 flex flex-col min-h-screen w-full">
        <TopNavBar />
        <div className="p-8 space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight uppercase tracking-widest leading-none">Global Aspiration Center</h1>
              <p className="text-slate-600 mt-2 font-medium opacity-90">Unified monitoring and escalation hub for student grievances across all faculties.</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[ 
                { label: "Total Aktif", count: stats.active, color: "text-blue-600", trend: "Monitoring Sistem" },
                { label: "SLA Overdue", count: stats.overdue, color: "text-rose-600", trend: "Tindakan Mendesak" },
                { label: "Selesai Hari Ini", count: stats.resolved, color: "text-emerald-600", trend: "Update Harian" },
            ].map((stat, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-2 group hover:border-primary transition-all">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{stat.label}</p>
                    <h3 className={`text-4xl font-black ${stat.color} group-hover:scale-110 transition-transform origin-left`}>{stat.count}</h3>
                    <p className={`text-[10px] font-bold opacity-70`}>{stat.trend}</p>
                </div>
            ))}
          </div>

          <section className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm">
            <div className="p-10 bg-slate-50/50 border-b border-slate-100 flex gap-6">
               <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Global Search / Audit</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 text-2xl">search</span>
                    <input className="w-full bg-white border border-slate-200 pl-16 pr-8 py-4 rounded-2xl text-md font-bold text-primary outline-none focus:border-primary transition-all shadow-inner" placeholder="Search ticket ID or student name..." />
                  </div>
               </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6">Incident Ticket</th>
                  <th className="px-10 py-6">Faculty Origin</th>
                  <th className="px-10 py-6">Priority Level</th>
                  <th className="px-10 py-6">SLA Status</th>
                  <th className="px-10 py-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-body">
                {loading ? (
                    <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-400">Mensinkronkan pusat aspirasi...</td></tr>
                ) : aspirations.length === 0 ? (
                    <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-400">Tidak ada tiket aspirasi aktif ditemukan.</td></tr>
                ) : aspirations.map((asp) => (
                    <tr key={asp.ID} className="hover:bg-slate-50/50 transition-all select-text">
                        <td className="px-10 py-6">
                            <p className="font-extrabold text-primary uppercase">#ASP-{asp.ID.toString().padStart(4, '0')}</p>
                            <p className="text-xs text-slate-500 truncate w-64 mt-1 font-bold">{asp.Subjek}</p>
                        </td>
                        <td className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                            {asp.Fakultas?.Nama || 'Institusional'}
                        </td>
                        <td className="px-10 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest border uppercase ${
                                asp.Priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                asp.Priority === 'HIGH' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                                {asp.Priority || 'NORMAL'}
                            </span>
                        </td>
                        <td className="px-10 py-6">
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black ${asp.Deadline && new Date(asp.Deadline) < new Date() ? 'text-rose-600' : 'text-slate-500'}`}>
                                    {asp.Deadline ? `Due: ${new Date(asp.Deadline).toLocaleDateString('id-ID')}` : 'No Deadline'}
                                </span>
                                <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                    <div className={`h-full bg-primary ${asp.Status === 'Selesai' ? 'w-full !bg-emerald-500' : 'w-[40%]'}`}></div>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                            <div className="flex items-center justify-end gap-4 group cursor-pointer">
                                <span className="text-primary font-black text-[10px] uppercase tracking-widest group-hover:underline">Audit Ticket</span>
                                <span className="material-symbols-outlined text-primary text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                            </div>
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AspirationControl;
