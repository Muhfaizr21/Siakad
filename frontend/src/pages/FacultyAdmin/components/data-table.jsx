import React, { useState } from "react"
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
import { Search, Plus, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export function DataTable({
  title,
  description,
  columns,
  data,
  loading,
  searchPlaceholder,
  filters,
  onAdd,
  addLabel,
  actions,
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter((row) =>
    Object.values(row).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="px-8 py-6 border-b border-outline-variant/10 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-lg font-headline text-on-surface uppercase tracking-tight">{title}</h3>
          {description && <p className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-widest mt-1">{description}</p>}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50" />
            <Input
              placeholder={searchPlaceholder || "Cari..."}
              className="pl-10 h-10 rounded-xl border-outline-variant/20 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {filters && filters.map((filter) => (
            <Select key={filter.key} defaultValue={filter.defaultValue}>
              <SelectTrigger className="w-full sm:w-40 h-10 rounded-xl border-outline-variant/20 font-medium text-[11px] uppercase tracking-widest bg-slate-50/50">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-outline-variant/10 shadow-xl">
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-[11px] uppercase tracking-widest font-medium focus:bg-primary/5 focus:text-primary">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {onAdd && (
            <Button 
              onClick={onAdd} 
              className="w-full sm:w-auto h-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 font-medium text-[11px] uppercase tracking-widest px-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              {addLabel || "Tambah"}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fcfcfd] hover:bg-[#fcfcfd] border-b border-outline-variant/5">
              {columns.map((col) => (
                <TableHead key={col.key} className={`px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant ${col.className}`}>
                  {col.label}
                </TableHead>
              ))}
              {actions && <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                   {columns.map((col) => (
                     <TableCell key={col.key} className="px-8 py-6">
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                     </TableCell>
                   ))}
                   {actions && <TableCell className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-10 ml-auto"></div></TableCell>}
                </TableRow>
              ))
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-24 h-64">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                      <Search className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant/60 uppercase tracking-widest">Tidak ada data ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.map((row, i) => (
              <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
                {columns.map((col) => (
                  <TableCell key={col.key} className={`px-8 py-6 ${col.cellClassName}`}>
                    {col.render ? col.render(row[col.key], row) : (
                      <span className="text-[13px] font-medium text-on-surface">{row[col.key]}</span>
                    )}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                       {actions(row)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
