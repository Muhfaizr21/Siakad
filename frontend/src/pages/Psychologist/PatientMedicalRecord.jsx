import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const ArrowLeft = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>arrow_back</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;



export default function PatientMedicalRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newRecord, setNewRecord] = useState({
    complaint: '',
    observation: '',
    recommendation: '',
    mood: 'Stabil',
    tujuan_pemeriksaan: '',
    tanggal_asesmen: new Date().toISOString().split('T')[0],
    riwayat_keluhan: '',
    aspek_kognitif: '',
    aspek_emosional: '',
    aspek_perilaku: '',
    rekomendasi_mahasiswa: '',
    rekomendasi_prodi: '',
    rekomendasi_orang_tua: '',
    tindak_lanjut_tuntas: false,
    tindak_lanjut_lanjutan: false,
    tindak_lanjut_rujuk: false,
    kesimpulan: ''
  });

  const [records, setRecords] = useState([]);
  const [patient, setPatient] = useState({ id, name: 'Memuat...', nim: '-', faculty: '-', color: 'bg-primary', initials: '-', status: 'Baru', totalSessions: 0 });

  useEffect(() => {
    let ignore = false;
    psychologistService.getMedicalRecord(id).then((res) => {
      if (!ignore) {
        setPatient(res.data.patient);
        setRecords(res.data.records || []);
      }
    });
    return () => { ignore = true; };
  }, [id]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    const observationCombined = `Kognitif: ${newRecord.aspek_kognitif}\nEmosional: ${newRecord.aspek_emosional}\nPerilaku: ${newRecord.aspek_perilaku}`;
    const recommendationCombined = `Mhs: ${newRecord.rekomendasi_mahasiswa}\nProdi: ${newRecord.rekomendasi_prodi}\nOrangTua: ${newRecord.rekomendasi_orang_tua}`;

    await psychologistService.createSessionNote(id, {
      ...newRecord,
      complaint: newRecord.riwayat_keluhan || newRecord.complaint,
      observation: observationCombined,
      recommendation: recommendationCombined,
      type: 'Konseling Baru',
      status: newRecord.tindak_lanjut_tuntas ? 'Selesai' : newRecord.mood,
      ...(bookingId ? { booking_id: Number(bookingId) } : {}),
    });
    const res = await psychologistService.getMedicalRecord(id);
    setPatient(res.data.patient);
    setRecords(res.data.records || []);
    setIsModalOpen(false);
    if (bookingId) setSearchParams({});
    setNewRecord({
      complaint: '',
      observation: '',
      recommendation: '',
      mood: 'Stabil',
      tujuan_pemeriksaan: '',
      tanggal_asesmen: new Date().toISOString().split('T')[0],
      riwayat_keluhan: '',
      aspek_kognitif: '',
      aspek_emosional: '',
      aspek_perilaku: '',
      rekomendasi_mahasiswa: '',
      rekomendasi_prodi: '',
      rekomendasi_orang_tua: '',
      tindak_lanjut_tuntas: false,
      tindak_lanjut_lanjutan: false,
      tindak_lanjut_rujuk: false,
      kesimpulan: ''
    });
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className={UI.layout.canvas}>
          
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-6">
             <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all group"
             >
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Daftar Pasien</span>
             </button>
             <div className="flex gap-2">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                   <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >add</span> Tambah Sesi
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Content: Medical History Timeline (Col 8) */}
            <div className="xl:col-span-8 space-y-6">
               <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-10">
                     <h3 className="text-sm font-black text-primary uppercase tracking-tight font-headline flex items-center gap-3">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >description</span> Riwayat Sesi Konseling
                     </h3>
                     <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Total: {patient.totalSessions} Sesi</div>
                  </div>

                  <div className="space-y-12 relative before:absolute before:left-[19px] before:top-4 before:bottom-0 before:w-[2px] before:bg-slate-50">
                     {records.map((record, index) => (
                       <div key={record.id} className="relative pl-12 group">
                          <div className={`absolute left-0 top-1.5 size-10 rounded-xl border-4 border-white shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${index === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                             <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >calendar_month</span>
                          </div>

                          <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 space-y-4 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">{record.date}</span>
                                   <span className="text-[10px] font-bold text-slate-300">•</span>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{record.time}</span>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${record.mood === 'Cemas' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                       Mood: {record.mood}
                                    </span>
                                    <button
                                       onClick={async () => {
                                          try {
                                             await psychologistService.downloadSessionNotePDF(record.id, patient.name);
                                          } catch (err) {
                                             alert(err.message || 'Gagal mengunduh PDF Sesi');
                                          }
                                       }}
                                       className="p-1.5 bg-white border border-slate-100 hover:border-primary/20 hover:text-primary rounded-lg text-slate-400 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                                       title="Download PDF Sesi Ini"
                                    >
                                       <Download size={12} />
                                    </button>
                                 </div>
                             </div>

                             <div className="space-y-4">
                                 {record.tujuan_pemeriksaan && (
                                    <div className="bg-[#00236F]/5 border border-[#00236F]/10 rounded-2xl p-4">
                                       <p className="text-[8px] font-black text-[#00236F] uppercase tracking-widest">Tujuan Pemeriksaan / Tanggal Asesmen</p>
                                       <p className="text-xs font-bold text-slate-800 mt-0.5">
                                          {record.tujuan_pemeriksaan} {record.tanggal_asesmen ? ` • Tanggal Asesmen: ${new Date(record.tanggal_asesmen).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                                       </p>
                                    </div>
                                 )}

                                 <div>
                                    <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-1">Riwayat Keluhan</h4>
                                    <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                       {record.riwayat_keluhan || record.complaint}
                                    </p>
                                 </div>

                                 {/* Aspek Asesmen Klinis */}
                                 {(record.aspek_kognitif || record.aspek_emosional || record.aspek_perilaku) && (
                                    <div className="pt-4 border-t border-slate-100">
                                       <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>psychology</span> Aspek Asesmen Klinis
                                       </h4>
                                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Kognitif</p>
                                             <p className="text-[11px] font-medium text-slate-700 whitespace-pre-line leading-relaxed">{record.aspek_kognitif || '-'}</p>
                                          </div>
                                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Emosional</p>
                                             <p className="text-[11px] font-medium text-slate-700 whitespace-pre-line leading-relaxed">{record.aspek_emosional || '-'}</p>
                                          </div>
                                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Perilaku</p>
                                             <p className="text-[11px] font-medium text-slate-700 whitespace-pre-line leading-relaxed">{record.aspek_perilaku || '-'}</p>
                                          </div>
                                       </div>
                                    </div>
                                 )}

                                 {/* Rekomendasi Grid */}
                                 {(record.rekomendasi_mahasiswa || record.rekomendasi_prodi || record.rekomendasi_orang_tua || record.recommendation) && (
                                    <div className="pt-4 border-t border-slate-100">
                                       <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>reviews</span> Rekomendasi Hasil Konseling
                                       </h4>
                                       {record.rekomendasi_mahasiswa || record.rekomendasi_prodi || record.rekomendasi_orang_tua ? (
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                             <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Mahasiswa</p>
                                                <p className="text-[11px] font-medium text-slate-700 whitespace-pre-line leading-relaxed">{record.rekomendasi_mahasiswa || '-'}</p>
                                             </div>
                                             <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Program Studi</p>
                                                <p className="text-[11px] font-medium text-slate-700 whitespace-pre-line leading-relaxed">{record.rekomendasi_prodi || '-'}</p>
                                             </div>
                                             <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Orang Tua / Wali</p>
                                                <p className="text-[11px] font-medium text-slate-700 whitespace-pre-line leading-relaxed">{record.rekomendasi_orang_tua || '-'}</p>
                                             </div>
                                          </div>
                                       ) : (
                                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                             <p className="text-[11px] font-medium text-slate-700 leading-relaxed">{record.recommendation}</p>
                                          </div>
                                       )}
                                    </div>
                                 )}

                                 {/* Tindak Lanjut & Kesimpulan */}
                                 <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                       <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tindak Lanjut</h4>
                                       <div className="flex flex-col gap-1.5">
                                          <div className="flex items-center gap-2">
                                             <span className={`material-symbols-outlined text-sm font-bold ${record.tindak_lanjut_tuntas ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                {record.tindak_lanjut_tuntas ? 'check_circle' : 'cancel'}
                                             </span>
                                             <span className={`text-[10px] font-black uppercase tracking-widest ${record.tindak_lanjut_tuntas ? 'text-slate-800' : 'text-slate-400'}`}>Sesi Tuntas</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                             <span className={`material-symbols-outlined text-sm font-bold ${record.tindak_lanjut_lanjutan ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                {record.tindak_lanjut_lanjutan ? 'check_circle' : 'cancel'}
                                             </span>
                                             <span className={`text-[10px] font-black uppercase tracking-widest ${record.tindak_lanjut_lanjutan ? 'text-slate-800' : 'text-slate-400'}`}>Jadwal Konseling Lanjutan</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                             <span className={`material-symbols-outlined text-sm font-bold ${record.tindak_lanjut_rujuk ? 'text-[#00236F]' : 'text-slate-300'}`}>
                                                {record.tindak_lanjut_rujuk ? 'check_circle' : 'cancel'}
                                             </span>
                                             <span className={`text-[10px] font-black uppercase tracking-widest ${record.tindak_lanjut_rujuk ? 'text-slate-800' : 'text-slate-400'}`}>Rujuk Klinis</span>
                                          </div>
                                       </div>
                                    </div>
                                    {record.kesimpulan && (
                                       <div>
                                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                             <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>summarize</span> Kesimpulan
                                          </h4>
                                          <p className="text-[11px] font-semibold text-slate-700 leading-relaxed bg-[#00236F]/5 border border-[#00236F]/10 rounded-2xl p-4 italic">
                                             "{record.kesimpulan}"
                                          </p>
                                       </div>
                                    )}
                                 </div>
                              </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Right Sidebar... */}
            <div className="xl:col-span-4 space-y-6">
               <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="h-20 bg-primary relative">
                     <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-indigo-600"></div>
                     <span className="material-symbols-outlined absolute -right-4 -bottom-4 size-24 text-white/10" >show_chart</span>
                  </div>
                  <div className="px-6 pb-6 -mt-8 relative z-10">
                     <div className={`size-16 rounded-2xl ${patient.color} border-4 border-white shadow-lg flex items-center justify-center text-white text-xl font-black mb-4 mx-auto md:mx-0`}>
                        {patient.initials}
                     </div>
                     <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{patient.name}</h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{patient.nim} • {patient.faculty}</p>
                     
                     <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                           <p className="text-xs font-black text-emerald-600 uppercase mt-0.5">{patient.status}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sesi</p>
                           <p className="text-xs font-black text-primary uppercase mt-0.5">{patient.totalSessions} Kali</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                     <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >trending_up</span> Analitik Kesehatan
                  </h3>
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kepatuhan Rekomendasi</span>
                           <span className="text-[10px] font-black text-primary">85%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-primary rounded-full w-[85%]"></div>
                        </div>
                     </div>
                     <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                           <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >error</span>
                           <span className="text-[9px] font-black uppercase tracking-widest">Catatan Penting</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-600 leading-relaxed uppercase">
                           Mahasiswa menunjukkan peningkatan signifikan dalam mengelola kecemasan akademik setelah 3 sesi terakhir.
                        </p>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 p-6 rounded-3xl shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                           <span className="material-symbols-outlined" style={{ fontSize: '20px' }} Check >security</span>
                        </div>
                        <h4 className="text-white text-[10px] font-black uppercase tracking-widest">Data Terenkripsi</h4>
                     </div>
                     <p className="text-slate-400 text-[9px] font-medium uppercase tracking-wide leading-relaxed">
                        Seluruh catatan rekam medis ini dilindungi oleh standar privasi data kesehatan (HIPAA-compliant).
                     </p>
                  </div>
                  <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-white/5 group-hover:text-white/10 transition-colors" style={{ fontSize: '120px' }} Check >security</span>
               </div>
            </div>
          </div>
        </div>

        {/* --- ADD SESSION MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
            
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
               <div className="bg-primary p-6 text-white flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight font-headline">Tambah Sesi Baru (Asesmen & Rekomendasi)</h3>
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-0.5">{bookingId ? `Terhubung ke booking #${bookingId}` : 'Form Asesmen dan Rekomendasi Hasil Konseling'}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >close</span>
                  </button>
               </div>

               <form onSubmit={handleAddRecord} className="p-8 overflow-y-auto flex-1 space-y-6">
                  {/* Data Diri Mahasiswa Section */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6">
                     <h4 className="text-[10px] font-black text-[#00236F] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">badge</span> Data Diri Mahasiswa (Auto-Populated)
                     </h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-[11px] font-medium text-slate-600">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Nama Klien</p>
                           <p className="font-bold text-slate-900">{patient.name || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">NPM / NIM</p>
                           <p className="font-bold text-slate-900">{patient.nim || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Semester</p>
                           <p className="font-bold text-slate-900">{patient.semester || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">IPK</p>
                           <p className="font-bold text-slate-900">{patient.ipk !== undefined ? patient.ipk : '-'}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Program Studi</p>
                           <p className="font-bold text-slate-900">{patient.program_studi || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Dosen Wali</p>
                           <p className="font-bold text-slate-900">{patient.dosen_pa || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Jenis Kelamin</p>
                           <p className="font-bold text-slate-900">{patient.jenis_kelamin || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Tempat, Tanggal Lahir</p>
                           <p className="font-bold text-slate-900">
                              {patient.tempat_lahir || '-'}{patient.tanggal_lahir && patient.tanggal_lahir !== '-' ? `, ${(() => {
                                 try {
                                    const d = new Date(patient.tanggal_lahir);
                                    if (isNaN(d.getTime())) return patient.tanggal_lahir;
                                    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                                 } catch {
                                    return patient.tanggal_lahir;
                                 }
                              })()}` : ''}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Section 1: Informasi Asesmen */}
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-slate-100 pb-2">I. Informasi Asesmen</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Tujuan Pemeriksaan</label>
                           <input 
                             required
                             value={newRecord.tujuan_pemeriksaan}
                             onChange={(e) => setNewRecord({...newRecord, tujuan_pemeriksaan: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                             placeholder="Misal: Evaluasi Layanan Konseling Akademik"
                           />
                        </div>
                        <div>
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Tanggal Asesmen</label>
                           <input 
                             required
                             type="date"
                             value={newRecord.tanggal_asesmen}
                             onChange={(e) => setNewRecord({...newRecord, tanggal_asesmen: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Riwayat Keluhan</label>
                        <textarea 
                          required
                          value={newRecord.riwayat_keluhan}
                          onChange={(e) => setNewRecord({...newRecord, riwayat_keluhan: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none h-20 resize-none"
                          placeholder="Deskripsikan riwayat keluhan pasien..."
                        />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Aspek Kognitif</label>
                           <textarea 
                             required
                             value={newRecord.aspek_kognitif}
                             onChange={(e) => setNewRecord({...newRecord, aspek_kognitif: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none h-24 resize-none"
                             placeholder="Observasi aspek kognitif..."
                           />
                        </div>
                        <div>
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Aspek Emosional</label>
                           <textarea 
                             required
                             value={newRecord.aspek_emosional}
                             onChange={(e) => setNewRecord({...newRecord, aspek_emosional: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none h-24 resize-none"
                             placeholder="Observasi aspek emosional..."
                           />
                        </div>
                        <div>
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Aspek Perilaku</label>
                           <textarea 
                             required
                             value={newRecord.aspek_perilaku}
                             onChange={(e) => setNewRecord({...newRecord, aspek_perilaku: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none h-24 resize-none"
                             placeholder="Observasi aspek perilaku..."
                           />
                        </div>
                     </div>
                  </div>

                  {/* Section 2: Rekomendasi Layanan */}
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-slate-100 pb-2">II. Rekomendasi Layanan</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Rekomendasi Mahasiswa</label>
                           <textarea 
                             required
                             value={newRecord.rekomendasi_mahasiswa}
                             onChange={(e) => setNewRecord({...newRecord, rekomendasi_mahasiswa: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none h-24 resize-none"
                             placeholder="Rekomendasi bagi mahasiswa..."
                           />
                        </div>
                        <div>
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Rekomendasi Program Studi</label>
                           <textarea 
                             required
                             value={newRecord.rekomendasi_prodi}
                             onChange={(e) => setNewRecord({...newRecord, rekomendasi_prodi: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none h-24 resize-none"
                             placeholder="Rekomendasi bagi Prodi..."
                           />
                        </div>
                        <div>
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Rekomendasi Orang Tua/Wali</label>
                           <textarea 
                             required
                             value={newRecord.rekomendasi_orang_tua}
                             onChange={(e) => setNewRecord({...newRecord, rekomendasi_orang_tua: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none h-24 resize-none"
                             placeholder="Rekomendasi bagi Orang tua..."
                           />
                        </div>
                     </div>
                  </div>

                  {/* Section 3: Tindak Lanjut & Kesimpulan */}
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-slate-100 pb-2">III. Tindak Lanjut & Kesimpulan</h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-200/60 rounded-3xl p-5">
                        <div className="flex flex-col gap-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">1. Sesi Tuntas</label>
                           <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setNewRecord({ ...newRecord, tindak_lanjut_tuntas: true })}
                                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${newRecord.tindak_lanjut_tuntas ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
                              >
                                Ya
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewRecord({ ...newRecord, tindak_lanjut_tuntas: false })}
                                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!newRecord.tindak_lanjut_tuntas ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
                              >
                                Tidak
                              </button>
                           </div>
                        </div>

                        <div className="flex flex-col gap-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">2. Konseling Lanjutan</label>
                           <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setNewRecord({ ...newRecord, tindak_lanjut_lanjutan: true })}
                                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${newRecord.tindak_lanjut_lanjutan ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
                              >
                                Ya
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewRecord({ ...newRecord, tindak_lanjut_lanjutan: false })}
                                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!newRecord.tindak_lanjut_lanjutan ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
                              >
                                Tidak
                              </button>
                           </div>
                        </div>

                        <div className="flex flex-col gap-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">3. Rujuk Klinis</label>
                           <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setNewRecord({ ...newRecord, tindak_lanjut_rujuk: true })}
                                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${newRecord.tindak_lanjut_rujuk ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
                              >
                                Ya
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewRecord({ ...newRecord, tindak_lanjut_rujuk: false })}
                                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!newRecord.tindak_lanjut_rujuk ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
                              >
                                Tidak
                              </button>
                           </div>
                        </div>
                     </div>

                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Kesimpulan</label>
                        <textarea 
                          required
                          value={newRecord.kesimpulan}
                          onChange={(e) => setNewRecord({...newRecord, kesimpulan: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none h-20 resize-none"
                          placeholder="Tulis kesimpulan umum asesmen konseling..."
                        />
                     </div>

                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Status Mood / Kondisi Emosional Saat Sesi</label>
                        <div className="flex flex-wrap gap-2">
                           {['Stabil', 'Cemas', 'Depresi', 'Netral', 'Membaik'].map((m) => (
                             <button
                               type="button"
                               key={m}
                               onClick={() => setNewRecord({...newRecord, mood: m})}
                               className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${newRecord.mood === m ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
                             >
                               {m}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Batal</button>
                     <button type="submit" className="flex-2 bg-primary text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >save</span> Simpan Catatan Asesmen
                     </button>
                  </div>
               </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

