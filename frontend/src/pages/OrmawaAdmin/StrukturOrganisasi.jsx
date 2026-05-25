"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Modal, ModalBody, ModalFooter, ModalBtn } from '../FacultyAdmin/components/Modal'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Input } from '../FacultyAdmin/components/input'
import { Label } from '../FacultyAdmin/components/label'
import { Avatar, AvatarFallback } from '../FacultyAdmin/components/avatar'

import { toast, Toaster } from 'react-hot-toast'
import { DeleteConfirmModal } from '../FacultyAdmin/components/DeleteConfirmModal'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

const getFullUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const baseUrl = API_BASE_URL.replace('/api', '')
  return `${baseUrl}${path}`
}

const getMemberId = (m) => m?.id || m?.ID

const getRoleBadge = (role = '') => {
  const r = role.toLowerCase();
  if (r.includes('ketua') && !r.includes('wakil')) return 'text-primary bg-primary/5 border border-primary/10'
  if (r.includes('wakil')) return 'text-violet-600 bg-violet-50 border border-violet-100'
  if (r.includes('sekretaris')) return 'text-blue-600 bg-blue-50 border border-blue-100'
  if (r.includes('bendahara')) return 'text-emerald-600 bg-emerald-50 border border-emerald-100'
  if (r.includes('koordinator') || r.includes('staf khusus') || r.includes('spesial')) return 'text-amber-600 bg-amber-50 border border-amber-100'
  return 'text-slate-500 bg-slate-50 border border-slate-200/65'
}

