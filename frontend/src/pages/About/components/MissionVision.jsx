import React from 'react';
import { Eye, Target, Award } from 'lucide-react';

export default function MissionVision() {
  const missions = [
    'Menyelenggarakan pendidikan yang unggul sesuai kebutuhan untuk menghasilkan lulusan berdaya saing.',
    'Menyelenggarakan penelitian dan pengabdian kepada masyarakat yang inovatif untuk menampung kesehatan',
    'Menerapkan tata kelola mandiri sesuai standar mutu, serta mengembangkan kerjasama yang berkelanjutan dengan mitra di dalam dan luar negeri'
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
      {/* Decorative details */}
      <div
        className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)', filter: 'blur(80px)' }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">

          {/* Left Card: Vision */}
          <div
            className="lg:col-span-5 p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--theme-primary), color-mix(in srgb, var(--theme-primary) 50%, var(--theme-secondary)))',
              color: 'var(--theme-text-on-primary)',
              border: '1px solid color-mix(in srgb, var(--theme-text-on-primary) 5%, transparent)'
            }}
          >
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)', filter: 'blur(40px)' }}
            />

            <div className="space-y-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--theme-surface) 10%, transparent)',
                  color: 'var(--theme-secondary)',
                  border: '1px solid color-mix(in srgb, var(--theme-surface) 10%, transparent)'
                }}
              >
                <Eye className="size-6" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight font-headline" style={{ color: 'var(--theme-secondary)' }}>
                  Visi
                </h3>
                <p className="text-sm sm:text-base font-light leading-relaxed" style={{ color: 'var(--theme-text-on-primary)' }}>
                  "Menjadi perguruan tinggi yang mandiri, unggul, dan berdaya saing dalam bidang kesehatan untuk meningkatkan kualitas hidup bangsa Indonesia dan dunia"
                </p>
              </div>
            </div>

            <div
              className="pt-6 mt-8 text-[10px] tracking-widest font-bold uppercase"
              style={{ color: 'var(--theme-secondary)', borderTop: '1px solid color-mix(in srgb, var(--theme-surface) 10%, transparent)' }}
            >
              Bhakti Kencana University
            </div>
          </div>

          {/* Right Card: Mission */}
          <div
            className="lg:col-span-7 p-8 sm:p-10 rounded-3xl shadow-md flex flex-col justify-between text-left"
            style={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)'
            }}
          >
            <div className="space-y-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                  color: 'var(--theme-secondary)',
                  border: '1px solid color-mix(in srgb, var(--theme-secondary) 10%, transparent)'
                }}
              >
                <Target className="size-6" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-extrabold font-headline" style={{ color: 'var(--theme-text)' }}>
                  Misi
                </h3>
                <ul className="space-y-4">
                  {missions.map((mission, index) => (
                    <li key={index} className="flex gap-4 items-start">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm"
                        style={{
                          backgroundColor: 'var(--theme-secondary)',
                          color: 'var(--theme-primary)'
                        }}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs sm:text-sm font-light leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                        {mission}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Kebijakan Mutu Full-Width Card */}
        <div
          className="mt-16 p-8 sm:p-12 rounded-3xl relative overflow-hidden shadow-lg"
          style={{
            background: 'linear-gradient(135deg, var(--theme-primary), color-mix(in srgb, var(--theme-primary) 50%, var(--theme-secondary)))',
            color: 'var(--theme-text-on-primary)',
            border: '1px solid color-mix(in srgb, var(--theme-text-on-primary) 5%, transparent)'
          }}
        >
          {/* Decorative gold spot inside */}
          <div
            className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)', filter: 'blur(40px)' }}
          />

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--theme-secondary) 20%, transparent)',
                color: 'var(--theme-secondary)'
              }}
            >
              <Award className="size-7" />
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
                Kualitas & Mutu Akademik
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight font-headline" style={{ color: 'var(--theme-text-on-primary)' }}>
                Kebijakan Mutu Universitas
              </h3>
              <p className="text-sm sm:text-base font-light leading-relaxed italic max-w-4xl" style={{ color: 'var(--theme-muted-on-primary)' }}>
                "Universitas Bhakti Kencana berkomitmen untuk konsisten terhadap mutu dalam melaksanakan proses Tridharma Pendidikan tinggi pada bidang studi terkait yang dapat diterima oleh stakeholders sesuai peraturan dan persyaratan yang berlaku, dengan menjunjung tinggi hak kekayaan intelektual dan tanggung jawab sosial, mengikuti perkembangan ilmu pengetahuan dan teknologi serta melakukan peningkatan berkelanjutan."
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}