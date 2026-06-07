import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenagaKesehatanService } from '../../services/api';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';

const SlidersHorizontal = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 20, ...props.style }} {...props}>
    tune
  </span>
);
const RotateCcw = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 20, ...props.style }} {...props}>
    restart_alt
  </span>
);

const tabs = ['Semua', 'Menunggu', 'Dikonfirmasi', 'Selesai', 'Ditolak'];
const statusMeta = {
  'Menunggu Konfirmasi': {
    badge: 'bg-amber-500/10 text-amber-600 border border-amber-500/25',
    dot: 'bg-amber-500',
    label: 'Menunggu'
  },
  'Menunggu': {
    badge: 'bg-amber-500/10 text-amber-600 border border-amber-500/25',
    dot: 'bg-amber-500',
    label: 'Menunggu'
  },
  'Dikonfirmasi': {
    badge: 'bg-blue-500/10 text-blue-600 border border-blue-500/25',
    dot: 'bg-blue-500',
    label: 'Dikonfirmasi'
  },
  'Selesai': {
    badge: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25',
    dot: 'bg-emerald-500',
    label: 'Selesai'
  },
  'Ditolak': {
    badge: 'bg-rose-500/10 text-rose-600 border border-rose-500/25',
    dot: 'bg-rose-500',
    label: 'Ditolak'
  },
};

