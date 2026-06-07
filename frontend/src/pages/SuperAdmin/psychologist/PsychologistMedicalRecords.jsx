"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { Card, CardContent } from '@/components/ui/Card'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../../services/api'
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'

export default function PsychologistMedicalRecords() {
  const [medicalRecords, setMedicalRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const mrRes = await adminService.getPsychologistMedicalRecords()
      if (mrRes.status === 'success') {
        const flattened = (mrRes.data || []).map(item => {
          const mhs = item.mahasiswa || item.Mahasiswa;
          return {
            ...item,
            _fakultas: mhs?.fakultas?.Nama || mhs?.Fakultas?.Nama || mhs?.fakultas?.nama || mhs?.Fakultas?.nama || '',
            _semester: mhs?.SemesterSekarang || mhs?.semester_sekarang || ''
          };
        })
        setMedicalRecords(flattened)
      } else {
        toast.error('Gagal memuat rekam medis')
      }
    } catch (err) {
      console.error(err)
      toast.error('Koneksi sistem terputus / Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const fakultasOptions = useMemo(() => {
    const unique = [...new Set(medicalRecords.map(i => i._fakultas).filter(Boolean))].sort()
    return unique.map(f => ({ label: f.toUpperCase(), value: f }))
  }, [medicalRecords])

  const semesterOptions = useMemo(() => {
    const unique = [...new Set(medicalRecords.map(i => i._semester).filter(v => v !== '' && v !== undefined && v !== null))].sort((a, b) => Number(a) - Number(b))
    return unique.map(s => ({ label: `SEMESTER ${s}`, value: String(s) }))
  }, [medicalRecords])

  const medicalRecordColumns = [
    {
      key: 'mahasiswa',
      label: 'Mahasiswa',
      className: 'w-[250px]',
      render: (v, row) => {
        const mhs = row.mahasiswa || row.Mahasiswa;
        return (
          <div className="flex flex-col py-1 font-jakarta">
            <span className="font-bold text-neutral-900 text-xs">{mhs?.Nama || mhs?.nama || '—'}</span>
            <span className="text-[10px] text-neutral-400 font-bold">{mhs?.NIM || mhs?.nim || '—'}</span>
            <span className="text-[9px] text-neutral-400 font-medium tracking-wide uppercase">{mhs?.program_studi?.nama || mhs?.ProgramStudi?.Nama || mhs?.program_studi?.Nama || '—'}</span>
            <div className="flex items-center gap-2 mt-0.5">
              {row._fakultas && <span className="text-[8px] text-bku-primary font-bold bg-bku-primary/10 px-1.5 py-0.5 rounded">{row._fakultas}</span>}
              {row._semester && <span className="text-[8px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Sem {row._semester}</span>}
            </div>
          </div>
        )
      }
    },
    {
      key: 'psikolog',
      label: 'Konselor / Psikolog',
      className: 'w-[180px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 font-jakarta">
          <span className="font-bold text-neutral-800 text-xs">{row.psikolog?.nama || '—'}</span>
          <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{row.psikolog?.spesialisasi || '—'}</span>
        </div>
      )
    },
    {
      key: 'tanggal',
      label: 'Pemeriksaan',
      className: 'w-[150px]',
      render: (v, row) => {
        const formattedDate = v ? new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        return (
          <div className="flex flex-col font-jakarta">
            <span className="font-bold text-xs text-neutral-800">{formattedDate}</span>
            <span className="text-[9px] text-neutral-400 font-bold uppercase">Konseling</span>
          </div>
        )
      }
    },
    {
      key: 'mood',
      label: 'Mood',
      className: 'w-[130px]',
      render: v => (
        <span className="text-xs font-bold text-bku-primary font-jakarta">{v || '—'}</span>
      )
    },
    {
      key: 'status_pasien',
      label: 'Status Pasien',
      className: 'w-[150px]',
      render: v => (
        <Badge className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 font-jakarta shadow-none">
          {v || '—'}
        </Badge>
      )
    }
  ]

  const handleOpenDetail = (item) => {
    setDetailItem(item)
    setIsDetailOpen(true)
  }

  return (
    <PageContent>
      <Toaster position="top-right" />
      
      <DashboardHero
        title="Rekam Medis"
        highlightedTitle="Psikologi"
        subtitle="Catatan sesi klinis mahasiswa, hasil observasi psikolog, mood logger, dan rekomendasi tindak lanjut penanganan kesehatan mental."
        icon="medical_services"
        badges={[{ label: 'Layanan Konseling Kampus', active: false }]}
        actions={
          <div className="px-4 py-2 bg-bku-primary/5 border border-bku-primary/20 rounded-xl flex items-center gap-3 w-full lg:w-auto justify-center">
             <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }}>medical_services</span>
             <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold text-bku-primary/70 uppercase tracking-widest">Akses Validasi</span>
                <span className="text-[12px] font-bold text-bku-primary font-jakarta">Super Admin Portal</span>
             </div>
          </div>
        }
      />

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0 animate-in fade-in duration-300">
            <DataTable
              columns={medicalRecordColumns}
              data={medicalRecords}
              loading={loading}
              searchPlaceholder="Cari Nama Mahasiswa, Keluhan, atau Observasi..."
              filters={[
                { key: '_fakultas', placeholder: 'Pilih Fakultas', options: fakultasOptions },
                { key: '_semester', placeholder: 'Pilih Semester', options: semesterOptions },
                { key: 'status_pasien', placeholder: 'Pilih Status Pasien', options: [{ label: 'Selesai', value: 'selesai' }, { label: 'Dirujuk', value: 'dirujuk' }, { label: 'Konsultasi Lanjutan', value: 'konsultasi lanjutan' }] }
              ]}
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => handleOpenDetail(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-bku-primary hover:bg-bku-primary/10 rounded-lg transition-colors" title="Lihat Detail"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader className="p-6 sm:p-8 pb-4 sm:pb-6 border-b border-neutral-100 relative overflow-hidden bg-neutral-50/50">
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >visibility</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-bku-primary">
                  Detail Catatan Sesi
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                Rekam Medis Mahasiswa
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto font-jakarta">
            {detailItem && (
              <>
                {/* Mahasiswa Info Section */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Identitas Mahasiswa</h4>
                  {(() => {
                    const mhs = detailItem.mahasiswa || detailItem.Mahasiswa;
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block">Nama Lengkap</span>
                          <span className="text-sm font-bold text-neutral-800">{mhs?.Nama || mhs?.nama || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block">NIM (Nomor Induk Mahasiswa)</span>
                          <span className="text-sm font-bold text-neutral-800">{mhs?.NIM || mhs?.nim || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block">Program Studi</span>
                          <span className="text-xs font-semibold text-neutral-700">{mhs?.program_studi?.nama || mhs?.ProgramStudi?.Nama || mhs?.program_studi?.Nama || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block">Fakultas</span>
                          <span className="text-xs font-semibold text-neutral-700">{mhs?.fakultas?.Nama || mhs?.Fakultas?.Nama || mhs?.fakultas?.nama || mhs?.Fakultas?.nama || '—'}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Psychologist Info Section */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tenaga Profesional</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Nama Psikolog</span>
                      <span className="text-sm font-bold text-neutral-800">{detailItem.psikolog?.nama || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Spesialisasi</span>
                      <span className="text-xs font-bold text-bku-primary uppercase tracking-wide">{detailItem.psikolog?.spesialisasi || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Tanggal Sesi</span>
                      <span className="text-xs font-bold text-neutral-800">
                        {detailItem.tanggal ? new Date(detailItem.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Mood Mahasiswa</span>
                      <span className="text-xs font-bold text-bku-primary">{detailItem.mood || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Status Pasien</span>
                      <Badge className="px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {detailItem.status_pasien || '—'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-neutral-400 font-bold block">Keluhan Konseling</span>
                    <p className="text-xs font-medium text-neutral-700 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100 whitespace-pre-wrap leading-relaxed">{detailItem.keluhan || '—'}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-neutral-400 font-bold block">Hasil Observasi Psikolog</span>
                    <p className="text-xs font-medium text-neutral-700 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100 whitespace-pre-wrap leading-relaxed">{detailItem.observasi || '—'}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-neutral-400 font-bold block">Rekomendasi Tindak Lanjut</span>
                    <p className="text-xs font-medium text-bku-primary bg-bku-primary/5 p-3 rounded-lg border border-bku-primary/20 whitespace-pre-wrap leading-relaxed">{detailItem.rekomendasi || '—'}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="p-6 border-t border-neutral-100 bg-neutral-50/50">
            <Button onClick={() => setIsDetailOpen(false)} className="h-10 px-5 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-900">
              Tutup Detail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContent>
  )
}
