const SUPABASE_URL = "https://qhqbzrpwjlvfqgtsaozl.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocWJ6cnB3amx2ZnFndHNhb3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDUwMTgsImV4cCI6MjEwMTUyMTAxOH0.vD3_x7-ycJrHS38QmfqccP9_SMY9HL3LIpFlR4hEiTo"

export type PricePoint = { date: string; price: number }
export type CommodityInfo = { name: string; days: number }

// Commodities that have at least 2 days of data (a chart needs 2+ points).
export async function getAvailableCommodities(): Promise<CommodityInfo[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/commodity_list?select=commodity_name,days_with_data&days_with_data=gte.2&order=commodity_name.asc`,
    { headers: { apikey: SUPABASE_ANON_KEY } },
  )
  if (!res.ok) return []
  const data: { commodity_name: string; days_with_data: number }[] = await res.json()
  return data.map((d) => ({ name: d.commodity_name, days: Number(d.days_with_data) }))
}

// One average price per day for the chosen commodity.
export async function getPriceHistory(commodity: string, days = 30): Promise<PricePoint[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().slice(0, 10)

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/commodity_daily_avg?commodity_name=eq.${encodeURIComponent(
      commodity,
    )}&recorded_date=gte.${sinceStr}&select=recorded_date,avg_price&order=recorded_date.asc`,
    { headers: { apikey: SUPABASE_ANON_KEY } },
  )
  if (!res.ok) return []
  const data: { recorded_date: string; avg_price: number | string }[] = await res.json()
  return data.map((d) => ({ date: d.recorded_date, price: Number(d.avg_price) }))
}
