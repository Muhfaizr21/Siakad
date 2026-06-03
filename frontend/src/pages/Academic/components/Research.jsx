import React from 'react';
import { Microscope, Globe, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Research() {
  return (
    <section
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden relative"
      style={{ backgroundColor: 'var(--theme-bg)' }}
    >
      {/* Glowing accents */}
      <div
        className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)', filter: 'blur(80px)' }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Left: Decorative Image Grid */}
          <div className="lg:col-span-6 relative">
            <div
              className="absolute top-[-20px] left-[-20px] w-full max-w-[400px] aspect-[4/3] rounded-3xl transform rotate-2 z-0"
              style={{ background: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)' }}
            />
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border shadow-md" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                <img
                  alt="Laboratorium Riset Farmasi"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  src="/images/Kampus/bandung.jpg"
                />
              </div>
              <div
                className="rounded-2xl overflow-hidden border shadow-md mt-8"
                style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
              >
                <img
                  alt="Riset Mahasiswa Terpadu"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  src="/images/Kampus/jakarta.jpg"
                />
              </div>
            </div>
          </div>

          {/* Right: Copy & Points */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
                Keunggulan Riset
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight font-headline" style={{ color: 'var(--theme-text)' }}>
                Pusat Inovasi & Riset Berkualitas Internasional
              </h2>
              <p className="font-light leading-relaxed text-sm sm:text-base" style={{ color: 'var(--theme-text-muted)' }}>
                Universitas Bhakti Kencana (UBK) berkomitmen kuat mengembangkan penelitian terapan tingkat tinggi di bidang kefarmasian, ilmu keperawatan modern, kebidanan, kesehatan masyarakat, dan sains sosial digital.
              </p>
            </div>

            {/* List Points */}
            <div className="space-y-6 pt-4" style={{ borderTop: '1px solid var(--theme-border)' }}>
              <div className="flex gap-4 items-start">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                    color: 'var(--theme-secondary)',
                    border: '1px solid color-mix(in srgb, var(--theme-secondary) 10%, transparent)'
                  }}
                >
                  <Microscope className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-headline" style={{ color: 'var(--theme-text)' }}>
                    Laboratorium Riset Terintegrasi
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed font-light mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                    Dilengkapi instrumen analisa modern, ruang steril sediaan obat, dan fasilitas uji klinis canggih demi mendukung standardisasi karya penelitian nasional.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                    color: 'var(--theme-secondary)',
                    border: '1px solid color-mix(in srgb, var(--theme-secondary) 10%, transparent)'
                  }}
                >
                  <Globe className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-headline" style={{ color: 'var(--theme-text)' }}>
                    Publikasi Jurnal Terindeks SINTA & Scopus
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed font-light mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                    Mendorong civitas akademika berkontribusi aktif dalam jurnal nasional terakreditasi SINTA serta publikasi ilmiah internasional bereputasi secara periodik.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-md transition-all duration-300 text-xs sm:text-sm"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  color: 'var(--theme-secondary)'
                }}
              >
                Unduh Katalog Riset <ExternalLink className="size-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}