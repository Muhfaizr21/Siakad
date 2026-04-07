import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { ormawaService } from '../../services/api';

const OrmawaDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const ormawaId = user?.ormawaId || 1;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalProposals: 0, totalMembers: 0, totalKas: 0, totalEvents: 0, totalAnnouncements: 0 });
  const [proposals, setProposals] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [identity, setIdentity] = useState({ name: 'Ormawa' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ormawaId) {
      fetchAllData();
    }

    const handleSettingsUpdate = () => fetchIdentity();
    window.addEventListener('ormawa_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('ormawa_settings_updated', handleSettingsUpdate);
  }, [ormawaId]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchIdentity(),
        fetchDashboardStats(),
        fetchProposals(),
        fetchAnnouncements(),
        fetchEvents(),
        fetchMembers()
      ]);
    } catch (e) {
      console.error("Gagal sinkronisasi dashboard:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIdentity = async () => {
    try {
      const data = await ormawaService.getSettings(ormawaId);
      if (data.status === 'success') setIdentity(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchMembers = async () => {
    try {
      const data = await ormawaService.getMembers(ormawaId);
      if (data.status === 'success') setMembers(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchDashboardStats = async () => {
    try {
      const data = await ormawaService.getStats(ormawaId);
      if (data.status === 'success') setStats(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchProposals = async () => {
    try {
      const data = await ormawaService.getProposals(ormawaId);
      if (data.status === 'success') setProposals(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchAnnouncements = async () => {
    try {
      const data = await ormawaService.getAnnouncements(ormawaId);
      if (data.status === 'success') setAnnouncements(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchEvents = async () => {
    try {
      const data = await ormawaService.getEvents(ormawaId);
      if (data.status === 'success') setEvents(data.data || []);
    } catch (e) { console.error(e); }
  };

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const pendingProposals = (proposals || []).filter(p => p.status === 'diajukan' || p.status === 'pending');

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-20 pb-8 px-4 lg:px-6">
          <section className="relative h-auto min-h-[12rem] lg:h-48 rounded-3xl overflow-hidden mb-6 group shadow-xl shadow-primary/5">
            <img 
              alt="BKU Campus" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00236f]/95 via-[#00236f]/80 to-transparent flex items-center px-6 lg:px-10 backdrop-blur-[2px] py-6 lg:py-0">
              <div className="text-white max-w-2xl">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Master Dashboard Control</p>
                <h2 className="text-xl lg:text-3xl font-extrabold font-headline leading-tight mb-2 uppercase drop-shadow-lg">
                  {identity?.alias || identity?.name || 'Dashboard Ormawa'}
                </h2>
                <p className="text-white/80 font-body text-xs lg:text-base leading-relaxed max-w-xl">
                  Selamat datang di pusat kendali administrasi digital {identity?.name}. Pantau keuangan, keanggotaan, dan progres kegiatan dalam satu layar.
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                  <span className="material-symbols-outlined text-blue-500 group-hover:text-white text-[20px]">group</span>
                </div>
              </div>
              <h3 className="text-2xl font-extrabold font-headline text-on-surface mb-0.5">{stats.totalMembers}</h3>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Anggota Aktif</p>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300">
                  <span className="material-symbols-outlined text-emerald-500 group-hover:text-white text-[20px]">event_available</span>
                </div>
              </div>
              <h3 className="text-2xl font-extrabold font-headline text-on-surface mb-0.5">{stats.totalEvents}</h3>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Kegiatan Terdaftar</p>
            </div>

            <div className="bg-primary p-5 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[20px]">account_balance_wallet</span>
                </div>
                <span className="text-[9px] font-black text-white bg-white/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">Realtime</span>
              </div>
              <h3 className="text-2xl font-extrabold font-headline text-white mb-0.5 relative z-10">{formatRp(stats.totalKas)}</h3>
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider relative z-10">Saldo Kas Organisasi</p>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                  <span className="material-symbols-outlined text-orange-500 group-hover:text-white text-[20px]">campaign</span>
                </div>
              </div>
              <h3 className="text-2xl font-extrabold font-headline text-on-surface mb-0.5">{stats.totalAnnouncements}</h3>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Pengumuman Aktif</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              
              {/* Widget: Kegiatan Mendatang (7 Hari) */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="p-4 px-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
                  <h3 className="text-base font-bold font-headline flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">event_upcoming</span>
                    Kegiatan Mendatang
                  </h3>
                  <button 
                    onClick={() => navigate('/ormawa/jadwal')}
                    className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors border border-primary/10"
                  >
                    Kalender
                  </button>
                </div>
                <div className="p-1">
                  <div className="flex flex-col gap-1.5 p-3">
                    {(events || []).slice(0, 5).map(ev => (
                      <div key={ev.id} className="group p-3 px-4 bg-surface rounded-xl border border-outline-variant/10 flex items-center justify-between hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg font-bold font-headline text-center">
                            <span className="text-[9px] uppercase leading-none mb-0.5">{ev.startDate ? new Date(ev.startDate).toLocaleDateString('id-ID', {month: 'short'}) : '-'}</span>
                            <span className="text-lg leading-none">{ev.startDate ? new Date(ev.startDate).getDate() : '-'}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface font-headline text-[15px] group-hover:text-primary transition-colors leading-tight">{ev.title}</h4>
                            <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5 font-medium">
                              <span className="material-symbols-outlined text-[12px]">location_on</span>
                              {ev.location}
                            </p>
                          </div>
                        </div>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant">
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                    ))}
                    {events.length === 0 && <p className="text-center text-sm py-8 text-on-surface-variant ">Belum ada kegiatan mendatang</p>}
                  </div>
                </div>
              </div>

              {/* Notifikasi Proposal yang Perlu Ditindaklanjuti */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="p-4 px-6 border-b border-outline-variant/10 flex justify-between items-center">
                  <h3 className="text-base font-bold font-headline flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500 text-[20px]">assignment_late</span>
                    Tindak Lanjut Proposal
                  </h3>
                   <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">{pendingProposals.length} Menunggu</span>
                </div>
                <div className="divide-y divide-outline-variant/10">
                  {pendingProposals.slice(0, 5).map(p => (
                    <div key={p.id} className="p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] font-black text-orange-600 border border-orange-200 bg-orange-50 px-2 py-0.5 rounded-md uppercase">Review</span>
                          <span className="text-[10px] text-on-surface-variant font-bold tracking-tight">PROP-{p.id}</span>
                        </div>
                        <h4 className="font-bold text-on-surface font-headline text-[15px] leading-tight">{p.title}</h4>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">Oleh: {p.ormawa?.name || 'Ormawa'}</p>
                      </div>
                      <button 
                        onClick={() => navigate('/ormawa/proposals')}
                        className="text-[11px] text-primary font-black uppercase tracking-wider border border-primary/20 bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                      >
                        Detail
                      </button>
                    </div>
                  ))}
                  {pendingProposals.length === 0 && <p className="text-center text-sm py-8 text-on-surface-variant ">Semua proposal sudah diproses</p>}
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="col-span-1 space-y-6">
              
              {/* Approval Anggota Baru */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
                <div className="p-4 px-6 bg-gradient-to-br from-surface-container-lowest to-surface-container-low border-b border-outline-variant/10">
                   <h3 className="text-base font-bold font-headline text-on-surface flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary text-[20px]">how_to_reg</span>
                     Approval Anggota
                   </h3>
                   <p className="text-[11px] text-on-surface-variant mt-0.5">{members.filter(m => m.status === 'pending').length} pendaftar menunggu</p>
                </div>
                
                 <div className="overflow-y-auto p-3 space-y-2.5 flex-grow">
                  {members.filter(m => m.status === 'pending').map(m => (
                    <div key={m.id} className="p-3.5 bg-surface rounded-xl border border-outline-variant/10 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                          {m.student?.name?.[0] || '?'}
                        </div>
                        <div>
                          <h4 className="font-bold text-[13px] font-headline text-on-surface leading-tight">{m.student?.name}</h4>
                          <p className="text-[10px] text-on-surface-variant font-medium">NIM: {m.student?.nim}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mb-3 bg-surface-container-low p-2 rounded-lg font-bold items-center flex gap-1.5 uppercase tracking-wide">
                        <span className="material-symbols-outlined text-[14px]">badge</span>
                        {m.role}
                      </p>
                      <div className="flex justify-between gap-2">
                        <button className="flex-1 bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-[10px] font-black uppercase py-2 rounded-lg transition-colors">Tolak</button>
                        <button className="flex-1 bg-primary hover:bg-primary-container text-white text-[10px] font-black uppercase py-2 rounded-lg transition-all shadow-sm shadow-primary/20">Terima</button>
                      </div>
                    </div>
                  ))}
                  {members.filter(m => m.status === 'pending').length === 0 && <p className="text-center py-8 text-on-surface-variant ">Tidak ada pendaftar baru</p>}
                </div>
                <div className="p-4 border-t border-outline-variant/10">
                  <button 
                    onClick={() => navigate('/ormawa/staff')}
                    className="w-full py-2 text-sm text-primary font-bold hover:underline"
                  >
                    Lihat Semua Antrean
                  </button>
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
