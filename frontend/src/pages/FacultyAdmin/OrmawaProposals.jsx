"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { DataTable } from "./components/data-table"
import { toast, Toaster } from 'react-hot-toast'
import { CheckCircle2, XCircle, FileText, Activity, Clock, ShieldCheck } from 'lucide-react'
import { Modal, ModalBody, ModalFooter, ModalBtn } from "./components/Modal"

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
            render: (val) => {
                const s = val?.toLowerCase() || '';
                const isFakultas = s === 'disetujui_fakultas';
                const isUniv = s === 'disetujui_univ';
                const isRevisi = s === 'revisi';
                const isDitolak = s === 'ditolak';

                return (
                    <Badge 
                        className={cn(
                            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm uppercase tracking-widest transition-all",
                            isUniv ? "bg-emerald-100 text-emerald-700" :
                            isFakultas ? "bg-indigo-100 text-indigo-700" :
                            isRevisi ? "bg-blue-100 text-blue-700" :
                            isDitolak ? "bg-rose-100 text-rose-700" :
                            "bg-amber-100 text-amber-700 font-headline"
                        )}
                    >
                        {isUniv ? 'DISYAHKAN UNIV' : isFakultas ? 'ACC FAKULTAS' : isRevisi ? 'REVISI' : isDitolak ? 'DITOLAK' : (val || 'DIAJUKAN')}
                    </Badge>
                )
            }
        }
    ]

    const statsData = [
        { label: 'Total Proposal', value: proposals.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Anggaran', value: formatIDR(proposals.reduce((acc, p) => acc + (p.Anggaran || 0), 0)), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'ACC Fakultas', value: proposals.filter(p => p.Status === 'disetujui_fakultas').length, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Disyahkan Univ', value: proposals.filter(p => p.Status === 'disetujui_univ').length, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                title="Validasi Dokumen"
                subtitle="Peninjauan berkas program kerja dan kelayakan anggaran organisasi."
                icon={<Activity size={18} />}
                maxWidth="max-w-lg"
            >
                <div className="flex flex-col font-headline">
                    <ModalBody>
                        <div className="space-y-6">
                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 relative group overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/5 font-headline">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-100" />
                                <div className="relative z-10 space-y-4 font-headline">
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="size-1 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none font-headline">
                                                    {selectedProposal?.Ormawa?.nama || selectedProposal?.Ormawa?.Nama || selectedProposal?.ormawa?.nama || selectedProposal?.Organisasi?.NamaOrg || '-'}
                                                </p>
                                            </div>
                                            <h4 className="font-bold text-slate-900 font-headline text-lg tracking-tight leading-tight line-clamp-2 uppercase">{selectedProposal?.Judul}</h4>
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
                                    className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium text-xs p-4 leading-relaxed focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-headline font-semibold uppercase"
                                    placeholder="Tulis catatan atau instruksi perbaikan..."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3 pt-2">
                                 <Button 
                                    onClick={() => handleUpdateStatus('disetujui_fakultas')} 
                                    disabled={isSubmitting || selectedProposal?.Status === 'disetujui_univ'} 
                                    className="h-16 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 flex-col gap-1 group transition-all duration-300 hover:scale-[1.02] active:scale-95 font-headline border-none"
                                 >
                                    <CheckCircle2 className="size-4 group-hover:scale-125 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">ACC FAKULTAS</span>
                                 </Button>
                                 <Button 
                                    onClick={() => handleUpdateStatus('revisi')} 
                                    disabled={isSubmitting} 
                                    className="h-16 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex-col gap-1 group transition-all duration-300 hover:scale-[1.02] active:scale-95 font-headline border-none"
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
                        </div>
                    </ModalBody>
                    
                    <ModalFooter>
                         <ModalBtn 
                            variant="ghost" 
                            onClick={() => setShowModal(false)} 
                         >
                            Close View
                         </ModalBtn>
                    </ModalFooter>
                </div>
            </Modal>
        </PageContainer>
    )
}

