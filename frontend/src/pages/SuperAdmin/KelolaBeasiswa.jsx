import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const KelolaBeasiswa = () => {
    const scholarships = [
        { id: 1, name: "Beasiswa PPA", provider: "Kemendikbud", quota: 500, applicants: 1240, status: "Pendaftaran Dibuka" },
        { id: 2, name: "Beasiswa Unggulan BKU", provider: "Internal Yayasan", quota: 50, applicants: 450, status: "Seleksi Berjalan" },
        { id: 3, name: "Beasiswa KIP-Kuliah", provider: "Pemerintah Pusat", quota: 1200, applicants: 3500, status: "Tutup" },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase ">Manajemen Beasiswa Institusi</h1>
                  <p className="text-secondary mt-1 font-medium ">Otoritas pusat untuk mengelola skema bantuan pendidikan dan pemantauan distribusi dana.</p>
                </div>
                <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Buat Program Beasiswa
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary/50">Total Anggaran Dialokasikan</p>
                      <h3 className="text-3xl font-black text-primary  font-headline uppercase">Rp 4.5 Milyar</h3>
                  </div>
                  <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-4 font-headline">
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary/50 uppercase">Penerima Aktif</p>
                      <h3 className="text-3xl font-black text-primary  uppercase tracking-tighter">1,245 Mahasiswa</h3>
                  </div>
              </div>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm">
                 <div className="p-10 border-b border-outline-variant/30 bg-surface-container-low/50">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Daftar Program Beasiswa Aktif</h3>
                 </div>
                 <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70  leading-tight">
                      <th className="px-10 py-6">Nama Program</th>
                      <th className="px-10 py-6">Penyelenggara / Provider</th>
                      <th className="px-10 py-6 text-center">Kuota</th>
                      <th className="px-10 py-6 text-center">Pendaftar</th>
                      <th className="px-10 py-6">Fase Status</th>
                      <th className="px-10 py-6 text-right">Kelola</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text">
                    {scholarships.map((s, idx) => (
                      <tr key={idx} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-10 py-6">
                            <span className="font-extrabold text-primary uppercase tracking-tight  group-hover:text-blue-700 transition-colors">{s.name}</span>
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-secondary uppercase tracking-tighter opacity-80">{s.provider}</td>
                        <td className="px-10 py-6 text-center font-black text-primary tracking-tighter">{s.quota}</td>
                        <td className="px-10 py-6 text-center text-sm font-bold text-secondary">{s.applicants}</td>
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-2.5">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    s.status === 'Pendaftaran Dibuka' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                    s.status === 'Seleksi Berjalan' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                    'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                    {s.status}
                                </span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <button className="px-4 py-2 hover:bg-primary/5 rounded-xl text-primary transition-all">
                                <span className="material-symbols-outlined text-[20px]">description</span>
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

export default KelolaBeasiswa;
