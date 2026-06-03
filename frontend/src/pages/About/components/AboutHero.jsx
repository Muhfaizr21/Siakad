import React from 'react';
import { motion } from 'framer-motion';

export default function AboutHero() {
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

  return (
    <section
      className="relative min-h-[50vh] flex items-center overflow-hidden py-24 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-on-primary)' }}
    >
      {/* Decorative Overlays */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, var(--theme-primary) 0%, color-mix(in srgb, var(--theme-primary) 70%, var(--theme-secondary) 30%) 100%)' }}
        />

        {/* Glow accent */}
        <div
          className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'color-mix(in srgb, var(--theme-secondary) 8%, transparent)', filter: 'blur(100px)' }}
        />
        <div
          className="absolute bottom-[10%] right-[10%] w-[250px] h-[250px] rounded-full pointer-events-none"
          style={{ background: 'color-mix(in srgb, var(--theme-primary) 40%, var(--theme-secondary) 60%)', filter: 'blur(80px)', opacity: 0.5 }}
        />

        {/* Fine grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, var(--theme-secondary) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto space-y-6"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mx-auto"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--theme-secondary) 30%, transparent)',
              color: 'var(--theme-secondary)'
            }}
          >
            Tentang Bhakti Kencana
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-headline leading-[1.1] tracking-tight"
            style={{ color: 'var(--theme-text-on-primary)' }}
          >
            Dedikasi Membangun <br />
            <span style={{ color: 'var(--theme-secondary)' }}>Pendidikan Berkelanjutan</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--theme-muted-on-primary)' }}
          >
            Cikal bakal Universitas Bhakti Kencana telah berdiri sejak 4 Juni 1999 di bawah Yayasan Adhi Guna Kencana. perguruan tinggi ini kemudian resmi bertransformasi dan menyandang status Universitas pada tanggal 25 maret 2019.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}