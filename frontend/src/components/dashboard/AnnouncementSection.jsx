import React from 'react';
import { Bell, Info, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function AnnouncementSection({ announcements }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-[#e5e5e5] shadow-sm mb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-extrabold font-headline flex items-center gap-3">
          <Bell size={24} className="text-[#00236F]" />
          Pengumuman Terbaru
        </h2>
        <NavLink to="/student/notifikasi" className="text-sm font-bold text-[#00236F] hover:underline flex items-center gap-1 group">
          Lihat Semua
          <ArrowRight size={16} className="translate-x-0 group-hover:translate-x-1 transition-all" />
        </NavLink>
      </div>

      {announcements?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {announcements.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-4 group/item">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-[#eef4ff] text-[#00236F] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#dbe7ff]">
                  {item.kategori}
                </span>
                <span className="text-[10px] font-bold text-[#a3a3a3] uppercase">{item.tanggal}</span>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 group-hover/item:text-[#00236F] transition-colors line-clamp-1">{item.judul}</h4>
                <p className="text-sm text-[#525252] font-medium leading-relaxed line-clamp-3 mb-4">
                  {item.isi_singkat}
                </p>
                <NavLink 
                    to={item.link || `/student/notifikasi`} 
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#171717] hover:text-[#00236F] uppercase tracking-widest transition-colors decoration-2 underline-offset-4 hover:underline"
                >
                    Selengkapnya <ArrowRight size={14} />
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center flex flex-col items-center justify-center opacity-40">
           <Info size={48} className="text-[#d4d4d4] mb-4 overflow-hidden" />
           <p className="font-bold text-[#a3a3a3]">Belum ada pengumuman terbaru.</p>
        </div>
      )}
    </div>
  );
}
