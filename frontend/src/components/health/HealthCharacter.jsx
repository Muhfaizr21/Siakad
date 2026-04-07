import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function HealthCharacter({
  bmi,
  sistolik,
  diastolik,
  statusKesehatan,
  className = ""
}) {
  // --- 1. TENTUKAN KONDISI KESEHATAN BERDASARKAN PRIORITAS ---
  const condition = useMemo(() => {
    if (!bmi || !sistolik || !diastolik || isNaN(bmi)) return 'nodata';
    const vBmi = parseFloat(bmi);
    const vSis = parseInt(sistolik);
    const vDia = parseInt(diastolik);

    if (vSis >= 140 || vDia >= 90) return 'hipertensi';
    if (vBmi >= 30) return 'obesitas';
    if (vBmi < 18.5) return 'kurus';
    if ((vSis < 120 && vDia < 80) && (vBmi >= 18.5 && vBmi < 25) && statusKesehatan === 'sehat') return 'prima';
    return 'perhatian'; // Default (Pre-hipertensi, atau gemuk tapi bukan obesitas)
  }, [bmi, sistolik, diastolik, statusKesehatan]);

  // --- 2. VARIAN ANIMASI & CONFIG ---
  const configs = {
    hipertensi: {
      bg: "from-red-400 to-rose-600",
      halo: "bg-red-500/20",
      faceVariant: {
        animate: { x: [-1, 1, -1, 1, 0], y: [-1, 1, 0] },
        transition: { duration: 0.2, repeat: Infinity, ease: "linear" }
      }
    },
    obesitas: {
      bg: "from-amber-400 to-orange-500",
      halo: "bg-amber-500/20",
      faceVariant: {
        animate: { scaleY: [1, 0.95, 1] },
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
    },
    kurus: {
      bg: "from-blue-200 to-cyan-300",
      halo: "bg-cyan-400/20",
      faceVariant: {
        animate: { y: [-5, 5, -5], opacity: [0.8, 1, 0.8] },
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }
    },
    prima: {
      bg: "from-emerald-400 to-teal-500",
      halo: "bg-emerald-500/20",
      faceVariant: {
        animate: { y: [-2, 2, -2] },
        transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      }
    },
    perhatian: {
      bg: "from-blue-400 to-[#00236F]",
      halo: "bg-[#00236F]/20",
      faceVariant: {
        animate: { scale: [0.98, 1.02, 0.98] },
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
    },
    nodata: {
      bg: "from-neutral-200 to-neutral-300",
      halo: "bg-neutral-300/20",
      faceVariant: {
        animate: { opacity: 0.5 },
        transition: { duration: 0 }
      }
    }
  };

  const { bg, halo, faceVariant } = configs[condition];

  // --- 3. RENDER SVG WAJAH SESUAI KONDISI ---
  const renderFace = () => {
    switch (condition) {
      case 'hipertensi':
        return (
          <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-md">
            {/* Wajah kepanasan (mera/orange) */}
            <circle cx="50" cy="50" r="40" fill="#FFE5D9" />
            <circle cx="50" cy="50" r="40" fill="url(#heatGrad)" opacity="0.6"/>
            {/* Mata Melotot/silang */}
            <path d="M30 35 L40 45 M40 35 L30 45" stroke="#8B0000" strokeWidth="4" strokeLinecap="round" />
            <path d="M60 35 L70 45 M70 35 L60 45" stroke="#8B0000" strokeWidth="4" strokeLinecap="round" />
            {/* Mulut ternganga stress */}
            <path d="M35 65 Q 50 60, 65 65 Q 50 85, 35 65" fill="#8B0000" />
            {/* Tetes keringat / uap panas */}
            <motion.path 
              d="M75 25 Q 85 20, 80 10 Q 70 20, 75 25" fill="#FFF" opacity="0.8"
              animate={{ y: [-2, -8], opacity: [0.8, 0] }} transition={{ duration: 1, repeat: Infinity }} 
            />
            <defs>
              <linearGradient id="heatGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'obesitas':
        return (
          <svg viewBox="0 0 100 100" className="w-[90%] h-[90%] drop-shadow-md">
            {/* Wajah lebar */}
            <ellipse cx="50" cy="50" rx="45" ry="38" fill="#FFE0B2" />
            {/* Mata berat/mengantuk */}
            <path d="M28 40 Q 35 35, 42 40" stroke="#795548" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M58 40 Q 65 35, 72 40" stroke="#795548" strokeWidth="3" strokeLinecap="round" fill="none"/>
            {/* Mulut kecil menarik napas berat */}
            <circle cx="50" cy="65" r="5" fill="#795548" />
            {/* Animasi Keringat */}
            <motion.path 
               d="M 80 30 Q 85 45, 80 50 Q 75 45, 80 30" fill="#81D4FA"
               animate={{ y: [0, 5, 0], scale: [1, 1.1, 1] }} 
               transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        );

      case 'kurus':
        return (
          <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-md">
            {/* Wajah Tirus */}
            <ellipse cx="50" cy="50" rx="30" ry="42" fill="#E1F5FE" />
            <ellipse cx="50" cy="50" rx="30" ry="42" fill="url(#paleGrad)" opacity="0.3" />
            {/* Mata sayu */}
            <circle cx="38" cy="45" r="3" fill="#37474F" />
            <circle cx="62" cy="45" r="3" fill="#37474F" />
            <path d="M35 40 L41 42" stroke="#37474F" strokeWidth="2" strokeLinecap="round" />
            <path d="M65 40 L59 42" stroke="#37474F" strokeWidth="2" strokeLinecap="round" />
            {/* Mulut sedih / datar */}
            <path d="M42 65 Q 50 63, 58 65" stroke="#37474F" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Zzz or dizziness */}
            <motion.text x="15" y="30" fontSize="12" fill="#546E7A" animate={{ opacity: [0, 1, 0], y: [-5, -15] }} transition={{ duration: 3, repeat: Infinity }}>
              ~
            </motion.text>
            <defs>
              <linearGradient id="paleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="100%" stopColor="#B3E5FC" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'prima':
        return (
          <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-lg">
            {/* Wajah Glowing Terang */}
            <circle cx="50" cy="50" r="40" fill="#FFFDE7" />
            <circle cx="50" cy="50" r="40" fill="url(#healthyGrad)" />
            {/* Kacamata Hitam Cool 😎 (Tema premium) */}
            <path d="M 25 45 Q 35 30, 45 45 Z" fill="#171717" />
            <path d="M 55 45 Q 65 30, 75 45 Z" fill="#171717" />
            <path d="M 45 38 L 55 38" stroke="#171717" strokeWidth="3" />
            <path d="M 20 40 L 25 45" stroke="#171717" strokeWidth="3" />
            <path d="M 80 40 L 75 45" stroke="#171717" strokeWidth="3" />
            {/* Senyum Lebar Bangga */}
            <path d="M30 65 Q 50 85, 70 65" stroke="#171717" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Sparkles / Bintang ✨ Animasi */}
            <motion.path d="M80 15 L82 23 L90 25 L82 27 L80 35 L78 27 L70 25 L78 23 Z" fill="#FBC02D"
              animate={{ rotate: [0, 90, 180], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.path d="M15 25 L16 29 L20 30 L16 31 L15 35 L14 31 L10 30 L14 29 Z" fill="#FFC107"
              animate={{ rotate: [180, 90, 0], scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <defs>
              <radialGradient id="healthyGrad" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#FFECB3" stopOpacity="0.6"/>
              </radialGradient>
            </defs>
          </svg>
        );

      case 'perhatian':
        return (
          <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-md">
            {/* Wajah Netral/Siaga */}
            <circle cx="50" cy="50" r="40" fill="#E8EBED" />
            {/* Mata Berpikir/Siaga */}
            <circle cx="35" cy="40" r="4" fill="#00236F" />
            <circle cx="65" cy="40" r="4" fill="#00236F" />
            <path d="M25 35 L45 35" stroke="#00236F" strokeWidth="3" strokeLinecap="round" />
            <path d="M75 35 Q 65 30, 55 35" stroke="#00236F" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Mulut garis datar */}
            <path d="M40 65 L60 65" stroke="#00236F" strokeWidth="3" strokeLinecap="round" />
            {/* Tanda Tanya Loading (?) */}
            <motion.text x="75" y="25" fontSize="18" fill="#0B4FAE" fontWeight="bold" 
               animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
              ?
            </motion.text>
          </svg>
        );

      default: // nodata
        return (
          <svg viewBox="0 0 100 100" className="w-[70%] h-[70%] opacity-40">
            {/* Siluet Wajah Kosong */}
            <circle cx="50" cy="40" r="25" fill="#A3A3A3" />
            <path d="M 20 90 Q 50 60, 80 90 Z" fill="#A3A3A3" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Latar Belakang (Halo/Glow Effect) */}
      <motion.div 
        className={`absolute inset-0 rounded-full blur-2xl opacity-70 ${halo.replace('/20', '/60')}`}
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Render Vector Character dengan Animasi Muka */}
      <motion.div 
        className="w-[110%] h-[110%] flex items-center justify-center z-10 relative drop-shadow-2xl"
        variants={faceVariant}
        animate="animate"
      >
        {renderFace()}
      </motion.div>
    </div>
  );
}
