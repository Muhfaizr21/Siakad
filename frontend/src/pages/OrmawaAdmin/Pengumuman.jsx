import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';

const Pengumuman = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ title: '', target: 'Semua Anggota', content: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetchAnnouncements();
  }, [ormawaId]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/announcements?ormawaId=${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') setAnnouncements(data.data || []);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = selectedId 
      ? `http://localhost:8000/api/ormawa/announcements/${selectedId}`
      : 'http://localhost:8000/api/ormawa/announcements';
    
    try {
      const res = await fetch(url, {
        method: selectedId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          target: formData.target,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          ormawaId: Number(ormawaId)
        })
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setSelectedId(null);
        setFormData({ title: '', target: 'Semua Anggota', content: '', startDate: '', endDate: '' });
        fetchAnnouncements();
      }
    } catch (e) { console.error(e); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Hapus pengumuman ini?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/announcements/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchAnnouncements();
    } catch (e) { console.error(e); }
  };

  const openEdit = (item) => {
    setSelectedId(item.id);
    setFormData({
      title: item.title,
      target: item.target,
      content: item.content,
      startDate: item.startDate.split('T')[0],
      endDate: item.endDate.split('T')[0]
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold font-headline mb-2 text-on-surface">Pusat Siaran & Pengumuman</h1>
              <p className="text-on-surface-variant text-sm font-medium">Broadcast informasi penting dengan sistem auto-deaktivasi berbasis kalender.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-fixed hover:-translate-y-1 transition-all shadow-lg shadow-primary/30"
            >
              <span className="material-symbols-outlined text-[18px]">campaign</span>
              Buat Siaran Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl overflow-hidden shadow-sm flex flex-col group">
                <div className={`h-2 w-full ${new Date(item.endDate) > new Date() ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold bg-surface-container px-2 py-1 rounded text-primary">{item.target}</span>
                    {new Date(item.endDate) > new Date() ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2 py-1 border border-emerald-200 rounded-full animate-pulse">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Live
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 bg-slate-100 px-2 py-1 border border-slate-300 rounded-full">
                         Arsip
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold font-headline leading-tight mb-2 text-on-surface group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 flex-grow">{item.content}</p>
                  
                  <div className="mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center text-xs font-semibold text-secondary">
                     <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {new Date(item.startDate).toLocaleDateString()}</div>
                     <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                     <div className="flex items-center gap-1">{new Date(item.endDate).toLocaleDateString()} <span className="material-symbols-outlined text-[16px]">event_available</span></div>
                  </div>
                </div>
                <div className="flex bg-surface-container-low/30 border-t border-outline-variant/10">
                  <button onClick={() => openEdit(item)} className="flex-1 py-3.5 text-on-surface-variant hover:text-primary text-xs font-bold font-headline flex justify-center items-center gap-2 transition-all hover:bg-primary/5">
                     <span className="material-symbols-outlined text-[16px]">edit_note</span> Edit Draft
                  </button>
                  <div className="w-px bg-outline-variant/10 min-h-full"></div>
                  <button onClick={() => deleteItem(item.id)} className="flex-1 py-3.5 text-on-surface-variant hover:text-rose-500 text-xs font-bold font-headline flex justify-center items-center gap-2 transition-all hover:bg-rose-50">
                     <span className="material-symbols-outlined text-[16px]">delete</span> Tarik Siaran
                  </button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <p className="col-span-full text-center py-20 text-on-surface-variant italic">Belum ada siaran aktif</p>}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
               <div className="bg-surface w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant/10">
                  <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
                    <div>
                      <h2 className="text-xl font-bold font-headline text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined">campaign</span> {selectedId ? 'Update Siaran' : 'Buat Siaran'}
                      </h2>
                    </div>
                    <button onClick={() => { setIsModalOpen(false); setSelectedId(null); }} className="w-8 h-8 hover:bg-surface-container-highest rounded-full flex justify-center items-center"><span className="material-symbols-outlined text-[20px]">close</span></button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Judul Siaran</label>
                      <input required type="text" className="w-full p-4 bg-surface-container flex border border-outline-variant/20 rounded-xl focus:border-primary text-sm font-medium" 
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Penting: ..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Target Penerima</label>
                      <select className="w-full p-4 bg-surface-container flex border border-outline-variant/20 rounded-xl focus:border-primary text-sm font-bold"
                         value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})}>
                          <option value="Semua Anggota">Publik (Semua Anggota)</option>
                          <option value="Divisi Keuangan">Divisi Keuangan</option>
                          <option value="Divisi Medkom">Divisi Media & Komunikasi</option>
                          <option value="Panitia Khusus">Panitia Event Berjalan</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Mulai Tayang</label>
                           <input required type="date" className="w-full p-3 bg-surface-container flex border border-outline-variant/20 rounded-xl text-sm" 
                            value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Akhir Tayang (Auto-Archived)</label>
                           <input required type="date" className="w-full p-3 bg-surface-container flex border border-outline-variant/20 rounded-xl text-sm" 
                            value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                        </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Isi Pesan Detail</label>
                      <textarea required rows="4" className="w-full p-4 bg-surface-container flex border border-outline-variant/20 rounded-xl focus:border-primary text-sm font-medium resize-none shadow-inner" 
                        value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Jabarkan pengumuman di sini..."></textarea>
                    </div>
                    
                    <button type="submit" className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4">
                      <span className="material-symbols-outlined text-[20px]">send</span>
                      Broadcast Siaran Sekarang
                    </button>
                  </form>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Pengumuman;
