import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewsSection() {
  const newsList = [
    {
      title: 'Penerimaan Mahasiswa Baru Gelombang 1 Universitas Bhakti Kencana Tahun Akademik 2025/2026 Resmi Dibuka',
      cat: 'Pendaftaran',
      date: '10 Mei 2025',
      author: 'Humas BKU',
      isFeatured: true,
      desc: 'Segera bergabung bersama universitas kesehatan pelopor di Jawa Barat. Tersedia diskon biaya sumbangan pembangunan bagi pendaftar gelombang pertama berprestasi.'
    },
    {
      title: 'Selamat! Lulusan Ners BKU Kembali Raih Tingkat Kelulusan 98.57% Pada UKNI Nasional Periode 2025',
      cat: 'Prestasi',
      date: '02 Mei 2025',
      author: 'Fak. Keperawatan',
      isFeatured: false,
      desc: 'Keberhasilan ini membuktikan komitmen penjaminan mutu perkuliahan dan bimbingan intensif berkesinambungan.'
    },
    {
      title: 'Universitas Bhakti Kencana Jalin Kemitraan Strategis Lahan Praktik dengan 15 RS Jejaring Baru',
      cat: 'Kerja Sama',
      date: '28 April 2025',
      author: 'Kerjasama BKU',
      isFeatured: false,
      desc: 'Penandatanganan kerja sama guna menjamin ketersediaan kuota interns bagi mahasiswa farmasi dan keperawatan.'
    }
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-end mb-16">
          <div className="text-left space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
              Berita & Informasi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-headline" style={{ color: 'var(--theme-text)' }}>
              Berita Terbaru Seputar Universitas Bhakti Kencana
            </h2>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured News Card */}
          {newsList.filter(news => news.isFeatured).map((news, i) => (
            <div
              key={i}
              className="lg:col-span-8 border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 gap-6"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div className="space-y-4">
                <span
                  className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                    color: 'var(--theme-secondary)'
                  }}
                >
                  {news.cat}
                </span>

                <h3 className="text-xl sm:text-2xl font-extrabold font-headline leading-tight" style={{ color: 'var(--theme-text)' }}>
                  <Link to="/login">{news.title}</Link>
                </h3>

                <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                  {news.desc}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-6" style={{ borderTop: '1px solid var(--theme-border)' }}>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--theme-text-muted)' }}><Calendar className="size-3.5" style={{ color: 'var(--theme-secondary)' }} /> {news.date}</span>
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--theme-text-muted)' }}><User className="size-3.5" style={{ color: 'var(--theme-secondary)' }} /> {news.author}</span>
                </div>
                <Link to="/login" className="font-bold flex items-center gap-1 transition-colors" style={{ color: 'var(--theme-secondary)' }}>
                  Baca Selengkapnya <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          ))}

          {/* Side Column: Normal News Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {newsList.filter(news => !news.isFeatured).map((news, i) => (
              <div
                key={i}
                className="border rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between gap-4"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <div className="space-y-3">
                  <span
                    className="inline-block text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                      color: 'var(--theme-secondary)'
                    }}
                  >
                    {news.cat}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold font-headline leading-snug line-clamp-2" style={{ color: 'var(--theme-text)' }}>
                    <Link to="/login">{news.title}</Link>
                  </h4>
                  <p className="text-xs font-light line-clamp-2 leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                    {news.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--theme-border)' }}>
                  <span className="flex items-center gap-1" style={{ color: 'var(--theme-text-muted)' }}><Calendar className="size-3" style={{ color: 'var(--theme-secondary)' }} /> {news.date}</span>
                  <Link to="/login" className="font-bold flex items-center gap-0.5 transition-colors" style={{ color: 'var(--theme-secondary)' }}>
                    Selengkapnya <ArrowRight className="size-2.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
