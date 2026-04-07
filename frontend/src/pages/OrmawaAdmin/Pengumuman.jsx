import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';
import { ormawaService } from '../../services/api';

const Pengumuman = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ title: '', target: 'Semua Anggota', content: '', startDate: '', endDate: '' });

  useEffect(() => {
    if (ormawaId) {
      fetchAnnouncements();
    }
  }, [ormawaId]);

  const fetchAnnouncements = async () => {
    try {
      const data = await ormawaService.getAnnouncements(ormawaId);
      if (data.status === 'success') setAnnouncements(data.data || []);
    } catch (e) {
      console.error("Gagal memuat pengumuman:", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedId) {
        await ormawaService.updateAnnouncement(selectedId, {
          ...formData,
          ormawaId: Number(ormawaId),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString()
        });
      } else {
        await ormawaService.createAnnouncement({
          ...formData,
          ormawaId: Number(ormawaId),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString()
        });
      }
      setIsModalOpen(false);
      setSelectedId(null);
      setFormData({ title: '', target: 'Semua Anggota', content: '', startDate: '', endDate: '' });
      fetchAnnouncements();
    } catch (e) { alert("⚠️ Gagal memproses pengumuman."); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Yakin ingin menghapus pengumuman ini?")) return;
    try {
      await ormawaService.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (e) { alert("⚠️ Gagal menghapus pengumuman."); }
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
      <main className="lg:ml-60 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-20 px-4 lg:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black font-headline mb-1 text-on-surface">Siaran & Pengumuman</h1>
              <p className="text-on-surface-variant text-xs font-medium">Broadcast informasi penting dengan sistem auto-deaktivasi.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-black rounded-xl hover:bg-primary-fixed hover:-translate-y-1 transition-all shadow-md text-xs uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[18px]">campaign</span>
              Buat Siaran
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all duration-300">
                <div className={`h-1.5 w-full ${new Date(item.endDate) > new Date() ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] uppercase tracking-wider font-black bg-surface-container px-2 py-0.5 rounded text-primary">{item.target}</span>
                    {new Date(item.endDate) > new Date() ? (
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-md animate-pulse">
                         Live
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 border border-slate-300 rounded-md">
                         Arsip
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-[17px] font-bold font-headline leading-tight mb-1.5 text-on-surface group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed line-clamp-3 flex-grow opacity-85">{item.content}</p>
                  
                  <div className="mt-5 pt-3 border-t border-outline-variant/10 flex justify-between items-center text-[10px] font-bold text-secondary uppercase tracking-tight">
                     <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {new Date(item.startDate).toLocaleDateString()}</div>
                     <div className="flex items-center gap-1">{new Date(item.endDate).toLocaleDateString()} <span className="material-symbols-outlined text-[14px]">event_available</span></div>
                  </div>
                </div>
                <div className="flex bg-surface-container-low/30 border-t border-outline-variant/10">
                  <button onClick={() => openEdit(item)} className="flex-1 py-2.5 text-on-surface-variant hover:text-primary text-[11px] font-black font-headline flex justify-center items-center gap-2 transition-all hover:bg-primary/5 uppercase tracking-wider">
                     <span className="material-symbols-outlined text-[14px]">edit_note</span> Edit
                  </button>
                  <div className="w-px bg-outline-variant/10 min-h-full"></div>
                  <button onClick={() => deleteItem(item.id)} className="flex-1 py-2.5 text-on-surface-variant hover:text-rose-500 text-[11px] font-black font-headline flex justify-center items-center gap-2 transition-all hover:bg-rose-50 uppercase tracking-wider">
                     <span className="material-symbols-outlined text-[14px]">delete</span> Tarik
                  </button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <p className="col-span-full text-center py-20 text-on-surface-variant ">Belum ada siaran aktif</p>}
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
