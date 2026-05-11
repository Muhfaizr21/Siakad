import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { 
  User, Shield, Briefcase, Bell,
  Save, Camera, Key, Lock,
  Mail, Phone, Globe, MapPin,
  Clock, DollarSign, Languages
} from 'lucide-react';
import { UI } from '../../constants/designSystem';

export default function PsychologistSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profil');

  const tabs = [
    { id: 'profil', label: 'Profil Publik', icon: User },
    { id: 'keamanan', label: 'Keamanan', icon: Shield },
    { id: 'praktek', label: 'Pengaturan Praktek', icon: Briefcase },
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className={UI.layout.canvas}>
          
          {/* Header Section */}
          <div className="mb-8">
             <h1 className="text-xl font-black text-primary uppercase tracking-tight font-headline">Pengaturan Akun</h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kelola identitas profesional dan preferensi sistem</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* Left Sidebar: Tab Navigation (Col 3) */}
             <div className="lg:col-span-3 space-y-2">
                {tabs.map((tab) => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                   >
                      <tab.icon size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                   </button>
                ))}
             </div>

             {/* Right Content: Tab Panel (Col 9) */}
             <div className="lg:col-span-9">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                   
                   {/* Profile Tab */}
                   {activeTab === 'profil' && (
                      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                         {/* Photo Uploader */}
                         <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-50">
                            <div className="relative group">
                               <div className="size-32 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                  <img src="https://ui-avatars.com/api/?name=Psikolog+BKU&background=0284c7&color=fff&size=200" alt="Profile" className="w-full h-full object-cover" />
                               </div>
                               <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                                  <Camera size={18} />
                               </button>
                            </div>
                            <div className="text-center md:text-left">
                               <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Foto Profil</h4>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Format JPG atau PNG. Maksimal 2MB.</p>
                               <div className="flex gap-2">
                                  <button className="px-4 py-2 bg-primary/5 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all">Ganti Foto</button>
                                  <button className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all">Hapus</button>
                               </div>
                            </div>
                         </div>

                         {/* Basic Info Form */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                               <div>
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nama Lengkap</label>
                                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" defaultValue="Psikolog BKU" />
                               </div>
                               <div>
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Email Institusi</label>
                                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" defaultValue="psikolog@bku.ac.id" />
                               </div>
                            </div>
                            <div className="space-y-4">
                               <div>
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Spesialisasi</label>
                                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" defaultValue="Psikolog Klinis" />
                               </div>
                               <div>
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nomor Telepon</label>
                                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" defaultValue="+62 812 3456 7890" />
                               </div>
                            </div>
                            <div className="md:col-span-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Bio Profesional</label>
                               <textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all h-32 resize-none" defaultValue="Berpengalaman lebih dari 5 tahun dalam menangani stres akademik dan pengembangan diri mahasiswa." />
                            </div>
                         </div>
                      </div>
                   )}

                   {/* Security Tab */}
                   {activeTab === 'keamanan' && (
                      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                         <div className="flex items-center gap-4 p-6 bg-rose-50 rounded-3xl border border-rose-100">
                            <Lock size={24} className="text-rose-500" />
                            <div>
                               <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Keamanan Akun</h4>
                               <p className="text-[11px] font-medium text-rose-500 mt-0.5 uppercase tracking-tight">Gunakan kombinasi password yang kuat untuk melindungi data pasien.</p>
                            </div>
                         </div>

                         <div className="max-w-md space-y-6">
                            <div>
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block text-left">Password Saat Ini</label>
                               <div className="relative">
                                  <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                                  <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                               </div>
                            </div>
                            <div>
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block text-left">Password Baru</label>
                               <input type="password" placeholder="Min. 8 Karakter" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                            </div>
                            <div>
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block text-left">Konfirmasi Password Baru</label>
                               <input type="password" placeholder="Ulangi Password" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                            </div>
                         </div>
                      </div>
                   )}

                   {/* Practice Tab */}
                   {activeTab === 'praktek' && (
                      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                               <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                  <Clock size={16} /> Jadwal Praktek Aktif
                               </h4>
                               <div className="space-y-3">
                                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(day => (
                                     <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{day}</span>
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">09:00 - 16:00</span>
                                     </div>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-6">
                               <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                  <DollarSign size={16} /> Informasi Tarif
                               </h4>
                               <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                                  <p className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-2">Tarif Konseling / Jam</p>
                                  <div className="flex items-baseline gap-2">
                                     <span className="text-2xl font-black font-headline">Rp 150.000</span>
                                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Subsidi Kampus</span>
                                  </div>
                               </div>
                               <div className="space-y-4">
                                  <div>
                                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Bahasa</label>
                                     <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-primary/5 text-primary border border-primary/20 rounded-lg text-[8px] font-black uppercase tracking-widest">Indonesia</span>
                                        <span className="px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest">Inggris</span>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   )}

                   {/* Footer Actions */}
                   <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                      <button className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Batal</button>
                      <button className="px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2">
                         <Save size={16} /> Simpan Perubahan
                      </button>
                   </div>
                </div>
             </div>

          </div>

        </div>
      </main>
    </div>
  );
}
