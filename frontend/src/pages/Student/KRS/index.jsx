import React, { useState } from 'react';
import { useKRSPeriode, useKRSKatalog, useKRSSaya, useAddKRS, useRemoveKRS, useSubmitKRS } from '../../../queries/useKRSQuery';
import CatalogPanel from './CatalogPanel';
import MyKRSPanel from './MyKRSPanel';
import ScheduleCalendarGrid from './ScheduleCalendarGrid';
import { BookOpen, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function StudentKRS() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'calendar'
  
  // Queries
  const { data: periodeData, isLoading: isLoadingPeriode } = useKRSPeriode();
  const { data: katalogData, isLoading: isLoadingKatalog } = useKRSKatalog();
  const { data: myKrsData, isLoading: isLoadingMyKrs } = useKRSSaya();
  
  // Mutations
  const { mutate: addKRS, isPending: isAdding, variables: addVars } = useAddKRS();
  const { mutate: removeKRS, isPending: isRemoving, variables: removeVars } = useRemoveKRS();
  const { mutate: submitKRS, isPending: isSubmitting } = useSubmitKRS();

  if (isLoadingPeriode) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[700px] w-full rounded-xl" />
          <Skeleton className="h-[700px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const periode = periodeData;
  const isKRSOpen = periode?.KRSOpen;

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-neutral-50 font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Alert / Banner */}
        <section className={`rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border shadow-sm ${
          isKRSOpen ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white border-orange-600' : 'bg-neutral-800 text-white border-neutral-900'
        }`}>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-jakarta mb-1 flex items-center gap-2">
              <BookOpen size={28} className={isKRSOpen ? "text-orange-100" : "text-neutral-400"} />
              Pengisian KRS
            </h1>
            <p className={`font-medium ${isKRSOpen ? "text-orange-100" : "text-neutral-400"}`}>
              {periode ? `Periode ${periode.Name}` : 'Tidak ada periode berjalan'}
            </p>
          </div>
          <div className="bg-black/10 backdrop-blur-sm px-4 py-2 rounded-lg font-mono text-sm self-stretch md:self-auto flex items-center">
             Status: {isKRSOpen ? "DIBUKA (Batas Modifikasi Berjalan)" : "DITUTUP"}
          </div>
        </section>

        {!isKRSOpen && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-3 text-sm font-medium">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>
              Maaf, masa modifikasi Kartu Rencana Studi (KRS) untuk saat ini sedang direstriksi oleh Admin Akademik. Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi bagian kemahasiswaan.
            </p>
          </div>
        )}

        {/* Workspace Area: Left (Catalog) & Right (Cart/Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          
          {/* Left Panel: Catalog */}
          <div className="lg:col-span-7 xl:col-span-6 relative">
            {!isKRSOpen && <div className="absolute inset-0 bg-white/60 z-20 backdrop-blur-[1px] rounded-xl flex items-center justify-center pointer-events-none"></div>}
            
            <CatalogPanel 
              katalog={katalogData} 
              isLoading={isLoadingKatalog} 
              myKrsDetails={myKrsData?.details}
              onAdd={addKRS}
              addingId={addVars}
            />
          </div>

          {/* Right Panel: Tabs for Cart / Map */}
          <div className="lg:col-span-5 xl:col-span-6 flex flex-col pt-0 lg:-mt-12">
            
            {/* Tabs */}
            <div className="flex gap-2 self-end mb-3">
              <button 
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 text-sm font-bold font-jakarta rounded-lg transition-colors ${activeTab === 'list' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-100'}`}
              >
                Keranjang
              </button>
              <button 
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 text-sm font-bold font-jakarta rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'calendar' ? 'bg-orange-500 text-white' : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-100'}`}
              >
                <CalendarIcon size={16} /> Grid Jadwal
              </button>
            </div>

            {/* Content Area for Tabs */}
            <div className="h-[700px] shadow-lg rounded-xl flex flex-col relative bg-white overflow-hidden ring-1 ring-black/5">
               {activeTab === 'list' ? (
                 <MyKRSPanel 
                    krsSaya={myKrsData} 
                    isLoading={isLoadingMyKrs} 
                    onRemove={removeKRS}
                    removingId={removeVars}
                    onSubmit={submitKRS}
                    isSubmitting={isSubmitting}
                 />
               ) : (
                 <ScheduleCalendarGrid 
                    krsSaya={myKrsData}
                 />
               )}

               {/* Lock overlay if KRS cannot be manipulated anymore but we still want to show the list */}
               {(!isKRSOpen && activeTab === 'list') && (
                 <div className="absolute inset-0 hover:bg-white/5 z-20 pointer-events-none"></div>
               )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
