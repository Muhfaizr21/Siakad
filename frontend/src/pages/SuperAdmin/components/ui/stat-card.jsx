import React from "react"
import { Card, CardContent } from "./card"
import { cn } from "@/lib/utils"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Icon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>info</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const TrendingUp = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>trending_up</span>;
const TrendingDown = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>trending_down</span>;




export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  loading = false,
  color = "text-primary",
  bg = "bg-primary/5",
  badge
}) {
  const trendColors = trend === "up" ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown

  return (
    <Card className="border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 rounded-2xl bg-white h-full">
      <CardContent className="p-5 flex items-center justify-between relative">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 truncate">{title}</p>
            {badge}
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className={cn(
              "font-black text-slate-900 font-headline tracking-tighter tabular-nums",
              String(value || '').length > 12 
                ? "text-[15px] sm:text-base" 
                : String(value || '').length > 9 
                  ? "text-lg sm:text-xl" 
                  : "text-2xl"
            )}>
              {loading ? "..." : value}
            </h3>
            {trend && (
              <div className={`flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${trendColors}`}>
                <TrendIcon className="size-2.5" />
                {trendValue}
              </div>
            )}
          </div>
          {description && (
            <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-tight truncate">
              {description}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0`}>
          {Icon && <Icon size={20} className="leading-none" />}
        </div>
      </CardContent>
    </Card>
  )
}
