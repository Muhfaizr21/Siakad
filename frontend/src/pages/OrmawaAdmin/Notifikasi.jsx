import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';

const Notifikasi = () => {
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    fetchNotifs();
  }, [ormawaId]);

  const fetchNotifs = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/notifications?ormawaId=${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') setNotifs(data.data);
    } catch (e) { console.error(e); }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'approval': return <span className="material-symbols-outlined text-blue-500">how_to_reg</span>;
      case 'proposal': return <span className="material-symbols-outlined text-amber-500">post_add</span>;
      case 'fund': return <span className="material-symbols-outlined text-emerald-500">payments</span>;
      case 'event': return <span className="material-symbols-outlined text-purple-500">event_upcoming</span>;
      default: return <span className="material-symbols-outlined text-primary">notifications</span>;
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`http://localhost:8000/api/ormawa/notifications/read-all?ormawaId=${ormawaId}`, { method: 'PUT' });
      fetchNotifs();
    } catch (e) { console.error(e); }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/ormawa/notifications/${id}/read`, { method: 'PUT' });
      fetchNotifs();
    } catch (e) { console.error(e); }
  };

  const deleteNotif = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/ormawa/notifications/${id}`, { method: 'DELETE' });
      fetchNotifs();
    } catch (e) { console.error(e); }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen pb-12">
        <TopNavBar />
        
        <div className="pt-24 px-8 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold font-headline mb-2 text-on-surface">Pusat Notifikasi</h1>
              <p className="text-on-surface-variant text-sm font-medium">Log riwayat pemberitahuan operasional dari seluruh lini modul.</p>
            </div>
            {notifs.filter(n => !n.isRead).length > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-primary font-bold rounded-xl hover:bg-surface-container hover:text-primary-fixed transition-colors">
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                Tandai Semua Dibaca
              </button>
            )}
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl shadow-sm overflow-hidden flex flex-col">
             {notifs.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                   <span className="material-symbols-outlined text-6xl mb-4 opacity-50">notifications_off</span>
                   <p className="font-bold">Belum ada pemberitahuan baru.</p>
                </div>
             ) : (
                <div className="divide-y divide-outline-variant/10">
                   {notifs.map(item => (
                      <div key={item.id} className={`p-6 flex items-start gap-4 transition-colors ${item.isRead ? 'bg-surface/50 opacity-70' : 'bg-primary/5 hover:bg-primary/10 cursor-pointer'}`} onClick={() => !item.isRead && markAsRead(item.id)}>
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${item.isRead ? 'bg-surface-container border-outline-variant/20' : 'bg-white border-primary/20'}`}>
                            {getIcon(item.type)}
                         </div>
                         <div className="flex-grow">
                            <div className="flex justify-between items-start mb-1">
                               <h3 className={`text-base font-headline ${item.isRead ? 'font-semibold text-on-surface-variant' : 'font-extrabold text-on-surface'}`}>{item.title}</h3>
                               <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{formatTime(item.createdAt)}</span>
                            </div>
                            <p className="text-sm font-body text-on-surface-variant leading-relaxed max-w-3xl">{item.desc}</p>
                            
                            {!item.isRead && (
                               <div className="mt-3">
                                 <button className="text-xs font-bold text-primary hover:underline">Tinjau Sekarang &rarr;</button>
                               </div>
                            )}
                         </div>
                         <button onClick={(e) => { e.stopPropagation(); deleteNotif(item.id); }} className="w-8 h-8 rounded-full flex justify-center items-center text-on-surface-variant hover:bg-rose-50 hover:text-rose-500 transition-colors shrink-0">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                         </button>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifikasi;