const OrgCard = ({ member, size = 'md' }) => {
  if (!member) return null
  const sizes = { lg: 'p-4 gap-4', md: 'p-3.5 gap-3.5', sm: 'p-3 gap-3' }
  const avatarSizes = { lg: 'w-14 h-14 rounded-2xl text-lg', md: 'w-11 h-11 rounded-xl text-sm', sm: 'w-9 h-9 rounded-xl text-[10px]' }
  const nameSizes = { lg: 'text-sm md:text-base', md: 'text-[13px]', sm: 'text-[11px]' }
  const cardWidths = { lg: 'w-[320px]', md: 'w-[285px]', sm: 'w-[250px]' }
  
  const fotoUrl = getFullUrl(member.Mahasiswa?.FotoURL || member.Mahasiswa?.foto_url || member.Mahasiswa?.Foto || member.Mahasiswa?.Pengguna?.Foto || null);

  return (
    <div className={cn(
      'flex items-center bg-white rounded-[1.25rem] border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden shrink-0',
      sizes[size],
      cardWidths[size]
    )}>
      {/* Dynamic hover color glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt={member.Mahasiswa?.Nama || member.Nama || 'Member'}
          className={cn('object-cover shrink-0 border border-slate-200/50 shadow-sm transition-transform duration-200 group-hover:scale-102', avatarSizes[size])}
          onError={(e) => { e.target.src = ''; }}
        />
      ) : (
        <div className={cn('bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/40 shadow-inner', avatarSizes[size])}>
          <span className="material-symbols-outlined text-slate-400/80 block select-none leading-none" style={{ fontSize: size === 'lg' ? '28px' : size === 'md' ? '22px' : '18px' }}>person</span>
        </div>
      )}
      
      <div className="flex flex-col min-w-0 leading-none gap-1.5">
        <p className={cn('font-black font-headline tracking-tight text-slate-900 truncate leading-none', nameSizes[size])}>
          {member.Mahasiswa?.Nama || member.Nama || '—'}
        </p>
        <div>
          <span className={cn('text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-md uppercase font-headline inline-block', getRoleBadge(member.Role || 'Anggota'))}>
            {member.Role || 'Anggota'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function StrukturOrganisasi() {
  const [members, setMembers] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddDivOpen, setIsAddDivOpen] = useState(false)
  const [divName, setDivName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [delDiv, setDelDiv] = useState(null)
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.OrmawaID || 1

  const fetchData = async () => {
    setLoading(true)
    try {
      const [memberJson, divJson] = await Promise.all([
        fetchWithAuth(`${API}/members?ormawaId=${ormawaId}`),
        fetchWithAuth(`${API}/divisions?ormawaId=${ormawaId}`)
      ])
      if (memberJson.status === 'success') setMembers(memberJson.data || [])
      if (divJson.status === 'success') setDivisions(divJson.data || [])
    } catch { 
      toast.error('Gagal memuat data') 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { 
    fetchData() 
  }, [])

  const handleAddDivision = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const json = await fetchWithAuth(`${API}/divisions`, { 
        method: 'POST', 
        body: JSON.stringify({ Nama: divName, OrmawaID: Number(ormawaId) }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (json.status === 'success') { 
        toast.success('Divisi ditambahkan')
        setIsAddDivOpen(false)
        setDivName('')
        fetchData() 
      } else {
        toast.error(json.message || 'Gagal menambahkan divisi')
      }
    } catch { 
      toast.error('Terjadi kesalahan') 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const handleDeleteDivision = async () => {
    setIsSubmitting(true)
    const divisionId = delDiv?.id || delDiv?.ID
    try {
      const json = await fetchWithAuth(`${API}/divisions/${divisionId}`, { method: 'DELETE' })
      if (json.status === 'success') { 
        toast.success('Divisi dihapus')
        setDelDiv(null)
        fetchData() 
      } else {
        toast.error('Gagal menghapus')
      }
    } catch { 
      toast.error('Terjadi kesalahan') 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const ketua = members.find(m => m.Role?.toLowerCase().includes('ketua') && !m.ParentID) || members[0]
  const wakil = members.find(m => m.Role?.toLowerCase().includes('wakil')) || null
  
  const ketuaId = getMemberId(ketua)
  const wakilId = getMemberId(wakil)
  
  const pengurusInti = members.filter(m => {
    const mId = getMemberId(m)
    return mId !== ketuaId && mId !== wakilId && (!m.Divisi || m.Divisi === '' || m.Divisi === 'INTI')
  })

  const getDivisionMembers = (divName) => members.filter(m => m.Divisi === divName)

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
      
      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl h-auto md:h-48 flex flex-col md:flex-row items-center group shadow-sm p-8 md:p-0 border border-slate-200/80">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

        <div className="relative z-10 md:px-10 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-6 bg-primary/40 rounded-full" />
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.25em]">
                Ormawa Admin
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 backdrop-blur-md rounded-xl text-primary shadow-inner">
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>account_tree</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
                Struktur Pengurus
              </h1>
            </div>
            <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
              Hierarki dan bagan organisasi untuk pembagian tugas operasional.
            </p>
          </div>

          <button
            onClick={() => setIsAddDivOpen(true)}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-[#00236F] text-white hover:bg-[#0B4FAE] font-black text-[10px] tracking-[0.15em] shadow-lg shadow-blue-950/10 hover:shadow-xl transition-all duration-200 active:scale-95 w-full md:w-auto shrink-0 uppercase"
          >
            <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>add</span>
            <span>Tambah Divisi</span>
          </button>
        </div>
      </section>

      {/* ── Content Area ───────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="size-8 border-4 border-[#00236F]/30 border-t-[#00236F] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Root: Ketua */}
          <div className="flex flex-col items-center gap-4">
            {ketua && (
              <OrgCard member={ketua} color="bg-primary/10" textColor="text-primary" size="lg" />
            )}
            {/* Connector */}
            {wakil && <div className="h-8 w-px bg-slate-200" />}
            {wakil && <OrgCard member={wakil} color="bg-violet-100" textColor="text-violet-600" size="md" />}
          </div>

          {/* Pengurus Inti */}
          {pengurusInti.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-100" />
                <p className="text-[9px] font-black text-slate-400 tracking-[0.3em] font-headline uppercase">Pengurus Inti</p>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {pengurusInti.map(m => (
                  <OrgCard key={getMemberId(m)} member={m} color="bg-blue-50" textColor="text-blue-600" size="sm" />
                ))}
              </div>
            </div>
          )}

          {/* Divisi-Divisi */}
          {divisions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-100" />
                <p className="text-[9px] font-black text-slate-400 tracking-[0.3em] font-headline uppercase">Divisi</p>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {divisions.map((div) => {
                  const divMembers = getDivisionMembers(div.Nama)
                  const divId = div.id || div.ID
                  return (
                    <Card key={divId} className="border-none shadow-sm overflow-hidden bg-white rounded-3xl border border-slate-100">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-black text-slate-900 font-headline tracking-tighter text-sm ">{div.Nama}</h3>
                            <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">{divMembers.length} anggota</p>
                          </div>
                          <button 
                            onClick={() => setDelDiv(div)} 
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-150"
                            title="Hapus Divisi"
                          >
                            <span className="material-symbols-outlined block" style={{ fontSize: '18px' }} >delete</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {divMembers.length === 0 ? (
                            <p className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">Belum ada anggota</p>
                          ) : (
                            divMembers.map(m => {
                              const fotoUrl = getFullUrl(m.Mahasiswa?.FotoURL || m.Mahasiswa?.foto_url || m.Mahasiswa?.Foto || m.Mahasiswa?.Pengguna?.Foto || null);
                              return (
                                <div key={getMemberId(m)} className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-2.5 py-1.5 border border-slate-100">
                                  {fotoUrl ? (
                                    <img
                                      src={fotoUrl}
                                      alt={m.Mahasiswa?.Nama || 'Staf'}
                                      className="size-5 rounded-lg object-cover"
                                      onError={(e) => { e.target.src = ''; }}
                                    />
                                  ) : (
                                    <div className="size-5 rounded-lg bg-slate-100 flex items-end justify-center overflow-hidden border border-slate-200/40">
                                      <span className="material-symbols-outlined text-slate-400 block select-none leading-none" style={{ fontSize: '12px' }}>person</span>
                                    </div>
                                  )}
                                  <span className="text-[9px] font-bold text-slate-600 font-headline">{m.Mahasiswa?.Nama?.split(' ')[0] || '—'}</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {divisions.length === 0 && pengurusInti.length === 0 && !ketua && (
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="material-symbols-outlined size-12 text-slate-300 stroke-[1px]">account_tree</span>
                <p className="text-[11px] font-black text-slate-400 tracking-widest text-center uppercase">Belum ada data struktur organisasi.<br />Tambahkan anggota terlebih dahulu.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Division Dialog */}
      <Modal
        open={isAddDivOpen}
        onClose={() => setIsAddDivOpen(false)}
        title="Tambah Divisi Baru"
        subtitle="Buat divisi baru untuk pembagian tugas organisasi."
        icon={<span className="material-symbols-outlined stroke-[3px]">add</span>}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddDivision}>
          <ModalBody>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Nama Divisi</Label>
              <Input 
                required 
                value={divName} 
                onChange={e => setDivName(e.target.value)} 
                placeholder="Misal: Humas, Akademik, IT..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 transition-all font-bold text-sm font-headline" 
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalBtn variant="ghost" type="button" onClick={() => setIsAddDivOpen(false)}>
              Batalkan
            </ModalBtn>
            <ModalBtn type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin size-4">sync</span>
              ) : (
                <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '14px' }}>save</span>
              )}
              <span className="uppercase tracking-[0.1em]">Simpan Divisi</span>
            </ModalBtn>
          </ModalFooter>
        </form>
      </Modal>

      <DeleteConfirmModal 
        isOpen={!!delDiv} 
        onClose={() => setDelDiv(null)} 
        onConfirm={handleDeleteDivision}
        title={`Hapus Divisi ${delDiv?.Nama || ''}?`} 
        description="Divisi ini akan dihapus. Anggota yang berada di divisi ini tidak akan ikut terhapus." 
        loading={isSubmitting} 
      />
    </div>
  )
}
