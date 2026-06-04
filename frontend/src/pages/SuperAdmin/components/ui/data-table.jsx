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
  searchWidth = "max-w-md",
  externalFilters,
  onExternalFilterChange
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [internalFilters, setInternalFilters] = useState({})
  const activeFilters = externalFilters || internalFilters
  const setActiveFilters = onExternalFilterChange || setInternalFilters
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    const safeData = data || []
    return safeData.filter((item) => {
      const matchesSearch = Object.values(item || {}).some(
        (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )

      const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
        if (!value || value === "all") return true
        const itemValue = item[key] !== undefined ? item[key] :
          item[key.toLowerCase()] !== undefined ? item[key.toLowerCase()] :
            item[key.charAt(0).toUpperCase() + key.slice(1)] !== undefined ? item[key.charAt(0).toUpperCase() + key.slice(1)] :
              item[key.toUpperCase()]

        return String(itemValue || "").toLowerCase() === String(value).toLowerCase()
      })
      return matchesSearch && matchesFilters
    })
  }, [data, searchTerm, activeFilters])

  // Sorting Logic
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData]
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle nested objects (like Fakultas.Nama)
        if (aValue && typeof aValue === 'object') aValue = aValue.Nama || aValue.nama || ''
        if (bValue && typeof bValue === 'object') bValue = bValue.Nama || bValue.nama || ''

        // Case-insensitive string comparison
        const aStr = String(aValue || '').toLowerCase()
        const bStr = String(bValue || '').toLowerCase()

        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
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
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
      {/* Premium Toolbar */}
      <div className="p-5 bg-white border-b border-neutral-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-3 gap-y-4 min-h-[44px]">
            <div className={cn("relative group w-full lg:max-w-md", searchWidth)}>
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-300 group-focus-within:text-primary transition-colors" >search</span>
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-11 h-10 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white shadow-none font-medium text-xs font-jakarta transition-all"
              />
            </div>

            {filters.length > 0 && filters.map((filter, idx) => (
              <Select
                key={filter.key || `filter-${idx}`}
                value={activeFilters[filter.key] || "all"}
                onValueChange={(val) => handleFilterChange(filter.key, val)}
              >
                <SelectTrigger className="h-10 w-[160px] rounded-xl border-neutral-200 bg-neutral-50/50 shadow-none font-bold text-[10px] uppercase tracking-widest text-neutral-500 hover:bg-white transition-all">
                  <div className="flex items-center gap-2 truncate w-full pr-2">
                    <Filter className="size-3 text-primary/60 shrink-0" />
                    <div className="truncate flex-1 text-left">
                      {activeFilters[filter.key] && activeFilters[filter.key] !== "all" ? (
                        <SelectValue />
                      ) : (
                        <span>{filter.placeholder}</span>
                      )}
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-neutral-200 shadow-xl p-1 font-jakarta">
                  <SelectItem value="all" className="rounded-lg font-bold text-[10px] uppercase opacity-50 text-neutral-400">Semua Data</SelectItem>
                  {filter.options.map((opt, idx) => (
                    <SelectItem key={opt.value || `opt-${idx}`} value={String(opt.value || '')} className="rounded-lg font-bold text-[10px] uppercase focus:bg-primary/5 focus:text-primary">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            {(searchTerm || Object.values(activeFilters).some(v => v && v !== 'all')) && (
              <Button
                variant="ghost"
                onClick={() => { setSearchTerm(""); setActiveFilters({}); }}
                className="h-10 px-4 text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all uppercase tracking-widest"
              >
                Reset Filter
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onExport && (
              <Button onClick={onExport} variant="outline" className="h-10 px-5 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 shadow-sm gap-2 transition-all active:scale-95 group">
                <Download className="size-3.5 text-primary group-hover:translate-y-0.5 transition-transform duration-300" />
                <span>{exportLabel || "Export"}</span>
              </Button>
            )}

            {onAdd && (
              <Button onClick={onAdd} className="h-10 px-5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-md gap-2 transition-all active:scale-95 border-none">
                <span className="material-symbols-outlined size-4 stroke-[3px]" >add</span>
                <span className="text-[10px] uppercase tracking-widest">{addLabel || "Tambah"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-neutral-100 bg-neutral-50/50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  onClick={() => !col.disableSort && handleSort(col.key)}
                  className={cn(
                    "select-none py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400 font-jakarta",
                    !col.disableSort && "cursor-pointer hover:text-neutral-900 group",
                    col.className
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2 whitespace-nowrap",
                    col.className?.includes("text-center") ? "justify-center" : "",
                    col.className?.includes("text-right") ? "justify-end" : ""
                  )}>
                    {col.label}
                    {!col.disableSort && (
                      sortConfig.key === col.key ? (
                        sortConfig.direction === 'asc'
                          ? <span className="material-symbols-outlined normal-case text-primary shrink-0 select-none animate-none" style={{ fontSize: "14px" }}>expand_less</span>
                          : <span className="material-symbols-outlined normal-case text-primary shrink-0 select-none animate-none" style={{ fontSize: "14px" }}>expand_more</span>
                      ) : (
                        <span className="material-symbols-outlined normal-case text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 select-none" style={{ fontSize: "14px" }}>unfold_more</span>
                      )
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="w-[100px] text-right py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400 font-jakarta">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i} className="border-neutral-50">
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-5">
                      <div className="h-4 bg-neutral-50 rounded-md w-full animate-pulse" />
                    </TableCell>
                  ))}
                  <TableCell className="text-right py-5">
                    <div className="h-4 bg-neutral-50 rounded-md w-8 ml-auto animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <TableRow key={row.id || row.ID || i} className="group transition-colors border-neutral-50 hover:bg-neutral-50/30">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn("py-4 text-sm font-medium text-neutral-600 truncate", col.className, col.cellClassName)}>
                      <div className={cn(
                        "truncate",
                        col.className?.includes("text-center") ? "text-center" : "",
                        col.className?.includes("text-right") ? "text-right" : ""
                      )}>
                        {col.render ? col.render(row[col.key], row) : row[col.key] || "-"}
                      </div>
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right py-4">
                      <div className="flex justify-end items-center">
                        {actions(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-72 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="size-16 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-300 border border-neutral-100">
                      <span className="material-symbols-outlined" style={{ fontSize: '32px' }}  strokeWidth={1.5}>search</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-neutral-900 font-jakarta">Data Tidak Ditemukan</p>
                      <p className="text-xs text-neutral-400 font-medium">Coba gunakan kata kunci atau filter lain</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-xs font-bold text-neutral-900 font-jakarta tracking-tight">
            <span className="text-neutral-400 font-medium mr-2">Menampilkan</span>
            {(currentPage - 1) * pageSize + 1} — {Math.min(currentPage * pageSize, totalItems)} 
            <span className="text-neutral-300 mx-2">of</span>
            <span className="text-primary">{totalItems} Data</span>
          </p>

          <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-jakarta">Baris :</span>
            <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 w-[100px] rounded-xl border-neutral-200 bg-white font-bold text-[11px] shadow-sm flex items-center justify-center pl-4 pr-10 relative">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-neutral-200 shadow-xl p-1 font-jakarta">
                {[5, 10, 15, 25, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="rounded-lg font-bold text-[11px] py-2 focus:bg-primary/5 focus:text-primary">
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
            className="h-9 px-4 rounded-xl border-neutral-200 bg-white text-neutral-600 font-bold text-[10px] uppercase tracking-widest shadow-sm disabled:opacity-40 transition-all hover:bg-white active:scale-95"
          >
            <ChevronLeft size={14} className="mr-1 text-primary" />
            Prev
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
                    "size-8 rounded-lg font-bold text-[11px] transition-all duration-200",
                    currentPage === pageNum
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                      : "text-neutral-400 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200"
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
            className="h-9 px-4 rounded-xl border-neutral-200 bg-white text-neutral-600 font-bold text-[10px] uppercase tracking-widest shadow-sm disabled:opacity-40 transition-all hover:bg-white active:scale-95"
          >
            Next
            <span className="material-symbols-outlined ml-1 text-primary" size={14}>chevron_right</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
