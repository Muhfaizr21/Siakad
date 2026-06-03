import React from 'react';
import { Stethoscope, Pill, HeartPulse, BrainCircuit } from 'lucide-react';

export default function FacultySection() {
  const faculties = [
    {
      name: 'Fakultas Keperawatan',
      desc: 'Mencetak perawat profesional berdaya saing global dengan dukungan laboratorium keperawatan terpadu dan jaringan RS mitra luas.',
      icon: Stethoscope,
      tags: ['D3 Keperawatan', 'S1 Keperawatan', 'Profesi Ners'],
      color: 'bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300 hover:shadow-blue-500/5',
      iconBg: 'bg-blue-500/10 text-blue-600'
    },
    {
      name: 'Fakultas Farmasi',
      desc: 'Menghasilkan sarjana farmasi dan apoteker terampil di bidang kefarmasian klinis, produksi obat, serta pengawasan mutu makanan.',
      icon: Pill,
      tags: ['D3 Farmasi', 'S1 Farmasi', 'Profesi Apoteker'],
      color: 'bg-amber-50 text-amber-700 border-amber-100 hover:border-amber-300 hover:shadow-amber-500/5',
      iconBg: 'bg-amber-500/10 text-[var(--theme-secondary)]'
    },
    {
      name: 'Fakultas Ilmu Kesehatan',
      desc: 'Pendidikan multidisiplin ilmu kesehatan mencakup kebidanan, fisioterapi, kesehatan keselamatan kerja, dan administrasi rumah sakit.',
      icon: HeartPulse,
      tags: ['D3 Kebidanan', 'S1 Kebidanan', 'D3 Fisioterapi', 'S1 Kesmas'],
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-500/5',
      iconBg: 'bg-emerald-500/10 text-emerald-600'
    },
    {
      name: 'Fakultas Ilmu Sosial',
      desc: 'Mengembangkan kompetensi bidang komunikasi publik, kepemimpinan massa, manajemen SDM, dan psikologi klinis/industri.',
      icon: BrainCircuit,
      tags: ['S1 Ilmu Komunikasi', 'S1 Psikologi'],
      color: 'bg-purple-50 text-purple-700 border-purple-100 hover:border-purple-300 hover:shadow-purple-500/5',
      iconBg: 'bg-purple-500/10 text-purple-600'
    }
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
            Fakultas & Program Studi
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline" style={{ color: 'var(--theme-text)' }}>
            Mulai Langkah Karir Impianmu Bersama Kami
          </h2>
          <p className="font-light text-sm sm:text-base leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
            Pilihlah fakultas terbaik yang sesuai dengan minat dan potensi karir masa depanmu. Seluruh program studi didukung dengan kurikulum berbasis kompetensi nasional.
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faculties.map((fac, i) => (
            <div
              key={i}
              className="border rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between group"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div className="space-y-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${fac.iconBg}`}>
                  <fac.icon className="size-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-extrabold font-headline" style={{ color: 'var(--theme-text)' }}>
                    {fac.name}
                  </h3>
                  <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                    {fac.desc}
                  </p>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="mt-8">
                <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--theme-text-muted)' }}>PROGRAM PILIHAN:</div>
                <div className="flex flex-wrap gap-2">
                  {fac.tags.map((tag, j) => (
                    <span
                      key={j}
                      className="border shadow-sm text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--theme-surface)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text-muted)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
