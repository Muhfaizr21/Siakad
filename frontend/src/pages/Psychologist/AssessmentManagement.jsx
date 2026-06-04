import React, { useEffect, useState } from 'react';
import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Brain = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>psychology</span>;
const Target = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>track_changes</span>;
const Sparkles = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>auto_awesome</span>;
const Heart = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>favorite</span>;

export default function AssessmentManagement() {
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
    <>
      <div className="w-full relative space-y-6 scroll-smooth">
          
          {/* Welcome Banner Card (White-to-Blue Gradient) */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-slate-50/50 to-blue-50/20 border border-slate-100 p-5 shadow-sm flex flex-col gap-5 group">
            {/* Soft decorative blur nodes */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between w-full">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined size-3.5">auto_awesome</span>
                  Modul Asesmen
                </div>
                <h1 className="mt-3 text-2xl font-black text-primary uppercase tracking-tight font-headline">Manajemen Asesmen</h1>
                <p className="mt-1 max-w-2xl text-xs font-bold leading-5 text-slate-500">
                  Konfigurasi dan pantau kuisioner psikologis, uji kepribadian, serta analisis minat bakat mahasiswa secara komprehensif.
                </p>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/95 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center gap-2 w-fit shrink-0 relative z-20"
              >
                <span className="material-symbols-outlined text-base">add</span> Buat Asesmen Baru
              </button>
            </div>
          </section>

          {/* Categories Stats Cards (4 Column Bento Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
             {categories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                   <div 
                     key={i} 
                     className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                   >
                      <div className={`absolute -right-8 -top-5 w-24 h-24 ${cat.color} opacity-[0.03] rounded-full blur-xl pointer-events-none`} />
                      
                      <div className="flex items-center justify-between">
                         <div className={`w-11 h-11 ${cat.bg} ${cat.color} rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                            <Icon size={18} />
                         </div>
                         <div className={`flex items-center gap-1 rounded-full ${cat.bg} border ${cat.border} px-2.5 py-0.5 text-[9px] font-black ${cat.color} uppercase tracking-widest`}>
                            AKTIF
                         </div>
                      </div>
                      
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-5">{cat.name}</p>
                      <p className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{cat.count}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">instrumen terdaftar</p>
                   </div>
                );
             })}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 w-full">
             
             {/* Submissions List (Col 8) */}
             <div className="lg:col-span-8 space-y-6">
                
                {/* Search & Filter Chips Bento Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
                   <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base transition-colors group-focus-within:text-primary" >search</span>
                      <input 
                        type="text" 
                        placeholder="Cari mahasiswa atau nama asesmen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                      />
                   </div>
                   
                   <div className="flex flex-wrap gap-2 pt-1">
                      {filterChips.map(chip => (
                         <button
                           key={chip}
                           onClick={() => setSelectedCategory(chip)}
                           className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${selectedCategory === chip ? 'bg-primary text-white shadow-md shadow-primary/10' : 'bg-slate-50 text-slate-400 border border-slate-100/50 hover:bg-slate-100 hover:text-slate-600'}`}
                         >
                            {chip}
                         </button>
                      ))}
                   </div>
                </div>

                {/* Submissions Table Bento Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                   <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
                      <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                         <span className="material-symbols-outlined text-base" >analytics</span> Submisi {selectedCategory !== 'Semua' ? `: ${selectedCategory}` : 'Terbaru'}
                      </h3>
                      <button className="text-[9px] font-black text-primary hover:text-primary/80 uppercase tracking-widest hover:underline transition-colors">Lihat Semua</button>
                   </div>

                   <div className="space-y-3.5">
                      {filteredSubmissions.length > 0 ? filteredSubmissions.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md hover:border-slate-200/50 transition-all duration-300 group">
                           <div className={`w-11 h-11 rounded-[1.25rem] ${sub.color || 'bg-primary'} text-white flex items-center justify-center font-black text-xs group-hover:scale-105 transition-transform duration-300 shrink-0 shadow-sm overflow-hidden relative`}>
                              {sub.foto_url || sub.foto ? (
                                <img src={sub.foto_url || sub.foto} alt={sub.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-white/80" style={{ fontSize: '24px' }}>person</span>
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 truncate leading-snug">{sub.name}</h5>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">{sub.assessment}</p>
                           </div>
                           <div className="text-right px-4 shrink-0">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Skor/Hasil</p>
                              <p className={`text-[10px] font-black uppercase mt-1 ${sub.score === 'Tinggi' || sub.score === 'Indikasi Depresi' || sub.score === 'Risiko Tinggi' ? 'text-rose-500' : 'text-primary'}`}>{sub.score}</p>
                           </div>
                           <button className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 shrink-0">
                              <span className="material-symbols-outlined text-base">chevron_right</span>
                           </button>
                        </div>
                      )) : (
                        <div className="py-20 text-center">
                           <span className="material-symbols-outlined text-slate-300 text-4xl mb-3">inbox</span>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tidak ada data ditemukan</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             {/* Analytics Sidebar */}
             <div className="lg:col-span-4 space-y-6">
                
                {/* Average Mental Score Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bku-primary via-[#0b338f] to-[#003B95] p-5 text-white shadow-xl shadow-blue-900/10 border border-white/5">
                   <div className="absolute -right-8 -top-5 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                   
                   <div className="relative z-10">
                      <span className="material-symbols-outlined text-white/60 mb-4" style={{ fontSize: '24px' }}>analytics</span>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2">Rata-rata Skor Mental</h4>
                      <p className="text-4xl font-extrabold tracking-tight mb-4 leading-none">{assessmentMeta.mentalScore}</p>
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
                         <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                      </div>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-300">Dihitung dari skor asesmen tersimpan</p>
                   </div>
                   <Brain size={120} className="absolute -right-8 -bottom-8 text-white/5 pointer-events-none" />
                </div>

                {/* Verification Queue Bento Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                   <h3 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-50">
                      <span className="material-symbols-outlined text-base">schedule</span> Antrean Verifikasi
                   </h3>
                   <div className="space-y-3.5">
                       {assessmentMeta.verificationQueue.map((item, i) => (
                         <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-all duration-300">
                            <div className="size-2 bg-amber-400 rounded-full animate-pulse"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-slate-800 truncate leading-none">{item.name}</p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">{item.count} data menunggu</p>
                            </div>
                            <button className="text-[8px] font-black text-primary hover:text-primary/80 uppercase tracking-widest transition-colors shrink-0">Verifikasi</button>
                         </div>
                       ))}
                       {assessmentMeta.verificationQueue.length === 0 && (
                         <div className="py-6 text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada antrean</p>
                         </div>
                       )}
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* --- ADD ASSESSMENT MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
            
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
               <div className="bg-primary p-5 text-white flex justify-between items-center relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="text-sm font-black uppercase tracking-tight font-headline">Asesmen Baru</h3>
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-0.5">Konfigurasi Instrumen Tes</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors relative z-10">
                    <span className="material-symbols-outlined text-lg" >close</span>
                  </button>
               </div>

                <form onSubmit={handleCreateAssessment} className="p-5 space-y-6">
                  <div className="space-y-4">
                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nama Instrumen</label>
                        <input 
                          required 
                          value={newAssessment.nama} 
                          onChange={(e) => setNewAssessment({ ...newAssessment, nama: e.target.value })} 
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
                          placeholder="Contoh: Tes Kecemasan DASS-21" 
                        />
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Kategori</label>
                        <select 
                          value={newAssessment.kategori} 
                          onChange={(e) => setNewAssessment({ ...newAssessment, kategori: e.target.value })} 
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none cursor-pointer"
                        >
                           {categories.map(c => <option key={c.name}>{c.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Deskripsi Singkat</label>
                        <textarea 
                          value={newAssessment.deskripsi} 
                          onChange={(e) => setNewAssessment({ ...newAssessment, deskripsi: e.target.value })} 
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none h-24 resize-none" 
                          placeholder="Jelaskan tujuan dan fungsi tes ini secara singkat..." 
                        />
                     </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Batal</button>
                     <button type="submit" className="flex-2 bg-primary text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/95 transition-all">
                        <span className="material-symbols-outlined text-base">save</span> Publikasikan Tes
                     </button>
                  </div>
               </form>
            </div>
          </div>
        )}

      </>
  );
}
