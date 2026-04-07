import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const LecturerDirectory = () => {
    const lecturers = [
        { id: "100203001", nidn: "0402038801", name: "Dr. Eng. Alistair Vance", fac: "Fakultas Teknik", major: "Informatika", status: "Aktif", role: "Ketua Jurusan" },
        { id: "100203002", nidn: "0412059002", name: "Prof. Dr. Siti Aminah", fac: "Fakultas Ekonomi", major: "Akuntansi", status: "Aktif", role: "Dosen Biasa" },
        { id: "100203003", nidn: "0422018503", name: "Budi Santoso, M.H.", fac: "Fakultas Hukum", major: "Ilmu Hukum", status: "Cuti Sabatikal", role: "Lektor Kepala" },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase  tracking-widest">Database Induk Dosen</h1>
                  <p className="text-secondary mt-1 font-medium ">Catatan institusional terpadu untuk seluruh anggota fakultas dan tenaga pendidik.</p>
                </div>
                <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Singkronisasi Data NIDN
                </button>
              </header>

              {/* Master Search Bar */}
              <div className="bg-white p-2 rounded-[2.5rem] border border-outline-variant/30 flex shadow-lg hover:border-primary/50 transition-all">
                  <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-8 top-1/2 -translate-y-1/2 text-primary text-2xl">person_search</span>
                      <input className="w-full bg-white pl-20 pr-10 py-8 rounded-[2rem] text-xl font-bold text-primary placeholder:text-secondary/30 outline-none" placeholder="Cari berdasarkan NIDN, Nama, atau Unit Fakultas..." />
                  </div>
              </div>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 ">
                      <th className="px-10 py-6">Profil Pendidik</th>
                      <th className="px-10 py-6 text-center">NIDN</th>
                      <th className="px-10 py-6">Unit Homebase</th>
                      <th className="px-10 py-6">Jabatan Akademik</th>
                      <th className="px-10 py-6">Status Sistem</th>
                      <th className="px-10 py-6 text-right">Administratif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text">
                    {lecturers.map((lecturer, idx) => (
                      <tr key={idx} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-black shadow-sm ring-1 ring-primary/10">
                                  {lecturer.name[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-extrabold text-primary group-hover:text-blue-700 transition-colors tracking-tight uppercase leading-tight">{lecturer.name}</span>
                                    <span className="text-[10px] text-secondary/60 font-black tracking-widest uppercase ">{lecturer.fac}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                            <span className="px-4 py-1.5 bg-slate-100 text-secondary text-xs font-black rounded-lg border border-outline-variant/10">
                                {lecturer.nidn}
                            </span>
                        </td>
                        <td className="px-10 py-6 text-sm text-secondary font-bold font-headline uppercase tracking-tight">{lecturer.major}</td>
                        <td className="px-10 py-6">
                             <span className="text-xs font-bold text-primary uppercase tracking-widest ">{lecturer.role}</span>
                        </td>
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-2 h-2 rounded-full ${lecturer.status === 'Aktif' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${lecturer.status === 'Aktif' ? 'text-emerald-700' : 'text-amber-600'}`}>{lecturer.status}</span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <button className="px-4 py-2 hover:bg-primary/5 rounded-xl text-primary transition-all">
                                <span className="material-symbols-outlined text-[20px]">id_card</span>
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </main>
        </div>
    )
}

export default LecturerDirectory;
