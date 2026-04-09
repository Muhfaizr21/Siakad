import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import api from '../../lib/axios';
import { Loader2, Users, Layout, Building2, FileText, CheckCircle2, Server } from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await api.get('/admin/super/summary');
      if (response.data.status === 'success') {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Total Mahasiswa", value: data?.totalStudents?.toLocaleString() || "0", icon: <Users size={20} />, trend: "Global", color: "text-primary", bgColor: "bg-primary/5" },
    { label: "Ormawa Terdaftar", value: data?.totalOrmawa || "0", icon: <Layout size={20} />, trend: "Unit", color: "text-indigo-600", bgColor: "bg-indigo-50" },
    { label: "Fakultas Aktif", value: data?.totalFaculty || "0", icon: <Building2 size={20} />, trend: "Nodes", color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: "Antrean Proposal", value: data?.activeProposals || "0", icon: <FileText size={20} />, trend: "Urgen", color: "text-amber-600", bgColor: "bg-amber-50" },
    { label: "Tingkat Integritas", value: "99.9%", icon: <CheckCircle2 size={20} />, trend: "Sistem", color: "text-primary", bgColor: "bg-primary/5" },
    { label: "Node Terkoneksi", value: "A+", icon: <Server size={20} />, trend: "Status", color: "text-primary", bgColor: "bg-primary/5" },
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen flex font-body select-none">
      <Sidebar />
      <main className="lg:ml-80 ml-0 flex flex-col min-h-screen w-full transition-all duration-300">
        <TopNavBar />
        <div className="p-10 space-y-10 ">
          <header className="flex justify-between items-end ">
            <div className=" leading-none font-body">
              <h1 className="text-3xl font-black text-primary tracking-tighter uppercase leading-none">Pusat Komando Strategis</h1>
              <p className="text-slate-600 mt-3 font-medium opacity-90">Visibilitas waktu-nyata terhadap ekosistem kemahasiswaan universitas.</p>
            </div>
            <div className="bg-white border border-slate-200 px-8 py-3.5 rounded-xl flex items-center gap-3 font-black text-[10px] shadow-sm uppercase tracking-widest leading-none">
                <span className="text-primary text-sm leading-none font-bold uppercase">Dashboard Live</span>
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 font-body text-current">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 flex flex-col justify-between shadow-sm hover:border-primary/50 transition-all cursor-pointer group ">
                <div className="flex justify-between items-start mb-10 leading-none font-body">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bgColor} shadow-inner group-hover:scale-110 transition-transform ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none ">{stat.trend}</span>
                </div>
                <div className=" leading-none font-body">
                  <h3 className="text-2xl font-black text-primary tracking-tighter leading-none uppercase">
                      {loading ? '...' : stat.value}
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mt-2.5 group-hover:text-primary transition-colors leading-none ">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-body text-current">
            <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-slate-100 space-y-10 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center px-2 uppercase">
                <h3 className="text-xl font-black text-primary uppercase tracking-[0.1em] leading-none font-body">Aktivitas Lintas Unit</h3>
                <button className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline ">Lihat Semua Log</button>
              </div>
              <div className="space-y-6 ">
                  <div className="flex items-center justify-between p-7 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:border-primary/30 transition-all font-body cursor-pointer">
                    <div className="flex items-center gap-6 leading-none">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100 ">
                         <Server size={20} />
                      </div>
                      <div className=" leading-none">
                        <p className="font-extrabold text-primary group-hover:text-blue-700 transition-colors uppercase tracking-tighter leading-none font-body">Status Node Central: Optimal</p>
                        <p className="text-[10px] text-slate-600 font-bold opacity-90 uppercase tracking-widest mt-1 ">System • Baru saja diperbarui</p>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            <div className="bg-primary p-12 rounded-[4rem] text-white space-y-12 shadow-xl shadow-primary/10 relative overflow-hidden group border border-white/5 ">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000 leading-none text-white">
                    <Building2 size={120} />
                </div>
                <div className="">
                  <h3 className="text-2xl font-black uppercase tracking-widest leading-none font-body">Agregat <br/> Institusional</h3>
                  <p className="text-xs text-white/60 font-medium leading-relaxed max-w-sm mt-5 font-body">Ringkasan status infrastruktur dan validasi data global.</p>
                </div>

                <div className="space-y-7 leading-none font-body">
                   {[ 
                      { label: "Total Mahasiswa", val: `${data?.totalStudents || 0}`, icon: <Users size={20} /> },
                      { label: "Ormawa Terdaftar", val: `${data?.totalOrmawa || 0}`, icon: <Layout size={20} /> },
                      { label: "Integritas Data", val: "99.9%", icon: <CheckCircle2 size={20} /> }
                   ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-2xl font-body">
                      <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center ">
                        {item.icon}
                      </div>
                      <div className=" leading-none">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.label}</p>
                        <p className="text-[18px] font-black text-white leading-none mt-1.5 font-body">{item.val}</p>
                      </div>
                    </div>
                   ))}
                </div>

                <button className="w-full py-5 bg-white text-primary rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/5 hover:scale-[1.03] active:scale-95 transition-all leading-none font-body">
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
