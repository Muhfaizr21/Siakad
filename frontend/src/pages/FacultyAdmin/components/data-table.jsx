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
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Download,
  Filter,
  MoreVertical,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { cn } from "@/lib/utils"

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
  filters = []
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
      const matchesSearch = Object.values(item || {}).some(
        (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )

      const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
        if (!value || value === "all") return true
        return String(item[key]) === String(value)
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
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm transition-all duration-500">
      {/* Premium Toolbar */}
      <div className="p-6 pb-4 bg-gradient-to-b from-slate-50/50 to-white flex flex-col gap-5 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-11 h-11 rounded-2xl border-slate-200 bg-white/80 focus:bg-white shadow-sm font-bold text-xs font-headline transition-all"
              />
            </div>
            
            {filters.map((filter) => (
              <Select
                key={filter.key}
                onValueChange={(val) => handleFilterChange(filter.key, val)}
              >
                <SelectTrigger className="h-11 w-[160px] rounded-2xl border-slate-200 bg-white shadow-sm font-black text-[10px] uppercase tracking-widest text-slate-500 focus:ring-primary/20">
                  <div className="flex items-center gap-2">
                    <Filter className="size-3 text-primary/60" />
                    <SelectValue placeholder={filter.placeholder} />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-1 font-headline">
                  <SelectItem value="all" className="rounded-xl font-bold text-[10px] p-3 uppercase opacity-50">Semua Data</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-xl font-bold text-[10px] p-3 uppercase focus:bg-primary/5 focus:text-primary">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {onExport && (
              <Button onClick={onExport} variant="outline" className="h-11 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-white text-slate-700 border-slate-200/60 hover:bg-slate-50 shadow-sm gap-2.5 transition-all hover:scale-[1.02] active:scale-95 group">
                <Download className="size-3.5 text-primary group-hover:translate-y-0.5 transition-transform duration-300" />
                <span>{exportLabel || "Export"}</span>
              </Button>
            )}

            {onAdd && (
              <Button onClick={onAdd} className="h-11 px-6 rounded-2xl font-black bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 gap-2.5 transition-all hover:scale-[1.02] active:scale-95 border-none">
                <Plus className="size-4 stroke-[4px]" />
                <span className="text-[10px] uppercase tracking-[0.2em]">{addLabel || "Tambah"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-b border-slate-200/50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  onClick={() => !col.disableSort && handleSort(col.key)}
                  className={`px-8 py-5 font-black text-[10px] text-slate-400 font-headline select-none uppercase tracking-[0.2em] ${!col.disableSort ? 'cursor-pointer hover:text-slate-900 group' : ''} ${col.className}`}
                >
                  <div className={`flex items-center gap-2 w-full ${col.className?.includes("text-center") ? "justify-center" : ""} ${col.className?.includes("text-right") ? "justify-end" : ""}`}>
                    {col.label}
                    {!col.disableSort && (
                      sortConfig.key === col.key ? (
                        sortConfig.direction === 'asc'
                          ? <ChevronUp className="size-3.5 text-primary" />
                          : <ChevronDown className="size-3.5 text-primary" />
                      ) : (
                        <ChevronsUpDown className="size-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="px-8 py-5 font-black text-[10px] text-slate-400 font-headline text-right uppercase tracking-[0.2em]">Otomasi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i} className="animate-pulse border-b border-slate-50">
                  {columns.map((col) => (
                    <TableCell key={col.key} className="px-8 py-5">
                      <div className="h-4 bg-slate-100 rounded-md w-full opacity-50" />
                    </TableCell>
                  ))}
                  <TableCell className="px-8 py-5 text-right">
                    <div className="h-4 bg-slate-100 rounded-md w-8 ml-auto opacity-50" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <TableRow
                  key={row.id || i}
                  className="hover:bg-slate-50/60 border-b border-slate-100/60 transition-colors group cursor-default"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn("px-8 py-5 font-headline", col.cellClassName)}>
                      {col.render ? col.render(row[col.key], row) : <span className="text-[13px] font-bold text-slate-600">{row[col.key] || "-"}</span>}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="px-8 py-5 text-right">
                      <div className="flex justify-end items-center transition-all">
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
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-500">
                    <div className="size-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                      <Search className="size-8 stroke-[1.5px]" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-[11px] uppercase tracking-widest text-slate-900 font-headline">Data Tidak Ditemukan</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coba ubah kata kunci atau filter pencarian Anda</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modern Pagination Footer */}
      <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
            <div className="flex flex-col leading-tight">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] font-headline">Showing Results</p>
                <p className="text-[11px] font-black text-slate-900 font-headline uppercase">
                    {(currentPage - 1) * pageSize + 1} — {Math.min(currentPage * pageSize, totalItems)} <span className="text-primary mx-1">/</span> {totalItems} Entri
                </p>
            </div>
            
            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none font-headline">Baris :</span>
                <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 w-20 rounded-xl border-slate-200 bg-white font-black text-[10px] shadow-sm focus:ring-primary/20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1 font-headline">
                        {[5, 10, 15, 25, 50].map((size) => (
                            <SelectItem key={size} value={String(size)} className="rounded-lg font-black text-[10px] py-2 focus:bg-primary/5 focus:text-primary">
                                {size} Rows
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="h-10 px-5 rounded-2xl border-slate-200 bg-white text-slate-600 font-black text-[9px] uppercase tracking-[0.2em] shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all hover:-translate-x-0.5"
          >
            <ChevronLeft className="size-3.5 mr-2 text-primary" />
            Prev
          </Button>
          
          <div className="flex items-center gap-1.5 px-3">
             {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = i + 1;
                // Simple logic for showing pages around current
                if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 3 + i;
                if (pageNum > totalPages) return null;

                return (
                    <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                            "size-8 rounded-xl font-black text-[10px] transition-all duration-300",
                            currentPage === pageNum 
                                ? "bg-primary text-white shadow-lg shadow-primary/25 scale-110" 
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
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
            className="h-10 px-5 rounded-2xl border-slate-200 bg-white text-slate-600 font-black text-[9px] uppercase tracking-[0.2em] shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all hover:translate-x-0.5"
          >
            Next
            <ChevronRight className="size-3.5 ml-2 text-primary" />
          </Button>
        </div>
      </div>
    </div>
  )
}
