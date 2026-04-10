import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { menuItems } from '../../constants/menuItems';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function Sidebar() {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Tetap lanjutkan logout sisi client meskipun API gagal
    } finally {
      logout();
      toast.success('Berhasil logout');
      navigate('/login', { replace: true });
    }
  };
  
  return (
    <aside className="w-[260px] bg-white border-r border-[#e5e5e5] h-screen sticky top-0 flex flex-col z-20 shrink-0">
      
      {/* Logo & Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[#eef1f6]">
        <div className="w-8 h-8 rounded-lg bg-white border border-[#dbe6ff] flex items-center justify-center overflow-hidden mr-3 p-1">
          <img src="/images/bku logo.png" alt="Logo Universitas" className="w-full h-full object-contain" />
        </div>
        <span className="font-bold font-headline text-[#171717] tracking-tight">BKU Student Hub</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-[#eef4ff] text-[#00236F] border border-[#c9d8ff] hover:bg-[#e0ebff]' 
                  : 'text-[#525252] hover:bg-[#f7faff] hover:text-[#171717]'
              }`
            }
          >
            <item.icon size={18} strokeWidth={2.5} />
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-[#eef1f6]">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-[#dc2626] hover:bg-[#fef2f2] rounded-xl transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
