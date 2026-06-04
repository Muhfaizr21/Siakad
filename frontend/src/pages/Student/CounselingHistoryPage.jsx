import React, { useState } from 'react';

import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  useCancelBookingMutation,
  useCounselingMedicalRecordQuery,
  useCounselingRiwayatQuery,
  useCounselingReferralsQuery,
} from '../../queries/useCounselingQuery';
import { API_BASE_URL } from '../../services/api';

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

import { NotifListSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';

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

export default function CounselingHistoryPage() {
  const { data: history = [], isLoading: isHistoryLoading } = useCounselingRiwayatQuery();
  const { data: medicalRecord, isLoading: isMedicalLoading } = useCounselingMedicalRecordQuery();
  const { data: referrals = [], isLoading: isReferralsLoading } = useCounselingReferralsQuery();
  const [activeTab, setActiveTab] = useState('medical_record');
  const cancelMutation = useCancelBookingMutation();

  const records = medicalRecord?.records || [];
  const summary = medicalRecord?.summary || { total_records: 0, latest_status: 'Belum ada catatan' };
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
                              <h3 className="mt-1 text-sm font-extrabold text-neutral-900">{item.tipe}</h3>
                              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                                <User size={13} className="text-neutral-300" />
                                {item.nama_konselor}
                              </p>
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
                            {item.status === 'Menunggu' && (
                              <button
                                type="button"
                                onClick={() => handleCancel(item.id)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-rose-500 transition-all hover:bg-rose-50"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }} >delete</span>
                                Batalkan
                              </button>
                            )}
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
              <div className="flex gap-6 border-b border-neutral-100 pb-3">
                <button
                  onClick={() => setActiveTab('medical_record')}
                  className={`pb-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 -mb-3.5 ${
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
                  onClick={() => setActiveTab('referrals')}
                  className={`pb-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 -mb-3.5 ${
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
                  : 'Rujukan dan rekomendasi tindak lanjut penanganan dari psikolog.'}
              </p>
            </div>

            <div className="p-4">
              {activeTab === 'medical_record' ? (
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
                            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                              {record.status}
                            </span>
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
    </div>
  );
}
