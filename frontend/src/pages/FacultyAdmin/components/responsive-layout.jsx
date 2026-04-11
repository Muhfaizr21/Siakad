import React from 'react'
import { cn } from "@/lib/utils"

/**
 * PageContainer - Pembungkus utama halaman yang menjamin padding konsisten
 */
export const PageContainer = ({ children, className }) => (
  <div className={cn("space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-12", className)}>
    {children}
  </div>
)

/**
 * PageHeader - Header halaman yang responsif dengan icon dan teks
 */
export const PageHeader = ({ icon: Icon, title, description, children }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div className="flex items-center gap-4">
      {Icon && (
        <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm shadow-primary/5">
          <Icon className="size-6 md:size-7" />
        </div>
      )}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase font-headline">
          {title}
        </h1>
        {description && (
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2">
      {children}
    </div>
  </div>
)

/**
 * ResponsiveGrid - Grid otomatis yang menyesuaikan layar
 */
export const ResponsiveGrid = ({ children, cols = 3, className }) => {
  const colMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }
  return (
    <div className={cn("grid gap-4 md:gap-6", colMap[cols] || colMap[3], className)}>
      {children}
    </div>
  )
}

/**
 * ResponsiveCard - Card yang dioptimasi untuk mobile (padding menyesuaikan)
 */
export const ResponsiveCard = ({ children, className, noPadding = false }) => (
  <div className={cn(
    "bg-white border border-slate-200 shadow-sm rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5",
    className
  )}>
    <div className={cn(noPadding ? "" : "p-5 md:p-8")}>
      {children}
    </div>
  </div>
)
