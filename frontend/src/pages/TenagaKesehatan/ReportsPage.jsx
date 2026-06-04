import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { healthReportsService } from '../../services/api';
import toast from 'react-hot-toast';

// Auto-injected Material Symbol fallbacks
const ReportIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>analytics</span>
);
const DownloadIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>
);
const CalendarIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_month</span>
);
const FilterIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>filter_list</span>
);

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Result badge
const ResultBadge = ({ result }) => {
  const config = {
    'Layak Kegiatan': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
    'Perlu Perhatian': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    'Tidak Layak': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  };
  const c = config[result] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {result || '—'}
    </span>
  );
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [dateRange, setDateRange] = useState('month'); // 'today', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Get date range
  const getDateRange = () => {
    const now = new Date();
    let start, end;

    switch (dateRange) {
      case 'today':
        start = now.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        start = weekAgo.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        start = monthAgo.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'custom':
        start = startDate;
        end = endDate;
        break;
      default:
        const defaultStart = new Date(now);
        defaultStart.setMonth(defaultStart.getMonth() - 1);
        start = defaultStart.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
    }

    return { startDate: start, endDate: end };
  };

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const res = await healthReportsService.getReports({ start_date: startDate, end_date: endDate });
      if (res.status === 'success') {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange, startDate, endDate]);

  // Export Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await healthReportsService.exportExcel();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan_klinis_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel berhasil didownload');
    } catch (err) {
      toast.error('Gagal download Excel');
    } finally {
      setExporting(false);
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const response = await healthReportsService.exportPDF();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan_klinis_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF berhasil didownload');
    } catch (err) {
      toast.error('Gagal download PDF');
    } finally {
      setExporting(false);
    }
  };

  const { summary, records } = reportData || { summary: {}, records: [] };
  const { startDate: displayStart, endDate: displayEnd } = reportData?.filters || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
            <ReportIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Laporan Klinis</h1>
            <p className="text-sm text-slate-500">Rekap data pemeriksaan kesehatan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <DownloadIcon size={18} />
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <DownloadIcon size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <FilterIcon size={18} className="text-slate-500" />
          <span className="text-sm font-bold text-slate-600">Filter Periode</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              dateRange === 'today'
                ? 'bg-teal-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              dateRange === 'week'
                ? 'bg-teal-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              dateRange === 'month'
                ? 'bg-teal-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setDateRange('custom')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              dateRange === 'custom'
                ? 'bg-teal-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Custom
          </button>

          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none"
              />
              <span className="text-slate-400">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none"
              />
            </>
          )}
        </div>

        {displayStart && displayEnd && (
          <p className="text-xs text-slate-500 mt-2">
            Menampilkan data dari <span className="font-bold">{formatDate(displayStart)}</span>
            {' '}sampai <span className="font-bold">{formatDate(displayEnd)}</span>
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">people</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{summary.total_diperiksa || 0}</p>
              <p className="text-xs text-slate-500">Total Diperiksa</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-700">check_circle</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{summary.layak || 0}</p>
              <p className="text-xs text-emerald-600">Layak</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-700">warning</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{summary.perlu_perhatian || 0}</p>
              <p className="text-xs text-amber-600">Perlu Perhatian</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-700">cancel</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{summary.tidak_layak || 0}</p>
              <p className="text-xs text-red-600">Tidak Layak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Percentage Cards */}
      <div className="grid grid-cols-3 gap-4">
        {summary.total_diperiksa > 0 ? (
          <>
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" strokeWidth="6" stroke="#e2e8f0" fill="none" />
                  <circle
                    cx="32" cy="32" r="28" strokeWidth="6" fill="none"
                    stroke="#10b981"
                    strokeDasharray={`${(summary.layak / summary.total_diperiksa) * 175.93} 175.93`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {Math.round((summary.layak / summary.total_diperiksa) * 100)}%
                </span>
              </div>
              <p className="text-sm font-bold text-emerald-600">Layak</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" strokeWidth="6" stroke="#e2e8f0" fill="none" />
                  <circle
                    cx="32" cy="32" r="28" strokeWidth="6" fill="none"
                    stroke="#f59e0b"
                    strokeDasharray={`${(summary.perlu_perhatian / summary.total_diperiksa) * 175.93} 175.93`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {Math.round((summary.perlu_perhatian / summary.total_diperiksa) * 100)}%
                </span>
              </div>
              <p className="text-sm font-bold text-amber-600">Pantauan</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" strokeWidth="6" stroke="#e2e8f0" fill="none" />
                  <circle
                    cx="32" cy="32" r="28" strokeWidth="6" fill="none"
                    stroke="#ef4444"
                    strokeDasharray={`${(summary.tidak_layak / summary.total_diperiksa) * 175.93} 175.93`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {Math.round((summary.tidak_layak / summary.total_diperiksa) * 100)}%
                </span>
              </div>
              <p className="text-sm font-bold text-red-600">Tidak Layak</p>
            </div>
          </>
        ) : (
          <div className="col-span-3 bg-slate-50 rounded-xl p-8 text-center text-slate-500">
            <span className="material-symbols-outlined text-4xl text-slate-300">analytics</span>
            <p className="mt-2">Belum ada data pemeriksaan pada periode ini</p>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Detail Riwayat Pemeriksaan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Mahasiswa</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">NIM</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Prodi</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                    <p className="mt-2">Tidak ada data</p>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{formatDate(record.tanggal)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 text-sm">{record.mahasiswa?.nama || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600">{record.mahasiswa?.nim || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600">{record.mahasiswa?.program_studi?.nama || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ResultBadge result={record.hasil} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {records.length > 0 && (
          <div className="p-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">Menampilkan {records.length} data</p>
          </div>
        )}
      </div>
    </div>
  );
}