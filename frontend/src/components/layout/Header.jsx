import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User, LogOut, ChevronRight, Settings } from 'lucide-react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';
import useAuthStore from '../../store/useAuthStore';
import { menuItems } from '../../constants/menuItems';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  
  const logout = useAuthStore(state => state.logout);
  const mahasiswa = useAuthStore(state => state.mahasiswa) || { nama: 'Tegar', nim: '10123456' };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Tetap lanjut logout di client
    } finally {
      logout();
      setIsProfileOpen(false);
      toast.success('Berhasil logout');
      navigate('/login', { replace: true });
    }
  };

  // Filter menu items for search
  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : menuItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format path to breadcrumb
  const pathParts = location.pathname.split('/').filter(p => p !== '');
  const currentPage = pathParts.length > 1 ? pathParts[1] : 'Dashboard';
  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  return (
    <header className="h-16 bg-white border-b border-[#e5e5e5] flex items-center justify-between px-6 sticky top-0 z-50 shrink-0">
      
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-[#525252] hover:text-[#f97316] transition">
          <Menu size={20} />
        </button>
        
        {/* Breadcrumb dummy */}
        <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#525252]">
          <span className="text-[#a3a3a3]">Student Portal</span>
          <span className="text-[#e5e5e5]">/</span>
          <span className="text-[#171717]">{pageTitle.replace('-', ' ')}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:block relative px-2" ref={searchRef}>
          <div className="relative flex items-center">
            <Search size={16} className={`absolute left-3 transition-colors ${isSearchFocused ? 'text-[#f97316]' : 'text-[#a3a3a3]'}`} />
            <input 
              type="text" 
              placeholder="Cari layanan..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              className="pl-9 pr-4 py-1.5 w-64 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-sm focus:outline-none focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/5 transition-all"
            />
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {isSearchFocused && searchQuery.trim() !== '' && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] overflow-hidden p-2 z-[60]"
              >
                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <p className="px-3 py-2 text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Hasil Pencarian</p>
                    {searchResults.map(item => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setSearchQuery('');
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#fff7ed] hover:text-[#f97316] text-sm font-bold transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#fafafa] group-hover:bg-white flex items-center justify-center border border-[#e5e5e5] group-hover:border-[#fed7aa] transition-colors">
                          <item.icon size={16} />
                        </div>
                        {item.name}
                        <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Search size={32} className="mx-auto text-[#d4d4d4] mb-2" />
                    <p className="text-sm font-bold text-[#a3a3a3]">Layanan tidak ditemukan</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification */}
        <NotificationDropdown />

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-[#e5e5e5]"></div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 p-1 rounded-full transition-all hover:bg-[#fafafa] ${isProfileOpen ? 'ring-4 ring-[#f97316]/10' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fed7aa] to-[#f97316] text-white flex items-center justify-center font-black text-xs shadow-sm border border-white">
              {mahasiswa.nama.charAt(0).toUpperCase()}
            </div>
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-[#e5e5e5] overflow-hidden z-[60]"
              >
                {/* User Info Section */}
                <div className="bg-gradient-to-br from-[#171717] to-[#333] p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl overflow-hidden shrink-0">
                      {mahasiswa.foto_url ? (
                        <img src={mahasiswa.foto_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-[#f97316]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-base truncate">{mahasiswa.nama}</h4>
                      <p className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest truncate">{mahasiswa.nim}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
                        <span className="text-[10px] font-bold text-[#16a34a] uppercase">Aktif</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="p-3 bg-[#fafafa]/50">
                  <div className="space-y-1">
                    <NavLink 
                      to="/student/profile" 
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white hover:shadow-md text-sm font-bold text-[#525252] hover:text-[#f97316] transition-all group"
                    >
                      <User size={18} className="group-hover:scale-110 transition-transform" />
                      Data Diri
                    </NavLink>
                    <NavLink 
                      to="/student/profile?tab=preferensi" 
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white hover:shadow-md text-sm font-bold text-[#525252] hover:text-[#f97316] transition-all group"
                    >
                      <Settings size={18} className="group-hover:scale-110 transition-transform" />
                      Pengaturan
                    </NavLink>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl hover:bg-red-50 text-sm font-bold text-[#dc2626] transition-all group"
                    >
                      <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                      Keluar Sesi
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
