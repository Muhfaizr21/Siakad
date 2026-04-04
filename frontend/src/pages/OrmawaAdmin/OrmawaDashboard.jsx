import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';

const OrmawaDashboard = () => {
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [stats, setStats] = useState({ totalProposals: 0, totalMembers: 0, totalKas: 0 });
  const [proposals, setProposals] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [identity, setIdentity] = useState({ name: 'Ormawa' });

  useEffect(() => {
    if (ormawaId) {
      fetchIdentity();
      fetchStats();
      fetchProposals();
      fetchAnnouncements();
      fetchEvents();
      fetchMembers();
    }

    const handleSettingsUpdate = () => fetchIdentity();
    window.addEventListener('ormawa_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('ormawa_settings_updated', handleSettingsUpdate);
  }, [ormawaId]);

  const fetchIdentity = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/settings/${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') setIdentity(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/members?ormawaId=${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') setMembers(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/stats?ormawaId=${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') setStats(data.data || { totalProposals: 0, totalMembers: 0, totalKas: 0 });
    } catch (e) { console.error(e); }
  };

  const fetchProposals = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/proposals?ormawaId=${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') setProposals(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/announcements?ormawaId=${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') setAnnouncements(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/events?ormawaId=${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') setEvents(data.data || []);
    } catch (e) { console.error(e); }
  };

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const pendingProposals = (proposals || []).filter(p => p.status === 'diajukan' || p.status === 'pending');

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <TopNavBar />
        <div className="pt-24 pb-12 px-8">
          <section className="relative h-60 rounded-[2rem] overflow-hidden mb-10 group shadow-2xl shadow-primary/10">
            <img 
              alt="BKU Campus" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00236f]/95 via-[#00236f]/80 to-transparent flex items-center px-12 backdrop-blur-[2px]">
              <div className="text-white max-w-3xl">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Master Dashboard Control</p>
                <h2 className="text-4xl font-extrabold font-headline leading-tight mb-3 uppercase drop-shadow-lg">
                  {identity?.alias || identity?.name || 'Dashboard Ormawa'}
                </h2>
                <p className="text-white/80 font-body text-lg leading-relaxed max-w-2xl">
                  Selamat datang di pusat kendali administrasi digital {identity?.name}. Pantau keuangan, keanggotaan, dan progres kegiatan dalam satu layar.
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                  <span className="material-symbols-outlined text-blue-500 group-hover:text-white">group</span>
                </div>
              </div>
              <h3 className="text-3xl font-extrabold font-headline text-on-surface mb-1">{stats.totalMembers}</h3>
              <p className="text-sm font-label text-on-surface-variant uppercase tracking-wider">Anggota Aktif</p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300">
                  <span className="material-symbols-outlined text-emerald-500 group-hover:text-white">event_available</span>
                </div>
              </div>
              <h3 className="text-3xl font-extrabold font-headline text-on-surface mb-1">{events.length}</h3>
              <p className="text-sm font-label text-on-surface-variant uppercase tracking-wider">Kegiatan Terdaftar</p>
            </div>

            <div className="bg-primary p-6 rounded-3xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">account_balance_wallet</span>
                </div>
                <span className="text-xs font-bold text-white bg-white/20 px-2 py-1 rounded-lg">Realtime</span>
              </div>
              <h3 className="text-3xl font-extrabold font-headline text-white mb-1 relative z-10">{formatRp(stats.totalKas)}</h3>
              <p className="text-sm font-label text-white/80 uppercase tracking-wider relative z-10">Saldo Kas Organisasi</p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                  <span className="material-symbols-outlined text-orange-500 group-hover:text-white">campaign</span>
                </div>
              </div>
              <h3 className="text-3xl font-extrabold font-headline text-on-surface mb-1">{announcements.length}</h3>
              <p className="text-sm font-label text-on-surface-variant uppercase tracking-wider">Pengumuman Aktif</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="col-span-1 lg:col-span-2 space-y-8">
              
              {/* Widget: Kegiatan Mendatang (7 Hari) */}
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
                  <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">event_upcoming</span>
                    Kegiatan Mendatang (7 Hari Selanjutnya)
                  </h3>
                  <button className="text-sm font-semibold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors">Lihat Kalender</button>
                </div>
                <div className="p-2">
                  <div className="flex flex-col gap-2 p-4">
                    {(events || []).slice(0, 5).map(ev => (
                      <div key={ev.id} className="group p-5 bg-surface rounded-2xl border border-outline-variant/10 flex items-center justify-between hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                        <div className="flex items-center gap-5">
                          <div className="flex flex-col items-center justify-center w-14 h-14 bg-primary/10 text-primary rounded-xl font-bold font-headline text-center">
                            <span className="text-[10px] uppercase">{ev.startDate ? new Date(ev.startDate).toLocaleDateString('id-ID', {month: 'short'}) : '-'}</span>
                            <span className="text-xl leading-none">{ev.startDate ? new Date(ev.startDate).getDate() : '-'}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface font-headline text-lg group-hover:text-primary transition-colors">{ev.title}</h4>
                            <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              {ev.location}
                            </p>
                          </div>
                        </div>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant">
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                    ))}
                    {events.length === 0 && <p className="text-center text-sm py-8 text-on-surface-variant italic">Belum ada kegiatan mendatang</p>}
                  </div>
                </div>
              </div>

              {/* Notifikasi Proposal yang Perlu Ditindaklanjuti */}
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                  <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500">assignment_late</span>
                    Tindak Lanjut Proposal
                  </h3>
                   <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">{pendingProposals.length} Menunggu</span>
                </div>
                <div className="divide-y divide-outline-variant/10">
                  {pendingProposals.slice(0, 5).map(p => (
                    <div key={p.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-orange-600 border border-orange-200 bg-orange-50 px-2 py-1 rounded-md">Review Kepanitiaan</span>
                          <span className="text-xs text-on-surface-variant font-label">PROP-{p.id}</span>
                        </div>
                        <h4 className="font-bold text-on-surface font-headline">{p.title}</h4>
                        <p className="text-sm text-on-surface-variant mt-1">Diajukan oleh: {p.ormawa?.name || 'Ormawa'}</p>
                      </div>
                      <button className="text-sm text-primary font-semibold border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors">Lihat Detail</button>
                    </div>
                  ))}
                  {pendingProposals.length === 0 && <p className="text-center text-sm py-8 text-on-surface-variant italic">Semua proposal sudah diproses</p>}
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="col-span-1 space-y-8">
              
              {/* Approval Anggota Baru */}
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
                <div className="p-6 bg-gradient-to-br from-surface-container-lowest to-surface-container-low border-b border-outline-variant/10">
                   <h3 className="text-lg font-bold font-headline text-on-surface flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">how_to_reg</span>
                     Approval Anggota Baru
                   </h3>
                   <p className="text-sm text-on-surface-variant mt-1">{members.filter(m => m.status === 'pending').length} pendaftar menunggu verifikasi</p>
                </div>
                
                 <div className="overflow-y-auto p-4 space-y-3 flex-grow">
                  {members.filter(m => m.status === 'pending').map(m => (
                    <div key={m.id} className="p-4 bg-surface rounded-2xl border border-outline-variant/10 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {m.student?.name?.[0] || '?'}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm font-headline">{m.student?.name}</h4>
                          <p className="text-xs text-on-surface-variant">NIM: {m.student?.nim}</p>
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-4 bg-surface-container-low p-2 rounded-lg">Role: {m.role}</p>
                      <div className="flex justify-between gap-2">
                        <button className="flex-1 bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-xs font-bold py-2 rounded-xl transition-colors">Tolak</button>
                        <button className="flex-1 bg-primary hover:bg-primary-container text-white text-xs font-bold py-2 rounded-xl transition-all">Terima</button>
                      </div>
                    </div>
                  ))}
                  {members.filter(m => m.status === 'pending').length === 0 && <p className="text-center py-8 text-on-surface-variant italic">Tidak ada pendaftar baru</p>}
                </div>
                <div className="p-4 border-t border-outline-variant/10">
                  <button className="w-full py-2 text-sm text-primary font-bold hover:underline">Lihat Semua Antrean</button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default OrmawaDashboard;
