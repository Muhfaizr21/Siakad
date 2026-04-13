import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCcw, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../services/api';

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Approval Prestasi Mandiri</h1>
          <p className="text-sm text-slate-500">Tahap final approval dan monitoring sinkronisasi SIMKATMAWA.</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm inline-flex items-center gap-2">
          <RefreshCcw size={16} /> Muat Ulang
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border">Total: <b>{summary.total}</b></div>
        <div className="p-4 rounded-2xl bg-white border">Queued: <b>{summary.queued}</b></div>
        <div className="p-4 rounded-2xl bg-white border">Synced: <b>{summary.synced}</b></div>
        <div className="p-4 rounded-2xl bg-white border">Failed: <b>{summary.failed}</b></div>
      </div>

      <div className="bg-white border rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan approval/reject/sync failed"
            className="flex-1 border rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Mahasiswa</th>
                <th className="py-2">Lomba</th>
                <th className="py-2">Status</th>
                <th className="py-2">Sinkron</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400">Memuat data...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400">Tidak ada data</td></tr>
              ) : items.map((row) => (
                <tr key={row.ID} className="border-b">
                  <td className="py-2">{row.Mahasiswa?.Nama || '-'} ({row.Mahasiswa?.NIM || '-'})</td>
                  <td className="py-2">{row.NamaKegiatan || '-'}</td>
                  <td className="py-2">{row.Status}</td>
                  <td className="py-2">{row.StatusSinkron || '-'}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {row.Status === 'forwarded_to_superadmin' && (
                        <>
                          <button onClick={() => approve(row.ID)} className="px-3 py-1 rounded-lg bg-emerald-600 text-white inline-flex items-center gap-1"><CheckCircle2 size={14} />Approve</button>
                          <button onClick={() => reject(row.ID)} className="px-3 py-1 rounded-lg bg-rose-600 text-white inline-flex items-center gap-1"><XCircle size={14} />Reject</button>
                        </>
                      )}
                      {row.Status === 'approved_superadmin' && (
                        <>
                          <button onClick={() => markSynced(row.ID)} className="px-3 py-1 rounded-lg bg-indigo-600 text-white inline-flex items-center gap-1"><ShieldCheck size={14} />Sync OK</button>
                          <button onClick={() => markFailed(row.ID)} className="px-3 py-1 rounded-lg bg-amber-600 text-white">Sync Failed</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
