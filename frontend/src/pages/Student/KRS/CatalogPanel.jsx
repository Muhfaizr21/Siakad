import React, { useState } from 'react';
import { Search, Plus, AlertCircle, Clock, MapPin, User, Info } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

// Map Hari Int (1-6) => String Hari
const HARI_MAP = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function CatalogPanel({ katalog, isLoading, onAdd, addingId, myKrsDetails }) {
  const [search, setSearch] = useState('');
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
    );
  }

  // Filter List MK
  const filteredKatalog = katalog?.filter(item => 
    item.MataKuliah.Name.toLowerCase().includes(search.toLowerCase()) || 
    item.MataKuliah.Code.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col h-[700px] font-inter overflow-hidden">
      
      {/* Header & Search */}
      <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
        <h2 className="text-lg font-bold font-jakarta text-neutral-900 mb-3">Katalog Mata Kuliah</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cari kode atau nama matkul..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-neutral-400" size={18} />
        </div>
      </div>

      {/* List Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredKatalog.length === 0 ? (
          <div className="text-center py-10 text-neutral-500 text-sm">
            Mata kuliah tidak ditemukan.
          </div>
        ) : (
          filteredKatalog.map((jadwal) => {
            const isFull = jadwal.Kuota <= 0; // Seharusnya kuota aktual, di mockup ini kita pakai jadwal.Kuota langsung
            const isAdded = myKrsDetails?.some(det => det.JadwalKuliahID === jadwal.ID);
            // Konflik Jam & syarat error bisa kita check di frontend atau tunggu throw dari backend. 
            // Sebagai dummy frontend (Optimistic) kita biarkan backend yg me-reject

            const isDisabled = isFull || isAdded || addingId === jadwal.ID;

            return (
              <div key={jadwal.ID} className={`p-4 rounded-xl border transition-all flex flex-col ${isAdded ? 'bg-orange-50/80 border-orange-200' : 'bg-white border-neutral-200 hover:border-orange-300 hover:shadow-sm'}`}>
                
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded uppercase">
                      SMT {jadwal.MataKuliah.Semester}
                    </span>
                    <h3 className="font-bold font-jakarta text-neutral-900 mt-1 leading-tight">
                      {jadwal.MataKuliah.Name}
                    </h3>
                    <div className="text-xs text-neutral-500 font-medium uppercase mt-0.5">
                      {jadwal.MataKuliah.Code} • {jadwal.MataKuliah.SKS} SKS
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onAdd(jadwal.ID)}
                    disabled={isDisabled}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isAdded ? 'bg-orange-600 text-white cursor-default' : 
                      isFull ? 'bg-red-50 text-red-300 cursor-not-allowed' :
                      'bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white'
                    }`}
                  >
                    {addingId === jadwal.ID ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Plus size={18} className={isAdded ? 'rotate-45' : ''} />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-y-1.5 mt-3 text-xs text-neutral-600">
                  <div className="flex items-center gap-1.5"><Clock size={14} className="text-neutral-400" /> {HARI_MAP[jadwal.Hari]}, {jadwal.JamMulai}-{jadwal.JamSelesai}</div>
                  <div className="flex items-center gap-1.5"><MapPin size={14} className="text-neutral-400" /> {jadwal.Ruang}</div>
                  <div className="flex items-center gap-1.5 col-span-2"><User size={14} className="text-neutral-400" /> {jadwal.Lecturer.Name}</div>
                </div>

                {isFull && !isAdded && (
                  <div className="mt-3 text-[10px] font-bold text-red-600 bg-red-50 py-1 px-2 rounded flex items-center gap-1">
                    <AlertCircle size={12} /> KELAS PENUH
                  </div>
                )}

              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
