"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { DataTable } from "./components/data-table"
import { toast, Toaster } from 'react-hot-toast'
import { CheckCircle2, XCircle, FileText, Activity, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "./components/dialog"
import { cn } from "@/lib/utils"
import { Label } from "./components/label"
import { Textarea } from "./components/textarea"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

export default function FacultyProposalApproval() {
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedProposal, setSelectedProposal] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({ status: '', catatan_admin: '' })

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await axios.get('http://localhost:8000/api/faculty/ormawa/proposals')
            if (res.data.status === 'success') {
                setProposals(res.data.data)
            }
        } catch (error) {
            toast.error("Gagal mengambil data proposal")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleUpdateStatus = async (status) => {
        if (!selectedProposal) return
        setIsSubmitting(true)
        try {
            const res = await axios.put(`http://localhost:8000/api/faculty/ormawa/proposals/${selectedProposal.ID}`, {
                Status: status,
                catatan_admin: form.catatan_admin
            })
            if (res.data.status === 'success') {
                toast.success(`Proposal berhasil di-${status}`)
                setShowModal(false)
                fetchData()
            } else {
                toast.error(`Gagal perbarui status: ${res.data.message || 'Error response'}`)
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Server sibuk'
            toast.error(`Gagal memperbarui status: ${msg}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const openActionModal = (proposal) => {
        setSelectedProposal(proposal)
        setForm({ status: proposal.Status, catatan_admin: proposal.catatan_admin || '' })
        setShowModal(true)
    }

    const formatIDR = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const columns = [
        {
            key: "Judul",
            label: "Program Kerja",
            render: (val, row) => (
                <div className="flex flex-col text-left">
                    <span className="font-black text-slate-900 font-headline tracking-tighter text-[13px] leading-tight uppercase">{val}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-none">{row.CreatedAt ? new Date(row.CreatedAt).toLocaleDateString('id-ID') : '-'}</span>
                </div>
            )
        },
        {
            key: "Ormawa",
            label: "Organisasi",
            render: (_, row) => {
                const orm = row.Ormawa || row.ormawa || row.Organisasi;
                return (
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-[10px] text-slate-600 font-black uppercase tracking-widest px-3 py-1 rounded-xl shadow-sm">
                        {orm?.nama || orm?.Nama || orm?.NamaOrg || '-'}
                    </Badge>
                );
            }
        },
        {
            key: "Anggaran",
            label: "Anggaran",
            render: (val) => <span className="font-black text-emerald-600 text-[13px] tabular-nums font-headline">{formatIDR(val)}</span>
        },
        {
            key: "Status",
            label: "Validasi",
            render: (val) => (
                <Badge 
                    className={cn(
                        "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm uppercase tracking-widest transition-all",
                        (val?.toLowerCase() === 'disetujui' || val?.toLowerCase() === 'approved') ? "bg-emerald-100 text-emerald-700" :
                        (val?.toLowerCase() === 'revisi' || val?.toLowerCase() === 'pending') ? "bg-blue-100 text-blue-700" :
                        (val?.toLowerCase() === 'ditolak' || val?.toLowerCase() === 'rejected') ? "bg-rose-100 text-rose-700" :
                        "bg-amber-100 text-amber-700 font-headline"
                    )}
                >
                    {(val?.toLowerCase() === 'disetujui' || val?.toLowerCase() === 'approved') ? 'TERVERIFIKASI' : (val || 'DIAJUKAN')}
                </Badge>
            )
        }
    ]

    const statsData = [
        { label: 'Total Proposal', value: proposals.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Anggaran', value: formatIDR(proposals.reduce((acc, p) => acc + (p.Anggaran || 0), 0)), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Proposal Disetujui', value: proposals.filter(p => p.Status?.toLowerCase() === 'disetujui').length, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Pending / Revisi', value: proposals.filter(p => p.Status?.toLowerCase() === 'pending' || p.Status?.toLowerCase() === 'revisi').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    ]

    return (
        <PageContainer>
            <Toaster position="top-right" />
            
            <PageHeader
                icon={FileText}
                title="Proposal ORMAWA"
                description="Validasi Anggaran & Persetujuan Kegiatan"
            />

            <ResponsiveGrid cols={4}>
                {statsData.map((stat, i) => (
                  <ResponsiveCard key={i} className="flex flex-row items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="size-5" />
                    </div>
                    <div className="flex flex-col font-headline leading-tight">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                      <span className={`${stat.label.includes('Anggaran') ? 'text-lg' : 'text-xl'} font-black text-slate-900 tracking-tighter uppercase`}>
                        {loading ? '...' : stat.value}
                      </span>
                    </div>
                  </ResponsiveCard>
                ))}
            </ResponsiveGrid>

            <ResponsiveCard noPadding className="mt-6">
                <DataTable
                    columns={columns}
                    data={proposals}
                    loading={loading}
                    searchPlaceholder="Cari Nama Kegiatan..."
                    filters={[
                        {
                            key: 'Status',
                            placeholder: 'Filter Status',
                            options: [
                                { label: 'Diajukan', value: 'pending' },
                                { label: 'Revisi', value: 'revisi' },
                                { label: 'Disetujui', value: 'disetujui' },
                                { label: 'Ditolak', value: 'ditolak' },
                            ]
                        }
                    ]}
                    actions={(row) => (
                        <div className="flex items-center justify-end pr-2">
                            <Button onClick={() => openActionModal(row)} variant="outline" size="sm" className="h-9 px-3 border-slate-200 hover:text-primary rounded-xl shadow-sm transition-all hover:bg-primary/5">
                                <span className="text-[10px] font-black uppercase tracking-widest">Verifikasi</span>
                            </Button>
                        </div>
                    )}
                />
            </ResponsiveCard>

            {/* Action Dialog */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
                    <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-b border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <FileText className="size-32 rotate-12" />
                        </div>
                        <div className="relative z-10 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
                                <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group">
                                    <Activity className="size-4" />
                                </div>
                                <div className="flex flex-col items-center sm:items-start leading-none">
                                    <Badge variant="secondary" className="w-fit text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-primary/5 text-primary border-none mb-1">
                                        Preliminary Verification
                                    </Badge>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-headline">Fakultas Verifikator Unit</p>
                                </div>
                            </div>
                            <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase leading-none">
                                Validasi Dokumen
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-slate-400 mt-1 uppercase leading-none font-headline">
                                Peninjauan berkas program kerja dan kelayakan anggaran organisasi.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="p-8 pt-6 space-y-6">
                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 relative group overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/5">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-100" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="size-1 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none font-headline">
                                                {selectedProposal?.Ormawa?.nama || selectedProposal?.Ormawa?.Nama || selectedProposal?.ormawa?.nama || selectedProposal?.Organisasi?.NamaOrg || '-'}
                                            </p>
                                        </div>
                                        <h4 className="font-bold text-slate-900 font-headline text-lg tracking-tight leading-tight line-clamp-2">{selectedProposal?.Judul}</h4>
                                    </div>
                                    <div className="text-center sm:text-right bg-emerald-600/5 px-4 py-2 rounded-2xl border border-emerald-500/10">
                                        <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest leading-none mb-1 font-headline">Budget</p>
                                        <p className="text-xl font-black text-emerald-600 font-headline tabular-nums tracking-tighter leading-none">{formatIDR(selectedProposal?.Anggaran || 0)}</p>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 font-headline">Registration Date</p>
                                        <p className="text-[10px] font-bold text-slate-600 font-headline">{selectedProposal?.CreatedAt ? new Date(selectedProposal.CreatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
                                    </div>
                                    <a 
                                      href={selectedProposal?.FileURL} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="h-9 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 font-black text-[9px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 group/btn font-headline"
                                    >
                                        <FileText className="size-3.5 text-primary group-hover/btn:scale-110 transition-transform" /> 
                                        <span>PDF Document</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Instruksi Revisi & Catatan</Label>
                            </div>
                            <Textarea
                                value={form.catatan_admin}
                                onChange={(e) => setForm({ ...form, catatan_admin: e.target.value })}
                                className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium text-xs p-4 leading-relaxed focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-headline"
                                placeholder="Tulis catatan atau instruksi perbaikan..."
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2">
                             <Button 
                                onClick={() => handleUpdateStatus('disetujui')} 
                                disabled={isSubmitting} 
                                className="h-16 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 flex-col gap-1 group transition-all duration-300 hover:scale-[1.02] active:scale-95 font-headline"
                             >
                                <CheckCircle2 className="size-4 group-hover:scale-125 transition-transform" />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Validasi & Kirim</span>
                             </Button>
                             <Button 
                                onClick={() => handleUpdateStatus('revisi')} 
                                disabled={isSubmitting} 
                                className="h-16 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex-col gap-1 group transition-all duration-300 hover:scale-[1.02] active:scale-95 font-headline"
                             >
                                <Clock className="size-4 group-hover:rotate-12 transition-transform" />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Revisi</span>
                             </Button>
                             <Button 
                                onClick={() => handleUpdateStatus('ditolak')} 
                                disabled={isSubmitting} 
                                className="h-16 rounded-2xl bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-200/20 flex-col gap-1 group transition-all duration-300 hover:scale-[1.02] active:scale-95 font-headline border-none"
                             >
                                <XCircle className="size-4 group-hover:rotate-12 transition-transform" />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Tolak Berkas</span>
                             </Button>
                        </div>
                        
                        <div className="pt-4 flex flex-row items-center justify-end -mx-8 px-8 bg-slate-50/10 border-t border-slate-100">
                             <Button 
                                variant="ghost" 
                                onClick={() => setShowModal(false)} 
                                className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl transition-all font-headline"
                             >
                                Close View
                             </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </PageContainer>
    )
}
