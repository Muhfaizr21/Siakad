import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bapService } from '../../services/api';
import toast from 'react-hot-toast';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';

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
    'DRAFT': { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700' },
    'FINAL': { label: 'Final', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  };
  const c = config[status] || config['DRAFT'];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${c.bg} ${c.text}`}>
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

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800">
                    {isEditMode ? 'Edit BAP' : 'Buat BAP Baru'}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nama Kegiatan *</label>
                    <input
                      type="text"
                      name="nama_kegiatan"
                      value={form.nama_kegiatan}
                      onChange={handleInputChange}
                      placeholder="Contoh: PKKMB 2026"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal *</label>
                      <input
                        type="date"
                        name="tanggal_pelaksanaan"
                        value={form.tanggal_pelaksanaan}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tempat</label>
                      <input
                        type="text"
                        name="tempat"
                        value={form.tempat}
                        onChange={handleInputChange}
                        placeholder="Contoh: Aula Utama"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Waktu Mulai</label>
                      <input
                        type="time"
                        name="waktu_mulai"
                        value={form.waktu_mulai}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Waktu Selesai</label>
                      <input
                        type="time"
                        name="waktu_selesai"
                        value={form.waktu_selesai}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Jumlah Peserta</label>
                      <input
                        type="number"
                        name="jumlah_peserta"
                        value={form.jumlah_peserta}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Diperiksa</label>
                      <input
                        type="number"
                        name="jumlah_diperiksa"
                        value={form.jumlah_diperiksa}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="FINAL">Final</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-emerald-600 mb-1">Layak</label>
                      <input
                        type="number"
                        name="total_layak"
                        value={form.total_layak}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2.5 border border-emerald-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-600 mb-1">Pantauan</label>
                      <input
                        type="number"
                        name="total_pantauan"
                        value={form.total_pantauan}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2.5 border border-amber-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-red-600 mb-1">Tidak Layak</label>
                      <input
                        type="number"
                        name="total_tidak_layak"
                        value={form.total_tidak_layak}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2.5 border border-red-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedBAP && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsDetailModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">Detail BAP</h2>
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">{selectedBAP.nama_kegiatan}</h3>
                    <StatusBadge status={selectedBAP.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-500 uppercase">Tanggal</p>
                      <p className="font-semibold text-sm">{formatDate(selectedBAP.tanggal_pelaksanaan)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-500 uppercase">Waktu</p>
                      <p className="font-semibold text-sm">{selectedBAP.waktu_mulai || '—'} - {selectedBAP.waktu_selesai || '—'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                      <p className="text-[10px] text-slate-500 uppercase">Tempat</p>
                      <p className="font-semibold text-sm">{selectedBAP.tempat || '—'}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Statistik</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-slate-700">{selectedBAP.jumlah_peserta || 0}</p>
                        <p className="text-[10px] text-slate-500">Peserta</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-blue-700">{selectedBAP.jumlah_diperiksa || 0}</p>
                        <p className="text-[10px] text-blue-600">Diperiksa</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-emerald-700">{selectedBAP.total_layak || 0}</p>
                        <p className="text-[10px] text-emerald-600">Layak</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-amber-700">{selectedBAP.total_pantauan || 0}</p>
                        <p className="text-[10px] text-amber-600">Pantauan</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-200">
                  <button
                    onClick={() => handleDownloadPDF(selectedBAP)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors"
                  >
                    <DownloadIcon size={18} />
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageContent>
  );
}