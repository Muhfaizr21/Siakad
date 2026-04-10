import React from "react"
import { Card, CardContent } from "./card"
import { TrendingUp, TrendingDown } from "lucide-react"

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
  bg = "bg-primary/5"
}) {
  const trendColors = trend === "up" ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown

  return (
    <Card className="border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 rounded-2xl bg-white h-full">
      <CardContent className="p-5 flex items-center justify-between relative">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 truncate">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 font-headline tracking-tighter tabular-nums truncate">
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
        <div className={`${bg} ${color} p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0`}>
          {Icon && <Icon className="size-4" />}
        </div>
      </CardContent>
    </Card>
  )
}
