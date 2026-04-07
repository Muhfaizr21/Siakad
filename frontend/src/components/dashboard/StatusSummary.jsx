import React from 'react';
import { GraduationCap, BookOpen, MessageSquare, ChevronRight, CheckCircle2, Clock, AlertCircle, Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function StatusSummary({ kencana, beasiswa, voice }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-extrabold font-headline mb-4 flex items-center gap-3">
        Status & Progress
        <div className="h-1 flex-1 bg-gradient-to-r from-[#e5e5e5] to-transparent rounded-full ml-2"></div>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card A: KENCANA */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all border-b-2 border-b-[#00236F]/20 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-[#eef4ff] text-[#00236F] rounded-xl flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            {kencana?.status === 'Selesai ✓' ? (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#f0fdf4] text-[#16a34a] rounded-full text-[10px] font-bold uppercase tracking-wide">
                <CheckCircle2 size={10} /> Selesai
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#eef4ff] text-[#00236F] rounded-full text-[10px] font-bold uppercase tracking-wide">
                <Clock size={10} /> {kencana?.status}
              </span>
            )}
          </div>
          <h3 className="font-bold text-base mb-3">KENCANA</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs font-bold text-[#525252]">
              <span>Progress Modul</span>
              <span>{Math.round(kencana?.persentase || 0)}%</span>
            </div>
            <div className="h-2 w-full bg-[#f5f5f5] rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-[#00236F] to-[#0B4FAE] transition-all duration-1000" 
                 style={{ width: `${kencana?.persentase || 0}%` }}
               />
            </div>
            <p className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wide leading-none pt-1">
              {kencana?.modul_selesai} dari {kencana?.total_modul} modul selesai
            </p>
          </div>
          <NavLink to="/student/kencana" className="flex items-center justify-between py-1.5 text-xs font-bold text-[#00236F] hover:underline">
            Lanjutkan <ChevronRight size={16} />
          </NavLink>
        </div>

        {/* Card B: Beasiswa */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all border-b-2 border-b-[#00236F]/20 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-[#eff6ff] text-[#3b82f6] rounded-xl flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            {beasiswa?.jumlah_menunggu > 0 && (
                <span className="px-2 py-0.5 bg-[#eff6ff] text-[#3b82f6] rounded-full text-[10px] font-bold uppercase tracking-wide">
                    {beasiswa?.jumlah_menunggu} Menunggu
                </span>
            )}
          </div>
          <h3 className="font-bold text-base mb-1">Beasiswa</h3>
          <p className="text-xs font-semibold text-[#a3a3a3] mb-4">Status Pengajuan Terbaru</p>
          <div className="flex items-end gap-2 mb-5">
            <span className="text-3xl font-black text-[#171717] leading-none">{beasiswa?.jumlah_proses || 0}</span>
            <span className="text-xs font-bold text-[#525252] mb-1 italic">Pengajuan Sedang Diproses</span>
          </div>
          <NavLink to="/student/scholarship" className="flex items-center justify-between py-1.5 text-xs font-bold text-[#00236F] hover:underline">
            Lihat Status <ChevronRight size={16} />
          </NavLink>
        </div>

        {/* Card C: Student Voice */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all border-b-2 border-b-[#00236F]/20 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-[#f5f3ff] text-[#8b5cf6] rounded-xl flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            {voice?.jumlah_belum_direspons > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#fef2f2] text-[#ef4444] rounded-full text-[10px] font-bold uppercase tracking-wide">
                    <AlertCircle size={10} /> {voice?.jumlah_belum_direspons} Belum Respons
                </span>
            )}
          </div>
          <h3 className="font-bold text-base mb-1">Aspirasi</h3>
          <p className="text-xs font-semibold text-[#a3a3a3] mb-4">Kelola Laporan & Saran</p>
          <div className="flex items-end gap-2 mb-5">
            <span className="text-3xl font-black text-[#171717] leading-none">{voice?.jumlah_aktif || 0}</span>
            <span className="text-xs font-bold text-[#525252] mb-1 italic">Tiket Masih Terbuka</span>
          </div>
          <NavLink to="/student/voice" className="flex items-center justify-between py-1.5 text-xs font-bold text-[#00236F] hover:underline">
            Lihat Tiket <ChevronRight size={16} />
          </NavLink>
        </div>

        {/* Card D: Health Screening */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all border-b-2 border-b-[#00236F]/20 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-[#f0fdf4] text-[#16a34a] rounded-xl flex items-center justify-center">
              <Activity size={18} />
            </div>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#f0fdf4] text-[#16a34a] rounded-full text-[10px] font-bold uppercase tracking-wide">
              <CheckCircle2 size={10} /> FIT / SEHAT
            </span>
          </div>
          <h3 className="font-bold text-base mb-1">Kesehatan</h3>
          <p className="text-xs font-semibold text-[#a3a3a3] mb-4">Pemantauan Health Screening</p>
          <div className="flex items-end gap-2 mb-5">
            <span className="text-3xl font-black text-[#171717] leading-none">Aman</span>
            <span className="text-xs font-bold text-[#525252] mb-1 italic">Hasil Terakhir</span>
          </div>
          <NavLink to="/student/health" className="flex items-center justify-between py-1.5 text-xs font-bold text-[#00236F] hover:underline">
            Cek Riwayat <ChevronRight size={16} />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
