import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bapService } from '../../services/api';
import toast from 'react-hot-toast';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';

// Auto-injected Material Symbol fallbacks
const DocumentIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>
);
const AddIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>add</span>
);
const EditIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>edit</span>
);
const DeleteIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>delete</span>
);
const DownloadIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>
);
const CheckCircle = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>
);

// Status badge
const StatusBadge = ({ status }) => {
  const config = {
    'DRAFT': { label: 'Draft', bg: 'bg-[var(--theme-text-subtle)]/10', text: 'text-[var(--theme-text-muted)]', border: 'border-transparent' },
    'FINAL': { label: 'Final', bg: 'bg-[var(--theme-success-light)]', text: 'text-[var(--theme-success)]', border: 'border-[var(--theme-success-light)]' },
  };
  const c = config[status] || config['DRAFT'];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
};

export default function BAPManagement() {
  const [baps, setBaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBAP, setSelectedBAP] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');

  // Form state
  const [form, setForm] = useState({
    nama_kegiatan: '',
    tanggal_pelaksanaan: '',
    waktu_mulai: '',
    waktu_selesai: '',
    tempat: '',
    jumlah_peserta: 0,
    jumlah_diperiksa: 0,
    total_layak: 0,
    total_pantauan: 0,
    total_tidak_layak: 0,
    status: 'DRAFT',
  });

  // Fetch BAPs
  const fetchBAPs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;

      const res = await bapService.getBAPs(params);
      if (res.status === 'success') {
        setBaps(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching BAPs:', err);
      toast.error('Gagal memuat data BAP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBAPs();
  }, [filterStatus]);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: ['jumlah_peserta', 'jumlah_diperiksa', 'total_layak', 'total_pantauan', 'total_tidak_layak'].includes(name)
        ? parseInt(value) || 0
        : value
    }));
  };

  // Open create modal
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setForm({
      nama_kegiatan: '',
      tanggal_pelaksanaan: '',
      waktu_mulai: '',
      waktu_selesai: '',
      tempat: '',
      jumlah_peserta: 0,
      jumlah_diperiksa: 0,
      total_layak: 0,
      total_pantauan: 0,
      total_tidak_layak: 0,
      status: 'DRAFT',
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (bap) => {
    setIsEditMode(true);
    setSelectedBAP(bap);
    setForm({
      nama_kegiatan: bap.nama_kegiatan,
      tanggal_pelaksanaan: bap.tanggal_pelaksanaan?.split('T')[0] || '',
      waktu_mulai: bap.waktu_mulai || '',
      waktu_selesai: bap.waktu_selesai || '',
      tempat: bap.tempat || '',
      jumlah_peserta: bap.jumlah_peserta || 0,
      jumlah_diperiksa: bap.jumlah_diperiksa || 0,
      total_layak: bap.total_layak || 0,
      total_pantauan: bap.total_pantauan || 0,
      total_tidak_layak: bap.total_tidak_layak || 0,
      status: bap.status || 'DRAFT',
    });
    setIsModalOpen(true);
  };

  // Open detail modal
  const handleOpenDetail = async (bap) => {
    try {
      const res = await bapService.getBAPDetail(bap.id);
      if (res.status === 'success') {
        setSelectedBAP(res.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      toast.error('Gagal memuat detail BAP');
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama_kegiatan || !form.tanggal_pelaksanaan) {
      toast.error('Nama kegiatan dan tanggal wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (isEditMode && selectedBAP) {
        res = await bapService.updateBAP(selectedBAP.id, form);
      } else {
        res = await bapService.createBAP(form);
      }

      if (res.status === 'success') {
        toast.success(isEditMode ? 'BAP berhasil diperbarui!' : 'BAP berhasil dibuat!');
        setIsModalOpen(false);
        fetchBAPs();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan BAP');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete BAP
  const handleDelete = async (bap) => {
    if (!confirm('Yakin ingin menghapus BAP ini?')) return;

    try {
      const res = await bapService.deleteBAP(bap.id);
      if (res.status === 'success') {
        toast.success('BAP berhasil dihapus');
        fetchBAPs();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus BAP');
    }
  };

  // Download PDF
  const handleDownloadPDF = async (bap) => {
    try {
      const response = await bapService.downloadBAPPDF(bap.id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BAP_${bap.nama_kegiatan.replace(/\s+/g, '_')}_${bap.tanggal_pelaksanaan?.split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF berhasil didownload');
    } catch (err) {
      toast.error('Gagal download PDF');
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <PageContent>
      <DashboardHero
        title="Berita Acara"
        highlightedTitle="Pemeriksaan"
        subtitle="Kelola BAP kegiatan kesehatan"
        icon="description"
        badges={[
          { label: 'BAP Management', active: true },
        ]}
        actions={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors"
          >
            <AddIcon size={18} />
            Buat BAP Baru
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-800">{baps.length}</p>
          <p className="text-xs text-slate-500">Total BAP</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-700">{baps.filter(b => b.status === 'DRAFT').length}</p>
          <p className="text-xs text-slate-500">Draft</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50">
          <p className="text-2xl font-bold text-emerald-700">{baps.filter(b => b.status === 'FINAL').length}</p>
          <p className="text-xs text-emerald-600">Final</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
        >
          <option value="">Semua Status</option>
          <option value="DRAFT">Draft</option>
          <option value="FINAL">Final</option>
        </select>
      </div>

      {/* BAP Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nama Kegiatan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tempat</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Peserta</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  </tr>
                ))
              ) : baps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl text-slate-300">description</span>
                    <p className="mt-2">Belum ada BAP</p>
                  </td>
                </tr>
              ) : (
                baps.map((bap) => (
                  <tr key={bap.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 text-sm">{bap.nama_kegiatan}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{formatDate(bap.tanggal_pelaksanaan)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{bap.tempat || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold">{bap.jumlah_diperiksa || 0}/{bap.jumlah_peserta || 0}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={bap.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenDetail(bap)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Detail"
                        >
                          <span className="material-symbols-outlined text-sm text-slate-600">visibility</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(bap)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <EditIcon size={16} className="text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(bap)}
                          className="p-2 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <DownloadIcon size={16} className="text-teal-600" />
                        </button>
                        {bap.status === 'DRAFT' && (
                          <button
                            onClick={() => handleDelete(bap)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <DeleteIcon size={16} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} maxWidth="max-w-lg">
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit BAP' : 'Buat BAP Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase mb-1">Nama Kegiatan *</label>
              <input
                type="text"
                name="nama_kegiatan"
                value={form.nama_kegiatan}
                onChange={handleInputChange}
                placeholder="Contoh: PKKMB 2026"
                className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase mb-1">Tanggal *</label>
                <input
                  type="date"
                  name="tanggal_pelaksanaan"
                  value={form.tanggal_pelaksanaan}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase mb-1">Tempat</label>
                <input
                  type="text"
                  name="tempat"
                  value={form.tempat}
                  onChange={handleInputChange}
                  placeholder="Contoh: Aula Utama"
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase mb-1">Waktu Mulai</label>
                <input
                  type="time"
                  name="waktu_mulai"
                  value={form.waktu_mulai}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase mb-1">Waktu Selesai</label>
                <input
                  type="time"
                  name="waktu_selesai"
                  value={form.waktu_selesai}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase mb-1">Jumlah Peserta</label>
                <input
                  type="number"
                  name="jumlah_peserta"
                  value={form.jumlah_peserta}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase mb-1">Diperiksa</label>
                <input
                  type="number"
                  name="jumlah_diperiksa"
                  value={form.jumlah_diperiksa}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors cursor-pointer"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-success)] uppercase mb-1">Layak</label>
                <input
                  type="number"
                  name="total_layak"
                  value={form.total_layak}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full h-10 px-3 border border-[var(--theme-success)]/40 rounded-xl text-sm focus:border-[var(--theme-success)] focus:ring-2 focus:ring-[var(--theme-success-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-warning)] uppercase mb-1">Pantauan</label>
                <input
                  type="number"
                  name="total_pantauan"
                  value={form.total_pantauan}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full h-10 px-3 border border-[var(--theme-warning)]/40 rounded-xl text-sm focus:border-[var(--theme-warning)] focus:ring-2 focus:ring-[var(--theme-warning-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-error)] uppercase mb-1">Tidak Layak</label>
                <input
                  type="number"
                  name="total_tidak_layak"
                  value={form.total_tidak_layak}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full h-10 px-3 border border-[var(--theme-error)]/40 rounded-xl text-sm focus:border-[var(--theme-error)] focus:ring-2 focus:ring-[var(--theme-error-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-10 border border-[var(--theme-border)] text-[var(--theme-text)] font-semibold rounded-xl hover:bg-[var(--theme-bg)] transition-colors cursor-pointer text-xs uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-10 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen} maxWidth="max-w-lg">
        {selectedBAP && (
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Detail BAP</DialogTitle>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-4 text-[var(--theme-text)]">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{selectedBAP.nama_kegiatan}</h3>
                <StatusBadge status={selectedBAP.status} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl p-3">
                  <p className="text-[10px] text-[var(--theme-text-muted)] uppercase tracking-wider">Tanggal</p>
                  <p className="font-semibold text-sm">{formatDate(selectedBAP.tanggal_pelaksanaan)}</p>
                </div>
                <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl p-3">
                  <p className="text-[10px] text-[var(--theme-text-muted)] uppercase tracking-wider">Waktu</p>
                  <p className="font-semibold text-sm">{selectedBAP.waktu_mulai || '—'} - {selectedBAP.waktu_selesai || '—'}</p>
                </div>
                <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl p-3 col-span-2">
                  <p className="text-[10px] text-[var(--theme-text-muted)] uppercase tracking-wider">Tempat</p>
                  <p className="font-semibold text-sm">{selectedBAP.tempat || '—'}</p>
                </div>
              </div>

              <div className="border-t border-[var(--theme-border-muted)] pt-4">
                <h4 className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-3">Statistik Pemeriksaan</h4>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-2 text-center">
                    <p className="text-lg font-bold">{selectedBAP.jumlah_peserta || 0}</p>
                    <p className="text-[10px] text-[var(--theme-text-muted)]">Peserta</p>
                  </div>
                  <div className="bg-[var(--theme-info-light)] rounded-xl p-2 text-center text-[var(--theme-info)]">
                    <p className="text-lg font-bold">{selectedBAP.jumlah_diperiksa || 0}</p>
                    <p className="text-[10px] text-[var(--theme-info)]/80">Diperiksa</p>
                  </div>
                  <div className="bg-[var(--theme-success-light)] rounded-xl p-2 text-center text-[var(--theme-success)]">
                    <p className="text-lg font-bold">{selectedBAP.total_layak || 0}</p>
                    <p className="text-[10px] text-[var(--theme-success)]/80">Layak</p>
                  </div>
                  <div className="bg-[var(--theme-warning-light)] rounded-xl p-2 text-center text-[var(--theme-warning)]">
                    <p className="text-lg font-bold">{selectedBAP.total_pantauan || 0}</p>
                    <p className="text-[10px] text-[var(--theme-warning)]/80">Pantauan</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6">
              <button
                onClick={() => handleDownloadPDF(selectedBAP)}
                className="w-full h-10 flex items-center justify-center gap-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-semibold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                <DownloadIcon size={18} />
                Download PDF
              </button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </PageContent>
  );
}