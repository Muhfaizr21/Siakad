"use client"

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../services/api'

import { Badge } from './components/ui/badge'
import { cn } from '@/lib/utils'
import { toast, Toaster } from 'react-hot-toast'
import { Card } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Filter = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>filter_alt</span>;
const Database = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>storage</span>;
const ChevronRight = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chevron_right</span>;



const normalizeAspiration = (asp = {}) => {
  const mahasiswa = asp.Mahasiswa || asp.mahasiswa || {}
  const fakultas = asp.Fakultas || asp.fakultas || mahasiswa.Fakultas || mahasiswa.fakultas || {}
  const id = asp.ID ?? asp.id ?? ''

  return {
    ...asp,
    ID: id,
    Judul: asp.Judul ?? asp.judul ?? asp.Subjek ?? asp.subjek ?? '',
    Subjek: asp.Subjek ?? asp.subjek ?? asp.Judul ?? asp.judul ?? '',
    Isi: asp.Isi ?? asp.isi ?? '',
    Kategori: asp.Kategori ?? asp.kategori ?? 'General',
    Priority: asp.Priority ?? asp.Prioritas ?? asp.prioritas ?? 'NORMAL',
    Deadline: asp.Deadline ?? asp.deadline ?? null,
    Status: asp.Status ?? asp.status ?? 'OPEN',
    Respon: asp.Respon ?? asp.respon ?? '',
    Mahasiswa: {
      ...mahasiswa,
      Nama: mahasiswa.Nama ?? mahasiswa.nama ?? 'System Identity',
      NIM: mahasiswa.NIM ?? mahasiswa.nim ?? '-',
      Fakultas: {
        ...fakultas,
        Nama: fakultas.Nama ?? fakultas.nama ?? 'Institusional',
      },
    },
    Fakultas: {
      ...fakultas,
      Nama: fakultas.Nama ?? fakultas.nama ?? 'Institusional',
    },
  }
}

