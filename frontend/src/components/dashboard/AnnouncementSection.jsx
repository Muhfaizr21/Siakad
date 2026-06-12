import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { PageCard, PageCardHeader } from '@/components/ui/page';
import { cn } from '@/lib/utils';

export default function AnnouncementSection({ announcements }) {
  return (
    <PageCard className="mb-6">
      <PageCardHeader 
        title="Pengumuman Terbaru"
        icon="notifications"
        action={
          <NavLink to="/student/notifikasi" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group">
            Lihat Semua
            <ArrowRight size={14} className="translate-x-0 group-hover:translate-x-1 transition-all" />
          </NavLink>
        }
      />

      {announcements?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {announcements.map((item, idx) => {
            const kategori = item.kategori || item.type || 'INFO';
            const judul = item.judul || item.title || 'Pengumuman';
            const isi = item.isi_singkat || item.content || item.deskripsi || '';
            const tanggal = item.tanggal || item.date || item.created_at || '';

            return (
              <div key={idx} className="flex flex-col h-full p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_20px_rgba(0,0,0,0.04)] hover:border-[var(--theme-primary)]/20 transition-all duration-500 hover:-translate-y-1 group/item">
                <div className="flex items-center justify-between mb-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                    kategori.toLowerCase() === 'urgent' ? "bg-red-50 text-red-600 border-red-200" :
                    kategori.toLowerCase() === 'event' ? "bg-amber-50 text-amber-600 border-amber-200" :
                    "bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border-[var(--theme-primary)]/20"
                  )}>
                    {kategori}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {tanggal ? new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                </div>
                <div className="flex-1 flex flex-col">
                  <h4 className="font-bold font-headline text-[16px] mb-2 text-slate-800 group-hover/item:text-[var(--theme-primary)] transition-colors line-clamp-2 leading-snug">{judul}</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-3 mb-5 flex-1">
                    {isi}
                  </p>
                  <NavLink 
                      to={item.link || `/student/notifikasi`} 
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--theme-primary)] hover:opacity-80 transition-opacity mt-auto w-max"
                  >
                      Selengkapnya <ArrowRight size={14} className="group-hover/item:translate-x-1 transition-transform" />
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center flex flex-col items-center justify-center opacity-40">
           <Info size={48} className="text-text-muted/40 mb-4 overflow-hidden" />
           <p className="font-bold text-text-muted">Belum ada pengumuman terbaru.</p>
        </div>
      )}
    </PageCard>
  );
}
