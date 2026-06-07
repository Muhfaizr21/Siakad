import React, { useState } from 'react';
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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
      }}
    >
      {/* Table Toolbar */}
      {(searchable || onAdd || filters.length > 0) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 gap-3 border-b" style={{ borderColor: 'var(--theme-border-muted)' }}>
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                search
              </span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 h-10 rounded-xl text-sm outline-none"
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
                    className="w-full h-10"
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
                className="h-10 px-4 rounded-xl bg-[var(--theme-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--theme-primary-hover)] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border-none shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                {addLabel}
              </button>
            )}
            {actions && typeof actions !== 'function' && actions}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--theme-bg)' }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 text-left text-xs font-bold uppercase tracking-wider", col.className)}
                  style={{ color: 'var(--theme-h4)' }}
                >
                  {col.label}
                </th>
              ))}
              {(onRowClick || (actions && typeof actions === 'function')) && (
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-h4)' }}>
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
                    <td key={col.key} className={cn("px-4 py-3", col.className, col.cellClassName)}>
                      <div
                        className="h-4 rounded animate-pulse"
                        style={{ backgroundColor: 'var(--theme-border-muted)', width: `${60 + Math.random() * 40}%` }}
                      />
                    </td>
                  ))}
                  {(onRowClick || (actions && typeof actions === 'function')) && <td className="px-4 py-3"><div className="h-4 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--theme-border-muted)' }} /></td>}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length + (onRowClick || (actions && typeof actions === 'function') ? 1 : 0)} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <span
                      className="material-symbols-outlined text-4xl"
                      style={{ color: 'var(--theme-text-muted)' }}
                    >
                      {emptyIcon}
                    </span>
                    <p style={{ color: 'var(--theme-text-muted)' }}>{emptyMessage}</p>
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
                      className={cn("px-4 py-3 text-sm", col.className, col.cellClassName)}
                      style={{ color: 'var(--theme-text)' }}
                    >
                      {col.render ? col.render(row[col.key], row, (currentPage - 1) * pageSize + idx) : row[col.key]}
                    </td>
                  ))}
                  {(onRowClick || (actions && typeof actions === 'function')) && (
                    <td className="px-4 py-3">
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
      {pagination && totalPages > 1 && (
        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: 'var(--theme-border-muted)' }}
        >
          <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            Menampilkan {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredData.length)} dari {filteredData.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 rounded-lg text-xs font-bold transition-colors"
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
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DataTable };