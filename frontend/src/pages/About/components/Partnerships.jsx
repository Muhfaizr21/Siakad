import React from 'react';
import { Hospital, Briefcase, GraduationCap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Partnerships() {
  const sectors = [
    {
      title: 'Sektor Medis & Pelayanan',
      subtitle: 'Lahan Praktik & Klinik Medis',
      icon: Hospital,
      desc: 'Kemitraan erat dengan berbagai RSUD pemerintah, Rumah Sakit Swasta terkemuka, dan Puskesmas nasional sebagai lahan praktik klinik profesi Apoteker, Ners, serta Kebidanan.',
      features: [
        'Jejaring RSUD & Rumah Sakit Swasta',
        'Puskesmas & Klinik Kesehatan Pendidikan',
        'Praktik Kerja Lapangan Profesi Terbimbing'
      ]
    },
    {
      title: 'Sektor Industri & Retail',
      subtitle: 'Kesiapan Kerja & Magang',
      icon: Briefcase,
      desc: 'Kerja sama PKL/magang terintegrasi di perusahaan manufaktur sediaan obat nasional serta jaringan apotek terkemuka guna mencetak lulusan siap diserap industri.',
      features: [
        'Industri Manufaktur Produksi Obat Nasional',
        'Jaringan Apotek & Retail Farmasi Terkemuka',
        'Bimbingan Karir & Pelatihan Kesiapan Kerja'
      ]
    },
    {
      title: 'Sektor Akademis & Riset',
      subtitle: 'MBKM & Kolaborasi Keilmuan',
      icon: GraduationCap,
      desc: 'Kolaborasi lintas perguruan tinggi dalam program pertukaran mahasiswa MBKM, studi banding kurikulum (inovasi Farmasi Veteriner), serta riset keilmuan dosen-mahasiswa.',
      features: [
        'Pertukaran Mahasiswa MBKM Lintas Kampus',
        'Studi Banding & Inovasi Kurikulum Terpadu',
        'Kolaborasi Publikasi Jurnal & Riset Bersama'
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
      {/* Decorative Glow sphere */}
      <div
        className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)', filter: 'blur(100px)' }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">

        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
            Jejaring Kolaborasi
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight font-headline" style={{ color: 'var(--theme-text)' }}>
            Aliansi Strategis & Kemitraan
          </h2>
          <p className="font-light text-sm sm:text-base leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
            Universitas Bhakti Kencana berkomitmen aktif menjalin kolaborasi dengan ratusan institusi pelayanan kesehatan, industri farmasi nasional, serta perguruan tinggi global demi memperluas riset dan jaminan masa depan karier lulusan.
          </p>
        </div>

        {/* Sectors Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left"
        >
          {sectors.map((sec, i) => {
            const IconComponent = sec.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)'
                }}
              >
                {/* Visual spot inside card */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)', filter: 'blur(40px)' }}
                />

                <div className="space-y-6 relative z-10">
                  {/* Icon Box */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                      color: 'var(--theme-secondary)',
                      border: '1px solid color-mix(in srgb, var(--theme-secondary) 20%, transparent)'
                    }}
                  >
                    <IconComponent className="size-5" />
                  </div>

                  {/* Header Titles */}
                  <div className="space-y-1">
                    <span className="font-bold text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--theme-secondary)' }}>
                      {sec.subtitle}
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold font-headline leading-tight" style={{ color: 'var(--theme-text)' }}>
                      {sec.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="font-light text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                    {sec.desc}
                  </p>

                  {/* Key Features List */}
                  <div className="space-y-3 pt-6" style={{ borderTop: '1px solid var(--theme-border)' }}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--theme-text)' }}>Cakupan Kemitraan:</h4>
                    {sec.features.map((feat, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start text-xs font-light leading-relaxed">
                        <CheckCircle2 className="size-4 shrink-0 mt-0.5" style={{ color: 'var(--theme-secondary)' }} />
                        <span style={{ color: 'var(--theme-text-muted)' }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Brand Info */}
                <div
                  className="pt-6 mt-6 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider z-10 relative"
                  style={{ color: 'var(--theme-text-muted)', borderTop: '1px solid var(--theme-border)' }}
                >
                  <span>Jejaring UBK</span>
                  <span>Kemitraan Aktif</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}