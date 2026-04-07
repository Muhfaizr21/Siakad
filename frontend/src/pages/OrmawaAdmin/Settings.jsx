import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;

  const [config, setConfig] = useState({
    name: '',
    description: '',
    vision: '',
    mission: '',
    logoUrl: '',
    email: '',
    phone: '',
    instagram: '',
    website: ''
  });

  useEffect(() => {
    fetchSettings();
  }, [ormawaId]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/settings/${ormawaId}`);
      if (!res.ok) return;

      const data = await res.json();
      if (data.status === 'success') {
         setConfig(data.data);
      }
    } catch (e) { console.error(e); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/api/ormawa/upload', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (data.status === 'success') {
        setConfig({ ...config, logoUrl: data.url });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getFullLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Clean up relative path if it exists
    const cleanPath = url.replace('./', '/');
    return `http://localhost:8000${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/settings/${ormawaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSuccess(true);
        window.dispatchEvent(new Event('ormawa_settings_updated'));
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 px-4 lg:px-8 max-w-5xl mx-auto font-body">
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black font-headline mb-2 text-on-surface">Profil & Pengaturan</h1>
              <p className="text-on-surface-variant text-sm font-medium">Kelola identitas publik dan visi misi organisasi Anda.</p>
            </div>
            {success && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Berhasil Disimpan
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSave} className="bg-surface-container-lowest border border-outline-variant/30 rounded-[2.5rem] shadow-xl p-10 space-y-8">
                <section>
                  <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">badge</span> 
                    Identitas Dasar
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2 px-1">Nama Ormawa</label>
                      <input 
                        type="text" 
                        value={config.name}
                        onChange={(e) => setConfig({...config, name: e.target.value})}
                        className="w-full p-4 bg-surface-container-low border-none rounded-2xl text-sm font-bold shadow-inner"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2 px-1">Visi</label>
                        <textarea rows="3" value={config.vision} onChange={e => setConfig({...config, vision: e.target.value})} className="w-full p-4 bg-surface-container-low border-none rounded-2xl text-sm shadow-inner"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2 px-1">Misi</label>
                        <textarea rows="3" value={config.mission} onChange={e => setConfig({...config, mission: e.target.value})} className="w-full p-4 bg-surface-container-low border-none rounded-2xl text-sm shadow-inner"></textarea>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2 px-1">Deskripsi Singkat</label>
                      <textarea 
                        rows="3"
                        value={config.description}
                        onChange={(e) => setConfig({...config, description: e.target.value})}
                        className="w-full p-4 bg-surface-container-low border-none rounded-2xl text-sm shadow-inner"
                      ></textarea>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">contact_support</span> 
                    Informasi Kontak
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 px-1">Email Resmi</label>
                      <input placeholder="Email" value={config.email || ''} onChange={e => setConfig({...config, email: e.target.value})} className="w-full p-4 bg-surface-container-low rounded-xl border-none shadow-inner text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 px-1">Nomor Telepon / WA</label>
                      <input placeholder="Telepon" value={config.phone || ''} onChange={e => setConfig({...config, phone: e.target.value})} className="w-full p-4 bg-surface-container-low rounded-xl border-none shadow-inner text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 px-1">Username Instagram</label>
                      <input placeholder="Instagram (tanpa @)" value={config.instagram || ''} onChange={e => setConfig({...config, instagram: e.target.value})} className="w-full p-4 bg-surface-container-low rounded-xl border-none shadow-inner text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 px-1">Website URL</label>
                      <input placeholder="https://..." value={config.website || ''} onChange={e => setConfig({...config, website: e.target.value})} className="w-full p-4 bg-surface-container-low rounded-xl border-none shadow-inner text-sm" />
                    </div>
                  </div>
                </section>

                <div className="pt-6 border-t border-outline-variant/10 flex justify-end">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[2.5rem] p-8 text-center flex flex-col items-center shadow-lg">
                <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-6 px-1">Logo Organisasi</h3>
                <div className="relative group cursor-pointer mb-6">
                   <div className="w-40 h-40 bg-surface-container rounded-[2rem] border-4 border-dashed border-outline-variant/40 flex flex-col items-center justify-center p-2 overflow-hidden">
                      {config.logoUrl ? (
                         <img src={getFullLogoUrl(config.logoUrl)} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                         <span className="material-symbols-outlined text-4xl text-on-surface-variant">add_photo_alternate</span>
                      )}
                   </div>
                   <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="Unggah Logo" />
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Logo akan ditampilkan di Header dan Sidebar aplikasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

