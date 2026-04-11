import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSoalKuisQuery, useSubmitKuisMutation } from '../../queries/useKencanaQuery';
import { GraduationCap, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Clock, Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../../components/ui/Skeleton';

// Simple confetti particle
function ConfettiParticle({ delay, color }) {
  const x = Math.random() * 100;
  const rotation = Math.random() * 360;
  const size = Math.random() * 8 + 4;
  return (
    <motion.div
      initial={{ y: -20, x: `${x}vw`, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ y: '100vh', opacity: 0, rotate: rotation, scale: 0 }}
      transition={{ duration: Math.random() * 3 + 2, delay, ease: 'easeIn' }}
      style={{
        position: 'fixed', top: 0, left: 0, width: size, height: size,
        backgroundColor: color, borderRadius: Math.random() > 0.5 ? '50%' : '0%',
        zIndex: 9999, pointerEvents: 'none',
      }}
    />
  );
}

function ConfettiEffect() {
  const colors = ['#00236F', '#0B4FAE', '#60A5FA', '#16a34a', '#2563eb', '#9333ea'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <ConfettiParticle
          key={i}
          delay={i * 0.05}
          color={colors[i % colors.length]}
        />
      ))}
    </div>
  );
}

export default function KencanaKuisPage() {
  const { kuisId } = useParams();
  const navigate = useNavigate();

  const { data: kuisData, isLoading, isError } = useSoalKuisQuery(kuisId);
  const submitKuisMutation = useSubmitKuisMutation();

  const soalList = kuisData?.soal || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawaban, setJawaban] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasil, setHasil] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Timer countdown (jika durasi_menit diset)
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => {
    if (kuisData?.durasi_menit) {
      setTimeLeft(kuisData.durasi_menit * 60);
    }
  }, [kuisData]);
  useEffect(() => {
    if (timeLeft === null || hasil) return;
    if (timeLeft <= 0) {
      // Auto submit jika timer habis
      handleSubmitFinal();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, hasil]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmitFinal = () => {
    const formattedJawaban = {};
    Object.entries(jawaban).forEach(([k, v]) => {
      formattedJawaban[parseInt(k)] = v;
    });
    submitKuisMutation.mutate({ kuisId, jawaban: formattedJawaban }, {
      onSuccess: (data) => {
        setHasil(data);
        if (data.eligible_sertifikat || data.nilai_kumulatif_terbaru >= 75) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !soalList || soalList.length === 0) {
    return (
      <div className="p-6 md:p-10 text-center bg-[#fafafa] min-h-screen flex flex-col items-center justify-center">
        <XCircle size={56} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold font-headline text-[#171717] mb-2">Kuis Tidak Tersedia</h2>
        <p className="text-[#737373] mb-6">Gagal memuat soal atau kuis belum tersedia. Coba lagi nanti.</p>
        <button onClick={() => navigate('/student/kencana')}
          className="px-6 py-2.5 bg-[#00236F] text-white rounded-xl font-bold hover:bg-[#0B4FAE] transition-colors">
          Kembali ke KENCANA
        </button>
      </div>
    );
  }

  // ===== HASIL SCREEN =====
  if (hasil) {
    const isLulusKumulatif = hasil.nilai_kumulatif_terbaru >= 75;
    return (
      <div className="p-6 md:p-10 min-h-screen bg-[#fafafa] flex items-center justify-center font-body">
        {showConfetti && <ConfettiEffect />}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl border border-[#e5e5e5] max-w-lg w-full text-center shadow-2xl"
        >
          {/* Icon */}
          {hasil.lulus ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-24 h-24 bg-[#f0fdf4] text-[#16a34a] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100"
            >
              <CheckCircle2 size={48} />
            </motion.div>
          ) : (
            <div className="w-24 h-24 bg-[#fef2f2] text-[#dc2626] rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={48} />
            </div>
          )}

          {/* Lulus KENCANA Banner */}
          {isLulusKumulatif && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-gradient-to-r from-[#00236F] to-[#0B4FAE] rounded-2xl text-white"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy size={20} />
                <span className="font-black text-lg">Selamat! Kamu Lulus KENCANA!</span>
              </div>
              <p className="text-[#dbe7ff] text-sm">Sertifikat PKKMB sudah bisa diunduh.</p>
            </motion.div>
          )}

          <h2 className="text-3xl font-extrabold font-headline mb-1 text-[#171717]">
            {hasil.lulus ? 'Kuis Lulus! 🎉' : 'Belum Lulus'}
          </h2>
          <p className="text-[#737373] mb-6">
            Kamu menjawab <strong className="text-[#171717]">{hasil.jumlah_benar}</strong> dari <strong className="text-[#171717]">{hasil.total_soal}</strong> soal dengan benar.
          </p>

          {/* Nilai Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#fafafa] rounded-2xl p-4 border border-[#e5e5e5]">
              <p className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest mb-1">Nilai Kuis Ini</p>
              <p className={`text-4xl font-black ${hasil.lulus ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                {hasil.nilai}
              </p>
            </div>
            <div className="bg-[#eef4ff] rounded-2xl p-4 border border-[#c9d8ff]">
              <p className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest mb-1">Nilai Kumulatif</p>
              <p className={`text-4xl font-black ${hasil.nilai_kumulatif_terbaru >= 75 ? 'text-[#16a34a]' : 'text-[#00236F]'}`}>
                {hasil.nilai_kumulatif_terbaru?.toFixed(1)}
              </p>
            </div>
          </div>

          <p className="text-xs text-[#a3a3a3] mb-6">
            Percobaan ke-{hasil.attempt_ke} · {hasil.eligible_sertifikat ? '🎓 Eligible untuk sertifikat!' : `Butuh ${(75 - hasil.nilai_kumulatif_terbaru).toFixed(1)} poin lagi untuk lulus KENCANA`}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/student/kencana')}
              className="w-full bg-[#00236F] text-white py-3.5 rounded-2xl font-bold hover:bg-[#0B4FAE] transition-colors"
            >
              Kembali ke Beranda KENCANA
            </button>
            {!hasil.lulus && (
              <button
                onClick={() => { setHasil(null); setCurrentIndex(0); setJawaban({}); }}
                className="w-full bg-white border-2 border-[#e5e5e5] text-[#525252] py-3 rounded-2xl font-bold hover:bg-[#f5f5f5] transition-colors text-sm"
              >
                Coba Lagi Sekarang
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== QUIZ SCREEN =====
  const soalNow = soalList[currentIndex];
  const jawabNow = jawaban[soalNow.id];
  const progressPct = Math.round(((currentIndex + 1) / soalList.length) * 100);
  const jumlahTerjawab = Object.keys(jawaban).length;

  const handlePilih = (opsi) => setJawaban(prev => ({ ...prev, [soalNow.id]: opsi }));
  const handleNext = () => {
    if (currentIndex < soalList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowConfirm(true);
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const OPSI_LABELS = ['A', 'B', 'C', 'D'];
  const OPSI_VALUES = [soalNow.opsi_a, soalNow.opsi_b, soalNow.opsi_c, soalNow.opsi_d];

  return (
    <div className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 font-body text-[#171717] min-h-screen bg-[#fafafa]">
      <div className="max-w-3xl mx-auto">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/student/kencana')}
            className="flex items-center gap-2 text-[#525252] hover:text-[#00236F] transition-colors font-bold text-sm">
            <ArrowLeft size={18} /> Kembali
          </button>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold ${
                timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-[#fafafa] border-[#e5e5e5] text-[#525252]'
              }`}>
                <Clock size={14} /> {formatTime(timeLeft)}
              </div>
            )}
            <div className="bg-white px-4 py-1.5 rounded-full border border-[#e5e5e5] text-sm font-bold text-[#00236F] flex items-center gap-2 shadow-sm">
              <GraduationCap size={16} />
              Soal {currentIndex + 1} dari {soalList.length}
            </div>
          </div>
        </div>

        {/* Kuis Header */}
        <div className="mb-4">
          <h2 className="font-black text-lg text-[#171717]">{kuisData?.judul}</h2>
          <p className="text-xs text-[#a3a3a3] font-medium">Passing Grade: {kuisData?.passing_grade} · Bobot: {kuisData?.bobot_persen}%</p>
        </div>

        {/* Linear Progress Bar */}
        <div className="h-2 bg-[#f5f5f5] rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00236F] to-[#0B4FAE] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Soal Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl border border-[#e5e5e5] p-6 md:p-10 shadow-sm mb-6"
          >
            <h3 className="text-xl md:text-2xl font-bold leading-relaxed mb-8">
              {currentIndex + 1}. {soalNow.pertanyaan}
            </h3>

            <div className="space-y-3">
              {OPSI_LABELS.map((opsiLabel, i) => (
                <label
                  key={opsiLabel}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[52px] ${
                    jawabNow === opsiLabel
                      ? 'border-[#00236F] bg-[#eef4ff]'
                      : 'border-[#e5e5e5] hover:border-[#c9d8ff] hover:bg-[#fafafa]'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-black border-2 transition-colors mt-0.5 ${
                    jawabNow === opsiLabel ? 'bg-[#00236F] border-[#00236F] text-white' : 'bg-white border-[#d4d4d4] text-[#525252]'
                  }`}>
                    {opsiLabel}
                  </div>
                  <input
                    type="radio"
                    name={`soal-${soalNow.id}`}
                    value={opsiLabel}
                    checked={jawabNow === opsiLabel}
                    onChange={() => handlePilih(opsiLabel)}
                    className="sr-only"
                  />
                  <span className={`flex-1 text-base leading-relaxed ${jawabNow === opsiLabel ? 'font-semibold text-[#171717]' : 'text-[#525252] font-medium'}`}>
                    {OPSI_VALUES[i]}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-5 py-3 rounded-xl font-bold bg-white border-2 border-[#e5e5e5] text-[#525252] hover:bg-[#f5f5f5] disabled:opacity-30 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Sebelumnya
          </button>

          {/* Dot Navigator */}
          <div className="hidden sm:flex gap-1.5 flex-wrap justify-center max-w-[200px]">
            {soalList.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-[#00236F] scale-125' : jawaban[s.id] ? 'bg-[#16a34a]' : 'bg-[#d4d4d4]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!jawabNow}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-[#00236F] text-white hover:bg-[#0B4FAE] disabled:opacity-30 transition-colors"
          >
            {currentIndex === soalList.length - 1 ? 'Selesai & Kumpulkan' : 'Selanjutnya'}
            {currentIndex !== soalList.length - 1 && <ArrowRight size={18} />}
          </button>
        </div>

      </div>

      {/* Konfirmasi Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 bg-[#171717]/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Star size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-black font-headline mb-2 text-[#171717]">Kumpulkan Jawaban?</h3>
              <p className="text-[#737373] mb-2 text-sm font-medium">
                Kamu sudah menjawab <strong className="text-[#171717]">{jumlahTerjawab}</strong> dari <strong className="text-[#171717]">{soalList.length}</strong> soal.
              </p>
              {jumlahTerjawab < soalList.length && (
                <p className="text-sm text-[#dc2626] font-bold mb-4">
                  ⚠️ {soalList.length - jumlahTerjawab} soal belum dijawab!
                </p>
              )}
              <p className="text-[#737373] text-sm mb-6">Jawaban tidak bisa diubah setelah dikumpulkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-2xl border-2 border-[#e5e5e5] font-bold text-[#525252] hover:bg-[#f5f5f5] transition-colors">
                  Cek Lagi
                </button>
                <button
                  onClick={() => { setShowConfirm(false); handleSubmitFinal(); }}
                  disabled={submitKuisMutation.isPending}
                  className="flex-1 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {submitKuisMutation.isPending ? 'Loading...' : 'Ya, Kumpulkan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
