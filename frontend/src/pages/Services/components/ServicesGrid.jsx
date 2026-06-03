import React from 'react';
import { Building2, FlaskConical, BookOpen, Briefcase, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ServicesGrid() {
  const facilities = [
    {
      title: 'Gedung Kampus Mandiri',
      subtitle: 'Milik Sendiri & Strategis',
      desc: 'Infrastruktur fisik modern milik sendiri di lokasi strategis yang sangat mudah diakses oleh transportasi umum, menjamin keamanan dan kenyamanan belajar.',
      icon: Building2,
      image: '/images/Kampus/bandung.jpg',
      features: [
        'Gedung Kampus Milik Sendiri (Bukan Sewa)',
        'Ruang Kuliah Ber-AC & Nyaman',
        'Koneksi Wi-Fi Terintegrasi di Seluruh Area',
        'Lokasi Strategis Mudah Diakses'
      ]
    },
    {
      title: 'Laboratorium Terpadu Modern',
      subtitle: 'Teknologi Sediaan & Klinis',
      desc: 'Laboratorium canggih dengan standar industri medis dan kefarmasian untuk mendukung praktikum klinis serta penelitian berkualitas tinggi.',
      icon: FlaskConical,
      image: '/images/Kampus/jakarta.jpg',
      features: [
        'Laboratorium Steril Sediaan Obat & Kimia',
        'Instrumen Analisis Modern (Spektrofotometer/KCKT)',
        'Laboratorium Keperawatan Gawat Darurat/ICU',
        'Laboratorium Kebidanan & Simulasi Klinis'
      ]
    },
    {
      title: 'Pusat Informasi & Riset',
      subtitle: 'Perpustakaan Pusat & LPPM',
      desc: 'Layanan literatur riset terlengkap yang terintegrasi dengan akses jurnal nasional/internasional serta lembaga penelitian kemitraan.',
      icon: BookOpen,
      image: '/images/Kampus/serang.jpg',
      features: [
        'Koleksi Buku Referensi & Literatur Fisik Lengkap',
        'Akses E-Journal Internasional (Scopus/ScienceDirect)',
        'LPPM Sebagai Sentral Penelitian Mahasiswa',
        'Penyelenggara KKN Tematik Terpadu'
      ]
    },
    {
      title: 'Career Center (Pusat Karir)',
      subtitle: 'Pendampingan & Penyaluran Kerja',
      desc: 'Pusat pembinaan karir terpadu untuk mempersiapkan mahasiswa tingkat akhir menghadapi dunia industri melalui pelatihan dan penyaluran kerja.',
      icon: Briefcase,
      image: '/images/Kampus/tasik.jpg',
      features: [
        'Bimbingan Karir & Konseling Karakter Kerja',
        'Pelatihan Soft Skill (Komunikasi & Kepemimpinan)',
        'Program Magang & PKL di Industri Farmasi/RS Mitra',
        'Pusat Penyaluran & Lowongan Kerja Eksklusif'
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  return (
    <section
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: 'var(--theme-bg)' }}
    >
      {/* Decorative Blur */}
      <div
        className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)', filter: 'blur(80px)' }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">

        {/* Sub-header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
            Ekosistem & Fasilitas UBK
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline" style={{ color: 'var(--theme-text)' }}>
            Prasarana Unggulan Untuk Menjamin Kualitas Pendidikan
          </h2>
          <p className="font-light text-sm sm:text-base leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
            Kami menginvestasikan sumber daya terbaik untuk menciptakan sarana pembelajaran modern yang aman, interaktif, dan sesuai dengan standar dunia kerja saat ini.
          </p>
        </div>

        {/* 2x2 Grid of Detailed Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {facilities.map((fac, i) => {
            const IconComponent = fac.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="rounded-3xl overflow-hidden transition-all duration-300 flex flex-col group"
                style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
              >
                {/* Visual Gradient Header */}
                <div
                  className="h-32 sm:h-36 w-full relative overflow-hidden flex items-end p-6"
                  style={{ background: 'linear-gradient(160deg, var(--theme-primary) 0%, color-mix(in srgb, var(--theme-primary) 60%, var(--theme-secondary) 100%)' }}
                >
                  {/* Decorative gold glow sphere */}
                  <div
                    className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full pointer-events-none"
                    style={{ background: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)', filter: 'blur(40px)' }}
                  />

                  {/* Grid pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: `radial-gradient(circle, var(--theme-secondary) 1px, transparent 1px)`,
                      backgroundSize: '24px 24px'
                    }}
                  />

                  {/* Floating Icon Box & Titles */}
                  <div className="flex items-center gap-3.5 z-10 relative">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{
                        backgroundColor: 'var(--theme-secondary)',
                        color: 'var(--theme-primary)',
                        border: '1px solid color-mix(in srgb, var(--theme-secondary) 30%, transparent)'
                      }}
                    >
                      <IconComponent className="size-5" />
                    </div>
                    <div className="text-left leading-none">
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--theme-secondary)' }}>{fac.subtitle}</span>
                      <h3 className="text-lg sm:text-xl font-extrabold font-headline leading-tight font-semibold" style={{ color: 'var(--theme-text-on-primary)' }}>{fac.title}</h3>
                    </div>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-8 flex-grow flex flex-col justify-between gap-6 text-left">
                  <p className="font-light text-sm sm:text-base leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                    {fac.desc}
                  </p>

                  {/* Bullet points of features */}
                  <div className="space-y-3 pt-6 flex-grow" style={{ borderTop: '1px solid var(--theme-border)' }}>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--theme-text)' }}>Fitur & Keunggulan Layanan:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {fac.features.map((feat, idx) => (
                        <div key={idx} className="flex gap-2 items-start text-xs sm:text-sm font-light leading-relaxed">
                          <CheckCircle2 className="size-4 shrink-0 mt-0.5" style={{ color: 'var(--theme-secondary)' }} />
                          <span style={{ color: 'var(--theme-text-muted)' }}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}