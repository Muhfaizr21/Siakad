import React from 'react';
import { GraduationCap, BookOpen, MessageSquare, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function StatusSummary({ kencana, beasiswa, voice }) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-extrabold font-headline mb-6 flex items-center gap-3">
        Status & Progress
        <div className="h-1 flex-1 bg-gradient-to-r from-[#e5e5e5] to-transparent rounded-full ml-2"></div>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card A: KENCANA */}
        <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm hover:shadow-lg transition-all border-b-4 border-b-[#f97316]/20 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#fff7ed] text-[#f97316] rounded-2xl flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            {kencana?.status === 'Selesai ✓' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f0fdf4] text-[#16a34a] rounded-full text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 size={12} /> Selesai
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#fff7ed] text-[#d97706] rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Clock size={12} /> {kencana?.status}
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg mb-4">KENCANA</h3>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-xs font-bold text-[#525252]">
              <span>Progress Modul</span>
              <span>{Math.round(kencana?.persentase || 0)}%</span>
            </div>
            <div className="h-2.5 w-full bg-[#f5f5f5] rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-[#f97316] to-[#ea580c] transition-all duration-1000" 
                 style={{ width: `${kencana?.persentase || 0}%` }}
               />
            </div>
            <p className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-widest leading-none pt-1">
              {kencana?.modul_selesai} dari {kencana?.total_modul} modul selesai
            </p>
          </div>
          <NavLink to="/student/kencana" className="flex items-center justify-between py-2 text-sm font-bold text-[#f97316] hover:underline">
            Lanjutkan <ChevronRight size={16} />
          </NavLink>
        </div>

        {/* Card B: Beasiswa */}
        <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm hover:shadow-lg transition-all border-b-4 border-b-[#f97316]/20 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#eff6ff] text-[#3b82f6] rounded-2xl flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            {beasiswa?.jumlah_menunggu > 0 && (
                <span className="px-3 py-1 bg-[#eff6ff] text-[#3b82f6] rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {beasiswa?.jumlah_menunggu} Menunggu
                </span>
            )}
          </div>
          <h3 className="font-bold text-lg mb-1">Beasiswa</h3>
          <p className="text-sm font-semibold text-[#a3a3a3] mb-6">Status Pengajuan Terbaru</p>
          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-black text-[#171717] leading-none">{beasiswa?.jumlah_proses || 0}</span>
            <span className="text-xs font-bold text-[#525252] mb-1 italic">Pengajuan Sedang Diproses</span>
          </div>
          <NavLink to="/student/scholarship" className="flex items-center justify-between py-2 text-sm font-bold text-[#f97316] hover:underline">
            Lihat Status <ChevronRight size={16} />
          </NavLink>
        </div>

        {/* Card C: Student Voice */}
        <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm hover:shadow-lg transition-all border-b-4 border-b-[#f97316]/20 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#f5f3ff] text-[#8b5cf6] rounded-2xl flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            {voice?.jumlah_belum_direspons > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#fef2f2] text-[#ef4444] rounded-full text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle size={10} /> {voice?.jumlah_belum_direspons} Belum Respons
                </span>
            )}
          </div>
          <h3 className="font-bold text-lg mb-1">Aspirasi</h3>
          <p className="text-sm font-semibold text-[#a3a3a3] mb-6">Kelola Laporan & Saran</p>
          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-black text-[#171717] leading-none">{voice?.jumlah_aktif || 0}</span>
            <span className="text-xs font-bold text-[#525252] mb-1 italic">Tiket Masih Terbuka</span>
          </div>
          <NavLink to="/student/voice" className="flex items-center justify-between py-2 text-sm font-bold text-[#f97316] hover:underline">
            Lihat Tiket <ChevronRight size={16} />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
