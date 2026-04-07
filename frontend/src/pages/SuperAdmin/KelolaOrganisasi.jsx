import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const KelolaOrganisasi = () => {
    const orgs = [
      { id: 1, name: "BEM Universitas", type: "Internal", chairman: "Muhammad Faiz", status: "Aktif", sk: "SK/2024/UNIV/001" },
      { id: 2, name: "DPM Universitas", type: "Internal", chairman: "Siti Aminah", status: "Aktif", sk: "SK/2024/UNIV/002" },
      { id: 3, name: "UKM Teater", type: "UKM", chairman: "Budi Santoso", status: "Masa Transisi", sk: "SK/2023/UKM/015" },
      { id: 4, name: "HIMA Informatika", type: "Himpunan", chairman: "Riana Putri", status: "Dibekukan", sk: "SK/2023/HIMA/009" },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase ">Registri & Legalitas Ormawa</h1>
                  <p className="text-secondary mt-1 font-medium ">Otoritas pusat untuk pendaftaran, pembekuan, dan monitoring kepengurusan ORMAWA.</p>
                </div>
                <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Registrasi Ormawa Baru
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-2 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 leading-tight">Total Ormawa Terdaftar</p>
                      <h3 className="text-3xl font-black text-primary  font-headline uppercase">42 Unit</h3>
                  </div>
                  <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-2 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 leading-tight">Kepengurusan Aktif</p>
                      <h3 className="text-3xl font-black text-emerald-600  font-headline uppercase tracking-tighter ">38 Unit</h3>
                  </div>
              </div>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70  leading-tight">
                      <th className="px-10 py-6">Nama Organisasi</th>
                      <th className="px-10 py-6 text-center">Tipe Unit</th>
                      <th className="px-10 py-6">Ketua Umum</th>
                      <th className="px-10 py-6">Nomor SK / Legalitas</th>
                      <th className="px-10 py-6">Status Node</th>
                      <th className="px-10 py-6 text-right">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text">
                    {orgs.map((o, idx) => (
                      <tr key={idx} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-10 py-6">
                            <span className="font-extrabold text-primary uppercase tracking-tight  group-hover:text-blue-700 transition-colors leading-tight">{o.name}</span>
                        </td>
                        <td className="px-10 py-6 text-center">
                             <span className="text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-100">
                                {o.type}
                             </span>
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-secondary uppercase tracking-tighter opacity-80">{o.chairman}</td>
                        <td className="px-10 py-6 text-xs text-secondary/60 font-black tracking-widest  leading-tight">{o.sk}</td>
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-2.5">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    o.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                    o.status === 'Masa Transisi' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                    'bg-rose-50 text-rose-500 border-rose-100'
                                }`}>
                                    {o.status}
                                </span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <button className="px-4 py-3 hover:bg-primary/5 rounded-xl text-primary transition-all">
                                <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
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

export default KelolaOrganisasi;
