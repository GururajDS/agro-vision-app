"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Search, Loader2, AlertTriangle } from "lucide-react"
import { useT } from "@/lib/i18n"

type CommodityRecord = {
  commodity?: string
  market?: string
  state?: string
  district?: string
  min_price?: string | number
  max_price?: string | number
  modal_price?: string | number
  arrival_date?: string
}

const inr = new Intl.NumberFormat("en-IN")

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? "Request failed")
  }
  return res.json() as Promise<{ records?: CommodityRecord[] }>
}

function formatPrice(value: string | number | undefined) {
  if (value === undefined || value === null || value === "") return "—"
  const num = Number(value)
  return Number.isNaN(num) ? String(value) : `₹${inr.format(num)}`
}

export function CommodityPrices() {
  const { t } = useT()
  const [query, setQuery] = useState("")
  const { data, error, isLoading } = useSWR("/api/commodity-prices", fetcher, {
    revalidateOnFocus: false,
  })

  const records = useMemo(() => data?.records ?? [], [data])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return records
    return records.filter((r) => (r.commodity ?? "").toLowerCase().includes(q))
  }, [records, query])

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">{t("prices.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("prices.sub")}</p>
        </div>
        <div className="relative sm:w-72">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("prices.search")}
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("prices.fetching")}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/12 text-destructive">
            <AlertTriangle size={26} />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">{t("prices.error")}</p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">{t("prices.col.commodity")}</th>
                <th className="pb-3 pr-4 font-medium">{t("prices.col.market")}</th>
                <th className="pb-3 pr-4 font-medium">{t("prices.col.state")}</th>
                <th className="pb-3 font-medium">{t("prices.col.modal")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={`${r.commodity}-${r.market}-${i}`} className="border-b border-border/60 last:border-0">
                  <td className="py-3.5 pr-4 font-medium text-foreground">{r.commodity ?? "—"}</td>
                  <td className="py-3.5 pr-4 text-sm text-muted-foreground">{r.market ?? "—"}</td>
                  <td className="py-3.5 pr-4 text-sm text-muted-foreground">{r.state ?? "—"}</td>
                  <td className="py-3.5 font-semibold text-foreground">{formatPrice(r.modal_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {records.length === 0 ? t("prices.none") : t("prices.noMatch", { query })}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
