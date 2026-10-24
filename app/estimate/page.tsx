"use client"

import { useEffect, useState } from "react"
import { TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { getHarvestEstimate, type HarvestEstimate } from "@/lib/estimate"
import { useT } from "@/lib/i18n"

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
  const { t, tc } = useT()
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

  const missingItems = data.missing
    .map((m) => {
      const key = `estimate.item.${m}`
      const translated = t(key)
      return translated === key ? m : translated
    })
    .join(", ")

  return (
    <div className="mx-auto max-w-2xl p-5">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <TrendingUp size={20} />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">{t("estimate.title")}</h1>
          <p className="text-xs text-muted-foreground">
            {data.crop ? t("estimate.subCrop", { crop: tc(data.crop) }) : t("estimate.subDefault")}
          </p>
        </div>
      </div>

      {data.missing.length > 0 ? (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3.5 text-sm text-amber-900 dark:text-amber-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">{t("estimate.missingTitle")}</p>
            <p className="mt-0.5 text-muted-foreground">
              {t("estimate.missing", { items: missingItems })}{" "}
              {data.missing.includes("crop") && `${t("estimate.hint.crop")} `}
              {data.missing.includes("land area") && `${t("estimate.hint.land")} `}
              {data.missing.includes("market price for this crop") && t("estimate.hint.price")}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={t("estimate.yield")}
          value={data.yieldKg !== null ? t("estimate.kg", { n: data.yieldKg.toLocaleString("en-IN") }) : "—"}
          sub={data.landAreaAcres ? t("estimate.acres", { n: data.landAreaAcres }) : undefined}
        />
        <StatCard
          label={t("estimate.price")}
          value={
            data.pricePerQuintal !== null
              ? t("estimate.perQuintal", { price: inr(data.pricePerQuintal) })
              : "—"
          }
          sub={data.priceCommodityMatched ? t("estimate.via", { name: data.priceCommodityMatched }) : undefined}
        />
        <StatCard label={t("estimate.revenue")} value={data.revenue !== null ? inr(data.revenue) : "—"} />
        <StatCard
          label={t("estimate.expenditure")}
          value={inr(data.totalExpenditure)}
          sub={t("estimate.fromDiary")}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-gradient-to-br from-secondary to-card p-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("estimate.profit")}</p>
        <p
          className={`mt-1 font-heading text-3xl font-bold ${
            data.profit !== null && data.profit < 0 ? "text-destructive" : "text-primary"
          }`}
        >
          {data.profit !== null ? inr(data.profit) : "—"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t("estimate.profitNote")}</p>
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
