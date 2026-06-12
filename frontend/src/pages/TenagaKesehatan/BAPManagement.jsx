import React, { useState, useEffect } from 'react';
import { bapService } from '../../services/api';
import toast from 'react-hot-toast';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';
import { PrimaryStatsCard } from '@/components/ui/StatsCard';
import { DataTable } from '@/components/ui/DataTable';
import { DialogModal } from '@/components/ui/DialogModal';

// Reusable Icon
const Icon = ({ name, size = 16, className = '', ...props }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, ...props.style }} {...props}>{name}</span>
);

// Status badge
const StatusBadge = ({ status }) => {
  const config = {
    'DRAFT': { label: 'Draft', bg: 'color-mix(in srgb, var(--theme-text-subtle) 10%, transparent)', text: 'var(--theme-text-subtle)', border: 'transparent', dot: 'var(--theme-text-subtle)' },
    'FINAL': { label: 'Final', bg: 'color-mix(in srgb, var(--theme-success) 10%, transparent)', text: 'var(--theme-success)', border: 'color-mix(in srgb, var(--theme-success) 20%, transparent)', dot: 'var(--theme-success)' },
  };
  const c = config[status] || config['DRAFT'];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {c.label}
    </span>
  );
};

export default function BAPManagement() {
  const [baps, setBaps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [selectedBAP, setSelectedBAP] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      const res = await bapService.getBAPs();
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
  }, []);

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
    setIsFormModalOpen(true);
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
    setIsFormModalOpen(true);
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
        setIsFormModalOpen(false);
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
      }
      fetchBAPs();
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

  // Local filtering
  const filteredBaps = baps.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (searchQuery) {
       const q = searchQuery.toLowerCase();
       if (!b.nama_kegiatan?.toLowerCase().includes(q) && !b.tempat?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const columns = [
    {
      key: 'kegiatan',
      label: 'Nama Kegiatan & Tempat',
      sortable: true,
      render: (v, row) => (
        <div className="flex flex-col gap-1">
          <p className="font-bold text-[12px] text-[var(--theme-text)] truncate max-w-[250px]">{row.nama_kegiatan}</p>
          <p className="text-[10px] font-medium text-[var(--theme-text-muted)] flex items-center gap-1.5">
             <Icon name="location_on" size={14} /> {row.tempat || '—'}
          </p>
        </div>
      )
    },
    {
      key: 'waktu',
      label: 'Jadwal Pelaksanaan',
      sortable: true,
      render: (v, row) => (
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold text-[var(--theme-text)] flex items-center gap-1.5">
            <Icon name="calendar_month" size={14} className="text-[var(--theme-text-muted)]" /> {formatDate(row.tanggal_pelaksanaan)}
          </p>
          <p className="text-[10px] font-bold text-[var(--theme-primary)] pl-[20px]">
            {row.waktu_mulai || '—'} - {row.waktu_selesai || '—'}
          </p>
        </div>
      )
    },
    {
      key: 'statistik',
      label: 'Statistik Peserta',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="text-center w-12">
            <p className="text-[11px] font-bold text-[var(--theme-text)]">{row.jumlah_diperiksa || 0}</p>
            <p className="text-[9px] font-semibold text-[var(--theme-text-muted)] mt-0.5">Hadir</p>
          </div>
          <div className="w-px h-5 bg-[var(--theme-border)]"></div>
          <div className="text-center w-12">
            <p className="text-[11px] font-bold text-[var(--theme-success)]">{row.total_layak || 0}</p>
            <p className="text-[9px] font-semibold text-[var(--theme-success)]/80 mt-0.5">Layak</p>
          </div>
          <div className="w-px h-5 bg-[var(--theme-border)]"></div>
          <div className="text-center w-12">
            <p className="text-[11px] font-bold text-[var(--theme-error)]">{row.total_tidak_layak || 0}</p>
            <p className="text-[9px] font-semibold text-[var(--theme-error)]/80 mt-0.5">Tidak</p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (v, row) => <StatusBadge status={row.status} />
    },
    {
      key: 'aksi',
      label: 'Tindakan',
      className: 'text-right',
      render: (v, row) => (
        <div className="flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
          <button onClick={() => handleOpenDetail(row)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-[var(--theme-bg)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] transition-colors" title="Detail">
            <Icon name="visibility" size={14} />
          </button>
          <button onClick={() => handleOpenEdit(row)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-[var(--theme-primary)]/10 hover:bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] transition-colors" title="Edit">
            <Icon name="edit" size={14} />
          </button>
          <button onClick={() => handleDownloadPDF(row)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-[var(--theme-info)]/10 hover:bg-[var(--theme-info)]/20 text-[var(--theme-info)] transition-colors" title="Download PDF">
            <Icon name="download" size={14} />
          </button>
          {row.status === 'DRAFT' && (
             <button onClick={() => handleDelete(row)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-[var(--theme-error)]/10 hover:bg-[var(--theme-error)]/20 text-[var(--theme-error)] transition-colors" title="Hapus">
               <Icon name="delete" size={14} />
             </button>
          )}
        </div>
      )
    }
  ];

  return (
    <PageContent>
      <DashboardHero
        title="Berita Acara"
        highlightedTitle="Pemeriksaan"
        subtitle="Kelola BAP kegiatan kesehatan"
        icon="description"
        badges={[{ label: 'BAP Management', active: true }]}
        actions={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-sm text-xs uppercase tracking-wider"
          >
            <Icon name="add" size={18} />
            Buat BAP Baru
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <PrimaryStatsCard
          title="Total BAP"
          value={`${baps.length}`}
          icon="description"
          colorTheme="primary"
          badgeText="SEMUA"
        />
        <PrimaryStatsCard
          title="BAP Draft"
          value={`${baps.filter(b => b.status === 'DRAFT').length}`}
          icon="edit_document"
          colorTheme="warning"
          badgeText="BELUM FINAL"
        />
        <PrimaryStatsCard
          title="BAP Final"
          value={`${baps.filter(b => b.status === 'FINAL').length}`}
          icon="task"
          colorTheme="success"
          badgeText="SELESAI"
        />
        <PrimaryStatsCard
          title="Total Diperiksa"
          value={`${baps.reduce((acc, b) => acc + (b.jumlah_diperiksa || 0), 0)}`}
          icon="group"
          colorTheme="info"
          badgeText="MAHASISWA"
        />
      </div>

      {/* DataTable */}
      <div className="w-full">
        <DataTable
          title="Daftar Berita Acara Pemeriksaan"
          subtitle={`Menampilkan ${filteredBaps.length} dokumen BAP`}
          columns={columns}
          data={filteredBaps}
          loading={loading}
          searchable={true}
          manualFiltering={true}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nama kegiatan atau tempat..."
          filterValues={{ status: filterStatus }}
          onFilterChange={(key, val) => {
            if (key === 'status') setFilterStatus(val);
          }}
          pagination={true}
          pageSize={10}
          emptyMessage="Tidak ada BAP. Coba sesuaikan filter pencarian atau buat baru."
          emptyIcon="description"
          filters={[
            {
              key: 'status',
              placeholder: 'Status',
              options: [
                { value: 'DRAFT', label: 'Draft' },
                { value: 'FINAL', label: 'Final' }
              ]
            }
          ]}
        />
      </div>

      {/* Form Modal */}
      <DialogModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        title={isEditMode ? 'Edit BAP' : 'Buat BAP Baru'}
        icon={isEditMode ? 'edit' : 'add_circle'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-4 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-muted)] font-headline mb-3">Informasi Kegiatan</h3>
            <div>
              <label className="block text-[11px] font-bold text-[var(--theme-text-subtle)] mb-1">Nama Kegiatan *</label>
              <input
                type="text"
                name="nama_kegiatan"
                value={form.nama_kegiatan}
                onChange={handleInputChange}
                placeholder="Contoh: PKKMB 2026"
                className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--theme-text-subtle)] mb-1">Tanggal *</label>
                <input
                  type="date"
                  name="tanggal_pelaksanaan"
                  value={form.tanggal_pelaksanaan}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--theme-text-subtle)] mb-1">Tempat</label>
                <input
                  type="text"
                  name="tempat"
                  value={form.tempat}
                  onChange={handleInputChange}
                  placeholder="Contoh: Aula Utama"
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--theme-text-subtle)] mb-1">Waktu Mulai</label>
                <input
                  type="time"
                  name="waktu_mulai"
                  value={form.waktu_mulai}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--theme-text-subtle)] mb-1">Waktu Selesai</label>
                <input
                  type="time"
                  name="waktu_selesai"
                  value={form.waktu_selesai}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-4 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-muted)] font-headline mb-3">Statistik Pemeriksaan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--theme-text-subtle)] mb-1">Jumlah Peserta Terdaftar</label>
                <input
                  type="number"
                  name="jumlah_peserta"
                  value={form.jumlah_peserta}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--theme-text-subtle)] mb-1">Jumlah Hadir Diperiksa</label>
                <input
                  type="number"
                  name="jumlah_diperiksa"
                  value={form.jumlah_diperiksa}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-[var(--theme-success)] mb-1">Layak</label>
                <input
                  type="number"
                  name="total_layak"
                  value={form.total_layak}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full h-10 px-3 border border-[var(--theme-success)]/40 rounded-xl text-sm focus:border-[var(--theme-success)] focus:ring-1 focus:ring-[var(--theme-success)] outline-none bg-[var(--theme-success-light)]/10 text-[var(--theme-text)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--theme-warning)] mb-1">Pantauan</label>
                <input
                  type="number"
                  name="total_pantauan"
                  value={form.total_pantauan}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full h-10 px-3 border border-[var(--theme-warning)]/40 rounded-xl text-sm focus:border-[var(--theme-warning)] focus:ring-1 focus:ring-[var(--theme-warning)] outline-none bg-[var(--theme-warning-light)]/10 text-[var(--theme-text)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--theme-error)] mb-1">Tidak Layak</label>
                <input
                  type="number"
                  name="total_tidak_layak"
                  value={form.total_tidak_layak}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full h-10 px-3 border border-[var(--theme-error)]/40 rounded-xl text-sm focus:border-[var(--theme-error)] focus:ring-1 focus:ring-[var(--theme-error)] outline-none bg-[var(--theme-error-light)]/10 text-[var(--theme-text)] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-4">
             <label className="block text-[11px] font-bold text-[var(--theme-text-subtle)] mb-1">Status Dokumen</label>
             <select
                name="status"
                value={form.status}
                onChange={handleInputChange}
                className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors cursor-pointer"
             >
                <option value="DRAFT">Simpan sebagai Draft</option>
                <option value="FINAL">Finalisasi Dokumen BAP</option>
             </select>
             {form.status === 'FINAL' && (
                <p className="text-[10px] text-[var(--theme-warning)] mt-2 italic font-medium">Perhatian: BAP dengan status Final tidak dapat dihapus lagi.</p>
             )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)] text-[11px] font-bold uppercase tracking-widest transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 text-white text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm"
            >
              {submitting ? 'Menyimpan...' : 'Simpan BAP'}
            </button>
          </div>
        </form>
      </DialogModal>

      {/* Detail Modal */}
      <DialogModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        title="Detail BAP"
        icon="description"
        maxWidth="max-w-xl"
      >
        {selectedBAP && (
          <div className="space-y-4 text-[var(--theme-text)]">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-bold text-lg leading-tight">{selectedBAP.nama_kegiatan}</h3>
              <div className="shrink-0 pt-1">
                 <StatusBadge status={selectedBAP.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl p-4">
                <p className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-1">Tanggal</p>
                <p className="font-semibold text-[13px]">{formatDate(selectedBAP.tanggal_pelaksanaan)}</p>
              </div>
              <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl p-4">
                <p className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-1">Waktu</p>
                <p className="font-semibold text-[13px]">{selectedBAP.waktu_mulai || '—'} s/d {selectedBAP.waktu_selesai || '—'}</p>
              </div>
              <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl p-4 col-span-2">
                <p className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-1">Tempat Pelaksanaan</p>
                <p className="font-semibold text-[13px] flex items-center gap-1.5">
                   <Icon name="location_on" size={16} className="text-[var(--theme-primary)]" />
                   {selectedBAP.tempat || '—'}
                </p>
              </div>
            </div>

            <div className="border border-[var(--theme-border)] rounded-2xl overflow-hidden mt-4">
              <div className="bg-[var(--theme-surface)] border-b border-[var(--theme-border)] p-3">
                 <h4 className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest">Statistik Hasil Pemeriksaan</h4>
              </div>
              <div className="p-4 grid grid-cols-4 gap-3">
                <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-3 flex flex-col items-center justify-center">
                  <p className="text-xl font-black text-[var(--theme-text)]">{selectedBAP.jumlah_diperiksa || 0}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mt-1 text-center">Diperiksa<br/><span className="text-[8px] font-medium lowercase">dari {selectedBAP.jumlah_peserta || 0}</span></p>
                </div>
                <div className="bg-[var(--theme-success-light)]/20 border border-[var(--theme-success)]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <p className="text-xl font-black text-[var(--theme-success)]">{selectedBAP.total_layak || 0}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--theme-success)]/80 mt-1">Layak</p>
                </div>
                <div className="bg-[var(--theme-warning-light)]/20 border border-[var(--theme-warning)]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <p className="text-xl font-black text-[var(--theme-warning)]">{selectedBAP.total_pantauan || 0}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--theme-warning)]/80 mt-1">Pantauan</p>
                </div>
                <div className="bg-[var(--theme-error-light)]/20 border border-[var(--theme-error)]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <p className="text-xl font-black text-[var(--theme-error)]">{selectedBAP.total_tidak_layak || 0}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--theme-error)]/80 mt-1 text-center">Tidak<br/>Layak</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => { setIsDetailModalOpen(false); handleOpenEdit(selectedBAP); }}
                className="flex-1 py-2.5 rounded-xl border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)] text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Icon name="edit" size={16} /> Edit
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedBAP)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 text-white text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Icon name="download" size={16} /> Download PDF
              </button>
            </div>
          </div>
        )}
      </DialogModal>
    </PageContent>
  );
}