"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '../FacultyAdmin/components/button'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Input } from '../FacultyAdmin/components/input'
import { Label } from '../FacultyAdmin/components/label'
import { Textarea } from '../FacultyAdmin/components/textarea'
import { Badge } from '../FacultyAdmin/components/badge'

import { toast, Toaster } from 'react-hot-toast'
import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

const FieldGroup = ({ label, children }) => (
 <div className="space-y-2">
 <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">{label}</Label>
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
 const baseDomain = API_BASE_URL ? API_BASE_URL.replace('/api', '') : '';
 return `${baseDomain}${path.startsWith('/') ? '' : '/'}${path}`;
 }
 const logoUrl = getLogoPath(config.LogoURL);

 return (
 <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
 <Toaster position="top-right" />
 
 {/* ── Welcome Banner ─────────────────────────────────────────── */}
 <section className="relative overflow-hidden rounded-3xl h-auto md:h-48 flex flex-col md:flex-row items-center group shadow-sm p-8 md:p-0 border border-slate-200/80">
 <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
 <div className="absolute inset-0 opacity-[0.03]"
 style={{
 backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
 backgroundSize: '60px 60px'
 }}
 />
 <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
 <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

 <div className="relative z-10 md:px-10 flex-1 flex flex-col justify-center items-start w-full gap-2">
 <div className="flex items-center gap-2 mb-3">
 <span className="h-1.5 w-6 bg-primary/40 rounded-full" />
 <span className="text-[10px] font-bold text-slate-400 tracking-[0.25em]">
 Ormawa Admin
 </span>
 </div>
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-primary/10 backdrop-blur-md rounded-xl text-primary shadow-inner">
 <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >settings</span>
 </div>
 <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
 Pengaturan Sistem
 </h1>
 </div>
 <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
 Konfigurasi identitas, profil, dan detail kontak untuk halaman publik Ormawa.
 </p>
 </div>
 </section>

 {/* ── Content Area ───────────────────────────────────────────── */}
 <form onSubmit={handleSave}>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Logo Panel */}
 <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md lg:col-span-1">
 <CardContent className="p-5 md:p-8 flex flex-col items-center gap-5 md:gap-6">
 <div className="w-28 h-28 rounded-[2rem] border-2 border-slate-100 shadow-xl overflow-hidden bg-slate-50 flex items-center justify-center">
 {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" /> : <span className="material-symbols-outlined size-10 text-slate-300" >settings</span>}
 </div>
 <label className="cursor-pointer w-full">
 <div className="w-full h-11 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100/80 flex items-center justify-center gap-2 text-[10px] font-black tracking-widest text-slate-500 transition-all">
 {uploading ? <span className="material-symbols-outlined size-4 animate-spin" >sync</span> : <span className="material-symbols-outlined size-4" >upload</span>}
 {uploading ? 'Mengunggah...' : 'Upload Logo'}
 </div>
 <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
 </label>
 <p className="text-[9px] font-bold text-slate-400 tracking-widest text-center">PNG/JPG, Maks. 2MB<br />Disarankan 1:1 (persegi)</p>
 </CardContent>
 </Card>

 {/* Form Panel */}
 <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md lg:col-span-2">
 <CardContent className="p-5 md:p-8 space-y-5 md:space-y-6">
 <div>
 <p className="text-[9px] font-black text-primary tracking-widest mb-4 flex items-center gap-1.5 font-headline"><span className="material-symbols-outlined size-3" >check_circle</span> IDENTITAS ORGANISASI</p>
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
 <p className="text-[9px] font-black text-primary tracking-widest mb-4 flex items-center gap-1.5 font-headline"><span className="material-symbols-outlined size-3" >language</span> KONTAK & MEDIA SOSIAL</p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
 <Button type="submit" disabled={loading} className="w-full md:w-auto h-12 md:h-14 px-8 md:px-12 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 font-headline">
 {loading ? <span className="material-symbols-outlined animate-spin size-5 mr-3" >sync</span> : <span className="material-symbols-outlined size-5 mr-3 stroke-[2.5px]" >save</span>}
 <span className="text-[10px] font-black tracking-[0.2em]">Simpan Semua Perubahan</span>
 </Button>
 </div>
 </form>
 </div>
 )
}
