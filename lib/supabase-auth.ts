const SUPABASE_URL = "https://qhqbzrpwjlvfqgtsaozl.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocWJ6cnB3amx2ZnFndHNhb3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDUwMTgsImV4cCI6MjEwMTUyMTAxOH0.vD3_x7-ycJrHS38QmfqccP9_SMY9HL3LIpFlR4hEiTo"

type AuthSession = {
  access_token: string
  refresh_token: string
  user: { id: string; email?: string }
}

// Save session in the browser so the user stays logged in
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

// Email + password sign up
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

// Email + password sign in
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

// Redirects the browser to Google sign-in
export function signInWithGoogle() {
  const redirectTo = `${window.location.origin}/auth/callback`
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`
}

export function signOut() {
  clearSession()
}
