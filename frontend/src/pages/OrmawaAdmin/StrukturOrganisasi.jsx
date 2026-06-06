"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Modal, ModalBody, ModalFooter, ModalBtn } from '../FacultyAdmin/components/Modal'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Input } from '../FacultyAdmin/components/input'
import { Label } from '../FacultyAdmin/components/label'
import { Avatar, AvatarFallback } from '../FacultyAdmin/components/avatar'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../FacultyAdmin/components/select'

import { toast, Toaster } from 'react-hot-toast'
import { DeleteConfirmModal } from '../FacultyAdmin/components/DeleteConfirmModal'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

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
  if (r.includes('pembina') || r.includes('penanggung jawab')) return 'text-purple-600 bg-purple-50 border border-purple-100'
  if (r.includes('sekretaris') || r.includes('eksekutif')) return 'text-blue-600 bg-blue-50 border border-blue-100'
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
  
  // States for BPH Management
  const [students, setStudents] = useState([])
  const [isManageBphOpen, setIsManageBphOpen] = useState(false)
  const [bphForm, setBphForm] = useState({ MahasiswaID: '', Role: 'Sekretaris', Divisi: '' })
  const [bphSearchQuery, setBphSearchQuery] = useState('')
  const [bphIsSearching, setBphIsSearching] = useState(false)

  const ormawaId = getOrmawaId()

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

  const fetchStudents = async () => {
    try {
      const data = await fetchWithAuth(`${API}/students`)
      if (data.status === 'success') setStudents(data.data || [])
    } catch {}
  }

  useEffect(() => { 
    fetchData() 
    fetchStudents()
  }, [])

  const handleSaveBph = async (e) => {
    e.preventDefault()
    if (!bphForm.MahasiswaID) {
      toast.error('Wajib mencari dan memilih mahasiswa terlebih dahulu!')
      return
    }
    setIsSubmitting(true)
    
    // Check if student is already an active member
    const existingMember = members.find(m => 
      String(m.MahasiswaID || m.mahasiswaID || m.Mahasiswa?.id || m.Mahasiswa?.ID || '') === String(bphForm.MahasiswaID)
    )
    
    const isEdit = !!existingMember
    const url = isEdit ? `${API}/members/${existingMember.id || existingMember.ID}` : `${API}/members`
    const method = isEdit ? 'PUT' : 'POST'
    
    const payload = isEdit ? {
      Role: bphForm.Role,
      Divisi: ''
    } : {
      Role: bphForm.Role,
      Divisi: '',
      MahasiswaID: Number(bphForm.MahasiswaID),
      OrmawaID: Number(ormawaId)
    }
    
    try {
      const data = await fetchWithAuth(url, { 
        method, 
        body: JSON.stringify(payload), 
        headers: { 'Content-Type': 'application/json' } 
      })
      if (data.status === 'success') {
        toast.success(isEdit ? 'Jabatan BPH diperbarui' : 'Pengurus BPH ditambahkan')
        setBphForm({ MahasiswaID: '', Role: 'Sekretaris', Divisi: '' })
        setBphSearchQuery('')
        setBphIsSearching(false)
        fetchData()
      } else {
        toast.error(data.message || 'Gagal menyimpan pengurus BPH')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveBphMember = async (memberId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengurus BPH ini dari keanggotaan?')) return
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/members/${memberId}`, { method: 'DELETE' })
      if (data.status === 'success') {
        toast.success('Pengurus BPH berhasil dihapus')
        fetchData()
      } else {
        toast.error('Gagal menghapus pengurus BPH')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  const pembina = members.filter(m => {
    const r = m.Role?.toLowerCase() || ''
    return r.includes('pembina') || r.includes('penanggung jawab') || r.includes('penasihat')
  })
  
  const pembinaIds = pembina.map(m => getMemberId(m))

  const ketua = members.find(m => {
    const r = m.Role?.toLowerCase() || ''
    const mId = getMemberId(m)
    return r.includes('ketua') && !r.includes('wakil') && !pembinaIds.includes(mId)
  }) || members.find(m => !pembinaIds.includes(getMemberId(m))) || members[0]

  const wakil = members.find(m => {
    const r = m.Role?.toLowerCase() || ''
    const mId = getMemberId(m)
    return r.includes('wakil') && !pembinaIds.includes(mId)
  }) || null
  
  const sekretarisList = members.filter(m => {
    const r = m.Role?.toLowerCase() || ''
    const mId = getMemberId(m)
    return r.includes('sekretaris') && !pembinaIds.includes(mId)
  })

  const bendaharaList = members.filter(m => {
    const r = m.Role?.toLowerCase() || ''
    const mId = getMemberId(m)
    return r.includes('bendahara') && !pembinaIds.includes(mId)
  })

  const ketuaId = getMemberId(ketua)
  const wakilId = getMemberId(wakil)
  const sekretarisIds = sekretarisList.map(m => getMemberId(m))
  const bendaharaIds = bendaharaList.map(m => getMemberId(m))

  const pengurusInti = members.filter(m => {
    const mId = getMemberId(m)
    return (
      mId !== ketuaId && 
      mId !== wakilId && 
      !pembinaIds.includes(mId) && 
      !sekretarisIds.includes(mId) &&
      !bendaharaIds.includes(mId) &&
      (!m.Divisi || m.Divisi === '' || m.Divisi === 'INTI')
    )
  })

  const getDivisionMembers = (divName) => members.filter(m => m.Divisi === divName)

  const bphMembers = members.filter(m => {
    const r = m.Role?.toLowerCase() || ''
    return r.includes('ketua') || r.includes('wakil') || r.includes('sekretaris') || r.includes('bendahara') || r.includes('pembina') || r.includes('penanggung jawab') || r.includes('penasihat')
  })

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

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsManageBphOpen(true)}
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-black text-[10px] tracking-[0.15em] shadow-sm hover:shadow transition-all duration-200 active:scale-95 w-full sm:w-auto uppercase"
            >
              <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>group_add</span>
              <span>Kelola Pengurus BPH</span>
            </button>
            <button
              onClick={() => setIsAddDivOpen(true)}
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-bku-primary text-white hover:bg-[#0B4FAE] font-black text-[10px] tracking-[0.15em] shadow-lg shadow-blue-950/10 hover:shadow-xl transition-all duration-200 active:scale-95 w-full sm:w-auto uppercase"
            >
              <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>add</span>
              <span>Tambah Divisi</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Content Area ───────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="size-8 border-4 border-bku-primary/30 border-t-[#00236F] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pembina / Penasihat */}
          {pembina.length > 0 && (
            <div className="flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-pulse" />
                <p className="text-[9px] font-black text-purple-600 tracking-[0.3em] font-headline uppercase">Pembina / Penasihat</p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                {pembina.map(m => (
                  <OrgCard key={getMemberId(m)} member={m} size="md" />
                ))}
              </div>
              <div className="h-8 w-px border-l-2 border-dashed border-slate-300 my-1" />
            </div>
          )}

          {/* Root: Ketua / Wakil / BPH */}
          <div className="flex flex-col items-center gap-4">
            {ketua && (
              <OrgCard member={ketua} size="lg" />
            )}
            
            {wakil && (
              <>
                <div className="h-8 w-px bg-slate-200" />
                <OrgCard member={wakil} size="md" />
              </>
            )}

            {(sekretarisList.length > 0 || bendaharaList.length > 0) && (
              <>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <p className="text-[9px] font-black text-blue-600 tracking-[0.3em] font-headline uppercase">Sekretaris & Bendahara</p>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {sekretarisList.map(m => (
                      <OrgCard key={getMemberId(m)} member={m} size="md" />
                    ))}
                    {bendaharaList.map(m => (
                      <OrgCard key={getMemberId(m)} member={m} size="md" />
                    ))}
                  </div>
                </div>
              </>
            )}
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
                  <OrgCard key={getMemberId(m)} member={m} size="sm" />
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
                            <h3 className="font-black font-headline tracking-tighter text-sm" style={{ color: 'var(--theme-h3)' }}>{div.Nama}</h3>
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
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 transition-all font-bold text-sm font-headline" 
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

      {/* Manage BPH Modal */}
      <Modal
        open={isManageBphOpen}
        onClose={() => setIsManageBphOpen(false)}
        title="Kelola Pengurus BPH"
        subtitle="Atur jabatan pimpinan inti organisasi (Ketua, Wakil Ketua, Sekretaris, Bendahara, Pembina)."
        icon={<span className="material-symbols-outlined stroke-[3px]">group_add</span>}
        maxWidth="max-w-lg"
      >
        <ModalBody className="max-h-[70vh] overflow-y-auto space-y-6">
          {/* Form to Assign Role */}
          <form onSubmit={handleSaveBph} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-headline">Tambah/Ubah Jabatan BPH</h4>
            
            <div className="space-y-2 relative">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Pilih Mahasiswa</Label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '18px' }}>search</span>
                <Input
                  type="text"
                  placeholder="Ketik nama atau NIM mahasiswa..."
                  value={bphSearchQuery}
                  onChange={(e) => {
                    setBphSearchQuery(e.target.value);
                    setBphIsSearching(true);
                    if (bphForm.MahasiswaID) setBphForm({ ...bphForm, MahasiswaID: '' });
                  }}
                  className="pl-11 pr-10 h-12 rounded-2xl border-slate-200 bg-white focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 transition-all font-bold text-sm"
                />
                {bphForm.MahasiswaID && (
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold" style={{ fontSize: '18px' }}>check_circle</span>
                )}
              </div>

              {bphIsSearching && bphSearchQuery.trim() !== '' && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1 flex flex-col">
                  {students
                    .filter(s => s?.Nama?.toLowerCase().includes(bphSearchQuery.toLowerCase()) || s?.NIM?.toLowerCase().includes(bphSearchQuery.toLowerCase()))
                    .slice(0, 6)
                    .map(s => {
                      const studentFotoUrl = getFullUrl(s?.FotoURL || s?.foto_url || s?.Foto || s?.Pengguna?.Foto || null);
                      return (
                        <button
                          type="button"
                          key={s.id || s.ID}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl cursor-pointer transition-all duration-150 my-0.5 hover:bg-blue-50/50 text-slate-700 font-bold"
                          onClick={() => {
                            setBphForm({ ...bphForm, MahasiswaID: s?.id?.toString() || s?.ID?.toString() });
                            setBphSearchQuery(`${s.Nama} (${s.NIM})`);
                            setBphIsSearching(false);
                          }}
                        >
                          {studentFotoUrl ? (
                            <img
                              src={studentFotoUrl}
                              alt={s.Nama}
                              className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-200/50 shadow-sm"
                              onError={(e) => { e.target.src = ''; }}
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-end justify-center overflow-hidden shrink-0 border border-slate-200/40">
                              <span className="material-symbols-outlined text-slate-400 text-base mb-0.5">person</span>
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-800 truncate">{s.Nama}</span>
                            <span className="text-[9px] text-slate-400 font-medium font-mono">{s.NIM}</span>
                          </div>
                        </button>
                      );
                    })}
                  {students.filter(s => s?.Nama?.toLowerCase().includes(bphSearchQuery.toLowerCase()) || s?.NIM?.toLowerCase().includes(bphSearchQuery.toLowerCase())).length === 0 && (
                    <div className="px-3 py-4 text-center text-xs font-medium text-slate-400">
                      Mahasiswa tidak ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Jabatan BPH</Label>
                <Select value={bphForm.Role} onValueChange={(val) => setBphForm({ ...bphForm, Role: val })}>
                  <SelectTrigger className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-xs md:text-sm font-bold text-slate-700 focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 transition-all cursor-pointer">
                    <SelectValue placeholder="Pilih Jabatan BPH" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1 bg-white font-body">
                    {['Ketua', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Pembina'].map((r) => (
                      <SelectItem key={r} value={r} className="rounded-lg text-xs py-1.5 focus:bg-blue-50 focus:text-blue-700 cursor-pointer font-bold text-slate-700">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !bphForm.MahasiswaID}
                className="h-12 w-full rounded-2xl bg-bku-primary hover:bg-[#0B4FAE] text-white flex items-center justify-center text-xs font-bold font-headline uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin size-4 mr-2">sync</span>
                ) : (
                  <span className="material-symbols-outlined mr-2" style={{ fontSize: '16px' }}>save</span>
                )}
                Simpan
              </Button>
            </div>
          </form>

          {/* List of Current BPH Members */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-headline">Daftar Pengurus BPH Aktif</h4>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto border border-slate-100 rounded-2xl bg-white p-2">
              {bphMembers.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6 font-medium">Belum ada pengurus BPH yang terdaftar.</p>
              ) : (
                bphMembers.map(m => {
                  const fotoUrl = getFullUrl(m.Mahasiswa?.FotoURL || m.Mahasiswa?.foto_url || m.Mahasiswa?.Foto || m.Mahasiswa?.Pengguna?.Foto || null);
                  const mId = getMemberId(m)
                  return (
                    <div key={mId} className="flex items-center justify-between py-2 px-1 hover:bg-slate-50 rounded-xl transition-colors duration-150">
                      <div className="flex items-center gap-3">
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt={m.Mahasiswa?.Nama || 'BPH'}
                            className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-sm border border-slate-200"
                            onError={(e) => { e.target.src = ''; }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-end justify-center overflow-hidden shrink-0 border border-slate-200/60 shadow-sm">
                            <span className="material-symbols-outlined text-slate-400 text-xl mb-0.5">person</span>
                          </div>
                        )}
                        <div className="flex flex-col min-w-0 leading-none gap-0.5">
                          <span className="font-bold text-slate-900 font-headline tracking-tighter text-xs truncate max-w-[200px]">{m.Mahasiswa?.Nama || '—'}</span>
                          <span className="text-[9px] text-slate-400 font-semibold tracking-tight font-mono">{m.Mahasiswa?.NIM || '—'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-[8px] font-black tracking-widest px-2 py-0.5 rounded-md uppercase font-headline inline-block scale-90', getRoleBadge(m.Role || 'Anggota'))}>
                          {m.Role}
                        </span>
                        <button 
                          onClick={() => handleRemoveBphMember(mId)}
                          disabled={isSubmitting}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-150"
                          title="Hapus BPH"
                        >
                          <span className="material-symbols-outlined block" style={{ fontSize: '16px' }} >delete</span>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalBtn variant="ghost" type="button" onClick={() => setIsManageBphOpen(false)}>
            Tutup
          </ModalBtn>
        </ModalFooter>
      </Modal>
    </div>
  )
}
