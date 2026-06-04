import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, FileText, GraduationCap } from 'lucide-react';

export default function RegistrationCTA() {
  const channels = [
    { 
      title: 'Jalur PMDP (Rapor)', 
      subtitle: 'Tanpa Tes Tertulis',
      desc: 'Penelusuran Minat & Prestasi akademik menggunakan nilai rapor semester 1-5 bagi lulusan SMA/SMK/MA sederajat.', 
      icon: Award 
    },
    { 
      title: 'Jalur Reguler (CBT)', 
      subtitle: 'Ujian Tulis & Kesehatan',
      desc: 'Seleksi umum berbasis ujian komputer (Computer Based Test) dilengkapi tes kesehatan dasar medis (termasuk tes buta warna medis).', 
      icon: FileText 
    },
    { 
      title: 'Jalur Alih Jenjang / Ekstensi', 
      subtitle: 'Kelanjutan Lulusan D3',
      desc: 'Program khusus bagi lulusan Diploma 3 (D3) yang ingin melanjutkan studi ke jenjang Sarjana (S1), contohnya lulusan D3 Farmasi ke S1 Farmasi.', 
      icon: GraduationCap 
    }
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
      {/* Background glow lines */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)' }} />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">

        {/* Header */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
            Jalur Penerimaan Mahasiswa Baru
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline leading-tight" style={{ color: 'var(--theme-text-on-primary)' }}>
            Pilih Jalur Terbaik & Rancang Masa Depanmu
          </h2>
          <p className="font-light text-sm sm:text-base leading-relaxed" style={{ color: 'var(--theme-muted-on-primary)' }}>
            Menerima pendaftaran mahasiswa baru Universitas Bhakti Kencana melalui 3 jalur masuk resmi. Daftarkan dirimu sekarang untuk mengamankan kuota program studi pilihanmu.
          </p>
        </div>

        {/* Channels Grid (3 Pillars) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {channels.map((ch, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 group"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--theme-surface) 2%, transparent)',
                border: '1px solid color-mix(in srgb, var(--theme-text-on-primary) 5%, transparent)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)';
                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-secondary) 30%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-surface) 2%, transparent)';
                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-text-on-primary) 5%, transparent)';
              }}
            >
              <div className="space-y-6">
                {/* Icon Wrap */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--theme-secondary) 20%, transparent)',
                    color: 'var(--theme-secondary)'
                  }}
                >
                  <ch.icon className="size-5" />
                </div>

                {/* Title & Desc */}
                <div className="space-y-2">
                  <div>
                    <span className="font-bold text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--theme-secondary)' }}>{ch.subtitle}</span>
                    <h3 className="text-base sm:text-lg font-extrabold font-headline leading-snug" style={{ color: 'var(--theme-text-on-primary)' }}>{ch.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm font-light leading-relaxed" style={{ color: 'var(--theme-muted-on-primary)' }}>
                    {ch.desc}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 mt-6 flex items-center justify-between"
                style={{ borderTop: '1px solid color-mix(in srgb, var(--theme-text-on-primary) 5%, transparent)' }}
              >
                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--theme-muted-on-primary)' }}>PMB 2025/2026</span>
                <Link to="/login" className="text-xs font-bold flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--theme-secondary)' }}
                >
                  Pilih Jalur <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center flex-wrap gap-4 pt-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold shadow-lg transition-all duration-300 font-headline text-sm"
            style={{
              backgroundColor: 'var(--theme-secondary)',
              color: 'var(--theme-h1)',
              boxShadow: '0 8px 32px color-mix(in srgb, var(--theme-secondary) 30%, transparent)'
            }}
          >
            Daftar Sekarang
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 font-headline text-sm"
            style={{
              border: '2px solid rgba(255,255,255,0.5)',
              color: 'var(--theme-text-on-primary)'
            }}
          >
            Masuk Portal PMB
          </Link>
        </div>

      </div>
    </section>
  );
}
