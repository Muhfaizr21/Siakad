import React, { useEffect } from 'react';
import { useDashboardQuery } from '../../../queries/useDashboardQuery';
import useAuthStore from '../../../store/useAuthStore';
import { Bell, Map, FileCheck, CheckSquare, CalendarDays, Library, AlertCircle, FileText } from 'lucide-react';
import { StatCard, JadwalCard, TagihanCard, NotifItem, QuickLink } from './DashboardComponents';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function StudentDashboard() {
  const { data, isLoading, isError, error, refetch } = useDashboardQuery();
  const mahasiswaGlobal = useAuthStore((state) => state.mahasiswa);
  
  // Use data from API if available, fallback to global store for optimistic UI
  const mahasiswa = data?.mahasiswa || mahasiswaGlobal || {};
  const akademik = data?.akademik;

  if (isError) {
    return (
      <div className="p-6 md:p-10 min-h-screen bg-neutral-50 flex flex-col items-center justify-center font-inter">
        <AlertCircle size={64} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold font-jakarta text-neutral-900 mb-2">Gagal Memuat Data</h2>
        <p className="text-neutral-500 mb-6 max-w-md text-center">
          Terjadi kesalahan saat mengambil data dari server. Silakan periksa koneksi internet Anda atau coba lagi.
        </p>
        <button 
          onClick={() => refetch()} 
          className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-neutral-50 font-inter">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <section className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-2xl p-6 md:p-8 flex items-center gap-6 border border-orange-100 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <svg width="300" height="300" viewBox="0 0 100 100">
               <circle cx="90" cy="10" r="40" fill="currentColor" className="text-orange-500" />
               <circle cx="80" cy="80" r="20" fill="currentColor" className="text-orange-600" />
            </svg>
          </div>

          <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full bg-orange-200 border-4 border-white shadow-md overflow-hidden flex-shrink-0">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : mahasiswa.foto_url ? (
              <img src={mahasiswa.foto_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-orange-200 text-orange-600 flex items-center justify-center text-3xl font-bold font-jakarta">
                {mahasiswa?.nama?.charAt(0) || 'M'}
              </div>
            )}
          </div>
          <div className="relative z-10 flex-1">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-64 mb-3" />
                <Skeleton className="h-5 w-48 mb-2" />
              </>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-bold font-jakarta text-neutral-900 mb-2">
                  Selamat Datang, {mahasiswa.nama}!
                </h1>
                <div className="flex flex-wrap items-center text-sm font-medium gap-y-2 text-neutral-600">
                  <span className="bg-white/60 px-2 py-1 rounded-md text-neutral-700">{mahasiswa.nim}</span>
                  <span className="mx-2 text-neutral-300">•</span>
                  <span>{mahasiswa.prodi}</span>
                  <span className="mx-2 text-neutral-300">•</span>
                  <span>Semester {mahasiswa.semester}</span>
                  <span className="mx-2 text-neutral-300">•</span>
                  {mahasiswa.status?.toLowerCase() === 'aktif' ? (
                    <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs font-bold border border-green-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600 relative">
                        <div className="absolute inset-0 rounded-full bg-green-600 animate-ping opacity-75"></div>
                      </div>
                      Aktif
                    </span>
                  ) : (
                    <span className="bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full text-xs font-bold border border-neutral-300">
                      {mahasiswa.status}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <QuickLink icon={Map} label="KRS Online" href="/student/krs" />
          <QuickLink icon={FileCheck} label="Nilai & Transkrip" href="/akademik/nilai" />
          <QuickLink icon={CheckSquare} label="Absensi" href="/akademik/absensi" />
          <QuickLink icon={CalendarDays} label="Jadwal Ujian" href="/akademik/ujian" />
          <QuickLink icon={Library} label="Perpustakaan" href="/layanan/perpus" />
          <QuickLink icon={FileText} label="Pengajuan Surat" href="/layanan/surat" />
        </section>

        {/* Academic Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="SKS Diambil Semester Ini" 
            value={akademik?.sks_diambil || 0} 
            maxOrSub={akademik ? `/ ${akademik.sks_maks} SKS` : ''} 
            isLoading={isLoading} 
          />
          <StatCard 
            title="IPK Kumulatif" 
            value={akademik?.ipk || 0} 
            trend={akademik && { isUp: akademik.ipk >= akademik.ips_terakhir, label: `IPS Terakhir: ${akademik.ips_terakhir}` }} 
            isLoading={isLoading} 
          />
          <StatCard 
            title="Persentase Kehadiran" 
            value={akademik?.persentase_kehadiran || 0} 
            maxOrSub="%"
            type="progress"
            isLoading={isLoading} 
          />
          <StatCard 
            title="Mata Kuliah Aktif" 
            value={akademik?.jumlah_mk || 0} 
            maxOrSub="MK"
            isLoading={isLoading} 
          />
        </section>

        {/* Main Content Grid: Jadwal, Tagihan, Notifikasi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Jadwal Kuliah (Takes 2 columns on lg) */}
          <JadwalCard jadwal={data?.jadwal_hari_ini} isLoading={isLoading} />
          
          {/* Right Sidebar Column */}
          <div className="space-y-6">
            
            <TagihanCard invoice={data?.tagihan} isLoading={isLoading} />

            {/* Notifikasi Widget */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden max-h-[400px]">
              <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <h3 className="font-bold font-jakarta text-neutral-900 flex items-center gap-2">
                  <Bell size={18} className="text-neutral-500" />
                  Notifikasi
                </h3>
                <a href="/notifikasi" className="text-xs font-semibold text-orange-600 hover:text-orange-700">Semua</a>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                ) : data?.notifikasi?.length > 0 ? (
                  data.notifikasi.map((n) => <NotifItem key={n.id} notif={n} />)
                ) : (
                  <div className="p-8 text-center text-sm text-neutral-500">
                    Belum ada notifikasi baru.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
