import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { 
  ClipboardList, Plus, Search, Filter,
  FileText, Users, Activity, ChevronRight,
  Brain, Heart, Target, Sparkles,
  TrendingUp, Clock, MoreVertical, X, Save
} from 'lucide-react';
import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

export default function AssessmentManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState({ nama: '', kategori: 'Kesehatan Mental', deskripsi: '' });
  const [assessmentMeta, setAssessmentMeta] = useState({ verificationQueue: [], mentalScore: 0 });

  const categoryStyle = {
    'Kesehatan Mental': { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    'Kepribadian': { icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    'Minat Bakat': { icon: Target, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    'Lainnya': { icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  };
  const [categories, setCategories] = useState(['Kesehatan Mental', 'Kepribadian', 'Minat Bakat', 'Lainnya'].map((name) => ({ name, count: 0, ...categoryStyle[name] })));

  const filterChips = ['Semua', 'Kesehatan Mental', 'Kepribadian', 'Minat Bakat', 'Lainnya'];

  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    let ignore = false;
    psychologistService.getAssessments().then((res) => {
      if (!ignore) {
        setSubmissions(res.data.submissions || []);
        setCategories((res.data.categories || []).map((cat) => ({ ...cat, ...(categoryStyle[cat.name] || categoryStyle.Lainnya) })));
        setAssessmentMeta({ verificationQueue: res.data.verification_queue || [], mentalScore: res.data.mental_score || 0 });
      }
    });
    return () => { ignore = true; };
  }, []);

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    await psychologistService.createAssessment(newAssessment);
    const res = await psychologistService.getAssessments();
    setSubmissions(res.data.submissions || []);
    setCategories((res.data.categories || []).map((cat) => ({ ...cat, ...(categoryStyle[cat.name] || categoryStyle.Lainnya) })));
    setAssessmentMeta({ verificationQueue: res.data.verification_queue || [], mentalScore: res.data.mental_score || 0 });
    setNewAssessment({ nama: '', kategori: 'Kesehatan Mental', deskripsi: '' });
    setIsModalOpen(false);
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesCategory = selectedCategory === 'Semua' || sub.category === selectedCategory;
    const matchesSearch = (sub.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (sub.assessment || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className={UI.layout.canvas}>
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
             <div>
                <h1 className="text-xl font-black text-primary uppercase tracking-tight font-headline">Manajemen Asesmen</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kelola tes psikologi dan pantau hasil mahasiswa</p>
             </div>
             <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2"
             >
                <Plus size={16} /> Buat Asesmen Baru
             </button>
          </div>

          {/* Bento Statistics (Now Just Information) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
             {categories.map((cat, i) => (
                <div 
                  key={i} 
                  className={`bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden`}
                >
                   <div className={`absolute -right-4 -bottom-4 size-20 opacity-5 ${cat.color}`}>
                      <cat.icon size={80} />
                   </div>
                   <div className={`size-10 rounded-xl flex items-center justify-center mb-6 ${cat.bg} ${cat.color}`}>
                      <cat.icon size={20} />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{cat.name}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.count} Instrumen</p>
                </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             
             {/* Submissions List (Col 8) */}
             <div className="lg:col-span-8 space-y-4">
                
                {/* Search & Filter Chips */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 space-y-6 mb-6">
                   <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Cari mahasiswa atau asesmen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      />
                   </div>
                   
                   <div className="flex flex-wrap gap-2">
                      {filterChips.map(chip => (
                         <button
                           key={chip}
                           onClick={() => setSelectedCategory(chip)}
                           className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === chip ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
                         >
                            {chip}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                         <Activity size={16} /> Submisi {selectedCategory !== 'Semua' ? `: ${selectedCategory}` : 'Terbaru'}
                      </h3>
                      <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Lihat Semua</button>
                   </div>

                   <div className="space-y-3">
                      {filteredSubmissions.length > 0 ? filteredSubmissions.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                           <div className={`size-10 rounded-xl ${sub.color} text-white flex items-center justify-center font-black text-xs`}>
                              {sub.name.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div className="flex-1">
                              <h5 className="text-xs font-bold text-slate-900">{sub.name}</h5>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{sub.assessment}</p>
                           </div>
                           <div className="text-right px-4">
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Skor/Hasil</p>
                              <p className={`text-[10px] font-black uppercase ${sub.score === 'Tinggi' ? 'text-rose-500' : 'text-primary'}`}>{sub.score}</p>
                           </div>
                           <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                              <ChevronRight size={18} />
                           </button>
                        </div>
                      )) : (
                        <div className="py-20 text-center">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada data ditemukan</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             {/* Analytics Sidebar */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-primary p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-primary/20">
                   <div className="relative z-10">
                      <TrendingUp size={24} className="mb-4 text-white/50" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Rata-rata Skor Mental</h4>
                       <p className="text-3xl font-black tracking-tighter mb-4 font-headline">{assessmentMeta.mentalScore}</p>
                      <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                         <div className="h-full bg-white w-3/4 rounded-full"></div>
                      </div>
                       <p className="text-[8px] font-bold uppercase tracking-widest mt-4 text-white/50">Dihitung dari skor asesmen tersimpan</p>
                   </div>
                   <Brain size={120} className="absolute -right-8 -bottom-8 text-white/5" />
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                   <h3 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <Clock size={16} /> Antrean Verifikasi
                   </h3>
                   <div className="space-y-4">
                       {assessmentMeta.verificationQueue.map((item, i) => (
                         <div key={i} className="flex items-center gap-3">
                            <div className="size-2 bg-amber-400 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{item.name}</p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase">{item.count} data menunggu</p>
                            </div>
                            <button className="text-[8px] font-black text-primary uppercase tracking-widest hover:underline">Cek</button>
                         </div>
                       ))}
                       {assessmentMeta.verificationQueue.length === 0 && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada antrean</p>}
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* --- ADD ASSESSMENT MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
            
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
               <div className="bg-primary p-6 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight font-headline">Asesmen Baru</h3>
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-0.5">Konfigurasi Instrumen Tes</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
               </div>

                <form onSubmit={handleCreateAssessment} className="p-8 space-y-6">
                  <div className="space-y-4">
                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nama Instrumen</label>
                         <input required value={newAssessment.nama} onChange={(e) => setNewAssessment({ ...newAssessment, nama: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Contoh: Tes Kecemasan DASS-21" />
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Kategori</label>
                         <select value={newAssessment.kategori} onChange={(e) => setNewAssessment({ ...newAssessment, kategori: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer">
                           {categories.map(c => <option key={c.name}>{c.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Deskripsi Singkat</label>
                         <textarea value={newAssessment.deskripsi} onChange={(e) => setNewAssessment({ ...newAssessment, deskripsi: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none h-24 resize-none" placeholder="Jelaskan tujuan tes ini..." />
                     </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Batal</button>
                      <button type="submit" className="flex-2 bg-primary text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                        <Save size={16} /> Publikasikan Tes
                     </button>
                  </div>
               </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
