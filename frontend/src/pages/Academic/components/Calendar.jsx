import React from 'react';
import { CalendarDays, FileText, Gift } from 'lucide-react';

export default function Calendar() {
  const events = [
    {
      date: '02 September 2025',
      title: 'Awal Perkuliahan Semester Ganjil',
      desc: 'Kuliah perdana resmi bagi seluruh mahasiswa program Diploma, Sarjana, dan Profesi.',
      icon: CalendarDays,
      tag: 'Akademik',
      tagColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    },
    {
      date: '15 Oktober 2025',
      title: 'Batas Pengajuan Proposal Penelitian',
      desc: 'Batas akhir pengumpulan proposal riset bersama dosen-mahasiswa dan pengajuan dana hibah internal.',
      icon: FileText,
      tag: 'Penelitian',
      tagColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    },
    {
      date: '22 Desember 2025',
      title: 'Libur Natal & Tahun Baru',
      desc: 'Masa libur semester ganjil. Layanan perpustakaan dan laboratorium mandiri tetap beroperasi terbatas.',
      icon: Gift,
      tag: 'Hari Libur',
      tagColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
    }
  ];

  return (
    <section
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: 'var(--theme-bg)' }}
    >
      {/* Glow effect */}
      <div
        className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)', filter: 'blur(100px)' }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
            Kalender Kegiatan
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline" style={{ color: 'var(--theme-text)' }}>
            Kalender Akademik 2025/2026
          </h2>
          <p className="font-light text-sm sm:text-base leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
            Ikuti berbagai tanggal penting perkuliahan, riset, dan agenda akademik demi tuntaskan kelancaran studi.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Center Line */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 hidden md:block"
            style={{ backgroundColor: 'var(--theme-border)' }}
          />

          <div className="space-y-12">
            {events.map((evt, i) => {
              const IconComponent = evt.icon;
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`flex flex-col md:flex-row items-center justify-between w-full relative ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Left content block (or right for odd elements) */}
                  <div className="w-full md:w-5/12 text-left md:text-right pr-0 md:pr-12 md:pl-0 pl-0 md:block hidden">
                    {isEven && (
                      <div className="space-y-2">
                        <span className="font-bold text-sm tracking-wide block" style={{ color: 'var(--theme-secondary)' }}>{evt.date}</span>
                        <h4 className="font-headline font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{evt.title}</h4>
                        <p className="text-xs sm:text-sm font-light leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>{evt.desc}</p>
                      </div>
                    )}
                    {!isEven && (
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${evt.tagColor}`}>
                        {evt.tag}
                      </span>
                    )}
                  </div>

                  {/* Icon Circle */}
                  <div
                    className="z-10 w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-md shrink-0 hover:scale-105 transition-transform duration-300"
                    style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-secondary)', color: 'var(--theme-secondary)' }}
                  >
                    <IconComponent className="size-5" />
                  </div>

                  {/* Right content block (or left for odd elements) */}
                  <div className="w-full md:w-5/12 text-left pl-0 md:pl-12 md:pr-0 pl-0 md:block hidden">
                    {!isEven && (
                      <div className="space-y-2">
                        <span className="font-bold text-sm tracking-wide block" style={{ color: 'var(--theme-secondary)' }}>{evt.date}</span>
                        <h4 className="font-headline font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{evt.title}</h4>
                        <p className="text-xs sm:text-sm font-light leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>{evt.desc}</p>
                      </div>
                    )}
                    {isEven && (
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${evt.tagColor}`}>
                        {evt.tag}
                      </span>
                    )}
                  </div>

                  {/* Mobile Layout Fallback */}
                  <div
                    className="w-full md:hidden pl-4 mt-4 ml-6 space-y-2 py-2 text-left"
                    style={{ borderLeft: '2px solid var(--theme-secondary)' }}
                  >
                    <span className="font-bold text-xs tracking-wide block" style={{ color: 'var(--theme-secondary)' }}>{evt.date}</span>
                    <h4 className="font-headline font-bold text-base" style={{ color: 'var(--theme-text)' }}>{evt.title}</h4>
                    <p className="text-xs font-light leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>{evt.desc}</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${evt.tagColor} mt-2`}>
                      {evt.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}