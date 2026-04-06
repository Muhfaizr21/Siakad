import React from 'react';
import { Trash2, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

const HARI_MAP = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function MyKRSPanel({ krsSaya, isLoading, onRemove, removingId, onSubmit, isSubmitting }) {

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm space-y-4">
        <Skeleton className="h-6 w-1/3 mb-6" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const { header, details } = krsSaya || {};
  const isDraft = header?.Status === 'draft' || !header;
  const isDisetujui = header?.Status === 'disetujui';
  const isMenunggu = header?.Status === 'menunggu_approval';
  
  const totalSKS = header?.TotalSKS || 0;
  const maxSKS = 24; // Hardcode for now
  const percent = Math.min((totalSKS / maxSKS) * 100, 100);
  const isOver = totalSKS > maxSKS;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col h-full font-inter overflow-hidden">
      
      {/* Header Info */}
      <div className="p-5 border-b border-neutral-100 relative overflow-hidden bg-neutral-900 text-white">
        {/* Decorative Circle */}
        <div className="absolute -right-6 -top-12 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold font-jakarta mb-1">Rencana Studi</h2>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
              <span className={`px-2 py-0.5 rounded-sm uppercase tracking-wider text-[10px] text-white ${
                isDraft ? 'bg-neutral-600' : isDisetujui ? 'bg-green-600' : 'bg-amber-600'
              }`}>
                {header?.Status?.replace('_', ' ') || 'draft'}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold font-jakarta text-orange-400 leading-none">{totalSKS}</div>
            <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mt-1">/ {maxSKS} SKS</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 w-full bg-neutral-800 rounded-full h-1.5 mb-1 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-orange-500'}`} 
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        {isOver && <div className="text-[10px] text-red-400 mt-1">Anda melewati batas maksimal SKS!</div>}
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/30">
        {(!details || details.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 text-neutral-300 rounded-full flex items-center justify-center mb-3">
              <FileText size={28} />
            </div>
            <p className="font-medium text-neutral-600 text-sm">Belum ada mata kuliah yang diambil</p>
            <p className="text-xs text-neutral-400 mt-1">Pilih dari katalog di sebelah kiri</p>
          </div>
        ) : (
          details.map((det) => (
            <div key={det.ID} className="flex bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm group">
              <div className="bg-orange-50/50 w-12 flex flex-col items-center justify-center border-r border-orange-100/50 shrink-0">
                <span className="text-xs font-bold text-orange-700">{det.JadwalKuliah.MataKuliah.SKS}</span>
                <span className="text-[9px] uppercase tracking-widest text-orange-400 font-medium mt-0.5">SKS</span>
              </div>
              <div className="p-3 flex-1 min-w-0">
                <h4 className="font-bold text-sm text-neutral-900 font-jakarta truncate leading-tight">
                  {det.JadwalKuliah.MataKuliah.Name}
                </h4>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-500 font-medium">
                  <span className="flex items-center gap-1"><Clock size={12} /> {HARI_MAP[det.JadwalKuliah.Hari]}</span>
                  <span>{det.JadwalKuliah.JamMulai} - {det.JadwalKuliah.JamSelesai}</span>
                </div>
              </div>
              {isDraft && (
                <button 
                  onClick={() => onRemove(det.ID)}
                  disabled={removingId === det.ID}
                  className="w-10 flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 border-l border-transparent group-hover:border-neutral-100"
                >
                  {removingId === det.ID ? (
                    <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer / Submit Area */}
      <div className="p-4 border-t border-neutral-200 bg-white shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
        {isDraft ? (
          <button 
            onClick={onSubmit}
            disabled={isSubmitting || !details?.length || isOver}
            className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2 ${
              !details?.length || isOver ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 
              'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><CheckCircle2 size={18} /> Ajukan KRS ke Dosen Wali</>
            )}
          </button>
        ) : (
          <div className="text-center">
            {isDisetujui ? (
               <a href="/api/v1/krs/cetak" target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-2 py-2.5 bg-neutral-900 text-white font-bold text-sm rounded-lg hover:bg-neutral-800 transition-colors">
                 Cetak / Download KRS
               </a>
            ) : (
              <div className="bg-amber-50 text-amber-700 py-3 rounded-lg border border-amber-200 text-sm font-medium flex justify-center items-center gap-2">
                 <Clock size={16} /> Sedang diverifikasi Dosen Wali
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
