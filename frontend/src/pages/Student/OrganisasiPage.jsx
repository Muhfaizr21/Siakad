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
  const daftarMutation = useDaftarOrmawaMutation();

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
    daftarMutation.mutate({
      ormawa_id: selectedDaftarOrg.id || selectedDaftarOrg.ID,
      divisi: divisiPilihan
    }, {
      onSuccess: () => {
        toast.success(`Berhasil mengirim pendaftaran ke ${selectedDaftarOrg.Nama}!`);
        setSelectedDaftarOrg(null);
        setDivisiPilihan('');
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
                      <span className="px-2 py-0.5 rounded bg-[#EAF1FF] text-[#0B4FAE] text-[10px] font-black uppercase tracking-wide border border-[#C9D8FF]/35">
                        {org.Kategori || 'Organisasi'}
                      </span>
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
                    <button
                      onClick={() => setSelectedDaftarOrg(org)}
                      className="px-4 py-2 rounded-xl bg-[#00236F] text-white text-xs font-bold hover:bg-[#0B4FAE] transition-colors"
                    >
                      Daftar Sekarang
                    </button>
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
                            {app.Divisi || 'Umum'}
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
      {selectedDaftarOrg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden border border-[#e5e5e5] shadow-2xl flex flex-col animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="bg-[#00236F] text-white p-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Pendaftaran Anggota</p>
                <h3 className="text-lg font-extrabold mt-1">{selectedDaftarOrg.Nama}</h3>
              </div>
              <button
                onClick={() => setSelectedDaftarOrg(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-[#171717] uppercase tracking-widest block">Divisi Pilihan</label>
                <input
                  type="text"
                  placeholder="Contoh: Humas, PSDM, Acara, Media"
                  value={divisiPilihan}
                  onChange={(e) => setDivisiPilihan(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-bold text-sm focus:outline-none focus:border-bku-primary focus:ring-4 focus:ring-bku-primary/10 transition-all outline-none"
                  required
                />
              </div>

              <div className="p-4 bg-[#EAF1FF] border border-[#C9D8FF] rounded-xl flex gap-3 text-xs text-[#0B4FAE] font-medium leading-relaxed">
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: 16 }}>info</span>
                <span>Pendaftaran Anda akan ditinjau oleh Admin Ormawa yang bersangkutan. Status pendaftaran dapat dipantau di tab "Status Pendaftaran".</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDaftarOrg(null)}
                  className="flex-1 py-3 bg-white border border-[#e5e5e5] text-[#a3a3a3] font-black rounded-xl hover:bg-[#fafafa] transition-all uppercase tracking-wide text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={daftarMutation.isPending}
                  className="flex-1 py-3 bg-[#00236F] text-white font-black rounded-xl hover:bg-[#0B4FAE] transition-all text-xs uppercase tracking-wide flex items-center justify-center gap-1.5"
                >
                  {daftarMutation.isPending ? 'Mengirim...' : 'Kirim Pendaftaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
