import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { tenagaKesehatanService, rujukanService, fetchBlobWithAuth } from '../../services/api';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';
import toast from 'react-hot-toast';

const BackIcon = () => <span className="material-symbols-outlined text-sm">arrow_back</span>;
const HistoryIcon = () => <span className="material-symbols-outlined text-sm">history</span>;
const AddIcon = () => <span className="material-symbols-outlined text-sm">add_circle</span>;
const AlertIcon = () => <span className="material-symbols-outlined text-base">warning</span>;
const CriticalIcon = () => <span className="material-symbols-outlined text-base">emergency</span>;

export default function PatientMedicalRecord() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Booking references
  const bookingId = searchParams.get('booking_id');
  const openNewScreeningDefault = searchParams.get('new_screening') === 'true' || !!bookingId;

  // View States
  const [activeTab, setActiveTab] = useState(openNewScreeningDefault ? 'new' : 'history');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);

  // Form States
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jenisPemeriksaan, setJenisPemeriksaan] = useState('Pemeriksaan Reguler');
  const [tinggiBadan, setTinggiBadan] = useState(170);
  const [beratBadan, setBeratBadan] = useState(60);
  const [sistole, setSistole] = useState(120);
  const [diastole, setDiastole] = useState(80);
  const [gulaDarah, setGulaDarah] = useState(90);
  const [butaWarna, setButaWarna] = useState('Normal');
  const [riwayatPenyakit, setRiwayatPenyakit] = useState('');
  const [golonganDarah, setGolonganDarah] = useState('O');
  const [sumber, setSumber] = useState('klinik_kampus');
  
  // Vitals
  const [suhuTubuh, setSuhuTubuh] = useState(36.5);
  const [denyutNadi, setDenyutNadi] = useState(80);
  const [spO2, setSpO2] = useState(98);
  const [skalaNyeri, setSkalaNyeri] = useState(0);
  const [alergiObat, setAlergiObat] = useState('');
  const [kondisiPsikologis, setKondisiPsikologis] = useState('Normal');
  const [konsumsiObat, setKonsumsiObat] = useState('');
  
  // Treatment & Recommendations
  const [tindakanDiberikan, setTindakanDiberikan] = useState('');
  const [obatDiberikan, setObatDiberikan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [hasil, setHasil] = useState('Layak Kegiatan'); // Layak Kegiatan / Perlu Perhatian / Tidak Layak
  const [rekomendasi, setRekomendasi] = useState('');

  // Escalation Checkboxes
  const [eskalasiPsikolog, setEskalasiPsikolog] = useState(false);
  
  // Psikolog Escalation Data
  const [psychologists, setPsychologists] = useState([]);
  const [psikologId, setPsikologId] = useState('');
  const [psikologSchedules, setPsikologSchedules] = useState([]);
  const [psikologSlotId, setPsikologSlotId] = useState(null);
  
  // Rujukan Medis Form States
  const [eskalasiFaskes, setEskalasiFaskes] = useState(false);
  const [faskesTujuan, setFaskesTujuan] = useState('Klinik UBK');
  const [faskesTujuanLainnya, setFaskesTujuanLainnya] = useState('');
  const [alasanRujukan, setAlasanRujukan] = useState('Penanganan Lanjutan');
  const [alasanRujukanLainnya, setAlasanRujukanLainnya] = useState('');
  const [diagnosisSementara, setDiagnosisSementara] = useState('');
  const [keluhanUtama, setKeluhanUtama] = useState('');
  const [rekomendasiAsuransi, setRekomendasiAsuransi] = useState('BKU_Assurance');
  
  const [submitting, setSubmitting] = useState(false);

  const handleMarkAsDone = async () => {
    if (!bookingId) return;
    if (!window.confirm("Yakin ingin menandai sesi ini sebagai Selesai tanpa menyimpan/update rekam medis tambahan?")) return;
    setSubmitting(true);
    try {
      await tenagaKesehatanService.updateBookingStatus(bookingId, 'Selesai');
      toast.success('Sesi berhasil ditandai selesai');
      setTimeout(() => navigate('/tenagakes/dashboard'), 1500);
    } catch (err) {
      toast.error('Gagal menyelesaikan sesi');
    } finally {
      setSubmitting(false);
    }
  };

  const loadData = () => {
    setLoading(true);
    tenagaKesehatanService.getMedicalRecord(id)
      .then((res) => {
        setPatient(res.data?.patient || null);
        setRecords(res.data?.records || []);
        
        // Prefill golongan darah if exists in student database
        if (res.data?.patient?.golongan_darah) {
          setGolonganDarah(res.data.patient.golongan_darah);
        }
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat rekam medis mahasiswa.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (eskalasiPsikolog && psychologists.length === 0) {
      tenagaKesehatanService.getPsychologists().then(res => {
        setPsychologists(res.data || []);
      }).catch(err => console.error("Gagal memuat psikolog", err));
    }
  }, [eskalasiPsikolog]);

  useEffect(() => {
    if (psikologId) {
      tenagaKesehatanService.getPsychologistSchedules(psikologId).then(res => {
        setPsikologSchedules(res.data?.slots || []);
        setPsikologSlotId(null);
      }).catch(err => console.error("Gagal memuat jadwal", err));
    } else {
      setPsikologSchedules([]);
      setPsikologSlotId(null);
    }
  }, [psikologId]);

  // Calculate BMI dynamically
  const bmi = useMemo(() => {
    const heightInMeter = tinggiBadan / 100;
    if (heightInMeter <= 0) return 0;
    return Number((beratBadan / (heightInMeter * heightInMeter)).toFixed(1));
  }, [tinggiBadan, beratBadan]);

  // BMI status label
  const bmiStatus = useMemo(() => {
    if (bmi <= 0) return '';
    if (bmi < 18.5) return 'Underweight (Kurus)';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight (Gemuk)';
    return 'Obese (Obesitas)';
  }, [bmi]);

  // Auto Warning Triggers based on Vitals
  const vitalsWarnings = useMemo(() => {
    const warnings = [];
    
    // Suhu Tubuh warnings
    if (suhuTubuh > 38.0) {
      warnings.push({
        type: 'danger',
        message: '🚨 Suhu tubuh sangat tinggi (>38.0°C). Pasien terindikasi demam tinggi (Kritis).'
      });
    } else if (suhuTubuh > 37.5) {
      warnings.push({
        type: 'warning',
        message: '⚠️ Suhu tubuh di atas batas normal (>37.5°C). Pantau kondisi pasien.'
      });
    }

    // SpO2 warnings
    if (spO2 < 92) {
      warnings.push({
        type: 'danger',
        message: '🚨 Saturasi Oksigen kritis (<92%). Indikasi hipoksia berat!'
      });
    } else if (spO2 < 95) {
      warnings.push({
        type: 'warning',
        message: '⚠️ Saturasi Oksigen rendah (<95%). Pantau pernapasan pasien.'
      });
    }

    // Blood Pressure warnings
    if (sistole >= 140 || diastole >= 90) {
      warnings.push({
        type: 'danger',
        message: '🚨 Tekanan darah tergolong Hipertensi Tingkat 1/2 (≥140/90 mmHg).'
      });
    } else if (sistole < 90 || diastole < 60) {
      warnings.push({
        type: 'warning',
        message: '⚠️ Tekanan darah tergolong Hipotensi (<90/60 mmHg).'
      });
    }

    // BMI Obese
    if (bmi >= 30) {
      warnings.push({
        type: 'warning',
        message: '⚠️ Indeks Massa Tubuh (IMT) menunjukkan status Obesitas (≥30.0).'
      });
    }

    return warnings;
  }, [suhuTubuh, spO2, sistole, diastole, bmi]);

  useEffect(() => {
    // Auto set Hasil if vitals are dangerous
    if (suhuTubuh > 38.0 || spO2 < 92) {
      setHasil('Tidak Layak');
    }
  }, [suhuTubuh, spO2]);

  useEffect(() => {
    // Auto check Psychologist if psychological state is set to "Perlu Rujukan Psikolog"
    if (kondisiPsikologis === 'Perlu Rujukan Psikolog') {
      setEskalasiPsikolog(true);
    }
  }, [kondisiPsikologis]);

  const handleSubmitScreening = async (e) => {
    e.preventDefault();
    
    // Auto set Hasil if conditions are critical
    let finalHasil = hasil;
    if (suhuTubuh > 38.0 || spO2 < 92) {
      finalHasil = 'Tidak Layak';
    }

    const payload = {
      tanggal,
      jenis_pemeriksaan: jenisPemeriksaan,
      tinggi_badan: Number(tinggiBadan),
      berat_badan: Number(beratBadan),
      sistole: Number(sistole),
      diastole: Number(diastole),
      gula_darah: Number(gulaDarah),
      buta_warna: butaWarna,
      riwayat_penyakit: riwayatPenyakit,
      golongan_darah: golonganDarah,
      suhu_tubuh: Number(suhuTubuh),
      denyut_nadi: Number(denyutNadi),
      spo2: Number(spO2),
      skala_nyeri: Number(skalaNyeri),
      alergi_obat: alergiObat,
      kondisi_psikologis: kondisiPsikologis,
      konsumsi_obat: konsumsiObat,
      tindakan_diberikan: tindakanDiberikan,
      obat_diberikan: obatDiberikan,
      catatan,
      hasil: finalHasil,
      rekomendasi,
      booking_id: bookingId ? Number(bookingId) : null,
      eskalasi_psikolog: eskalasiPsikolog,
      psikolog_id: eskalasiPsikolog && psikologId ? Number(psikologId) : undefined,
      psikolog_slot_id: eskalasiPsikolog && psikologId && psikologSlotId ? Number(psikologSlotId) : undefined,
      sumber: sumber,
    };

    setSubmitting(true);
    try {
      const screenRes = await tenagaKesehatanService.createScreening(id, payload);
      const createdScreeningId = screenRes.data?.id; // Assuming the API returns the created record

      // Create Rujukan Medis if checked
      if (eskalasiFaskes) {
        const finalFaskes = faskesTujuan === 'Lainnya' ? faskesTujuanLainnya : faskesTujuan;
        const finalAlasan = alasanRujukan === 'Lainnya' ? alasanRujukanLainnya : alasanRujukan;
        
        await rujukanService.createRujukan({
          self_screening_id: createdScreeningId,
          mahasiswa_id: patient?.id || Number(id),
          faskes_tujuan: finalFaskes,
          alasan_rujukan: finalAlasan,
          keluhan_utama: keluhanUtama,
          suhu_tubuh: Number(suhuTubuh),
          sistole: Number(sistole),
          diastole: Number(diastole),
          denyut_nadi: Number(denyutNadi),
          spo2: Number(spO2),
          diagnosis: diagnosisSementara,
          rekomendasi_asuransi: rekomendasiAsuransi
        });
      }

      alert('Pemeriksaan kesehatan berhasil disimpan!');
      
      // Reset form variables
      setRiwayatPenyakit('');
      setAlergiObat('');
      setTindakanDiberikan('');
      setObatDiberikan('');
      setCatatan('');
      setRekomendasi('');
      setEskalasiPsikolog(false);
      setEskalasiFaskes(false);
      setSumber('klinik_kampus');
      setDiagnosisSementara('');
      setKeluhanUtama('');
      setFaskesTujuan('Klinik UBK');
      setAlasanRujukan('Penanganan Lanjutan');
      
      // Load updated history list
      loadData();
      setActiveTab('history');
    } catch (err) {
      alert(err.message || 'Gagal menyimpan pemeriksaan.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusKesehatanColor = (status) => {
    if (!status) return 'bg-slate-100 text-slate-600 border-slate-200';
    const clean = status.toLowerCase();
    if (clean === 'kritis') return 'bg-rose-500/10 text-rose-600 border border-rose-500/25';
    if (clean === 'pantauan') return 'bg-amber-500/10 text-amber-600 border border-amber-500/25';
    return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25';
  };

  const handleDownloadPDF = async (recordId) => {
    const toastId = toast.loading('Menyiapkan PDF Rekam Medis...');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173/api';
      const blob = await fetchBlobWithAuth(`${API_URL}/tenagakes/medical-records/${recordId}/export-pdf`);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rekam_Medis_${recordId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Berhasil mengunduh PDF', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunduh PDF', { id: toastId });
    }
  };

  return (
    <PageContent>
      <DashboardHero
        title="Rekam Medis"
        highlightedTitle="Mahasiswa"
        subtitle="Riwayat pemeriksaan, screening fisik, dan konsultasi kesehatan mahasiswa"
        icon="medical_services"
        badges={[
          { label: 'Daftar Pasien', active: false },
        ]}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/tenagakes/patients')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50"
            >
              <BackIcon /> Kembali
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-bku-primary text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <HistoryIcon /> Riwayat
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'new'
                  ? 'bg-bku-primary text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AddIcon /> Screening Baru
            </button>
            {bookingId && (
              <button
                onClick={handleMarkAsDone}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span> Tandai Sesi Selesai
              </button>
            )}
          </div>
        }
      />

        {/* Patient Profile Header Card */}
        {patient && (
          <section className="rounded-2xl border border-slate-200/60 bg-white/70 p-5 shadow-sm glass-card">
            <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
              <div className="flex gap-4 items-center min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-bku-primary text-white border border-bku-primary/10 flex items-center justify-center font-black text-lg uppercase shrink-0">
                  {patient.nama ? patient.nama.slice(0, 2) : 'MH'}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{patient.nama}</h2>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">NIM {patient.nim}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{patient.ProgramStudi?.nama} ({patient.Fakultas?.nama})</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Semester {patient.semester_sekarang || '-'} | Gender: {patient.jenis_kelamin || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 shrink-0">
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Golongan Darah</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{patient.golongan_darah || 'O'}</p>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Alergi Obat</p>
                  <p className="text-xs font-bold text-rose-500 mt-1.5 truncate max-w-[90px]" title={patient.alergi_obat || '-'}>
                    {patient.alergi_obat || '-'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kontak Pasien</p>
                  <p className="text-[10px] font-bold text-slate-600 mt-1.5 truncate max-w-[90px]" title={patient.no_hp || '-'}>
                    {patient.no_hp || '-'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status Terakhir</p>
                  <span className={`inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    records.length > 0 
                      ? getStatusKesehatanColor(records[0].status_kesehatan) 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {records.length > 0 ? records[0].status_kesehatan : 'BARU'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Loading / Error state */}
        {loading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-400">
            <span className="material-symbols-outlined text-3xl animate-spin text-bku-primary/50">sync</span>
            <p className="text-[10px] font-black uppercase tracking-widest">Memuat rekam medis...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 bg-white/70 rounded-2xl border border-slate-200/60 glass-card">
            <p className="text-xs text-rose-500 font-bold">{error}</p>
          </div>
        )}

        {/* Tab 1: Medical History History */}
        {!loading && !error && activeTab === 'history' && (
          <section className="bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-6 glass-card">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-bku-primary font-headline">Riwayat Pemeriksaan Fisik</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">Daftar lengkap riwayat diagnosa dan tindakan medis pasien</p>
            </div>

            {records.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-2xl">
                <span className="material-symbols-outlined text-slate-300 text-3xl">medical_information</span>
                <h4 className="mt-4 text-xs font-black uppercase tracking-tight text-slate-700">Belum Ada Rekam Medis</h4>
                <p className="mt-1 max-w-sm text-xs font-semibold text-slate-500">Mahasiswa ini belum pernah melakukan screening fisik reguler di Klinik Kampus.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className="mt-4 rounded-xl bg-bku-primary px-4 py-2 text-xs font-bold text-white hover:bg-bku-hover transition-all"
                >
                  Mulai Screening Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((rec) => {
                  const checkupDate = rec.tanggal ? new Date(rec.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '-';

                  return (
                    <div 
                      key={rec.id}
                      className="border border-slate-200/60 rounded-2xl p-5 bg-slate-50/50 hover:bg-white transition-all duration-300 space-y-4"
                    >
                      {/* Visit Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/50 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-bku-primary text-base">local_hospital</span>
                          <div>
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{rec.jenis_pemeriksaan}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{checkupDate}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            rec.sumber === 'kencana_screening'
                              ? 'bg-purple-50 text-purple-600 border border-purple-200/50'
                              : rec.sumber === 'klinik_kampus'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            Sumber: {rec.sumber ? rec.sumber.replace(/_/g, ' ') : 'MANDIRI'}
                          </span>
                          {rec.diperiksa_oleh && (
                            <span className="text-[9px] font-bold text-slate-500 self-center">
                              by {rec.diperiksa_oleh}
                            </span>
                          )}
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${getStatusKesehatanColor(rec.status_kesehatan)}`}>
                            Kondisi: {rec.status_kesehatan}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            rec.hasil === 'Tidak Layak' 
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/25' 
                              : rec.hasil === 'Perlu Perhatian'
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/25'
                                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25'
                          }`}>
                            Hasil: {rec.hasil}
                          </span>
                          <button
                            onClick={() => handleDownloadPDF(rec.id)}
                            className="ml-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1 border border-indigo-200"
                          >
                            <span className="material-symbols-outlined text-xs">download</span> Unduh PDF
                          </button>
                        </div>
                      </div>

                      {/* Diagnostic details */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-semibold text-slate-600">
                        <div className="bg-white/80 p-3 rounded-xl border border-slate-200/50 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tinggi / Berat</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">{rec.tinggi_badan || '-'} cm / {rec.berat_badan || '-'} kg</p>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl border border-slate-200/50 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tensi Darah</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">{rec.sistole || '-'}/{rec.diastole || '-'} mmHg</p>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl border border-slate-200/50 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Suhu Tubuh</p>
                          <p className={`text-xs font-bold mt-1 ${rec.suhu_tubuh > 37.5 ? 'text-rose-500' : 'text-slate-700'}`}>
                            {rec.suhu_tubuh || '-'} °C
                          </p>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl border border-slate-200/50 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Denyut Nadi</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">{rec.denyut_nadi || '-'} bpm</p>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl border border-slate-200/50 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Saturasi Oksigen</p>
                          <p className={`text-xs font-bold mt-1 ${rec.spo2 < 95 ? 'text-rose-500' : 'text-slate-700'}`}>
                            {rec.spo2 || '-'}% SpO2
                          </p>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl border border-slate-200/50 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Gula Darah</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">{rec.gula_darah || '-'} mg/dL</p>
                        </div>
                      </div>

                      {/* Subjective & Treatment Reports */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3">
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Anamnesa & Catatan</p>
                          <p className="text-slate-700 font-medium bg-white/50 p-3 rounded-xl border border-slate-200/40 min-h-[48px] italic">
                            {rec.catatan ? `"${rec.catatan}"` : 'Tidak ada catatan subjektif.'}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                            <p><strong>Riwayat Sakit:</strong> {rec.riwayat_penyakit || '-'}</p>
                            <p><strong>Alergi Obat:</strong> {rec.alergi_obat || '-'}</p>
                            <p><strong>Psikologis:</strong> {rec.kondisi_psikologis || '-'}</p>
                            <p><strong>Konsumsi Obat:</strong> {rec.konsumsi_obat || '-'}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tindakan, Resep & Rekomendasi</p>
                          <div className="bg-white/50 p-3 rounded-xl border border-slate-200/40 space-y-2">
                            <p className="text-slate-700 font-medium"><strong>Tindakan:</strong> {rec.tindakan_diberikan || '-'}</p>
                            <p className="text-slate-700 font-medium"><strong>Obat P3K:</strong> {rec.obat_diberikan || '-'}</p>
                            <p className="text-slate-700 font-bold text-bku-primary"><strong>Rekomendasi:</strong> {rec.rekomendasi || '-'}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: New Screening Form */}
        {!loading && !error && activeTab === 'new' && (
          <form onSubmit={handleSubmitScreening} className="space-y-6">
            
            {/* Live Warning Alerts Panel */}
            {vitalsWarnings.length > 0 && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <h4 className="text-xs font-black uppercase text-rose-600 tracking-wider flex items-center gap-2 font-headline">
                  <span className="material-symbols-outlined text-base">error</span>
                  Deteksi Anomali Parameter Vital
                </h4>
                <div className="divide-y divide-rose-100 text-xs font-medium text-rose-700">
                  {vitalsWarnings.map((warn, i) => (
                    <div key={i} className="py-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                      <p>{warn.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Form (Col 8) */}
              <div className="lg:col-span-8 bg-white/70 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-5 glass-card">
                <h3 className="text-xs font-black uppercase tracking-widest text-bku-primary font-headline pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">monitor_heart</span>
                  Parameter Vitalitas & Screening Fisik
                </h3>

                {/* row 1: date & type & source */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Tanggal Screening</label>
                    <input
                      type="date"
                      required
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Jenis Pemeriksaan</label>
                    <select
                      value={jenisPemeriksaan}
                      onChange={(e) => setJenisPemeriksaan(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    >
                      <option value="Pemeriksaan Reguler">Pemeriksaan Reguler</option>
                      <option value="Screening PKKMB">Screening PKKMB</option>
                      <option value="Pemeriksaan Massal">Pemeriksaan Massal</option>
                      <option value="Screening Atlet/Ormawa">Screening Atlet/Ormawa</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Sumber Pemeriksaan</label>
                    <select
                      value={sumber}
                      onChange={(e) => setSumber(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    >
                      <option value="klinik_kampus">Klinik Kampus</option>
                      <option value="kencana_screening">Kencana Screening</option>
                      <option value="mandiri">Mandiri (Verifikasi)</option>
                    </select>
                  </div>
                </div>

                {/* row 2: TB, BB, Blood Sugar, Goldar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Tinggi Badan (cm)</label>
                    <input
                      type="number"
                      required
                      value={tinggiBadan}
                      onChange={(e) => setTinggiBadan(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Berat Badan (kg)</label>
                    <input
                      type="number"
                      required
                      value={beratBadan}
                      onChange={(e) => setBeratBadan(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Gula Darah (mg/dL)</label>
                    <input
                      type="number"
                      required
                      value={gulaDarah}
                      onChange={(e) => setGulaDarah(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Golongan Darah</label>
                    <select
                      value={golonganDarah}
                      onChange={(e) => setGolonganDarah(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>
                </div>

                {/* Calculated BMI indicator */}
                {bmi > 0 && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <p>Indeks Massa Tubuh (IMT): <span className="font-bold text-slate-800">{bmi}</span></p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      bmi >= 30 
                        ? 'bg-rose-500/10 text-rose-600' 
                        : bmi >= 25 
                          ? 'bg-amber-500/10 text-amber-600' 
                          : bmi >= 18.5 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : 'bg-blue-500/10 text-blue-600'
                    }`}>
                      {bmiStatus}
                    </span>
                  </div>
                )}

                {/* row 3: BP (Sistole, Diastole), Suhu, SpO2, Nadi */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Sistole (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={sistole}
                      onChange={(e) => setSistole(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Diastole (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={diastole}
                      onChange={(e) => setDiastole(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Suhu (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={suhuTubuh}
                      onChange={(e) => setSuhuTubuh(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Saturasi Oksigen (%)</label>
                    <input
                      type="number"
                      required
                      value={spO2}
                      onChange={(e) => setSpO2(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Denyut Nadi (bpm)</label>
                    <input
                      type="number"
                      required
                      value={denyutNadi}
                      onChange={(e) => setDenyutNadi(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* row 4: Pain Scale, Buta warna, Alergi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Skala Nyeri (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      required
                      value={skalaNyeri}
                      onChange={(e) => setSkalaNyeri(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Tes Buta Warna</label>
                    <select
                      value={butaWarna}
                      onChange={(e) => setButaWarna(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Parsial">Parsial</option>
                      <option value="Total">Total</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Alergi Obat</label>
                    <input
                      type="text"
                      value={alergiObat}
                      onChange={(e) => setAlergiObat(e.target.value)}
                      placeholder="Tulis nama obat jika alergi..."
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* row 5: Subjective notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Riwayat Sakit / Operasi</label>
                    <textarea
                      value={riwayatPenyakit}
                      onChange={(e) => setRiwayatPenyakit(e.target.value)}
                      placeholder="Misal: Asma sejak kecil, Operasi usus buntu tahun 2024..."
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Konsumsi Obat Terkini</label>
                    <textarea
                      value={konsumsiObat}
                      onChange={(e) => setKonsumsiObat(e.target.value)}
                      placeholder="Obat rutin yang sedang dikonsumsi..."
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Right Form (Col 4) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Diagnostics and Action Results Card */}
                <div className="bg-white/70 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4 glass-card">
                  <h3 className="text-xs font-black uppercase tracking-widest text-bku-primary font-headline pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">healing</span>
                    Tindakan & Resep Obat
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Tindakan Diberikan</label>
                    <input
                      type="text"
                      value={tindakanDiberikan}
                      onChange={(e) => setTindakanDiberikan(e.target.value)}
                      placeholder="Misal: Istirahat di UKS, Kompres air hangat"
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Obat Diberikan (P3K)</label>
                    <input
                      type="text"
                      value={obatDiberikan}
                      onChange={(e) => setObatDiberikan(e.target.value)}
                      placeholder="Misal: Paracetamol 500mg (1 tablet)"
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Hasil Akhir Pemeriksaan</label>
                    <select
                      value={hasil}
                      disabled={suhuTubuh > 38.0 || spO2 < 92}
                      onChange={(e) => setHasil(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white disabled:opacity-75 disabled:bg-rose-50 disabled:text-rose-600 disabled:border-rose-200"
                    >
                      <option value="Layak Kegiatan">Layak Kegiatan</option>
                      <option value="Perlu Perhatian">Perlu Perhatian</option>
                      <option value="Tidak Layak">Tidak Layak</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Rekomendasi / Saran Medis</label>
                    <textarea
                      value={rekomendasi}
                      onChange={(e) => setRekomendasi(e.target.value)}
                      placeholder="Saran medis untuk mahasiswa..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* Escalation Control Card */}
                <div className="bg-white/70 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4 glass-card">
                  <h3 className="text-xs font-black uppercase tracking-widest text-bku-primary font-headline pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">forward</span>
                    Rujukan & Alur Eskalasi
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Evaluasi Psikologis</label>
                    <select
                      value={kondisiPsikologis}
                      onChange={(e) => setKondisiPsikologis(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    >
                      <option value="Normal">Normal (Stabil)</option>
                      <option value="Cemas">Cemas Ringan/Sedang</option>
                      <option value="Stres">Stres Akademik</option>
                      <option value="Perlu Rujukan Psikolog">Perlu Rujukan Psikolog</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={eskalasiPsikolog}
                        onChange={(e) => setEskalasiPsikolog(e.target.checked)}
                        className="mt-0.5 rounded text-bku-primary focus:ring-bku-primary size-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Rujuk ke Psikolog</span>
                        <p className="text-[10px] text-slate-400 font-semibold leading-4 mt-0.5">Kirim notifikasi eskalasi rujukan data konseling ke tim Psikolog kampus.</p>
                      </div>
                    </label>

                    {/* Admin Fakultas escalation removed per user request */}

                    {eskalasiPsikolog && (
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3 animate-in slide-in-from-top-2">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pilih Psikolog Tujuan (Opsional)</label>
                          <select
                            value={psikologId}
                            onChange={(e) => setPsikologId(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary"
                          >
                            <option value="">Semua Psikolog (Blast Notif)</option>
                            {psychologists.map(psi => (
                              <option key={psi.id} value={psi.id}>{psi.name} - {psi.specialization}</option>
                            ))}
                          </select>
                        </div>
                        
                        {psikologId && (
                          <div className="pt-2 border-t border-slate-200 space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Jadwal Aktif Terdekat:</span>
                            {psikologSchedules.length > 0 ? (
                              <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-1">
                                {psikologSchedules.map(slot => (
                                  <button 
                                    key={slot.id} 
                                    type="button"
                                    onClick={() => setPsikologSlotId(psikologSlotId === slot.id ? null : slot.id)}
                                    className={`border rounded-md p-1.5 text-[10px] font-medium transition-all text-left ${psikologSlotId === slot.id ? 'bg-bku-primary text-white border-bku-primary' : 'bg-white border-slate-200 text-slate-600 hover:border-bku-primary/50'}`}
                                  >
                                    <span className={`font-bold ${psikologSlotId === slot.id ? 'text-white' : 'text-slate-800'}`}>{slot.display_date}</span> ({slot.start}-{slot.end}) - {slot.location}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">Tidak ada jadwal aktif.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <label className="flex items-start gap-2.5 cursor-pointer select-none border-t border-slate-100 pt-3">
                      <input
                        type="checkbox"
                        checked={eskalasiFaskes}
                        onChange={(e) => setEskalasiFaskes(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-600 size-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Rujuk ke Faskes Lanjutan</span>
                        <p className="text-[10px] text-slate-400 font-semibold leading-4 mt-0.5">Buat surat rujukan medis resmi untuk penanganan di luar klinik kampus.</p>
                      </div>
                    </label>
                  </div>
                  
                  {/* Formulir Surat Rujukan */}
                  {eskalasiFaskes && (
                    <div className="mt-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-4 animate-in slide-in-from-top-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-800 flex items-center gap-1.5 border-b border-indigo-100 pb-2">
                        <span className="material-symbols-outlined text-[14px]">local_hospital</span> Data Surat Rujukan Medis
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fasilitas Kesehatan Tujuan <span className="text-rose-500">*</span></label>
                          <select
                            value={faskesTujuan}
                            onChange={(e) => setFaskesTujuan(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-400"
                          >
                            <option value="Klinik UBK">Klinik UBK</option>
                            <option value="RSUD">RSUD</option>
                            <option value="Puskesmas">Puskesmas</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                          {faskesTujuan === 'Lainnya' && (
                            <input 
                              type="text" 
                              placeholder="Sebutkan nama Faskes..." 
                              value={faskesTujuanLainnya}
                              onChange={(e) => setFaskesTujuanLainnya(e.target.value)}
                              className="w-full h-10 mt-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-400"
                            />
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Alasan Rujukan <span className="text-rose-500">*</span></label>
                          <select
                            value={alasanRujukan}
                            onChange={(e) => setAlasanRujukan(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-400"
                          >
                            <option value="Penanganan Lanjutan">Penanganan Lanjutan</option>
                            <option value="Pemeriksaan Penunjang">Pemeriksaan Penunjang</option>
                            <option value="Gawat Darurat">Gawat Darurat</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                          {alasanRujukan === 'Lainnya' && (
                            <input 
                              type="text" 
                              placeholder="Sebutkan alasan..." 
                              value={alasanRujukanLainnya}
                              onChange={(e) => setAlasanRujukanLainnya(e.target.value)}
                              className="w-full h-10 mt-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-400"
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Keluhan Utama (Penyerta Rujukan) <span className="text-rose-500">*</span></label>
                        <textarea
                          required={eskalasiFaskes}
                          value={keluhanUtama}
                          onChange={(e) => setKeluhanUtama(e.target.value)}
                          placeholder="Jelaskan keluhan utama pasien yang mendasari rujukan..."
                          rows={2}
                          className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 bg-white resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Diagnosis Sementara <span className="text-rose-500">*</span></label>
                          <textarea
                            required={eskalasiFaskes}
                            value={diagnosisSementara}
                            onChange={(e) => setDiagnosisSementara(e.target.value)}
                            placeholder="Sebutkan diagnosis klinis sementara..."
                            rows={2}
                            className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 bg-white resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Saran Asuransi (Klaim) <span className="text-rose-500">*</span></label>
                          <select
                            value={rekomendasiAsuransi}
                            onChange={(e) => setRekomendasiAsuransi(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 bg-white h-[74px]"
                          >
                            <option value="BKU_Assurance">BKU Assurance</option>
                            <option value="BPJS_Kesehatan">BPJS Kesehatan</option>
                            <option value="Asuransi_Swasta">Asuransi Swasta / Pribadi</option>
                            <option value="Mandiri">Mandiri / Tidak Menggunakan Asuransi</option>
                          </select>
                        </div>
                      </div>
                      
                      <p className="text-[9px] font-bold text-indigo-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        Data TTV (Suhu, TD, Nadi, SpO2) akan otomatis ditarik dari form pemeriksaan fisik di atas. Saran asuransi akan ditampilkan di halaman riwayat rujukan mahasiswa.
                      </p>
                    </div>
                  )}
                </div>

                {/* Catatan Tambahan (UKS) */}
                <div className="bg-white/70 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4 glass-card">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Catatan UKS (Internal)</label>
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Tulis observasi internal Tenaga Kesehatan di sini..."
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 outline-none focus:border-bku-primary focus:bg-white"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-11 bg-bku-primary hover:bg-bku-hover text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-bku-primary/10 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {submitting && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                      Simpan & Rilis Rekam Medis
                    </button>
                    {bookingId && (
                      <button
                        type="button"
                        onClick={handleMarkAsDone}
                        disabled={submitting}
                        className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Tandai Selesai Saja
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </form>
        )}

    </PageContent>
  );
}
