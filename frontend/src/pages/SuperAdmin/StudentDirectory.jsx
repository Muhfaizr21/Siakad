import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const StudentDirectory = () => {
    const students = [
        { id: "240001", name: "Muhammad Faiz", fac: "Fakultas Teknik", major: "Informatika", batch: "2024", status: "Aktif", gpa: "3.92" },
        { id: "240002", name: "Siti Aminah", fac: "Fakultas Ekonomi", major: "Akuntansi", batch: "2024", status: "Aktif", gpa: "3.85" },
        { id: "230045", name: "Budi Santoso", fac: "Fakultas Hukum", major: "Ilmu Hukum", batch: "2023", status: "Alumni", gpa: "3.50" },
        { id: "220110", name: "Riana Putri", fac: "Fakultas Kedokteran", major: "Pendidikan Dokter", batch: "2022", status: "Aktif", gpa: "4.00" },
    ];

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none ">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full  font-body">
            <TopNavBar />
            <div className="p-8 space-y-8 ">
              <header className="flex justify-between items-center ">
                <div className=" leading-tight">
                  <h1 className="text-3xl font-extrabold text-primary tracking-tighter uppercase  tracking-widest leading-none ">Database Mahasiswa</h1>
                  <p className="text-[10px] text-slate-600 mt-1 font-bold  uppercase tracking-widest  leading-tight opacity-90">Otoritas 15,240 Catatan Terpusat</p>
                </div>
                <div className="flex gap-4  font-body">
                     <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-slate-100 transition-all  font-body">
                        <span className="material-symbols-outlined text-sm">filter_list</span>Filter Lanjutan
                    </button>
                    <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all  font-body">Ekspor Global XLS</button>
                </div>
              </header>

              <div className="bg-white p-1.5 rounded-[2.5rem] border border-slate-200 flex shadow-sm  font-body transition-all focus-within:border-primary/50">
                  <div className="relative flex-1 ">
                      <span className="material-symbols-outlined absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 text-2xl ">search</span>
                      <input className="w-full bg-white pl-20 pr-10 py-6 rounded-2xl text-lg font-bold text-slate-900 placeholder:text-slate-500 outline-none  font-body" placeholder="Cari berdasarkan NIM, Nama, atau Angkatan Mahasiswa..." />
                  </div>
              </div>

              <section className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm  font-body">
                <table className="w-full text-left  font-body">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600  border-b border-slate-100 leading-tight">
                      <th className="px-10 py-6">Profil Mahasiswa</th>
                      <th className="px-10 py-6">Unit / Prodi</th>
                      <th className="px-10 py-6 text-center">Angkatan</th>
                      <th className="px-10 py-6 text-center">IPK</th>
                      <th className="px-10 py-6">Status Sistem</th>
                      <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-body select-text  text-sm">
                    {students.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-all group  font-body">
                        <td className="px-10 py-6 ">
                            <div className="flex items-center gap-5  leading-tight">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary/10 transition-colors shadow-inner ">
                                  {s.name[0]}
                                </div>
                                <div className=" leading-tight">
                                    <span className="font-extrabold text-primary group-hover:text-blue-700 transition-colors uppercase  leading-tight">{s.name}</span>
                                    <p className="text-[10px] text-slate-600 font-black tracking-widest ">{s.id}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6  leading-tight uppercase ">
                            <p className="text-[10px] font-black text-slate-600 opacity-80 tracking-tight leading-tight">{s.fac}</p>
                            <p className="text-sm font-bold text-primary leading-tight ">{s.major}</p>
                        </td>
                        <td className="px-10 py-6 text-center ">
                            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[11px] font-black rounded-lg border border-slate-200">
                                {s.batch}
                            </span>
                        </td>
                        <td className="px-10 py-6 text-center font-black text-[#0056B3]  text-lg leading-none ">{s.gpa}</td>
                        <td className="px-10 py-6  leading-none">
                            <div className="flex items-center gap-2.5 ">
                                <div className={`w-2 h-2 rounded-full ${s.status === 'Aktif' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                                <span className={s.status === 'Aktif' ? 'text-emerald-700' : 'text-slate-600'}>{s.status}</span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right  leading-none">
                           <button className="w-10 h-10 hover:bg-[#0056B3]/5 rounded-xl text-[#0056B3] transition-all  leading-none">
                                <span className="material-symbols-outlined text-[18px]  leading-none">open_in_new</span>
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

export default StudentDirectory;
