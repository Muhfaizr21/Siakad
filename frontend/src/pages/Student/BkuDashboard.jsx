import React from 'react';
import { useDashboardQuery } from '../../queries/useDashboardQuery';
import { DashboardSkeleton } from '../../components/ui/SkeletonGroups';
import BannerPinned from '../../components/dashboard/BannerPinned';
import HeroCard from '../../components/dashboard/HeroCard';
import DeadlineAlert from '../../components/dashboard/DeadlineAlert';
import QuickAccessGrid from '../../components/dashboard/QuickAccessGrid';
import StatusSummary from '../../components/dashboard/StatusSummary';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import CalendarMini from '../../components/dashboard/CalendarMini';
import AnnouncementSection from '../../components/dashboard/AnnouncementSection';

export default function BkuDashboard() {
  const { data, isLoading, isError } = useDashboardQuery();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-4">
        <div className="bg-white border border-red-100 rounded-2xl px-8 py-10 max-w-sm w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <h2 className="font-semibold text-[#171717] text-lg mb-2">Gagal Memuat Dashboard</h2>
          <p className="text-sm text-[#6b7280] leading-relaxed">
            Pastikan koneksi internet stabil, lalu coba muat ulang halaman.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 w-full py-2.5 rounded-xl bg-[#171717] text-white text-sm font-medium hover:bg-[#333] transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] font-body text-[#171717]">
      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-5">

          {/* ── ZONA URGENT (hal mendesak di atas) ── */}

          {/* [1] Banner Pengumuman Penting — paling atas karena sifatnya darurat/pinned */}
          {data.banner_pinned && (
            <section aria-label="Pengumuman Penting">
              <BannerPinned banner={data.banner_pinned} />
            </section>
          )}

          {/* [2] Deadline Alert — pengingat jatuh tempo, butuh tindakan segera */}
          {data.deadlines?.length > 0 && (
            <section aria-label="Deadline Mendekat">
              <DeadlineAlert deadlines={data.deadlines} />
            </section>
          )}

          {/* ── ZONA KONTEKSTUAL ── */}

          {/* [3] Hero Card — sambutan & pesan kontekstual */}
          <section aria-label="Ringkasan Harian">
            <HeroCard data={data} />
          </section>

          {/* [4] Status & Progress — gambaran umum kondisi mahasiswa */}
          <section aria-label="Status Permohonan">
            <StatusSummary
              kencana={data.kencana}
              beasiswa={data.beasiswa}
              voice={data.student_voice}
            />
          </section>

          {/* ── ZONA NAVIGASI & AKTIVITAS ── */}

          {/* [5] Quick Access — akses cepat ke fitur utama */}
          <section aria-label="Akses Cepat">
            <QuickAccessGrid />
          </section>

          {/* [6] Aktivitas & Kalender — layout dua kolom */}
          <section aria-label="Aktivitas dan Jadwal">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">
              <div className="lg:col-span-6">
                <ActivityFeed activities={data.aktivitas_terbaru} />
              </div>
              <div className="lg:col-span-4">
                <CalendarMini events={data.kegiatan_bulan_ini} />
              </div>
            </div>
          </section>

          {/* [7] Pengumuman Terbaru — informasi pendukung di paling bawah */}
          <section aria-label="Pengumuman">
            <AnnouncementSection announcements={data.pengumuman} />
          </section>

        </div>
      </div>
    </div>
  );
}