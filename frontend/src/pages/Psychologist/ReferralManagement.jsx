import { useEffect, useState } from 'react';
import { psychologistService } from '../../services/api';
import { toast } from 'react-hot-toast';

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
    'Pending': {
      bg: 'color-mix(in srgb, var(--theme-warning) 10%, transparent)',
      border: 'color-mix(in srgb, var(--theme-warning) 20%, transparent)',
      text: 'var(--theme-warning)',
      badgeBg: 'color-mix(in srgb, var(--theme-warning) 15%, transparent)',
    },
    'Sent': {
      bg: 'color-mix(in srgb, var(--theme-info) 10%, transparent)',
      border: 'color-mix(in srgb, var(--theme-info) 20%, transparent)',
      text: 'var(--theme-info)',
      badgeBg: 'color-mix(in srgb, var(--theme-info) 15%, transparent)',
    },
    'Received': {
      bg: 'color-mix(in srgb, var(--theme-success) 10%, transparent)',
      border: 'color-mix(in srgb, var(--theme-success) 20%, transparent)',
      text: 'var(--theme-success)',
      badgeBg: 'color-mix(in srgb, var(--theme-success) 15%, transparent)',
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

  const handleSendReferral = async (referralId) => {
    try {
      await psychologistService.sendReferral(referralId);
      await loadReferrals();
      toast.success('Surat rujukan berhasil dikirim');
    } catch (err) {
      toast.error('Gagal mengirim surat rujukan: ' + err.message);
    }
  };

  const handleConfirmReceived = async (referralId) => {
    try {
      await psychologistService.confirmReferralReceived(referralId);
      await loadReferrals();
      toast.success('Penerimaan surat rujukan dikonfirmasi');
    } catch (err) {
      toast.error('Gagal mengkonfirmasi penerimaan: ' + err.message);
    }
  };

  const filteredReferrals = referrals.filter(ref => 
    selectedStatus === 'Semua' || ref.status === selectedStatus
  );

  const getStatusLabel = (status) => {
    const labels = {
      'Pending': 'Menunggu Pengiriman',
      'Sent': 'Sudah Dikirim',
      'Received': 'Sudah Diterima',
    };
    return labels[status] || status;
  };

  return (
    <>
      <div className="w-full relative space-y-6 scroll-smooth">
          
          {/* ── Welcome Banner ─────────────────────────────────────────── */}
          <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col xl:flex-row xl:items-center gap-6 group shadow-sm border border-slate-200/60 bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-slate-50/80" />
            <div className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 left-20 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl" />

            <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm relative overflow-hidden">
                    <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '26px' }}>send</span>
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                        Tindak Lanjut
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                      Manajemen Surat Rujukan
                    </h1>
                    <p className="mt-2 text-xs md:text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
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
                className="bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex items-center gap-2 hover:shadow-primary/30 active:scale-95 border border-primary/20"
              >
                <span className="material-symbols-outlined text-[18px] shrink-0">add</span> Buat Rujukan Baru
              </button>
            </div>
          </section>

          {/* Status Filter Chips */}
          <div className="rounded-2xl border shadow-sm p-5 space-y-5" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
            <div className="flex flex-wrap gap-2">
              {['Semua', 'Pending', 'Sent', 'Received'].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                    selectedStatus === status
                      ? 'shadow-md'
                      : 'bg-slate-50 text-slate-400 border border-slate-100/50 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                  style={selectedStatus === status ? { backgroundColor: 'var(--theme-primary)', color: 'white' } : {}}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Referrals List Card */}
          <section className="rounded-2xl border shadow-sm p-5" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-base shrink-0">list</span> Daftar Surat Rujukan
                </h3>
                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                  Total: {filteredReferrals.length} data
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Memuat data...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined text-rose-400 text-4xl mb-3 shrink-0">error</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{error}</p>
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
                <div className="flex w-20 h-20 items-center justify-center rounded-[1.5rem] bg-slate-50 border border-slate-100 text-slate-300">
                  <span className="material-symbols-outlined text-[40px]">inbox</span>
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-slate-800 font-headline">Tidak ada rujukan</h3>
                  <p className="mt-1.5 text-sm font-medium text-slate-500">Belum ada data surat rujukan yang dibuat.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReferrals.map((referral) => {
                  const statusStyle = statusColors[referral.status] || statusColors['Pending'];
                  return (
                    <div 
                      key={referral.id} 
                      className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-primary/40 bg-white transition-all duration-300 group hover:shadow-md hover:shadow-primary/5"
                    >
                      {/* Left: Patient Info */}
                      <div className="flex items-center gap-3 lg:w-[280px] shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0 overflow-hidden relative`}
                          style={{ backgroundColor: statusStyle.badgeBg, color: statusStyle.text }}
                        >
                          {referral.foto_url || referral.foto ? (
                            <img src={referral.foto_url || referral.foto} alt={referral.mahasiswa_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 text-[20px] shrink-0">person</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-slate-900 group-hover:text-primary transition-colors">{referral.mahasiswa_name}</p>
                          <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-widest text-slate-500">{referral.tipe} • {referral.pihak_tujuan}</p>
                        </div>
                      </div>
                      
                      {/* Middle: Details */}
                      <div className="flex-1 min-w-0 lg:px-4 lg:border-l border-slate-100 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[14px] shrink-0">description</span>
                          </span>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Alasan Rujukan</p>
                            <p className="text-[11px] font-black text-slate-700 mt-0.5 line-clamp-1">{referral.alasan}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Status & Action */}
                      <div className="flex flex-row items-center justify-between lg:justify-end gap-5 lg:shrink-0">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
                        >
                          {getStatusLabel(referral.status)}
                        </span>
                        
                        <div className="flex gap-2 shrink-0">
                          {referral.status === 'Pending' && (
                            <button
                              onClick={() => handleSendReferral(referral.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                              style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
                              title="Kirim Rujukan"
                            >
                              <span className="material-symbols-outlined text-[16px]">send</span>
                            </button>
                          )}
                          {referral.status === 'Sent' && (
                            <button
                              onClick={() => handleConfirmReceived(referral.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                              style={{ backgroundColor: 'var(--theme-success)', color: 'white' }}
                              title="Konfirmasi Terima"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            </button>
                          )}
                          {referral.surat_rujukan_url && (
                            <button
                              onClick={async () => {
                                try {
                                  await psychologistService.downloadReferralPDF(referral.id);
                                } catch (err) {
                                  toast.error('Gagal download PDF: ' + err.message);
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:text-primary hover:bg-primary/5 transition-all duration-300 border border-slate-100/50"
                              title="Download PDF"
                            >
                              <span className="material-symbols-outlined text-[16px]">download</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* --- CREATE REFERRAL MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
              onClick={() => setIsModalOpen(false)}
            ></div>
            
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
              <div className="p-5 text-white flex justify-between items-center relative overflow-hidden" style={{ backgroundColor: 'var(--theme-primary)' }}>
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-sm font-black uppercase tracking-tight font-headline">Surat Rujukan Baru</h3>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-0.5">Buat Rujukan untuk Pasien</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors relative z-10"
                >
                  <span className="material-symbols-outlined text-base shrink-0">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateReferral} className="p-5 space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Pilih Pasien</label>
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
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)/5] transition-all outline-none"
                      />
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base shrink-0">search</span>
                    </div>

                    {showDropdown && (
                      <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                        {mahasiswaList.filter(m => {
                          const str = `${m.nama || m.name} ${m.nim || m.id}`.toLowerCase();
                          return str.includes(searchQuery.toLowerCase());
                        }).map((maba) => (
                          <div 
                            key={maba.id} 
                            onClick={async () => {
                              setNewReferral({ ...newReferral, ...newReferral, mahasiswa_id: maba.id });
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
                            className={`px-4 py-3 cursor-pointer text-xs transition-colors hover:bg-slate-50 ${newReferral.mahasiswa_id === maba.id
                            ? 'font-bold'
                            : 'text-slate-600 font-medium'}
                        border-b border-slate-50 last:border-0`}
                        style={newReferral.mahasiswa_id === maba.id ? { backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)', color: 'var(--theme-primary)' } : {}}
                          >
                            {maba.nama || maba.name} <span className="text-[10px] text-slate-400 ml-1">({maba.nim || maba.id})</span>
                          </div>
                        ))}
                        {mahasiswaList.filter(m => {
                          const str = `${m.nama || m.name} ${m.nim || m.id}`.toLowerCase();
                          return str.includes(searchQuery.toLowerCase());
                        }).length === 0 && (
                          <div className="px-4 py-4 text-center text-xs text-slate-400 italic">
                            Pasien tidak ditemukan
                          </div>
                        )}
                      </div>
                    )}

                    {newReferral.mahasiswa_id && (
                      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 mt-2 max-h-48 overflow-y-auto">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                           <span className="material-symbols-outlined text-sm shrink-0">history</span> Riwayat Sesi Konseling
                        </p>
                        {loadingHistory ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          </div>
                        ) : selectedPatientHistory.length === 0 ? (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide text-center py-2">Tidak ada riwayat konseling</p>
                        ) : (
                          <div className="space-y-3">
                            {selectedPatientHistory.map((item, idx) => (
                              <div key={item.id || idx} className="border-b border-slate-200/40 last:border-0 pb-2.5 last:pb-0">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-wider">{item.date}</span>
                                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)', color: 'var(--theme-primary)' }}>{item.type}</span>
                                </div>
                                <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                                  <span className="font-bold text-slate-700">Keluhan:</span> {item.complaint || '-'}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">
                                  <span className="font-bold text-slate-600">Rekomendasi:</span> {item.recommendation || '-'}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Tipe Rujukan</label>
                    <select 
                      value={newReferral.tipe}
                      onChange={(e) => setNewReferral({ ...newReferral, tipe: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)/5] transition-all outline-none cursor-pointer"
                    >
                      <option value="Medis">Medis</option>
                      <option value="Akademik">Akademik</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Alasan Rujukan</label>
                    <textarea 
                      required
                      value={newReferral.alasan}
                      onChange={(e) => setNewReferral({ ...newReferral, alasan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)/5] transition-all outline-none h-24 resize-none"
                      placeholder="Jelaskan alasan rujukan..."
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Pihak Tujuan</label>
                    <input 
                      required
                      type="text"
                      value={newReferral.pihak_tujuan}
                      onChange={(e) => setNewReferral({ ...newReferral, pihak_tujuan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)/5] transition-all outline-none"
                      placeholder="Nama klinik/psikolog tujuan"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Email Tujuan</label>
                    <input 
                      required
                      type="email"
                      value={newReferral.email_tujuan}
                      onChange={(e) => setNewReferral({ ...newReferral, email_tujuan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)/5] transition-all outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 py-4 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    <span className="material-symbols-outlined text-base shrink-0">save</span> Buat Rujukan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
  );
}
