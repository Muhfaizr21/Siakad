"use client"

import React, { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import { Input } from "./input"
import { Button } from "./button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { cn } from "@/lib/utils"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const ChevronUp = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>expand_less</span>;
const ChevronsUpDown = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>unfold_more</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Filter = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>filter_alt</span>;
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;
const ChevronLeft = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chevron_left</span>;



export function DataTable({
  columns,
  data = [],
  loading = false,
  searchPlaceholder = "Cari data...",
  onAdd,
  addLabel = "Tambah Data",
  onExport,
  exportLabel = "Export",
  actions,
  filters = [],
  title = "Daftar Data",
  itemLabel = "data"
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    const safeData = data || []
    return safeData.filter((item) => {
      const matchesSearch = !searchTerm 
        ? true 
        : Object.values(item || {}).some(
            (val) => val && typeof val !== 'object' && String(val).toLowerCase().includes(searchTerm.toLowerCase())
          )

      const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
        if (!value || value === "all") return true
        
        // Find property case-insensitively in case JSON properties differ (e.g. status vs Status)
        const itemKey = Object.keys(item || {}).find(k => k.toLowerCase() === key.toLowerCase()) || key
        const itemVal = item[itemKey]
        
        if (itemVal === undefined || itemVal === null) return false
        
        // Case-insensitive exact value comparison to handle casing mismatches (e.g. "Draft" vs "draft")
        return String(itemVal).toLowerCase().trim() === String(value).toLowerCase().trim()
      })

      return matchesSearch && matchesFilters
    })
  }, [data, searchTerm, activeFilters])

  // Sorting Logic
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData]
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableItems
  }, [filteredData, sortConfig])

  // Pagination Logic
  const totalItems = sortedData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col h-full bg-white border border-slate-100/50 rounded-3xl shadow-sm overflow-hidden transition-all duration-500">
      {/* Premium Toolbar */}
      <div className="px-5 py-4 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-slate-100">
        <div className="flex-1">
          <h2 className="font-bold text-base font-headline" style={{ color: 'var(--theme-h2)' }}>{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Menampilkan <span className="font-bold text-slate-900">{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> sampai <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, totalItems)}</span> dari <span className="font-bold text-primary">{totalItems}</span> {itemLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 gap-y-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" style={{ fontSize: "14px" }}>search</span>
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 h-9 rounded-xl border-slate-200/60 bg-white focus:outline-none focus:border-primary text-sm font-medium transition-all w-52"
            />
          </div>
          
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || "all"}
              onValueChange={(val) => handleFilterChange(filter.key, val)}
            >
              <SelectTrigger className="h-9 w-[190px] rounded-xl border-slate-200/60 bg-neutral-50/50 hover:bg-white shadow-none font-medium text-xs text-slate-600 focus:ring-primary/20 transition-all">
                <div className="truncate flex-1 text-left font-jakarta">
                  {activeFilters[filter.key] && activeFilters[filter.key] !== "all" ? (
                    <SelectValue />
                  ) : (
                    <span>{filter.placeholder}</span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200/60 shadow-xl p-1 font-jakarta">
                <SelectItem value="all" className="rounded-lg font-medium text-xs opacity-50 text-neutral-400">Semua Data</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value || '')} className="rounded-lg font-medium text-xs focus:bg-primary/5 focus:text-primary">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {(searchTerm || Object.values(activeFilters).some(v => v && v !== 'all')) && (
            <button
              onClick={() => { setSearchTerm(""); setActiveFilters({}); setCurrentPage(1); }}
              className="h-9 px-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Reset
            </button>
          )}

          {onExport && (
            <Button onClick={onExport} variant="outline" className="h-9 px-4 rounded-xl font-bold text-xs bg-white text-slate-700 border-slate-200/60 hover:bg-slate-50 shadow-sm gap-2 transition-all hover:scale-[1.02] active:scale-95 group">
              <Download className="size-3.5 text-primary group-hover:translate-y-0.5 transition-transform duration-300" />
              <span>{exportLabel || "Export"}</span>
            </Button>
          )}

          {onAdd && (
            <Button onClick={onAdd} className="h-9 px-4 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-md gap-2 transition-all hover:scale-[1.02] active:scale-95 border-none">
              <span className="material-symbols-outlined size-4 stroke-[4px]" style={{ fontSize: "14px" }}>add</span>
              <span className="text-xs uppercase tracking-wider">{addLabel || "Tambah"}</span>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <Table className="w-full table-fixed min-w-[900px]">
          <TableHeader>
            <TableRow className="bg-white border-b border-slate-200/60">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  onClick={() => !col.disableSort && handleSort(col.key)}
                  className={`px-5 py-3.5 font-bold text-xs text-slate-400 select-none uppercase tracking-wider ${!col.disableSort ? 'cursor-pointer hover:text-slate-900 group' : ''} ${col.className}`}
                >
                  <div className={`flex items-center gap-1.5 w-full ${col.className?.includes("text-center") ? "justify-center" : ""} ${col.className?.includes("text-right") ? "justify-end" : ""}`}>
                    {col.label}
                    {!col.disableSort && (
                      sortConfig.key === col.key ? (
                        sortConfig.direction === 'asc'
                          ? <span className="material-symbols-outlined normal-case text-primary shrink-0 select-none" style={{ fontSize: "14px" }}>expand_less</span>
                          : <span className="material-symbols-outlined normal-case text-primary shrink-0 select-none" style={{ fontSize: "14px" }}>expand_more</span>
                      ) : (
                        <span className="material-symbols-outlined normal-case text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 select-none" style={{ fontSize: "14px" }}>unfold_more</span>
                      )
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="px-5 py-3.5 font-bold text-xs text-slate-400 text-right uppercase tracking-wider">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i} className="border-b border-slate-100">
                  {columns.map((col) => (
                    <TableCell key={col.key} className="px-5 py-3.5">
                      <div className="h-4 bg-slate-50 rounded animate-pulse" />
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="px-5 py-3.5 text-right">
                      <div className="h-4 bg-slate-50 rounded w-8 ml-auto animate-pulse" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : paginatedData.length > 0 ? (
              <>
                {paginatedData.map((row, i) => (
                  <TableRow
                    key={row.id || row.ID || i}
                    className="hover:bg-[#fafbff] border-b border-[#f5f5f5] transition-colors group cursor-default"
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={cn("px-5 py-3.5 font-body", col.cellClassName)}>
                        {col.render ? col.render(row[col.key], row, (currentPage - 1) * pageSize + i) : <span className="text-sm font-bold text-slate-600">{row[col.key] || "-"}</span>}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell className="px-5 py-3.5 text-right">
                        <div className="flex justify-end items-center transition-all">
                          {actions(row)}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {paginatedData.length < pageSize && Array.from({ length: pageSize - paginatedData.length }).map((_, idx) => (
                  <TableRow key={`filler-${idx}`} className="border-b border-[#f5f5f5]/30 hover:bg-transparent pointer-events-none select-none">
                    {columns.map((col) => (
                      <TableCell key={`filler-cell-${col.key}`} className="px-5 py-3.5 opacity-0">
                        <div className="h-5" />
                      </TableCell>
                    ))}
                    {actions && <TableCell className="px-5 py-3.5 opacity-0"><div className="h-5" /></TableCell>}
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-5 py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in duration-500">
                    <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined" style={{ fontSize: "22px" }} >search</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-slate-900">Data Tidak Ditemukan</p>
                      <p className="text-xs text-slate-400">Coba ubah kata kunci atau filter pencarian Anda</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modern Pagination Footer */}
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Menampilkan <span className="font-semibold text-slate-800">{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> sampai <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, totalItems)}</span> dari <span className="font-semibold text-slate-800">{totalItems}</span> entri
          </p>
          
          <div className="hidden sm:block h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Baris per halaman:</span>
            <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 w-24 rounded-lg border-slate-200 bg-white font-semibold text-xs shadow-sm focus:ring-primary/20 px-2.5 py-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1 font-body">
                {[5, 10, 15, 25, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="rounded-lg text-xs py-1.5 focus:bg-primary/5 focus:text-primary">
                    {size} Baris
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="h-8 px-3 rounded-lg border-slate-200 bg-white text-slate-600 font-semibold text-xs shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all active:scale-95"
          >
            <ChevronLeft className="size-3.5 mr-1 text-primary" />
            Sebelumnya
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 3 + i;
              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-200",
                    currentPage === pageNum 
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading || totalPages === 0}
            className="h-8 px-3 rounded-lg border-slate-200 bg-white text-slate-600 font-semibold text-xs shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all active:scale-95"
          >
            Berikutnya
            <span className="material-symbols-outlined ml-1 text-primary" style={{ fontSize: "15px" }}>chevron_right</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
