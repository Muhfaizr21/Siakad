import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const UserManagement = () => {
    // Simulasi data user admin
    const admins = [
        { id: "ADM-001", name: "Dr. Alistair Vance", role: "Super Admin", access: "Full Control", status: "Aktif", lastLogin: "3 Menit Lalu" },
        { id: "ADM-002", name: "John Doe", role: "Admin Fakultas Teknik", access: "Restricted", status: "Aktif", lastLogin: "1 Jam Lalu" },
        { id: "ADM-003", name: "Jane Smith", role: "Admin Ormawa BEM", access: "Restricted", status: "Non-Aktif", lastLogin: "2 Hari Lalu" },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase ">Mesin RBAC & Kontrol Akses</h1>
                  <p className="text-secondary mt-1 font-medium ">Otoritas pusat untuk penugasan peran (Role) dan pembatasan izin akses pengguna.</p>
                </div>
                <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Buat Peran (Role) Baru
                </button>
              </header>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 ">
                      <th className="px-10 py-6">Nama Pengguna</th>
                      <th className="px-10 py-6">Peran Utama (Role)</th>
                      <th className="px-10 py-6">Ruang Lingkup Akses</th>
                      <th className="px-10 py-6 text-center">Izin Login</th>
                      <th className="px-10 py-6 text-right">Kelola Akses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text text-sm">
                    {admins.map((admin, idx) => (
                      <tr key={idx} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-surface-container p-2 rounded-xl flex items-center justify-center font-black text-primary  shadow-inner">
                                    {admin.name[0]}
                                </div>
                                <div>
                                    <span className="font-extrabold text-primary group-hover:text-blue-700 transition-colors uppercase ">{admin.name}</span>
                                    <p className="text-[10px] text-secondary/40 font-black tracking-widest uppercase">Login Terakhir: {admin.lastLogin}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6 font-bold text-secondary uppercase tracking-tight">{admin.role}</td>
                        <td className="px-10 py-6 uppercase tracking-widest text-[10px] font-black  text-primary/60">{admin.access}</td>
                        <td className="px-10 py-6">
                            <div className="flex items-center justify-center">
                                <div className={`w-3 h-3 rounded-full ${admin.status === 'Aktif' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <button className="px-4 py-2 hover:bg-primary/5 rounded-xl text-primary transition-all font-black text-xs uppercase tracking-widest leading-loose shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
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

export default UserManagement;
