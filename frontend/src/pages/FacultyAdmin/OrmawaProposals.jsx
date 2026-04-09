"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { DataTable } from "./components/data-table"
import { toast, Toaster } from 'react-hot-toast'
import { CheckCircle2, XCircle, FileText, Loader2, Activity, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/dialog"
import { cn } from "@/lib/utils"
import { Label } from "./components/label"
import { Textarea } from "./components/textarea"

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
            const res = await axios.put(`http://localhost:8000/api/faculty/ormawa/proposals/${selectedProposal.id}`, {
                status: status,
                catatan_admin: form.catatan_admin
            })
            if (res.data.status === 'success') {
                toast.success(`Proposal berhasil di-${status}`)
                setShowModal(false)
                fetchData()
            }
        } catch (error) {
            toast.error("Gagal memperbarui status")
        } finally {
            setIsSubmitting(false)
        }
    }

    const openActionModal = (proposal) => {
        setSelectedProposal(proposal)
        setForm({ status: proposal.status, catatan_admin: proposal.catatan_admin || '' })
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
            key: "judul",
            label: "Program Kerja",
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px] leading-tight">{val}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{new Date(row.created_at).toLocaleDateString('id-ID')}</span>
                </div>
            )
        },
        {
            key: "organisasi",
            label: "Organisasi",
            render: (val) => (
                <Badge variant="outline" className="bg-slate-50 border-slate-200 text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                    {val?.nama_org}
                </Badge>
            )
        },
        {
            key: "anggaran",
            label: "Anggaran Diajukan",
            render: (val) => <span className="font-bold text-emerald-600 text-[13px] tabular-nums">{formatIDR(val)}</span>
        },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <Badge 
                    className={cn(
                        "capitalize font-black text-[10px] px-3 py-1 border-none",
                        val === 'disetujui' ? "bg-emerald-100 text-emerald-700" :
                        val === 'revisi' ? "bg-blue-100 text-blue-700" :
                        val === 'ditolak' ? "bg-red-600 text-white shadow-sm shadow-red-200" :
                        "bg-amber-100 text-amber-700"
                    )}
                >
                    {val}
                </Badge>
            )
        }
    ]

    const [activeTab, setActiveTab] = useState('all')

    const filteredProposals = activeTab === 'all' 
        ? proposals 
        : proposals.filter(p => p.status === activeTab)

    const statsData = [
        { label: 'Total Proposal', value: proposals.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
        { label: 'Total Pengajuan Anggaran', value: formatIDR(proposals.reduce((acc, p) => acc + p.anggaran, 0)), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
        { label: 'Proposal Disetujui', value: proposals.filter(p => p.status === 'disetujui').length, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/10 to-indigo-500/5' },
        { label: 'Pending / Revisi', value: proposals.filter(p => p.status === 'pending' || p.status === 'revisi').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
    ]

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />
            <div className="flex flex-col gap-1.5 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <FileText className="size-6" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Proposal ORMAWA</h1>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Validasi Anggaran & Persetujuan Kegiatan</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                {statsData.map((stat, i) => (
                  <Card key={i} className="border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 rounded-2xl">
                     <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
                     <CardContent className="p-6 relative">
                       <div className="flex items-center justify-between mb-4">
                         <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                           <stat.icon className="size-5" />
                         </div>
                         <div className="flex flex-col items-end">
                           <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">
                             <Activity className="size-2.5" />
                             Live
                           </div>
                         </div>
                       </div>
                       <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</p>
                         <div className="flex items-baseline gap-2">
                           <h3 className={`${stat.label.includes('Anggaran') ? 'text-xl' : 'text-3xl'} font-black text-slate-900 font-headline tracking-tighter leading-none`}>
                             {loading ? "..." : stat.value}
                           </h3>
                         </div>
                         <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-tight">Finance Traceability</p>
                       </div>
                     </CardContent>
                  </Card>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex flex-wrap p-1.5 bg-white border border-slate-200/60 rounded-2xl shadow-sm w-fit gap-1">
                  {['all', 'pending', 'revisi', 'disetujui', 'ditolak'].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center gap-2 ${
                          activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-0.5' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                     >
                        {tab}
                     </button>
                  ))}
                </div>
            </div>

            <Card className="border border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white/50 backdrop-blur-md rounded-2xl">
                <CardContent className="pt-4 p-0">
                    <DataTable
                        columns={columns}
                        data={filteredProposals}
                        loading={loading}
                        searchPlaceholder="Cari Nama Kegiatan..."
                        actions={(row) => (
                            <Button onClick={() => openActionModal(row)} variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight">
                                Verifikasi
                            </Button>
                        )}
                    />
                </CardContent>
            </Card>

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
                                        Verification Protocol
                                    </Badge>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-headline">Ormawa Finance & Compliance</p>
                                </div>
                            </div>
                            <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase leading-none">
                                Validasi Proposal
                            </DialogTitle>
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
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none font-headline">{selectedProposal?.organisasi?.nama_org}</p>
                                        </div>
                                        <h4 className="font-bold text-slate-900 font-headline text-lg tracking-tight leading-tight line-clamp-2">{selectedProposal?.judul}</h4>
                                    </div>
                                    <div className="text-center sm:text-right bg-emerald-600/5 px-4 py-2 rounded-2xl border border-emerald-500/10">
                                        <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest leading-none mb-1 font-headline">Budget</p>
                                        <p className="text-xl font-black text-emerald-600 font-headline tabular-nums tracking-tighter leading-none">{formatIDR(selectedProposal?.anggaran || 0)}</p>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 font-headline">Registration Date</p>
                                        <p className="text-[10px] font-bold text-slate-600 font-headline">{selectedProposal && new Date(selectedProposal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <a 
                                      href={selectedProposal?.dokumen_url} 
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
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Setujui</span>
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
                                className="h-16 rounded-2xl bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-500/20 flex-col gap-1 group transition-all duration-300 hover:scale-[1.02] active:scale-95 font-headline border-none"
                             >
                                <XCircle className="size-4 group-hover:rotate-12 transition-transform" />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Tolak</span>
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
        </div>
    )
}
