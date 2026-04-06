import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from '../OrmawaAdmin/components/TopNavBar';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { id: 'Fasilitas', icon: 'domain', color: 'rose' },
  { id: 'Akademik', icon: 'school', color: 'primary' },
  { id: 'Dana Hibah', icon: 'payments', color: 'emerald' },
  { id: 'Kegiatan', icon: 'event', color: 'amber' },
  { id: 'Lainnya', icon: 'info', color: 'slate' }
];

const FacultyAspirationManagement = () => {
  const { user } = useAuth();
  const [aspirations, setAspirations] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/aspirations`);
      const data = await res.json();
      if (data.status === 'success') setAspirations(data.data || []);
    } catch (e) { console.error(e); }
  };

  const handleUpdateStatus = async (id, status, response = '') => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/aspirations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, response })
      });
      if (res.ok) {
        fetchData();
        setShowResponseModal(false);
        setSelectedItem(null);
        setResponseMsg('');
      }
    } catch (e) { console.error(e); }
  };

  const filteredAspirations = activeTab === 'all' 
    ? aspirations 
    : aspirations.filter(a => a.status === activeTab);

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen font-body">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight mb-3">Pusat Aspirasi Himpunan</h1>
              <p className="text-slate-500 font-medium text-lg">Dengarkan usulan dari setiap Himpunan Mahasiswa dan berikan dukungan strategis untuk kemajuan Fakultas.</p>
            </div>
            
            <div className="flex bg-white/50 backdrop-blur p-1.5 rounded-[1.5rem] border border-slate-200/50 shadow-sm">
              {['all', 'pending', 'responded'].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-8 py-3 rounded-[1.2rem] text-sm font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                >
                  {t === 'all' ? 'Semua' : t === 'pending' ? 'Belum Dibalas' : 'Selesai'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredAspirations.length === 0 ? (
              <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 opacity-40">
                  <span className="material-symbols-outlined text-4xl">inbox_customize</span>
                </div>
                <p className="font-bold text-slate-400 uppercase tracking-widest">Tidak ada aspirasi masuk saat ini.</p>
              </div>
            ) : (
              filteredAspirations.map(item => (
                <div key={item.id} className={`bg-white rounded-[2.5rem] border-2 p-8 transition-all hover:shadow-2xl flex flex-col lg:flex-row gap-8 items-start lg:items-center ${item.status === 'pending' ? 'border-indigo-100 hover:border-indigo-200' : 'border-slate-100'}`}>
                  {/* Left: Ormawa Info */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-center gap-4 min-w-[140px] text-center">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl font-black shadow-inner">
                      {item.ormawa?.name?.[0] || 'O'}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-1 line-clamp-1">{item.ormawa?.name || 'ORMAWA'}</h4>
                      <p className="text-[10px] font-bold text-slate-400">ID: #{item.ormawaId}</p>
                    </div>
                  </div>

                  {/* Middle: Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${CATEGORIES.find(c => c.id === item.category)?.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        <span className="material-symbols-outlined text-[14px]">{CATEGORIES.find(c => c.id === item.category)?.icon}</span>
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest self-center opacity-60">Dikirim Pada: {new Date(item.createdAt).toLocaleString('id-ID', { dateStyle: 'long' })}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-500 text-base leading-relaxed">{item.description}</p>
                    </div>

                    {item.response && (
                      <div className="bg-emerald-50/50 p-6 rounded-[1.5rem] border border-emerald-100 flex gap-4">
                        <span className="material-symbols-outlined text-emerald-600 mt-0.5">verified_user</span>
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Tanggapan Fakultas Telah Terkirim:</p>
                          <p className="text-emerald-900 font-medium italic text-sm">"{item.response}"</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex lg:flex-col gap-3 w-full lg:w-auto">
                    {item.status === 'pending' ? (
                      <button 
                        onClick={() => {
                          setSelectedItem(item);
                          setShowResponseModal(true);
                        }}
                        className="flex-1 lg:w-48 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black tracking-widest text-[11px] shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase"
                      >
                         <span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
                         Tanggapi
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedItem(item);
                          setResponseMsg(item.response);
                          setShowResponseModal(true);
                        }}
                        className="flex-1 lg:w-48 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-bold tracking-widest text-[11px] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 uppercase"
                      >
                         <span className="material-symbols-outlined text-[18px]">edit</span>
                         Ubah Jawaban
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Respond */}
        {showResponseModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-lg animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 -mr-16 -mt-16 rounded-full blur-3xl opacity-60"></div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-2">Jawab Aspirasi Himpunan</h2>
              <p className="text-slate-500 mb-10 leading-relaxed font-medium">Jawaban Anda akan muncul langsung di dashboard Himpunan {selectedItem?.ormawa?.name}.</p>
              
              <div className="mb-10 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Pesan Masuk:</p>
                <p className="text-slate-800 font-bold leading-relaxed border-l-4 border-indigo-200 pl-4">{selectedItem?.description}</p>
              </div>

              <textarea 
                className="w-full bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 focus:border-indigo-400 focus:bg-white outline-none text-base min-h-[200px] transition-all mb-10 shadow-inner"
                placeholder="Berikan jawaban, solusi, atau kebijakan fakultas terkait permohonan ini..."
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
              ></textarea>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                >
                   TUTUP
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedItem.id, 'responded', responseMsg)}
                  className="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-200 uppercase tracking-[0.2em]"
                >
                  KIRIM TANGGAPAN RESMI
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyAspirationManagement;
