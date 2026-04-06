import React from "react"
import { Card, CardContent } from "@/pages/FacultyAdmin/components/card"
import { TrendingUp, TrendingDown } from "lucide-react"

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default'
}) {
  const trendColors = trend === "up" ? "text-success" : "text-destructive"
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown

  return (
    <Card className="border-0 shadow-sm overflow-hidden bg-surface-container-lowest h-full transition-all hover:translate-y-[-2px] hover:shadow-xl">
      <CardContent className="flex items-center gap-5 p-6">
        <div className={`rounded-3xl p-4 flex items-center justify-center shrink-0 ${variant === 'primary' ? 'bg-primary-container text-primary-fixed' : 'bg-surface-container-high'}`}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-1 truncate">{title}</p>
          <div className="flex items-end gap-2 mb-1">
            <p className="text-3xl font-headline font-extrabold text-primary leading-none truncate">{value}</p>
            {trend && (
              <div className={`flex items-center text-[11px] font-bold mb-[2px] ${trendColors}`}>
                <TrendIcon className="h-3 w-3 mr-1" />
                {trendValue}
              </div>
            )}
          </div>
          {description && <p className="text-xs text-muted-foreground font-medium truncate">{description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