const AspirationControl = () => {
  const navigate = useNavigate()
  const [aspirations, setAspirations] = useState([])
  const [stats, setStats] = useState({ active: 0, overdue: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [aspRes, statsRes] = await Promise.all([
        adminService.getGlobalAspirations(),
        adminService.getStats()
      ])

      if (aspRes.status === 'success') {
        setAspirations((aspRes.data || []).map(normalizeAspiration))
      }
      if (statsRes.status === 'success') {
        setStats({
          active: statsRes.data.aspirasi_aktif || 0,
          overdue: statsRes.data.sla_overdue || 0,
          resolved: statsRes.data.resolved_today || 0
        })
      }
    } catch (error) {
      toast.error('Gagal memuat pusat aspirasi global')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAudit = (asp) => {
    navigate(`/admin/aspirations/${asp.ID}`)
  }

  const normalizedSearch = searchTerm.toLowerCase()
  const filteredAspirations = aspirations.filter(asp => {
    const title = asp.Judul?.toString().toLowerCase() || ''
    const studentName = asp.Mahasiswa?.Nama?.toString().toLowerCase() || ''
    const facultyName = asp.Fakultas?.Nama?.toString().toLowerCase() || asp.Mahasiswa?.Fakultas?.Nama?.toString().toLowerCase() || ''
    const ticketId = asp.ID?.toString() || ''

    return title.includes(normalizedSearch) ||
      studentName.includes(normalizedSearch) ||
      facultyName.includes(normalizedSearch) ||
      ticketId.includes(searchTerm)
  })

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-1.5 bg-primary rounded-full" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Incident Management</span>
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                        Global <span className="text-primary">Aspiration Hub</span>
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                        Pusat monitoring dan resolusi aspirasi mahasiswa lintas fakultas. Pastikan setiap suara mahasiswa mendapatkan penanganan sesuai SLA.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline"
                        onClick={loadData}
                        className="h-11 px-6 rounded-xl border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm gap-2 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >show_chart</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-[10px]">Live Refresh</span>
                    </Button>
                </div>
            </div>
        </section>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex justify-center items-center text-blue-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >chat</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Active Tickets</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{stats.active}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Aspirasi menunggu respons</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#fef2f2] rounded-xl flex justify-center items-center text-[#dc2626] flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >error</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">SLA Overdue</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{stats.overdue}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Melewati batas waktu SLA</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex justify-center items-center text-[#16a34a] flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >check_circle</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Resolved Today</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{stats.resolved}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Ditangani hari ini</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex justify-center items-center text-[#00236F] flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >chat</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Total Aspirasi</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{stats.total ?? (stats.active + stats.overdue + stats.resolved)}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Seluruh aspirasi masuk</p>
           </div>
        </div>

        {/* ── Main Data Table ────────────────────────────────────── */}
        <Card className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/30 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 size-4 stroke-[3px] group-focus-within:text-primary transition-colors" >search</span>
                  <Input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-neutral-200 h-12 pl-12 rounded-xl text-xs font-bold text-neutral-900 focus:ring-primary/10 uppercase tracking-tight placeholder:text-neutral-300" 
                    placeholder="Search incident ID, student name, or faculty node..." 
                  />
              </div>
              <Button className="h-12 px-6 rounded-xl bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-widest gap-2 hover:bg-primary transition-all active:scale-95 shadow-lg shadow-neutral-900/10">
                  <Filter size={14} /> Advanced Filters
              </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50/50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100">
                  <th className="px-8 py-5">Incident Ticket</th>
                  <th className="px-8 py-5">Faculty / Sub-Unit</th>
                  <th className="px-8 py-5 text-center">Priority</th>
                  <th className="px-8 py-5">SLA / Status</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {loading ? (
                    <tr>
                        <td colSpan="5" className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <span className="material-symbols-outlined size-8 animate-spin text-primary" >sync</span>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Synchronizing Global Nodes...</p>
                            </div>
                        </td>
                    </tr>
                ) : filteredAspirations.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                                <Database size={48} className="text-neutral-300" />
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">No incident tickets found</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredAspirations.map((asp, index) => (
                        <tr key={asp.ID || `aspiration-${index}`} className="hover:bg-neutral-50/50 transition-all group">
                            <td className="px-8 py-5">
                                <div className="space-y-1">
                                    <p className="font-bold text-neutral-900 uppercase tracking-tighter text-sm font-jakarta group-hover:text-primary transition-colors">
                                    #ASP-{asp.ID?.toString().padStart(4, '0') || '----'}
                                    </p>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase truncate max-w-[220px]">
                                    {asp.Subjek || asp.Judul || 'Untranslated Subject'}
                                    </p>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-tighter font-jakarta">
                                        {asp.Fakultas?.Nama || 'Institusional Node'}
                                    </span>
                                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                                        {asp.Mahasiswa?.Nama || 'Unknown Identity'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-center">
                                <Badge className={cn('px-2.5 py-1 rounded-lg border-none text-[9px] font-bold uppercase tracking-widest shadow-sm', 
                                    asp.Priority === 'CRITICAL' ? 'bg-rose-500 text-white' : 
                                    asp.Priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>
                                    {asp.Priority || 'NORMAL'}
                                </Badge>
                            </td>
                            <td className="px-8 py-5">
                                <div className="space-y-2.5 max-w-[140px]">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className={cn('text-[9px] font-bold uppercase tracking-widest', asp.Deadline && new Date(asp.Deadline) < new Date() ? 'text-rose-500' : 'text-neutral-400')}>
                                            {asp.Deadline ? `Deadline: ${new Date(asp.Deadline).toLocaleDateString('id-ID', {day:'numeric', month:'SHORT'})}` : 'SLA Standard'}
                                        </span>
                                        <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-tight">{asp.Status || 'OPEN'}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                        <div className={cn('h-full transition-all duration-1000 rounded-full', 
                                            asp.Status === 'Selesai' ? 'w-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 
                                            asp.Status === 'Proses' ? 'w-[60%] bg-primary shadow-[0_0_8px_rgba(0,102,255,0.3)]' : 'w-[20%] bg-neutral-300')} />
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <Button 
                                variant="outline"
                                onClick={() => handleOpenAudit(asp)}
                                className="h-9 px-4 rounded-lg border-neutral-200 text-neutral-600 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all gap-2"
                                >
                                    Audit Detail
                                    <ChevronRight size={12} strokeWidth={3} />
                                </Button>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AspirationControl
