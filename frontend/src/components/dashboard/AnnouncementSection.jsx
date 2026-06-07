import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { PageCard, PageCardHeader } from '@/components/ui/page';

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {announcements.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-4 group/item">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  {item.kategori}
                </span>
                <span className="text-[10px] font-bold text-text-muted uppercase">{item.tanggal}</span>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 group-hover/item:text-primary transition-colors line-clamp-1">{item.judul}</h4>
                <p className="text-sm text-text-muted font-medium leading-relaxed line-clamp-3 mb-4">
                  {item.isi_singkat}
                </p>
                <NavLink 
                    to={item.link || `/student/notifikasi`} 
                    className="inline-flex items-center gap-1.5 text-xs font-black text-bku-text hover:text-primary uppercase tracking-widest transition-colors decoration-2 underline-offset-4 hover:underline"
                >
                    Selengkapnya <ArrowRight size={14} />
                </NavLink>
              </div>
            </div>
          ))}
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
