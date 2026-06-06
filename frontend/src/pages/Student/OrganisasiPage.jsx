import React, { useMemo, useState } from 'react';
import { 
  useOrganisasiListQuery,
  useOrmawaListQuery,
  useDaftarOrmawaMutation,
  usePendaftaranListQuery,
  useCreateOrganisasiMutation,
  useUpdateOrganisasiMutation,
  useDeleteOrganisasiMutation
} from '../../queries/useOrganisasiQuery';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { CardGridSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';
import { NavLink } from 'react-router-dom';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const ClipboardList = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>assignment</span>;
const Shield = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>security</span>;

const TIPE_COLORS = {
  UKM:            { bg: 'bg-[#EAF1FF]', text: 'text-[#0B4FAE]' },
  'Himpunan Prodi': { bg: 'bg-[#EEF4FF]', text: 'text-[#1D4E9E]' },
  BEM:            { bg: 'bg-[#EDF3FF]', text: 'text-[#113A80]' },
  DPM:            { bg: 'bg-[#F3F7FF]', text: 'text-[#294D8D]' },
  Komunitas:  { bg: 'bg-[#f5f5f5]', text: 'text-[#737373]' },
  Lainnya:    { bg: 'bg-[#f5f5f5]', text: 'text-[#737373]' },
};

export default function OrganisasiPage() {
  const { data: list, isLoading } = useOrganisasiListQuery();
  const { data: ormawaList, isLoading: isOrmawaLoading } = useOrmawaListQuery();
  const { data: pendaftaranList } = usePendaftaranListQuery();
  
  const getRecruitmentStatus = (org) => {
    if (!org.open_recruitment) {
      return { isOpen: false, text: 'Pendaftaran Ditutup', color: 'bg-rose-50 text-rose-600 border-rose-200' };
    }
    const now = new Date();
    if (org.recruitment_start && new Date(org.recruitment_start) > now) {
      const startDate = new Date(org.recruitment_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      return { isOpen: false, text: `Buka Sejak ${startDate}`, color: 'bg-amber-50 text-amber-600 border-amber-200' };
    }
    if (org.recruitment_end && new Date(org.recruitment_end) < now) {
      return { isOpen: false, text: 'Pendaftaran Selesai', color: 'bg-rose-50 text-rose-600 border-rose-200' };
    }
    return { isOpen: true, text: 'Pendaftaran Dibuka', color: 'bg-emerald-50 text-emerald-600 border-emerald-200 animate-pulse' };
  };

  const getPendaftaranRecord = (orgId) => {
    return pendaftaranList?.find(app => (app.OrmawaID === orgId || app.ormawa_id === orgId));
  };

  const { data: profile } = useQuery({
    queryKey: ['mahasiswa', 'profile'],
    queryFn: async () => {
      const { data } = await api.get('/profil');
      return data.data;
    }
  });

  const [mainTab, setMainTab] = useState('portfolio'); // 'portfolio', 'daftar', 'pendaftaran'
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [activeTab, setActiveTab] = useState('ringkasan');
  
  // Registration state
  const [selectedDaftarOrg, setSelectedDaftarOrg] = useState(null);
  const [divisiPilihan, setDivisiPilihan] = useState('');
  const [divisiPilihanDua, setDivisiPilihanDua] = useState('');
  const [alasan, setAlasan] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [customAnswers, setCustomAnswers] = useState({});
  const [fileUploading, setFileUploading] = useState({});
  const daftarMutation = useDaftarOrmawaMutation();

  const ormawaId = selectedDaftarOrg?.id || selectedDaftarOrg?.ID;
  const { data: divisionsList, isLoading: isDivisionsLoading } = useQuery({
    queryKey: ['ormawa', 'divisions', ormawaId],
    queryFn: async () => {
      if (!ormawaId) return [];
      const { data } = await api.get(`/organisasi/divisions/${ormawaId}`);
      return data.data || [];
    },
    enabled: !!ormawaId,
  });

  // Load dynamic recruitment form fields
  const { data: recruitmentFieldsData } = useQuery({
    queryKey: ['ormawa', 'recruitment-fields', ormawaId],
    queryFn: async () => {
      if (!ormawaId) return { fields: [] };
      try {
        const { data } = await api.get(`/organisasi/recruitment-fields/${ormawaId}`);
        return data;
      } catch {
        return { fields: [] };
      }
    },
    enabled: !!ormawaId,
  });
  const recruitmentFields = recruitmentFieldsData?.data || [];

  const closeDaftarModal = () => {
    setSelectedDaftarOrg(null);
    setDivisiPilihan('');
    setDivisiPilihanDua('');
    setAlasan('');
    setCvUrl('');
    setCustomAnswers({});
    setFileUploading({});
  };

  const handleCustomAnswer = (fieldId, value) => {
    setCustomAnswers(prev => ({ ...prev, [String(fieldId)]: value }));
  };

  const handleFileUpload = async (fieldId, file) => {
    if (!file) return;
    setFileUploading(prev => ({ ...prev, [fieldId]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/organisasi/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        handleCustomAnswer(fieldId, data.url);
        toast.success('File berhasil diunggah');
      }
    } catch {
      toast.error('Gagal mengunggah file. Maksimal 5 MB.');
    } finally {
      setFileUploading(prev => ({ ...prev, [fieldId]: false }));
    }
  };


  // Portfolio CRUD state
  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState(null);
  const [portForm, setPortForm] = useState({
    nama_organisasi: '',
    tipe: 'UKM',
    jabatan: '',
    periode_mulai: new Date().getFullYear(),
    periode_selesai: '',
    deskripsi_kegiatan: '',
    apresiasi: ''
  });

  const createMutation = useCreateOrganisasiMutation();
  const updateMutation = useUpdateOrganisasiMutation();
  const deleteMutation = useDeleteOrganisasiMutation();

  // Print state
  const [printCertData, setPrintCertData] = useState(null);

  const tipeColor = (tipe) => TIPE_COLORS[tipe] ?? TIPE_COLORS['Lainnya'];
  const currentAchievements = useMemo(() => selectedOrg?.Prestasi || [], [selectedOrg]);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!selectedDaftarOrg) return;

    // Check GPA eligibility on student-side before submitting
    const studentIPK = profile?.IPK || 0;
    const minIPK = selectedDaftarOrg.min_ipk || selectedDaftarOrg.MinIPK || 0;
    if (minIPK > 0 && studentIPK < minIPK) {
      toast.error(`IPK Anda (${studentIPK.toFixed(2)}) tidak memenuhi syarat minimal (${minIPK.toFixed(2)})`);
      return;
    }

    daftarMutation.mutate({
      ormawa_id: selectedDaftarOrg.id || selectedDaftarOrg.ID,
      divisi: divisiPilihan,
      divisi_pilihan_dua: divisiPilihanDua,
      alasan: recruitmentFields.length === 0 ? alasan : undefined,
      cv_url: recruitmentFields.length === 0 ? cvUrl : undefined,
      custom_answers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
    }, {
      onSuccess: () => {
        toast.success(`Berhasil mengirim pendaftaran ke ${selectedDaftarOrg.Nama || selectedDaftarOrg.nama}!`);
        closeDaftarModal();
        setMainTab('pendaftaran');
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Gagal mengajukan pendaftaran');
      }
    });
  };

  const handlePortFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      nama_organisasi: portForm.nama_organisasi,
      tipe: portForm.tipe,
      jabatan: portForm.jabatan,
      periode_mulai: parseInt(portForm.periode_mulai),
      periode_selesai: portForm.periode_selesai ? parseInt(portForm.periode_selesai) : null,
      deskripsi_kegiatan: portForm.deskripsi_kegiatan,
      apresiasi: portForm.apresiasi
    };

    if (editingPort) {
      updateMutation.mutate({ id: editingPort.id || editingPort.ID, ...payload }, {
        onSuccess: () => {
          toast.success('Riwayat organisasi berhasil diperbarui!');
          setIsPortModalOpen(false);
          setEditingPort(null);
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || 'Gagal memperbarui data');
        }
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Riwayat organisasi berhasil dilaporkan!');
          setIsPortModalOpen(false);
          resetPortForm();
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || 'Gagal menyimpan data');
        }
      });
    }
  };

  const resetPortForm = () => {
    setPortForm({
      nama_organisasi: '',
      tipe: 'UKM',
      jabatan: '',
      periode_mulai: new Date().getFullYear(),
      periode_selesai: '',
      deskripsi_kegiatan: '',
      apresiasi: ''
    });
  };

  const handleEditPort = (item) => {
    setEditingPort(item);
    setPortForm({
      nama_organisasi: item.NamaOrganisasi || '',
      tipe: item.Tipe || 'UKM',
      jabatan: item.Jabatan || '',
      periode_mulai: item.PeriodeMulai || new Date().getFullYear(),
      periode_selesai: item.PeriodeSelesai || '',
      deskripsi_kegiatan: item.DeskripsiKegiatan || '',
      apresiasi: item.Apresiasi || ''
    });
    setIsPortModalOpen(true);
  };

  const handleDeletePort = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus riwayat organisasi ini?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Riwayat organisasi berhasil dihapus');
        },
        onError: () => {
          toast.error('Gagal menghapus data');
        }
      });
    }
  };

  const handlePrintCertificate = (item) => {
    setPrintCertData(item);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] font-body px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">

      <div className="max-w-7xl mx-auto">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-6 print:hidden">
           <NavLink to="/student/dashboard" className="hover:text-[#00236F] cursor-pointer transition-colors">Dashboard</NavLink>
           <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
           <span className="text-[#171717]">Organisasi</span>
         </div>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-headline mb-1.5 flex items-center gap-3">
              <div className="bg-[#00236F] p-2 rounded-xl text-white shadow-md shadow-[#00236F]/20">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >group</span>
              </div>
              Portfolio Keorganisasian
            </h1>
            <p className="text-[#525252] font-medium text-sm md:text-base">Portofolio keaktifan organisasi kemahasiswaan dan pendaftaran Ormawa.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row border-b border-[#e5e5e5] mb-8 sm:items-center sm:justify-between gap-4 print:hidden">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setMainTab('portfolio')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                mainTab === 'portfolio' ? 'border-[#00236F] text-[#00236F]' : 'border-transparent text-[#737373] hover:text-[#171717]'
              }`}
            >
              Portfolio Saya
            </button>
            <button
              onClick={() => setMainTab('daftar')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                mainTab === 'daftar' ? 'border-[#00236F] text-[#00236F]' : 'border-transparent text-[#737373] hover:text-[#171717]'
              }`}
            >
              Daftar Ormawa Baru
            </button>
            <button
              onClick={() => setMainTab('pendaftaran')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                mainTab === 'pendaftaran' ? 'border-[#00236F] text-[#00236F]' : 'border-transparent text-[#737373] hover:text-[#171717]'
              }`}
            >
              Status Pendaftaran ({pendaftaranList?.length || 0})
            </button>
          </div>
          {mainTab === 'portfolio' && (
            <button
              onClick={() => { resetPortForm(); setEditingPort(null); setIsPortModalOpen(true); }}
              className="mb-2 sm:mb-0 bg-[#00236F] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#0B4FAE] transition-colors shadow-sm shadow-[#00236F]/20 active:scale-95"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >add</span>
              Tambah Riwayat Organisasi
            </button>
          )}
        </div>

        {/* Content Tabs */}
        {mainTab === 'portfolio' && (
          isLoading ? (
            <CardGridSkeleton count={4} />
          ) : list?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:hidden">
              {list.map((item) => {
                const tc = tipeColor(item.Tipe);
                const isPending = item.StatusVerifikasi === 'Menunggu' || item.StatusVerifikasi === 'Pending';
                const isVerified = item.StatusVerifikasi === 'Terverifikasi' || item.StatusVerifikasi === 'Diverifikasi' || item.StatusVerifikasi === 'Valid' || item.StatusVerifikasi === 'Disetujui';
                const isActive = !item.PeriodeSelesai;

                return (
                  <div
                    key={item.id || item.ID}
                    className="group bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden hover:border-[#C9D8FF] hover:shadow-lg hover:shadow-[#00236F]/10 transition-all flex flex-col"
                  >
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${tc.bg} ${tc.text} border-current/20 uppercase tracking-wide`}>
                              {item.Tipe}
                            </span>
                          {isActive ? (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#EAF1FF] text-[#0B4FAE] border border-[#C9D8FF]">Aktif</span>
                          ) : (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]">Selesai/Purna</span>
                          )}
                        </div>
                        
                        {isPending ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 text-[#00236F] bg-[#eef4ff] border border-[#c9d8ff]">
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >schedule</span> Menunggu Verifikasi
                          </span>
                        ) : isVerified ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0]">
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >check_circle</span> Terverifikasi
                          </span>
                        ) : item.StatusVerifikasi === 'Ditolak' ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 text-[#dc2626] bg-[#fef2f2] border border-[#fecaca]">
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >cancel</span> Ditolak
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 text-[#737373] bg-[#f5f5f5] border border-[#e5e5e5]">
                            {item.StatusVerifikasi || 'Draft'}
                          </span>
                        )}
                      </div>

                      {/* Organization Title */}
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-[#171717] group-hover:text-[#00236F] transition-colors leading-snug">
                          {item.NamaOrganisasi}
                        </h3>
                        <p className="text-sm font-semibold text-[#525252] mt-1">{item.Jabatan}</p>
                      </div>

                      {/* Meta Info Grid */}
                      <div className="grid grid-cols-1 gap-2 pt-3 border-t border-[#f5f5f5]">
                        <div className="flex text-sm">
                          <span className="w-32 shrink-0 text-[#a3a3a3] flex items-center gap-1.5">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >calendar_month</span> Periode:
                          </span>
                          <span className="font-medium text-[#171717]">
                            {item.PeriodeMulai} — {item.PeriodeSelesai ? item.PeriodeSelesai : 'Sekarang'}
                          </span>
                        </div>

                        <div className="flex text-sm">
                          <span className="w-32 shrink-0 text-[#a3a3a3] flex items-start gap-1.5 mt-0.5">
                             <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >group</span> Deskripsi:
                          </span>
                          <span className="text-[#525252] leading-relaxed line-clamp-3">
                             {item.DeskripsiKegiatan || '-'}
                          </span>
                        </div>

                        <div className="flex text-sm">
                          <span className="w-32 shrink-0 text-[#a3a3a3] flex items-start gap-1.5 mt-0.5">
                             <Award size={14} /> Apresiasi:
                          </span>
                          <span className="text-[#113A80] font-medium leading-relaxed bg-[#EEF4FF] px-2 py-1 rounded">
                             {item.Apresiasi || '-'}
                          </span>
                        </div>
                      </div>

                      {/* Achievements Section */}
                      {item.Prestasi && item.Prestasi.length > 0 && (
                        <div className="pt-3 border-t border-[#f5f5f5]">
                          <p className="text-xs font-bold text-[#a3a3a3] mb-2 uppercase tracking-wider flex items-center gap-1.5"><span className="material-symbols-outlined text-amber-500" style={{ fontSize: 14 }}>emoji_events</span> Prestasi Terkait:</p>
                          <div className="flex flex-col gap-2">
                            {item.Prestasi.map(p => (
                              <div key={p.id || p.ID} className="flex flex-col bg-[#fffbeb] border border-[#fde68a] p-2.5 rounded-xl">
                                 <span className="font-bold text-[#b45309] text-xs leading-none mb-1">{p.NamaKegiatan}</span>
                                 <span className="text-[10px] text-[#d97706] font-medium leading-none">{p.Tingkat} • {p.Peringkat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-[#f5f5f5] flex justify-between items-center gap-2">
                        <div className="flex gap-1.5 items-center">
                          {isVerified ? (
                            <button
                              onClick={() => handlePrintCertificate(item)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>print</span> Cetak Sertifikat
                            </button>
                          ) : (
                            <span className="text-xs text-[#a3a3a3] font-semibold italic">
                              {item.StatusVerifikasi === 'Ditolak' ? 'Pengajuan ditolak' : 'Sertifikat belum tersedia'}
                            </span>
                          )}

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleEditPort(item)}
                                className="p-1.5 text-[#00236F] bg-[#eef4ff] rounded-xl hover:bg-[#dbe7ff] transition-colors"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span>
                              </button>
                              <button
                                onClick={() => handleDeletePort(item.id || item.ID)}
                                className="p-1.5 text-[#dc2626] bg-[#fef2f2] rounded-xl hover:bg-[#fee2e2] transition-colors"
                                title="Hapus"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span>
                              </button>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => { setSelectedOrg(item); setActiveTab('ringkasan'); }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00236F] text-white text-xs font-bold hover:bg-[#0B4FAE] transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >visibility</span> Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState 
              icon="Users" 
              title="Belum Ada Riwayat Organisasi" 
              description="Belum ada catatan keaktifan organisasi. Tambahkan riwayat organisasi Anda secara mandiri." 
              iconBgClass="bg-[#EAF1FF]"
              iconBorderClass="border-[#C9D8FF]"
              actionLabel="Tambah Riwayat Organisasi"
              actionClassName="bg-[#00236F] hover:bg-[#0B4FAE]"
              onAction={() => { resetPortForm(); setEditingPort(null); setIsPortModalOpen(true); }}
            />
          )
        )}

        {mainTab === 'daftar' && (
          isOrmawaLoading ? (
            <CardGridSkeleton count={3} />
          ) : ormawaList?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 print:hidden">
              {ormawaList.map((org) => (
                <div
                  key={org.id || org.ID}
                  className="bg-white rounded-2xl border border-[#e5e5e5] p-5 flex flex-col gap-4 hover:border-[#C9D8FF] hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#00236F]/10 text-[#00236F] flex items-center justify-center font-bold text-lg shrink-0">
                      {org.LogoURL ? (
                        <img src={org.LogoURL} alt={org.Singkatan} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        org.Singkatan?.slice(0, 3) || 'ORG'
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#171717]">{org.Nama}</h3>
                      <div className="flex flex-wrap gap-2 items-center mt-1">
                        <span className="px-2 py-0.5 rounded bg-[#EAF1FF] text-[#0B4FAE] text-[10px] font-black uppercase tracking-wide border border-[#C9D8FF]/35">
                          {org.Kategori || 'Organisasi'}
                        </span>
                        {(() => {
                          const status = getRecruitmentStatus(org);
                          return (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${status.color}`}>
                              {status.text}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[#525252] leading-relaxed line-clamp-3">
                    {org.Deskripsi || 'Tidak ada deskripsi.'}
                  </p>

                  {org.Visi && (
                    <div className="text-xs bg-[#fafafa] p-3 rounded-xl border border-[#f5f5f5]">
                      <span className="font-bold text-[#171717] block mb-0.5">Visi:</span>
                      <span className="text-[#525252] italic">"{org.Visi}"</span>
                    </div>
                  )}

                  <div className="mt-auto pt-3 border-t border-[#f5f5f5] flex items-center justify-between gap-4">
                    <div className="text-xs text-[#a3a3a3] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>email</span>
                      {org.Email || '-'}
                    </div>
                    {(() => {
                      const orgId = org.id || org.ID;
                      const record = getPendaftaranRecord(orgId);
                      const status = getRecruitmentStatus(org);

                      if (record && record.Status?.toLowerCase() === 'aktif') {
                        return (
                          <span className="px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                            Sudah Tergabung
                          </span>
                        );
                      }
                      if (record && record.Status?.toLowerCase() === 'pending') {
                        return (
                          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                            Menunggu Persetujuan
                          </span>
                        );
                      }
                      if (!status.isOpen) {
                        return (
                          <button
                            disabled
                            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-xs font-bold border border-gray-200 cursor-not-allowed"
                          >
                            Pendaftaran Ditutup
                          </button>
                        );
                      }
                      return (
                        <button
                          onClick={() => setSelectedDaftarOrg(org)}
                          className="px-4 py-2 rounded-xl bg-[#00236F] text-white text-xs font-bold hover:bg-[#0B4FAE] transition-colors active:scale-95 duration-150"
                        >
                          Daftar Sekarang
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon="Users" 
              title="Tidak Ada Organisasi" 
              description="Tidak ada organisasi mahasiswa aktif yang tersedia saat ini." 
              iconBgClass="bg-[#EAF1FF]"
              iconBorderClass="border-[#C9D8FF]"
            />
          )
        )}

        {mainTab === 'pendaftaran' && (
          pendaftaranList?.length > 0 ? (
            <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden print:hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#fafafa]/50 border-b border-[#f5f5f5]">
                      <th className="px-6 py-4 text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest">Ormawa</th>
                      <th className="px-6 py-4 text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest">Divisi Pilihan</th>
                      <th className="px-6 py-4 text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest">Tanggal Pengajuan</th>
                      <th className="px-6 py-4 text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest">Role</th>
                      <th className="px-6 py-4 text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5f5f5]">
                    {pendaftaranList.map((app) => {
                      const statusStyles = {
                        pending: 'bg-amber-50 text-amber-600 border-amber-200',
                        aktif: 'bg-green-50 text-green-600 border-green-200',
                        tidak_aktif: 'bg-red-50 text-red-600 border-red-200',
                      };
                      const statusLabel = {
                        pending: 'Menunggu Persetujuan',
                        aktif: 'Diterima',
                        tidak_aktif: 'Ditolak/Nonaktif',
                      };
                      const st = app.Status?.toLowerCase() || 'pending';
                      return (
                        <tr key={app.id || app.ID} className="group hover:bg-[#fafafa]/80 transition-all duration-300">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#00236F]/10 text-[#00236F] flex items-center justify-center font-bold text-sm shrink-0">
                                {app.Ormawa?.Singkatan || 'ORG'}
                              </div>
                              <div>
                                <div className="font-extrabold text-[#171717]">{app.Ormawa?.Nama}</div>
                                <div className="text-[10px] font-bold text-[#a3a3a3]">{app.Ormawa?.Kategori || 'Organisasi'}</div>
                              </div>
                            </div>
                          </td>
                           <td className="px-6 py-4 font-semibold text-sm text-[#525252]">
                            <div>{app.Divisi || 'Umum'}</div>
                            {(app.divisi_pilihan_dua || app.DivisiPilihanDua) && (
                              <div className="text-[10px] font-bold text-[#737373] mt-0.5 uppercase tracking-wide">Pilihan 2: {app.divisi_pilihan_dua || app.DivisiPilihanDua}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-sm text-[#a3a3a3]">
                            {new Date(app.created_at || app.CreatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 font-bold text-sm text-[#00236F]">
                            {app.Role || 'Anggota'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${statusStyles[st] || statusStyles.pending}`}>
                              {statusLabel[st] || st}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState 
              icon="Users" 
              title="Belum Ada Pendaftaran" 
              description="Anda belum mengajukan pendaftaran anggota ke Ormawa manapun." 
              iconBgClass="bg-[#EAF1FF]"
              iconBorderClass="border-[#C9D8FF]"
            />
          )
        )}
      </div>

      {selectedOrg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden border border-[#e5e5e5] shadow-2xl flex flex-col">
            <div className="bg-[#00236F] text-white p-6 md:p-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Detail Organisasi</p>
                <h3 className="text-xl md:text-2xl font-extrabold mt-1 leading-tight">{selectedOrg.NamaOrganisasi}</h3>
                <p className="text-sm text-white/80 mt-1">{selectedOrg.Jabatan} • {selectedOrg.Tipe}</p>
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >close</span>
              </button>
            </div>

            <div className="px-6 pt-4 border-b border-[#f0f0f0] flex gap-2 overflow-x-auto">
              {[
                { key: 'ringkasan', label: 'Ringkasan', icon: ClipboardList },
                { key: 'prestasi', label: 'Prestasi', icon: Award },
                { key: 'verifikasi', label: 'Status & Verifikasi', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                      isActive ? 'text-[#00236F] border-[#00236F] bg-[#EEF4FF]' : 'text-[#737373] border-transparent hover:text-[#171717]'
                    }`}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6 overflow-y-auto">
              {activeTab === 'ringkasan' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Nama Organisasi" value={selectedOrg.NamaOrganisasi} />
                  <DetailItem label="Jenis" value={selectedOrg.Tipe} />
                  <DetailItem label="Jabatan" value={selectedOrg.Jabatan} />
                  <DetailItem label="Periode" value={`${selectedOrg.PeriodeMulai} - ${selectedOrg.PeriodeSelesai || 'Sekarang'}`} />
                  <DetailItem label="Deskripsi Kegiatan" value={selectedOrg.DeskripsiKegiatan || '-'} full />
                  <DetailItem label="Apresiasi" value={selectedOrg.Apresiasi || '-'} full />
                </div>
              )}

              {activeTab === 'prestasi' && (
                <div className="space-y-3">
                  {currentAchievements.length > 0 ? currentAchievements.map((p) => (
                    <div key={p.id || p.ID} className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-4">
                      <p className="font-bold text-[#b45309] text-sm">{p.NamaKegiatan || '-'}</p>
                      <p className="text-xs text-[#d97706] mt-1">{p.Tingkat || '-'} • {p.Peringkat || '-'}</p>
                    </div>
                  )) : (
                    <EmptyState
                      size="sm"
                      icon="emoji_events"
                      title="Belum Ada Prestasi"
                      description="Prestasi yang terkait organisasi ini belum tersedia."
                      iconBgClass="bg-[#fff7ed]"
                      iconBorderClass="border-[#fed7aa]"
                    />
                  )}
                </div>
              )}

              {activeTab === 'verifikasi' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#e5e5e5] p-4 bg-[#fafafa]">
                    <p className="text-xs text-[#737373]">Status Keanggotaan</p>
                    <p className="text-base font-bold text-[#171717] mt-1">{selectedOrg.PeriodeSelesai ? 'Selesai/Purna' : 'Aktif'}</p>
                  </div>
                  <div className="rounded-2xl border border-[#e5e5e5] p-4 bg-[#fafafa]">
                    <p className="text-xs text-[#737373]">Status Verifikasi</p>
                    <p className="text-base font-bold mt-1 text-[#171717]">{selectedOrg.StatusVerifikasi || 'Menunggu'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {selectedDaftarOrg && (() => {
        const studentIPK = profile?.IPK || 0;
        const minIPK = selectedDaftarOrg.min_ipk || selectedDaftarOrg.MinIPK || 0;
        const isGPAEligible = minIPK === 0 || studentIPK >= minIPK;
        const fallbackDivisions = ["Umum", "Humas / Media", "PSDM / Keanggotaan", "Acara / Pelaksana Kegiatan", "Kreatif & Desain", "Logistik & Operasional"];
        const divisionsOptions = divisionsList && divisionsList.length > 0
          ? divisionsList.map(d => d.Nama || d.nama)
          : fallbackDivisions;

        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
            <div className="w-full max-w-xl bg-white rounded-3xl overflow-hidden border border-[#e5e5e5] shadow-2xl flex flex-col animate-in fade-in-50 zoom-in-95 duration-200">
              <div className="bg-[#00236F] text-white p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Formulir Rekrutmen Anggota</p>
                  <h3 className="text-lg font-extrabold mt-1">{selectedDaftarOrg.Nama || selectedDaftarOrg.nama}</h3>
                </div>
                <button
                  onClick={closeDaftarModal}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >close</span>
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="flex flex-col">
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* Requirements & Dates Section */}
                  {(selectedDaftarOrg.recruitment_requirements || minIPK > 0) && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-[#171717] uppercase tracking-widest block flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 16 }}>assignment_late</span>
                        Persyaratan Pendaftaran & Kriteria
                      </label>
                      <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs font-semibold text-amber-900 leading-relaxed space-y-2">
                        {selectedDaftarOrg.recruitment_requirements && (
                          <div className="whitespace-pre-wrap font-body">
                            {selectedDaftarOrg.recruitment_requirements}
                          </div>
                        )}
                        {minIPK > 0 && (
                          <div className="flex items-center gap-1.5 text-amber-950 font-bold border-t border-amber-200/50 pt-2 mt-2">
                            <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 14 }}>school</span>
                            <span>IPK Minimal: {minIPK.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedDaftarOrg.recruitment_start && selectedDaftarOrg.recruitment_end && (
                    <div className="text-[11px] font-bold text-[#737373] flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 14 }}>calendar_month</span>
                      <span>
                        Periode: {new Date(selectedDaftarOrg.recruitment_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} s.d. {new Date(selectedDaftarOrg.recruitment_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {/* Section 1: Profil Pendaftar (Verified) */}
                  <div className="bg-slate-50 border border-[#e5e5e5] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#e5e5e5]/80 pb-2">
                      <h4 className="text-[11px] font-black text-[#171717] uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#00236F]" style={{ fontSize: 14 }}>verified_user</span>
                        Profil Pendaftar (SIAKAD Verified)
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">Auto-filled</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#737373] font-medium">Nama Lengkap</span>
                        <p className="font-extrabold text-[#171717] mt-0.5">{profile?.Nama || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[#737373] font-medium">NIM</span>
                        <p className="font-extrabold text-[#171717] mt-0.5">{profile?.NIM || '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#737373] font-medium">Program Studi</span>
                        <p className="font-extrabold text-[#171717] mt-0.5">{profile?.ProgramStudi?.Nama || '-'}</p>
                      </div>
                      <div className="col-span-2 border-t border-[#e5e5e5]/60 pt-2 flex items-center justify-between">
                        <div>
                          <span className="text-[#737373] font-medium block">Indeks Prestasi Kumulatif (IPK)</span>
                          <span className="font-black text-sm text-[#171717]">{studentIPK.toFixed(2)}</span>
                        </div>
                        <div>
                          {minIPK > 0 ? (
                            isGPAEligible ? (
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span> Memenuhi Syarat
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>cancel</span> IPK Kurang (Min: {minIPK.toFixed(2)})
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] font-bold text-[#737373] bg-[#f5f5f5] px-2 py-1 rounded border border-[#e5e5e5]">Tidak Ada Syarat IPK</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning Alert for IPK restriction */}
                  {!isGPAEligible && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex gap-3 leading-relaxed">
                      <span className="material-symbols-outlined shrink-0 text-rose-600 animate-bounce" style={{ fontSize: 18 }}>warning</span>
                      <span>Maaf, Anda tidak dapat mendaftar ke Ormawa ini karena IPK Anda ({studentIPK.toFixed(2)}) berada di bawah standar minimum yang ditentukan ({minIPK.toFixed(2)}).</span>
                    </div>
                  )}

                  {/* Section 2: Pilihan Divisi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Divisi Pilihan 1 <span className="text-rose-500">*</span></label>
                      <select
                        value={divisiPilihan}
                        onChange={(e) => setDivisiPilihan(e.target.value)}
                        className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-bold text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all outline-none"
                        required
                        disabled={!isGPAEligible}
                      >
                        <option value="" disabled>-- Pilih Divisi Utama --</option>
                        {divisionsOptions.map((div, i) => (
                          <option key={i} value={div}>{div}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Divisi Pilihan 2 <span className="text-[#737373] text-[10px] font-normal">(Opsional)</span></label>
                      <select
                        value={divisiPilihanDua}
                        onChange={(e) => setDivisiPilihanDua(e.target.value)}
                        className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-bold text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all outline-none"
                        disabled={!isGPAEligible}
                      >
                        <option value="">-- Tidak Memilih --</option>
                        {divisionsOptions.filter(d => d !== divisiPilihan).map((div, i) => (
                          <option key={i} value={div}>{div}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Section 3: Dynamic Custom Fields from Ormawa */}
                  {recruitmentFields.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#e5e5e5] pb-2">
                        <span className="material-symbols-outlined text-[#00236F]" style={{ fontSize: 15 }}>dynamic_form</span>
                        <h4 className="text-[11px] font-black text-[#171717] uppercase tracking-wider">Pertanyaan Tambahan dari Ormawa</h4>
                      </div>
                      {recruitmentFields.map((field) => {
                        const fieldId = field.id || field.ID;
                        const options = field.options ? field.options.split(',').map(o => o.trim()).filter(Boolean) : [];
                        const answer = customAnswers[String(fieldId)];
                        return (
                          <div key={fieldId} className="space-y-1.5">
                            <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">
                              {field.label}
                              {field.required && <span className="text-rose-500 ml-1">*</span>}
                            </label>

                            {/* Text */}
                            {field.type === 'text' && (
                              <input
                                type="text"
                                placeholder={field.label}
                                value={answer || ''}
                                onChange={e => handleCustomAnswer(fieldId, e.target.value)}
                                required={field.required}
                                disabled={!isGPAEligible}
                                className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-bold text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all outline-none"
                              />
                            )}

                            {/* Paragraph / Long Text */}
                            {field.type === 'paragraph' && (
                              <textarea
                                placeholder={field.label}
                                value={answer || ''}
                                onChange={e => handleCustomAnswer(fieldId, e.target.value)}
                                required={field.required}
                                disabled={!isGPAEligible}
                                rows={4}
                                className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-bold text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all outline-none resize-none"
                              />
                            )}

                            {/* Select Dropdown */}
                            {field.type === 'select' && (
                              <select
                                value={answer || ''}
                                onChange={e => handleCustomAnswer(fieldId, e.target.value)}
                                required={field.required}
                                disabled={!isGPAEligible}
                                className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-bold text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all outline-none"
                              >
                                <option value="">-- Pilih --</option>
                                {options.map((opt, i) => (
                                  <option key={i} value={opt}>{opt}</option>
                                ))}
                              </select>
                            )}

                            {/* Checkboxes (multi-select) */}
                            {field.type === 'checkbox' && (
                              <div className="space-y-2">
                                {options.map((opt, i) => {
                                  const checkedValues = Array.isArray(answer) ? answer : (answer ? [answer] : []);
                                  const isChecked = checkedValues.includes(opt);
                                  return (
                                    <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={!isGPAEligible}
                                        onChange={() => {
                                          const next = isChecked
                                            ? checkedValues.filter(v => v !== opt)
                                            : [...checkedValues, opt];
                                          handleCustomAnswer(fieldId, next);
                                        }}
                                        className="w-4 h-4 rounded border-[#e5e5e5] accent-[#00236F]"
                                      />
                                      <span className="text-sm font-semibold text-[#171717]">{opt}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {/* File Upload (PDF/Image) */}
                            {field.type === 'file' && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <label
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                      !isGPAEligible
                                        ? 'bg-[#f5f5f5] text-[#a3a3a3] border-[#e5e5e5] cursor-not-allowed'
                                        : 'bg-[#EAF1FF] border-[#C9D8FF] text-[#0B4FAE] hover:bg-[#D9E7FF]'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>upload_file</span>
                                    {fileUploading[fieldId] ? 'Mengunggah...' : 'Pilih File (PDF/Gambar, maks 5 MB)'}
                                    <input
                                      type="file"
                                      accept=".pdf,image/*"
                                      disabled={!isGPAEligible || fileUploading[fieldId]}
                                      onChange={e => handleFileUpload(fieldId, e.target.files?.[0])}
                                      className="hidden"
                                    />
                                  </label>
                                  {fileUploading[fieldId] && (
                                    <span className="text-xs text-[#737373] animate-pulse">Mengunggah...</span>
                                  )}
                                </div>
                                {answer && (
                                  <a
                                    href={answer}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-[#0B4FAE] font-semibold hover:underline"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>attach_file</span>
                                    File terlampir — klik untuk pratinjau
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Fallback form for Ormawa that has no custom fields set */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Alasan &amp; Motivasi Bergabung <span className="text-rose-500">*</span></label>
                        <textarea
                          placeholder="Tuliskan alasan singkat mengapa Anda tertarik bergabung dengan divisi yang dipilih..."
                          value={alasan}
                          onChange={(e) => setAlasan(e.target.value)}
                          className="w-full h-28 px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-bold text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all outline-none resize-none"
                          required
                          disabled={!isGPAEligible}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Tautan CV / Portfolio (Google Drive, dll) <span className="text-rose-500">*</span></label>
                        <input
                          type="url"
                          placeholder="Contoh: https://drive.google.com/..."
                          value={cvUrl}
                          onChange={(e) => setCvUrl(e.target.value)}
                          className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-bold text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all outline-none"
                          required
                          disabled={!isGPAEligible}
                        />
                        <span className="text-[10px] font-bold text-[#a3a3a3] block">Pastikan pengaturan berbagi link adalah "Siapa saja yang memiliki link dapat melihat".</span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-[#EAF1FF] border border-[#C9D8FF] rounded-xl flex gap-3 text-xs text-[#0B4FAE] font-medium leading-relaxed">
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: 16 }}>info</span>
                    <span>Formulir ini akan ditinjau secara resmi oleh Pengurus Ormawa. Status pendaftaran dapat dipantau di tab "Status Pendaftaran".</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 p-6 border-t border-[#e5e5e5] bg-[#fafafa] shrink-0">
                  <button
                    type="button"
                    onClick={closeDaftarModal}
                    className="flex-1 py-3 bg-white border border-[#e5e5e5] text-[#737373] font-black rounded-xl hover:bg-[#fafafa] transition-all uppercase tracking-wide text-xs active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={daftarMutation.isPending || !isGPAEligible}
                    className={`flex-1 py-3 font-black rounded-xl transition-all text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 active:scale-95 text-white ${
                      !isGPAEligible 
                        ? 'bg-[#e5e5e5] text-[#a3a3a3] cursor-not-allowed border border-[#d4d4d4]' 
                        : 'bg-[#00236F] hover:bg-[#0B4FAE]'
                    }`}
                  >
                    {daftarMutation.isPending ? 'Mengirim...' : 'Kirim Pendaftaran'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Certificate Print Preview Modal */}
      {printCertData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white overflow-hidden">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden border border-[#e5e5e5] shadow-2xl flex flex-col print:shadow-none print:border-none print:w-full print:max-w-none print:h-full print:rounded-none">
            {/* Modal Header (Hidden on Print) */}
            <div className="bg-[#00236F] text-white p-5 flex items-center justify-between print:hidden shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">badge</span>
                <span className="font-black text-sm uppercase tracking-wider">Cetak Sertifikat Keaktifan Organisasi</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={triggerPrint}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors animate-pulse"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span> Cetak Sekarang
                </button>
                <button
                  onClick={() => setPrintCertData(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
              </div>
            </div>

            {/* Certificate Print Area */}
            <div className="p-6 md:p-10 flex-1 flex justify-start lg:justify-center bg-gray-50 print:bg-white print:p-0 overflow-auto">
              <div
                id="certificate-print-area"
                className="w-[842px] h-[595px] bg-white border-[16px] border-double border-[#b45309] p-8 relative flex flex-col justify-between shadow-lg print:shadow-none print:border-double print:m-0 shrink-0"
                style={{
                  backgroundImage: 'radial-gradient(circle, #fff 60%, #fffbeb 100%)',
                }}
              >
                {/* Certificate Background watermark */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                  <span className="material-symbols-outlined text-[350px] text-[#00236F]">group</span>
                </div>

                {/* Certificate Inner Border */}
                <div className="absolute inset-2 border border-[#b45309]/50 pointer-events-none"></div>

                {/* Top Section */}
                <div className="text-center relative z-10">
                  <div className="flex justify-center items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-4xl text-[#00236F]">school</span>
                    <div className="text-left">
                      <h2 className="text-lg font-black tracking-widest text-[#00236F] leading-none">UNIVERSITAS BHAKTI KENCANA</h2>
                      <p className="text-[9px] font-bold tracking-widest text-[#737373] mt-0.5 uppercase">Lembaga Kemahasiswaan & Hubungan Alumni</p>
                    </div>
                  </div>
                  <div className="h-[2px] w-48 bg-[#b45309] mx-auto my-3"></div>
                  <h1 className="text-3xl font-serif font-black text-[#1e1b4b] uppercase tracking-wide">Sertifikat Penghargaan</h1>
                  <p className="text-[10px] font-bold text-[#b45309] uppercase tracking-widest mt-1">Nomor: BKU-CERT/ORG/{printCertData.id || printCertData.ID}/{new Date().getFullYear()}</p>
                </div>

                {/* Body Section */}
                <div className="text-center my-6 relative z-10 px-8">
                  <p className="text-xs text-[#525252] font-semibold italic">Sertifikat ini diberikan dengan penuh apresiasi kepada:</p>
                  <h3 className="text-2xl font-serif font-black text-[#00236F] mt-3 border-b border-[#e5e5e5] pb-2 inline-block px-12">
                    {profile?.Nama || 'NAMA MAHASISWA'}
                  </h3>
                  <p className="text-xs font-bold text-[#737373] mt-1.5">NIM: {profile?.NIM || 'NIM MAHASISWA'}</p>

                  <p className="text-xs text-[#525252] leading-relaxed max-w-xl mx-auto mt-5">
                    Atas dedikasi, kontribusi, dan keaktifannya sebagai <strong className="text-[#171717]">{printCertData.Jabatan}</strong> dalam organisasi <strong className="text-bku-primary">{printCertData.NamaOrganisasi}</strong> periode <strong className="text-[#171717]">{printCertData.PeriodeMulai} - {printCertData.PeriodeSelesai || 'Sekarang'}</strong>.
                  </p>
                </div>

                {/* Footer Section (Signatures) */}
                <div className="flex justify-between items-end px-10 relative z-10 mt-auto">
                  <div className="text-center w-48">
                    <p className="text-[9px] font-bold text-[#a3a3a3] uppercase mb-1">Ketua Umum {printCertData.NamaOrganisasi}</p>
                    <div className="h-10 flex items-center justify-center">
                      <span className="font-serif text-[11px] italic text-[#737373]">Tanda Tangan Digital</span>
                    </div>
                    <div className="h-[1px] bg-[#a3a3a3] w-full mt-2"></div>
                    <p className="text-[10px] font-extrabold text-[#171717] mt-1">Ketua {printCertData.NamaOrganisasi}</p>
                  </div>

                  {/* Stamp or verification badge */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#b45309]/50 rounded-full w-20 h-20 bg-amber-50/20 backdrop-blur-sm shadow-inner">
                    <span className="material-symbols-outlined text-[#b45309] text-2xl">verified</span>
                    <span className="text-[6px] font-black text-[#b45309] tracking-tighter uppercase mt-0.5">BKU Hub</span>
                    <span className="text-[6px] font-black text-[#b45309] tracking-tighter uppercase">Verified</span>
                  </div>

                  <div className="text-center w-48">
                    <p className="text-[9px] font-bold text-[#a3a3a3] uppercase mb-1">Rektor Universitas Bhakti Kencana</p>
                    <div className="h-10 flex items-center justify-center">
                      <span className="font-serif text-[11px] italic text-[#737373]">Tanda Tangan Digital</span>
                    </div>
                    <div className="h-[1px] bg-[#a3a3a3] w-full mt-2"></div>
                    <p className="text-[10px] font-extrabold text-[#171717] mt-1">Dr. Rektor Universitas</p>
                  </div>
                </div>
              </div>
            </div>
            
            <style>{`
              @page {
                size: landscape;
                margin: 0;
              }
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #certificate-print-area, #certificate-print-area * {
                  visibility: visible !important;
                }
                #certificate-print-area {
                  position: absolute !important;
                  left: 50% !important;
                  top: 50% !important;
                  transform: translate(-50%, -50%) !important;
                  width: 842px !important;
                  height: 595px !important;
                  margin: 0 !important;
                  padding: 32px !important;
                  box-shadow: none !important;
                  border: 16px double #b45309 !important;
                  background-color: white !important;
                  box-sizing: border-box !important;
                }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Portfolio Add/Edit Modal */}
      {isPortModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden border border-[#e5e5e5] shadow-2xl flex flex-col animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="bg-[#00236F] text-white p-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                  {editingPort ? 'Ubah Riwayat Organisasi' : 'Tambah Riwayat Organisasi'}
                </p>
                <h3 className="text-lg font-extrabold mt-1">
                  {editingPort ? 'Edit Data Keorganisasian' : 'Laporkan Keaktifan Organisasi'}
                </h3>
              </div>
              <button
                onClick={() => { setIsPortModalOpen(false); setEditingPort(null); }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >close</span>
              </button>
            </div>

            <form onSubmit={handlePortFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Nama Organisasi <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Contoh: Himpunan Mahasiswa Informatika"
                  value={portForm.nama_organisasi}
                  onChange={(e) => setPortForm({ ...portForm, nama_organisasi: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#00236F] transition-all outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Tipe Organisasi <span className="text-red-500">*</span></label>
                  <select
                    value={portForm.tipe}
                    onChange={(e) => setPortForm({ ...portForm, tipe: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#00236F] transition-all outline-none text-[#171717]"
                    required
                  >
                    <option value="UKM">UKM</option>
                    <option value="Himpunan Prodi">Himpunan Prodi</option>
                    <option value="BEM">BEM</option>
                    <option value="DPM">DPM</option>
                    <option value="Komunitas">Komunitas</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Jabatan <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Contoh: Ketua, Anggota"
                    value={portForm.jabatan}
                    onChange={(e) => setPortForm({ ...portForm, jabatan: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#00236F] transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Tahun Mulai <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    placeholder="Contoh: 2025"
                    value={portForm.periode_mulai}
                    onChange={(e) => setPortForm({ ...portForm, periode_mulai: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#00236F] transition-all outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Tahun Selesai (Kosongkan jika aktif)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 2026"
                    value={portForm.periode_selesai}
                    onChange={(e) => setPortForm({ ...portForm, periode_selesai: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#00236F] transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Deskripsi Kegiatan</label>
                <textarea
                  placeholder="Deskripsikan kontribusi atau peran Anda..."
                  value={portForm.deskripsi_kegiatan}
                  onChange={(e) => setPortForm({ ...portForm, deskripsi_kegiatan: e.target.value })}
                  className="w-full px-4 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#00236F] transition-all outline-none h-20 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Apresiasi/Penghargaan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Anggota Terbaik Periode 2025"
                  value={portForm.apresiasi}
                  onChange={(e) => setPortForm({ ...portForm, apresiasi: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#00236F] transition-all outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsPortModalOpen(false); setEditingPort(null); }}
                  className="flex-1 py-2.5 bg-white border border-[#e5e5e5] text-[#a3a3a3] font-black rounded-xl hover:bg-[#fafafa] transition-all uppercase tracking-wide text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2.5 bg-[#00236F] text-white font-black rounded-xl hover:bg-[#0B4FAE] transition-all text-xs uppercase tracking-wide flex items-center justify-center gap-1.5"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan Riwayat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, full = false }) {
  return (
    <div className={`rounded-2xl border border-[#e5e5e5] p-4 bg-[#fafafa] ${full ? 'md:col-span-2' : ''}`}>
      <p className="text-xs text-[#737373]">{label}</p>
      <p className="text-sm font-semibold text-[#171717] mt-1 whitespace-pre-wrap">{value || '-'}</p>
    </div>
  );
}
