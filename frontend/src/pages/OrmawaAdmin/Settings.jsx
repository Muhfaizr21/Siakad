"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '../FacultyAdmin/components/button'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Input } from '../FacultyAdmin/components/input'
import { Label } from '../FacultyAdmin/components/label'
import { Textarea } from '../FacultyAdmin/components/textarea'
import { Badge } from '../FacultyAdmin/components/badge'
import { Settings2, Save, Loader2, Upload, CheckCircle2, Globe } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'
import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

const FieldGroup = ({ label, children }) => (
  <div className="space-y-2">
    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">{label}</Label>
    {children}
  </div>
)

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [config, setConfig] = useState({ Nama: '', Deskripsi: '', Visi: '', Misi: '', LogoURL: '', Email: '', Phone: '', Instagram: '', Website: '' })
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.ID || 1

  const fetchSettings = async () => {
    try {
      const data = await fetchWithAuth(`${API}/settings/${ormawaId}`)
      if (data.status === 'success') setConfig(data.data)
    } catch {}
  }
  useEffect(() => { fetchSettings() }, [])

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const json = await fetchWithAuth(`${API}/upload`, { method: 'POST', body: fd })
      if (json.status === 'success') { setConfig(c => ({ ...c, LogoURL: json.url })); toast.success('Logo diperbarui') }
      else toast.error('Gagal upload logo')
    } catch { toast.error('Gagal upload') } finally { setUploading(false) }
  }

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const json = await fetchWithAuth(`${API}/settings/${ormawaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (json.status === 'success') { toast.success('Pengaturan berhasil disimpan'); window.dispatchEvent(new Event('ormawa_settings_updated')) }
      else toast.error(json.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setLoading(false) }
  }

  const getLogoPath = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseDomain = API_BASE_URL ? API_BASE_URL.replace('/api', '') : 'http://localhost:8000';
    return `${baseDomain}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  const logoUrl = getLogoPath(config.LogoURL);

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-20 px-6 pb-12">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Settings2 className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Pengaturan Sistem</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Konfigurasi Profil & Identitas Ormawa</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Logo Panel */}
              <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md lg:col-span-1">
                <CardContent className="p-8 flex flex-col items-center gap-6">
                  <div className="w-28 h-28 rounded-[2rem] border-2 border-slate-100 shadow-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                    {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" /> : <Settings2 className="size-10 text-slate-300" />}
                  </div>
                  <label className="cursor-pointer w-full">
                    <div className="w-full h-11 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100/80 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all">
                      {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                      {uploading ? 'Mengunggah...' : 'Upload Logo'}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">PNG/JPG, Maks. 2MB<br />Disarankan 1:1 (persegi)</p>
                </CardContent>
              </Card>

              {/* Form Panel */}
              <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md lg:col-span-2">
                <CardContent className="p-8 space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-1.5 font-headline"><CheckCircle2 className="size-3" /> IDENTITAS ORGANISASI</p>
                    <div className="space-y-5">
                      <FieldGroup label="Nama Ormawa">
                        <Input required value={config.Nama} onChange={e => setConfig({ ...config, Nama: e.target.value })} placeholder="Nama resmi organisasi..."
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
                      </FieldGroup>
                      <FieldGroup label="Deskripsi Singkat">
                        <Textarea value={config.Deskripsi} onChange={e => setConfig({ ...config, Deskripsi: e.target.value })} placeholder="Deskripsi singkat organisasi..."
                          className="min-h-[80px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed font-headline" />
                      </FieldGroup>
                      <div className="grid grid-cols-1 gap-5">
                        <FieldGroup label="Visi">
                          <Textarea value={config.Visi} onChange={e => setConfig({ ...config, Visi: e.target.value })} placeholder="Visi organisasi..."
                            className="min-h-[60px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed font-headline" />
                        </FieldGroup>
                        <FieldGroup label="Misi">
                          <Textarea value={config.Misi} onChange={e => setConfig({ ...config, Misi: e.target.value })} placeholder="Misi organisasi..."
                            className="min-h-[60px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed font-headline" />
                        </FieldGroup>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-1.5 font-headline"><Globe className="size-3" /> KONTAK & MEDIA SOSIAL</p>
                    <div className="grid grid-cols-2 gap-4">
                      <FieldGroup label="Email">
                        <Input type="email" value={config.Email} onChange={e => setConfig({ ...config, Email: e.target.value })} placeholder="email@ormawa.com"
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
                      </FieldGroup>
                      <FieldGroup label="Telepon">
                        <Input value={config.Phone} onChange={e => setConfig({ ...config, Phone: e.target.value })} placeholder="08xx-xxxx-xxxx"
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
                      </FieldGroup>
                      <FieldGroup label="Instagram">
                        <Input value={config.Instagram} onChange={e => setConfig({ ...config, Instagram: e.target.value })} placeholder="@nama_ormawa"
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
                      </FieldGroup>
                      <FieldGroup label="Website">
                        <Input type="url" value={config.Website} onChange={e => setConfig({ ...config, Website: e.target.value })} placeholder="https://ormawa.bku.ac.id"
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
                      </FieldGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={loading} className="h-14 px-12 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 font-headline">
                {loading ? <Loader2 className="animate-spin size-5 mr-3" /> : <Save className="size-5 mr-3 stroke-[2.5px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Simpan Semua Perubahan</span>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
