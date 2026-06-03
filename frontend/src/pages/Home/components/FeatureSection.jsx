import React from 'react';
import { Compass, Award, MessageSquare, Heart, MessageSquarePlus, Trophy } from 'lucide-react';

export default function FeatureSection() {
  const modules = [
    {
      title: 'Peta Capaian Kencana',
      desc: 'Panduan kurikulum modular mahasiswa dalam bentuk game-like kuis untuk melacak tingkat kompetensi per semester.',
      icon: Compass,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:border-indigo-300'
    },
    {
      title: 'Portal Beasiswa Terpadu',
      desc: 'Pendaftaran, verifikasi, dan monitoring status pencairan beasiswa KIP Kuliah maupun beasiswa Yayasan secara daring.',
      icon: Award,
      color: 'text-amber-600 bg-amber-50 border-amber-100 hover:border-amber-300'
    },
    {
      title: 'Konseling & Pendampingan',
      desc: 'Booking jadwal konsultasi tatap muka maupun online dengan psikolog profesional kampus secara rahasia dan aman.',
      icon: MessageSquare,
      color: 'text-rose-600 bg-rose-50 border-rose-100 hover:border-rose-300'
    },
    {
      title: 'Skrining Kesehatan Berkala',
      desc: 'Evaluasi kesehatan mental (anxiety, depression) dan fisik mandiri secara periodik untuk penanganan dini.',
      icon: Heart,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300'
    },
    {
      title: 'Layanan Pengaduan Suara Mahasiswa',
      desc: 'Kirim tiket keluhan sarana, akademik, administrasi, maupun laporan perundungan langsung ke tingkat rektorat.',
      icon: MessageSquarePlus,
      color: 'text-sky-600 bg-sky-50 border-sky-100 hover:border-sky-300'
    },
    {
      title: 'Rekam Jejak Prestasi',
      desc: 'Pencatatan prestasi akademik, olahraga, seni tingkat nasional/regional yang terhubung otomatis ke SKPI lulusan.',
      icon: Trophy,
      color: 'text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-300'
    }
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="text-left max-w-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
              Ekosistem Mahasiswa BKU Hub
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-headline" style={{ color: 'var(--theme-text)' }}>
              Satu Sistem Untuk Semua Kebutuhan Akademik & Kesejahteraan
            </h2>
          </div>
          <div className="text-left md:text-right max-w-sm shrink-0">
            <p className="font-light text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
              BKU Hub dirancang eksklusif bagi mahasiswa Universitas Bhakti Kencana untuk mempermudah akses layanan perkuliahan dan bantuan psikososial.
            </p>
          </div>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, i) => (
            <div
              key={i}
              className="border rounded-3xl p-7 transition-all duration-300 flex flex-col gap-4 text-left"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)'
              }}
            >
              {/* Icon Wrap */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${mod.color}`}>
                <mod.icon className="size-5" />
              </div>

              {/* Title & Desc */}
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold font-headline" style={{ color: 'var(--theme-text)' }}>
                  {mod.title}
                </h3>
                <p className="font-light text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                  {mod.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
