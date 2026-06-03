import React from 'react';
import { Scale, CalendarDays, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LegalInfo() {
  const items = [
    {
      title: 'Penyelenggara Resmi',
      value: 'Yayasan Adhi Guna Kencana',
      subtext: 'Ketua: H. Mulyana, SH., M.Pd., MH.Kes.',
      icon: Scale
    },
    {
      title: 'Sejarah & Transformasi',
      value: 'Berdiri Sejak 4 Juni 1999',
      subtext: 'Resmi Universitas pada 25 Maret 2019 (SK Kemenristekdikti)',
      icon: CalendarDays
    },
    {
      title: 'Akreditasi Institusi',
      value: 'Terakreditasi Baik Sekali',
      subtext: 'Mayoritas Prodi Unggul & Baik Sekali (BAN-PT & LAM-PTKes)',
      icon: ShieldCheck
    }
  ];

  return (
    <section
      className="border-y py-10 px-4 sm:px-6 lg:px-8 w-full relative z-20"
      style={{
        backgroundColor: 'var(--theme-bg)',
        borderColor: 'var(--theme-border)'
      }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-center"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          {items.map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-4 md:px-8 first:pl-0 last:pr-0 text-left transition-all duration-300 group"
              >
                {/* Gold Circle Icon wrapper */}
                <motion.div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                    color: 'var(--theme-secondary)',
                    border: '1px solid color-mix(in srgb, var(--theme-secondary) 10%, transparent)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <IconComponent className="size-5.5" />
                </motion.div>

                {/* Copywriting Details */}
                <div className="space-y-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider block leading-none"
                    style={{ color: 'var(--theme-secondary)' }}
                  >
                    {item.title}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold font-headline leading-tight" style={{ color: 'var(--theme-text)' }}>
                    {item.value}
                  </h3>
                  <p className="text-xs sm:text-xs leading-relaxed font-light font-headline" style={{ color: 'var(--theme-text-muted)' }}>
                    {item.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}