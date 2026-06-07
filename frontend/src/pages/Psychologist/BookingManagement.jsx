import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { psychologistService } from '../../services/api';

const tabs = ['Semua', 'Menunggu', 'Dikonfirmasi', 'Selesai', 'Ditolak'];
const statusMeta = {
  Menunggu: {
    dot: 'bg-amber-400',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-600',
    badgeBorder: 'border-amber-100',
  },
  Dikonfirmasi: {
    dot: 'bg-blue-400',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-600',
    badgeBorder: 'border-blue-100',
  },
  Selesai: {
    dot: 'bg-emerald-400',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-600',
    badgeBorder: 'border-emerald-100',
  },
  Ditolak: {
    dot: 'bg-rose-400',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-600',
    badgeBorder: 'border-rose-100',
  },
};

export default function BookingManagement() {
  const [selectedTab, setSelectedTab] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [issueFilter, setIssueFilter] = useState('Semua Topik');
  const [sortOrder, setSortOrder] = useState('Terbaru');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [pendingConfirmId, setPendingConfirmId] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [fakultasList, setFakultasList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [selectedFakultas, setSelectedFakultas] = useState('Semua Fakultas');
  const [selectedProdi, setSelectedProdi] = useState('Semua Prodi');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    let ignore = false;

    psychologistService.getBookings()
      .then((res) => {
        if (!ignore) setBookings(res.data || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Gagal memuat data booking.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    psychologistService.getFakultasList().then((res) => {
      if (!ignore) setFakultasList(res.data || []);
    });
    psychologistService.getProdiList().then((res) => {
      if (!ignore) setProdiList(res.data || []);
    });

    return () => { ignore = true; };
  }, []);

  const filteredProdis = useMemo(() => {
    if (selectedFakultas === 'Semua Fakultas') return [];
    const selectedFak = fakultasList.find(f => f.nama === selectedFakultas);
    if (!selectedFak) return [];
    return prodiList.filter(p => p.fakultas_id === selectedFak.id);
  }, [selectedFakultas, prodiList, fakultasList]);

  const handleFakultasChange = (val) => {
    setSelectedFakultas(val);
    setSelectedProdi('Semua Prodi');
  };

  const issueOptions = useMemo(() => {
    const issues = bookings
      .map((booking) => booking.issue)
      .filter(Boolean);
    return ['Semua Topik', ...Array.from(new Set(issues))];
  }, [bookings]);

  const statusCounts = useMemo(() => {
    return tabs.reduce((acc, tab) => {
      acc[tab] = tab === 'Semua'
        ? bookings.length
        : bookings.filter((booking) => booking.status === tab).length;
      return acc;
    }, {});
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const getScheduleTime = (booking) => {
      const raw = `${booking.raw_date || booking.date || ''} ${booking.time || ''}`;
      const parsed = Date.parse(raw);
      return Number.isNaN(parsed) ? raw : parsed;
    };

    return bookings
      .filter((booking) => {
        const status = booking.status || 'Menunggu';
        const searchable = [
          booking.name,
          booking.nim,
          booking.issue,
          booking.date,
          booking.time,
          booking.note,
        ].filter(Boolean).join(' ').toLowerCase();

        const matchesTab = selectedTab === 'Semua' || status === selectedTab;
        const matchesIssue = issueFilter === 'Semua Topik' || booking.issue === issueFilter;
        const matchesSearch = !query || searchable.includes(query);
        const matchesFakultas = selectedFakultas === 'Semua Fakultas' || booking.faculty === selectedFakultas;
        const matchesProdi = selectedProdi === 'Semua Prodi' || booking.prodi === selectedProdi;
        
        const bookingRawDate = booking.raw_date || (booking.date ? new Date(booking.date).toISOString().split('T')[0] : '');
        const matchesStartDate = !startDate || (bookingRawDate && bookingRawDate >= startDate);
        const matchesEndDate = !endDate || (bookingRawDate && bookingRawDate <= endDate);

        return matchesTab && matchesIssue && matchesSearch && matchesFakultas && matchesProdi && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => {
        const first = getScheduleTime(a);
        const second = getScheduleTime(b);
        if (typeof first === 'number' && typeof second === 'number') {
          return sortOrder === 'Terbaru' ? second - first : first - second;
        }
        return sortOrder === 'Terbaru'
          ? String(second).localeCompare(String(first))
          : String(first).localeCompare(String(second));
      });
  }, [bookings, issueFilter, searchQuery, selectedTab, sortOrder, selectedFakultas, selectedProdi, startDate, endDate]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  
  // Reset to page 1 if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredBookings.length, itemsPerPage]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const hasActiveFilter = selectedTab !== 'Semua' || issueFilter !== 'Semua Topik' || searchQuery.trim() || selectedFakultas !== 'Semua Fakultas' || selectedProdi !== 'Semua Prodi' || startDate || endDate;

  const resetFilters = () => {
    setSelectedTab('Semua');
    setIssueFilter('Semua Topik');
    setSearchQuery('');
    setSelectedFakultas('Semua Fakultas');
    setSelectedProdi('Semua Prodi');
    setStartDate('');
    setEndDate('');
    setSortOrder('Terbaru');
  };

  const handleAction = async (id, newStatus, link = '') => {
    setUpdatingId(id);
    try {
      await psychologistService.updateBookingStatus(id, newStatus, '', link);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus, link_meeting: link } : b));
    } catch (err) {
      alert(err.message || 'Gagal mengubah status booking.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmClick = (booking) => {
    if (booking.mode === 'Online') {
      setPendingConfirmId(booking.id);
      setMeetingLink('');
      setShowLinkModal(true);
    } else {
      handleAction(booking.id, 'Dikonfirmasi');
    }
  };

  const submitConfirmWithLink = () => {
    if (!meetingLink.trim()) {
      alert('Harap masukkan link meeting Zoom/Google Meet');
      return;
    }
    setShowLinkModal(false);
    handleAction(pendingConfirmId, 'Dikonfirmasi', meetingLink);
    setPendingConfirmId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Memuat Data Booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative space-y-6 min-h-screen bg-transparent font-inter pb-8">
      
      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col xl:flex-row xl:items-center gap-6 group shadow-sm border border-slate-200/60 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-slate-50/80" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-20 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl" />

        <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm relative overflow-hidden">
                <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '26px' }}>event_available</span>
             </div>
             <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                    Manajemen Booking
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                  Janji Temu Konseling
                </h1>
                <p className="mt-2 text-xs md:text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
                  Pantau, cari, dan tindak lanjuti permintaan sesi konseling baru untuk mempercepat penyelesaian bantuan psikologis mahasiswa.
                </p>
             </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 xl:min-w-[420px] w-full xl:w-auto shrink-0 border-t xl:border-t-0 xl:border-l border-slate-100 pt-4 xl:pt-0 xl:pl-6">
          {tabs.slice(1).map((status) => (
            <div key={status} className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusMeta[status]?.dot}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{status}</span>
              </div>
              <p className="text-2xl font-extrabold tracking-tight leading-none text-slate-800 tabular-nums">{statusCounts[status] || 0}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Search & Filter Bento ────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 relative overflow-hidden">
        <div className="flex flex-col gap-5 relative z-10">
          {/* Row 1: Search, Topik, Urutan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="material-symbols-outlined text-base">search</span>
                Pencarian
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  type="text"
                  placeholder="Cari nama, NIM, isu, atau tanggal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="material-symbols-outlined text-base">filter_alt</span>
                Topik
              </label>
              <select
                value={issueFilter}
                onChange={(e) => setIssueFilter(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 cursor-pointer"
              >
                {issueOptions.map((issue) => (
                  <option key={issue} value={issue}>{issue}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="material-symbols-outlined text-base">sort</span>
                Urutan
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 cursor-pointer"
              >
                <option value="Terbaru">Jadwal terbaru</option>
                <option value="Terlama">Jadwal terlama</option>
              </select>
            </div>
          </div>

          {/* Row 2: Fakultas, Prodi, Range Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 border-t border-slate-100 pt-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="material-symbols-outlined text-base">domain</span>
                Fakultas
              </label>
              <select
                value={selectedFakultas}
                onChange={(e) => handleFakultasChange(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 cursor-pointer"
              >
                <option value="Semua Fakultas">Semua Fakultas</option>
                {fakultasList.map((f) => (
                  <option key={f.id} value={f.nama}>{f.nama}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="material-symbols-outlined text-base">school</span>
                Program Studi
              </label>
              <select
                value={selectedProdi}
                onChange={(e) => setSelectedProdi(e.target.value)}
                disabled={selectedFakultas === 'Semua Fakultas'}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="Semua Prodi">Semua Prodi</option>
                {filteredProdis.map((p) => (
                  <option key={p.id} value={p.nama}>{p.nama}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="material-symbols-outlined text-base">event</span>
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="material-symbols-outlined text-base">event</span>
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`
                    inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all
                    ${selectedTab === tab
                      ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/50 hover:bg-primary/5 hover:text-primary'}
                  `}
                >
                  {tab}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${selectedTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {statusCounts[tab] || 0}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilter}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Reset Filter
            </button>
          </div>
        </div>
      </section>

      {/* ── Booking List ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-5 relative overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 font-headline">Daftar Booking</h2>
            <p className="text-[10px] font-bold text-slate-500 mt-1">Total {filteredBookings.length} permintaan ditemukan</p>
          </div>
          {hasActiveFilter && (
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[14px]">filter_alt</span>
              Filter aktif
            </span>
          )}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
            <div className="flex w-20 h-20 items-center justify-center rounded-[1.5rem] bg-slate-50 border border-slate-100 text-slate-300">
              <span className="material-symbols-outlined text-[40px]">assignment</span>
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-slate-800 font-headline">Tidak ada booking</h3>
              <p className="mt-1.5 text-sm font-medium text-slate-500">Coba ubah filter atau kata kunci untuk menampilkan data lain.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedBookings.map((booking) => {
              const status = booking.status || 'Menunggu';
              const isUpdating = updatingId === booking.id;
              const statusCfg = statusMeta[status] || statusMeta['Menunggu'];

              return (
                <div 
                  key={booking.id} 
                  onClick={() => navigate(`/psychologist/bookings/${booking.id}`)} 
                  className={`flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-primary/40 bg-white transition-all duration-300 group cursor-pointer hover:shadow-md hover:shadow-primary/5 ${status === 'Selesai' ? 'opacity-70 grayscale-[30%]' : ''}`}
                >
                  <div className="flex items-center gap-3 lg:w-[280px] shrink-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm group-hover:scale-105 transition-transform duration-300 shrink-0 bg-primary/10 text-primary border border-primary/20">
                      {booking.avatar || booking.name?.charAt(0) || 'M'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-slate-900 group-hover:text-primary transition-colors">{booking.name || 'Mahasiswa'}</p>
                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">NIM {booking.nim || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 lg:px-4 lg:border-l border-slate-100">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-tight text-slate-800">{booking.issue || 'Topik Umum'}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                        booking.mode === 'Online' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        <span className="material-symbols-outlined !text-[12px] shrink-0">{booking.mode === 'Online' ? 'videocam' : 'groups'}</span>
                        {booking.mode || 'Tatap Muka'}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[10px] font-medium text-slate-500 italic">"{booking.note || 'Tidak ada catatan tambahan.'}"</p>
                  </div>
                  
                  <div className="flex flex-row items-center justify-between lg:justify-end gap-5 lg:shrink-0">
                    <div className="text-left lg:text-right">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-800">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0">calendar_month</span>
                        {booking.date || '-'}
                      </div>
                      <div className="flex items-center lg:justify-end gap-1.5 text-[10px] font-bold text-slate-500 mt-1">
                        <span className="material-symbols-outlined text-[14px] shrink-0">schedule</span>
                        {booking.time || '-'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${statusCfg.badgeBg} ${statusCfg.badgeText} ${statusCfg.badgeBorder}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {status}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {status === 'Menunggu' ? (
                          <>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={(e) => { e.stopPropagation(); handleAction(booking.id, 'Ditolak'); }}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:scale-110 transition-all disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={(e) => { e.stopPropagation(); handleConfirmClick(booking); }}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 hover:scale-110 shadow-sm transition-all disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </button>
                          </>
                        ) : (
                          <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination Controls ──────────────────────────────────── */}
        {filteredBookings.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tampilkan:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-[10px] font-bold text-slate-400">data per halaman</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="text-xs font-bold text-slate-600 px-2">
                Hal {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Zoom / Meeting Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-gradient-to-br from-primary to-blue-700 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <h3 className="text-xl font-black uppercase tracking-tight font-headline relative z-10">Sesi Online</h3>
              <p className="text-xs text-blue-100 mt-2 relative z-10 font-medium">Harap masukkan link Zoom atau Google Meet untuk mahasiswa.</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Link Meeting</label>
                <input
                  type="text"
                  placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowLinkModal(false); setPendingConfirmId(null); }}
                  className="flex-1 h-12 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={submitConfirmWithLink}
                  className="flex-1 h-12 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
