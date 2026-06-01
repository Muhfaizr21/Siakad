import React from 'react';
import { Link } from 'react-router-dom';
import { usePeriodsQuery, useParticipantsQuery, useScoresQuery, useMentorsQuery } from '../../../queries/useKencanaAdminQuery';

const Dashboard = () => {
  const { data: periods, isLoading: loadingPeriods } = usePeriodsQuery();
  const { data: participants, isLoading: loadingParticipants } = useParticipantsQuery();
  const { data: scores, isLoading: loadingScores } = useScoresQuery();
  const { data: mentors, isLoading: loadingMentors } = useMentorsQuery();
  const isLoading = loadingPeriods || loadingParticipants || loadingScores || loadingMentors;

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  // Active period
  const activePeriod = (periods || []).find(p => p.is_active) || periods?.[0] || null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Section with Premium Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-8 md:p-12 shadow-2xl">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-black uppercase tracking-widest mb-4 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Pusat Kendali Utama
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
              Super Admin Kencana
            </h1>
            <p className="text-emerald-100 text-lg max-w-2xl font-medium">
              Kelola seluruh tahapan PKKMB, atur penugasan mentor, dan awasi perkembangan nilai mahasiswa dari satu *dashboard* terpusat.
            </p>
          </div>
          
          <div className="flex-shrink-0 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 text-center min-w-[160px]">
            <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-1">Periode Aktif</p>
            <p className="text-xl font-black text-white line-clamp-1">
              {activePeriod ? activePeriod.name : 'Belum Ada'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Periode */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-1">Total Periode</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-slate-800">{periods?.length || 0}</span>
          </div>
        </div>

        {/* Card 2: Peserta */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-1">Total Peserta</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-slate-800">{participants?.length || 0}</span>
          </div>
        </div>

        {/* Card 3: Mentors */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-1">Total Mentor</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-slate-800">{mentors?.length || 0}</span>
          </div>
        </div>

        {/* Card 4: Nilai */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-1">Data Nilai</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-slate-800">{scores?.length || 0}</span>
            <span className="text-sm font-bold text-slate-400 mb-1">Entri</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black text-slate-800">Akses Cepat Pengelolaan</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          
          <Link to="/kencana-admin/periods" className="p-8 hover:bg-slate-50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition-colors">Periode PKKMB</h3>
            <p className="text-sm text-slate-500 font-medium">Buka atau tutup periode Kencana.</p>
          </Link>

          <Link to="/kencana-admin/stages" className="p-8 hover:bg-slate-50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">Tahapan & Materi</h3>
            <p className="text-sm text-slate-500 font-medium">Kelola modul, quiz, dan materi untuk mahasiswa.</p>
          </Link>

          <Link to="/kencana-admin/mentors" className="p-8 hover:bg-slate-50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">Akun Mentor</h3>
            <p className="text-sm text-slate-500 font-medium">Buat dan kelola akun Dewan Pembimbing Kencana.</p>
          </Link>

          <Link to="/kencana-admin/scores" className="p-8 hover:bg-slate-50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-rose-600 transition-colors">Rekap Penilaian</h3>
            <p className="text-sm text-slate-500 font-medium">Lihat dan ekspor hasil penilaian akhir mahasiswa.</p>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
