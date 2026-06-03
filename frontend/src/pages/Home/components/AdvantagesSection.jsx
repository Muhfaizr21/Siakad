import React from 'react';
import { Award, FlaskConical, Briefcase, HelpCircle } from 'lucide-react';

export default function AdvantagesSection() {
  const advantages = [
    {
      num: '98%',
      title: 'Tingkat Kelulusan UKNI',
      desc: 'Mahasiswa Profesi Ners BKU konsisten mencetak tingkat kelulusan di atas rata-rata nasional pada Uji Kompetensi Ners Indonesia.',
      icon: Award
    },
    {
      num: '20+',
      title: 'Lab Klinik & Farmasi Modern',
      desc: 'Dilengkapi fasilitas laboratorium steril, teknologi sediaan obat, anatomi, simulasi keperawatan gawat darurat terlengkap.',
      icon: FlaskConical
    },
    {
      num: '50+',
      title: 'Mitra Institusi Kesehatan',
      desc: 'Bekerja sama erat dengan RS pemerintah/swasta, industri farmasi nasional, Puskesmas, Klinik Pratama untuk lahan kerja praktik.',
      icon: Briefcase
    },
    {
      num: '1K+',
      title: 'Penerima Beasiswa Aktif',
      desc: 'Program beasiswa berkesinambungan mencakup KIP-Kuliah, beasiswa Yayasan AGK, beasiswa Prestasi Akademik & Olahraga.',
      icon: HelpCircle
    }
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: 'var(--theme-primary)' }}>
      {/* Visual glowing blobs */}
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] rounded-full pointer-events-none" style={{ background: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)', filter: 'blur(100px)' }} />
      <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full pointer-events-none" style={{ background: 'color-mix(in srgb, var(--theme-primary) 50%, transparent)', filter: 'blur(120px)' }} />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
            Keunggulan Kampus
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline" style={{ color: 'var(--theme-text-on-primary)' }}>
            Mengapa Memilih Universitas Bhakti Kencana?
          </h2>
          <p className="font-light text-sm sm:text-base leading-relaxed" style={{ color: 'var(--theme-muted-on-primary)' }}>
            Kami berkomitmen memberikan ekosistem belajar mengajar terbaik dengan standar mutu internasional demi menjamin kesuksesan karir lulusan.
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((adv, i) => (
            <div
              key={i}
              className="rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 group"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--theme-surface) 5%, transparent)',
                border: '1px solid color-mix(in srgb, var(--theme-text-on-primary) 10%, transparent)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)';
                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-secondary) 30%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-surface) 5%, transparent)';
                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-text-on-primary) 10%, transparent)';
              }}
            >
              <div className="space-y-6">
                {/* Num and Icon */}
                <div className="flex justify-between items-start">
                  <div className="text-3xl sm:text-4xl font-black font-headline leading-none" style={{ color: 'var(--theme-secondary)' }}>
                    {adv.num}
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--theme-surface) 5%, transparent)',
                      color: 'var(--theme-muted-on-primary)',
                      border: '1px solid color-mix(in srgb, var(--theme-text-on-primary) 5%, transparent)'
                    }}
                  >
                    <adv.icon className="size-4" />
                  </div>
                </div>

                {/* Title & Desc */}
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-bold font-headline" style={{ color: 'var(--theme-text-on-primary)' }}>
                    {adv.title}
                  </h3>
                  <p className="text-xs leading-relaxed font-light" style={{ color: 'var(--theme-muted-on-primary)' }}>
                    {adv.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
