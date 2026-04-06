import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const StudentDirectory = () => {
    // Menambahkan prop "batch" ke data
    const students = [
        { id: "240001", name: "Muhammad Faiz", fac: "Fakultas Teknik", major: "Informatika", batch: "2024", status: "Active", gpa: "3.92" },
        { id: "240002", name: "Siti Aminah", fac: "Fakultas Ekonomi", major: "Akuntansi", batch: "2024", status: "Active", gpa: "3.85" },
        { id: "230045", name: "Budi Santoso", fac: "Fakultas Hukum", major: "Ilmu Hukum", batch: "2023", status: "Disabled (Alumni)", gpa: "3.50" },
        { id: "220110", name: "Riana Putri", fac: "Fakultas Kedokteran", major: "Pendidikan Dokter", batch: "2022", status: "Active", gpa: "4.00" },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase italic">Master Student Database</h1>
                  <p className="text-secondary mt-1 font-medium italic">Centralized authority for 15,000+ student records across all institutional nodes.</p>
                </div>
                <div className="flex gap-4">
                     <button className="bg-white border border-outline-variant/30 px-6 py-3 rounded-2xl font-bold flex items-center gap-3 text-sm hover:bg-surface-container transition-all">
                        <span className="material-symbols-outlined text-sm">filter_list</span>
                        Advanced Filters
                    </button>
                    <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                        Export Global XLS
                    </button>
                </div>
              </header>

              {/* Master Search Bar */}
              <div className="bg-white p-2 rounded-[2.5rem] border border-outline-variant/30 flex shadow-lg hover:border-primary/50 transition-all">
                  <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-8 top-1/2 -translate-y-1/2 text-primary text-2xl">person_search</span>
                      <input className="w-full bg-white pl-20 pr-10 py-8 rounded-[2rem] text-xl font-bold text-primary placeholder:text-secondary/30 outline-none" placeholder="Search by Year, NIM, or Name..." />
                  </div>
              </div>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 italic">
                      <th className="px-10 py-6">Unique Identity</th>
                      <th className="px-10 py-6">Faculty Unit</th>
                      <th className="px-10 py-6 text-center">Batch</th>
                      <th className="px-10 py-6">Major / Prody</th>
                      <th className="px-10 py-6">GPA Index</th>
                      <th className="px-10 py-6">Status Node</th>
                      <th className="px-10 py-6 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text">
                    {students.map((student, idx) => (
                      <tr key={idx} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-bold shadow-sm ring-1 ring-primary/10">
                                  {student.name[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-extrabold text-primary group-hover:text-blue-700 transition-colors uppercase tracking-tight">{student.name}</span>
                                    <span className="text-[10px] text-secondary/60 font-black tracking-widest">{student.id}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-secondary uppercase tracking-tighter italic">{student.fac}</td>
                        <td className="px-10 py-6 text-center">
                            <span className="px-4 py-1.5 bg-primary/5 text-primary text-xs font-black rounded-lg border border-primary/10">
                                {student.batch}
                            </span>
                        </td>
                        <td className="px-10 py-6 text-sm text-secondary font-medium">{student.major}</td>
                        <td className="px-10 py-6 font-black text-primary">{student.gpa}</td>
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-2 h-2 rounded-full ${student.status === 'Active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${student.status === 'Active' ? 'text-emerald-700' : 'text-slate-400'}`}>{student.status}</span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <button className="px-4 py-2 hover:bg-primary/5 rounded-xl text-primary transition-all">
                                <span className="material-symbols-outlined text-[20px]">manage_search</span>
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
