import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { UserCircle2 } from 'lucide-react';

const TopNavBar = () => {
  const { data: profile } = useQuery({
    queryKey: ['mahasiswa', 'profile'],
    queryFn: async () => {
      const { data } = await api.get('/profil');
      return data.data;
    }
  });

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${path}`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#fcf9f8]/80 backdrop-blur-md shadow-sm flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold text-blue-900 font-headline">BKU Student Hub</span>
        <div className="hidden md:flex items-center bg-slate-100/50 px-4 py-2 rounded-full w-96">
          <span className="material-symbols-outlined text-slate-500 mr-2">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-slate-500 outline-none" 
            placeholder="Search courses, resources, or help..." 
            type="text" 
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-blue-50 transition-colors active:scale-95 duration-150">
          <span className="material-symbols-outlined text-blue-900">notifications</span>
        </button>
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary/20 bg-white flex items-center justify-center">
          {profile?.FotoURL ? (
            <img 
              alt="Student profile picture" 
              src={getFullUrl(profile.FotoURL)} 
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle2 className="text-slate-300 w-8 h-8" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
