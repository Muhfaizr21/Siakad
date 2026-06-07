"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { PageContent, PageCard } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'

// Fallback Icons
const Trophy = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, fontVariationSettings: "'FILL' 1", ...props.style }} {...props}>emoji_events</span>;
const History = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>history</span>;
const Medal = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>military_tech</span>;
const Stars = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>stars</span>;
const SettingsIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>settings</span>;
const EditIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>edit</span>;

export default function GamifikasiOrmawa() {
  const [activeTab, setActiveTab] = useState('leaderboard') // 'leaderboard' or 'settings'
  const [leaderboard, setLeaderboard] = useState([])
  const [history, setHistory] = useState([])
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Rule Edit States
  const [selectedRule, setSelectedRule] = useState(null)
  const [isRuleEditOpen, setIsRuleEditOpen] = useState(false)
  const [submittingRule, setSubmittingRule] = useState(false)
  const [ruleForm, setRuleForm] = useState({ poin: 0, label: '', deskripsi: '' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [leadRes, histRes, rulesRes] = await Promise.all([
        adminService.getOrmawaLeaderboard(),
        adminService.getOrmawaGamifikasiHistory(),
        adminService.getGamifikasiRules()
      ])

      if (leadRes.status === 'success') {
        setLeaderboard(leadRes.data || [])
      } else {
        toast.error('Gagal memuat papan peringkat')
      }

      if (histRes.status === 'success') {
        setHistory(histRes.data || [])
      } else {
        toast.error('Gagal memuat riwayat poin')
      }

      if (rulesRes.status === 'success') {
        setRules(rulesRes.data || [])
      } else {
        toast.error('Gagal memuat aturan poin')
      }
    } catch {
      toast.error('Terjadi gangguan jaringan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenEditRule = (rule) => {
    setSelectedRule(rule)
    setRuleForm({
      poin: rule.poin || 0,
      label: rule.label || '',
      deskripsi: rule.deskripsi || ''
    })
    setIsRuleEditOpen(true)
  }

  const handleSaveRule = async (e) => {
    if (e) e.preventDefault()
    setSubmittingRule(true)
    try {
      const res = await adminService.updateGamifikasiRule(selectedRule.id || selectedRule.ID, ruleForm)
      if (res.status === 'success') {
        toast.success('Aturan gamifikasi berhasil diperbarui & disinkronkan!')
        setIsRuleEditOpen(false)
        fetchData()
      } else {
        toast.error(res.message || 'Gagal menyimpan aturan')
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setSubmittingRule(false)
    }
  }

  // Top 3 Ormawas
  const top3 = leaderboard.slice(0, 3)

  // Map key rule to symbol/icon
  const getRuleIcon = (key) => {
    switch(key) {
      case 'proposal_disetujui': return 'assignment';
      case 'kegiatan_selesai': return 'event_available';
      case 'aspirasi_selesai': return 'campaign';
      case 'prestasi_terverifikasi': return 'military_tech';
      default: return 'stars';
    }
  }

  return (
    <PageContent>
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <DashboardHero
          title="Gamifikasi"
          highlightedTitle="Ormawa"
          subtitle="Papan peringkat keaktifan, total akumulasi poin prestasi, dan konfigurasi aturan poin yang tersinkron otomatis."
          icon="emoji_events"
          badges={[
            { label: 'Sistem Gamifikasi', active: true }
          ]}
        />

        {/* ── Tabs Switcher ────────────────────────────────────────── */}
        <div className="flex gap-2 bg-neutral-200/40 p-1 rounded-2xl w-fit border border-neutral-200/50">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-bold text-xs transition-all uppercase tracking-wider flex items-center gap-2",
              activeTab === 'leaderboard'
                ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/30"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            <Trophy size={14} />
            Papan Peringkat
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-bold text-xs transition-all uppercase tracking-wider flex items-center gap-2",
              activeTab === 'settings'
                ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/30"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            <SettingsIcon size={14} />
            Aturan Poin
          </button>
        </div>

        {activeTab === 'leaderboard' ? (
          <>
            {/* ── Podium Top 3 Section ─────────────────────────────────── */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 bg-white border border-neutral-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : top3.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                
                {/* 2nd Place (Left) */}
                {top3[1] && (
                  <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden p-6 text-center order-2 md:order-1 relative group hover:shadow-md transition-shadow">
                    <div className="absolute top-3 left-3 size-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-500 text-sm">2</div>
                    <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-slate-300 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                      <Trophy size={32} className="text-slate-400" />
                    </div>
                    <h3 className="font-extrabold text-neutral-800 text-base leading-tight uppercase truncate">{top3[1].singkatan || top3[1].nama}</h3>
                    <p className="text-[11px] text-[#a3a3a3] font-bold uppercase tracking-wider mt-1 truncate max-w-[200px] mx-auto">{top3[1].nama}</p>
                    <div className="mt-4 inline-flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
                      <span className="text-sm font-black text-slate-700">{top3[1].poin}</span>
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Pts</span>
                    </div>
                  </Card>
                )}

                {/* 1st Place (Center / Taller) */}
                {top3[0] && (
                  <Card className="border-amber-200 shadow-md rounded-2xl bg-gradient-to-b from-amber-50/20 via-white to-white overflow-hidden p-8 text-center order-1 md:order-2 relative group hover:shadow-lg transition-all md:-translate-y-4">
                    <div className="absolute top-4 left-4 size-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center font-black text-amber-600 text-base">1</div>
                    <div className="absolute -top-3 -right-3 text-amber-200 pointer-events-none opacity-20">
                      <Stars size={80} />
                    </div>
                    <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform shadow-md shadow-amber-100">
                      <Trophy size={40} className="text-amber-500" />
                    </div>
                    <h3 className="font-black text-neutral-900 text-lg leading-tight uppercase truncate">{top3[0].singkatan || top3[0].nama}</h3>
                    <p className="text-xs text-amber-600/80 font-bold uppercase tracking-widest mt-1.5 truncate max-w-[240px] mx-auto">{top3[0].nama}</p>
                    <div className="mt-5 inline-flex items-center gap-1.5 bg-amber-50/70 border border-amber-100 px-4 py-1.5 rounded-xl">
                      <span className="text-base font-black text-amber-700">{top3[0].poin}</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Pts</span>
                    </div>
                  </Card>
                )}

                {/* 3rd Place (Right) */}
                {top3[2] && (
                  <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden p-6 text-center order-3 relative group hover:shadow-md transition-shadow">
                    <div className="absolute top-3 left-3 size-8 rounded-lg bg-orange-50/50 border border-orange-100 flex items-center justify-center font-black text-orange-600/80 text-sm">3</div>
                    <div className="w-16 h-16 rounded-full bg-orange-50 border-2 border-orange-300 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                      <Trophy size={32} className="text-orange-500/75" />
                    </div>
                    <h3 className="font-extrabold text-neutral-800 text-base leading-tight uppercase truncate">{top3[2].singkatan || top3[2].nama}</h3>
                    <p className="text-[11px] text-[#a3a3a3] font-bold uppercase tracking-wider mt-1 truncate max-w-[200px] mx-auto">{top3[2].nama}</p>
                    <div className="mt-4 inline-flex items-center gap-1 bg-orange-50/50 border border-orange-100/50 px-3 py-1 rounded-lg">
                      <span className="text-sm font-black text-orange-700">{top3[2].poin}</span>
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Pts</span>
                    </div>
                  </Card>
                )}

              </div>
            ) : null}

            {/* ── Leaderboard Table & Logs Bento Grid ──────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Rankings Table */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
                      <h2 className="font-extrabold text-neutral-800 text-base font-jakarta tracking-tight">Tabel Peringkat Lengkap</h2>
                    </div>
                    <Badge className="bg-primary/5 text-primary border-primary/10 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">{leaderboard.length} Unit</Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-neutral-100 hover:bg-transparent">
                          <TableHead className="w-[80px] font-bold text-neutral-400 text-[11px] uppercase tracking-wider">Rank</TableHead>
                          <TableHead className="font-bold text-neutral-400 text-[11px] uppercase tracking-wider">Organisasi Mahasiswa</TableHead>
                          <TableHead className="w-[120px] text-right font-bold text-neutral-400 text-[11px] uppercase tracking-wider">Akumulasi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 5 }).map((_, idx) => (
                            <TableRow key={idx}>
                              <TableCell colSpan={3} className="h-12 animate-pulse bg-neutral-50/50" />
                            </TableRow>
                          ))
                        ) : leaderboard.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-32 text-center text-xs text-neutral-400 italic">Belum ada data peringkat.</TableCell>
                          </TableRow>
                        ) : (
                          leaderboard.map((item, index) => (
                            <TableRow key={item.id} className="border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                              <TableCell className="font-black text-neutral-900 text-xs">
                                {index < 3 ? (
                                  <Badge className={cn(
                                    "size-6 flex items-center justify-center p-0 rounded-full font-black text-xs shadow-none border-none",
                                    index === 0 ? "bg-amber-100 text-amber-700" :
                                    index === 1 ? "bg-slate-100 text-slate-700" : "bg-orange-100 text-orange-700"
                                  )}>
                                    {index + 1}
                                  </Badge>
                                ) : (
                                  <span className="pl-2">{index + 1}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-bold text-neutral-800 text-[13px] uppercase leading-snug">{item.nama}</span>
                                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">{item.singkatan || 'Unit Kegiatan'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-extrabold text-neutral-900 text-[13px]">{item.poin} Pts</span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>

              {/* Point Log Timeline */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
                    <div className="flex items-center gap-2.5">
                      <History size={20} className="text-amber-500" />
                      <h2 className="font-extrabold text-neutral-800 text-base font-jakarta tracking-tight">Aktivitas Poin Terbaru</h2>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar space-y-4 pr-1">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-16 bg-neutral-50 rounded-xl animate-pulse" />
                      ))
                    ) : history.length === 0 ? (
                      <div className="text-center py-16 text-neutral-400 text-xs italic">Belum ada riwayat aktivitas poin.</div>
                    ) : (
                      history.map((hist) => (
                        <div key={hist.id || hist.ID} className="flex gap-4 p-3 rounded-xl border border-neutral-100 bg-neutral-50/20 hover:bg-neutral-50 transition-colors">
                          <div className="size-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                            <Medal size={16} className="text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-black text-neutral-800 text-xs truncate max-w-[130px] uppercase">
                                {hist.ormawa ? hist.ormawa.singkatan || hist.ormawa.nama : 'Ormawa'}
                              </p>
                              <span className={cn(
                                "font-black text-[10px] px-2 py-0.5 rounded-lg border",
                                hist.tipe === 'tambah' 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                  : "bg-rose-50 text-rose-700 border-rose-100"
                              )}>
                                {hist.tipe === 'tambah' ? '+' : '-'}{hist.poin} Pts
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-600 mt-1 font-medium leading-relaxed">{hist.deskripsi}</p>
                            <p className="text-[9px] text-[#a3a3a3] font-bold mt-1.5">
                              {hist.Tanggal ? new Date(hist.Tanggal).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

            </div>
          </>
        ) : (
          /* ── Point Rules Configurations Tab ─────────────────────── */
          <div className="space-y-6">
            <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden p-6">
              <div className="pb-4 border-b border-neutral-100 mb-6">
                <h2 className="font-extrabold text-neutral-800 text-base font-jakarta tracking-tight">Daftar Aturan Pembagian Poin</h2>
                <p className="text-neutral-400 text-xs mt-1">Sesuaikan jumlah poin yang akan diberikan secara otomatis ke Ormawa untuk setiap aktivitas berikut.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 bg-neutral-50 rounded-2xl animate-pulse" />
                  ))
                ) : rules.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-neutral-400 text-xs italic">Belum ada aturan poin terdaftar.</div>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.id || rule.ID} className="flex gap-4 p-5 rounded-2xl border border-neutral-200/70 bg-white hover:border-amber-200/80 hover:shadow-sm transition-all duration-300 relative group">
                      <div className="size-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-amber-600 text-2xl">
                          {getRuleIcon(rule.key)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pr-12">
                        <h3 className="font-bold text-neutral-800 text-[14px] uppercase tracking-tight leading-snug">{rule.label}</h3>
                        <p className="text-neutral-500 text-[11px] font-medium leading-relaxed mt-1.5">{rule.deskripsi}</p>
                        <div className="mt-3 inline-flex items-center gap-1 bg-amber-50/50 border border-amber-100/50 px-2.5 py-0.5 rounded-lg text-xs font-bold text-amber-700">
                          {rule.poin > 0 ? `+${rule.poin}` : rule.poin} Pts
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenEditRule(rule)}
                        className="absolute top-4 right-4 size-9 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100 transition-all opacity-0 group-hover:opacity-100 shadow-none cursor-pointer"
                        title="Edit Aturan Poin"
                      >
                        <EditIcon size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

      </div>

      {/* ── Rule Edit Dialog ─────────────────────────────────────── */}
      <Dialog open={isRuleEditOpen} onOpenChange={setIsRuleEditOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-base font-extrabold text-neutral-800 font-jakarta tracking-tight">Edit Aturan Pembagian Poin</DialogTitle>
            <DialogDescription className="text-neutral-400 text-xs font-medium">Ubah parameter pembagian poin otomatis untuk aktivitas ormawa ini.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRule} className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="ruleLabel" className="text-xs font-bold text-neutral-600">Nama Aktivitas</Label>
              <Input
                id="ruleLabel"
                value={ruleForm.label}
                onChange={(e) => setRuleForm({ ...ruleForm, label: e.target.value })}
                required
                className="h-10 rounded-xl border-neutral-200 text-xs"
                placeholder="Contoh: Proposal Disetujui"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rulePoin" className="text-xs font-bold text-neutral-600">Poin Diberikan</Label>
              <Input
                id="rulePoin"
                type="number"
                value={ruleForm.poin}
                onChange={(e) => setRuleForm({ ...ruleForm, poin: parseInt(e.target.value) || 0 })}
                required
                className="h-10 rounded-xl border-neutral-200 text-xs font-mono font-bold"
                placeholder="Contoh: 20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ruleDesc" className="text-xs font-bold text-neutral-600">Deskripsi Aturan</Label>
              <Textarea
                id="ruleDesc"
                value={ruleForm.deskripsi}
                onChange={(e) => setRuleForm({ ...ruleForm, deskripsi: e.target.value })}
                required
                className="rounded-xl border-neutral-200 text-xs resize-none h-20"
                placeholder="Deskripsikan kapan poin ini akan diperoleh secara otomatis..."
              />
            </div>

            <DialogFooter className="pt-4 border-t border-neutral-100 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsRuleEditOpen(false)}
                className="h-10 px-4 rounded-xl text-neutral-400 text-xs font-bold uppercase tracking-widest border border-neutral-200/60 hover:bg-neutral-50"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submittingRule}
                className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest border-none shadow-md shadow-amber-200/50"
              >
                {submittingRule ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContent>
  )
}
