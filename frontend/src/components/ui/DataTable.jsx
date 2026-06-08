import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SelectField, SelectOption } from './SelectField';

/**
 * DataTable — Table standar dengan search, pagination, dan action menu
 *
 * Aturan (dari FRONTEND_UI_STYLE_GUIDE.md):
 * - Header: bg var(--theme-bg), text var(--theme-h4), uppercase, tracking-wider
 * - Row: hover bg-[var(--theme-primary-light)], border var(--theme-border-muted)
 * - Pagination: rounded-xl overflow-hidden
 * - Search: bg var(--theme-bg), border var(--theme-border)
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  searchable = true,
  pagination = true,
  pageSize = 10,
  emptyMessage = 'Tidak ada data',
  emptyIcon = 'folder_open',
  onSearch,
  actions,
  onAdd,
  addLabel = 'Tambah',
  filters = [],
  searchPlaceholder = 'Cari...',
}) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [limit, setLimit] = useState(pageSize);

  React.useEffect(() => {
    setLimit(pageSize);
  }, [pageSize]);

  // Search filter
  const searchedData = searchable && onSearch
    ? onSearch(data, search)
    : search
      ? data.filter(row =>
        columns.some(col =>
          String(row[col.key] || '')
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      )
      : data;

  // Selected filters
  const filteredData = searchedData.filter(row => {
    for (const key of Object.keys(selectedFilters)) {
      const val = selectedFilters[key];
      if (val && val !== 'all') {
        if (String(row[key] || '') !== val) {
          return false;
        }
      }
    }
    return true;
  });

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let items = [...filteredData];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle nested paths (e.g. Mahasiswa.Nama)
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aVal = keys.reduce((o, i) => (o ? o[i] : ''), a);
          bVal = keys.reduce((o, i) => (o ? o[i] : ''), b);
        }

        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / limit);
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * limit, currentPage * limit)
    : sortedData;

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-none border font-body"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
      }}
    >
      {/* Table Toolbar */}
      {(searchable || onAdd || filters.length > 0) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 gap-3 border-b" style={{ borderColor: 'var(--theme-border-muted)' }}>
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                search
              </span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearch}
                className="w-full pl-9 pr-4 h-9 rounded-lg text-xs font-semibold outline-none"
                style={{
                  backgroundColor: 'var(--theme-bg)',
                  color: 'var(--theme-text)',
                  border: '1px solid var(--theme-border)',
                }}
              />
            </div>
          )}

          {/* Filters */}
          {filters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {filters.map((f) => (
                <div key={f.key} className="w-40">
                  <SelectField
                    value={selectedFilters[f.key] || 'all'}
                    onValueChange={(val) => {
                      setSelectedFilters(prev => ({ ...prev, [f.key]: val }));
                      setCurrentPage(1);
                    }}
                    placeholder={f.placeholder}
                    className="w-full h-9 text-xs rounded-lg"
                  >
                    <SelectOption value="all">Semua {f.placeholder}</SelectOption>
                    {f.options.map((opt) => (
                      <SelectOption key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectOption>
                    ))}
                  </SelectField>
                </div>
              ))}
            </div>
          )}

          {/* Actions & Add Button */}
          <div className="flex items-center gap-2 sm:ml-auto">
            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="h-9 px-3.5 rounded-lg bg-[var(--theme-primary)] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[var(--theme-primary-hover)] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border-none shadow-sm"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                {addLabel}
              </button>
            )}
            {actions && typeof actions !== 'function' && actions}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full font-body">
          <thead style={{ backgroundColor: 'var(--theme-bg)' }} className="font-headline">
            <tr>
              {columns.map((col) => {
                const isSortable = col.sortable !== false && col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => isSortable && handleSort(col.key)}
                    className={cn(
                      "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider select-none",
                      isSortable && "cursor-pointer hover:text-slate-900 group",
                      col.className
                    )}
                    style={{ color: 'var(--theme-h4)' }}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {isSortable && (
                        sortConfig.key === col.key ? (
                          sortConfig.direction === 'asc' ? (
                            <span className="material-symbols-outlined text-sm text-[var(--theme-primary)]" style={{ fontSize: '14px' }}>expand_less</span>
                          ) : (
                            <span className="material-symbols-outlined text-sm text-[var(--theme-primary)]" style={{ fontSize: '14px' }}>expand_more</span>
                          )
                        ) : (
                          <span className="material-symbols-outlined text-sm text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '14px' }}>unfold_more</span>
                        )
                      )}
                    </div>
                  </th>
                );
              })}
              {(onRowClick || (actions && typeof actions === 'function')) && (
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-h4)' }}>
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t" style={{ borderColor: 'var(--theme-border-muted)' }}>
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-2", col.className, col.cellClassName)}>
                      <div
                        className="h-2.5 rounded animate-pulse"
                        style={{ backgroundColor: 'var(--theme-border-muted)', width: `${60 + Math.random() * 40}%` }}
                      />
                    </td>
                  ))}
                  {(onRowClick || (actions && typeof actions === 'function')) && <td className="px-4 py-2"><div className="h-2.5 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--theme-border-muted)' }} /></td>}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length + (onRowClick || (actions && typeof actions === 'function') ? 1 : 0)} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <span
                      className="material-symbols-outlined text-4xl"
                      style={{ color: 'var(--theme-text-muted)' }}
                    >
                      {emptyIcon}
                    </span>
                    <p className="text-xs font-semibold" style={{ color: 'var(--theme-text-muted)' }}>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="border-t cursor-pointer transition-colors hover:bg-[var(--theme-primary-light)]"
                  style={{ borderColor: 'var(--theme-border-muted)' }}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-2 text-xs font-normal", col.className, col.cellClassName)}
                      style={{ color: 'var(--theme-text)' }}
                    >
                      {col.render ? col.render(row[col.key], row, (currentPage - 1) * limit + idx) : row[col.key]}
                    </td>
                  ))}
                  {(onRowClick || (actions && typeof actions === 'function')) && (
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1.5">
                        {actions && typeof actions === 'function' && actions(row)}
                        {onRowClick && (
                          <button
                            className="p-2 rounded-lg hover:bg-black/[0.05] transition-colors"
                            style={{ color: 'var(--theme-text-muted)' }}
                            onClick={(e) => { e.stopPropagation(); onRowClick(row); }}
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div
          className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 gap-3 border-t"
          style={{ borderColor: 'var(--theme-border-muted)' }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>
              Menampilkan {filteredData.length > 0 ? (currentPage - 1) * limit + 1 : 0}–{Math.min(currentPage * limit, filteredData.length)} dari {filteredData.length} entri
            </span>
            
            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-1.5 text-xs animate-in fade-in duration-200" style={{ color: 'var(--theme-text-muted)' }}>
              <span>Tampilkan</span>
              <div className="relative">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="pl-2 pr-6 py-1 bg-surface border rounded-md text-xs font-bold outline-none cursor-pointer appearance-none"
                  style={{
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                    backgroundColor: 'var(--theme-surface)'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" style={{ fontSize: '14px', color: 'var(--theme-text-muted)' }}>expand_more</span>
              </div>
              <span>entri</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || totalPages <= 1}
              className="px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 hover:bg-black/[0.03] flex items-center gap-1 text-xs font-semibold border border-slate-200 bg-white cursor-pointer"
              style={{ color: 'var(--theme-text)' }}
            >
              <span className="material-symbols-outlined text-base" style={{ fontSize: '16px' }}>chevron_left</span>
              Sebelumnya
            </button>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      style={
                        currentPage === page
                          ? { backgroundColor: 'var(--theme-primary)', color: 'white' }
                          : { color: 'var(--theme-text-muted)' }
                      }
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages <= 1}
              className="px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 hover:bg-black/[0.03] flex items-center gap-1 text-xs font-semibold border border-slate-200 bg-white cursor-pointer"
              style={{ color: 'var(--theme-text)' }}
            >
              Berikutnya
              <span className="material-symbols-outlined text-base" style={{ fontSize: '16px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DataTable };