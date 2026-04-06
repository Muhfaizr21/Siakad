import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/pages/FacultyAdmin/components/table"
import { Input } from "@/pages/FacultyAdmin/components/input"
import { Button } from "@/pages/FacultyAdmin/components/button"
import { Search, Plus, Filter, Download, MoreVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/pages/FacultyAdmin/components/card"

export function DataTable({
  title,
  description,
  columns,
  data,
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
    <Card className="glass-card hover:shadow-md transition-all duration-300 border-none overflow-hidden bg-background/60 backdrop-blur-md">
      <CardHeader className="p-6 pb-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl font-bold font-headline">{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            {onAdd && (
              <Button size="sm" onClick={onAdd} className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                {addLabel || "Tambah"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder || "Search..."}
              className="pl-9 bg-surface border-0 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
             {filters && filters.map((filter) => (
               <Button key={filter.key} variant="secondary" size="sm" className="rounded-xl gap-2 shrink-0">
                  <Filter className="h-4 w-4" />
                  {filter.placeholder}
               </Button>
             ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 uppercase tracking-widest text-[10px] font-bold text-slate-500">
              <TableRow className="hover:bg-transparent border-0">
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.label}
                  </TableHead>
                ))}
                {actions && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, i) => (
                <TableRow key={i} className="group hover:bg-slate-50 transition-colors border-slate-50">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.cellClassName}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {actions(row)}
                      </div>
                      <div className="flex justify-end group-hover:hidden">
                        <MoreVertical className="h-4 w-4 text-slate-300" />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-10 text-muted-foreground h-40">
                    Tidak ada data ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
