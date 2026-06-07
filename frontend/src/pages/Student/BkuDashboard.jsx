import React from 'react';
import { useDashboardQuery } from '../../queries/useDashboardQuery';
import { useHealthRingkasanQuery } from '../../queries/useHealthQuery';
import { DashboardSkeleton } from '@/components/ui/SkeletonGroups';
import BannerPinned from '../../components/dashboard/BannerPinned';
import DeadlineAlert from '../../components/dashboard/DeadlineAlert';
import { DashboardHero, DashboardStatGrid, DashboardStatCard, DashboardQuickActions } from '@/components/ui/dashboard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import CalendarMini from '../../components/dashboard/CalendarMini';
import AnnouncementSection from '../../components/dashboard/AnnouncementSection';
import AvailableScholarships from '../../components/dashboard/AvailableScholarships';
import { PageContent } from '@/components/ui/page';
import { useNavigate } from 'react-router-dom';

export default function BkuDashboard() {
  const { data, isLoading, isError } = useDashboardQuery();
  const { data: kesehatanData, isLoading: kesehatanLoading } = useHealthRingkasanQuery();
  const navigate = useNavigate();

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

  const { mahasiswa, pesan_kontekstual, link_kontekstual, kencana, beasiswa, student_voice: voice } = data;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Selamat Pagi,';
    if (hour >= 12 && hour < 15) return 'Selamat Siang,';
    if (hour >= 15 && hour < 18) return 'Selamat Sore,';
    return 'Selamat Malam,';
  };

  const firstName = mahasiswa?.nama_depan || mahasiswa?.nama || 'Mahasiswa';
  const currentStatus = mahasiswa?.status?.toLowerCase() || 'alumni';

  const statCards = [
    { 
      label: 'KENCANA', 
      value: `${Math.round(kencana?.persentase || 0)}%`, 
      icon: 'school', 
      colorClass: 'text-[var(--theme-primary)]', 
      bgClass: 'bg-[var(--theme-primary-light)] border-[var(--theme-primary)]/20 border', 
      accentGradient: 'from-[var(--theme-primary-light)]', 
      route: '/student/kencana', 
      badge: { text: kencana?.status === 'Selesai ✓' ? 'Selesai' : (kencana?.status || 'Aktif'), icon: kencana?.status === 'Selesai ✓' ? 'check_circle' : 'schedule' } 
    },
    { 
      label: 'Beasiswa Aktif', 
      value: beasiswa?.total_tersedia || 0, 
      icon: 'menu_book', 
      colorClass: 'text-[var(--theme-success)]', 
      bgClass: 'bg-[var(--theme-success-light)] border-[var(--theme-success)]/20 border', 
      accentGradient: 'from-[var(--theme-success-light)]', 
      route: '/student/scholarship', 
      badge: { text: beasiswa?.total_tersedia > 0 ? 'Terbuka' : 'Tutup', icon: 'info' } 
    },
    { 
      label: 'Aspirasi Terbuka', 
      value: voice?.jumlah_aktif || 0, 
      icon: 'chat', 
      colorClass: 'text-[var(--theme-secondary)]', 
      bgClass: 'bg-[var(--theme-secondary-light)] border-[var(--theme-secondary)]/20 border', 
      accentGradient: 'from-[var(--theme-secondary-light)]', 
      route: '/student/voice', 
      badge: { text: voice?.jumlah_belum_direspons > 0 ? `${voice.jumlah_belum_direspons} Menunggu` : 'Aman', icon: voice?.jumlah_belum_direspons > 0 ? 'warning' : 'check_circle' } 
    },
  ];

  const bmi = kesehatanData?.bmi;
  const bmiDisplay = bmi ? bmi.toFixed(1) : null;
  const healthStatus = (kesehatanData?.status_kesehatan || 'sehat').toLowerCase();
  
  let healthBadgeText = 'Sehat';
  let healthIcon = 'check_circle';
  let healthColor = 'text-[var(--theme-success)]';
  let healthBg = 'bg-[var(--theme-success-light)] border-[var(--theme-success)]/20 border';
  let healthGradient = 'from-[var(--theme-success-light)]';

  if (healthStatus.includes('bahaya') || healthStatus.includes('tindak')) {
    healthBadgeText = 'Perlu Tindakan';
    healthIcon = 'warning';
    healthColor = 'text-[var(--theme-error)]';
    healthBg = 'bg-[var(--theme-error-light)] border-[var(--theme-error)]/20 border';
    healthGradient = 'from-[var(--theme-error-light)]';
  } else if (healthStatus.includes('pantauan') || healthStatus.includes('observasi') || healthStatus.includes('waspada')) {
    healthBadgeText = 'Pantauan';
    healthIcon = 'warning';
    healthColor = 'text-[var(--theme-warning)]';
    healthBg = 'bg-[var(--theme-warning-light)] border-[var(--theme-warning)]/20 border';
    healthGradient = 'from-[var(--theme-warning-light)]';
  }

  statCards.push({
    label: 'Kesehatan',
    value: bmiDisplay ? bmiDisplay : (healthBadgeText === 'Sehat' ? 'Sehat' : 'Perhatian'),
    icon: 'monitor_heart',
    colorClass: healthColor,
    bgClass: healthBg,
    accentGradient: healthGradient,
    route: '/student/health',
    badge: { text: bmiDisplay ? 'BMI' : 'Status', icon: healthIcon }
  });

  return (
    <PageContent>
      <div className="flex flex-col gap-6">

        {data.banner_pinned && (
          <section aria-label="Pengumuman Penting">
            <BannerPinned banner={data.banner_pinned} />
          </section>
        )}

        {data.deadlines?.length > 0 && (
          <section aria-label="Deadline Mendekat">
            <DeadlineAlert deadlines={data.deadlines} />
          </section>
        )}

        <section aria-label="Ringkasan Harian">
          <DashboardHero 
            title={getGreeting()}
            highlightedTitle={firstName + "!"}
            subtitle={`${mahasiswa?.nim ? `${mahasiswa.nim} · ` : ''}${mahasiswa?.prodi || ''}${mahasiswa?.semester ? ` · Semester ${mahasiswa.semester}` : ''}`}
            icon="school"
            badges={[
              { label: 'Student Hub Portal', active: false },
              ...(currentStatus === 'aktif' ? [{ label: 'Sesi Aktif', active: true }] : [])
            ]}
            actions={
              pesan_kontekstual && (
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => navigate(link_kontekstual || '#')}
                    className="flex-1 md:flex-initial px-4 py-2 rounded-lg font-bold text-xs transition-all text-white hover:opacity-90 shadow-sm flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    {pesan_kontekstual}
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              )
            }
          />
        </section>

        <section aria-label="Status Permohonan">
          <DashboardStatGrid>
            {statCards.map((card, i) => (
              <DashboardStatCard key={i} {...card} loading={kesehatanLoading && i === 3} />
            ))}
          </DashboardStatGrid>
        </section>

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

        <section aria-label="Beasiswa yang Tersedia">
          <AvailableScholarships />
        </section>

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

        <section aria-label="Pengumuman">
          <AnnouncementSection announcements={data.pengumuman} />
        </section>

      </div>
    </PageContent>
  );
}