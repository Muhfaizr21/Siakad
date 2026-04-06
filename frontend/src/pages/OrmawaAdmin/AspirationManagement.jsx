import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { id: 'Fasilitas', icon: 'domain', color: 'rose' },
  { id: 'Akademik', icon: 'school', color: 'primary' },
  { id: 'Dana Hibah', icon: 'payments', color: 'emerald' },
  { id: 'Kegiatan', icon: 'event', color: 'amber' },
  { id: 'Lainnya', icon: 'info', color: 'slate' }
];

const AspirationManagement = () => {
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [aspirations, setAspirations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAspiration, setNewAspiration] = useState({ title: '', category: 'Kegiatan', description: '' });

  useEffect(() => {
    fetchData();
  }, [ormawaId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/aspirations?ormawaId=${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') setAspirations(data.data || []);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async () => {
    if (!newAspiration.title || !newAspiration.description) return alert("Mohon lengkapi data!");
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/aspirations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAspiration,
          ormawaId: Number(ormawaId),
          status: 'pending'
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewAspiration({ title: '', category: 'Kegiatan', description: '' });
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 px-4 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-4xl font-black font-headline text-primary tracking-tight mb-2">Saluran Aspirasi</h1>
              <p className="text-on-surface-variant font-medium text-lg">Sampaikan masukan & usulan Himpunan Anda langsung ke Fakultas.</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-8 py-5 bg-primary text-white rounded-[2rem] font-bold shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <span className="material-symbols-outlined font-black">add_circle</span>
              AJUKAN ASPIRASI BARU
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {aspirations.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-outline-variant/20 flex flex-col items-center">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-4 opacity-30">
                  <span className="material-symbols-outlined text-4xl">inventory_2</span>
                </div>
                <p className="font-bold text-on-surface-variant opacity-50">Himpunan Anda belum pernah mengirim aspirasi.</p>
              </div>
            ) : (
              aspirations.map(item => (
                <div key={item.id} className="bg-white rounded-[2.5rem] border-2 border-outline-variant/10 p-8 hover:shadow-2xl transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${CATEGORIES.find(c => c.id === item.category)?.color === 'rose' ? 'bg-rose-100 text-rose-700' : 'bg-primary/10 text-primary'}`}>
                        <span className="material-symbols-outlined text-[14px]">{CATEGORIES.find(c => c.id === item.category)?.icon}</span>
                        {item.category}
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.status === 'responded' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {item.status === 'responded' ? 'DIBALAS FAKULTAS' : 'PENDING'}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-on-surface mb-3">{item.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-6 opacity-70">{item.description}</p>

                    {item.response && (
                      <div className="mt-6 pt-6 border-t border-dashed border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">how_to_reg</span> TANGGAPAN FAKULTAS
                        </p>
                        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 italic text-sm text-emerald-800">
                           "{item.response}"
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-outline-variant/5 flex justify-between items-center text-[10px] font-bold text-on-surface-variant opacity-40">
                    <span>Dikirim: {new Date(item.createdAt).toLocaleDateString()}</span>
                    <span>#{item.id}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Submit Baru */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/50 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl p-12 shadow-2xl animate-in zoom-in-95 duration-300">
              <h2 className="text-3xl font-black text-on-surface mb-2">Suarakan Kebutuhan Himpunan</h2>
              <p className="text-on-surface-variant mb-10 leading-relaxed font-medium">Sampaikan saran, keluhan, atau ide kegiatan strategis untuk diajukan ke Pimpinan Fakultas.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-3 opacity-40">Kategori Permohonan</label>
                  <div className="grid grid-cols-3 gap-3">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setNewAspiration({...newAspiration, category: cat.id})}
                        className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border-2 transition-all ${newAspiration.category === cat.id ? 'bg-primary text-white border-primary shadow-lg' : 'bg-surface border-outline-variant/10 hover:border-primary/20 text-on-surface-variant'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                        {cat.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-3 opacity-40">Judul Aspirasi / Perihal</label>
                  <input 
                    className="w-full bg-surface-container-low p-5 rounded-2xl border-2 border-outline-variant/10 focus:border-primary/40 outline-none font-bold"
                    placeholder="Contoh: Pengajuan Perbaikan Sekret Himarpl"
                    value={newAspiration.title}
                    onChange={(e) => setNewAspiration({...newAspiration, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-3 opacity-40">Detail Aspirasi & Harapan</label>
                  <textarea 
                    className="w-full bg-surface-container-low p-6 rounded-[2rem] border-2 border-outline-variant/10 focus:border-primary/40 outline-none text-sm min-h-[180px]"
                    placeholder="Tuliskan detail permohonan atau aspirasi secara lengkap..."
                    value={newAspiration.description}
                    onChange={(e) => setNewAspiration({...newAspiration, description: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-4 mt-12">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-5 rounded-[2rem] font-bold bg-surface-container-high text-on-surface-variant hover:bg-surface-container transition-all"
                >
                   BATAL
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex-2 px-12 py-5 bg-primary text-white rounded-[2rem] font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                >
                  KIRIM ASPIRASI SEKARANG
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AspirationManagement;
