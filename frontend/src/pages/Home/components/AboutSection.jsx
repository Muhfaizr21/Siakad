import React from 'react';
import { Award, Compass, Search, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AboutSection() {
  const points = [
    {
      title: 'Akreditasi Baik Sekali & Unggul',
      desc: 'Terakreditasi Institusi predikat Baik Sekali oleh BAN-PT, serta mayoritas program studi terakreditasi Unggul & Baik Sekali oleh BAN-PT & LAM-PTKes.',
      icon: Award
    },
    {
      title: 'Sertifikasi ISO 21001:2018',
      desc: 'Sistem manajemen operasional tata pamong dan penjaminan mutu organisasi pendidikan tinggi tersertifikasi standar internasional.',
      icon: Compass
    },
    {
      title: 'LPPM & Publikasi Ilmiah SINTA',
      desc: 'Aktif menyelenggarakan penelitian terapan yang inovatif, pengabdian masyarakat (KKN Tematik), serta publikasi berkala terindeks SINTA.',
      icon: Search
    },
    {
      title: 'Kerjasama Strategis & MBKM',
      desc: 'Pertukaran mahasiswa lintas kampus, magang industri farmasi/klinis nasional, serta riset bersama (inovasi Farmasi Veteriner).',
      icon: GraduationCap
    }
  ];

  return (
    <section
      className="py-24 sm:py-32 overflow-hidden relative"
      style={{ backgroundColor: 'var(--theme-bg)' }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'var(--theme-secondary)', opacity: 0.1 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-16">

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span
              className="text-xs font-bold uppercase tracking-widest font-headline block"
              style={{ color: 'var(--theme-secondary)' }}
            >
              Tentang Kami
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold leading-tight font-headline"
              style={{ color: 'var(--theme-h2)' }}
            >
              Dedikasi Membangun Pendidikan Berkelanjutan
            </h2>
            <p
              className="text-base leading-relaxed max-w-2xl mx-auto"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              Cikal bakal Universitas Bhakti Kencana telah berdiri sejak 4 Juni 1999 di bawah Yayasan Adhi Guna Kencana. Perguruan tinggi ini kemudian resmi bertransformasi dan menyandang status Universitas pada tanggal 25 Maret 2019.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md transition-all duration-300 font-headline text-sm hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-surface)'
              }}
            >
              Selengkapnya Tentang Kami <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Cards */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12"
            style={{ borderTop: '1px solid var(--theme-border)' }}
          >
            {points.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-4 text-left p-6 rounded-2xl transition-all duration-300 hover:shadow-lg group"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)'
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: 'var(--theme-secondary)',
                    color: 'var(--theme-primary)'
                  }}
                >
                  <point.icon className="size-5" />
                </div>
                <div className="space-y-2">
                  <h4
                    className="text-base font-bold font-headline"
                    style={{ color: 'var(--theme-text)' }}
                  >
                    {point.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    {point.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}