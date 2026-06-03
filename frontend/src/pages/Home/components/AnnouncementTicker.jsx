import React from 'react';

export default function AnnouncementTicker() {
  const announcements = [
    'Penerimaan Mahasiswa Baru 2025/2026 Telah Resmi Dibuka',
    'Mahasiswa Profesi Ners BKU Raih Kelulusan 98,57% di UKNI 2025',
    'BKU Tersertifikasi ISO 21001:2018 untuk Sistem Manajemen Organisasi Pendidikan',
    'Kampus Tersebar di 8 Kota Strategis di Indonesia',
    '23 Program Studi Pilihan — Terakreditasi BAN-PT & LAM-PTKes',
  ];

  // Double the list to ensure smooth infinite loop scroll
  const scrollItems = [...announcements, ...announcements];

  return (
    <div className="bg-[var(--theme-secondary)] text-[var(--theme-primary)] overflow-hidden py-3 font-semibold text-xs tracking-wider shadow-sm select-none border-b border-[var(--theme-primary)]/10">
      <div className="flex w-max animate-[marquee_25s_linear_infinite] whitespace-nowrap gap-12 pl-4">
        {scrollItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[var(--theme-primary)] rounded-full inline-block animate-pulse shrink-0" />
            <span className="font-headline font-bold uppercase tracking-widest">{item}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
