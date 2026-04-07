import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const ProposalPipeline = () => {
    const proposals = [
        { id: "PROP-2024-001", title: "LDKM Nasional Informatika 2024", ormawa: "HIMA Informatika", date: "2 Jam Lalu", budget: "Rp 12.500.000", status: "Menunggu Review", priority: "Tinggi" },
        { id: "PROP-2024-002", title: "Festival Budaya Nusantara", ormawa: "UKM Kesenian", date: "5 Jam Lalu", budget: "Rp 45.000.000", status: "Butuh Revisi", priority: "Sedang" },
        { id: "PROP-2024-003", title: "Program Pengabdian Desa Binaan", ormawa: "BEM Universitas", date: "Yesterday", budget: "Rp 8.000.000", status: "Selesai", priority: "Biasa" },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase ">Monitoring Proposal Global</h1>
                  <p className="text-secondary mt-1 font-medium ">Otoritas verifikasi tahap akhir untuk seluruh kegiatan dan anggaran ORMAWA universitas.</p>
                </div>
                <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Konfigurasi Alur Verifikasi
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats */}
                <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 flex flex-col justify-between shadow-sm hover:border-primary/50 transition-all group">
                    <div className="flex justify-between items-start mb-6 font-headline  uppercase tracking-widest leading-tight">
                        <span className="text-[10px] font-black text-secondary/40">Total Menunggu Review</span>
                    </div>
                    <div className="flex items-end justify-between">
                         <h3 className="text-5xl font-black text-primary  font-headline tracking-tighter">12</h3>
                         <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-sm font-black">pending_actions</span>
                         </div>
                    </div>
                </div>
                <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 flex flex-col justify-between shadow-sm hover:border-amber-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-6 font-headline  uppercase tracking-widest leading-tight">
                        <span className="text-[10px] font-black text-secondary/40 uppercase">Revisi Berjalan</span>
                    </div>
                    <div className="flex items-end justify-between">
                         <h3 className="text-5xl font-black text-amber-600  font-headline tracking-tighter">04</h3>
                         <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <span className="material-symbols-outlined text-sm font-black">edit_note</span>
                         </div>
                    </div>
                </div>
              </div>

              {/* Feed Proposal */}
              <div className="bg-white rounded-[3.5rem] border border-outline-variant/30 overflow-hidden shadow-sm">
                 <div className="p-10 border-b border-outline-variant/30 bg-surface-container-low/50 font-headline uppercase leading-tight font-black tracking-widest flex justify-between items-end ">
                    <div>
                        <h3 className="text-sm text-primary">Feed Persetujuan Global</h3>
                    </div>
                    <span className="text-[10px] text-secondary opacity-70 uppercase leading-relaxed tracking-widest ">12 Proposal Butuh Review Hari Ini</span>
                 </div>
                 <div className="divide-y divide-outline-variant/10">
                    {proposals.map((prop, idx) => (
                        <div key={idx} className="p-10 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer border-l-4 border-transparent hover:border-primary">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-secondary/60 font-black tracking-widest uppercase  bg-surface-container px-3 py-1 rounded-lg">ID: {prop.id}</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                                        prop.priority === 'Tinggi' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                        prop.priority === 'Sedang' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                        'bg-slate-50 text-slate-500 border-slate-100'
                                    }`}>PRIORITAS {prop.priority}</span>
                                </div>
                                <h4 className="font-extrabold text-primary text-xl tracking-tight max-w-xl group-hover:text-blue-700 transition-colors uppercase leading-tight ">{prop.title}</h4>
                                <div className="flex gap-8 text-xs font-bold text-secondary tracking-tight font-body">
                                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm opacity-70">groups</span> {prop.ormawa}</span>
                                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm opacity-70">payments</span> Anggaran: <span className="font-black text-primary  uppercase">{prop.budget}</span></span>
                                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm opacity-70">history</span> {prop.date}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    prop.status === 'Menunggu Review' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    prop.status === 'Butuh Revisi' ? 'bg-slate-50 text-slate-500 border-slate-100' :
                                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                                }`}>{prop.status}</span>
                                <span className="material-symbols-outlined text-secondary opacity-20 transform translate-x-4 group-hover:translate-x-6 transition-all duration-300">double_arrow</span>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
            </div>
          </main>
        </div>
    )
}

export default ProposalPipeline;
