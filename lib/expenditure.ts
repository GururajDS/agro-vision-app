import { getSession } from "@/lib/supabase-auth"

const SUPABASE_URL = "https://qhqbzrpwjlvfqgtsaozl.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocWJ6cnB3amx2ZnFndHNhb3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDUwMTgsImV4cCI6MjEwMTUyMTAxOH0.vD3_x7-ycJrHS38QmfqccP9_SMY9HL3LIpFlR4hEiTo"

export const EXPENSE_CATEGORIES = ["Seeds", "Fertilizer", "Labor", "Irrigation", "Equipment", "Other"] as const

export type ExpenditureEntry = {
  id: number
  category: string
  amount: number
  entry_date: string
  note: string | null
}

function authHeaders() {
  const session = getSession()
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${session?.access_token}`,
  }
}

export async function getExpenditureEntries(): Promise<ExpenditureEntry[]> {
  const session = getSession()
  if (!session) return []

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/expenditure_entries?user_id=eq.${session.user.id}&select=id,category,amount,entry_date,note&order=entry_date.desc,id.desc`,
    { headers: authHeaders() },
  )
  return res.ok ? await res.json() : []
}

export async function addExpenditureEntry(entry: {
  category: string
  amount: number
  entry_date: string
  note?: string
}): Promise<void> {
  const session = getSession()
  if (!session) throw new Error("Not logged in")

  const res = await fetch(`${SUPABASE_URL}/rest/v1/expenditure_entries`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ user_id: session.user.id, ...entry }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "Failed to add entry")
  }
}

export async function deleteExpenditureEntry(id: number): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/expenditure_entries?id=eq.${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete entry")
}
