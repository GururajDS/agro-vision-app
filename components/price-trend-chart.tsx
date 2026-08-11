"use client"

import type { PricePoint } from "@/lib/price-history"

export function PriceTrendChart({ data }: { data: PricePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No price history yet for this commodity.
      </div>
    )
  }

  if (data.length === 1) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        <p>Only one data point so far — check back after a few more days.</p>
        <p className="font-medium text-foreground">₹{data[0].price.toLocaleString("en-IN")}</p>
      </div>
    )
  }

  const width = 600
  const height = 220
  const padding = { top: 16, right: 16, bottom: 28, left: 48 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const prices = data.map((d) => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW
    const y = padding.top + chartH - ((d.price - minPrice) / priceRange) * chartH
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

  const latest = data[data.length - 1]
  const first = data[0]
  const change = latest.price - first.price
  const changePct = first.price ? (change / first.price) * 100 : 0

  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="font-heading text-2xl font-bold text-foreground">
          ₹{latest.price.toLocaleString("en-IN")}
        </span>
        <span className={`text-sm font-medium ${change >= 0 ? "text-primary" : "text-destructive"}`}>
          {change >= 0 ? "▲" : "▼"} {Math.abs(changePct).toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground">over this period</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" fontSize="10" fill="var(--muted-foreground)">
          ₹{maxPrice.toLocaleString("en-IN")}
        </text>
        <text x={padding.left - 8} y={padding.top + chartH} textAnchor="end" fontSize="10" fill="var(--muted-foreground)">
          ₹{minPrice.toLocaleString("en-IN")}
        </text>

        <path d={areaPath} fill="var(--primary)" opacity="0.08" />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2" />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5} fill="var(--primary)" />
        ))}

        <text x={points[0].x} y={height - 6} textAnchor="start" fontSize="10" fill="var(--muted-foreground)">
          {first.date}
        </text>
        <text x={points[points.length - 1].x} y={height - 6} textAnchor="end" fontSize="10" fill="var(--muted-foreground)">
          {latest.date}
        </text>
      </svg>
    </div>
  )
}
