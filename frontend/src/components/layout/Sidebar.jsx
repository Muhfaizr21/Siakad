import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { menuItems } from '../../constants/menuItems';

export default function Sidebar() {
  const logout = useAuthStore(state => state.logout);
  const mahasiswa = useAuthStore(state => state.mahasiswa) || { nama: 'Tegar', nim: '10123456', prodi: 'Teknik Informatika' };
  
  return (
    <aside className="w-[260px] bg-white border-r border-[#e5e5e5] h-screen sticky top-0 flex flex-col z-20 shrink-0">
      
      {/* Logo & Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[#e5e5e5]">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center text-white font-bold text-xl mr-3 shadow-sm">
          B
        </div>
        <span className="font-bold font-headline text-[#171717] tracking-tight">BKU Student Hub</span>
      </div>

      {/* Profile Info */}
      <NavLink 
        to="/student/profile" 
        className={({ isActive }) => 
          `mx-4 my-6 p-4 rounded-3xl border transition-all flex items-center gap-4 group ${
            isActive ? 'bg-[#fff7ed] border-[#fed7aa]' : 'bg-[#fafafa]/50 border-[#f5f5f5] hover:bg-white hover:border-[#fed7aa] hover:shadow-xl hover:shadow-orange-100'
          }`
        }
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e5e5] shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
           {mahasiswa.foto_url ? (
             <img src={mahasiswa.foto_url} alt="Profile" className="w-full h-full object-cover" />
           ) : (
             <UserIcon size={24} className="text-[#d4d4d4]" />
           )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#171717] text-sm truncate leading-tight group-hover:text-[#f97316] transition-colors">{mahasiswa.nama}</h3>
          <p className="text-[10px] text-[#a3a3a3] font-black uppercase tracking-widest truncate">{mahasiswa.nim}</p>
        </div>
      </NavLink>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-[#fff7ed] text-[#f97316] shadow-sm shadow-[#f97316]/5' 
                  : 'text-[#525252] hover:bg-[#fafafa] hover:text-[#171717]'
              }`
            }
          >
            <item.icon size={18} strokeWidth={2.5} />
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-[#e5e5e5]">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-[#dc2626] hover:bg-[#dc2626]/10 rounded-xl transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
