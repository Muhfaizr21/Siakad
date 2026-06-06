import React, { useState } from 'react';

/**
 * DataTable — Table standar dengan search, pagination, dan action menu
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
}) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search
  const filteredData = searchable && onSearch
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
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
      }}
    >
      {/* Table Toolbar */}
      {searchable && (
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--theme-border-muted)' }}>
          <div className="relative flex-1 max-w-sm">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm"
              style={{
                backgroundColor: 'var(--theme-bg)',
                color: 'var(--theme-text)',
                border: '1px solid var(--theme-border)',
              }}
            />
          </div>
          {actions && typeof actions !== 'function' && <div className="flex items-center gap-2 ml-4">{actions}</div>}
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
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
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
                    <td key={col.key} className="px-4 py-3">
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
                  className="border-t cursor-pointer transition-colors hover:bg-black/[0.02]"
                  style={{ borderColor: 'var(--theme-border-muted)' }}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
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