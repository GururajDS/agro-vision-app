import { getSession } from "@/lib/supabase-auth"

const SUPABASE_URL = "https://qhqbzrpwjlvfqgtsaozl.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocWJ6cnB3amx2ZnFndHNhb3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDUwMTgsImV4cCI6MjEwMTUyMTAxOH0.vD3_x7-ycJrHS38QmfqccP9_SMY9HL3LIpFlR4hEiTo"

export type FieldProfile = {
  land_area_acres: number
  soil_type: string
}

function authHeaders() {
  const session = getSession()
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${session?.access_token}`,
  }
}

export async function getFieldProfile(): Promise<FieldProfile | null> {
  const session = getSession()
  if (!session) return null

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/field_profiles?user_id=eq.${session.user.id}&select=land_area_acres,soil_type`,
    { headers: authHeaders() }
  )
  const data = await res.json()
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

export async function saveFieldProfile(profile: FieldProfile): Promise<void> {
  const session = getSession()
  if (!session) throw new Error("Not logged in")

  const res = await fetch(`${SUPABASE_URL}/rest/v1/field_profiles`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      user_id: session.user.id,
      ...profile,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "Failed to save field profile")
  }
}