export default function BookingManagement() {
  const [selectedTab, setSelectedTab] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  
  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingBookingId, setRejectingBookingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  
  // Extra filter states
  const [selectedFaculty, setSelectedFaculty] = useState('Semua Fakultas');
  const [selectedService, setSelectedService] = useState('Semua Layanan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = () => {
    setLoading(true);
    tenagaKesehatanService.getBookings()
      .then((res) => {
        setBookings(res.data || []);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat data booking.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Faculty and Service options for dropdown filters
  const facultyOptions = useMemo(() => {
    const facs = bookings.map(b => b.faculty).filter(Boolean);
    return ['Semua Fakultas', ...Array.from(new Set(facs))];
  }, [bookings]);

  const serviceOptions = useMemo(() => {
    const servs = bookings.map(b => b.tipe_layanan).filter(Boolean);
    return ['Semua Layanan', ...Array.from(new Set(servs))];
  }, [bookings]);

  // Standardize backend status string to tab values
  const getNormalizedStatus = (statusStr) => {
    if (!statusStr) return 'Menunggu';
    if (statusStr === 'Menunggu Konfirmasi') return 'Menunggu';
    return statusStr;
  };

  const statusCounts = useMemo(() => {
    return tabs.reduce((acc, tab) => {
      acc[tab] = tab === 'Semua'
        ? bookings.length
        : bookings.filter((b) => getNormalizedStatus(b.status) === tab).length;
      return acc;
    }, {});
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        const normalizedStatus = getNormalizedStatus(booking.status);
        const searchable = [
          booking.name,
          booking.nim,
          booking.tipe_layanan,
          booking.note,
        ].filter(Boolean).join(' ').toLowerCase();

        const matchesTab = selectedTab === 'Semua' || normalizedStatus === selectedTab;
        const matchesService = selectedService === 'Semua Layanan' || booking.tipe_layanan === selectedService;
        const matchesFaculty = selectedFaculty === 'Semua Fakultas' || booking.faculty === selectedFaculty;
        const matchesSearch = !query || searchable.includes(query);
        
        const bookingDate = booking.raw_date || '';
        const matchesStartDate = !startDate || (bookingDate && bookingDate >= startDate);
        const matchesEndDate = !endDate || (bookingDate && bookingDate <= endDate);

        return matchesTab && matchesService && matchesFaculty && matchesSearch && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => {
        // Sort by raw date and time descending/ascending (Newest first)
        const dateA = a.raw_date || '';
        const dateB = b.raw_date || '';
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return (a.time || '').localeCompare(b.time || '');
      });
  }, [bookings, selectedTab, selectedService, selectedFaculty, searchQuery, startDate, endDate]);

  const hasActiveFilter = selectedTab !== 'Semua' || selectedService !== 'Semua Layanan' || selectedFaculty !== 'Semua Fakultas' || searchQuery.trim() || startDate || endDate;

  const resetFilters = () => {
    setSelectedTab('Semua');
    setSelectedService('Semua Layanan');
    setSelectedFaculty('Semua Fakultas');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  const handleAction = async (id, newStatus, reason = '') => {
    setUpdatingId(id);
    try {
      await tenagaKesehatanService.updateBookingStatus(id, newStatus, reason);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus, alasan_penolakan: reason } : b));
      setShowRejectModal(false);
      setRejectingBookingId(null);
      setRejectionReason('');
    } catch (err) {
      alert(err.message || 'Gagal mengubah status booking.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectingBookingId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      alert('Harap masukkan alasan penolakan.');
      return;
    }
    handleAction(rejectingBookingId, 'Ditolak', rejectionReason);
  };

  return (
    <PageContent>
        
      <DashboardHero
        title="Janji Temu"
        highlightedTitle="Medis"
        subtitle="Kelola pendaftaran booking online mahasiswa untuk pemeriksaan umum, screening fisik, dan konsultasi kesehatan di Klinik Kampus."
        icon="calendar_month"
        badges={[
          { label: 'Layanan Kesehatan', active: true },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xl:min-w-[480px] shrink-0">
              {tabs.slice(1).map((status) => {
                const normalizedKey = status === 'Menunggu' ? 'Menunggu Konfirmasi' : status;
                const meta = statusMeta[normalizedKey] || statusMeta[status];
                return (
                  <div key={status} className="rounded-2xl border border-slate-200/50 bg-white/70 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${meta?.dot || 'bg-slate-300'}`} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{status}</span>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-slate-800 tracking-tight leading-none">
                      {statusCounts[status] || 0}
                    </p>
                  </div>
                );
              })}
            </div>
        {/* Filter Bento Card */}
        <section className="rounded-2xl border border-slate-200/60 bg-white/70 p-5 shadow-sm glass-card">
          <div className="flex flex-col gap-5">
            {/* Row 1: Search and Selection Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">
                  <span className="material-symbols-outlined text-sm">search</span>
                  Cari Mahasiswa
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                  <input
                    type="text"
                    placeholder="Nama, NIM, atau keluhan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-bku-primary focus:bg-white focus:ring-4 focus:ring-bku-primary/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">
                  <span className="material-symbols-outlined text-sm">medical_services</span>
                  Tipe Layanan
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-700 outline-none transition-all focus:border-bku-primary focus:bg-white focus:ring-4 focus:ring-bku-primary/5 cursor-pointer"
                >
                  {serviceOptions.map((serv) => (
                    <option key={serv} value={serv}>{serv}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">
                  <span className="material-symbols-outlined text-sm">domain</span>
                  Asal Fakultas
                </label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-700 outline-none transition-all focus:border-bku-primary focus:bg-white focus:ring-4 focus:ring-bku-primary/5 cursor-pointer"
                >
                  {facultyOptions.map((fac) => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-700 outline-none transition-all focus:border-bku-primary focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-700 outline-none transition-all focus:border-bku-primary focus:bg-white"
                />
              </div>

              <div className="flex items-end justify-end pb-0.5">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilter}
                  className="h-12 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 hover:text-bku-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw className="size-4" />
                  Reset Filter
                </button>
              </div>
            </div>

            {/* Row 3: Tab selectors */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-100 pt-4 pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`
                    inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all duration-200
                    ${selectedTab === tab
                      ? 'border-bku-primary bg-bku-primary text-white shadow-sm hover:bg-bku-hover'
                      : 'border-slate-200 bg-white text-slate-400 hover:border-bku-primary/30 hover:text-bku-primary'}
                  `}
                >
                  {tab}
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold ${selectedTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {statusCounts[tab] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Cards List */}
        <section className="bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4 glass-card">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-bku-primary font-headline">Daftar Pengajuan Masuk</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1">{filteredBookings.length} dari {bookings.length} permintaan ditampilkan</p>
            </div>
            {hasActiveFilter && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-bku-primary/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-bku-primary">
                <span className="material-symbols-outlined text-[10px]">filter_alt</span>
                Filter aktif
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-400">
              <span className="material-symbols-outlined text-4xl animate-spin text-bku-primary/50">sync</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Memuat data booking...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
                <span className="material-symbols-outlined text-2xl">error</span>
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight font-headline text-slate-800">Gagal memuat data</h3>
                <p className="mt-1 max-w-md text-xs font-semibold text-slate-500">{error}</p>
              </div>
              <button onClick={loadData} className="px-4 py-2 bg-bku-primary hover:bg-bku-hover text-white text-xs font-semibold rounded-xl transition-all">
                Coba Lagi
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-300">
                <span className="material-symbols-outlined text-2xl">assignment</span>
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight font-headline text-slate-700">Tidak ada data booking</h3>
                <p className="mt-1 max-w-md text-xs font-semibold text-slate-500">
                  {hasActiveFilter 
                    ? 'Coba ubah filter pencarian untuk menemukan data yang Anda cari.' 
                    : 'Belum ada antrean pendaftaran booking kesehatan yang diajukan mahasiswa.'}
                </p>
              </div>
              {hasActiveFilter && (
                <button onClick={resetFilters} className="rounded-xl bg-bku-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-bku-hover">
                  Tampilkan Semua
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const normalizedStatus = getNormalizedStatus(booking.status);
                const isUpdating = updatingId === booking.id;
                const meta = statusMeta[booking.status] || statusMeta[normalizedStatus] || {
                  badge: 'border-slate-200 bg-slate-50 text-slate-600',
                  dot: 'bg-slate-400',
                  label: booking.status
                };

                return (
                  <div 
                    key={booking.id} 
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-200/50 hover:bg-white hover:shadow-md hover:border-bku-primary/20 transition-all duration-300 gap-4"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-4 min-w-0 lg:w-[280px] shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-bku-primary/5 text-bku-primary border border-bku-primary/10 flex items-center justify-center font-black text-sm uppercase shrink-0">
                        {booking.avatar || (booking.name ? booking.name.slice(0, 2) : 'MH')}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 truncate uppercase tracking-tight">{booking.name || 'Mahasiswa'}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider">NIM {booking.nim || '-'}</p>
                        <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-tight truncate mt-0.5">{booking.prodi} ({booking.faculty})</p>
                      </div>
                    </div>

                    {/* Booking Request Info */}
                    <div className="flex-1 min-w-0 lg:px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-bku-primary/5 text-bku-primary border border-bku-primary/10 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {booking.tipe_layanan}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${meta.badge}`}>
                          <span className={`size-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-slate-600 line-clamp-2">
                        <strong className="text-slate-700 font-bold">Keluhan: </strong> 
                        {booking.note ? `"${booking.note}"` : 'Tidak ada catatan keluhan.'}
                      </p>
                      {booking.alasan_penolakan && (
                        <p className="mt-1 text-[10px] font-bold text-rose-500">
                          Alasan Penolakan: "{booking.alasan_penolakan}"
                        </p>
                      )}
                    </div>

                    {/* Time details */}
                    <div className="lg:px-4 shrink-0 lg:w-[180px] flex flex-row lg:flex-col justify-between lg:justify-center border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span className="material-symbols-outlined text-slate-400 text-sm">calendar_month</span>
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mt-0.5">
                        <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                        <span>{booking.time}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0 shrink-0">
                      {normalizedStatus === 'Menunggu' && (
                        <>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => openRejectModal(booking.id)}
                            className="h-10 px-4 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">close</span> Tolak
                          </button>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleAction(booking.id, 'Dikonfirmasi')}
                            className="h-10 px-4 bg-bku-primary hover:bg-bku-hover text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm shadow-bku-primary/5"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span> Setujui
                          </button>
                        </>
                      )}

                      {normalizedStatus === 'Dikonfirmasi' && (
                        <button
                          type="button"
                          onClick={() => navigate(`/tenagakes/patients/${booking.mahasiswa_id}/medical-record?booking_id=${booking.id}`)}
                          className="h-10 px-4 bg-bku-primary hover:bg-bku-hover text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">medical_services</span> Mulai Screening
                        </button>
                      )}

                      {normalizedStatus === 'Selesai' && (
                        <button
                          type="button"
                          onClick={() => navigate(`/tenagakes/patients/${booking.mahasiswa_id}/medical-record`)}
                          className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">history</span> Rekam Medis
                        </button>
                      )}

                      {normalizedStatus === 'Ditolak' && (
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-3">
                          Ditolak
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-bku-primary px-6 py-5 text-white">
              <h3 className="text-base font-bold uppercase tracking-tight font-headline">Tolak Pengajuan Booking</h3>
              <p className="text-xs text-white/70 mt-1">Harap berikan alasan penolakan agar mahasiswa mengetahui kendala jadwal atau layanan.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Alasan Penolakan</label>
                <textarea
                  placeholder="Misal: Petugas sedang ada agenda kedinasan, silakan pilih slot waktu lain..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-bku-primary focus:ring-4 focus:ring-bku-primary/5"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowRejectModal(false); setRejectingBookingId(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleRejectConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
                >
                  Tolak Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </PageContent>
  );
}
