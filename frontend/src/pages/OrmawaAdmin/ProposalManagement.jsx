"use client"

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { DataTable } from '../FacultyAdmin/components/data-table'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Modal, ModalBody, ModalFooter, ModalBtn } from '../FacultyAdmin/components/Modal'
import { DeleteConfirmModal } from '../FacultyAdmin/components/DeleteConfirmModal'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Input } from '../FacultyAdmin/components/input'
import { Label } from '../FacultyAdmin/components/label'
import { Textarea } from '../FacultyAdmin/components/textarea'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import useAuthStore from '../../store/useAuthStore'
import { fetchWithAuth, API_BASE_URL } from '../../services/api'

const API = `${API_BASE_URL}/ormawa`

const STATUS_CONFIG = {
  diajukan: { label: 'Diajukan', cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/20 border-blue-200', icon: 'schedule' },
  disetujui_dosen: { label: 'ACC Dosen', cls: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20 border-indigo-200', icon: 'check_circle' },
  disetujui_fakultas: { label: 'ACC Fakultas', cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-500/20 border-violet-200', icon: 'check_circle' },
  disetujui_univ: { label: 'Disetujui Univ', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20 border-emerald-200', icon: 'check_circle' },
  revisi: { label: 'Butuh Revisi', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20 border-amber-200', icon: 'error' },
  ditolak: { label: 'Ditolak', cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/20 border-rose-200', icon: 'cancel' },
  selesai: { label: 'Selesai', cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20 border-slate-200', icon: 'check_circle' },
}

const getProposalId = (p) => p?.id || p?.ID

const StatusBadge = ({ status }) => {
  const s = String(status || 'diajukan').toLowerCase().trim()
  const cfg = STATUS_CONFIG[s] || { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: 'description' }
  return (
    <Badge className={cn('capitalize font-black text-[10px] px-3 py-1 border shadow-sm rounded-lg uppercase tracking-wider', cfg.cls)}>
      {cfg.label}
    </Badge>
  )
}

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

const parseRupiahInput = (value) => {
  return String(value || '').replace(/\D/g, '')
}

const formatRupiahInput = (value) => {
  if (value === null || value === undefined || value === '') return ''
  const numberString = String(value).replace(/\D/g, '')
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(numberString)
}

export default function ProposalManagement() {
  const [printData, setPrintData] = useState(null)

  useEffect(() => {
    if (printData) {
      const timer = setTimeout(() => {
        window.print()
        setPrintData(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [printData])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState([])
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [komentar, setKomentar] = useState('')
  const [dokumenList, setDokumenList] = useState([])
  const [existingFileList, setExistingFileList] = useState([])
  const userObj = useAuthStore.getState()?.user
  const mhsObj = useAuthStore.getState()?.mahasiswa
  const ormawaId = userObj?.ormawa_id || userObj?.OrmawaID || userObj?.ormawaId || mhsObj?.ormawaId || mhsObj?.OrmawaID || 1
  const mahasiswaId = mhsObj?.id || mhsObj?.ID || 0
  const [formData, setFormData] = useState({
    Judul: '',
    Catatan: '',
    TanggalKegiatan: '',
    Anggaran: '',
    OrmawaID: ormawaId,
    MahasiswaID: mahasiswaId,
    LandasanKegiatan: '',
    Deskripsi: '',
    BentukKegiatan: '',
    Mitra: '',
    LatarBelakang: '',
    TujuanKegiatan: '',
    JadwalPelaksanaan: '',
    SasaranKegiatan: '',
    IndikatorKeberhasilan: '',
    SumberDana: '',
    PJKegiatan: ''
  })


  const fetchProposals = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/proposals?ormawaId=${ormawaId}`)
      if (data.status === 'success') {
        setProposals(data.data || [])
        return data.data || []
      }
      else toast.error('Gagal memuat data proposal')
    } catch {
      toast.error('Koneksi ke server gagal')
    } finally {
      setLoading(false)
    }
    return []
  }

  const fetchHistory = async (proposalId) => {
    try {
      const data = await fetchWithAuth(`${API}/proposals/${proposalId}/history`)
      if (data.status === 'success') setHistory(data.data || [])
    } catch { }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setFormData({
      Judul: '',
      Catatan: '',
      TanggalKegiatan: '',
      Anggaran: '',
      OrmawaID: ormawaId,
      MahasiswaID: mahasiswaId,
      LandasanKegiatan: '',
      Deskripsi: '',
      BentukKegiatan: '',
      Mitra: '',
      LatarBelakang: '',
      TujuanKegiatan: '',
      JadwalPelaksanaan: '',
      SasaranKegiatan: '',
      IndikatorKeberhasilan: '',
      SumberDana: '',
      PJKegiatan: ''
    })
    setDokumenList([])
    setExistingFileList([])
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    let existingFiles = []
    try {
      const parsed = JSON.parse(row.file_url || row.FileURL || '[]')
      existingFiles = Array.isArray(parsed) ? parsed : (row.file_url || row.FileURL ? [row.file_url || row.FileURL] : [])
    } catch {
      existingFiles = (row.file_url || row.FileURL) ? [row.file_url || row.FileURL] : []
    }
    setFormData({
      id: row.id || row.ID,
      Judul: row.Judul || row.judul || '',
      Catatan: row.Catatan || row.catatan || '',
      TanggalKegiatan: row.TanggalKegiatan ? row.TanggalKegiatan.split('T')[0] : (row.tanggal_kegiatan ? row.tanggal_kegiatan.split('T')[0] : ''),
      Anggaran: row.Anggaran || row.anggaran || '',
      OrmawaID: row.OrmawaID || row.ormawa_id || ormawaId,
      file_url: row.file_url || row.FileURL || '',
      FileURL: row.file_url || row.FileURL || '',

      LandasanKegiatan: row.LandasanKegiatan || row.landasan_kegiatan || '',
      Deskripsi: row.Deskripsi || row.deskripsi || '',
      BentukKegiatan: row.BentukKegiatan || row.bentuk_kegiatan || '',
      Mitra: row.Mitra || row.mitra || '',
      LatarBelakang: row.LatarBelakang || row.latar_belakang || '',
      TujuanKegiatan: row.TujuanKegiatan || row.tujuan_kegiatan || '',
      JadwalPelaksanaan: row.JadwalPelaksanaan || row.jadwal_pelaksanaan || '',
      SasaranKegiatan: row.SasaranKegiatan || row.sasaran_kegiatan || '',
      IndikatorKeberhasilan: row.IndikatorKeberhasilan || row.indikator_keberhasilan || '',
      SumberDana: row.SumberDana || row.sumber_dana || '',
      PJKegiatan: row.PJKegiatan || row.pj_kegiatan || '',
    })
    setDokumenList([])
    setExistingFileList(existingFiles)
    setIsCrudOpen(true)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = []
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" melebihi batas 5MB`)
        continue
      }
      validFiles.push(file)
    }
    if (validFiles.length > 0) {
      setDokumenList((prev) => [...prev, ...validFiles])
      toast.success(`${validFiles.length} file berhasil terpilih`)
    }
  }

  const handleRemoveNewFile = (index) => {
    setDokumenList((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingFile = (index) => {
    setExistingFileList((prev) => prev.filter((_, i) => i !== index))
  }

  const handleView = (row) => {
    setSelected(row)
    setHistory([])
    fetchHistory(row.id || row.ID)
    setIsDetailOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 1. Upload all new files in dokumenList
    const newUploadedUrls = []
    for (const file of dokumenList) {
      const uploadData = new FormData()
      uploadData.append('file', file)
      try {
        const uploadRes = await fetchWithAuth(`${API_BASE_URL}/ormawa/upload`, {
          method: 'POST',
          body: uploadData,
        })
        if (uploadRes.status === 'success') {
          newUploadedUrls.push(uploadRes.url)
        } else {
          toast.error(`Gagal mengunggah file "${file.name}"`)
          setIsSubmitting(false)
          return
        }
      } catch (err) {
        toast.error(`Gagal mengunggah file "${file.name}"`)
        setIsSubmitting(false)
        return
      }
    }

    // 2. Combine remaining existing files with newly uploaded file URLs
    const finalFiles = [...existingFileList, ...newUploadedUrls]
    const finalFileUrl = finalFiles.length > 0 ? JSON.stringify(finalFiles) : ''

    const formId = formData.id || formData.ID
    const url = isEditMode ? `${API}/proposals/${formId}` : `${API}/proposals`
    const method = isEditMode ? 'PUT' : 'POST'

    const payload = {
      ...formData,
      Anggaran: Number(formData.Anggaran),
      OrmawaID: Number(formData.OrmawaID),
      TanggalKegiatan: formData.TanggalKegiatan ? new Date(formData.TanggalKegiatan).toISOString() : new Date().toISOString(),
      file_url: finalFileUrl,
      FileURL: finalFileUrl,
    }
    try {
      const data = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      })
      if (data.status === 'success') {
        toast.success(isEditMode ? 'Proposal diperbarui' : 'Proposal berhasil diajukan')
        setIsCrudOpen(false)
        const updatedList = await fetchProposals()
        if (!isEditMode && data.data) {
          const newId = data.data.id || data.data.ID
          const newlyCreated = (updatedList || []).find(p => (p.id || p.ID) === newId)
          if (newlyCreated) {
            printProposalPDF(newlyCreated)
          }
        }
      } else {
        toast.error(data.message || 'Gagal menyimpan proposal')
      }
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const printProposalPDF = (proposal) => {
    setPrintData(proposal)
  }

  const handleAction = async (status) => {
    if (!selected) return
    const selectedId = selected.id || selected.ID
    if ((status === 'revisi' || status === 'ditolak') && !komentar.trim()) {
      toast.error('Catatan/alasan wajib diisi untuk revisi atau penolakan')
      return
    }
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/proposals/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: status, Catatan: komentar })
      })
      if (data.status === 'success') {
        toast.success('Status proposal diperbarui')
        setIsDetailOpen(false)
        setKomentar('')
        fetchProposals()
      } else {
        toast.error(data.message || 'Gagal memperbarui status')
      }
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const selectedId = selected?.id || selected?.ID
    if (!selectedId) return
    setIsSubmitting(true)
    try {
      await fetchWithAuth(`${API}/proposals/${selectedId}`, { method: 'DELETE' })
      toast.success('Proposal dihapus')
      setIsDelOpen(false)
      fetchProposals()
    } catch {
      toast.error('Gagal menghapus proposal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'ID',
      label: 'Kode Ref',
      className: 'w-[120px]',
      render: (val, row) => {
        const id = row.id || row.ID
        return <span className="font-bold text-slate-400 font-headline text-[10px] tracking-widest uppercase">PROP-{id}</span>
      }
    },
    {
      key: 'Judul',
      label: 'Kegiatan',
      className: 'min-w-[280px]',
      render: (val, row) => (
        <div className="flex flex-col leading-tight gap-0.5">
          <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{val || '—'}</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-tight font-body">
            {row.TanggalKegiatan ? new Date(row.TanggalKegiatan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </span>
        </div>
      )
    },
    {
      key: 'Anggaran',
      label: 'Anggaran',
      className: 'w-[180px]',
      render: (val) => <span className="font-black text-emerald-600 text-[12px] font-headline">{formatRupiah(val)}</span>
    },
    {
      key: 'Status',
      label: 'Status',
      className: 'w-[170px] text-center',
      cellClassName: 'text-center',
      render: (val) => <StatusBadge status={val} />
    }
  ]

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
      <img src="/images/format_kop_rektorat_landscape.jpg" style={{ display: 'none' }} alt="" />

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl h-48 flex items-center group shadow-sm border border-slate-200/80">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

        <div className="relative z-10 px-10 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-6 bg-primary/40 rounded-full" />
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.25em]">
                Ormawa Admin
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 backdrop-blur-md rounded-xl text-primary shadow-inner">
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>description</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
                Manajemen Proposal
              </h1>
            </div>
            <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
              Ajukan & Pantau Persetujuan Kegiatan: Ormawa → Dosen → Fakultas → Universitas
            </p>
          </div>
        </div>
      </section>

      {/* ── Content Area ───────────────────────────────────────────── */}
      <Card className="border border-[#e5e5e5] shadow-sm overflow-hidden bg-white rounded-3xl">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={proposals}
            loading={loading}
            searchPlaceholder="Cari judul atau kode proposal..."
            onAdd={handleOpenAdd}
            addLabel="Buat Proposal"
            filters={[
              {
                key: 'Status',
                placeholder: 'Filter Status',
                options: Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ label, value }))
              }
            ]}
            actions={(row) => (
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => handleView(row)} className="p-1.5 text-slate-400 hover:text-[#00236F] hover:bg-[#00236F]/10 rounded-lg transition-colors duration-150" title="Detail"><span className="material-symbols-outlined block" style={{ fontSize: '18px' }} >visibility</span></button>
                <button onClick={() => printProposalPDF(row)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150" title="Cetak PDF"><span className="material-symbols-outlined block" style={{ fontSize: '18px' }} >print</span></button>
                <button onClick={() => handleOpenEdit(row)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-150" title="Edit"><span className="material-symbols-outlined block" style={{ fontSize: '18px' }} >edit</span></button>
                <button onClick={() => { setSelected(row); setIsDelOpen(true) }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-150" title="Hapus"><span className="material-symbols-outlined block" style={{ fontSize: '18px' }} >delete</span></button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* DETAIL & REVIEW MODAL */}
      <Modal
        open={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setKomentar('') }}
        title={selected ? `PROP-${getProposalId(selected)}: ${selected.Judul}` : 'Detail Proposal'}
        subtitle="Pantau proses persetujuan, anggaran, dan riwayat revisi kegiatan."
        icon={<span className="material-symbols-outlined">description</span>}
        maxWidth="max-w-5xl"
      >
        {selected && (
          <ModalBody className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-6">

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>payments</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-400 tracking-wider uppercase">Anggaran Diajukan</p>
                      <p className="text-sm font-black text-emerald-600 font-headline mt-0.5 truncate">{formatRupiah(selected.Anggaran)}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_today</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-400 tracking-wider uppercase">Tanggal Kegiatan</p>
                      <p className="text-sm font-black text-slate-900 font-headline mt-0.5 truncate">
                        {selected.TanggalKegiatan ? new Date(selected.TanggalKegiatan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detail Fields Grid */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-headline">Informasi Detail Proposal</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Landasan Kegiatan</p>
                      <p className="font-bold text-slate-900">{selected.LandasanKegiatan || selected.landasan_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Bentuk Kegiatan</p>
                      <p className="font-bold text-slate-900">{selected.BentukKegiatan || selected.bentuk_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mitra Kerja</p>
                      <p className="font-bold text-slate-900">{selected.Mitra || selected.mitra || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">PJ Kegiatan</p>
                      <p className="font-bold text-slate-900">{selected.PJKegiatan || selected.pj_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Jadwal Pelaksanaan</p>
                      <p className="font-bold text-slate-900">{selected.JadwalPelaksanaan || selected.jadwal_pelaksanaan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sasaran Kegiatan</p>
                      <p className="font-bold text-slate-900">{selected.SasaranKegiatan || selected.sasaran_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sumber Dana</p>
                      <p className="font-bold text-slate-900">{selected.SumberDana || selected.sumber_dana || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Indikator Keberhasilan</p>
                      <p className="font-bold text-slate-900">{selected.IndikatorKeberhasilan || selected.indikator_keberhasilan || "—"}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Latar Belakang</p>
                    <p className="font-medium leading-relaxed whitespace-pre-line">{selected.LatarBelakang || selected.latar_belakang || "—"}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tujuan Kegiatan</p>
                    <p className="font-medium leading-relaxed whitespace-pre-line">{selected.TujuanKegiatan || selected.tujuan_kegiatan || "—"}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Deskripsi Kegiatan</p>
                    <p className="font-medium leading-relaxed whitespace-pre-line">{selected.Deskripsi || selected.deskripsi || "—"}</p>
                  </div>
                </div>

                {/* Dokumen Proposal */}
                {(() => {
                  const getFileUrlsList = (val) => {
                    try {
                      const parsed = JSON.parse(val || '[]')
                      return Array.isArray(parsed) ? parsed : (val ? [val] : [])
                    } catch {
                      return val ? [val] : []
                    }
                  }
                  const files = getFileUrlsList(selected.FileURL || selected.file_url)
                  return files.length > 0 ? (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 tracking-[0.15em] uppercase font-headline">Dokumen Lampiran ({files.length})</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {files.map((file, idx) => {
                          const filename = file.split('/').pop() || `Berkas_${idx + 1}`
                          const cleanName = filename.substring(filename.indexOf('_') + 1)
                          return (
                            <a
                              key={idx}
                              href={`${API_BASE_URL.replace('/api', '')}${file}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl hover:bg-blue-100/50 hover:border-blue-300 transition-all group"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                                  <span className="material-symbols-outlined normal-case" style={{ fontSize: '18px' }}>upload_file</span>
                                </div>
                                <div className="flex flex-col leading-tight min-w-0 flex-1">
                                  <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider font-headline truncate" title={cleanName}>{cleanName}</span>
                                  <span className="text-[9px] text-blue-500 font-bold mt-0.5">Klik untuk melihat file</span>
                                </div>
                              </div>
                              <span className="material-symbols-outlined normal-case text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" style={{ fontSize: '18px' }}>arrow_forward</span>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 tracking-[0.15em] uppercase font-headline">Dokumen Lampiran</Label>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200/40 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-inner">
                          <span className="material-symbols-outlined normal-case" style={{ fontSize: '20px' }}>description</span>
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-[11px] font-bold text-slate-500">Tidak ada dokumen terunggah</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Alur Persetujuan */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.15em] uppercase font-headline">Alur Persetujuan</Label>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex items-center justify-between gap-2">
                    {['disetujui_dosen', 'disetujui_fakultas', 'disetujui_univ'].map((s, i) => {
                      const active = (['disetujui_dosen', 'disetujui_fakultas', 'disetujui_univ', 'selesai'].indexOf(selected.Status) >= i)
                      return (
                        <React.Fragment key={s}>
                          <div className={cn('flex flex-col items-center gap-1.5', active ? '' : 'opacity-30')}>
                            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border', active ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'bg-slate-100 text-slate-400 border-slate-200/40')}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                            </div>
                            <span className="text-[9px] font-black tracking-wider text-slate-500 font-headline uppercase">{['Dosen', 'Fakultas', 'Univ'][i]}</span>
                          </div>
                          {i < 2 && <div className={cn('flex-1 h-[2px] rounded-full', active ? 'bg-emerald-300' : 'bg-slate-200')} />}
                        </React.Fragment>
                      )
                    })}
                  </div>
                </div>

                {/* Histori */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.15em] uppercase font-headline">Riwayat Status</Label>
                  <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-0 before:w-px before:bg-slate-100">
                    {history.length === 0 && <p className="text-[11px] text-slate-400 font-semibold pl-4">Belum ada riwayat</p>}
                    {history.map((log) => {
                      const timestamp = log.created_at || log.CreatedAt || log.createdat
                      return (
                        <div key={log.id || log.ID} className="flex gap-4 relative z-10">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-slate-200/50 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>history</span>
                          </div>
                          <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-200/50">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <StatusBadge status={log.Status} />
                              <span className="text-[9px] text-slate-400 font-semibold font-mono">
                                {timestamp ? new Date(timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{log.Catatan || 'Tanpa catatan'}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Status Info — read only, no action buttons */}
              <div className="space-y-5 lg:border-l lg:border-slate-100 lg:pl-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.15em] uppercase font-headline">Status Saat Ini</Label>
                  <div className="flex items-center">
                    <StatusBadge status={selected.Status} />
                  </div>
                </div>

                {/* Alur approval info box */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alur Persetujuan</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Proposal diteruskan secara otomatis setelah disetujui masing-masing tingkat:
                  </p>
                  {[{ s: 'disetujui_dosen', label: 'Dosen Pembimbing' }, { s: 'disetujui_fakultas', label: 'Admin Fakultas' }, { s: 'disetujui_univ', label: 'Universitas' }].map((step, i) => {
                    const statuses = ['disetujui_dosen', 'disetujui_fakultas', 'disetujui_univ', 'selesai']
                    const done = statuses.indexOf(selected.Status) >= i
                    return (
                      <div key={step.s} className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${done ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-50'
                        }`}>
                        <span className={`material-symbols-outlined text-[16px] ${done ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {done ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${done ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Catatan dari reviewer */}
                {selected.Catatan && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-1.5">
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Catatan Reviewer</p>
                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">{selected.Catatan}</p>
                  </div>
                )}
              </div>

            </div>
          </ModalBody>
        )}
        <ModalFooter>
          {selected && (
            <Button onClick={() => printProposalPDF(selected)} className="bg-[#00236F] hover:bg-[#00236F]/90 text-white font-bold gap-2 flex items-center transition-all shadow-sm">
              <span className="material-symbols-outlined text-[16px]">print</span>
              Cetak Proposal (PDF)
            </Button>
          )}
          <ModalBtn variant="ghost" type="button" onClick={() => { setIsDetailOpen(false); setKomentar('') }}>
            Tutup Detail
          </ModalBtn>
        </ModalFooter>
      </Modal>

      {/* CRUD MODAL */}
      <Modal
        open={isCrudOpen}
        onClose={() => setIsCrudOpen(false)}
        title={isEditMode ? 'Edit Proposal' : 'Buat Proposal Baru'}
        subtitle="Isi data kegiatan dan anggaran yang dibutuhkan untuk pengajuan."
        icon={isEditMode ? <span className="material-symbols-outlined">edit</span> : <span className="material-symbols-outlined stroke-[3px]">add</span>}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSave}>
          <ModalBody>
            <div className="space-y-4">

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Nama Kegiatan</Label>
                <Input
                  required
                  value={formData.Judul}
                  onChange={(e) => setFormData({ ...formData, Judul: e.target.value })}
                  placeholder="Contoh: Pekan Olahraga Fakultas..."
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all font-bold text-sm font-headline"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Landasan Kegiatan</Label>
                  <Input
                    required
                    value={formData.LandasanKegiatan}
                    onChange={(e) => setFormData({ ...formData, LandasanKegiatan: e.target.value })}
                    placeholder="Contoh: Program Kerja Himpunan 2026..."
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all text-xs font-bold font-headline"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Bentuk Kegiatan</Label>
                  <Input
                    value={formData.BentukKegiatan}
                    onChange={(e) => setFormData({ ...formData, BentukKegiatan: e.target.value })}
                    placeholder="Contoh: Kompetisi & Seminar..."
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all text-xs font-bold font-headline"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Mitra</Label>
                  <Input
                    value={formData.Mitra}
                    onChange={(e) => setFormData({ ...formData, Mitra: e.target.value })}
                    placeholder="Contoh: Seluruh LK dan UKM KEMA UBK"
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all text-xs font-bold font-headline"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">PJ Kegiatan</Label>
                  <Input
                    value={formData.PJKegiatan}
                    onChange={(e) => setFormData({ ...formData, PJKegiatan: e.target.value })}
                    placeholder="Contoh: Budi Santoso (Ketua Panitia)..."
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all text-xs font-bold font-headline"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Jadwal Pelaksanaan (Hari, Tanggal Bulan Tahun, Waktu)</Label>
                  <Input
                    value={formData.JadwalPelaksanaan}
                    onChange={(e) => setFormData({ ...formData, JadwalPelaksanaan: e.target.value })}
                    placeholder="Contoh: Senin, 15 Juli 2026, 09.00 - 15.00 WIB..."
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all text-xs font-bold font-headline"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Sasaran Kegiatan</Label>
                  <Input
                    value={formData.SasaranKegiatan}
                    onChange={(e) => setFormData({ ...formData, SasaranKegiatan: e.target.value })}
                    placeholder="Contoh: Seluruh Mahasiswa Fakultas Teknik..."
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all text-xs font-bold font-headline"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Sumber Dana</Label>
                  <Input
                    value={formData.SumberDana}
                    onChange={(e) => setFormData({ ...formData, SumberDana: e.target.value })}
                    placeholder="Contoh: Dana Kemahasiswaan & Sponsor..."
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all text-xs font-bold font-headline"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Indikator Keberhasilan</Label>
                  <Input
                    value={formData.IndikatorKeberhasilan}
                    onChange={(e) => setFormData({ ...formData, IndikatorKeberhasilan: e.target.value })}
                    placeholder="Contoh: Target 200 Peserta Hadir..."
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all text-xs font-bold font-headline"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Tanggal Pelaksanaan Utama</Label>
                  <Input
                    required
                    type="date"
                    value={formData.TanggalKegiatan}
                    onChange={(e) => setFormData({ ...formData, TanggalKegiatan: e.target.value })}
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all text-xs font-bold font-headline cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Estimasi Dana / Anggaran (Rp)</Label>
                  <Input
                    required
                    type="text"
                    value={formatRupiahInput(formData.Anggaran)}
                    onChange={(e) => {
                      const rawVal = parseRupiahInput(e.target.value)
                      setFormData({ ...formData, Anggaran: rawVal })
                    }}
                    placeholder="Cth: 10.000.000"
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all text-xs font-bold font-headline"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Latar Belakang</Label>
                <Textarea
                  value={formData.LatarBelakang}
                  onChange={(e) => setFormData({ ...formData, LatarBelakang: e.target.value })}
                  placeholder="Deskripsikan latar belakang pengajuan kegiatan..."
                  className="min-h-[80px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white p-4 text-xs font-medium leading-relaxed font-headline"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Tujuan Kegiatan</Label>
                <Textarea
                  value={formData.TujuanKegiatan}
                  onChange={(e) => setFormData({ ...formData, TujuanKegiatan: e.target.value })}
                  placeholder="Deskripsikan tujuan dari kegiatan..."
                  className="min-h-[80px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white p-4 text-xs font-medium leading-relaxed font-headline"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Deskripsi Detail Kegiatan</Label>
                <Textarea
                  value={formData.Deskripsi}
                  onChange={(e) => setFormData({ ...formData, Deskripsi: e.target.value })}
                  placeholder="Deskripsikan rincian detail/mekanisme kegiatan..."
                  className="min-h-[80px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white p-4 text-xs font-medium leading-relaxed font-headline"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Catatan Reviewer / Keterangan Lainnya</Label>
                <Textarea
                  required
                  value={formData.Catatan}
                  onChange={(e) => setFormData({ ...formData, Catatan: e.target.value })}
                  placeholder="Tambahkan catatan atau keterangan pelengkap..."
                  className="min-h-[80px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white p-4 text-xs font-medium leading-relaxed font-headline"
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase">Upload Dokumen Proposal</Label>
                <div className="border-2 border-dashed border-slate-200 hover:border-[#00236F]/50 rounded-2xl p-6 text-center hover:bg-slate-50/50 transition-all duration-150 relative group">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="pointer-events-none flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-[#00236F]/10 text-slate-400 group-hover:text-[#00236F] flex items-center justify-center mb-3 transition-colors duration-150 border border-slate-200/50">
                      <span className="material-symbols-outlined normal-case" style={{ fontSize: '24px' }}>upload_file</span>
                    </div>
                    <p className="text-xs font-black text-[#00236F] uppercase tracking-wider">Klik untuk Upload Dokumen</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Bisa pilih lebih dari 1 file (PDF, Word, Excel, Maks. 5MB per file)</p>
                  </div>
                </div>

                {/* List of newly selected files */}
                {dokumenList.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-emerald-600 tracking-wider uppercase ml-1">File Baru Terpilih ({dokumenList.length})</p>
                    <div className="space-y-1.5">
                      {dokumenList.map((file, idx) => (
                        <div key={idx} className="px-3.5 py-2.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <span className="material-symbols-outlined normal-case text-emerald-600 text-[16px] shrink-0">check_circle</span>
                            <span className="text-[11px] font-bold text-emerald-800 truncate">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewFile(idx)}
                            className="w-6 h-6 rounded-lg hover:bg-emerald-100 text-emerald-600 hover:text-emerald-800 flex items-center justify-center transition-colors shrink-0"
                          >
                            <span className="material-symbols-outlined normal-case text-[14px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* List of previously uploaded files */}
                {existingFileList.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-blue-600 tracking-wider uppercase ml-1">Dokumen Aktif Saat Ini ({existingFileList.length})</p>
                    <div className="space-y-1.5">
                      {existingFileList.map((file, idx) => {
                        const filename = file.split('/').pop() || `Berkas_${idx + 1}`
                        const cleanName = filename.substring(filename.indexOf('_') + 1)
                        return (
                          <div key={idx} className="px-3.5 py-2.5 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
                            <a
                              href={`${API_BASE_URL.replace('/api', '')}${file}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 hover:underline truncate min-w-0"
                            >
                              <span className="material-symbols-outlined normal-case text-blue-600 text-[16px] shrink-0">description</span>
                              <span className="text-[11px] font-bold text-blue-800 truncate">{cleanName}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingFile(idx)}
                              className="w-6 h-6 rounded-lg hover:bg-blue-100 text-rose-600 hover:text-rose-800 flex items-center justify-center transition-colors shrink-0"
                            >
                              <span className="material-symbols-outlined normal-case text-[14px]">delete</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalBtn variant="ghost" type="button" onClick={() => setIsCrudOpen(false)}>
              Batalkan
            </ModalBtn>
            <ModalBtn type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin size-4">sync</span>
              ) : (
                <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '14px' }}>save</span>
              )}
              <span className="uppercase tracking-[0.1em]">{isEditMode ? 'Update Record' : 'Create Record'}</span>
            </ModalBtn>
          </ModalFooter>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Proposal?"
        description="Proposal dan seluruh riwayat persetujuannya akan dihapus permanen dari sistem."
        loading={isSubmitting}
      />
      {printData && createPortal(
        <div className="print-only-container">
          <style>{`
            @media screen {
              .print-only-container {
                display: none !important;
              }
            }
            @media print {
              #root {
                display: none !important;
              }
              .print-only-container {
                display: block !important;
                width: 297mm;
                height: 210mm;
                margin: 0;
                padding: 0;
                background-color: #ffffff;
              }
              @page {
                size: landscape;
                margin: 0;
              }
              body {
                background-color: #ffffff !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .page {
                width: 297mm;
                height: 210mm;
                position: relative;
                page-break-after: always;
                box-sizing: border-box;
                overflow: hidden;
                background-color: #ffffff;
              }
              .page:last-child {
                page-break-after: avoid;
              }
              .page-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 297mm;
                height: 210mm;
                z-index: 1;
                pointer-events: none;
              }
              .page-content {
                position: relative;
                z-index: 2;
                padding: 42mm 20mm 15mm 20mm;
                height: 100%;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .content-title {
                text-align: center;
                font-size: 14px;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: 5px;
                margin-bottom: 15px;
              }
              .grid-container {
                display: flex;
                gap: 20px;
                margin-bottom: 15px;
              }
              .col-left, .col-right {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 8px;
              }
              .info-card {
                background-color: #f8fafc;
                border: 1px solid #f1f5f9;
                border-radius: 8px;
                padding: 8px 12px;
              }
              .info-label {
                font-size: 8px;
                font-weight: 700;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0 0 2px 0;
              }
              .info-val {
                font-size: 11px;
                font-weight: 700;
                color: #334155;
                margin: 0;
              }
              .full-width-card {
                background-color: #f8fafc;
                border: 1px solid #f1f5f9;
                border-radius: 10px;
                padding: 10px 14px;
                margin-bottom: 10px;
                max-height: 85px;
                overflow: hidden;
              }
              .full-width-card .info-val {
                font-weight: 500;
                font-size: 10px;
                line-height: 1.4;
                color: #475569;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
              .pengesahan-title {
                text-align: center;
                font-size: 13px;
                font-weight: 800;
                color: #0f172a;
                margin-top: 5px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .summary-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
              }
              .summary-table td {
                padding: 5px 10px;
                font-size: 10px;
                border: 1px solid #e2e8f0;
              }
              .summary-table td.label-cell {
                background-color: #f8fafc;
                font-weight: bold;
                color: #64748b;
                width: 25%;
                text-transform: uppercase;
                font-size: 8px;
                letter-spacing: 0.5px;
              }
              .summary-table td.val-cell {
                font-weight: 600;
                color: #1e293b;
              }
              .signature-container {
                margin-top: 15px;
                font-size: 9px;
                color: #334155;
                line-height: 1.4;
              }
              .sig-block {
                text-align: center;
                width: 38%;
              }
              .sig-block-three {
                text-align: center;
                width: 30%;
              }
              .sig-space {
                height: 38px;
              }
              .sig-name {
                font-weight: 700;
                text-decoration: underline;
                margin: 0;
                font-size: 9.5px;
              }
              .sig-title {
                margin: 1px 0 0 0;
                color: #64748b;
                font-size: 8.5px;
                font-weight: 600;
              }
              .section-title {
                font-weight: 700;
                margin-bottom: 4px;
                text-transform: uppercase;
                font-size: 9px;
                color: #0f172a;
              }
            }
          `}</style>
          {(() => {
            const ormawa = printData?.Ormawa || {}
            const ormawaName = ormawa.Nama || ormawa.nama || 'Organisasi Kemahasiswaan'
            const ormawaAbbreviation = ormawa.Singkatan || ormawa.singkatan || ''
            const ormawaKategori = (ormawa.Kategori || ormawa.kategori || '').toUpperCase()

            let ormawaType = 'UKM'
            const upperName = ormawaName.toUpperCase()
            const upperAbbrev = ormawaAbbreviation.toUpperCase()

            if (ormawaKategori === 'UKM' || upperName.includes('UKM') || upperAbbrev.includes('UKM') || upperName.includes('UNIT KEGIATAN')) {
              ormawaType = 'UKM'
            } else if (ormawaKategori === 'HIMPUNAN' || upperName.includes('HIMPUNAN') || upperName.includes('HIMA') || upperAbbrev.includes('HIMA')) {
              ormawaType = 'HIMA'
            } else if (upperAbbrev.includes('DPM') || upperName.includes('DEWAN PERWAKILAN')) {
              if (upperName.includes('FAKULTAS') || upperName.includes('FARMASI') || upperName.includes('FIKES') || upperName.includes('KEPERAWATAN') || upperName.includes('SOSIAL')) {
                ormawaType = 'DPM Fakultas'
              } else {
                ormawaType = 'DPM Universitas'
              }
            } else if (upperAbbrev.includes('BEM') || upperName.includes('BADAN EKSEKUTIF')) {
              if (upperName.includes('FAKULTAS') || upperName.includes('FARMASI') || upperName.includes('FIKES') || upperName.includes('KEPERAWATAN') || upperName.includes('SOSIAL')) {
                ormawaType = 'BEM Fakultas'
              } else {
                ormawaType = 'BEM Universitas'
              }
            } else {
              if (ormawaKategori === 'BEM') ormawaType = 'BEM Universitas'
              else if (ormawaKategori === 'DPM') ormawaType = 'DPM Universitas'
              else if (ormawaKategori === 'HIMPUNAN') ormawaType = 'HIMA'
              else ormawaType = 'UKM'
            }

            const pjKegiatan = printData.PJKegiatan || printData.pj_kegiatan || '____________________'

            return (
              <>
                {/* Page 1: Proposal Details */}
                <div className="page">
                  <img src="/images/format_kop_rektorat_landscape.jpg" className="page-bg" />
                  <div className="page-content">
                    <div>
                      <div className="content-title" style={{ marginTop: '10px' }}>
                        PROPOSAL KEGIATAN {ormawaAbbreviation.toUpperCase()}
                      </div>
                      
                      <div className="grid-container">
                        <div className="col-left">
                          <div className="info-card">
                            <p className="info-label">Nama Kegiatan</p>
                            <p className="info-val" style={{ fontSize: '11.5px', color: '#0f172a' }}>{printData.Judul || '—'}</p>
                          </div>
                          <div className="info-card">
                            <p className="info-label">Organisasi Penyelenggara</p>
                            <p className="info-val">{ormawaName} ({ormawaAbbreviation.toUpperCase()})</p>
                          </div>
                          <div className="info-card">
                            <p className="info-label">PJ Kegiatan / Kontak</p>
                            <p className="info-val">{printData.PJKegiatan || printData.pj_kegiatan || '—'}</p>
                          </div>
                          <div className="info-card">
                            <p className="info-label">Mitra Kerja / Sponsor</p>
                            <p className="info-val">{printData.Mitra || printData.mitra || '—'}</p>
                          </div>
                        </div>
                        <div className="col-right">
                          <div className="info-card">
                            <p className="info-label">Rencana Anggaran</p>
                            <p className="info-val" style={{ color: '#059669' }}>
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(printData.Anggaran || 0)}
                            </p>
                          </div>
                          <div className="info-card">
                            <p className="info-label">Sumber Dana</p>
                            <p className="info-val">{printData.SumberDana || printData.sumber_dana || '—'}</p>
                          </div>
                          <div className="info-card">
                            <p className="info-label">Waktu Pelaksanaan</p>
                            <p className="info-val">{printData.JadwalPelaksanaan || printData.jadwal_pelaksanaan || '—'}</p>
                          </div>
                          <div className="info-card">
                            <p className="info-label">Indikator Keberhasilan</p>
                            <p className="info-val">{printData.IndikatorKeberhasilan || printData.indikator_keberhasilan || '—'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="full-width-card">
                        <p class="info-label">Latar Belakang Kegiatan</p>
                        <div className="info-val">{printData.LatarBelakang || printData.latar_belakang || '—'}</div>
                      </div>
                      <div className="full-width-card">
                        <p class="info-label">Deskripsi & Bentuk Kegiatan</p>
                        <div className="info-val">{printData.Deskripsi || printData.deskripsi || '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Page 2: Lembar Pengesahan */}
                <div className="page">
                  <img src="/images/format_kop_rektorat_landscape.jpg" className="page-bg" />
                  <div className="page-content">
                    <div>
                      <div className="pengesahan-title" style={{ marginTop: '10px' }}>Lembar Pengesahan Dokumen Proposal</div>
                      
                      <table className="summary-table">
                        <tbody>
                          <tr>
                            <td className="label-cell">Nama Kegiatan</td>
                            <td className="val-cell" colSpan={3}>{printData.Judul || '—'}</td>
                          </tr>
                          <tr>
                            <td className="label-cell">Organisasi</td>
                            <td className="val-cell">{ormawaName} ({ormawaAbbreviation.toUpperCase()})</td>
                            <td className="label-cell">Klasifikasi Ormawa</td>
                            <td className="val-cell">{ormawaType}</td>
                          </tr>
                          <tr>
                            <td className="label-cell">PJ Pelaksana</td>
                            <td className="val-cell">{printData.PJKegiatan || printData.pj_kegiatan || '—'}</td>
                            <td className="label-cell">Anggaran Diajukan</td>
                            <td className="val-cell" style={{ color: '#059669', fontWeight: 800 }}>
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(printData.Anggaran || 0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      {/* Signatures */}
                      {ormawaType === 'DPM Universitas' && (
                        <div className="signature-container">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <div className="sig-block">
                              <p>Ketua Pelaksana Kegiatan,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">{pjKegiatan}</p>
                              <p className="sig-title">Ketua Pelaksana</p>
                            </div>
                            <div className="sig-block">
                              <p>Ketua DPM UBK,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Ketua DPM UBK</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <div className="sig-block">
                              <p className="section-title">Menyetujui:</p>
                              <p>Ketua Divisi Pengembangan Prestasi, Beasiswa, Ormawa</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Kepala Divisi</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {ormawaType === 'BEM Universitas' && (
                        <div className="signature-container">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <div className="sig-block">
                              <p>Ketua Pelaksana Kegiatan,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">{pjKegiatan}</p>
                              <p className="sig-title">Ketua Pelaksana</p>
                            </div>
                            <div className="sig-block">
                              <p>Ketua BEM UBK,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Ketua BEM UBK</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <div className="sig-block">
                              <p className="section-title">Menyetujui*:</p>
                              <p>Ketua Divisi Pengembangan Prestasi, Beasiswa, Ormawa</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Kepala Divisi</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {ormawaType === 'UKM' && (
                        <div className="signature-container">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <div className="sig-block-three">
                              <p>Ketua Pelaksana Kegiatan,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">{pjKegiatan}</p>
                              <p className="sig-title">Ketua Pelaksana</p>
                            </div>
                            <div className="sig-block-three">
                              <p>Ketua UKM,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Ketua {ormawaAbbreviation || 'UKM'}</p>
                            </div>
                            <div className="sig-block-three">
                              <p>Ketua BEM Universitas,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Ketua BEM UBK</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                            <div className="sig-block">
                              <p className="section-title">Menyetujui:</p>
                              <p>Pembina UKM,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Pembina</p>
                            </div>
                            <div className="sig-block">
                              <p className="section-title">Menyetujui:</p>
                              <p>Ketua Divisi Pengembangan Prestasi, Beasiswa, Ormawa</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Kepala Divisi</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {ormawaType === 'DPM Fakultas' && (
                        <div className="signature-container">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <div className="sig-block">
                              <p>Ketua Pelaksana Kegiatan,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">{pjKegiatan}</p>
                              <p className="sig-title">Ketua Pelaksana</p>
                            </div>
                            <div className="sig-block">
                              <p>Ketua DPM,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Ketua DPM</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                            <div className="sig-block">
                              <p className="section-title">Menyetujui:</p>
                              <p>PJ Ormawa Fakultas,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">PJ Ormawa</p>
                            </div>
                            <div className="sig-block">
                              <p className="section-title">Menyetujui:</p>
                              <p>Wakil Dekan 1 Bidang Akademik, Penelitian, Pengmas, dan Kemahasiswaan</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Wakil Dekan 1</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {ormawaType === 'BEM Fakultas' && (
                        <div className="signature-container">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <div className="sig-block">
                              <p>Ketua Pelaksana Kegiatan,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">{pjKegiatan}</p>
                              <p className="sig-title">Ketua Pelaksana</p>
                            </div>
                            <div className="sig-block">
                              <p>Ketua BEM,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Ketua BEM</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                            <div className="sig-block">
                              <p className="section-title">Menyetujui*:</p>
                              <p>PJ Ormawa Fakultas,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">PJ Ormawa</p>
                            </div>
                            <div className="sig-block">
                              <p className="section-title">Menyetujui*:</p>
                              <p>Wakil Dekan 1 Bidang Akademik, Penelitian, Pengmas, dan Kemahasiswaan</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Wakil Dekan 1</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {ormawaType === 'HIMA' && (
                        <div className="signature-container">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                            <div className="sig-block-three">
                              <p>Ketua Pelaksana Kegiatan,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">{pjKegiatan}</p>
                              <p className="sig-title">Ketua Pelaksana</p>
                            </div>
                            <div className="sig-block-three">
                              <p>Ketua HIMA,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Ketua HIMA</p>
                            </div>
                            <div className="sig-block-three">
                              <p>Ketua BEM Fakultas,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Ketua BEM Fakultas</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                            <div className="sig-block-three">
                              <p className="section-title">Menyetujui:</p>
                              <p>Ketua Program Studi,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Ketua Prodi</p>
                            </div>
                            <div className="sig-block-three">
                              <p className="section-title">Menyetujui:</p>
                              <p>PJ Ormawa Fakultas,</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">PJ Ormawa</p>
                            </div>
                            <div className="sig-block-three">
                              <p className="section-title">Menyetujui:</p>
                              <p>Wakil Dekan 1 Bidang Akademik, Penelitian, Pengmas, dan Kemahasiswaan</p>
                              <div className="sig-space"></div>
                              <p className="sig-name">____________________</p>
                              <p className="sig-title">Wakil Dekan 1</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </div>,
        document.body
      )}    </div>
  )
}
