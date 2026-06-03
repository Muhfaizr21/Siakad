import React from 'react';
import { MapPin } from 'lucide-react';

export default function Values() {
  const networks = [
    { name: 'Kampus Bandung', desc: 'Pusat Program Wilayah Daerah Bandung', image: '/images/Kampus/bandung.jpg' },
    { name: 'Kampus Jakarta', desc: 'Pusat Program Wilayah Daerah Jakarta', image: '/images/Kampus/jakarta.jpg' },
    { name: 'Kampus Serang', desc: 'Pusat Program Wilayah Daerah Serang', image: '/images/Kampus/serang.jpg' },
    { name: 'Kampus Subang', desc: 'Pusat Program Wilayah Daerah Subang', image: '/images/Kampus/Subang.jpg' },
    { name: 'Kampus Garut', desc: 'Pusat Program Wilayah Daerah Garut', image: '/images/Kampus/Garut.jpg' },
    { name: 'Kampus Tasikmalaya', desc: 'Pusat Program Wilayah Daerah Tasikmalaya', image: '/images/Kampus/tasik.jpg' },
    { name: 'Kampus Kendal', desc: 'Pusat Program Wilayah Daerah Kendal', image: '/images/Kampus/kendal.jpg' },
    { name: 'Kampus Mataram', desc: 'Pusat Program Wilayah Daerah Mataram', image: '/images/Kampus/mataram.jpg' }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline" style={{ color: 'var(--theme-text)' }}>
            Kampus Universitas Bhakti Kencana
          </h2>
          <p className="font-light text-sm sm:text-base leading-relaxed italic max-w-2xl mx-auto" style={{ color: 'var(--theme-text-muted)' }}>
            "Menjadi perguruan tinggi Mandiri, Unggul, dan berdaya saing untuk meningkatkan kualitas hidup bangsa Indonesia"
          </p>
        </div>

        {/* Grid Location Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {networks.map((net, i) => (
            <div
              key={i}
              className="rounded-3xl overflow-hidden transition-all duration-300 flex flex-col relative group"
              style={{
                backgroundColor: 'var(--theme-surface)',
                border: '1px solid var(--theme-border)'
              }}
            >
              {/* Image Header with scale effects */}
              <div className="aspect-[3/4] w-full overflow-hidden relative">
                <img
                  src={net.image}
                  alt={net.name}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Card Body */}
              <div className="p-6 flex-grow flex flex-col gap-4 justify-between items-start text-left">
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-extrabold font-headline leading-tight" style={{ color: 'var(--theme-text)' }}>
                    {net.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs leading-relaxed font-light font-headline" style={{ color: 'var(--theme-text-muted)' }}>
                    {net.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 font-bold tracking-wide uppercase select-none mt-2" style={{ color: 'var(--theme-secondary)' }}>
                  <MapPin className="size-3.5" />
                  <span className="text-[10px]">Lihat Lokasi</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}