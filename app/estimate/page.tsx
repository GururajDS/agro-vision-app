"use client"

import { useEffect, useState } from "react"
import { TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { getHarvestEstimate, type HarvestEstimate } from "@/lib/estimate"

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  )
}

function EstimateView() {
  const [data, setData] = useState<HarvestEstimate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHarvestEstimate().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mx-auto max-w-2xl p-5">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <TrendingUp size={20} />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">Harvest Estimate</h1>
          <p className="text-xs text-muted-foreground">
            {data.crop ? `Based on your ${data.crop} crop` : "Estimated quantity, price & profit"}
          </p>
        </div>
      </div>

      {data.missing.length > 0 ? (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3.5 text-sm text-amber-900 dark:text-amber-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Some estimates aren't available yet</p>
            <p className="mt-0.5 text-muted-foreground">
              Missing: {data.missing.join(", ")}.{" "}
              {data.missing.includes("crop") && "Save a crop from Crop Suggestion first. "}
              {data.missing.includes("land area") && "Fill in your land area under My Field. "}
              {data.missing.includes("market price for this crop") &&
                "We couldn't find a recent market price match for this crop yet — price history builds up daily."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Estimated Yield"
          value={data.yieldKg !== null ? `${data.yieldKg.toLocaleString("en-IN")} kg` : "—"}
          sub={data.landAreaAcres ? `${data.landAreaAcres} acres` : undefined}
        />
        <StatCard
          label="Market Price"
          value={data.pricePerQuintal !== null ? `${inr(data.pricePerQuintal)}/quintal` : "—"}
          sub={data.priceCommodityMatched ? `via ${data.priceCommodityMatched}` : undefined}
        />
        <StatCard label="Estimated Revenue" value={data.revenue !== null ? inr(data.revenue) : "—"} />
        <StatCard label="Total Expenditure" value={inr(data.totalExpenditure)} sub="from Expenditure Diary" />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-gradient-to-br from-secondary to-card p-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated Profit</p>
        <p
          className={`mt-1 font-heading text-3xl font-bold ${
            data.profit !== null && data.profit < 0 ? "text-destructive" : "text-primary"
          }`}
        >
          {data.profit !== null ? inr(data.profit) : "—"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Revenue minus total expenditure logged so far</p>
      </div>
    </div>
  )
}

export default function EstimatePage() {
  return (
    <AuthGuard>
      <EstimateView />
    </AuthGuard>
  )
}
