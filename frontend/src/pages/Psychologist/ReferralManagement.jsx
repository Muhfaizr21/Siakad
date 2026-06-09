import { useEffect, useState, useMemo } from 'react';
import { psychologistService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { DataTable } from '@/components/ui/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

// Material Symbol icons
const Send = ({ size, className, ...props }) => <span className={`material-symbols-outlined shrink-0 ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>send</span>;
const CheckCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined shrink-0 ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined shrink-0 ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const FileDownload = ({ size, className, ...props }) => <span className={`material-symbols-outlined shrink-0 ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;


export default function ReferralManagement() {
  const [referrals, setReferrals] = useState([]);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [newReferral, setNewReferral] = useState({
    mahasiswa_id: '',
    tipe: 'Medis',
    alasan: '',
    pihak_tujuan: '',
    email_tujuan: '',
  });

  const statusColors = {
    'menunggu_approval': {
      bg: 'bg-[var(--theme-warning-light)]',
      border: 'border-[var(--theme-warning)]/20',
      text: 'text-[var(--theme-warning)]',
    },
    'Pending': {
      bg: 'bg-[var(--theme-warning-light)]',
      border: 'border-[var(--theme-warning)]/20',
      text: 'text-[var(--theme-warning)]',
    },
    'Selesai': {
      bg: 'bg-[var(--theme-success-light)]',
      border: 'border-[var(--theme-success)]/20',
      text: 'text-[var(--theme-success)]',
    },
    'Ditolak': {
      bg: 'bg-[var(--theme-error-light)]',
      border: 'border-[var(--theme-error)]/20',
      text: 'text-[var(--theme-error)]',
    },
  };

  useEffect(() => {
    loadReferrals();
    loadMahasiswa();
  }, []);

  const loadMahasiswa = async () => {
    try {
      const response = await psychologistService.getPatients();
      setMahasiswaList(response.data || []);
    } catch (err) {
      console.error('Error loading mahasiswa:', err);
    }
  };

  const loadReferrals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await psychologistService.getReferrals();
      setReferrals(response.data || []);
    } catch (err) {
      setError('Gagal memuat data tindak lanjut');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!newReferral.mahasiswa_id) {
      toast.error('Pilih pasien terlebih dahulu');
      return;
    }
    if (!newReferral.tipe) {
      toast.error('Pilih tipe rujukan');
      return;
    }
    if (!newReferral.alasan || newReferral.alasan.trim() === '') {
      toast.error('Alasan rujukan tidak boleh kosong');
      return;
    }
    if (!newReferral.pihak_tujuan || newReferral.pihak_tujuan.trim() === '') {
      toast.error('Pihak tujuan tidak boleh kosong');
      return;
    }
    if (!newReferral.email_tujuan || newReferral.email_tujuan.trim() === '') {
      toast.error('Email tujuan tidak boleh kosong');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newReferral.email_tujuan)) {
      toast.error('Format email tidak valid');
      return;
    }

    try {
      const payload = {
        mahasiswa_id: parseInt(newReferral.mahasiswa_id, 10),
        tipe: newReferral.tipe,
        alasan: newReferral.alasan.trim(),
        pihak_tujuan: newReferral.pihak_tujuan.trim(),
        email_tujuan: newReferral.email_tujuan.trim(),
      };
      
      // Validate mahasiswa_id is a valid number
      if (isNaN(payload.mahasiswa_id) || payload.mahasiswa_id <= 0) {
        toast.error('ID Pasien tidak valid');
        return;
      }

      console.log('Creating referral with payload:', payload);
      await psychologistService.createReferral(payload);
      await loadReferrals();
      setNewReferral({
        mahasiswa_id: '',
        tipe: 'Medis',
        alasan: '',
        pihak_tujuan: '',
        email_tujuan: '',
      });
      setSearchQuery('');
      setSelectedPatientHistory([]);
      setIsModalOpen(false);
      toast.success('Surat rujukan berhasil dibuat');
    } catch (err) {
      console.error('Error creating referral:', err);
      toast.error('Gagal membuat surat rujukan: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };



  const filteredReferrals = useMemo(() => {
    return referrals.filter(ref => 
      selectedStatus === 'Semua' || ref.status === selectedStatus
    );
  }, [referrals, selectedStatus]);

  const getStatusLabel = (status) => {
    const labels = {
      'Pending': 'Menunggu Persetujuan',
      'menunggu_approval': 'Menunggu Persetujuan',
      'Selesai': 'Selesai',
      'Ditolak': 'Ditolak',
    };
    return labels[status] || status;
  };

  const handleTableSearch = (data, searchVal) => {
    const query = searchVal.trim().toLowerCase();
    if (!query) return data;
    return data.filter((r) => {
      const searchableStr = [
        r.mahasiswa_name,
        r.tipe,
        r.pihak_tujuan,
        r.alasan,
        r.status
      ].filter(Boolean).join(' ').toLowerCase();
      return searchableStr.includes(query);
    });
  };

  const columns = [
    {
      key: 'mahasiswa_name',
      label: 'Identitas Pasien',
      sortable: true,
      render: (v, row) => {
        const statusStyle = statusColors[row.status] || statusColors['Pending'];
        return (
          <div className="flex items-center gap-3 py-1 font-body">
            <div 
              className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm shrink-0 overflow-hidden border border-[var(--theme-border-muted)] bg-[var(--theme-bg)]", statusStyle.text)}
            >
              {row.foto_url || row.foto ? (
                <img src={row.foto_url || row.foto} alt={row.mahasiswa_name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[var(--theme-text-subtle)] text-lg">person</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[var(--theme-text)] leading-tight">{row.mahasiswa_name}</p>
              <p className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wider text-[var(--theme-text-subtle)]">{row.tipe} &bull; {row.pihak_tujuan}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'alasan',
      label: 'Alasan Rujukan',
      sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-2 max-w-[250px] font-body">
          <span className="w-6 h-6 rounded-lg bg-[var(--theme-primary-light)] text-[var(--theme-primary)] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xs">description</span>
          </span>
          <p className="text-[11px] font-semibold text-[var(--theme-text-muted)] line-clamp-1 truncate" title={row.alasan}>{row.alasan}</p>
        </div>
      )
    },
    {
      key: 'approval_status',
      label: 'Persetujuan Admin',
      render: (v) => {
        const meta = {
          disetujui:        { label: 'Disetujui', cls: 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success)]/20', icon: 'check_circle' },
          ditolak:          { label: 'Ditolak',   cls: 'bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-error)]/20', icon: 'cancel' },
          menunggu_approval:{ label: 'Menunggu',  cls: 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning)]/20', icon: 'hourglass_empty' },
        }[v] || { label: 'Menunggu', cls: 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning)]/20', icon: 'hourglass_empty' }
        return (
          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-widest border font-body shadow-none', meta.cls)}>
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '11px' }}>
              {meta.icon}
            </span>
            {meta.label}
          </span>
        )
      }
    },
    {
      key: 'status',
      label: 'Status Pengiriman',
      sortable: true,
      render: (v, row) => {
        const statusStyle = statusColors[row.status] || statusColors['Pending'];
        return (
          <span
            className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-widest border font-body shadow-none", statusStyle.bg, statusStyle.text, statusStyle.border)}
          >
            {getStatusLabel(row.status)}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Aksi',
      className: 'text-right',
      render: (v, row) => {
        return (
          <div className="flex items-center justify-end gap-1.5 shrink-0 font-body">
            {row.surat_rujukan_url && (
              <button
                onClick={async () => {
                  try {
                    await psychologistService.downloadReferralPDF(row.id);
                  } catch (err) {
                    toast.error('Gagal download PDF: ' + err.message);
                  }
                }}
                className="w-8 h-8 rounded-lg bg-[var(--theme-bg)] text-[var(--theme-text-subtle)] flex items-center justify-center hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] transition-colors border border-[var(--theme-border)] active:scale-95"
                title="Download PDF"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
            )}
          </div>
        )
      }
    }
  ];

  return (
    <>
      <div className="w-full relative space-y-6 scroll-smooth font-body">
          
        {/* ── Welcome Banner ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col xl:flex-row xl:items-center gap-6 group shadow-sm border border-[var(--theme-border)] bg-[var(--theme-surface)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-primary-light)]/20 via-[var(--theme-surface)] to-[var(--theme-bg)]" />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-[var(--theme-primary)]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-20 w-48 h-48 bg-[var(--theme-success)]/5 rounded-full blur-2xl" />

          <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[var(--theme-primary-light)] border border-[var(--theme-primary)]/10 flex items-center justify-center text-[var(--theme-primary)] shrink-0 shadow-sm relative overflow-hidden">
                <span className="material-symbols-outlined text-[var(--theme-primary)] relative z-10" style={{ fontSize: '26px' }}>send</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border border-[var(--theme-primary)]/10">
                    Tindak Lanjut
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-[var(--theme-text)] tracking-tight font-headline leading-none">
                  Manajemen Surat Rujukan
                </h1>
                <p className="mt-2 text-xs font-medium text-[var(--theme-text-muted)] leading-relaxed max-w-xl">
                  Kelola surat rujukan medis dan akademik untuk pasien Anda dengan sistem tracking yang terintegrasi.
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0 mt-2 xl:mt-0">
            <button 
              onClick={() => {
                setNewReferral({
                  mahasiswa_id: '',
                  tipe: 'Medis',
                  alasan: '',
                  pihak_tujuan: '',
                  email_tujuan: '',
                });
                setSearchQuery('');
                setSelectedPatientHistory([]);
                setIsModalOpen(true);
              }}
              className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 active:scale-95 border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] shrink-0">add</span> Buat Rujukan Baru
            </button>
          </div>
        </section>

        {/* Status Filter Chips */}
        <div className="rounded-2xl border border-[var(--theme-border)] shadow-sm p-4 bg-[var(--theme-surface)]">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'Semua', label: 'Semua Rujukan', icon: 'list' },
              { value: 'menunggu_approval', label: 'Menunggu', icon: 'hourglass_empty' },
              { value: 'Selesai', label: 'Selesai', icon: 'check_circle' },
              { value: 'Ditolak', label: 'Ditolak', icon: 'cancel' }
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setSelectedStatus(item.value)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-[9px] font-semibold uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border",
                  selectedStatus === item.value
                    ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]'
                    : 'bg-[var(--theme-surface)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)] hover:text-[var(--theme-text)]'
                )}
              >
                <span className="material-symbols-outlined text-xs shrink-0">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Referrals List Card */}
        <section className="rounded-2xl border border-[var(--theme-border)] shadow-sm p-5 space-y-5 bg-[var(--theme-surface)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--theme-border-muted)] gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[var(--theme-primary)]">
                <span className="material-symbols-outlined text-base shrink-0">list</span> Daftar Surat Rujukan
              </h3>
              <p className="text-[10px] font-semibold text-[var(--theme-text-muted)] mt-1 uppercase tracking-widest">
                Total: {filteredReferrals.length} data
              </p>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredReferrals}
            loading={loading}
            searchable={true}
            onSearch={handleTableSearch}
            searchPlaceholder="Cari nama pasien, tipe, tujuan..."
            pagination={true}
            pageSize={10}
            emptyMessage="Tidak ada rujukan. Belum ada data surat rujukan yang dibuat."
            emptyIcon="inbox"
          />
        </section>
      </div>

      {/* --- CREATE REFERRAL MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} maxWidth="max-w-lg">
        <DialogContent className="p-0 overflow-hidden border border-[var(--theme-border)] shadow-2xl rounded-2xl bg-[var(--theme-surface)] font-body animate-in zoom-in-95 duration-200">
          {/* Header */}
          <DialogHeader className="p-8 pb-5 border-b border-[var(--theme-border-muted)] bg-[var(--theme-primary)] text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white shrink-0">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>send</span>
              </div>
              <div>
                <DialogTitle className="text-base font-bold uppercase tracking-tight font-headline">Surat Rujukan Baru</DialogTitle>
                <DialogDescription className="text-xs text-white/70 font-semibold uppercase tracking-widest mt-0.5">Buat Rujukan untuk Pasien</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateReferral} className="flex flex-col">
            <div className="p-8 overflow-y-auto max-h-[50vh] no-scrollbar space-y-4 text-left bg-[var(--theme-surface)]">
              <div className="relative">
                <label className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest ml-1 mb-2 block">Pilih Pasien</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                      if(e.target.value === '') {
                        setNewReferral({ ...newReferral, mahasiswa_id: '' });
                      }
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder="Cari nama pasien atau NIM..."
                    className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-xs font-semibold text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] transition-colors"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-subtle)] pointer-events-none text-base shrink-0">search</span>
                </div>

                {showDropdown && (
                  <div className="absolute z-20 w-full mt-2 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl shadow-xl max-h-56 overflow-y-auto">
                    {mahasiswaList.filter(m => {
                      const str = `${m.nama || m.name} ${m.nim || m.id}`.toLowerCase();
                      return str.includes(searchQuery.toLowerCase());
                    }).map((maba) => (
                      <div 
                        key={maba.id} 
                        onClick={async () => {
                          setNewReferral({ ...newReferral, mahasiswa_id: maba.id });
                          setSearchQuery(`${maba.nama || maba.name} (${maba.nim || maba.id})`);
                          setShowDropdown(false);
                          setLoadingHistory(true);
                          try {
                            const res = await psychologistService.getMedicalRecord(maba.id);
                            setSelectedPatientHistory(res.data?.records || []);
                          } catch (err) {
                            console.error('Error fetching medical record:', err);
                            setSelectedPatientHistory([]);
                          } finally {
                            setLoadingHistory(false);
                          }
                        }}
                        className={cn(
                          "px-4 py-3 cursor-pointer text-xs transition-colors hover:bg-[var(--theme-bg)] border-b border-[var(--theme-border-muted)] last:border-0",
                          newReferral.mahasiswa_id === maba.id ? 'text-[var(--theme-primary)] font-bold bg-[var(--theme-primary-light)]/30' : 'text-[var(--theme-text-muted)] font-medium'
                        )}
                      >
                        {maba.nama || maba.name} <span className="text-[10px] text-[var(--theme-text-subtle)] ml-1">({maba.nim || maba.id})</span>
                      </div>
                    ))}
                    {mahasiswaList.filter(m => {
                      const str = `${m.nama || m.name} ${m.nim || m.id}`.toLowerCase();
                      return str.includes(searchQuery.toLowerCase());
                    }).length === 0 && (
                      <div className="px-4 py-4 text-center text-xs text-[var(--theme-text-subtle)] italic">
                        Pasien tidak ditemukan
                      </div>
                    )}
                  </div>
                )}

                {newReferral.mahasiswa_id && (
                  <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-4 mt-2 max-h-48 overflow-y-auto">
                    <p className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm shrink-0">history</span> Riwayat Sesi Konseling
                    </p>
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--theme-primary)]"></div>
                      </div>
                    ) : selectedPatientHistory.length === 0 ? (
                      <p className="text-[10px] text-[var(--theme-text-subtle)] font-bold uppercase tracking-wide text-center py-2">Tidak ada riwayat konseling</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedPatientHistory.map((item, idx) => (
                          <div key={item.id || idx} className="border-b border-[var(--theme-border-muted)] last:border-0 pb-2.5 last:pb-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-bold text-[var(--theme-text)] uppercase tracking-wider">{item.date}</span>
                              <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-[var(--theme-primary-light)] text-[var(--theme-primary)]">{item.type}</span>
                            </div>
                            <p className="text-[10px] text-[var(--theme-text-muted)] font-medium leading-relaxed">
                              <span className="font-bold text-[var(--theme-text)]">Keluhan:</span> {item.complaint || '-'}
                            </p>
                            <p className="text-[10px] text-[var(--theme-text-subtle)] font-medium leading-relaxed mt-0.5">
                              <span className="font-bold text-[var(--theme-text-muted)]">Rekomendasi:</span> {item.recommendation || '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest ml-1 mb-2 block">Tipe Rujukan</label>
                <select 
                  value={newReferral.tipe}
                  onChange={(e) => setNewReferral({ ...newReferral, tipe: e.target.value })}
                  className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-xs font-semibold text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] transition-colors cursor-pointer"
                >
                  <option value="Medis">Medis</option>
                  <option value="Akademik">Akademik</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest ml-1 mb-2 block">Alasan Rujukan</label>
                <textarea 
                  required
                  value={newReferral.alasan}
                  onChange={(e) => setNewReferral({ ...newReferral, alasan: e.target.value })}
                  className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-xs font-medium text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] transition-colors h-24 resize-none leading-relaxed"
                  placeholder="Jelaskan alasan rujukan..."
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest ml-1 mb-2 block">Pihak Tujuan</label>
                <input 
                  required
                  type="text"
                  value={newReferral.pihak_tujuan}
                  onChange={(e) => setNewReferral({ ...newReferral, pihak_tujuan: e.target.value })}
                  className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-xs font-semibold text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] transition-colors"
                  placeholder="Nama klinik/psikolog tujuan"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest ml-1 mb-2 block">Email Tujuan</label>
                <input 
                  required
                  type="email"
                  value={newReferral.email_tujuan}
                  onChange={(e) => setNewReferral({ ...newReferral, email_tujuan: e.target.value })}
                  className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-xs font-semibold text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] transition-colors"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <DialogFooter className="p-8 border-t border-[var(--theme-border-muted)] bg-[var(--theme-bg)]/50 shrink-0 flex gap-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 h-11 rounded-xl text-xs font-bold border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)]"
              >
                Batal
              </Button>
              <button 
                type="submit"
                className="flex-1 text-white px-5 h-11 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] active:scale-95 transition-all border-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-base shrink-0">save</span> Buat Rujukan
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
