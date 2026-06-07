import React from 'react';
import { useDashboardQuery } from '../../queries/useDashboardQuery';
import { useHealthRingkasanQuery } from '../../queries/useHealthQuery';
import { DashboardSkeleton } from '@/components/ui/SkeletonGroups';
import BannerPinned from '../../components/dashboard/BannerPinned';
import HeroCard from '../../components/dashboard/HeroCard';
import DeadlineAlert from '../../components/dashboard/DeadlineAlert';
import { DashboardQuickActions } from '@/components/ui/dashboard';
import StatusSummary from '../../components/dashboard/StatusSummary';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import CalendarMini from '../../components/dashboard/CalendarMini';
import AnnouncementSection from '../../components/dashboard/AnnouncementSection';
import AvailableScholarships from '../../components/dashboard/AvailableScholarships';
import { PageContent } from '@/components/ui/page';

export default function BkuDashboard() {
  const { data, isLoading, isError } = useDashboardQuery();
  const { data: kesehatanData, isLoading: kesehatanLoading } = useHealthRingkasanQuery();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-surface border border-error/25 rounded-2xl px-8 py-10 max-w-sm w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-error">warning</span>
          </div>
          <h2 className="font-semibold text-bku-text text-lg mb-2">Gagal Memuat Dashboard</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Pastikan koneksi internet stabil, lalu coba muat ulang halaman.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-all"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageContent>
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
              kesehatan={kesehatanData}
              kesehatanLoading={kesehatanLoading}
            />
          </section>

          {/* ── ZONA NAVIGASI & AKTIVITAS ── */}

          {/* [5] Quick Access — akses cepat ke fitur utama */}
          <DashboardQuickActions 
            title="Akses Cepat"
            description="Pintasan Menu"
            actions={[
              { label: 'KENCANA', icon: 'school', path: '/student/kencana', iconBg: 'bg-primary/10 text-primary border border-primary/20' },
              { label: 'Achievement', icon: 'emoji_events', path: '/student/achievement', iconBg: 'bg-warning/10 text-warning border border-warning/20' },
              { label: 'Scholarship', icon: 'workspace_premium', path: '/student/scholarship', iconBg: 'bg-success/10 text-success border border-success/20' },
              { label: 'Organisasi', icon: 'groups', path: '/student/organisasi', iconBg: 'bg-primary/10 text-primary border border-primary/20' },
              { label: 'Counseling', icon: 'support_agent', path: '/student/counseling', iconBg: 'bg-secondary/10 text-secondary border border-secondary/20' },
              { label: 'Health', icon: 'monitor_heart', path: '/student/health', iconBg: 'bg-error/10 text-error border border-error/20' },
              { label: 'Student Voice', icon: 'chat', path: '/student/voice', iconBg: 'bg-info/10 text-info border border-info/20' },
            ]}
          />

          {/* Beasiswa yang Tersedia */}
          <section aria-label="Beasiswa yang Tersedia">
            <AvailableScholarships />
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
    </PageContent>
  );
}