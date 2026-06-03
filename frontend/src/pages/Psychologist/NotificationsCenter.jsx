import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Bell = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>notifications</span>;



const iconByType = {
  booking: 'calendar_month',
  assessment: 'assignment',
  alert: 'error',
  report: 'check_circle',
};

const colorByType = {
  booking: 'bg-primary',
  assessment: 'bg-indigo-500',
  alert: 'bg-rose-500',
  report: 'bg-emerald-500',
};

export default function NotificationsCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await psychologistService.getNotifications();
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.message || 'Gagal memuat notifikasi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    psychologistService
      .getNotifications()
      .then((res) => {
        if (mounted) setNotifications(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (mounted) setError(err?.message || 'Gagal memuat notifikasi.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const markRead = async (id) => {
    setBusyId(`read-${id}`);
    try {
      await psychologistService.markNotificationRead(id);
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)));
    } catch (err) {
      setError(err?.message || 'Gagal menandai notifikasi.');
    } finally {
      setBusyId('');
    }
  };

  const markAllRead = async () => {
    setBusyId('read-all');
    try {
      await psychologistService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
    } catch (err) {
      setError(err?.message || 'Gagal menandai semua notifikasi.');
    } finally {
      setBusyId('');
    }
  };

  const deleteNotification = async (id) => {
    setBusyId(`delete-${id}`);
    try {
      await psychologistService.deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err?.message || 'Gagal menghapus notifikasi.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className={`${UI.layout.canvas} space-y-6`}>
          <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >notifications</span>
                  {unreadCount} Belum Dibaca
                </div>
                <h1 className="font-headline text-2xl font-black uppercase tracking-tight text-primary">Pusat Notifikasi</h1>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Data tersimpan di `psikolog.notifications` dan diperbarui langsung dari database.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:text-primary disabled:cursor-wait disabled:opacity-60"
                >
                  {loading ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>sync</span>}
                  Muat Ulang
                </button>
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={!unreadCount || busyId === 'read-all'}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {busyId === 'read-all' ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>}
                  Tandai Semua Dibaca
                </button>
              </div>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700">
              <span className="material-symbols-outlined mt-0.5 shrink-0" style={{ fontSize: '18px' }} >error</span>
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <section className="mx-auto max-w-4xl space-y-4">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 h-4 w-44 rounded bg-slate-100" />
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                  </div>
                ))
              : notifications.map((noti) => {
                  const Icon = iconByType[noti.type] || Bell;
                  return (
                    <article
                      key={noti.id}
                      className={`group relative flex items-start gap-4 rounded-[2rem] border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:gap-5 sm:p-6 ${
                        noti.unread ? 'border-primary/20' : 'border-slate-100 opacity-85'
                      }`}
                    >
                      {noti.unread && <span className="absolute left-3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary shadow-lg shadow-primary/40" />}

                      <div className={`flex size-14 shrink-0 items-center justify-center rounded-3xl ${colorByType[noti.type] || 'bg-primary'} text-white shadow-sm`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 23 }}>{Icon}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h2 className="truncate text-sm font-black uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>{noti.title}</h2>
                          <span className="inline-flex shrink-0 items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <span className="material-symbols-outlined" style={{ fontSize: '11px' }} >schedule</span>
                            {noti.time}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">{noti.desc}</p>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        {noti.unread && (
                          <button
                            type="button"
                            onClick={() => markRead(noti.id)}
                            disabled={busyId === `read-${noti.id}`}
                            className="rounded-xl p-2 text-slate-300 transition hover:bg-primary/5 hover:text-primary disabled:cursor-wait"
                            aria-label="Tandai dibaca"
                          >
                            {busyId === `read-${noti.id}` ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteNotification(noti.id)}
                          disabled={busyId === `delete-${noti.id}`}
                          className="rounded-xl p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-wait"
                          aria-label="Hapus notifikasi"
                        >
                          {busyId === `delete-${noti.id}` ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >delete</span>}
                        </button>
                      </div>
                    </article>
                  );
                })}

            {!loading && notifications.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
                <span className="material-symbols-outlined mx-auto mb-3 text-slate-300" style={{ fontSize: '34px' }} >notifications</span>
                <p className="text-sm font-black uppercase tracking-widest text-slate-500">Belum ada notifikasi</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">Notifikasi baru akan muncul dari tabel `psikolog.notifications`.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
