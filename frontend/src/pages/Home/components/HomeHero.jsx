import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, GraduationCap, Building2, MapPin, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomeHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  const statItems = [
    { num: '23', label: 'Program Studi', icon: GraduationCap },
    { num: '4', label: 'Fakultas Pilihan', icon: Building2 },
    { num: '8', label: 'Kota Kampus', icon: MapPin },
    { num: '98%', label: 'Kelulusan UKNI', icon: Award }
  ];

  return (
    <section
      className="relative min-h-[85vh] flex items-center overflow-hidden py-24 sm:py-32 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'var(--theme-primary)' }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, var(--theme-primary) 0%, color-mix(in srgb, var(--theme-primary) 60%, var(--theme-secondary)) 100%)`
          }}
        />

        {/* Glow effect */}
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, var(--theme-secondary) 0%, transparent 70%)`,
            opacity: 0.3
          }}
        />

        {/* Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, var(--theme-text-on-primary) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mx-auto"
            style={{
              backgroundColor: 'var(--theme-surface)',
              color: 'var(--theme-primary)'
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--theme-secondary)' }}
            />
            Perguruan Tinggi Unggulan
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-headline leading-[1.1] tracking-tight"
            style={{ color: 'var(--theme-text-on-primary)' }}
          >
            Membentuk{' '}
            <span style={{ color: 'var(--theme-secondary)' }}>
              Generasi Profesional, Mandiri,
            </span>{' '}
            dan Unggul Masa Depan
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed"
            style={{ color: 'var(--theme-muted-on-primary)' }}
          >
            Universitas Bhakti Kencana (BKU) menyelenggarakan pendidikan berkualitas dunia dengan 4 fakultas unggulan di 8 lokasi strategis Indonesia. Terakreditasi BAN-PT & LAM-PTKes.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-4 pt-2"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold shadow-lg transition-all duration-300 font-headline hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--theme-secondary)',
                color: 'var(--theme-h1)'
              }}
            >
              Daftar Sekarang
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold border-2 transition-all duration-300 font-headline hover:scale-105 active:scale-95"
              style={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'var(--theme-text-on-primary)'
              }}
            >
              Kenali BKU
              <ChevronRight className="size-4" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 mt-16"
          style={{ borderTop: '1px solid var(--theme-muted-on-primary)' }}
        >
          {statItems.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--theme-surface) 10%, transparent)',
                border: '1px solid var(--theme-muted-on-primary)'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  color: 'var(--theme-primary)'
                }}
              >
                <stat.icon className="size-5" />
              </div>
              <div className="text-left">
                <div
                  className="text-2xl sm:text-3xl font-extrabold font-headline leading-none"
                  style={{ color: 'var(--theme-text-on-primary)' }}
                >
                  {stat.num}
                </div>
                <div
                  className="text-[10px] sm:text-xs font-medium tracking-wide mt-1"
                  style={{ color: 'var(--theme-muted-on-primary)' }}
                >
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}