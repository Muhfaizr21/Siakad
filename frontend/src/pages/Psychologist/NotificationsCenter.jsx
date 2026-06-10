import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const iconByType = {
  booking: 'calendar_month',
  assessment: 'assignment',
  alert: 'error',
  report: 'check_circle',
  referral: 'move_to_inbox',
  system: 'settings',
  info: 'info',
};

const colorByType = {
  booking: 'bg-primary',
  assessment: 'bg-indigo-500',
  alert: 'bg-rose-500',
  report: 'bg-emerald-500',
  referral: 'bg-indigo-500',
  system: 'bg-slate-500',
  info: 'bg-sky-500',
};

export default function NotificationsCenter() {
  const navigate = useNavigate();
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

  const handleNotificationClick = (noti) => {
    if (noti.unread) {
      markRead(noti.id);
    }
    
    if (noti.action_url) {
      navigate(noti.action_url);
      return;
    }

    switch (noti.type) {
      case 'booking':
        navigate('/psychologist/bookings');
        break;
      case 'referral':
        navigate('/psychologist/referrals');
        break;
      case 'assessment':
      case 'report':
        navigate('/psychologist/medical-records');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="w-full relative space-y-6 scroll-smooth">
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
                    <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '26px' }}>notifications</span>
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                        {unreadCount} Belum Dibaca
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                      Pusat Notifikasi
                    </h1>
                    <p className="mt-2 text-xs md:text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
                      Pantau informasi terbaru dan update dari sistem secara langsung.
                    </p>
                 </div>
              </div>
            </div>
            
            <div className="relative z-10 shrink-0 mt-2 xl:mt-0 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:text-primary hover:border-primary/30 disabled:cursor-wait disabled:opacity-60"
                >
                  <span className={`material-symbols-outlined text-[18px] shrink-0 ${loading ? 'animate-spin' : ''}`}>sync</span>
                  Muat Ulang
                </button>
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={!unreadCount || busyId === 'read-all'}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {busyId === 'read-all' ? <span className="material-symbols-outlined animate-spin text-[18px] shrink-0">sync</span> : <span className="material-symbols-outlined text-[18px] shrink-0">check</span>}
                  Tandai Semua Dibaca
                </button>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-lg">error</span>
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <section className="w-full space-y-4">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                    <div className="mb-4 h-4 w-44 rounded bg-slate-100" />
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                  </div>
                ))
              : notifications.map((noti) => {
                  const Icon = iconByType[noti.type] || 'notifications';
                  return (
                    <article
                      key={noti.id}
                      onClick={() => handleNotificationClick(noti)}
                      className={`group relative flex items-start gap-3 rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer sm:gap-4 sm:p-4 ${
                        noti.unread ? 'border-primary/20' : 'border-[var(--theme-border)] opacity-85'
                      }`}
                      style={{ backgroundColor: 'var(--theme-surface)' }}
                    >
                      {noti.unread && <span className="absolute left-2.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-primary shadow-lg shadow-primary/40" />}

                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${colorByType[noti.type] || 'bg-primary'} text-white shadow-sm`}>
                        <span className="material-symbols-outlined text-xl shrink-0">{Icon}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                          <h2 className="truncate text-xs font-black uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>{noti.title}</h2>
                          <span className="inline-flex shrink-0 items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                            <span className="material-symbols-outlined text-[10px] shrink-0">schedule</span>
                            {noti.time}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-[10px] font-medium leading-relaxed text-slate-500">{noti.desc}</p>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        {noti.unread && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); markRead(noti.id); }}
                            disabled={busyId === `read-${noti.id}`}
                            className="rounded-xl p-1.5 text-slate-300 transition hover:bg-primary/5 hover:text-primary disabled:cursor-wait"
                            aria-label="Tandai dibaca"
                          >
                            {busyId === `read-${noti.id}` ? <span className="material-symbols-outlined animate-spin text-base shrink-0">sync</span> : <span className="material-symbols-outlined text-base shrink-0">check</span>}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteNotification(noti.id); }}
                          disabled={busyId === `delete-${noti.id}`}
                          className="rounded-xl p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-wait"
                          aria-label="Hapus notifikasi"
                        >
                          {busyId === `delete-${noti.id}` ? <span className="material-symbols-outlined animate-spin text-base shrink-0">sync</span> : <span className="material-symbols-outlined text-base shrink-0">delete</span>}
                        </button>
                      </div>
                    </article>
                  );
                })}

            {!loading && notifications.length === 0 && (
              <div className="rounded-2xl border border-dashed p-10 text-center shadow-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                <span className="material-symbols-outlined mx-auto mb-3 text-slate-300 text-4xl shrink-0">notifications</span>
                <p className="text-sm font-black uppercase tracking-widest text-slate-500">Belum ada notifikasi</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">Notifikasi baru akan muncul dari tabel `psikolog.notifications`.</p>
              </div>
            )}
          </section>
        </div>
    </>
  );
}
