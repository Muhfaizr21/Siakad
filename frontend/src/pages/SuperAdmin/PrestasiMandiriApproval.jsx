import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCcw, ShieldCheck, XCircle, Trophy, Clock, CheckCircle, AlertCircle, Eye, Search, Filter } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { adminService } from '../../services/api';
import { DataTable } from './components/ui/data-table';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Input } from './components/ui/input';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { label: 'Menunggu Super Admin', value: 'forwarded_to_superadmin' },
  { label: 'Approved', value: 'approved_superadmin' },
  { label: 'Rejected', value: 'rejected_superadmin' },
  { label: 'Semua', value: 'all' },
];

export default function PrestasiMandiriApproval() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('forwarded_to_superadmin');
  const [note, setNote] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPrestasiMandiriQueue(status);
      if (res.status === 'success') {
        setItems(res.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data prestasi mandiri');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [status]);

  const summary = useMemo(() => {
    const total = items.length;
    const queued = items.filter((x) => x.StatusSinkron === 'queued_sync').length;
    const synced = items.filter((x) => x.StatusSinkron === 'synced').length;
    const failed = items.filter((x) => x.StatusSinkron === 'sync_failed').length;
    return { total, queued, synced, failed };
  }, [items]);

  const approve = async (id) => {
    try {
      await adminService.approvePrestasiMandiri(id, { catatan: note });
      toast.success('Pengajuan disetujui dan masuk antrean sinkron');
      setNote('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Gagal menyetujui pengajuan');
    }
  };

  const reject = async (id) => {
    if (!note) {
      toast.error('Isi catatan penolakan terlebih dahulu');
      return;
    }
    try {
      await adminService.rejectPrestasiMandiri(id, { catatan: note });
      toast.success('Pengajuan ditolak');
      setNote('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Gagal menolak pengajuan');
    }
  };

  const markSynced = async (id) => {
    try {
      await adminService.markPrestasiMandiriSyncSuccess(id);
      toast.success('Status sinkron ditandai berhasil');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Gagal update status sinkron');
    }
  };

  const markFailed = async (id) => {
    try {
      await adminService.markPrestasiMandiriSyncFailed(id, { catatan: note || 'Sinkronisasi gagal' });
      toast.success('Status sinkron ditandai gagal');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Gagal update status sinkron');
    }
  };

  const columns = [
    { 
      key: 'Mahasiswa', 
      label: 'Mahasiswa', 
      className: 'min-w-[240px]',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-xl border-2 border-white shadow-sm">
            <AvatarFallback className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase">
              {row.Mahasiswa?.Nama?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 text-[13px]">{row.Mahasiswa?.Nama || '—'}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{row.Mahasiswa?.NIM || '—'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'NamaKegiatan', 
      label: 'Kegiatan / Lomba', 
      className: 'min-w-[200px]',
      render: v => <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{v || '—'}</span>
    },
    { 
      key: 'Status', 
      label: 'Status Approval', 
      className: 'w-[160px]',
      render: v => (
        <Badge className={cn('capitalize font-black text-[9px] px-2.5 py-0.5 border-none shadow-sm',
          v === 'approved_superadmin' ? 'bg-emerald-100 text-emerald-700' :
          v === 'rejected_superadmin' ? 'bg-rose-100 text-rose-700' :
          'bg-amber-100 text-amber-700')}>
          {v?.replace(/_/g, ' ') || 'Pending'}
        </Badge>
      )
    },
    { 
      key: 'StatusSinkron', 
      label: 'Sinkronisasi', 
      className: 'w-[140px]',
      render: v => (
        <Badge className={cn('capitalize font-bold text-[9px] px-2 py-0.5 border-none',
          v === 'synced' ? 'bg-indigo-100 text-indigo-700' :
          v === 'sync_failed' ? 'bg-rose-100 text-rose-700' :
          'bg-slate-100 text-slate-500')}>
          {v?.replace(/_/g, ' ') || 'Belum'}
        </Badge>
      )
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Trophy className="size-6" /></div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Approval Prestasi Mandiri</h1>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-12">Monitoring & Final Approval Sinkronisasi SIMKATMAWA</p>
        </div>
        <Button onClick={loadData} variant="outline" className="rounded-2xl gap-2 font-black text-[10px] uppercase tracking-widest h-11 px-6 border-slate-200">
          <RefreshCcw size={14} className={cn(loading && "animate-spin")} /> Muat Ulang
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pengajuan', val: summary.total, icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Dalam Antrean', val: summary.queued, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Sudah Sinkron', val: summary.synced, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Gagal Sinkron', val: summary.failed, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((s) => (
          <Card key={s.label} className="border-none shadow-sm bg-white/50 backdrop-blur-md overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <p className="text-3xl font-black text-slate-900 font-headline">{s.val}</p>
                </div>
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", s.bg, s.color)}>
                  <s.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Table */}
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/30">
          <div className="flex-1 space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Catatan Progress</label>
            <Input 
              value={note} 
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan approval/reject/sync failed..."
              className="h-11 rounded-2xl border-slate-200 bg-white/80 font-bold text-sm"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          searchPlaceholder="Cari nama mahasiswa atau lomba..."
          filters={[
            { 
              key: 'Status', 
              placeholder: 'Filter Status Approval', 
              options: STATUS_OPTIONS.filter(o => o.value !== 'all') 
            }
          ]}
          actions={(row) => (
            <div className="flex items-center gap-2">
              {row.Status === 'forwarded_to_superadmin' && (
                <>
                  <Button onClick={() => approve(row.ID)} className="h-8 px-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider gap-1">
                    <CheckCircle2 size={12} /> Approve
                  </Button>
                  <Button onClick={() => reject(row.ID)} variant="outline" className="h-8 px-3 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-black uppercase tracking-wider gap-1">
                    <XCircle size={12} /> Reject
                  </Button>
                </>
              )}
              {row.Status === 'approved_superadmin' && (
                <>
                  <Button onClick={() => markSynced(row.ID)} className="h-8 px-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider gap-1">
                    <ShieldCheck size={12} /> Sync OK
                  </Button>
                  <Button onClick={() => markFailed(row.ID)} variant="outline" className="h-8 px-3 rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50 text-[10px] font-black uppercase tracking-wider">
                    Fail
                  </Button>
                </>
              )}
            </div>
          )}
        />
      </Card>
    </div>
  );
}
