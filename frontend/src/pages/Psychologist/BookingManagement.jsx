import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const SlidersHorizontal = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>tune</span>;
const RotateCcw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>restart_alt</span>;

const tabs = ['Semua', 'Menunggu', 'Dikonfirmasi', 'Selesai', 'Ditolak'];
const statusMeta = {
  Menunggu: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  Dikonfirmasi: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  Selesai: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Ditolak: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export default function BookingManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [issueFilter, setIssueFilter] = useState('Semua Topik');
  const [sortOrder, setSortOrder] = useState('Terbaru');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);

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

    return () => { ignore = true; };
  }, []);

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
      const raw = `${booking.date || ''} ${booking.time || ''}`;
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

        return matchesTab && matchesIssue && matchesSearch;
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
  }, [bookings, issueFilter, searchQuery, selectedTab, sortOrder]);

  const hasActiveFilter = selectedTab !== 'Semua' || issueFilter !== 'Semua Topik' || searchQuery.trim();

  const resetFilters = () => {
    setSelectedTab('Semua');
    setIssueFilter('Semua Topik');
    setSearchQuery('');
    setSortOrder('Terbaru');
  };

  const handleAction = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await psychologistService.updateBookingStatus(id, newStatus);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-body">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="lg:ml-64 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 px-6 lg:px-10 pb-12 w-full relative space-y-8 scroll-smooth">
          
          {/* Welcome Banner Card (White-to-Blue Gradient with University Overlay look) */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-white via-slate-50/50 to-blue-50/20 border border-slate-100 p-8 shadow-sm flex flex-col gap-6 group">
            {/* Background elements */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 w-full flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined size-3.5">assignment</span>
                  Manajemen Booking
                </div>
                <h1 className="mt-3 text-2xl font-black text-primary uppercase tracking-tight font-headline">Janji Temu Konseling</h1>
                <p className="text-xs font-bold leading-5 text-slate-500">
                  Pantau, cari, dan tindak lanjuti permintaan sesi konseling baru untuk mempercepat penyelesaian bantuan psikologis mahasiswa.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xl:min-w-[560px] shrink-0">
                {tabs.slice(1).map((status) => (
                  <div key={status} className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${statusMeta[status]?.dot || 'bg-slate-300'}`} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{status}</span>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight leading-none">{statusCounts[status] || 0}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Search & Filter Bento Card */}
          <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                <div className="flex-1 space-y-2">
                  <label htmlFor="booking-search" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="material-symbols-outlined text-base" >search</span>
                    Pencarian
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" >search</span>
                    <input
                      id="booking-search"
                      type="text"
                      placeholder="Cari nama, NIM, isu, tanggal, atau catatan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:w-[430px] gap-4">
                  <div className="space-y-2">
                    <label htmlFor="issue-filter" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="material-symbols-outlined text-base">filter_alt</span>
                      Topik
                    </label>
                    <select
                      id="issue-filter"
                      value={issueFilter}
                      onChange={(e) => setIssueFilter(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-xs font-bold text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 cursor-pointer"
                    >
                      {issueOptions.map((issue) => (
                        <option key={issue} value={issue}>{issue}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="sort-order" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <SlidersHorizontal className="size-3.5" />
                      Urutan
                    </label>
                    <select
                      id="sort-order"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-xs font-bold text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 cursor-pointer"
                    >
                      <option value="Terbaru">Jadwal terbaru</option>
                      <option value="Terlama">Jadwal terlama</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`
                        inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all
                        ${selectedTab === tab
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-primary/30 hover:text-primary hover:bg-white'}
                      `}
                    >
                      {tab}
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold ${selectedTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {statusCounts[tab] || 0}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilter}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw className="size-3.5" />
                  Reset Filter
                </button>
              </div>
            </div>
          </section>

          {/* Booking Floating Row Cards (Desktop & Mobile) */}
          <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex flex-col gap-2 border-b border-slate-50 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-primary">Daftar Booking</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{filteredBookings.length} dari {bookings.length} permintaan ditampilkan</p>
              </div>
              {hasActiveFilter && (
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined size-3">filter_alt</span>
                  Filter aktif
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-400">
                <span className="material-symbols-outlined size-8 animate-spin text-primary/50" >sync</span>
                <p className="text-[10px] font-black uppercase tracking-widest">Memuat data booking...</p>
              </div>
            ) : error ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-[1.5rem] bg-rose-50 text-rose-600">
                  <span className="material-symbols-outlined size-7" >error</span>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h3)' }}>Data belum bisa dimuat</h3>
                  <p className="mt-1 max-w-md text-xs font-semibold text-slate-500">{error}</p>
                </div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-300">
                  <span className="material-symbols-outlined size-7">assignment</span>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h3)' }}>Tidak ada booking yang cocok</h3>
                  <p className="mt-1 max-w-md text-xs font-semibold text-slate-500">Coba ubah kata kunci, status, atau topik filter untuk menampilkan data lain.</p>
                </div>
                {hasActiveFilter && (
                  <button onClick={resetFilters} className="rounded-2xl bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-primary/90">
                    Tampilkan Semua
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Floating Card Row Grid */}
                <div className="hidden lg:block space-y-3.5">
                  {filteredBookings.map((booking) => {
                    const status = booking.status || 'Menunggu';
                    const isUpdating = updatingId === booking.id;

                    return (
                      <div 
                        key={booking.id} 
                        onClick={() => navigate(`/psychologist/bookings/${booking.id}`)} 
                        className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md hover:border-slate-200/50 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-[1.25rem] bg-primary/5 text-primary flex items-center justify-center font-black text-xs group-hover:scale-105 transition-transform duration-300 shrink-0 shadow-inner">
                          {booking.avatar || booking.name?.charAt(0) || 'M'}
                        </div>
                        <div className="w-[200px] shrink-0">
                          <p className="truncate text-xs font-black text-slate-900">{booking.name || 'Mahasiswa'}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">NIM {booking.nim || '-'}</p>
                        </div>
                        <div className="flex-1 min-w-0 px-4">
                          <p className="text-xs font-black uppercase tracking-tight text-slate-700">{booking.issue || 'Belum ada topik'}</p>
                          <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500 italic">"{booking.note || 'Tidak ada catatan tambahan.'}"</p>
                        </div>
                        <div className="px-4 shrink-0 w-[180px]">
                          <div className="flex items-center gap-2 whitespace-nowrap text-xs font-black text-slate-800">
                            <span className="material-symbols-outlined size-4 text-primary" >calendar_month</span>
                            {booking.date || '-'}
                          </div>
                          <div className="flex items-center gap-2 whitespace-nowrap text-[11px] font-bold text-slate-400 mt-1">
                            <span className="material-symbols-outlined size-4" >schedule</span>
                            {booking.time || '-'}
                          </div>
                        </div>
                        <div className="px-4 shrink-0 w-[150px]">
                          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${statusMeta[status]?.badge || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                            <span className={`size-1.5 rounded-full ${statusMeta[status]?.dot || 'bg-slate-400'}`} />
                            {status}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-2 shrink-0">
                          {status === 'Menunggu' ? (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                title="Tolak booking"
                                aria-label={`Tolak booking ${booking.name || 'mahasiswa'}`}
                                onClick={(e) => { e.stopPropagation(); handleAction(booking.id, 'Ditolak'); }}
                                className="inline-flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-all hover:bg-rose-600 hover:text-white disabled:cursor-wait disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >close</span>
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                title="Konfirmasi booking"
                                aria-label={`Konfirmasi booking ${booking.name || 'mahasiswa'}`}
                                onClick={(e) => { e.stopPropagation(); handleAction(booking.id, 'Dikonfirmasi'); }}
                                className="inline-flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-all hover:bg-primary/95 disabled:cursor-wait disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >check_circle</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); navigate(`/psychologist/bookings/${booking.id}`); }}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-primary/30 hover:text-primary"
                            >
                              Detail
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Listing */}
                <div className="grid gap-3.5 lg:hidden">
                  {filteredBookings.map((booking) => {
                    const status = booking.status || 'Menunggu';
                    const isUpdating = updatingId === booking.id;

                    return (
                      <article
                        key={booking.id}
                        onClick={() => navigate(`/psychologist/bookings/${booking.id}`)}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all active:scale-[0.99]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700">
                            {booking.avatar || booking.name?.charAt(0) || 'M'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-black font-headline" style={{ color: 'var(--theme-h3)' }}>{booking.name || 'Mahasiswa'}</h3>
                            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">NIM {booking.nim || '-'}</p>
                          </div>
                          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${statusMeta[status]?.badge || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                            <span className={`size-1.5 rounded-full ${statusMeta[status]?.dot || 'bg-slate-400'}`} />
                            {status}
                          </span>
                        </div>

                        <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs font-black uppercase tracking-tight text-slate-700">{booking.issue || 'Belum ada topik'}</p>
                          <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-500">{booking.note || 'Tidak ada catatan tambahan dari mahasiswa.'}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="space-y-1">
                            <p className="flex items-center gap-2 text-xs font-black text-slate-800"><span className="material-symbols-outlined size-4 text-primary" >calendar_month</span> {booking.date || '-'}</p>
                            <p className="flex items-center gap-2 text-[11px] font-bold text-slate-400"><span className="material-symbols-outlined size-4" >schedule</span> {booking.time || '-'}</p>
                          </div>

                          {status === 'Menunggu' ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label={`Tolak booking ${booking.name || 'mahasiswa'}`}
                                disabled={isUpdating}
                                onClick={(e) => { e.stopPropagation(); handleAction(booking.id, 'Ditolak'); }}
                                className="inline-flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-all active:scale-95 disabled:cursor-wait disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >close</span>
                              </button>
                              <button
                                type="button"
                                aria-label={`Konfirmasi booking ${booking.name || 'mahasiswa'}`}
                                disabled={isUpdating}
                                onClick={(e) => { e.stopPropagation(); handleAction(booking.id, 'Dikonfirmasi'); }}
                                className="inline-flex size-10 items-center justify-center rounded-xl bg-primary text-white transition-all active:scale-95 disabled:cursor-wait disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >check_circle</span>
                              </button>
                            </div>
                          ) : (
                            <span className="material-symbols-outlined size-5 text-slate-300">chevron_right</span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
