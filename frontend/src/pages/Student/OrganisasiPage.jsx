import React, { useMemo, useState } from 'react';
import {
  Users,
  ChevronRight,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  Trophy,
  Eye,
  X,
  ClipboardList,
  Shield,
} from 'lucide-react';
import { useOrganisasiListQuery } from '../../queries/useOrganisasiQuery';
import { CardGridSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';
import { NavLink } from 'react-router-dom';

const TIPE_COLORS = {
  UKM:            { bg: 'bg-[#EAF1FF]', text: 'text-[#0B4FAE]' },
  'Himpunan Prodi': { bg: 'bg-[#EEF4FF]', text: 'text-[#1D4E9E]' },
  BEM:            { bg: 'bg-[#EDF3FF]', text: 'text-[#113A80]' },
  DPM:            { bg: 'bg-[#F3F7FF]', text: 'text-[#294D8D]' },
  Komunitas:  { bg: 'bg-[#f5f5f5]', text: 'text-[#737373]' },
  Lainnya:    { bg: 'bg-[#f5f5f5]', text: 'text-[#737373]' },
};

export default function OrganisasiPage() {
  const { data: list, isLoading } = useOrganisasiListQuery();
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [activeTab, setActiveTab] = useState('ringkasan');

  const tipeColor = (tipe) => TIPE_COLORS[tipe] ?? TIPE_COLORS['Lainnya'];
  const currentAchievements = useMemo(() => selectedOrg?.Prestasi || [], [selectedOrg]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] font-body px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">

      <div className="max-w-7xl mx-auto">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-6">
           <NavLink to="/student/dashboard" className="hover:text-[#00236F] cursor-pointer transition-colors">Dashboard</NavLink>
           <ChevronRight size={16} />
           <span className="text-[#171717]">Organisasi</span>
         </div>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-headline mb-1.5 flex items-center gap-3">
              <div className="bg-[#00236F] p-2 rounded-xl text-white shadow-md shadow-[#00236F]/20">
                <Users size={20} />
              </div>
              Portfolio Keorganisasian
            </h1>
            <p className="text-[#525252] font-medium text-sm md:text-base">Portofolio keaktifan organisasi kemahasiswaan kamu.</p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <CardGridSkeleton count={4} />
        ) : list?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {list.map((item) => {
              const tc = tipeColor(item.Tipe);
              const isPending = item.StatusVerifikasi === 'Menunggu';
              const isActive = !item.PeriodeSelesai;

              return (
                <div
                  key={item.ID}
                  className="group bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden hover:border-[#C9D8FF] hover:shadow-lg hover:shadow-[#00236F]/10 transition-all flex flex-col"
                >
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2 items-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${tc.bg} ${tc.text} border-current/20 uppercase tracking-wide`}>
                            {item.Tipe}
                          </span>
                        {isActive ? (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#EAF1FF] text-[#0B4FAE] border border-[#C9D8FF]">Aktif</span>
                        ) : (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]">Selesai/Purna</span>
                        )}
                      </div>
                      
                      {isPending ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 text-[#a3a3a3] bg-[#fafafa] border border-[#e5e5e5]">
                          <Clock size={12} /> Menunggu Verifikasi
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0]">
                          <CheckCircle2 size={12} /> Terverifikasi
                        </span>
                      )}
                    </div>

                    {/* Organization Title */}
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-[#171717] group-hover:text-[#00236F] transition-colors leading-snug">
                        {item.NamaOrganisasi}
                      </h3>
                      <p className="text-sm font-semibold text-[#525252] mt-1">{item.Jabatan}</p>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 gap-2 pt-3 border-t border-[#f5f5f5]">
                      <div className="flex text-sm">
                        <span className="w-32 shrink-0 text-[#a3a3a3] flex items-center gap-1.5">
                          <Calendar size={14} /> Periode:
                        </span>
                        <span className="font-medium text-[#171717]">
                          {item.PeriodeMulai} — {item.PeriodeSelesai ? item.PeriodeSelesai : 'Sekarang'}
                        </span>
                      </div>

                      <div className="flex text-sm">
                        <span className="w-32 shrink-0 text-[#a3a3a3] flex items-start gap-1.5 mt-0.5">
                           <Users size={14} /> Deskripsi:
                        </span>
                        <span className="text-[#525252] leading-relaxed line-clamp-3">
                           {item.DeskripsiKegiatan || '-'}
                        </span>
                      </div>

                      <div className="flex text-sm">
                        <span className="w-32 shrink-0 text-[#a3a3a3] flex items-start gap-1.5 mt-0.5">
                           <Award size={14} /> Apresiasi:
                        </span>
                        <span className="text-[#113A80] font-medium leading-relaxed bg-[#EEF4FF] px-2 py-1 rounded">
                           {item.Apresiasi || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Achievements Section */}
                    {item.Prestasi && item.Prestasi.length > 0 && (
                      <div className="pt-3 border-t border-[#f5f5f5]">
                        <p className="text-xs font-bold text-[#a3a3a3] mb-2 uppercase tracking-wider flex items-center gap-1.5"><Trophy size={14} className="text-amber-500"/> Prestasi Terkait:</p>
                        <div className="flex flex-col gap-2">
                          {item.Prestasi.map(p => (
                            <div key={p.ID} className="flex flex-col bg-[#fffbeb] border border-[#fde68a] p-2.5 rounded-xl">
                               <span className="font-bold text-[#b45309] text-xs leading-none mb-1">{p.NamaKegiatan}</span>
                               <span className="text-[10px] text-[#d97706] font-medium leading-none">{p.Tingkat} • {p.Peringkat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-[#f5f5f5] flex justify-end">
                      <button
                        onClick={() => { setSelectedOrg(item); setActiveTab('ringkasan'); }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00236F] text-white text-xs font-bold hover:bg-[#0B4FAE] transition-colors"
                      >
                        <Eye size={14} /> Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState 
            icon="Users" 
            title="Belum Ada Riwayat Organisasi" 
            description="Belum ada catatan keaktifan organisasi yang didaftarkan oleh Ormawa untuk akun ini." 
            iconBgClass="bg-[#EAF1FF]"
            iconBorderClass="border-[#C9D8FF]"
          />
        )}
      </div>

      {selectedOrg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden border border-[#e5e5e5] shadow-2xl flex flex-col">
            <div className="bg-[#00236F] text-white p-6 md:p-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Detail Organisasi</p>
                <h3 className="text-xl md:text-2xl font-extrabold mt-1 leading-tight">{selectedOrg.NamaOrganisasi}</h3>
                <p className="text-sm text-white/80 mt-1">{selectedOrg.Jabatan} • {selectedOrg.Tipe}</p>
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pt-4 border-b border-[#f0f0f0] flex gap-2 overflow-x-auto">
              {[
                { key: 'ringkasan', label: 'Ringkasan', icon: ClipboardList },
                { key: 'prestasi', label: 'Prestasi', icon: Trophy },
                { key: 'verifikasi', label: 'Status & Verifikasi', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                      isActive ? 'text-[#00236F] border-[#00236F] bg-[#EEF4FF]' : 'text-[#737373] border-transparent hover:text-[#171717]'
                    }`}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6 overflow-y-auto">
              {activeTab === 'ringkasan' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Nama Organisasi" value={selectedOrg.NamaOrganisasi} />
                  <DetailItem label="Jenis" value={selectedOrg.Tipe} />
                  <DetailItem label="Jabatan" value={selectedOrg.Jabatan} />
                  <DetailItem label="Periode" value={`${selectedOrg.PeriodeMulai} - ${selectedOrg.PeriodeSelesai || 'Sekarang'}`} />
                  <DetailItem label="Deskripsi Kegiatan" value={selectedOrg.DeskripsiKegiatan || '-'} full />
                  <DetailItem label="Apresiasi" value={selectedOrg.Apresiasi || '-'} full />
                </div>
              )}

              {activeTab === 'prestasi' && (
                <div className="space-y-3">
                  {currentAchievements.length > 0 ? currentAchievements.map((p) => (
                    <div key={p.ID} className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-4">
                      <p className="font-bold text-[#b45309] text-sm">{p.NamaKegiatan || '-'}</p>
                      <p className="text-xs text-[#d97706] mt-1">{p.Tingkat || '-'} • {p.Peringkat || '-'}</p>
                    </div>
                  )) : (
                    <EmptyState
                      size="sm"
                      icon="Trophy"
                      title="Belum Ada Prestasi"
                      description="Prestasi yang terkait organisasi ini belum tersedia."
                      iconBgClass="bg-[#fff7ed]"
                      iconBorderClass="border-[#fed7aa]"
                    />
                  )}
                </div>
              )}

              {activeTab === 'verifikasi' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#e5e5e5] p-4 bg-[#fafafa]">
                    <p className="text-xs text-[#737373]">Status Keanggotaan</p>
                    <p className="text-base font-bold text-[#171717] mt-1">{selectedOrg.PeriodeSelesai ? 'Selesai/Purna' : 'Aktif'}</p>
                  </div>
                  <div className="rounded-2xl border border-[#e5e5e5] p-4 bg-[#fafafa]">
                    <p className="text-xs text-[#737373]">Status Verifikasi</p>
                    <p className="text-base font-bold mt-1 text-[#171717]">{selectedOrg.StatusVerifikasi || 'Menunggu'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, full = false }) {
  return (
    <div className={`rounded-2xl border border-[#e5e5e5] p-4 bg-[#fafafa] ${full ? 'md:col-span-2' : ''}`}>
      <p className="text-xs text-[#737373]">{label}</p>
      <p className="text-sm font-semibold text-[#171717] mt-1 whitespace-pre-wrap">{value || '-'}</p>
    </div>
  );
}
