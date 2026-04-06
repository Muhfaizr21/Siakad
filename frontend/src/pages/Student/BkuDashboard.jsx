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
      <div className="p-20 text-center flex flex-col items-center justify-center">
        <div className="bg-red-50 text-red-500 p-6 rounded-3xl border border-red-100 max-w-sm">
          <h2 className="font-bold text-xl mb-2">Oops! Ada Masalah 🚧</h2>
          <p className="text-sm font-medium">Gagal memuat data dashboard. Pastikan koneksi internet stabil dan coba lagi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 font-body text-[#171717] min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">
        
        {/* [0] Banner Pengumuman Penting */}
        <BannerPinned banner={data.banner_pinned} />

        {/* [1] Hero Card — Greeting & Contextual Msg */}
        <HeroCard data={data} />

        {/* [2] Deadline Alert — Pengingat Jatuh Tempo */}
        <DeadlineAlert deadlines={data.deadlines} />

        {/* [3] Quick Access Card */}
        <QuickAccessGrid />

        {/* [4] Status & Progress Ringkasan */}
        <StatusSummary 
            kencana={data.kencana} 
            beasiswa={data.beasiswa} 
            voice={data.student_voice} 
        />

        {/* [5] Layout Dua Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 mb-12">
            <div className="lg:col-span-6">
                <ActivityFeed activities={data.aktivitas_terbaru} />
            </div>
            <div className="lg:col-span-4">
                <CalendarMini events={data.kegiatan_bulan_ini} />
            </div>
        </div>

        {/* [6] Pengumuman Terbaru */}
        <AnnouncementSection announcements={data.pengumuman} />

      </div>
    </div>
  );
}
