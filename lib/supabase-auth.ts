const SUPABASE_URL = "https://qhqbzrpwjlvfqgtsaozl.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocWJ6cnB3amx2ZnFndHNhb3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDUwMTgsImV4cCI6MjEwMTUyMTAxOH0.vD3_x7-ycJrHS38QmfqccP9_SMY9HL3LIpFlR4hEiTo"

type AuthSession = {
  access_token: string
  refresh_token: string
  user: { id: string; email?: string }
}

export function saveSession(session: AuthSession) {
  localStorage.setItem("agrovision_session", JSON.stringify(session))
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("agrovision_session")
  return raw ? JSON.parse(raw) : null
}

export function clearSession() {
  localStorage.removeItem("agrovision_session")
}

function decodeJwtExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    return typeof payload.exp === "number" ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

// Returns a session with a fresh, non-expired access token — refreshing it first if needed.
// Use this (not getSession) anywhere you're about to call the Supabase API.
export async function getValidSession(): Promise<AuthSession | null> {
  const session = getSession()
  if (!session) return null

  const expiresAt = decodeJwtExpiryMs(session.access_token)
  const isStale = !expiresAt || expiresAt < Date.now() + 60_000
  if (!isStale) return session

  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  })

  if (!res.ok) {
    clearSession()
    return null
  }

  const data = await res.json()
  const refreshed: AuthSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user ?? session.user,
  }
  saveSession(refreshed)
  return refreshed
}

export async function signUpWithEmail(email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.msg || data.error_description || "Sign up failed")
  return data
}

export async function signInWithEmail(email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.msg || data.error_description || "Sign in failed")
  saveSession(data)
  return data
}

export function signInWithGoogle() {
  const redirectTo = `${window.location.origin}/auth/callback`
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`
}

export function signOut() {
  clearSession()
}
