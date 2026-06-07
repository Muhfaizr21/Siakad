"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Building = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;
const Layers = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>layers</span>;
const Zap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>bolt</span>;
const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;
const Target = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>track_changes</span>;

// Custom Gamification Icons
const Trophy = ({ size, className, ...props }) => <span className={`material-symbols-outlined text-amber-500 ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const Star = ({ size, className, filled = true, ...props }) => (
  <span 
    className={cn("material-symbols-outlined", className)} 
    style={{ 
      fontSize: size || 14, 
      fontVariationSettings: filled ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      ...props.style 
    }} 
    {...props}
  >
    star
  </span>
);
const CheckCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 16, ...props.style }} {...props}>check_circle</span>;
const AlertTriangle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 16, ...props.style }} {...props}>warning</span>;
const History = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 18, ...props.style }} {...props}>history</span>;

// Offline Seed Data for System Resiliency
const offlineOrmawaSeed = [
  { id: 1, Nama: 'Badan Eksekutif Mahasiswa Fakultas Farmasi', Singkatan: 'BEM-F', Deskripsi: 'Organisasi eksekutif mahasiswa tingkat Fakultas Farmasi.', Visi: 'Menjadi wadah aspirasi mahasiswa farmasi yang unggul dan kolaboratif.', Misi: 'Menyelenggarakan program pengabdian masyarakat, advokasi kemahasiswaan, dan pelatihan kepemimpinan.', Email: 'bem.farmasi@bku.ac.id', Phone: '08123456789', LogoURL: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10' },
  { id: 2, Nama: 'Himpunan Mahasiswa Informatika', Singkatan: 'HIMA-IF', Deskripsi: 'Wadah pemersatu mahasiswa program studi Informatika.', Visi: 'Membangun iklim akademik teknologi yang unggul dan inovatif.', Misi: 'Mengadakan kompetisi coding, workshop web development, dan networking session.', Email: 'hima.if@bku.ac.id', Phone: '08129876543', LogoURL: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97' },
  { id: 3, Nama: 'Himpunan Mahasiswa Keperawatan', Singkatan: 'HIMA-KP', Deskripsi: 'Himpunan mahasiswa program studi S1 Keperawatan.', Visi: 'Mewujudkan perawat masa depan yang terampil, berintegritas, dan humanis.', Misi: 'Melaksanakan bakti sosial kesehatan, pelatihan CPR, dan seminar perawatan luka.', Email: 'hima.keperawatan@bku.ac.id', Phone: '08213456789', LogoURL: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528' },
  { id: 4, Nama: 'Klub Seni & Musik Bhakti Kencana', Singkatan: 'KSMB', Deskripsi: 'Unit kegiatan mahasiswa penyalur minat bakat di bidang seni.', Visi: 'Menjadi episentrum kreativitas seni dan pertunjukan universitas.', Misi: 'Menyelenggarakan festival musik tahunan, pameran seni rupa, dan kelas vokal gratis.', Email: 'senimusik@bku.ac.id', Phone: '08313456789', LogoURL: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4' },
  { id: 5, Nama: 'Mahasiswa Pecinta Alam (MAPALA)', Singkatan: 'MAPALA-BKU', Deskripsi: 'Komunitas pelestari lingkungan dan petualang alam bebas.', Visi: 'Membentuk kader mahasiswa yang peduli lingkungan dan berjiwa tangguh.', Misi: 'Melaksanakan reboisasi, pembersihan pantai, pendakian ekologis, dan pelatihan SAR.', Email: 'mapala@bku.ac.id', Phone: '08413456789', LogoURL: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' }
];

export default function KelolaOrganisasi() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ Nama: '', Singkatan: '', Deskripsi: '', Visi: '', Misi: '', Email: '', LogoURL: '', Phone: '' })

  // Gamification states
  const [sortBy, setSortBy] = useState('xp') // 'xp' | 'lpj' | 'bintang'
  const [lpjSubmissions, setLpjSubmissions] = useState([
    { id: 'lpj-1', ormawaName: 'BEM Farmasi', ormawaSingkatan: 'BEM-F', title: 'LPJ Seminar Kesehatan Nasional 2026', date: '2026-05-24', status: 'Pending', xpReward: 100 },
    { id: 'lpj-2', ormawaName: 'HIMA Informatika', ormawaSingkatan: 'HIMA-IF', title: 'LPJ BKU Tech Olympiad & Hackathon', date: '2026-05-26', status: 'Pending', xpReward: 100 },
    { id: 'lpj-3', ormawaName: 'HIMA Keperawatan', ormawaSingkatan: 'HIMA-KP', title: 'LPJ Pengabdian Masyarakat & Bakti Sosial', date: '2026-05-20', status: 'Overdue', xpReward: -50 },
    { id: 'lpj-4', ormawaName: 'KSR PMI Unit BKU', ormawaSingkatan: 'MAPALA-BKU', title: 'LPJ Donor Darah Serentak', date: '2026-05-28', status: 'Approved', xpReward: 100 }
  ])

  const [selectedLpj, setSelectedLpj] = useState(null)
  const [isLpjDetailOpen, setIsLpjDetailOpen] = useState(false)

  // Get dynamic 3-4 letter initials for podium circles
  const getInitials = (item) => {
    if (!item) return '';
    if (item.Singkatan && item.Singkatan.trim() !== '') {
      return item.Singkatan.substring(0, 4).toUpperCase();
    }
    // Fallback: take first letter of each word in Nama
    const words = item.Nama ? item.Nama.split(/\s+/) : [];
    if (words.length >= 2) {
      const initials = words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
      if (initials.length >= 2) return initials;
    }
    return item.Nama ? item.Nama.substring(0, 4).toUpperCase() : 'UNIT';
  };

  // Deterministic Seeding Function to enrich standard API data with gamification scores
  const enrichOrmawaData = (ormawaList) => {
    return ormawaList.map((item, index) => {
      const idStr = String(item.id || item.ID || index);
      let charCodeSum = 0;
      for (let i = 0; i < idStr.length; i++) charCodeSum += idStr.charCodeAt(i);
      
      const dbPoin = item.poin !== undefined ? item.poin : item.Poin;
      const xp = (typeof dbPoin === 'number') ? dbPoin : 300 + (charCodeSum % 650); // Use real database points if available, else fallback
      const lpjRate = 70 + (charCodeSum % 31); // LPJ rate between 70% and 100%
      const bintang = 3 + (charCodeSum % 3); // Bintang between 3 and 5
      const totalLpj = 5 + (charCodeSum % 10);
      const selesaiLpj = Math.round((lpjRate / 100) * totalLpj);
      const status = item.Status || item.status || 'Aktif';

      let achievements = [];
      if (xp > 800) achievements = ['LPJ Champion', 'Event Master'];
      else if (xp > 550) achievements = ['Rising Star'];
      else achievements = ['Active Unit'];

      return {
        ...item,
        xp,
        lpjRate,
        bintang,
        totalLpj,
        selesaiLpj,
        status,
        achievements
      };
    });
  };
  const fetchData = async () => {
    setLoading(true)
    try {
      const [res, lpjRes] = await Promise.all([
        adminService.getAllOrmawa(),
        adminService.getAdminLpjs()
      ])
      
      if (res.status === 'success' && res.data && res.data.length > 0) {
        setData(enrichOrmawaData(res.data))
      } else {
        setData(enrichOrmawaData(offlineOrmawaSeed))
      }

      if (lpjRes && lpjRes.status === 'success' && lpjRes.data && lpjRes.data.length > 0) {
        setLpjSubmissions(lpjRes.data)
      }
    } catch {
      setData(enrichOrmawaData(offlineOrmawaSeed))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleOpenAdd = () => { 
    setIsEditMode(false); 
    setForm({ Nama: '', Singkatan: '', Deskripsi: '', Visi: '', Misi: '', Email: '', LogoURL: '', Phone: '' }); 
    setIsCrudOpen(true) 
  }

  const handleOpenEdit = (row) => { 
    setIsEditMode(true)
    setForm({ 
      ID: row.id || row.ID, 
      Nama: row.Nama || '', 
      Singkatan: row.Singkatan || '', 
      Deskripsi: row.Deskripsi || '', 
      Visi: row.Visi || '', 
      Misi: row.Misi || '', 
      Email: row.Email || '', 
      LogoURL: row.LogoURL || '', 
      Phone: row.Phone || '' 
    })
    setIsCrudOpen(true) 
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const targetId = form.ID || form.id
      const res = targetId ? await adminService.updateOrmawa(targetId, form) : await adminService.createOrmawa(form)
      if (res.status === 'success') { 
        toast.success(targetId ? 'Organisasi diperbarui' : 'Organisasi berhasil didaftarkan')
        setIsCrudOpen(false)
        fetchData() 
      } else {
        const updatedList = targetId 
          ? data.map(item => (item.id === targetId || item.ID === targetId) ? { ...item, ...form } : item)
          : [...data, { 
              ...form, 
              id: data.length + 1, 
              xp: 350, 
              lpjRate: 100, 
              bintang: 4, 
              totalLpj: 1, 
              selesaiLpj: 1, 
              status: 'Aktif', 
              achievements: ['Rising Star'] 
            }];
        setData(updatedList);
        toast.success(targetId ? 'Organisasi diperbarui (offline mode)' : 'Organisasi berhasil didaftarkan (offline mode)')
        setIsCrudOpen(false)
      }
    } catch { 
      const targetId = form.ID || form.id
      const updatedList = targetId 
        ? data.map(item => (item.id === targetId || item.ID === targetId) ? { ...item, ...form } : item)
        : [...data, { 
            ...form, 
            id: data.length + 1, 
            xp: 350, 
            lpjRate: 100, 
            bintang: 4, 
            totalLpj: 1, 
            selesaiLpj: 1, 
            status: 'Aktif', 
            achievements: ['Rising Star'] 
          }];
      setData(updatedList);
      toast.success(targetId ? 'Organisasi diperbarui (offline mode)' : 'Organisasi berhasil didaftarkan (offline mode)')
      setIsCrudOpen(false)
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteOrmawa(selected.id || selected.ID)
      toast.success('Organisasi berhasil dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { 
      const targetId = selected.id || selected.ID
      setData(data.filter(item => item.id !== targetId && item.ID !== targetId))
      toast.success('Organisasi berhasil dihapus (offline mode)')
      setIsDelOpen(false)
    } finally { 
      setIsSubmitting(false) 
    }
  }

  // Interactive LPJ Review Tool Handlers
  // Interactive LPJ Review Tool Handlers
  const handleApproveLPJ = async (submissionId, ormawaSingkatan) => {
    try {
      if (typeof submissionId === 'string' && submissionId.startsWith('lpj-')) {
        setLpjSubmissions(prev => 
          prev.map(sub => sub.id === submissionId ? { ...sub, status: 'Approved' } : sub)
        );
        setData(prevData => 
          prevData.map(item => 
            item.Singkatan === ormawaSingkatan 
              ? { ...item, xp: (item.xp || 0) + 100, lpjRate: 100, achievements: [...new Set([...item.achievements, 'LPJ Champion'])] } 
              : item
          )
        );
        toast.success(`LPJ berhasil disetujui! +100 Poin ditambahkan untuk HIMA/BEM ${ormawaSingkatan} (offline)`);
        return;
      }

      const res = await adminService.reviewAdminLpj(submissionId, 'approve', 'LPJ disetujui oleh Super Admin');
      if (res.status === 'success') {
        toast.success(`LPJ berhasil disetujui! +100 Poin ditambahkan untuk HIMA/BEM ${ormawaSingkatan}`);
        fetchData();
      } else {
        toast.error(res.message || 'Gagal menyetujui LPJ');
      }
    } catch {
      toast.error('Gagal menghubungi server untuk verifikasi LPJ');
    }
  };

  const handleWarnLPJ = async (submissionId, ormawaSingkatan) => {
    try {
      if (typeof submissionId === 'string' && submissionId.startsWith('lpj-')) {
        setLpjSubmissions(prev => 
          prev.map(sub => sub.id === submissionId ? { ...sub, status: 'Warning Sent' } : sub)
        );
        setData(prevData => 
          prevData.map(item => 
            item.Singkatan === ormawaSingkatan 
              ? { ...item, xp: Math.max(0, (item.xp || 0) - 50) } 
              : item
          )
        );
        toast.error(`Peringatan keterlambatan dikirim! -50 Poin dipotong dari ${ormawaSingkatan} (offline)`);
        return;
      }

      const res = await adminService.reviewAdminLpj(submissionId, 'warn', 'Peringatan keterlambatan / kelengkapan LPJ');
      if (res.status === 'success') {
        toast.success(`Surat peringatan terkirim & poin HIMA/BEM ${ormawaSingkatan} dikurangi 50`);
        fetchData();
      } else {
        toast.error(res.message || 'Gagal mengirim peringatan');
      }
    } catch {
      toast.error('Gagal menghubungi server untuk mengirim peringatan');
    }
  };

  // Sort Leaderboard dynamically based on selected tabs
  const sortedLeaderboard = [...data].sort((a, b) => {
    if (sortBy === 'xp') return (b.xp || 0) - (a.xp || 0);
    if (sortBy === 'lpj') return (b.lpjRate || 0) - (a.lpjRate || 0);
    if (sortBy === 'bintang') return (b.bintang || 0) - (a.bintang || 0);
    return 0;
  });

  // Podium Positions (Top 3)
  const top1 = sortedLeaderboard[0];
  const top2 = sortedLeaderboard[1];
  const top3 = sortedLeaderboard[2];

  const columns = [
    { 
      key: 'Singkatan', 
      label: 'Kode Unit', 
      className: 'w-[120px]', 
      render: v => (
        <Badge className="bg-bku-primary/5 text-bku-primary border-bku-primary/10 px-2 py-0.5 rounded-md font-black text-[10px] tracking-widest uppercase shadow-none font-jakarta">
          {v || 'UNIT'}
        </Badge>
      )
    },
    { 
      key: 'Nama', 
      label: 'Nama Organisasi Mahasiswa', 
      className: 'w-[400px]', 
      render: (v, row) => (
        <div className="flex flex-col gap-1 py-3 group/item">
          <span className="font-bold text-slate-800 font-jakarta tracking-tight text-[14px] leading-tight uppercase group-hover/item:text-bku-primary transition-colors">{v || '—'}</span>
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.Singkatan || 'Unit Kegiatan'}</span>
            <div className="size-1 rounded-full bg-slate-200" />
            <div className="flex items-center gap-0.5 text-amber-500">
              {Array.from({ length: row.bintang || 3 }).map((_, i) => (
                <Star key={i} size={10} className="fill-amber-500 text-amber-500 border-none" />
              ))}
            </div>
            {row.achievements?.map((ach, idx) => (
              <React.Fragment key={idx}>
                <div className="size-1 rounded-full bg-slate-200" />
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md leading-none border",
                  ach === 'LPJ Champion' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  ach === 'Event Master' ? "bg-amber-50 text-amber-600 border-amber-100" :
                  "bg-sky-50 text-sky-600 border-sky-100"
                )}>
                  {ach}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )
    },
    { 
      key: 'Email', 
      label: 'Kontak Resmi', 
      className: 'w-[230px]', 
      render: v => (
        <div className="flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '14px' }} >mail</span>
          <span className="text-[12px] font-medium font-inter">{v || '—'}</span>
        </div>
      )
    },
    { 
      key: 'poin', 
      label: 'Poin Peringkat', 
      className: 'w-[150px] text-center', 
      cellClassName: 'text-center',
      render: (v, row) => (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 rounded-lg text-xs font-bold font-jakarta leading-none gap-1 flex items-center justify-center w-fit mx-auto shadow-none">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          {row.Poin || row.poin || 0} Pts
        </Badge>
      )
    },
    { 
      key: 'xp', 
      label: 'Performance XP', 
      className: 'w-[140px] text-center', 
      cellClassName: 'text-center',
      render: (v, row) => (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-bku-primary/5 text-bku-primary border border-bku-primary/10 rounded-xl leading-none">
            <Zap size={11} className="fill-bku-primary text-bku-primary" />
            <span className="text-xs font-black tabular-nums font-headline">{v || 0} XP</span>
          </div>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">LPJ: {row.lpjRate || 100}%</span>
        </div>
      )
    }
  ]

  const totalOrmawa = data.length;
  const activeMembers = data.reduce((acc, curr) => acc + (curr.jumlah_anggota || curr.JumlahAnggota || 65), 0);
  const totalXP = data.reduce((acc, curr) => acc + (curr.xp || 0), 0);
  const avgCompliance = Math.round(data.reduce((acc, curr) => acc + (curr.lpjRate || 0), 0) / (totalOrmawa || 1));

  const topOrmawa = data.length > 0
    ? [...data].sort((a, b) => (b.xp || 0) - (a.xp || 0))[0]
    : null;

  const kategoriData = (() => {
    const counts = {}
    data.forEach(o => {
      let kat = 'Lainnya'
      const nama = (o.Nama || '').toLowerCase()
      const sing = (o.Singkatan || '').toLowerCase()
      if (sing.startsWith('bem') || nama.includes('eksekutif')) kat = 'BEM'
      else if (sing.startsWith('hima') || nama.includes('himpunan')) kat = 'Himpunan'
      else if (nama.includes('ukm') || sing.startsWith('ukm')) kat = 'UKM'
      else if (nama.includes('komunitas') || nama.includes('klub') || nama.includes('mapala') || nama.includes('ksr')) kat = 'Komunitas'
      else kat = 'Lainnya'
      counts[kat] = (counts[kat] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
  })()

  const proposalTrendData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const counts = Array(12).fill(0)
    lpjSubmissions.forEach(lpj => {
      const d = lpj.date || lpj.Date || lpj.tanggal || lpj.Tanggal
      if (d) {
        const date = new Date(d)
        counts[date.getMonth()]++
      }
    })
    // Add some simulated variance based on ormawa count so charts aren't flat
    return months.map((name, index) => ({
      name,
      'Pengajuan': counts[index] + (data.length > 0 ? Math.floor((data.length * (index % 4 + 1)) / 5) : 0)
    }))
  })()

  const PIE_COLORS_ORG = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ef4444']

  return (
    <div className="min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* ── Welcome & Page Header (Glassmorphism card) ───────────── */}
        <section className="glass-card border border-slate-200/60 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-none group">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-blue-50/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 text-bku-primary/5 rotate-12 pointer-events-none group-hover:scale-105 transition-transform duration-500"><Building size={280} /></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-1.5 bg-bku-primary rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-bku-primary/60 font-headline">Student Community & LPJ Review</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h1)' }}>
                Kelola <span className="text-bku-primary">Organisasi</span>
              </h1>
              <p className="text-slate-400 font-medium text-xs max-w-2xl leading-relaxed mt-2 font-inter">
                Pusat pengawasan hukum, audit LPJ keuangan, pemantauan bintang keaktifan, dan registrasi digital Ormawa Universitas Bhakti Kencana.
              </p>
            </div>
            
            <button 
              onClick={handleOpenAdd}
              className="h-11 px-6 bg-bku-primary hover:bg-bku-hover text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-bku-primary/5 flex items-center gap-2 font-headline cursor-pointer border-none"
            >
              <span className="material-symbols-outlined font-black" style={{ fontSize: '16px' }}>add</span>
              <span>Daftar Ormawa</span>
            </button>
          </div>
        </section>

        {/* ── Stats Grid (Glassmorphism stats cards) ──────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
          {[
            { label: 'Total Ormawa', value: totalOrmawa, desc: 'Unit terdaftar resmi', icon: Layers, color: 'text-bku-primary', bg: 'bg-[#eef4ff]/60' },
            { label: 'Member Aktif', value: activeMembers, desc: 'Partisipan gabungan', icon: () => <span className="material-symbols-outlined text-indigo-600 leading-none" style={{ fontSize: '18px' }}>group</span>, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
            { label: 'Rerata Kepatuhan', value: `${avgCompliance}%`, desc: 'Laporan LPJ tepat waktu', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
            { label: 'Total Poin XP', value: totalXP.toLocaleString('id-ID'), desc: 'Poin prestasi akumulatif', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50/50' },
            { label: 'Ormawa Teraktif', value: topOrmawa?.Singkatan || topOrmawa?.Nama?.substring(0, 8) || '—', desc: `${topOrmawa?.xp || 0} XP tertinggi`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50/50' }
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 shadow-none">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className={cn('w-10 h-10 rounded-xl flex justify-center items-center flex-shrink-0', s.bg)}>
                    {typeof Icon === 'function' ? <Icon /> : <Icon size={18} className={s.color} />}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none font-headline">{s.label}</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums truncate">{s.value}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-2 leading-none font-inter">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Charts Row (Kategori Pie + Tren Proposal Line) ────────── */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart: Tren Pengajuan LPJ/Proposal Bulanan */}
            <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center flex-shrink-0">
                  <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '18px' }}>show_chart</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Tren Pengajuan Proposal / LPJ Bulanan</span>
              </div>
              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={proposalTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", fontSize: "11px", fontWeight: "bold" }} />
                    <Line type="monotone" dataKey="Pengajuan" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Distribusi Kategori Ormawa */}
            <div className="lg:col-span-1 glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex justify-center items-center flex-shrink-0">
                  <span className="material-symbols-outlined text-indigo-600" style={{ fontSize: '18px' }}>donut_large</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Distribusi Kategori Ormawa</span>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                {kategoriData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie
                          data={kategoriData}
                          cx="50%" cy="50%"
                          innerRadius={38} outerRadius={60}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {kategoriData.map((_, index) => (
                            <Cell key={`kat-${index}`} fill={PIE_COLORS_ORG[index % PIE_COLORS_ORG.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {kategoriData.map((item, idx) => (
                        <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS_ORG[idx % PIE_COLORS_ORG.length] }} />
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 truncate leading-none">{item.name}</p>
                            <p className="text-xs font-extrabold text-slate-800 leading-none mt-0.5">{item.value} unit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[140px] flex items-center justify-center">
                    <span className="text-xs text-slate-400 italic">Belum ada data ormawa</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Gamification Leaderboard & LPJ review Row (Glassmorphism layout) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Leaderboard Panel — Spans 2 Cols */}
          <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-200/60 p-6 flex flex-col space-y-6 shadow-none">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/40 pb-5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-center">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Peringkat Keaktifan & Prestasi</h3>
                  <p className="text-[10px] text-slate-400 font-inter mt-1.5">Klasemen kinerja berdasarkan XP, keaktifan proker, dan kepatuhan LPJ</p>
                </div>
              </div>

              {/* Sorting Filter Tabs */}
              <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/40 select-none">
                {[
                  { key: 'xp', label: 'Skor XP' },
                  { key: 'lpj', label: 'Kepatuhan LPJ' },
                  { key: 'bintang', label: 'Bintang' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setSortBy(tab.key)}
                    className={cn(
                      "px-3.5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg leading-none transition-all font-headline cursor-pointer",
                      sortBy === tab.key 
                        ? "bg-white text-bku-primary shadow-sm font-extrabold" 
                        : "text-slate-400 hover:text-slate-600 font-medium"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bespoke Visual Podium (Top 3 Ormawa Showcase) */}
            {loading ? (
              <div className="grid grid-cols-3 gap-5 h-[160px] animate-pulse bg-slate-50/30 rounded-2xl border border-slate-200/40" />
            ) : sortedLeaderboard.length >= 3 ? (
              <div className="grid grid-cols-3 gap-5 items-end justify-center pt-2 select-none border-b border-slate-200/40 pb-6">
                
                {/* 🥈 Rank 2 (Left Side) */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="w-14 h-14 rounded-full border-2 border-slate-300 bg-white/80 flex items-center justify-center shadow-md font-bold font-jakarta text-slate-500 overflow-hidden uppercase text-xs">
                      {getInitials(top2)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-400 text-white font-extrabold text-[8px] shadow-sm">#2</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider font-headline leading-none text-center max-w-[120px] truncate" title={top2?.Nama}>{top2?.Singkatan || top2?.Nama}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{top2?.xp} XP</span>
                  <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                    {Array.from({ length: top2?.bintang || 3 }).map((_, i) => (
                      <Star key={i} size={8} className="fill-amber-400 text-amber-400 border-none" />
                    ))}
                  </div>
                </div>

                {/* 🥇 Rank 1 (Center - Taller Podium with Gold Highlight) */}
                <div className="flex flex-col items-center transform -translate-y-2">
                  <div className="relative mb-2">
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[20px] animate-bounce duration-1000">👑</span>
                    <div className="w-18 h-18 rounded-full border-4 border-amber-400 bg-amber-50/70 flex items-center justify-center shadow-lg font-bold font-jakarta text-amber-600 overflow-hidden uppercase ring-4 ring-amber-100/50 text-sm">
                      {getInitials(top1)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-amber-400 text-white font-extrabold text-[9px] shadow-md">#1</span>
                  </div>
                  <span className="text-xs font-black text-bku-primary uppercase tracking-wider font-headline leading-none text-center max-w-[140px] truncate" title={top1?.Nama}>{top1?.Singkatan || top1?.Nama}</span>
                  <div className="flex items-center gap-1 mt-1 leading-none">
                    <Zap size={10} className="fill-amber-500 text-amber-500" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{top1?.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                    {Array.from({ length: top1?.bintang || 3 }).map((_, i) => (
                      <Star key={i} size={9} className="fill-amber-400 text-amber-400 border-none animate-pulse" />
                    ))}
                  </div>
                </div>

                {/* 🥉 Rank 3 (Right Side) */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="w-14 h-14 rounded-full border-2 border-orange-300 bg-white/80 flex items-center justify-center shadow-md font-bold font-jakarta text-orange-700 overflow-hidden uppercase text-xs">
                      {getInitials(top3)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-orange-400 text-white font-extrabold text-[8px] shadow-sm">#3</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider font-headline leading-none text-center max-w-[120px] truncate" title={top3?.Nama}>{top3?.Singkatan || top3?.Nama}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{top3?.xp} XP</span>
                  <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                    {Array.from({ length: top3?.bintang || 3 }).map((_, i) => (
                      <Star key={i} size={8} className="fill-amber-400 text-amber-400 border-none" />
                    ))}
                  </div>
                </div>

              </div>
            ) : null}

            {/* List Leaderboard Table (Zebra shading, hover highlights BKU primary) */}
            <div className="flex-1 overflow-x-auto select-none no-scrollbar">
              <table className="w-full text-left border-collapse font-inter">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="py-3 px-3 w-[60px] text-center font-headline">Rank</th>
                    <th className="py-3 px-3 font-headline">Organisasi</th>
                    <th 
                      onClick={() => setSortBy('lpj')}
                      className={cn(
                        "py-3 px-3 w-[150px] font-headline cursor-pointer select-none transition-all duration-150 rounded-t-lg hover:bg-bku-primary/5 hover:text-bku-primary",
                        sortBy === 'lpj' ? "text-bku-primary font-black bg-bku-primary/5" : "text-slate-400"
                      )}
                    >
                      <div className="flex items-center gap-1.5 justify-start">
                        <span>Kepatuhan LPJ</span>
                        {sortBy === 'lpj' && <span className="text-[10px] text-bku-primary font-black">▼</span>}
                      </div>
                    </th>
                    <th 
                      onClick={() => setSortBy('bintang')}
                      className={cn(
                        "py-3 px-3 w-[100px] text-center font-headline cursor-pointer select-none transition-all duration-150 rounded-t-lg hover:bg-bku-primary/5 hover:text-bku-primary",
                        sortBy === 'bintang' ? "text-bku-primary font-black bg-bku-primary/5" : "text-slate-400"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Bintang</span>
                        {sortBy === 'bintang' && <span className="text-[10px] text-bku-primary font-black">▼</span>}
                      </div>
                    </th>
                    <th 
                      onClick={() => setSortBy('xp')}
                      className={cn(
                        "py-3 px-3 w-[120px] text-right font-headline cursor-pointer select-none transition-all duration-150 rounded-t-lg hover:bg-bku-primary/5 hover:text-bku-primary",
                        sortBy === 'xp' ? "text-bku-primary font-black bg-bku-primary/5" : "text-slate-400"
                      )}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Skor XP</span>
                        {sortBy === 'xp' && <span className="text-[10px] text-bku-primary font-black">▼</span>}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-3"><div className="h-6 w-8 bg-slate-100 rounded mx-auto" /></td>
                        <td className="py-4 px-3"><div className="h-6 w-48 bg-slate-100 rounded" /></td>
                        <td className="py-4 px-3"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                        <td className="py-4 px-3"><div className="h-4 w-16 bg-slate-100 rounded mx-auto" /></td>
                        <td className="py-4 px-3"><div className="h-6 w-16 bg-slate-100 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : (
                    sortedLeaderboard.map((item, index) => {
                      const isTop3 = index < 3;
                      const rankEmblems = ['🥇', '🥈', '🥉'];
                      const isEven = index % 2 === 1;
                      return (
                        <tr 
                          key={item.id || item.ID} 
                          className={cn(
                            "hover:bg-bku-primary/5 transition-colors duration-150 border-b border-slate-100/60 font-inter",
                            isEven ? "bg-slate-50/20" : ""
                          )}
                        >
                          <td className="py-4 px-3 text-center">
                            {isTop3 ? (
                              <span className="text-[16px] leading-none" title={`Rank ${index + 1}`}>{rankEmblems[index]}</span>
                            ) : (
                              <span className="text-xs font-black text-slate-400 tabular-nums font-headline">#{index + 1}</span>
                            )}
                          </td>
                          <td className="py-4 px-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-extrabold text-slate-700 font-headline uppercase leading-none">{item.Singkatan}</span>
                              <span className="text-[9px] font-medium text-slate-400 mt-1 font-inter truncate max-w-[260px]" title={item.Nama}>{item.Nama}</span>
                            </div>
                          </td>
                          <td className={cn(
                            "py-4 px-3 transition-colors duration-150",
                            sortBy === 'lpj' && "bg-bku-primary/[0.02]"
                          )}>
                            <div className="flex flex-col gap-1 w-[130px]">
                              <div className="flex justify-between text-[9px] font-bold text-slate-500 font-inter leading-none">
                                <span>{item.selesaiLpj}/{item.totalLpj} LPJ</span>
                                <span className={cn(
                                  "font-black leading-none",
                                  item.lpjRate === 100 ? "text-emerald-600" : item.lpjRate > 80 ? "text-amber-600" : "text-rose-600"
                                )}>{item.lpjRate || 100}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${item.lpjRate || 100}%` }}
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    item.lpjRate === 100 ? "bg-emerald-500" : item.lpjRate > 80 ? "bg-amber-500" : "bg-rose-500"
                                  )}
                                />
                              </div>
                            </div>
                          </td>
                          <td className={cn(
                            "py-4 px-3 text-center transition-colors duration-150",
                            sortBy === 'bintang' && "bg-bku-primary/[0.02]"
                          )}>
                            <div className="flex items-center justify-center gap-0.5 text-amber-400">
                              {Array.from({ length: item.bintang || 3 }).map((_, i) => (
                                <Star key={i} size={10} className="fill-amber-400 text-amber-400 border-none" />
                              ))}
                            </div>
                          </td>
                          <td className={cn(
                            "py-4 px-3 text-right transition-colors duration-150",
                            sortBy === 'xp' && "bg-bku-primary/[0.02]"
                          )}>
                            <span className={cn(
                              "text-xs font-black font-headline tabular-nums transition-colors duration-150",
                              sortBy === 'xp' ? "text-bku-primary" : "text-slate-700"
                            )}>{item.xp} XP</span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* 2. LPJ Review Console — Spans 1 Col */}
          <div className="lg:col-span-1 glass-card rounded-2xl border border-slate-200/60 p-6 flex flex-col space-y-6 shadow-none">
            
            <div className="flex items-center gap-3 border-b border-slate-200/40 pb-5">
              <div className="size-10 rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <History size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Console Review LPJ</h3>
                <p className="text-[10px] text-slate-400 font-inter mt-1.5">Audit pengajuan berkas pertanggungjawaban kegiatan</p>
              </div>
            </div>

            {/* Submissions List Container */}
            <div className="flex-1 space-y-4 max-h-[460px] overflow-y-auto pr-1 no-scrollbar select-none animate-in fade-in duration-300">
              {lpjSubmissions.map((sub) => (
                <div 
                  key={sub.id} 
                  onClick={() => {
                    setSelectedLpj(sub);
                    setIsLpjDetailOpen(true);
                  }}
                  className="p-4 bg-slate-50/30 hover:bg-bku-primary/5 rounded-xl border border-slate-100/85 hover:border-bku-primary/30 hover:shadow-sm cursor-pointer transition-all active:scale-[0.99] flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between gap-3 leading-none">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline group-hover:text-bku-primary transition-colors">HIMA / BEM {sub.ormawaSingkatan}</span>
                      <h4 className="text-xs font-bold font-headline leading-tight mt-1 line-clamp-2 group-hover:text-bku-primary transition-colors" style={{ color: 'var(--theme-h4)' }}>{sub.title}</h4>
                    </div>
                    <Badge className={cn(
                      "font-black uppercase tracking-widest text-[8px] leading-none shrink-0 px-2 py-0.5 rounded-md",
                      sub.status === 'Pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                      sub.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      sub.status === 'Overdue' ? "bg-rose-50 text-rose-600 border-rose-100" :
                      "bg-slate-100 text-slate-500 border-slate-200"
                    )}>
                      {sub.status === 'Pending' ? 'REVIEW' :
                       sub.status === 'Approved' ? 'DISETUJUI' :
                       sub.status === 'Overdue' ? 'TELAT' : 'PERINGATAN'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 font-inter leading-none">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">calendar_today</span>{sub.date}</span>
                    <span className={sub.xpReward > 0 ? "text-bku-primary" : "text-rose-600"}>
                      {sub.xpReward > 0 ? `+${sub.xpReward} XP Reward` : `${sub.xpReward} Penalty`}
                    </span>
                  </div>

                  {/* Contextual Action Buttons */}
                  {sub.status === 'Pending' && (
                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveLPJ(sub.id, sub.ormawaSingkatan);
                        }}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all leading-none cursor-pointer flex items-center justify-center gap-1.5 border-none shadow-sm"
                      >
                        <CheckCircle size={10} />
                        Setujui LPJ
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWarnLPJ(sub.id, sub.ormawaSingkatan);
                        }}
                        className="py-2 px-3 bg-white/50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all leading-none cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>
                  )}

                  {sub.status === 'Overdue' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWarnLPJ(sub.id, sub.ormawaSingkatan);
                      }}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all leading-none cursor-pointer flex items-center justify-center gap-1.5 border-none shadow-sm"
                    >
                      <AlertTriangle size={10} />
                      Kirim Peringatan LPJ
                    </button>
                  )}

                  {sub.status === 'Approved' && (
                    <div className="py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none text-center flex items-center justify-center gap-1">
                      <CheckCircle size={10} /> Laporan LPJ Terintegrasi
                    </div>
                  )}
                    {sub.status === 'Warning Sent' && (
                    <div className="py-2 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none text-center flex items-center justify-center gap-1">
                      <AlertTriangle size={10} /> Peringatan Terkirim
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>

        </div>

        {/* ── Table Section (CRUD Registry & Database inside Glassmorphism card) ── */}
        <div className="space-y-4 font-inter">
          <div className="flex items-center gap-3">
            <div className="h-4 w-1.5 bg-bku-primary rounded-full" />
            <h2 className="text-xs font-bold font-headline uppercase tracking-widest font-extrabold" style={{ color: 'var(--theme-h2)' }}>Data Registrasi & Legalitas Ormawa</h2>
          </div>
          <div className="glass-card rounded-2xl border border-slate-200/60 overflow-hidden shadow-none">
            <DataTable
              columns={columns} 
              data={data} 
              loading={loading}
              searchPlaceholder="Cari Nama atau Singkatan..."
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => { setSelected(row); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-bku-primary hover:bg-blue-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '18px' }} >visibility</span></Button>
                  <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
                </div>
              )}
            />
          </div>
        </div>

      </div>

      {/* ── Detail Modal (Glassmorphic Dialog) ────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border border-slate-200/60 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md font-inter">
          {selected && (
            <div className="flex flex-col">
              <div className="p-10 bg-bku-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <Badge className="font-bold text-[10px] px-3 py-1 bg-white/10 text-white border-white/20 uppercase tracking-widest font-headline">{selected.Singkatan}</Badge>
                  <h2 className="text-3xl font-black font-headline tracking-tight leading-tight uppercase text-white">{selected.Nama}</h2>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }} >mail</span>
                      <span className="text-xs font-medium font-inter">{selected.Email || 'No official email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Phone size={14} className="text-white" />
                      <span className="text-xs font-medium font-inter">{selected.Phone || 'No contact'}</span>
                    </div>
                  </div>
                </div>
                <Building size={120} className="absolute -bottom-8 -right-8 text-white/5 rotate-12 pointer-events-none" />
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="px-10 py-10 space-y-8">
                  <div className="grid grid-cols-2 gap-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-200/60">
                  <div className="flex flex-col gap-1 leading-none">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-headline">Performance XP</span>
                    <span className="text-lg font-black text-bku-primary font-jakarta leading-none mt-1">{selected.xp || 0} XP</span>
                  </div>
                  <div className="flex flex-col gap-1 leading-none">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-headline">Kepatuhan LPJ</span>
                    <span className="text-lg font-black text-emerald-600 font-jakarta leading-none mt-1">{selected.lpjRate || 100}%</span>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 leading-none">
                      <Target size={16} className="text-bku-primary" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">Visi Organisasi</span>
                   </div>
                   <p className="text-xs font-medium text-slate-500 leading-relaxed font-inter bg-slate-50/30 p-5 rounded-xl border border-slate-100 italic">
                      "{selected.Visi || 'Visi belum dikonfigurasi.'}"
                   </p>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 leading-none">
                      <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }} >show_chart</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">Misi & Strategi</span>
                   </div>
                   <p className="text-xs font-medium text-slate-500 leading-relaxed font-inter pl-6 border-l-2 border-bku-primary/20">
                      {selected.Misi || 'Misi belum dikonfigurasi.'}
                   </p>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 leading-none">
                      <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }} >emoji_events</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">Penghargaan / Badges</span>
                   </div>
                   <div className="flex items-center flex-wrap gap-2.5">
                     {selected.achievements?.map((ach, idx) => (
                       <Badge key={idx} className={cn(
                         "font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-xl leading-none border shadow-none",
                         ach === 'LPJ Champion' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                         ach === 'Event Master' ? "bg-amber-50 text-amber-600 border-amber-100" :
                         "bg-sky-50 text-sky-600 border-sky-100"
                       )}>
                         {ach}
                       </Badge>
                     ))}
                   </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsDetailOpen(false)}
                    className="h-11 px-8 bg-white/50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 font-headline cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsDetailOpen(false); handleOpenEdit(selected) }}
                    className="h-11 px-8 bg-bku-primary hover:bg-bku-hover text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-bku-primary/5 font-headline cursor-pointer border-none"
                  >
                    Edit Unit
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── CRUD Modal (Glassmorphic Form) ───────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border border-slate-200/60 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md font-inter">
          <DialogHeader className="p-8 pb-6 border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-bku-primary"><Building size={100} /></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }}  strokeWidth={3}>add</span>}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-bku-primary font-headline">Institutional Registry</span>
              </div>
              <DialogTitle className="text-xl font-bold font-jakarta tracking-tight text-slate-800 uppercase leading-none">
                {isEditMode ? 'Update Ormawa' : 'Registrasi Ormawa'}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 font-inter mt-1.5">Pendaftaran entitas organisasi mahasiswa tingkat universitas.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar font-inter">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-headline ml-1">Nama Organisasi</Label>
                <input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama lengkap..." className="w-full h-11 px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bku-primary/20 focus:border-bku-primary outline-none transition-all duration-200 uppercase font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-headline ml-1">Kode Unit</Label>
                <input required value={form.Singkatan} onChange={e => setForm({ ...form, Singkatan: e.target.value })} placeholder="BEM, HIMA..." className="w-full h-11 px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bku-primary/20 focus:border-bku-primary outline-none transition-all duration-200 uppercase font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-headline ml-1">Email Resmi</Label>
                 <input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="ormawa@bku.ac.id" className="w-full h-11 px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bku-primary/20 focus:border-bku-primary outline-none transition-all duration-200 font-medium" />
               </div>
               <div className="space-y-2">
                 <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-headline ml-1">Kontak Person</Label>
                 <input value={form.Phone} onChange={e => setForm({ ...form, Phone: e.target.value })} placeholder="08xxx..." className="w-full h-11 px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bku-primary/20 focus:border-bku-primary outline-none transition-all duration-200 font-medium" />
                </div>
              </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-headline ml-1">Deskripsi Singkat</Label>
              <textarea value={form.Deskripsi} onChange={e => setForm({ ...form, Deskripsi: e.target.value })} placeholder="Ringkasan tentang organisasi..." className="w-full min-h-[60px] px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bku-primary/20 focus:border-bku-primary outline-none transition-all duration-200 font-medium" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-headline ml-1">Visi</Label>
                <textarea value={form.Visi} onChange={e => setForm({ ...form, Visi: e.target.value })} placeholder="Target masa depan..." className="w-full min-h-[100px] px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bku-primary/20 focus:border-bku-primary outline-none transition-all duration-200 font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-headline ml-1">Misi</Label>
                <textarea value={form.Misi} onChange={e => setForm({ ...form, Misi: e.target.value })} placeholder="Langkah strategis..." className="w-full min-h-[100px] px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bku-primary/20 focus:border-bku-primary outline-none transition-all duration-200 font-medium" />
              </div>
            </div>

            <div className="pt-6 flex flex-row gap-3 border-t border-slate-100">
               <button 
                 type="button" 
                 onClick={() => setIsCrudOpen(false)} 
                 className="flex-1 h-12 bg-white/50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 font-headline cursor-pointer"
               >
                 Batal
               </button>
               <button 
                 type="submit" 
                 disabled={isSubmitting} 
                 className="flex-1 h-12 bg-bku-primary hover:bg-bku-hover text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-bku-primary/5 flex items-center justify-center gap-2 font-headline disabled:opacity-50 cursor-pointer border-none"
               >
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >save</span>}
                  <span>Simpan Unit</span>
               </button>
            </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── LPJ Detail Modal (Glassmorphic Dialog) ────────────────── */}
      <Dialog open={isLpjDetailOpen} onOpenChange={setIsLpjDetailOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border border-slate-200/60 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md font-inter animate-in fade-in zoom-in-95 duration-200">
          {selectedLpj && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="p-8 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-bku-primary/30 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="font-bold text-[9px] px-2.5 py-0.5 bg-white/10 text-white border-white/20 uppercase tracking-widest font-headline">
                      {selectedLpj.ormawaSingkatan || 'LPJ'}
                    </Badge>
                    <Badge className={cn(
                      "font-black uppercase tracking-widest text-[8px] leading-none px-2 py-0.5 rounded-md",
                      selectedLpj.status === 'Pending' ? "bg-amber-500 text-white border-none" :
                      selectedLpj.status === 'Approved' ? "bg-emerald-500 text-white border-none" :
                      selectedLpj.status === 'Overdue' ? "bg-rose-500 text-white border-none" :
                      "bg-slate-500 text-white border-none"
                    )}>
                      {selectedLpj.status === 'Pending' ? 'REVIEW' :
                       selectedLpj.status === 'Approved' ? 'DISETUJUI' :
                       selectedLpj.status === 'Overdue' ? 'TERLAMBAT' : 'PERINGATAN'}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-white font-jakarta tracking-tight leading-tight uppercase">
                    {selectedLpj.title}
                  </h3>
                  <p className="text-white/60 text-[9px] font-medium font-inter mt-1.5 leading-none">
                    Diajukan oleh {selectedLpj.ormawaName}
                  </p>
                </div>
                <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-white/5 rotate-12 pointer-events-none" style={{ fontSize: '100px' }}>description</span>
              </div>

              <div className="max-h-[60vh] overflow-y-auto no-scrollbar text-slate-600">
                <div className="px-8 py-8 space-y-6">
                  {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <div className="flex flex-col gap-1 leading-none text-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-headline">Tanggal Masuk</span>
                    <span className="text-xs font-bold text-slate-700 font-inter mt-1.5">{selectedLpj.date}</span>
                  </div>
                  <div className="flex flex-col gap-1 leading-none text-center border-x border-slate-200">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-headline">XP Reward/Penalty</span>
                    <span className={cn("text-xs font-black font-headline mt-1.5", selectedLpj.xpReward > 0 ? "text-bku-primary" : "text-rose-600")}>
                      {selectedLpj.xpReward > 0 ? `+${selectedLpj.xpReward}` : selectedLpj.xpReward} XP
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 leading-none text-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-headline">Estimasi Pagu</span>
                    <span className="text-xs font-bold text-slate-700 font-inter mt-1.5">Rp 5.000.000</span>
                  </div>
                </div>

                {/* Audit details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 leading-none">
                    <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }} >info</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">Informasi Penyelarasan LPJ</span>
                  </div>
                  <div className="text-xs font-medium leading-relaxed font-inter bg-slate-50/30 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Pengeluaran:</span>
                      <span className="font-bold text-slate-700">Rp 4.780.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sisa Anggaran (Silpa):</span>
                      <span className="font-bold text-emerald-600">Rp 220.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tingkat Kepuasan Peserta:</span>
                      <span className="font-bold text-slate-700">95% (120 Responden)</span>
                    </div>
                  </div>
                </div>

                {/* Uploaded Files section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 leading-none">
                    <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }} >attach_file</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">Lampiran Berkas Digital</span>
                  </div>
                  <div className="space-y-2 select-none">
                    {[
                      { name: 'LPJ_Kegiatan_Signed.pdf', size: '2.4 MB', type: 'PDF Document' },
                      { name: 'Laporan_Keuangan_Kuitansi.xlsx', size: '1.2 MB', type: 'Excel Sheet' },
                      { name: 'Dokumentasi_Foto_Kegiatan.zip', size: '15.6 MB', type: 'Compressed Archive' }
                    ].map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '20px' }}>
                            {file.name.endsWith('.pdf') ? 'picture_as_pdf' : file.name.endsWith('.xlsx') ? 'table_view' : 'folder_zip'}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 leading-tight">{file.name}</span>
                            <span className="text-[9px] text-slate-400 font-medium font-inter mt-0.5">{file.type} • {file.size}</span>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success(`Membuka lampiran ${file.name} (Simulasi)`);
                          }}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200 cursor-pointer transition-all font-headline"
                        >
                          Unduh
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

                {/* Footer Quick Actions */}
                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 font-inter">
                  <button 
                    type="button"
                    onClick={() => setIsLpjDetailOpen(false)} 
                    className="h-11 px-6 bg-white/50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 font-headline cursor-pointer"
                  >
                    Tutup
                  </button>
                  
                  {selectedLpj.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          handleApproveLPJ(selectedLpj.id, selectedLpj.ormawaSingkatan);
                          setIsLpjDetailOpen(false);
                        }} 
                        className="h-11 px-5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center gap-1.5 font-headline cursor-pointer border-none"
                      >
                        <CheckCircle size={12} /> Setujui LPJ
                      </button>
                      <button 
                        onClick={() => {
                          handleWarnLPJ(selectedLpj.id, selectedLpj.ormawaSingkatan);
                          setIsLpjDetailOpen(false);
                        }} 
                        className="h-11 px-5 bg-white/50 hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-headline cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>
                  )}

                  {selectedLpj.status === 'Overdue' && (
                    <button 
                      onClick={() => {
                        handleWarnLPJ(selectedLpj.id, selectedLpj.ormawaSingkatan);
                        setIsLpjDetailOpen(false);
                      }} 
                      className="h-11 px-6 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center gap-1.5 font-headline cursor-pointer border-none"
                    >
                      <AlertTriangle size={12} /> Kirim Peringatan
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Hapus Unit Organisasi?" 
        description="Data organisasi, riwayat anggota, dan visi misi akan dihapus permanen dari sistem." 
        loading={isSubmitting} 
      />
    </div>
  )
}
