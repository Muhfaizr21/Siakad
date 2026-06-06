import React from 'react';
import { GraduationCap, BookOpen, MessageSquare, ChevronRight, CheckCircle2, Clock, AlertCircle, Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function StatusSummary({ kencana, beasiswa, voice, kesehatan, kesehatanLoading }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-extrabold font-headline mb-4 flex items-center gap-3">
        Status & Progress
        <div className="h-1 flex-1 bg-gradient-to-r from-border to-transparent rounded-full ml-2"></div>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card A: KENCANA */}
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all border-b-2 border-b-primary/20 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            {kencana?.status === 'Selesai ✓' ? (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success rounded-full text-[10px] font-bold uppercase tracking-wide">
                <CheckCircle2 size={10} /> Selesai
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wide">
                <Clock size={10} /> {kencana?.status}
              </span>
            )}
          </div>
          <h3 className="font-bold text-base mb-3">KENCANA</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs font-bold text-text-muted">
              <span>Progress Modul</span>
              <span>{Math.round(kencana?.persentase || 0)}%</span>
            </div>
            <div className="h-2 w-full bg-background rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000" 
                 style={{ width: `${kencana?.persentase || 0}%` }}
               />
            </div>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wide leading-none pt-1">
              {kencana?.modul_selesai} dari {kencana?.total_modul} modul selesai
            </p>
          </div>
          <NavLink to="/student/kencana" className="flex items-center justify-between py-1.5 text-xs font-bold text-primary hover:underline">
            Lanjutkan <ChevronRight size={16} />
          </NavLink>
        </div>

        {/* Card B: Beasiswa */}
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all border-b-2 border-b-primary/20 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            {beasiswa?.total_tersedia > 0 ? (
              <span className="px-2 py-0.5 bg-success/10 text-success rounded-full text-[10px] font-bold uppercase tracking-wide">
                Terbuka
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-error/10 text-error rounded-full text-[10px] font-bold uppercase tracking-wide">
                Tutup
              </span>
            )}
          </div>
          <h3 className="font-bold text-base mb-1">Beasiswa</h3>
          <p className="text-xs font-semibold text-text-muted mb-4">Program Beasiswa Aktif</p>
          <div className="flex items-end gap-2 mb-5">
            <span className="text-3xl font-black text-bku-text leading-none">{beasiswa?.total_tersedia || 0}</span>
            <span className="text-xs font-bold text-text-muted mb-1 italic">Beasiswa Tersedia</span>
          </div>
          <NavLink to="/student/scholarship" className="flex items-center justify-between py-1.5 text-xs font-bold text-primary hover:underline">
            Lihat Beasiswa <ChevronRight size={16} />
          </NavLink>
        </div>

        {/* Card C: Student Voice */}
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all border-b-2 border-b-primary/20 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            {voice?.jumlah_belum_direspons > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-error/10 text-error rounded-full text-[10px] font-bold uppercase tracking-wide">
                    <AlertCircle size={10} /> {voice?.jumlah_belum_direspons} Belum Respons
                </span>
            )}
          </div>
          <h3 className="font-bold text-base mb-1">Aspirasi</h3>
          <p className="text-xs font-semibold text-text-muted mb-4">Kelola Laporan & Saran</p>
          <div className="flex items-end gap-2 mb-5">
            <span className="text-3xl font-black text-bku-text leading-none">{voice?.jumlah_aktif || 0}</span>
            <span className="text-xs font-bold text-text-muted mb-1 italic">Tiket Masih Terbuka</span>
          </div>
          <NavLink to="/student/voice" className="flex items-center justify-between py-1.5 text-xs font-bold text-primary hover:underline">
            Lihat Tiket <ChevronRight size={16} />
          </NavLink>
        </div>

        {/* Card D: Health Screening */}
        {(() => {
          // Determine status display
          const status = kesehatan?.status_kesehatan || null;
          const bmi = kesehatan?.bmi;
          const berat = kesehatan?.berat_badan;
          const tinggi = kesehatan?.tinggi_badan;

          let badgeText = 'FIT / SEHAT';
          let badgeBg = 'bg-success/10';
          let badgeText2 = 'text-success';
          let badgeIcon = <CheckCircle2 size={10} />;
          let iconBg = 'bg-success/10';
          let iconColor = 'text-success';
          let mainValue = 'Sehat';

          if (kesehatan) {
            const s = (status || 'sehat').toLowerCase();
            if (s.includes('bahaya') || s.includes('tindak')) {
              badgeText = 'PERLU TINDAKAN';
              badgeBg = 'bg-error/10';
              badgeText2 = 'text-error';
              badgeIcon = <AlertCircle size={10} />;
              iconBg = 'bg-error/10';
              iconColor = 'text-error';
              mainValue = 'Perhatian';
            } else if (s.includes('pantauan') || s.includes('observasi') || s.includes('waspada')) {
              badgeText = 'PANTAUAN';
              badgeBg = 'bg-warning/10';
              badgeText2 = 'text-warning';
              badgeIcon = <AlertCircle size={10} />;
              iconBg = 'bg-warning/10';
              iconColor = 'text-warning';
              mainValue = 'Waspada';
            } else {
              mainValue = 'Sehat';
            }
          }

          const bmiLabel = bmi
            ? (() => {
                const v = parseFloat(bmi);
                if (v < 18.5) return { txt: 'Kekurangan BB', color: 'text-primary' };
                if (v < 25)   return { txt: 'Normal', color: 'text-success' };
                if (v < 30)   return { txt: 'Kelebihan BB', color: 'text-warning' };
                return { txt: 'Obesitas', color: 'text-error' };
              })()
            : null;

          const subtitle = berat && tinggi
            ? `BB ${berat} kg · TB ${tinggi} cm`
            : 'Pemantauan Health Screening';

          const bmiDisplay = bmi ? bmi.toFixed(1) : null;

          return (
            <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all border-b-2 border-b-primary/20 group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center`}>
                  <Activity size={18} />
                </div>
                {kesehatanLoading ? (
                  <div className="h-5 w-20 bg-background rounded-full animate-pulse" />
                ) : (
                  <span className={`flex items-center gap-1 px-2 py-0.5 ${badgeBg} ${badgeText2} rounded-full text-[10px] font-bold uppercase tracking-wide`}>
                    {badgeIcon} {badgeText}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base mb-1">Kesehatan</h3>
              <p className="text-xs font-semibold text-text-muted mb-4">{subtitle}</p>
              {kesehatanLoading ? (
                <div className="space-y-2 mb-5">
                  <div className="h-8 w-24 bg-background rounded animate-pulse" />
                </div>
              ) : (
                <div className="flex items-end gap-2 mb-4">
                  <span className={`text-3xl font-black leading-none ${kesehatan ? bmiLabel?.color || 'text-bku-text' : 'text-text-muted'}`}>
                    {bmiDisplay ? bmiDisplay : mainValue}
                  </span>
                  <span className="text-xs font-bold text-text-muted mb-1 italic">
                    {bmiDisplay ? `BMI · ${bmiLabel?.txt || ''}` : 'Hasil Terakhir'}
                  </span>
                </div>
              )}
              <NavLink to="/student/health" className="flex items-center justify-between py-1.5 text-xs font-bold text-primary hover:underline">
                Cek Riwayat <ChevronRight size={16} />
              </NavLink>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
