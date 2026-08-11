import { getValidSession } from "@/lib/supabase-auth"
import { getSelectedCrop } from "@/lib/selected-crop"
import { getFieldProfile } from "@/lib/field-profile"
import { getExpenditureEntries } from "@/lib/expenditure"
import { CROP_YIELD_PER_ACRE } from "@/lib/agro-data"

const SUPABASE_URL = "https://qhqbzrpwjlvfqgtsaozl.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocWJ6cnB3amx2ZnFndHNhb3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDUwMTgsImV4cCI6MjEwMTUyMTAxOH0.vD3_x7-ycJrHS38QmfqccP9_SMY9HL3LIpFlR4hEiTo"

export type HarvestEstimate = {
  crop: string | null
  landAreaAcres: number | null
  yieldKg: number | null
  pricePerQuintal: number | null
  priceCommodityMatched: string | null
  revenue: number | null
  totalExpenditure: number
  profit: number | null
  missing: string[]
}

async function findLatestPrice(cropName: string): Promise<{ price: number; matched: string } | null> {
  const session = await getValidSession()
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/commodity_price_history?commodity_name=ilike.*${encodeURIComponent(
      cropName,
    )}*&select=commodity_name,price,recorded_date&order=recorded_date.desc&limit=1`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session?.access_token ?? SUPABASE_ANON_KEY}`,
      },
    },
  )
  if (!res.ok) return null
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null
  return { price: Number(data[0].price), matched: data[0].commodity_name }
}

export async function getHarvestEstimate(): Promise<HarvestEstimate> {
  const missing: string[] = []

  const [crop, fieldProfile, expenditureEntries] = await Promise.all([
    getSelectedCrop(),
    getFieldProfile(),
    getExpenditureEntries(),
  ])

  const totalExpenditure = expenditureEntries.reduce((sum, e) => sum + Number(e.amount), 0)

  if (!crop) missing.push("crop")
  if (!fieldProfile?.land_area_acres) missing.push("land area")

  let yieldKg: number | null = null
  if (crop && fieldProfile?.land_area_acres) {
    const perAcre = CROP_YIELD_PER_ACRE[crop.toLowerCase()]
    if (perAcre) {
      yieldKg = perAcre * fieldProfile.land_area_acres
    } else {
      missing.push("yield data for this crop")
    }
  }

  let pricePerQuintal: number | null = null
  let priceCommodityMatched: string | null = null
  if (crop) {
    const priceResult = await findLatestPrice(crop)
    if (priceResult) {
      pricePerQuintal = priceResult.price
      priceCommodityMatched = priceResult.matched
    } else {
      missing.push("market price for this crop")
    }
  }

  let revenue: number | null = null
  if (yieldKg !== null && pricePerQuintal !== null) {
    revenue = (yieldKg / 100) * pricePerQuintal
  }

  const profit = revenue !== null ? revenue - totalExpenditure : null

  return {
    crop,
    landAreaAcres: fieldProfile?.land_area_acres ?? null,
    yieldKg,
    pricePerQuintal,
    priceCommodityMatched,
    revenue,
    totalExpenditure,
    profit,
    missing,
  }
}
