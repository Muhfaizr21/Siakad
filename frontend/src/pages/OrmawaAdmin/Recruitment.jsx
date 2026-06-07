"use client"
import React, { useState, useEffect } from 'react';
import { PageContent, PageHeader } from '@/components/ui/page';
import { Modal, ModalBody, ModalFooter, ModalBtn } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'



import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { DialogModal } from '@/components/ui/DialogModal'

import { toast, Toaster } from 'react-hot-toast'
import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

const API = `${API_BASE_URL}/ormawa`

const FieldGroup = ({ label, children, icon }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5 ml-1">
      {icon && <span className="material-symbols-outlined text-slate-400 text-sm">{icon}</span>}
      <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase font-headline">{label}</Label>
    </div>
    {children}
  </div>
)

export default function Recruitment() {
  const [activeTab, setActiveTab] = useState('pengaturan') // 'pengaturan', 'form-builder', 'pending', 'riwayat'
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [fieldsLoading, setFieldsLoading] = useState(false)
  const [config, setConfig] = useState({
    open_recruitment: false,
    recruitment_requirements: '',
    recruitment_start: '',
    recruitment_end: '',
    min_ipk: 0
  })
  const [applicants, setApplicants] = useState([])
  const [formFields, setFormFields] = useState([])

  // Modal detail state
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const ormawaId = getOrmawaId()

  const fetchSettings = async () => {
    try {
      const data = await fetchWithAuth(`${API}/settings/${ormawaId}`)
      if (data.status === 'success') {
        const d = data.data
        const formatDate = (dateStr) => {
          if (!dateStr) return ''
          try {
            return new Date(dateStr).toISOString().split('T')[0]
          } catch (e) {
            return ''
          }
        }
        setConfig({
          open_recruitment: d?.open_recruitment ?? d?.OpenRecruitment ?? false,
          recruitment_requirements: d?.recruitment_requirements ?? d?.RecruitmentRequirements ?? '',
          recruitment_start: formatDate(d?.recruitment_start ?? d?.RecruitmentStart),
          recruitment_end: formatDate(d?.recruitment_end ?? d?.RecruitmentEnd),
          min_ipk: d?.min_ipk ?? d?.MinIPK ?? 0
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchApplicants = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/members?ormawaId=${ormawaId}&periode=aktif`)
      if (data.status === 'success') {
        setApplicants(data.data || [])
      }
    } catch (e) {
      console.error(e)
      toast.error('Gagal memuat data pendaftar')
    } finally {
      setLoading(false)
    }
  }

  const fetchFormFields = async () => {
    setFieldsLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/recruitment-fields`)
      if (data.success !== false) {
        setFormFields(data.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setFieldsLoading(false)
    }
  }

  const saveFormFields = async () => {
    setFieldsLoading(true)
    try {
      const response = await fetchWithAuth(`${API}/recruitment-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formFields.map((f, i) => ({ ...f, order: i })))
      })
      if (response.success !== false) {
        toast.success('Form rekrutmen berhasil disimpan!')
        fetchFormFields()
      } else {
        toast.error(response.message || 'Gagal menyimpan form')
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setFieldsLoading(false)
    }
  }

  const addField = (type) => {
    setFormFields(prev => [...prev, {
      id: Date.now(), // temp id
      label: '',
      type,
      options: '',
      required: false,
      order: prev.length,
      isNew: true
    }])
  }

  const updateField = (idx, key, value) => {
    setFormFields(prev => prev.map((f, i) => i === idx ? { ...f, [key]: value } : f))
  }

  const removeField = (idx) => {
    setFormFields(prev => prev.filter((_, i) => i !== idx))
  }

  const moveField = (idx, direction) => {
    setFormFields(prev => {
      const next = [...prev]
      const target = idx + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  useEffect(() => {
    fetchSettings()
    fetchApplicants()
    fetchFormFields()
  }, [ormawaId])

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Fetch full settings first to preserve other fields like Nama, Visi, Misi, etc.
      const existingData = await fetchWithAuth(`${API}/settings/${ormawaId}`)
      let fullPayload = {}
      if (existingData.status === 'success') {
        fullPayload = { ...existingData.data }
      }

      const payload = {
        ...fullPayload,
        open_recruitment: config.open_recruitment,
        recruitment_requirements: config.recruitment_requirements,
        recruitment_start: config.recruitment_start ? new Date(config.recruitment_start).toISOString() : null,
        recruitment_end: config.recruitment_end ? new Date(config.recruitment_end).toISOString() : null,
        min_ipk: parseFloat(config.min_ipk) || 0
      }

      const json = await fetchWithAuth(`${API}/settings/${ormawaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (json.status === 'success') {
        toast.success('Pengaturan pendaftaran berhasil disimpan!')
        window.dispatchEvent(new Event('ormawa_settings_updated'))
        fetchSettings()
      } else {
        toast.error(json.message || 'Gagal menyimpan pengaturan')
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessApplicant = async (id, status, applicantData) => {
    setActionLoading(true)
    try {
      const payload = {
        Role: 'Anggota',
        Divisi: applicantData.Divisi || 'Umum',
        Status: status
      }
      const response = await fetchWithAuth(`${API}/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.status === 'success') {
        toast.success(status === 'aktif' ? 'Pendaftaran disetujui!' : 'Pendaftaran ditolak!')
        setIsDetailOpen(false)
        setSelectedApplicant(null)
        fetchApplicants()
      } else {
        toast.error(response.message || 'Gagal memproses pendaftaran')
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setActionLoading(false)
    }
  }

  // Filter lists based on status
  const pendingApplicants = applicants.filter(app => app.Status?.toLowerCase() === 'pending')
  const historyApplicants = applicants.filter(app => app.Status?.toLowerCase() === 'aktif' || app.Status?.toLowerCase() === 'tidak_aktif')

  const pendingColumns = [
    {
      key: 'Mahasiswa', label: 'Profil Pendaftar', className: 'min-w-[240px]',
      render: (val, row) => {
        const fotoUrl = row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url || null
        return (
          <div className="flex items-center gap-3">
            {fotoUrl ? (
              <img
                src={fotoUrl.startsWith('http') ? fotoUrl : `${API_BASE_URL.replace('/api', '')}${fotoUrl}`}
                alt={row.Mahasiswa?.Nama}
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                onError={(e) => { e.target.src = ''; }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-border">
                <span className="material-symbols-outlined text-slate-400 text-2xl">person</span>
              </div>
            )}
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{row.Mahasiswa?.Nama || '—'}</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-tight font-mono">{row.Mahasiswa?.NIM || '—'}</span>
            </div>
          </div>
        )
      }
    },
    {
      key: 'IPK', label: 'IPK', className: 'w-[80px]',
      render: (val, row) => (
        <span className="font-bold text-slate-700 text-sm">{row.IPK ? row.IPK.toFixed(2) : (row.Mahasiswa?.IPK ? row.Mahasiswa.IPK.toFixed(2) : '—')}</span>
      )
    },
    {
      key: 'Divisi', label: 'Divisi Pilihan 1', className: 'w-[140px]',
      render: (val) => val ? (
        <Badge className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100 rounded-lg px-2.5 py-0.5 uppercase tracking-wider">{val}</Badge>
      ) : (
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider font-headline">Umum</span>
      )
    },
    {
      key: 'divisi_pilihan_dua', label: 'Divisi Pilihan 2', className: 'w-[140px]',
      render: (val) => val ? (
        <Badge className="bg-purple-50 text-purple-700 font-extrabold text-[10px] border border-purple-100 rounded-lg px-2.5 py-0.5 uppercase tracking-wider">{val}</Badge>
      ) : (
        <span className="text-slate-400 text-xs font-semibold italic">Tidak ada</span>
      )
    },
    {
      key: 'CV', label: 'Dokumen', className: 'w-[120px]',
      render: (val, row) => row.CVURL || row.cv_url ? (
        <a
          href={row.CVURL || row.cv_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold hover:underline"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>description</span>
          Lihat CV
        </a>
      ) : (
        <span className="text-slate-400 text-xs font-semibold italic">Tidak ada CV</span>
      )
    }
  ]

  const historyColumns = [
    {
      key: 'Mahasiswa', label: 'Profil Pendaftar', className: 'min-w-[240px]',
      render: (val, row) => {
        const fotoUrl = row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url || null
        return (
          <div className="flex items-center gap-3">
            {fotoUrl ? (
              <img
                src={fotoUrl.startsWith('http') ? fotoUrl : `${API_BASE_URL.replace('/api', '')}${fotoUrl}`}
                alt={row.Mahasiswa?.Nama}
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                onError={(e) => { e.target.src = ''; }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-border">
                <span className="material-symbols-outlined text-slate-400 text-2xl">person</span>
              </div>
            )}
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{row.Mahasiswa?.Nama || '—'}</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-tight font-mono">{row.Mahasiswa?.NIM || '—'}</span>
            </div>
          </div>
        )
      }
    },
    {
      key: 'IPK', label: 'IPK', className: 'w-[80px]',
      render: (val, row) => (
        <span className="font-bold text-slate-700 text-sm">{row.IPK ? row.IPK.toFixed(2) : (row.Mahasiswa?.IPK ? row.Mahasiswa.IPK.toFixed(2) : '—')}</span>
      )
    },
    {
      key: 'Divisi', label: 'Divisi Pilihan 1', className: 'w-[140px]',
      render: (val) => val ? (
        <Badge className="bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-semibold text-[10px] border border-[var(--theme-primary)]/20 rounded-md px-2.5 py-0.5 uppercase tracking-wider">{val}</Badge>
      ) : (
        <span className="text-[var(--theme-text-subtle)] text-xs font-bold uppercase tracking-wider font-headline">Umum</span>
      )
    },
    {
      key: 'Status', label: 'Status Keputusan', className: 'w-[150px] text-center', cellClassName: 'text-center',
      render: (val) => {
        const isDiterima = val?.toLowerCase() === 'aktif'
        return (
          <Badge className={`font-black text-[10px] px-3 py-1 border rounded-lg uppercase tracking-wider ${
            isDiterima ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {isDiterima ? 'Diterima' : 'Ditolak'}
          </Badge>
        )
      }
    }
  ]

  return (
    <PageContent className="font-body">
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />

            {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <PageHeader 
        title="Open Recruitment"
        subtitle="Kelola pendaftaran anggota baru, jadwal rekrutmen, persyaratan dokumen, dan persetujuan pendaftar."
        icon="how_to_reg"
       
        breadcrumbs={[ { label: 'Dashboard', path: '/ormawa' }, { label: 'Open Recruitment', path: '#' } ]} 
      />

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-6">
        <button
          onClick={() => setActiveTab('pengaturan')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'pengaturan' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
          Pengaturan Recruitment
        </button>
        <button
          onClick={() => setActiveTab('form-builder')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'form-builder' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dynamic_form</span>
          Form Builder ({formFields.length} Field)
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'pending' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pending_actions</span>
          Pendaftar Masuk ({pendingApplicants.length})
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'riwayat' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
          Riwayat Keputusan
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'pengaturan' && (
          <form onSubmit={handleSaveSettings}>
            <Card className="border border-border shadow-sm overflow-hidden bg-surface rounded-2xl">
              <CardContent className="p-6 md:p-8 space-y-6">

                <div className="flex items-center justify-between p-4 bg-[var(--theme-bg)] border border-border rounded-2xl">
                  <div className="space-y-0.5 text-left">
                    <Label className="text-xs font-bold text-[var(--theme-text)]">Status Pendaftaran Anggota</Label>
                    <p className="text-[10px] text-[var(--theme-text-subtle)] font-medium">Aktifkan untuk membuka formulir pendaftaran online bagi mahasiswa</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.open_recruitment}
                      onChange={e => setConfig({ ...config, open_recruitment: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-primary)]"></div>
                  </label>
                </div>

                {config.open_recruitment && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FieldGroup label="Tanggal Mulai Pendaftaran" icon="calendar_today">
                        <Input
                          type="date"
                          value={config.recruitment_start}
                          onChange={e => setConfig({ ...config, recruitment_start: e.target.value })}
                          className="h-10 rounded-xl border border-border bg-[var(--theme-bg)] focus:bg-white focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] focus:outline-none shadow-none font-medium text-xs w-full transition-all"
                        />
                      </FieldGroup>

                      <FieldGroup label="Tanggal Selesai Pendaftaran" icon="event_busy">
                        <Input
                          type="date"
                          value={config.recruitment_end}
                          onChange={e => setConfig({ ...config, recruitment_end: e.target.value })}
                          className="h-10 rounded-xl border border-border bg-[var(--theme-bg)] focus:bg-white focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] focus:outline-none shadow-none font-medium text-xs w-full transition-all"
                        />
                      </FieldGroup>

                      <FieldGroup label="IPK Minimal Pendaftaran" icon="grade">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                          placeholder="Contoh: 3.00 (0 jika tidak ada)"
                          value={config.min_ipk}
                          onChange={e => setConfig({ ...config, min_ipk: parseFloat(e.target.value) || 0 })}
                          className="h-10 rounded-xl border border-border bg-[var(--theme-bg)] focus:bg-white focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] focus:outline-none shadow-none font-bold text-xs w-full text-[var(--theme-text)] transition-all"
                        />
                      </FieldGroup>
                    </div>

                    <FieldGroup label="Persyaratan Pendaftaran Anggota" icon="assignment">
                      <Textarea
                        value={config.recruitment_requirements}
                        onChange={e => setConfig({ ...config, recruitment_requirements: e.target.value })}
                        placeholder="Tuliskan persyaratan pendaftaran anggota (misal: 1. IPK minimal 3.00, 2. CV terbaru, dst.)..."
                        className="min-h-[120px] rounded-xl border border-border bg-[var(--theme-bg)] focus:bg-white focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] focus:outline-none shadow-none p-4 font-medium text-xs leading-relaxed transition-all"
                      />
                    </FieldGroup>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto h-10 px-6 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white flex items-center justify-center gap-2 border-none shadow-md shadow-[var(--theme-primary)]/10 active:scale-95 duration-150"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                    )}
                    <span className="text-[10px] font-black tracking-widest uppercase">SIMPAN PERUBAHAN</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {/* ── Form Builder Tab ─────────────────────────────── */}
        {activeTab === 'form-builder' && (
          <div className="space-y-6">
            <Card className="border border-border shadow-sm overflow-hidden bg-surface rounded-2xl">
              <CardContent className="p-6 md:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Form Builder Pendaftaran</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Tambahkan pertanyaan kustom yang akan diisi oleh mahasiswa saat mendaftar. Layaknya Google Form.</p>
                  </div>
                  <button
                    onClick={saveFormFields}
                    disabled={fieldsLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-violet-600 text-white text-xs font-black hover:bg-violet-700 transition-all active:scale-95 shadow-md shadow-violet-600/10"
                  >
                    {fieldsLoading
                      ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>sync</span>
                      : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                    }
                    Simpan Form
                  </button>
                </div>

                {/* Add Field Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { type: 'text', label: 'Teks Singkat', icon: 'short_text' },
                    { type: 'paragraph', label: 'Paragraf', icon: 'notes' },
                    { type: 'select', label: 'Dropdown', icon: 'arrow_drop_down_circle' },
                    { type: 'checkbox', label: 'Pilihan Ganda', icon: 'check_box' },
                    { type: 'file', label: 'Upload File', icon: 'upload_file' },
                  ].map(({ type, label, icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addField(type)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-border text-slate-700 text-xs font-bold hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
                      + {label}
                    </button>
                  ))}
                </div>

                {/* Field List */}
                {formFields.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">dynamic_form</span>
                    <p className="text-sm font-semibold">Belum ada field. Klik tombol di atas untuk menambahkan pertanyaan.</p>
                    <p className="text-xs mt-1">Jika form kosong, mahasiswa akan mengisi form standar (alasan & CV URL).</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formFields.map((field, idx) => (
                      <div key={field.id || idx} className="p-4 border border-border rounded-2xl bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 16 }}>
                              {field.type === 'text' ? 'short_text' : field.type === 'paragraph' ? 'notes' : field.type === 'select' ? 'arrow_drop_down_circle' : field.type === 'checkbox' ? 'check_box' : 'upload_file'}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              {field.type === 'text' ? 'Teks Singkat' : field.type === 'paragraph' ? 'Paragraf' : field.type === 'select' ? 'Dropdown' : field.type === 'checkbox' ? 'Pilihan Ganda' : 'Upload File'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveField(idx, -1)} disabled={idx === 0} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-all">
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_upward</span>
                            </button>
                            <button type="button" onClick={() => moveField(idx, 1)} disabled={idx === formFields.length - 1} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-all">
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_downward</span>
                            </button>
                            <button type="button" onClick={() => removeField(idx)} className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-all">
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Label Pertanyaan *</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={e => updateField(idx, 'label', e.target.value)}
                              placeholder="Contoh: Motivasi Bergabung"
                              className="w-full h-9 px-3 rounded-xl border border-border bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-violet-400"
                            />
                          </div>

                          {(field.type === 'select' || field.type === 'checkbox') && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Pilihan (pisahkan dengan koma)</label>
                              <input
                                type="text"
                                value={field.options}
                                onChange={e => updateField(idx, 'options', e.target.value)}
                                placeholder="Contoh: Pilihan A, Pilihan B, Pilihan C"
                                className="w-full h-9 px-3 rounded-xl border border-border bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-violet-400"
                              />
                            </div>
                          )}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={e => updateField(idx, 'required', e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-violet-600"
                          />
                          <span className="text-xs font-bold text-slate-600">Wajib diisi</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'pending' && (
          <Card className="border border-border shadow-sm overflow-hidden bg-surface rounded-2xl">
            <CardContent className="p-0">
              <DataTable
                columns={pendingColumns}
                data={pendingApplicants}
                loading={loading}
                searchPlaceholder="Cari pendaftar..."
                actions={(row) => (
                  <div className="flex items-center justify-end gap-2 pr-2">
                    <button
                      onClick={() => { setSelectedApplicant(row); setIsDetailOpen(true) }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--theme-primary-light)] text-[var(--theme-primary)] text-xs font-bold hover:bg-[var(--theme-primary-light)]/80 border border-[var(--theme-primary)]/20 transition-all active:scale-95 duration-100"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
                      Review Detail
                    </button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'riwayat' && (
          <Card className="border border-border shadow-sm overflow-hidden bg-surface rounded-2xl">
            <CardContent className="p-0">
              <DataTable
                columns={historyColumns}
                data={historyApplicants}
                loading={loading}
                searchPlaceholder="Cari riwayat pendaftaran..."
                actions={(row) => (
                  <div className="flex items-center justify-end gap-2 pr-2">
                    <button
                      onClick={() => { setSelectedApplicant(row); setIsDetailOpen(true) }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--theme-bg)] text-[var(--theme-text-muted)] text-xs font-bold hover:bg-[var(--theme-border-muted)] border border-border transition-all active:scale-95 duration-100"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
                      Lihat Formulir
                    </button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Review Modal */}
      {selectedApplicant && (
        <DialogModal
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onClose={() => { setIsDetailOpen(false); setSelectedApplicant(null); }}
          title="Formulir Pendaftaran"
          description="Formulir detail pengajuan rekrutmen anggota baru."
          icon={<span className="material-symbols-outlined">description</span>}
          maxWidth="max-w-xl"
          footer={
            <>
              <Button variant="ghost" type="button" onClick={() => { setIsDetailOpen(false); setSelectedApplicant(null); }}>
                Tutup
              </Button>
              {selectedApplicant.Status?.toLowerCase() === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => handleProcessApplicant(selectedApplicant.ID || selectedApplicant.id, 'tidak_aktif', selectedApplicant)}
                    disabled={actionLoading}
                    className="h-10 px-5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-100 transition-all active:scale-95 duration-100"
                  >
                    Tolak
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleProcessApplicant(selectedApplicant.ID || selectedApplicant.id, 'aktif', selectedApplicant)}
                    disabled={actionLoading}
                    className="h-10 px-5 rounded-xl bg-[var(--theme-primary)] text-white text-xs font-bold hover:bg-[var(--theme-primary-hover)] transition-all active:scale-95 duration-100 shadow-md shadow-[var(--theme-primary)]/10 border-none"
                  >
                    Terima Pendaftaran
                  </Button>
                </div>
              )}
            </>
          }
        >
          <div className="p-6 space-y-6">
              {/* Header profile */}
              <div className="flex items-center gap-4 bg-[var(--theme-bg)] border border-border p-4 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-[var(--theme-primary-light)] text-[var(--theme-primary)] flex items-center justify-center font-bold text-xl shrink-0">
                  {selectedApplicant.Mahasiswa?.FotoURL ? (
                    <img
                      src={selectedApplicant.Mahasiswa.FotoURL.startsWith('http') ? selectedApplicant.Mahasiswa.FotoURL : `${API_BASE_URL.replace('/api', '')}${selectedApplicant.Mahasiswa.FotoURL}`}
                      alt={selectedApplicant.Mahasiswa?.Nama}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    selectedApplicant.Mahasiswa?.Nama?.slice(0, 2).toUpperCase() || 'MHS'
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-[var(--theme-text)] text-base leading-snug">{selectedApplicant.Mahasiswa?.Nama}</h3>
                  <p className="text-xs text-[var(--theme-text-subtle)] font-semibold mt-0.5">NIM: {selectedApplicant.Mahasiswa?.NIM || '—'}</p>
                  <p className="text-xs text-[var(--theme-text-muted)] font-bold mt-1 uppercase tracking-wider">{selectedApplicant.Mahasiswa?.ProgramStudi?.Nama || 'Program Studi'}</p>
                </div>
              </div>

              {/* Data Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--theme-bg)] border border-border rounded-2xl">
                  <p className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-wider uppercase mb-1">IPK Resmi (SIAKAD)</p>
                  <p className="text-base font-black text-[var(--theme-text)]">{selectedApplicant.IPK ? selectedApplicant.IPK.toFixed(2) : (selectedApplicant.Mahasiswa?.IPK ? selectedApplicant.Mahasiswa.IPK.toFixed(2) : '—')}</p>
                </div>
                <div className="p-4 bg-[var(--theme-bg)] border border-border rounded-2xl">
                  <p className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-wider uppercase mb-1">Status Pengajuan</p>
                  <Badge className={`font-black text-[9px] px-2.5 py-0.5 border rounded-lg uppercase tracking-wider ${
                    selectedApplicant.Status?.toLowerCase() === 'aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedApplicant.Status?.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selectedApplicant.Status?.toLowerCase() === 'aktif' ? 'Diterima' :
                     selectedApplicant.Status?.toLowerCase() === 'pending' ? 'Menunggu Review' :
                     'Ditolak'}
                  </Badge>
                </div>
                <div className="p-4 bg-[var(--theme-bg)] border border-border rounded-2xl">
                  <p className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-wider uppercase mb-1">Divisi Pilihan Utama (1)</p>
                  <Badge className="bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 font-black text-[9.5px] rounded-lg px-2.5 py-0.5 uppercase tracking-wide">
                    {selectedApplicant.Divisi || 'Umum'}
                  </Badge>
                </div>
                <div className="p-4 bg-[var(--theme-bg)] border border-border rounded-2xl">
                  <p className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-wider uppercase mb-1">Divisi Pilihan Alternatif (2)</p>
                  {selectedApplicant.divisi_pilihan_dua || selectedApplicant.DivisiPilihanDua ? (
                    <Badge className="bg-[var(--theme-secondary-light)] text-[var(--theme-secondary)] border border-[var(--theme-secondary)]/20 font-black text-[9.5px] rounded-lg px-2.5 py-0.5 uppercase tracking-wide">
                      {selectedApplicant.divisi_pilihan_dua || selectedApplicant.DivisiPilihanDua}
                    </Badge>
                  ) : (
                    <span className="text-[var(--theme-text-subtle)] text-xs font-semibold italic">Tidak ada pilihan kedua</span>
                  )}
                </div>
              </div>

              {/* Custom Answers from Dynamic Form */}
              {(() => {
                const rawAnswers = selectedApplicant.CustomAnswers || selectedApplicant.custom_answers
                if (!rawAnswers) return null
                let answers = {}
                try { answers = typeof rawAnswers === 'string' ? JSON.parse(rawAnswers) : rawAnswers } catch { return null }
                const keys = Object.keys(answers)
                if (keys.length === 0) return null
                return (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase font-headline">Jawaban Form Kustom</p>
                    <div className="space-y-2">
                      {keys.map(k => (
                        <div key={k} className="p-3.5 bg-violet-50 border border-violet-100 rounded-2xl">
                          <p className="text-[9px] font-black text-violet-400 uppercase tracking-wider mb-1">Field #{k}</p>
                          <p className="text-xs font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {Array.isArray(answers[k]) ? answers[k].join(', ') : String(answers[k])}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Alasan / Motivasi */}
              <div className="space-y-1 ml-1">
                <p className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] uppercase font-headline">Motivasi &amp; Alasan Bergabung</p>
                <div className="p-4 bg-[var(--theme-bg)] border border-border rounded-2xl text-xs font-semibold text-[var(--theme-text)] leading-relaxed whitespace-pre-wrap font-body max-h-36 overflow-y-auto">
                  {selectedApplicant.alasan || selectedApplicant.Alasan || '—'}
                </div>
              </div>

              {/* CV / Portofolio Link */}
              {selectedApplicant.cv_url || selectedApplicant.CVURL ? (
                <div className="space-y-2 ml-1">
                  <p className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] uppercase font-headline">Tautan Berkas Pendukung (CV / Portfolio)</p>
                  <a
                    href={selectedApplicant.cv_url || selectedApplicant.CVURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 bg-[var(--theme-primary-light)]/40 border border-[var(--theme-primary)]/20 rounded-2xl hover:bg-[var(--theme-primary-light)]/70 transition-all group"
                  >
                    <div className="flex items-center gap-2 text-xs text-[var(--theme-primary)] font-bold">
                      <span className="material-symbols-outlined text-lg">open_in_new</span>
                      <span>Buka Tautan CV / Dokumen Pendaftaran</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[var(--theme-primary)] transition-colors">chevron_right</span>
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-border rounded-2xl text-xs text-slate-400 italic text-center font-semibold">
                  Pendaftar tidak menyertakan berkas pendukung (CV / Portofolio).
                </div>
              )}
          </div>
        </DialogModal>
      )}
    </PageContent>
  )
}
