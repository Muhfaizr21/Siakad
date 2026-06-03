import React from 'react';
import { UserCheck, BookOpen, Coins, Users, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leadership() {
  const leaders = [
    {
      name: 'Dr. Entris Sutrisno, MH.Kes., Apt.',
      role: 'Rektor',
      division: 'Pimpinan Utama Universitas',
      icon: UserCheck,
      desc: 'Memimpin penyelenggaraan pendidikan, arah strategis riset, serta tata pamong universitas demi mewujudkan visi institusi yang mandiri, unggul, dan berdaya saing global.',
      features: ['Arah Kebijakan Strategis', 'Tata Pamong & Akuntabilitas', 'Hubungan Internasional']
    },
    {
      name: 'Dr. Yani Mulyani, M.Si., Apt.',
      role: 'Wakil Rector I',
      division: 'Bidang Akademik',
      icon: BookOpen,
      desc: 'Mengawal pengelolaan sistem kurikulum MBKM, penjaminan mutu perkuliahan tingkat prodi/fakultas, serta koordinasi dewan dosen akademik di seluruh kampus PSDKU.',
      features: ['Kurikulum MBKM & Evaluasi', 'Penjaminan Mutu Akademik', 'Standardisasi Akreditasi']
    },
    {
      name: 'Rizki Muliani, S.Kep., Ners., M.M.',
      role: 'Wakil Rector II',
      division: 'Bidang Keuangan & SDM',
      icon: Coins,
      desc: 'Mengelola stabilitas anggaran, tata kelola keuangan yayasan, pembinaan kesejahteraan/karier SDM dosen, serta optimalisasi prasarana sarana fisik penunjang.',
      features: ['Tata Kelola Anggaran & Keuangan', 'Pengembangan Karier SDM', 'Sarana Prasarana Fisik']
    },
    {
      name: 'Sri Mulyati Rahayu, S.Kp., M.Kes.',
      role: 'Wakil Rector III',
      division: 'Bidang Kemahasiswaan & Alumni',
      icon: Users,
      desc: 'Mengoordinasikan pembinaan Unit Kegiatan Mahasiswa (UKM), program kesejahteraan/beasiswa, jejaring ikatan alumni, serta kompetisi prestasi non-akademik.',
      features: ['Pembinaan Organisasi & UKM', 'Program Beasiswa & Layanan', 'Jejaring & Penyaluran Alumni']
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
      {/* Decorative Glow elements */}
      <div
        className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)', filter: 'blur(80px)' }}
      />
      <div
        className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)', filter: 'blur(100px)' }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">

        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
            Jajaran Kepemimpinan
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight font-headline" style={{ color: 'var(--theme-text)' }}>
            Struktur Pimpinan Rektorat
          </h2>
          <p className="font-light text-sm sm:text-base leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
            Universitas Bhakti Kencana dipimpin oleh jajaran akademisi profesional yang berdedikasi tinggi mengawal keunggulan kurikulum, tata pamong institusi yang kredibel, serta pembinaan prestasi kemahasiswaan.
          </p>
        </div>

        {/* Leadership Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left"
        >
          {leaders.map((ldr, i) => {
            const IconComponent = ldr.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)'
                }}
              >
                {/* Decorative gold spotlight inside card */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)', filter: 'blur(40px)', transform: 'scale(1)', transition: 'transform 0.5s' }}
                />

                <div className="space-y-6 relative z-10">
                  {/* Floating Icon Box */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                      color: 'var(--theme-secondary)',
                      border: '1px solid color-mix(in srgb, var(--theme-secondary) 20%, transparent)'
                    }}
                  >
                    <IconComponent className="size-5" />
                  </div>

                  {/* Header: Title & Division */}
                  <div className="space-y-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--theme-secondary)' }}>
                        {ldr.role} — {ldr.division}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold font-headline leading-tight" style={{ color: 'var(--theme-text)' }}>
                        {ldr.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-light text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                    {ldr.desc}
                  </p>

                  {/* Key focus list */}
                  <div className="space-y-2.5 pt-4" style={{ borderTop: '1px solid var(--theme-border)' }}>
                    {ldr.features.map((feat, idx) => (
                      <div key={idx} className="flex gap-2 items-center text-[11px] font-light">
                        <CheckCircle2 className="size-3.5 shrink-0" style={{ color: 'var(--theme-secondary)' }} />
                        <span style={{ color: 'var(--theme-text-muted)' }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer brand info */}
                <div
                  className="pt-6 mt-6 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider z-10 relative"
                  style={{ color: 'var(--theme-text-muted)', borderTop: '1px solid var(--theme-border)' }}
                >
                  <span>Rektorat UBK</span>
                  <span>Masa Bakti</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}