import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const UserManagement = () => {
  const users = [
    { id: 1, name: "Dr. Akhmad Yusuf", role: "FACULTY ADMIN", email: "yusuf@univ.ac.id", status: "Active", faculty: "Teknik" },
    { id: 2, name: "Siti Aminah, M.Kom", role: "ORMAWA ADMIN", email: "siti@univ.ac.id", status: "Active", faculty: "MIPA" },
    { id: 3, name: "Budi Santoso", role: "STUDENT", email: "budi@student.univ.ac.id", status: "Inactive", faculty: "Ekonomi" },
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-headline">
      <Sidebar />
      <main className="pl-80 flex flex-col min-h-screen w-full">
        <TopNavBar />
        <div className="p-8 space-y-8">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight">RBAC Engine</h1>
              <p className="text-secondary mt-1">Institutional identity and global access control authority.</p>
            </div>
            <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
              <span className="material-symbols-outlined">person_add</span>
              Provision New Identity
            </button>
          </header>

          {/* User Table Section */}
          <section className="bg-white border border-outline-variant/30 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-outline-variant/30 bg-surface-container-low/50 flex gap-4">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary/60">search</span>
                <input 
                  type="text" 
                  placeholder="Search by name, ID, or institutional email..." 
                  className="w-full pl-14 pr-6 py-4 bg-surface border border-outline-variant/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                />
              </div>
              <button className="px-8 py-4 bg-surface border border-outline-variant/30 rounded-2xl font-bold flex items-center gap-3 hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined">tune</span>
                Filter Scope
              </button>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/20 text-[11px] font-extrabold uppercase tracking-[0.2em] text-secondary/60">
                  <th className="px-10 py-6">Institutional Identity</th>
                  <th className="px-10 py-6">Faculty Scope</th>
                  <th className="px-10 py-6">Authority Level</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/[0.01] transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-primary group-hover:text-blue-700 transition-colors">{user.name}</p>
                          <p className="text-xs text-secondary/70 font-body">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-sm font-semibold text-secondary">Fakultas {user.faculty}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-primary/10 bg-primary/5 text-primary`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                        <span className="text-xs font-extrabold tracking-wide uppercase">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="px-5 py-2.5 hover:bg-primary/5 rounded-xl text-primary font-bold text-xs transition-all border border-transparent hover:border-primary/10">
                        Edit Access
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
  );
};

export default UserManagement;
