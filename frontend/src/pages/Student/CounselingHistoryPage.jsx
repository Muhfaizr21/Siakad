import React, { useState } from 'react';

import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  useCancelBookingMutation,
  useCounselingMedicalRecordQuery,
  useCounselingRiwayatQuery,
  useCounselingReferralsQuery,
  useRescheduleMutation,
} from '../../queries/useCounselingQuery';
import { API_BASE_URL, studentCounselingService } from '../../services/api';

const getFullUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path}`;
};

const REFERRAL_STATUS_CONFIG = {
  Pending: { bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-200' },
  Sent: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Received: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  default: { bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-200' },
};

import { NotifListSkeleton } from '@/components/ui/SkeletonGroups';
import EmptyState from '@/components/ui/EmptyState';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const ArrowLeft = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>arrow_back</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const User = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;



const formatLongDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const STATUS_CONFIG = {
  Selesai: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', bar: 'bg-emerald-500' },
  Dikonfirmasi: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', bar: 'bg-blue-500' },
  Menunggu: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', bar: 'bg-amber-400' },
  Ditolak: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', bar: 'bg-rose-500' },
  Dibatalkan: { bg: 'bg-neutral-50', text: 'text-neutral-500', border: 'border-neutral-100', bar: 'bg-neutral-300' },
  default: { bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-100', bar: 'bg-neutral-300' },
};

const hasScreeningData = (record) => {
  return (
    record.aspek_kognitif ||
    record.aspek_emosional ||
    record.aspek_perilaku ||
    record.kesimpulan ||
    record.riwayat_keluhan ||
    record.tujuan_pemeriksaan ||
    record.rekomendasi_mahasiswa ||
    record.rekomendasi_prodi ||
    record.rekomendasi_orang_tua ||
    record.tindak_lanjut?.length > 0
  );
};

export default function CounselingHistoryPage() {
  const { data: history = [], isLoading: isHistoryLoading } = useCounselingRiwayatQuery();
  const { data: medicalRecord, isLoading: isMedicalLoading } = useCounselingMedicalRecordQuery();
  const { data: referrals = [], isLoading: isReferralsLoading } = useCounselingReferralsQuery();
  const [activeTab, setActiveTab] = useState('medical_record');
  const [expandedScreening, setExpandedScreening] = useState(null);
  const cancelMutation = useCancelBookingMutation();
  const rescheduleMutation = useRescheduleMutation();

  // Reschedule state
  const [rescheduleItem, setRescheduleItem] = useState(null); // booking being rescheduled
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStart, setRescheduleStart] = useState('');
  const [rescheduleEnd, setRescheduleEnd] = useState('');

  const records = medicalRecord?.records || [];
  const summary = medicalRecord?.summary || { total_records: 0, latest_status: 'Belum ada catatan' };
  const screeningRecords = records.filter(hasScreeningData);
  const waitingCount = history.filter((item) => item.status === 'Menunggu').length;
  const confirmedCount = history.filter((item) => item.status === 'Dikonfirmasi').length;
  const completedCount = history.filter((item) => item.status === 'Selesai').length;

  const handleCancel = (id) => {
    if (!confirm('Yakin ingin membatalkan jadwal konseling ini?')) return;
    cancelMutation.mutate(id, {
      onSuccess: () => toast.success('Booking berhasil dibatalkan'),
      onError: () => toast.error('Gagal membatalkan booking'),
    });
  };

  const openReschedule = (item) => {
    setRescheduleItem(item);
    // Pre-fill with existing values
    const dateStr = item.tanggal ? new Date(item.tanggal).toISOString().split('T')[0] : '';
    setRescheduleDate(dateStr);
    setRescheduleStart(item.jam_mulai || '');
    setRescheduleEnd(item.jam_selesai || '');
  };

  const handleReschedule = () => {
    if (!rescheduleDate) return toast.error('Pilih tanggal baru');
    if (!rescheduleStart) return toast.error('Isi jam mulai');
    rescheduleMutation.mutate(
      { id: rescheduleItem.id, date: rescheduleDate, start: rescheduleStart, end: rescheduleEnd },
      {
        onSuccess: () => {
          toast.success('Jadwal berhasil diubah! Menunggu konfirmasi psikolog.');
          setRescheduleItem(null);
        },
        onError: (err) => {
          const msg = err?.response?.data?.message || 'Gagal mengubah jadwal';
          toast.error(msg);
        },
      }
    );
  };

  const handleDownloadPDF = async (id) => {
    try {
      await studentCounselingService.downloadSessionNotePDF(id);
      toast.success('PDF Sesi berhasil diunduh');
    } catch (err) {
      toast.error('Gagal mengunduh PDF Sesi');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-5 font-body text-[#171717] md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <NavLink to="/student/counseling" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 transition-colors hover:text-[bku-primary]">
            <ArrowLeft size={16} />
            Kembali ke jadwal
          </NavLink>
          <h1 className="text-2xl font-extrabold tracking-tight text-[bku-primary] font-headline">Riwayat Konseling</h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-neutral-500">
            Pantau booking konseling dan lihat rekam medis yang sudah dicatat psikolog setelah sesi.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:min-w-[520px]">
          {[
            { label: 'Total Booking', value: history.length },
            { label: 'Menunggu', value: waitingCount },
            { label: 'Dikonfirmasi', value: confirmedCount },
            { label: 'Selesai', value: completedCount },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{item.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-neutral-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="xl:col-span-7">
          <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
            <div className="border-b border-neutral-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[bku-primary]" style={{ fontSize: '18px' }} >calendar_month</span>
                <h2 className="text-sm font-extrabold uppercase tracking-tight text-[bku-primary]">Daftar Booking</h2>
              </div>
              <p className="mt-1 text-xs font-semibold text-neutral-400">Status booking konseling kamu dari yang terbaru.</p>
            </div>

            <div className="p-4">
              {isHistoryLoading ? (
                <NotifListSkeleton count={5} />
              ) : history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((item) => {
                    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.default;
                    return (
                      <article key={item.id} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
                        <div className={`h-1 w-full ${status.bar}`} />
                        <div className="p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{formatLongDate(item.tanggal)}</p>
                              <h3 className="mt-1 text-sm font-extrabold text-neutral-900">
                                {item.tipe?.startsWith('[Personal]')
                                  ? item.tipe.replace('[Personal]', '[Psikologi]')
                                  : item.tipe?.startsWith('[Karir]')
                                  ? item.tipe.replace('[Karir]', '[Psikologi]')
                                  : item.tipe === 'Personal' || item.tipe === 'Karir'
                                  ? 'Psikologi'
                                  : item.tipe}
                              </h3>
                              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                                <User size={13} className="text-neutral-300" />
                                {item.nama_konselor}
                              </p>
                              {item.queue_number ? (
                                <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '12px' }}>tag</span>
                                  Antrean #{item.queue_number}
                                </span>
                              ) : null}
                            </div>
                            <span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${status.bg} ${status.text} ${status.border}`}>
                              {item.status}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >schedule</span>
                                Waktu
                              </p>
                              <p className="mt-1 text-xs font-extrabold text-neutral-800">{item.jam_mulai}{item.jam_selesai ? ` - ${item.jam_selesai}` : ''}</p>
                            </div>
                            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >
                                  {item.mode === 'Online' ? 'videocam' : 'groups'}
                                </span>
                                Metode & Lokasi
                              </p>
                              <p className="mt-1 text-xs font-extrabold text-neutral-800">
                                {item.mode === 'Online' ? 'Online (Zoom)' : 'Tatap Muka'}
                              </p>
                              {item.mode === 'Online' && item.status === 'Dikonfirmasi' && item.link_meeting ? (
                                <a
                                  href={item.link_meeting.startsWith('http') ? item.link_meeting : `https://${item.link_meeting}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>link</span>
                                  Gabung Meeting
                                </a>
                              ) : (
                                <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                                  {item.mode === 'Online' ? 'Link dikirim jika disetujui' : 'Ruang Konseling BKU'}
                                </p>
                              )}
                            </div>
                            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 sm:col-span-2 md:col-span-1">
                              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >chat</span>
                                Topik Mahasiswa
                              </p>
                              <p className="mt-1 text-xs font-medium leading-relaxed text-neutral-700">{item.keluhan || 'Tidak ada topik tambahan.'}</p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-neutral-50 pt-3">
                            <span className="text-[11px] font-semibold text-neutral-400">
                              Rekam medis: {item.medical_record_count || 0} catatan
                            </span>
                            <div className="flex items-center gap-1">
                              {(item.status === 'Menunggu' || item.status === 'Dikonfirmasi') && (
                                <button
                                  type="button"
                                  onClick={() => openReschedule(item)}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 transition-all hover:bg-blue-50"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>event_repeat</span>
                                  Reschedule
                                </button>
                              )}
                              {item.status === 'Menunggu' && (
                                <button
                                  type="button"
                                  onClick={() => handleCancel(item.id)}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-rose-500 transition-all hover:bg-rose-50"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>delete</span>
                                  Batalkan
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  size="sm"
                  icon="Clock"
                  iconColor="text-[bku-primary]"
                  iconBgClass="bg-[#eef4ff]"
                  iconBorderClass="border-[#c9d8ff]"
                  title="Belum Ada Riwayat"
                  description="Booking konseling kamu akan muncul di sini setelah membuat jadwal."
                />
              )}
            </div>
          </div>
        </section>

        <section className="xl:col-span-5">
          <div className="rounded-3xl border border-neutral-100 bg-white shadow-sm">
            <div className="border-b border-neutral-100 px-5 py-4">
              <div className="flex gap-4 border-b border-neutral-100 pb-3 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('medical_record')}
                  className={`pb-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 -mb-3.5 whitespace-nowrap ${
                    activeTab === 'medical_record'
                      ? 'border-[bku-primary] text-[bku-primary]'
                      : 'border-transparent text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  Rekam Medis
                  <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                    activeTab === 'medical_record' ? 'bg-[bku-primary]/10 text-[bku-primary]' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {records.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('screening')}
                  className={`pb-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 -mb-3.5 whitespace-nowrap ${
                    activeTab === 'screening'
                      ? 'border-violet-600 text-violet-600'
                      : 'border-transparent text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  Hasil Screening
                  <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                    activeTab === 'screening' ? 'bg-violet-100 text-violet-700' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {screeningRecords.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('referrals')}
                  className={`pb-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 -mb-3.5 whitespace-nowrap ${
                    activeTab === 'referrals'
                      ? 'border-[bku-primary] text-[bku-primary]'
                      : 'border-transparent text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                  Tindak Lanjut
                  <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                    activeTab === 'referrals' ? 'bg-[bku-primary]/10 text-[bku-primary]' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {referrals.length}
                  </span>
                </button>
              </div>
              <p className="mt-4 text-xs font-semibold text-neutral-400">
                {activeTab === 'medical_record'
                  ? 'Catatan sesi yang sudah disimpan oleh psikolog.'
                  : activeTab === 'screening'
                  ? 'Hasil asesmen psikologis dari psikolog berdasarkan sesi konseling.'
                  : 'Rujukan dan rekomendasi tindak lanjut penanganan dari psikolog.'}
              </p>
            </div>

            <div className="p-4">
              {activeTab === 'screening' ? (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500">Total Screening</p>
                      <p className="mt-1 text-2xl font-extrabold text-violet-700">{screeningRecords.length}</p>
                    </div>
                    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Status Terakhir</p>
                      <p className="mt-1 text-sm font-extrabold text-neutral-900">{summary.latest_status}</p>
                    </div>
                  </div>

                  {isMedicalLoading ? (
                    <NotifListSkeleton count={3} />
                  ) : screeningRecords.length > 0 ? (
                    <div className="space-y-3">
                      {screeningRecords.map((record) => {
                        const isExpanded = expandedScreening === record.id;
                        const tindakChipConfig = {
                          Tuntas: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          Lanjutan: 'bg-blue-50 text-blue-700 border-blue-200',
                          Rujuk: 'bg-amber-50 text-amber-700 border-amber-200',
                        };
                        return (
                          <article key={record.id} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                            {/* Header */}
                            <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-500" />
                            <button
                              type="button"
                              className="w-full p-4 text-left"
                              onClick={() => setExpandedScreening(isExpanded ? null : record.id)}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>calendar_month</span>
                                    {record.tanggal_asesmen || record.display_date} • {record.time}
                                  </p>
                                  <h3 className="mt-1 text-sm font-extrabold text-neutral-900">{record.type}</h3>
                                  <p className="mt-0.5 text-xs font-semibold text-neutral-500">Psikolog: {record.psychologist}</p>
                                  {record.tindak_lanjut?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {record.tindak_lanjut.map((t) => (
                                        <span key={t} className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                                          tindakChipConfig[t] || 'bg-neutral-50 text-neutral-600 border-neutral-200'
                                        }`}>
                                          <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>
                                            {t === 'Tuntas' ? 'check_circle' : t === 'Rujuk' ? 'local_hospital' : 'repeat'}
                                          </span>
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadPDF(record.id);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-sm"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>download</span>
                                    PDF
                                  </button>
                                  <span className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform ${
                                    isExpanded ? 'bg-violet-100 rotate-180' : 'bg-neutral-100'
                                  }`}>
                                    <span className="material-symbols-outlined text-neutral-600" style={{ fontSize: '14px' }}>expand_more</span>
                                  </span>
                                </div>
                              </div>
                            </button>

                            {/* Expanded detail */}
                            {isExpanded && (
                              <div className="border-t border-neutral-100 p-4 space-y-3">
                                {record.tujuan_pemeriksaan && (
                                  <div className="rounded-xl border border-violet-100 bg-violet-50 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500">Tujuan Pemeriksaan</p>
                                    <p className="mt-1 text-xs leading-relaxed text-violet-900">{record.tujuan_pemeriksaan}</p>
                                  </div>
                                )}
                                {record.riwayat_keluhan && (
                                  <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Riwayat Keluhan</p>
                                    <p className="mt-1 text-xs leading-relaxed text-neutral-700">{record.riwayat_keluhan}</p>
                                  </div>
                                )}
                                {(record.aspek_kognitif || record.aspek_emosional || record.aspek_perilaku) && (
                                  <div>
                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">Aspek Psikologis</p>
                                    <div className="space-y-2">
                                      {record.aspek_kognitif && (
                                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                                          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-blue-500">
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>psychology_alt</span>
                                            Kognitif
                                          </p>
                                          <p className="mt-1 text-xs leading-relaxed text-blue-900">{record.aspek_kognitif}</p>
                                        </div>
                                      )}
                                      {record.aspek_emosional && (
                                        <div className="rounded-xl border border-pink-100 bg-pink-50 p-3">
                                          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-pink-500">
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>favorite</span>
                                            Emosional
                                          </p>
                                          <p className="mt-1 text-xs leading-relaxed text-pink-900">{record.aspek_emosional}</p>
                                        </div>
                                      )}
                                      {record.aspek_perilaku && (
                                        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                                          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>directions_run</span>
                                            Perilaku
                                          </p>
                                          <p className="mt-1 text-xs leading-relaxed text-amber-900">{record.aspek_perilaku}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {(record.rekomendasi_mahasiswa || record.rekomendasi_prodi || record.rekomendasi_orang_tua) && (
                                  <div>
                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">Rekomendasi</p>
                                    <div className="space-y-2">
                                      {record.rekomendasi_mahasiswa && (
                                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                                          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>person</span>
                                            Untuk Mahasiswa
                                          </p>
                                          <p className="mt-1 text-xs leading-relaxed text-emerald-900">{record.rekomendasi_mahasiswa}</p>
                                        </div>
                                      )}
                                      {record.rekomendasi_prodi && (
                                        <div className="rounded-xl border border-teal-100 bg-teal-50 p-3">
                                          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-teal-600">
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>school</span>
                                            Untuk Program Studi
                                          </p>
                                          <p className="mt-1 text-xs leading-relaxed text-teal-900">{record.rekomendasi_prodi}</p>
                                        </div>
                                      )}
                                      {record.rekomendasi_orang_tua && (
                                        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                                          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>family_restroom</span>
                                            Untuk Orang Tua
                                          </p>
                                          <p className="mt-1 text-xs leading-relaxed text-indigo-900">{record.rekomendasi_orang_tua}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {record.kesimpulan && (
                                  <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-slate-50 to-neutral-50 p-3">
                                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>summarize</span>
                                      Kesimpulan Psikolog
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-neutral-800 font-medium">{record.kesimpulan}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      size="sm"
                      icon="Psychology"
                      iconColor="text-violet-600"
                      iconBgClass="bg-violet-50"
                      iconBorderClass="border-violet-200"
                      title="Belum Ada Hasil Screening"
                      description="Hasil asesmen psikologis akan muncul setelah psikolog mengisi catatan sesi lengkap."
                    />
                  )}
                </>
              ) : activeTab === 'medical_record' ? (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Total Catatan</p>
                      <p className="mt-1 text-2xl font-extrabold text-[bku-primary]">{summary.total_records}</p>
                    </div>
                    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Status Terakhir</p>
                      <p className="mt-1 text-sm font-extrabold text-neutral-900">{summary.latest_status}</p>
                    </div>
                  </div>

                  {isMedicalLoading ? (
                    <NotifListSkeleton count={4} />
                  ) : records.length > 0 ? (
                    <div className="space-y-3">
                      {records.map((record) => (
                        <article key={record.id} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >calendar_month</span>
                                {record.display_date} • {record.time}
                              </p>
                              <h3 className="mt-1 text-sm font-extrabold text-neutral-900">{record.type}</h3>
                              <p className="mt-0.5 text-xs font-semibold text-neutral-500">Psikolog: {record.psychologist}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                {record.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDownloadPDF(record.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-sm"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>download</span>
                                PDF
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 space-y-3">
                            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Keluhan / Isu</p>
                              <p className="mt-1 text-xs leading-relaxed text-neutral-700">{record.complaint}</p>
                            </div>
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-500">
                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >show_chart</span>
                                Observasi
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-blue-900">{record.observation}</p>
                            </div>
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >security</span>
                                Rekomendasi
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-emerald-900">{record.recommendation}</p>
                            </div>
                            {record.tindak_lanjut?.length > 0 && (
                              <div className="rounded-xl border border-neutral-100 bg-white p-3 shadow-sm">
                                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>assignment_turned_in</span>
                                  Tindak Lanjut Sesi
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {record.tindak_lanjut.map((t) => {
                                    const tindakChipConfig = {
                                      Tuntas: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                      Lanjutan: 'bg-blue-50 text-blue-700 border-blue-200',
                                      Rujuk: 'bg-amber-50 text-amber-700 border-amber-200',
                                    };
                                    return (
                                      <span key={t} className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                                        tindakChipConfig[t] || 'bg-neutral-50 text-neutral-600 border-neutral-200'
                                      }`}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>
                                          {t === 'Tuntas' ? 'check_circle' : t === 'Rujuk' ? 'local_hospital' : 'repeat'}
                                        </span>
                                        {t}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      size="sm"
                      icon="FileText"
                      iconColor="text-[bku-primary]"
                      iconBgClass="bg-[#eef4ff]"
                      iconBorderClass="border-[#c9d8ff]"
                      title="Belum Ada Rekam Medis"
                      description="Catatan rekam medis akan muncul setelah psikolog menyimpan catatan sesi."
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Total Tindak Lanjut</p>
                      <p className="mt-1 text-2xl font-extrabold text-[bku-primary]">{referrals.length}</p>
                    </div>
                    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Status Aktif</p>
                      <p className="mt-1 text-sm font-extrabold text-neutral-900">
                        {referrals.filter(r => r.status === 'Sent' || r.status === 'Received').length} Diproses
                      </p>
                    </div>
                  </div>

                  {isReferralsLoading ? (
                    <NotifListSkeleton count={3} />
                  ) : referrals.length > 0 ? (
                    <div className="space-y-3">
                      {referrals.map((ref) => {
                        const statusConfig = REFERRAL_STATUS_CONFIG[ref.status] || REFERRAL_STATUS_CONFIG.default;
                        return (
                          <article key={ref.id} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >calendar_month</span>
                                  {ref.display_date} • {ref.time}
                                </p>
                                <h3 className="mt-1 text-sm font-extrabold text-neutral-900">{ref.type}</h3>
                                <p className="mt-0.5 text-xs font-semibold text-neutral-500">Dari: {ref.psychologist}</p>
                              </div>
                              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                {ref.status === 'Sent' ? 'Dikirim' : ref.status === 'Received' ? 'Diterima' : ref.status}
                              </span>
                            </div>

                            <div className="mt-4 space-y-3">
                              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 font-bold">Pihak Penerima Rujukan</p>
                                <p className="mt-1 text-xs font-extrabold text-neutral-800">{ref.target_party}</p>
                                {ref.target_email && (
                                  <p className="text-[10px] text-neutral-500 mt-0.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>mail</span>
                                    {ref.target_email}
                                  </p>
                                )}
                              </div>

                              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 font-bold">Alasan / Rekomendasi Rujukan</p>
                                <p className="mt-1 text-xs leading-relaxed text-neutral-700">{ref.reason}</p>
                              </div>

                              {(ref.referral_pdf_url || ref.support_file_url) && (
                                <div className="flex gap-2 pt-1">
                                  {ref.referral_pdf_url && (
                                    <a
                                      href={getFullUrl(ref.referral_pdf_url)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-bold text-neutral-700 shadow-sm transition-all hover:bg-neutral-50"
                                    >
                                      <span className="material-symbols-outlined text-red-500 animate-pulse" style={{ fontSize: '16px' }} >picture_as_pdf</span>
                                      Unduh Surat Rujukan
                                    </a>
                                  )}
                                  {ref.support_file_url && (
                                    <a
                                      href={getFullUrl(ref.support_file_url)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-bold text-neutral-700 shadow-sm transition-all hover:bg-neutral-50"
                                    >
                                      <span className="material-symbols-outlined text-[bku-primary]" style={{ fontSize: '16px' }} >attachment</span>
                                      Berkas Pendukung
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      size="sm"
                      icon="ForwardToInbox"
                      iconColor="text-[bku-primary]"
                      iconBgClass="bg-[#eef4ff]"
                      iconBorderClass="border-[#c9d8ff]"
                      title="Belum Ada Tindak Lanjut"
                      description="Rujukan atau tindak lanjut khusus dari psikolog akan muncul di sini."
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── RESCHEDULE MODAL ── */}
      {rescheduleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>event_repeat</span>
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">Jadwalkan Ulang</h2>
                    <p className="text-[11px] text-blue-100">Ubah tanggal & waktu sesi konseling</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRescheduleItem(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Booking info */}
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Booking Saat Ini</p>
                <p className="mt-1 text-sm font-extrabold text-neutral-900">
                  {rescheduleItem.nama_konselor}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {formatLongDate(rescheduleItem.tanggal)} • {rescheduleItem.jam_mulai}
                  {rescheduleItem.jam_selesai ? ` - ${rescheduleItem.jam_selesai}` : ''}
                </p>
              </div>

              {/* Date input */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                  Tanggal Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Time inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                    Jam Mulai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={rescheduleStart}
                    onChange={(e) => setRescheduleStart(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={rescheduleEnd}
                    onChange={(e) => setRescheduleEnd(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <span className="material-symbols-outlined text-amber-500 mt-0.5 shrink-0" style={{ fontSize: '16px' }}>info</span>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Setelah reschedule, status booking akan kembali ke <strong>Menunggu</strong> dan psikolog perlu mengonfirmasi ulang jadwal baru.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRescheduleItem(null)}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleReschedule}
                  disabled={rescheduleMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
                >
                  {rescheduleMutation.isPending ? (
                    <>
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                      Simpan Jadwal Baru
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
