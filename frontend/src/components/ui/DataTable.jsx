import React, { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * DataTable — Table standar dengan search, pagination, filter, dan selection
 *
 * Aturan (dari FRONTEND_UI_STYLE_GUIDE.md):
 * - Header: bg var(--theme-bg), text var(--theme-h4), uppercase, tracking-wider
 * - Row: hover bg-black/[0.02], border var(--theme-border-muted)
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
  // New props for selection and filtering
  enableRowSelection = false,
  selectedRows = [],
  onSelectedRowsChange,
  filters = [],
  externalFilters,
  onExternalFilterChange,
  searchPlaceholder = 'Cari...',
  onAdd,
  addLabel = 'Tambah',
  sortConfig,
  onSort,
}) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [internalFilters, setInternalFilters] = useState({});

  const activeFilters = externalFilters || internalFilters;
  const setActiveFilters = onExternalFilterChange || setInternalFilters;

  // Retrieve nested object property value (e.g. 'Beasiswa.Nama' -> item.Beasiswa.Nama)
  const getRowValue = (item, path) => {
    if (!path) return undefined;
    if (!path.includes('.')) return item[path];
    return path.split('.').reduce((acc, part) => acc && acc[part], item);
  };

  // 1. Filter data based on dropdown filters
  let filteredData = data;
  if (filters && filters.length > 0) {
    filteredData = filteredData.filter(row => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        const rowVal = getRowValue(row, key);
        return String(rowVal || '').toLowerCase() === String(value).toLowerCase();
      });
    });
  }

  // 2. Filter data based on search
  if (search) {
    if (searchable && onSearch) {
      filteredData = onSearch(filteredData, search);
    } else {
      filteredData = filteredData.filter(row =>
        columns.some(col => {
          const rowVal = col.render ? col.render(row[col.key], row) : getRowValue(row, col.key);
          const cleanVal = typeof rowVal === 'string' || typeof rowVal === 'number'
            ? String(rowVal)
            : String(getRowValue(row, col.key) || '');
          return cleanVal.toLowerCase().includes(search.toLowerCase());
        })
      );
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Selection handlers
  const displayedRowIds = paginatedData.map(row => row.id || row.ID);
  const isAllSelected = displayedRowIds.length > 0 && displayedRowIds.every(id => selectedRows.includes(id));

  const handleSelectAll = () => {
    if (!onSelectedRowsChange) return;
    if (isAllSelected) {
      const newSelected = selectedRows.filter(id => !displayedRowIds.includes(id));
      onSelectedRowsChange(newSelected);
    } else {
      const newSelected = [...selectedRows, ...displayedRowIds.filter(id => !selectedRows.includes(id))];
      onSelectedRowsChange(newSelected);
    }
  };

  const handleRowSelect = (e, row) => {
    e.stopPropagation();
    if (!onSelectedRowsChange) return;
    const id = row.id || row.ID;
    const isSelected = selectedRows.includes(id);
    const newSelected = isSelected
      ? selectedRows.filter(x => x !== id)
      : [...selectedRows, id];
    onSelectedRowsChange(newSelected);
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
      }}
    >
      {/* Table Toolbar */}
      {searchable && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b gap-3" style={{ borderColor: 'var(--theme-border-muted)' }}>
          <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center gap-3 w-full">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
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
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: 'var(--theme-bg)',
                  color: 'var(--theme-text)',
                  border: '1px solid var(--theme-border)',
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            {filters && filters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {filters.map((filter) => (
                  <select
                    key={filter.key}
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const next = { ...activeFilters, [filter.key]: val };
                      if (!val) {
                        delete next[filter.key];
                      }
                      setActiveFilters(next);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold outline-none border cursor-pointer transition-all"
                    style={{
                      backgroundColor: 'var(--theme-bg)',
                      color: 'var(--theme-text)',
                      borderColor: 'var(--theme-border)',
                    }}
                  >
                    <option value="">{filter.placeholder || 'Semua Beasiswa'}</option>
                    {filter.options && filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {actions && typeof actions !== 'function' && actions}
            {onAdd && (
              <button
                onClick={onAdd}
                className="h-9 px-4 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest gap-2 flex items-center transition-all active:scale-95 shadow-none border-none cursor-pointer"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                {addLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--theme-bg)' }}>
            <tr>
              {enableRowSelection && (
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer size-4"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortConfig?.key === col.key
                const sortDir = isSorted ? sortConfig.direction : null
                return (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider select-none",
                    col.className,
                    col.sortable && 'cursor-pointer hover:text-primary transition-colors'
                  )}
                  style={{ color: 'var(--theme-h4)' }}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <span className="material-symbols-outlined text-sm" style={{ fontSize: '14px' }}>
                        {isSorted ? (sortDir === 'asc' ? 'expand_less' : 'expand_more') : 'unfold_more'}
                      </span>
                    )}
                  </div>
                </th>
                )
              })}
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
                  {enableRowSelection && (
                    <td className="px-4 py-3 w-10">
                      <div className="w-4 h-4 rounded animate-pulse" style={{ backgroundColor: 'var(--theme-border-muted)' }} />
                    </td>
                  )}
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
                <td colSpan={columns.length + (enableRowSelection ? 1 : 0) + (onRowClick || (actions && typeof actions === 'function') ? 1 : 0)} className="px-4 py-16 text-center">
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
              paginatedData.map((row, idx) => {
                const rowId = row.id || row.ID;
                const isRowSelected = selectedRows.includes(rowId);
                return (
                  <tr
                    key={rowId || idx}
                    className={cn(
                      "border-t cursor-pointer transition-colors hover:bg-black/[0.02]",
                      isRowSelected && "bg-[#00236F]/5 hover:bg-[#00236F]/10"
                    )}
                    style={{ borderColor: 'var(--theme-border-muted)' }}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {enableRowSelection && (
                      <td className="px-4 py-3 w-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={(e) => handleRowSelect(e, row)}
                          className="rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer size-4"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("px-4 py-3 text-sm", col.className, col.cellClassName)}
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {col.render ? col.render(row[col.key], row) : getRowValue(row, col.key)}
                      </td>
                    ))}
                    {(onRowClick || (actions && typeof actions === 'function')) && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                );
              })
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
            {Array.from({ length: totalPages }, (_, i) => {
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