import React from 'react';
import { Sparkles, Milestone, ShieldCheck } from 'lucide-react';

export default function Milestones() {
  const timeline = [
    {
      period: 'Awal Mula',
      title: 'Kombinasi Institusi Pendidikan Legendaris',
      desc: 'Berawal dari keunggulan Sekolah Tinggi Farmasi Bandung (STFB) serta institusi keperawatan dan kebidanan lainnya yang memiliki reputasi kokoh selama puluhan tahun.',
      icon: Sparkles,
      color: 'text-indigo-600 border-indigo-500/20'
    },
    {
      period: '9 April 2019',
      title: 'Deklarasi Penggabungan & Transformasi',
      desc: 'Resmi bertransformasi menjadi Universitas Bhakti Kencana, menggabungkan 10 institusi pendidikan tinggi (STIKES, AKPER, AKBID) di bawah naungan Yayasan Adhi Guna Kencana.',
      icon: Milestone,
      color: 'text-[var(--theme-secondary)] border-[var(--theme-secondary)]/20'
    },
    {
      period: '22 Desember 2021',
      title: 'Sertifikasi Mutu Internasional ISO 21001:2018',
      desc: 'Meraih Sertifikasi Internasional ISO 21001:2018 untuk Sistem Manajemen Organisasi Pendidikan (SMOP), menjamin keandalan tata kelola kurikulum.',
      icon: ShieldCheck,
      color: 'text-emerald-600 border-emerald-500/20'
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest font-headline block" style={{ color: 'var(--theme-secondary)' }}>
            Sejarah & Milestone
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline" style={{ color: 'var(--theme-text)' }}>
            Perjalanan Panjang Transformasi Kami
          </h2>
          <p className="font-light text-xs sm:text-sm max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
            Menyatukan keunggulan institusi farmasi dan keperawatan demi membentuk satu universitas terpadu yang kokoh.
          </p>
        </div>

        {/* Timeline (Vertical Line) */}
        <div className="relative pl-6 sm:pl-8 space-y-12 ml-4 sm:ml-6 text-left" style={{ borderLeft: '2px solid var(--theme-border)' }}>
          {timeline.map((item, index) => (
            <div key={index} className="relative group">
              {/* Bullet icon on the vertical line */}
              <div
                className="absolute -left-[45px] sm:-left-[53px] top-1 w-10 h-10 rounded-full flex items-center justify-center shadow-md shrink-0"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)',
                  color: 'var(--theme-secondary)'
                }}
              >
                <item.icon className="size-4 sm:size-5" />
              </div>

              {/* Timeline Card */}
              <div
                className="rounded-3xl p-6 sm:p-8 shadow-sm transition-all"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)'
                }}
              >
                <span className="font-bold text-xs sm:text-sm font-headline block mb-1" style={{ color: 'var(--theme-secondary)' }}>
                  {item.period}
                </span>
                <h4 className="text-base sm:text-lg font-bold font-headline mb-3 leading-snug" style={{ color: 'var(--theme-text)' }}>
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm font-light leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}