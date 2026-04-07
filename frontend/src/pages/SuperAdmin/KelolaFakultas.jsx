import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const KelolaFakultas = () => {
    const faculties = [
        { id: 1, name: "Fakultas Teknik", code: "FT", dean: "Dr. Eng. Alistair Vance", totalStudents: 4200, status: "Aktif" },
        { id: 2, name: "Fakultas Ekonomi & Bisnis", code: "FEB", dean: "Prof. Dr. Siti Aminah", totalStudents: 5100, status: "Aktif" },
        { id: 3, name: "Fakultas Hukum", code: "FH", dean: "Budi Santoso, M.H.", totalStudents: 2800, status: "Aktif" },
        { id: 4, name: "Fakultas Kedokteran", code: "FK", dean: "dr. Riana Putri, Sp.A.", totalStudents: 1500, status: "Aktif" },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase ">Manajemen Entitas Fakultas</h1>
                  <p className="text-secondary mt-1 font-medium ">Otoritas pusat untuk mengelola struktur dekanat dan unit akademik universitas.</p>
                </div>
                <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Tambah Fakultas Baru
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {/* Ringkasan Cepat */}
                 <div className="md:col-span-1 bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-70">Total Node Fakultas</p>
                    <h3 className="text-4xl font-black text-primary ">08</h3>
                 </div>
                 <div className="md:col-span-1 bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-70">Dekan Terdaftar</p>
                    <h3 className="text-4xl font-black text-primary ">08</h3>
                 </div>
              </div>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 ">
                      <th className="px-10 py-6">Nama Fakultas</th>
                      <th className="px-10 py-6 text-center">Kode</th>
                      <th className="px-10 py-6">Pimpinan (Dekan)</th>
                      <th className="px-10 py-6 text-center">Populasi Mhs</th>
                      <th className="px-10 py-6">Status Node</th>
                      <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text">
                    {faculties.map((fac, idx) => (
                      <tr key={idx} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-10 py-6">
                            <span className="font-extrabold text-primary uppercase tracking-tight  group-hover:text-blue-700 transition-colors leading-tight">{fac.name}</span>
                        </td>
                        <td className="px-10 py-6 text-center">
                            <span className="px-3 py-1 bg-slate-100 text-secondary text-xs font-black rounded-lg border border-outline-variant/10">
                                {fac.code}
                            </span>
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-secondary">{fac.dean}</td>
                        <td className="px-10 py-6 text-center font-black text-primary">{fac.totalStudents.toLocaleString()}</td>
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{fac.status}</span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <button className="px-4 py-3 hover:bg-primary/5 rounded-xl text-primary transition-all">
                                <span className="material-symbols-outlined text-[20px]">edit_square</span>
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

export default KelolaFakultas;
