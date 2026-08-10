import { getSession } from "@/lib/supabase-auth"

const SUPABASE_URL = "https://qhqbzrpwjlvfqgtsaozl.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocWJ6cnB3amx2ZnFndHNhb3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDUwMTgsImV4cCI6MjEwMTUyMTAxOH0.vD3_x7-ycJrHS38QmfqccP9_SMY9HL3LIpFlR4hEiTo"

function authHeaders() {
  const session = getSession()
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${session?.access_token}`,
  }
}

export async function getSelectedCrop(): Promise<string | null> {
  const session = getSession()
  if (!session) return null

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/selected_crop?user_id=eq.${session.user.id}&select=crop_name`,
    { headers: authHeaders() }
  )
  const data = await res.json()
  return Array.isArray(data) && data.length > 0 ? data[0].crop_name : null
}

export async function saveSelectedCrop(cropName: string): Promise<void> {
  const session = getSession()
  if (!session) throw new Error("Not logged in")

  const res = await fetch(`${SUPABASE_URL}/rest/v1/selected_crop`, {
    method: "POST",
    headers: { ...authHeaders(), Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      user_id: session.user.id,
      crop_name: cropName,
      selected_at: new Date().toISOString(),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "Failed to save selected crop")
  }
}
