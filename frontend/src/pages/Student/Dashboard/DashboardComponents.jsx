import React from 'react';
import { BookOpen, MapPin, Clock, CalendarX2, ArrowUpRight, ArrowDownRight, FileText, CheckCircle2, Bookmark, LayoutDashboard } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

// --- STAT CARD ---
export function StatCard({ title, value, maxOrSub, trend, type, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-neutral-500 font-inter mb-1.5">{title}</h3>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold font-jakarta text-neutral-900">{value}</span>
        {maxOrSub && <span className="text-sm text-neutral-400 font-medium pb-1">{maxOrSub}</span>}
      </div>
      
      {/* Trend or Progress Element */}
      {trend && (
        <div className={`flex items-center text-xs font-medium ${trend.isUp ? 'text-green-600' : 'text-neutral-500'}`}>
          {trend.isUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          <span>{trend.label}</span>
        </div>
      )}
      
      {type === 'progress' && (
        <div className="mt-3">
          <div className="w-full bg-neutral-100 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${parseFloat(value) < 75 ? 'bg-red-500' : parseFloat(value) < 85 ? 'bg-amber-500' : 'bg-green-500'}`} 
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- JADWAL CARD ---
export function JadwalCard({ jadwal, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm col-span-full lg:col-span-2">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 p-4 rounded-lg bg-neutral-50">
              <Skeleton className="w-16 h-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm col-span-full lg:col-span-2 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold font-jakarta text-neutral-900 flex items-center gap-2">
          <BookOpen className="text-orange-500" size={20} />
          Jadwal Hari Ini
        </h2>
        <a href="/jadwal" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">Lihat Semua</a>
      </div>

      <div className="flex-1 overflow-y-auto">
        {jadwal?.length > 0 ? (
          <div className="space-y-3">
            {jadwal.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl bg-orange-50/50 hover:bg-orange-50 border border-orange-100/50 transition-colors">
                <div className="flex flex-col items-center justify-center min-w-[70px] bg-white rounded-lg border border-orange-100 py-2 shadow-sm">
                  <span className="text-sm font-bold text-orange-600">{item.jam_mulai}</span>
                  <span className="text-xs text-neutral-400">{item.jam_selesai}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold font-jakarta text-neutral-900 mb-1">{item.nama_mk}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5"><MapPin size={14} />{item.ruang}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} />{item.nama_dosen}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full py-8 text-neutral-400">
            <CalendarX2 size={48} strokeWidth={1} className="mb-3 text-neutral-300" />
            <p className="font-medium text-neutral-600">Tidak ada jadwal hari ini</p>
            <p className="text-sm mt-1">Waktunya istirahat atau nugas mandiri!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- TAGIHAN CARD ---
export function TagihanCard({ invoice, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  // Calculate days left
  const daysLeft = invoice ? Math.ceil((new Date(invoice.jatuh_tempo) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const isWarning = daysLeft <= 7 && daysLeft > 0;
  const isOverdue = daysLeft < 0;
  const isPaid = invoice?.status_bayar?.toLowerCase() === 'lunas';

  return (
    <div className={`p-6 rounded-xl border shadow-sm flex flex-col relative overflow-hidden ${isPaid ? 'bg-green-50 border-green-200' : isOverdue ? 'bg-red-50 border-red-200' : isWarning ? 'bg-orange-50 border-orange-200' : 'bg-white border-neutral-200'}`}>
      
      {/* Decorative background element */}
      <div className="absolute -right-6 -top-6 rounded-full w-24 h-24 bg-white/40 blur-xl"></div>

      <div className="relative z-10 flex-1">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold font-jakarta text-neutral-900">Pembayaran UKT</h2>
          {isPaid && <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Lunas</span>}
        </div>
        
        {isPaid ? (
          <div className="flex flex-col items-center justify-center h-full py-2">
            <CheckCircle2 size={40} className="text-green-500 mb-2" />
            <p className="font-medium text-green-800">Semua tagihan lunas!</p>
          </div>
        ) : (
          <>
            <div className="mb-1 text-sm font-medium text-neutral-500">Sisa Tagihan</div>
            <div className={`text-3xl font-bold font-jakarta mb-4 ${isOverdue ? 'text-red-600' : 'text-neutral-900'}`}>
              Rp {invoice?.total_tagihan?.toLocaleString('id-ID')}
            </div>
            
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock size={16} className={isWarning || isOverdue ? 'text-red-500' : 'text-neutral-400'} />
              <span className={isWarning || isOverdue ? 'text-red-600' : 'text-neutral-500'}>
                {isOverdue ? `Terlewat ${Math.abs(daysLeft)} hari` : `Jatuh tempo dlm ${daysLeft} hari`}
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-1 pl-6">
              {new Date(invoice?.jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </>
        )}
      </div>

      {!isPaid && (
        <a href="/keuangan/tagihan" className={`mt-5 w-full py-2.5 px-4 rounded-lg text-center font-medium transition-colors z-10 ${isWarning || isOverdue ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-neutral-900 hover:bg-neutral-800 text-white'}`}>
          Bayar Sekarang
        </a>
      )}
    </div>
  );
}

// --- NOTIF ITEM ---
export function NotifItem({ notif }) {
  return (
    <a href={`/notifikasi/${notif.id}`} className="block p-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors relative group">
      {!notif.is_read && (
        <span className="absolute top-5 right-4 w-2 h-2 rounded-full bg-orange-500"></span>
      )}
      <div className={`pr-6 ${!notif.is_read ? 'font-medium text-neutral-900' : 'text-neutral-600'}`}>
        <h4 className="text-sm font-jakarta truncate mb-1">{notif.judul}</h4>
        <p className="text-xs line-clamp-1 mb-2 text-neutral-500">{notif.isi_singkat}</p>
        <span className="text-[10px] text-neutral-400 uppercase tracking-wide font-medium bg-neutral-100 px-2 py-0.5 rounded-sm">
          {notif.tipe}
        </span>
      </div>
    </a>
  );
}

// --- QUICK LINK ---
export function QuickLink({ icon: Icon, label, href }) {
  return (
    <a href={href} className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-200 bg-white hover:border-orange-200 hover:shadow-md hover:bg-orange-50/30 transition-all group">
      <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <span className="text-sm font-medium text-neutral-700 font-jakarta group-hover:text-orange-600 text-center leading-tight">
        {label}
      </span>
    </a>
  );
}
