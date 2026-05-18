"use client"

import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;
const ExternalLink = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>open_in_new</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Mail = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>mail</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;



const API = `${API_BASE_URL}/faculty`

const AVATAR_COLORS = ['from-blue-400 to-indigo-500','from-emerald-400 to-teal-500','from-amber-400 to-orange-500','from-rose-400 to-pink-500','from-violet-400 to-purple-500']
const getInitials = (n='') => n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()||'?'
const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) } catch { return d } }

const SURAT_STATUS = {
  diajukan:   {cls:'bg-amber-50 text-amber-700 border-amber-200',  dot:'bg-amber-500',  label:'Antrean'},
  diproses:   {cls:'bg-blue-50 text-blue-700 border-blue-200',     dot:'bg-blue-500',   label:'Diproses'},
  siap_ambil: {cls:'bg-sky-50 text-sky-700 border-sky-200',        dot:'bg-sky-500',    label:'Siap Ambil'},
  selesai:    {cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500', label:'Selesai'},
  ditolak:    {cls:'bg-rose-50 text-rose-700 border-rose-200',     dot:'bg-rose-500',   label:'Ditolak'},
}
const getStatus = (v='') => SURAT_STATUS[(v||'diajukan').toLowerCase()] || SURAT_STATUS.diajukan

export default function FacultyPersuratan() {
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [isSubmitting, setIsSub]  = useState(false)
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState('all')
  const [adminData, setAdminData] = useState({ status:'diproses', catatan_admin:'', file_url:'' })

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/surat`)
      if (res.data.status === 'success') setRequests((res.data.data||[]).map((r,i)=>({...r, colorIdx: i % AVATAR_COLORS.length})))
    } catch { toast.error('Gagal mengambil data pengajuan surat') }
    finally { setLoading(false) }
  }

  const handleUpdate = async (e) => {
    if (e) e.preventDefault(); setIsSub(true)
    try {
      const res = await axios.put(`${API}/surat/${selected.ID}`, adminData)
      if (res.data.status === 'success') { toast.success('Status surat diperbarui'); setSelected(null); fetchRequests() }
      else toast.error(res.data.message||'Gagal update')
    } catch (err) { toast.error(err.response?.data?.message||'Server sibuk') }
    finally { setIsSub(false) }
  }

  useEffect(() => { fetchRequests() }, [])

  const filtered = useMemo(() => requests.filter(r => {
    const q = search.toLowerCase()
    const matchQ = !q || r.Mahasiswa?.Nama?.toLowerCase().includes(q) || r.Mahasiswa?.NIM?.includes(q) || r.Jenis?.toLowerCase().includes(q)
    const matchS = filterStatus==='all' || (r.Status||'diajukan').toLowerCase()===filterStatus
    return matchQ && matchS
  }), [requests, search, filterStatus])

  const stats = {
    total:   requests.length,
    proses:  requests.filter(r=>r.Status==='diproses').length,
    selesai: requests.filter(r=>r.Status==='selesai').length,
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-body">
      <Toaster position="top-right"/>
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-6">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl h-auto md:h-48 flex flex-col md:flex-row items-center group shadow-sm p-6 md:p-8 border border-slate-200/80 bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2"><div className="h-4 w-1.5 bg-primary rounded-full"/><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Administrasi Digital</span></div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight">E-<span className="text-primary">Persuratan</span></h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">Kelola antrean dan monitoring pengajuan surat resmi mahasiswa secara digital.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={()=>alert('Ekspor...')} className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm">
                <Download size={14} className="text-primary"/> Ekspor
              </button>
              <button onClick={fetchRequests} disabled={loading} className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
                {loading?<span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span>:<RefreshCw size={14} className="text-primary"/>} Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {label:'Total Antrean',  value:stats.total,   icon:Mail,         bg:'bg-[#eef4ff]',  color:'text-[#00236F]',   desc:'Semua pengajuan'},
            {label:'Sedang Proses',  value:stats.proses,  icon:RefreshCw,    bg:'bg-amber-50',   color:'text-amber-600',   desc:'Dalam pengerjaan'},
            {label:'Selesai Terbit', value:stats.selesai, icon:CheckCircle2, bg:'bg-emerald-50', color:'text-emerald-600', desc:'Dokumen diterbitkan'},
          ].map(s=>(
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',s.bg,s.color)}><s.icon size={18}/></div>
                <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] leading-none tabular-nums">{loading?<span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span>:s.value}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0f0f0] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-[#171717]">Daftar Pengajuan Surat</h2>
              <p className="text-xs text-[#737373] mt-0.5">Menampilkan <span className="font-bold text-[#171717]">{filtered.length}</span> dari <span className="font-bold text-primary">{requests.length}</span> pengajuan</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder="Cari nama, NIM, jenis surat..." value={search} onChange={e=>setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-52 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-primary text-sm bg-white"/>
              </div>
              <select value={filterStatus} onChange={e=>setFilter(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-[#e5e5e5] text-xs font-medium bg-white text-[#525252] focus:outline-none focus:border-primary appearance-none cursor-pointer">
                <option value="all">Semua Status</option>
                <option value="diajukan">Antrean</option>
                <option value="diproses">Proses</option>
                <option value="siap_ambil">Siap Ambil</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  {['Ref','Pengusul','Jenis Surat','Catatan','Status','Tanggal','Aksi'].map(h=>(
                    <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading?Array.from({length:5}).map((_,i)=>(
                  <tr key={i} className="border-b border-[#f0f0f0]">{[...Array(7)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse"/></td>)}</tr>
                )):filtered.length===0?(
                  <tr><td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >mail</span></div>
                      <p className="font-bold text-sm text-[#171717]">Tidak Ada Pengajuan</p>
                    </div>
                  </td></tr>
                ):filtered.map((row,i)=>{
                  const st = getStatus(row.Status)
                  return (
                    <tr key={row.ID||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5"><span className="font-mono text-primary font-black text-[11px] tracking-widest">#{row.ID}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 shadow-sm',AVATAR_COLORS[row.colorIdx])}>{getInitials(row.Mahasiswa?.Nama)}</div>
                          <div><p className="font-bold text-sm text-[#171717]">{row.Mahasiswa?.Nama||'—'}</p><p className="text-[10px] text-[#a3a3a3] font-medium">{row.Mahasiswa?.NIM||'—'}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><p className="font-bold text-sm text-[#171717] max-w-[160px] truncate">{row.Jenis||'—'}</p></td>
                      <td className="px-5 py-3.5 max-w-[160px]"><p className="text-xs text-[#737373] italic line-clamp-1">"{row.Catatan||'—'}"</p></td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider',st.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full',st.dot)}/>{st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#737373] font-medium whitespace-nowrap">{formatDate(row.CreatedAt)}</td>
                      <td className="px-5 py-3.5">
                        <button onClick={()=>{setSelected(row);setAdminData({status:row.Status||'diproses',catatan_admin:row.Catatan||'',file_url:row.FileURL||''})}}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-primary bg-[#eef4ff] border border-[#c9d8ff] rounded-lg hover:bg-primary hover:text-white transition-all active:scale-95">
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }} Check >security</span> Verify
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]" onClick={e=>e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#00236F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <button onClick={()=>setSelected(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span></button>
              <div className="relative z-10">
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">#{selected.ID} · {selected.Mahasiswa?.Nama}</p>
                <h2 className="text-xl font-extrabold text-white">{selected.Jenis}</h2>
                <p className="text-xs text-blue-200 italic mt-1">"{selected.Catatan}"</p>
              </div>
            </div>
            <form onSubmit={handleUpdate} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div><label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Status Progress Terkini</label>
                  <select value={adminData.status} onChange={e=>setAdminData(d=>({...d,status:e.target.value}))}
                    className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary appearance-none">
                    <option value="diajukan">Diterima (Antrean)</option>
                    <option value="diproses">Sedang Diproses</option>
                    <option value="siap_ambil">Siap Diambil (Fisik)</option>
                    <option value="selesai">Selesai (Digital Terbit)</option>
                    <option value="ditolak">Tolak Pengajuan</option>
                  </select>
                </div>
                <div><label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Link Lampiran Digital</label>
                  <div className="relative">
                    <input value={adminData.file_url} onChange={e=>setAdminData(d=>({...d,file_url:e.target.value}))} placeholder="https://drive.google.com/..."
                      className="w-full h-11 px-4 pr-11 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all"/>
                    <ExternalLink className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c4c4c4]" size={14}/>
                  </div>
                </div>
                <div><label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Feedback Administratif</label>
                  <textarea value={adminData.catatan_admin} onChange={e=>setAdminData(d=>({...d,catatan_admin:e.target.value}))} rows={4}
                    placeholder="Informasikan detail pengambilan atau alasan penolakan..."
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] focus:outline-none focus:border-primary focus:bg-white text-sm text-[#171717] transition-all resize-none"/>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
                <button type="button" onClick={()=>setSelected(null)} className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-11 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting?<span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span>:<span className="material-symbols-outlined" style={{ fontSize: '14px' }} >check_circle</span>} Verifikasi & Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
