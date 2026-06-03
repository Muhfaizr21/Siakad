import React, { useState } from 'react';
import { Pill, HeartPulse, Activity, Users, Search, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const dataAkademik = [
  {
    id: "farmasi",
    fakultas: "Fakultas Farmasi",
    deskripsi: "Pusat inovasi kefarmasian dan kesehatan. Kami menyiapkan tenaga ahli di bidang farmasi klinis, produksi obat, hingga pengawasan mutu yang siap diserap langsung oleh industri.",
    icon: Pill,
    color: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-600",
      glow: "bg-amber-500/5"
    },
    programStudi: [
      "D3 Farmasi",
      "S1 Farmasi",
      "Profesi Apoteker",
      "S2 Farmasi"
    ]
  },
  {
    id: "ilmu-kesehatan",
    fakultas: "Fakultas Ilmu Kesehatan",
    deskripsi: "Membangun ekosistem kesehatan yang holistik. Pelajari disiplin ilmu esensial untuk menjawab tantangan dunia medis, pelayanan masyarakat, dan keselamatan kerja modern.",
    icon: Activity,
    color: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-600",
      glow: "bg-emerald-500/5"
    },
    programStudi: [
      "D3 Kebidanan",
      "D4 Anestesiologi",
      "S1 & Profesi Kebidanan",
      "S1 Kesehatan Masyarakat"
    ]
  },
  {
    id: "keperawatan",
    fakultas: "Fakultas Keperawatan",
    deskripsi: "Cetak karir sebagai perawat profesional dengan standar internasional. Dapatkan pengalaman komprehensif melalui fasilitas laboratorium terpadu dan jaringan kemitraan rumah sakit yang luas.",
    icon: HeartPulse,
    color: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      text: "text-rose-600",
      glow: "bg-rose-500/5"
    },
    programStudi: [
      "D3 Keperawatan",
      "S1 Keperawatan",
      "Profesi Ners"
    ]
  },
  {
    id: "sosial",
    fakultas: "Fakultas Sosial",
    deskripsi: "Asah potensimu di bidang humaniora. Fokus pada pengembangan kemampuan komunikasi publik, kepemimpinan, dan analisis perilaku psikologi untuk menghadapi era digital.",
    icon: Users,
    color: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      text: "text-indigo-600",
      glow: "bg-indigo-500/5"
    },
    programStudi: [
      "S1 Ilmu Komunikasi",
      "S1 Psikologi"
    ]
  }
];

