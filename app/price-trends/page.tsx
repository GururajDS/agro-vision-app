"use client"

import { useEffect, useState } from "react"
import { LineChart, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { SelectField } from "@/components/form-fields"
import { PriceTrendChart } from "@/components/price-trend-chart"
import {
  getAvailableCommodities,
  getPriceHistory,
  type CommodityInfo,
  type PricePoint,
} from "@/lib/price-history"
import { getSelectedCrop } from "@/lib/selected-crop"

const RANGE_OPTIONS = ["7", "30", "90"] as const

// Open on the commodity that matches the user's saved crop (e.g. "maize"),
// otherwise on the commodity with the most days of data.
function pickDefault(list: CommodityInfo[], savedCrop: string | null): string {
  if (savedCrop) {
    const crop = savedCrop.toLowerCase()
    const matches = list.filter((c) => c.name.toLowerCase().includes(crop))
    if (matches.length > 0) {
      return matches.sort((a, b) => b.days - a.days)[0].name
    }
  }
  return [...list].sort((a, b) => b.days - a.days || a.name.localeCompare(b.name))[0].name
}

function PriceTrendsView() {
  const [commodities, setCommodities] = useState<string[]>([])
  const [selected, setSelected] = useState<string>("")
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>("30")
  const [data, setData] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [listLoaded, setListLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const list = await getAvailableCommodities()
      let savedCrop: string | null = null
      try {
        savedCrop = await getSelectedCrop()
      } catch {
        savedCrop = null
      }
      setCommodities(list.map((c) => c.name))
      if (list.length > 0) setSelected(pickDefault(list, savedCrop))
      setListLoaded(true)
      if (list.length === 0) setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    getPriceHistory(selected, Number(range)).then((points) => {
      setData(points)
      setLoading(false)
    })
  }, [selected, range])

  return (
    <div className="mx-auto max-w-2xl p-5">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LineChart size={20} />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">Price Trends</h1>
          <p className="text-xs text-muted-foreground">Track how commodity prices are moving</p>
        </div>
      </div>

      {listLoaded && commodities.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No price data collected yet. Check back after tomorrow's automatic update.
        </p>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Commodity"
              name="commodity"
              value={selected}
              onChange={setSelected}
              options={commodities}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="range" className="text-sm font-medium text-foreground">
                Time range
              </label>
              <select
                id="range"
                value={range}
                onChange={(e) => setRange(e.target.value as (typeof RANGE_OPTIONS)[number])}
                className="w-full appearance-none rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
              >
                {RANGE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    Last {r} days
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : (
            <PriceTrendChart data={data} />
          )}
        </div>
      )}
    </div>
  )
}

export default function PriceTrendsPage() {
  return (
    <AuthGuard>
      <PriceTrendsView />
    </AuthGuard>
  )
}