export default function Faculties() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('all');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  // Filter faculties and programs based on selection and search query
  const filteredFaculties = dataAkademik.map(fac => {
    const matchedProdis = fac.programStudi.filter(prodi =>
      prodi.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...fac, matchedProdis };
  }).filter(fac => {
    const matchesTab = selectedFaculty === 'all' || fac.id === selectedFaculty;
    const matchesSearch = searchQuery === '' || fac.matchedProdis.length > 0 || fac.fakultas.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <section
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: 'var(--theme-bg)' }}
    >
      {/* Decorative Overlays */}
      <div
        className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)', filter: 'blur(100px)' }}
      />
      <div
        className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)', filter: 'blur(120px)' }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">

        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
            Fakultas Unggulan Kami
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight font-headline" style={{ color: 'var(--theme-text)' }}>
            Eksplorasi Fakultas & Program Studi
          </h2>
          <p className="font-light text-base sm:text-lg leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
            Rancang masa depanmu bersama Universitas Bhakti Kencana. Temukan program studi unggulan dengan kurikulum berbasis kompetensi yang siap mengantarkanmu menjadi profesional berdaya saing global.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div
          className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-3xl shadow-sm"
          style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
        >
          {/* Tab Filters */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedFaculty('all')}
              className="px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300"
              style={
                selectedFaculty === 'all'
                  ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-secondary)' }
                  : { backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }
              }
            >
              Semua Fakultas
            </button>
            {dataAkademik.map(fac => (
              <button
                key={fac.id}
                onClick={() => setSelectedFaculty(fac.id)}
                className="px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300"
                style={
                  selectedFaculty === fac.id
                    ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-secondary)' }
                    : { backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }
                }
              >
                {fac.fakultas.split(' ').slice(1).join(' ') || fac.fakultas}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" style={{ color: 'var(--theme-text-muted)' }} />
            <input
              type="text"
              placeholder="Cari Program Studi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-2xl pl-10 pr-4 py-2 text-sm focus:outline-none transition-all"
              style={{
                backgroundColor: 'var(--theme-bg)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)'
              }}
            />
          </div>
        </div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredFaculties.map((fac) => {
              const IconComponent = fac.icon;
              return (
                <motion.div
                  key={fac.id}
                  variants={itemVariants}
                  layout
                  className="rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    border: '1px solid var(--theme-border)'
                  }}
                >
                  {/* Decorative Glow inside */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: `color-mix(in srgb, ${fac.color.text.replace('text-', '')} 5%, transparent)`, filter: 'blur(40px)' }}
                  />

                  <div className="space-y-6 relative z-10">
                    {/* Header: Icon & Title */}
                    <div className="flex gap-4 items-center">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-110 transition-transform duration-300`}
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--theme-secondary) 10%, transparent)`,
                          color: 'var(--theme-secondary)',
                          borderColor: 'var(--theme-border)'
                        }}
                      >
                        <IconComponent className="size-6" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-secondary)' }}>
                          Fakultas Unggulan
                        </span>
                        <h3 className="text-xl font-extrabold font-headline" style={{ color: 'var(--theme-text)' }}>
                          {fac.fakultas}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="font-light text-sm sm:text-base leading-relaxed text-left" style={{ color: 'var(--theme-text-muted)' }}>
                      {fac.deskripsi}
                    </p>

                    {/* Program Studi Badges */}
                    <div className="space-y-3 pt-4 text-left" style={{ borderTop: '1px solid var(--theme-border)' }}>
                      <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                        <BookOpen className="size-4" style={{ color: 'var(--theme-secondary)' }} />
                        Program Studi Pilihan:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {fac.programStudi.map((prodi, idx) => {
                          const isHighlighted = searchQuery !== '' && prodi.toLowerCase().includes(searchQuery.toLowerCase());
                          return (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
                              style={
                                isHighlighted
                                  ? { backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-primary)', borderColor: 'var(--theme-secondary)' }
                                  : { backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }
                              }
                            >
                              {prodi}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* CTA Footer */}
                  <div
                    className="pt-6 mt-6 flex justify-between items-center relative z-10 text-xs"
                    style={{ borderTop: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}
                  >
                    <span>Terakreditasi BAN-PT / LAM-PTKes</span>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 font-bold transition-colors group-hover:translate-x-1 duration-300"
                      style={{ color: 'var(--theme-secondary)' }}
                    >
                      Daftar PMB <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredFaculties.length === 0 && (
          <div
            className="text-center py-12 rounded-3xl p-8 max-w-xl mx-auto shadow-sm space-y-4"
            style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
          >
            <GraduationCap className="size-12 mx-auto animate-pulse" style={{ color: 'var(--theme-secondary)' }} />
            <h3 className="text-lg font-bold font-headline" style={{ color: 'var(--theme-text)' }}>Program Studi Tidak Ditemukan</h3>
            <p className="font-light text-sm" style={{ color: 'var(--theme-text-muted)' }}>
              Maaf, tidak ada fakultas atau program studi yang cocok dengan pencarian "{searchQuery}". Coba masukkan kata kunci pencarian yang lain.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedFaculty('all'); }}
              className="px-6 py-2 rounded-2xl text-xs font-bold transition-all"
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-secondary)' }}
            >
              Reset Pencarian
            </button>
          </div>
        )}

      </div>
    </section>
  );
}