"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/lib/supabase-auth"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password)
        router.push("/")
      } else {
        await signUpWithEmail(email, password)
        setSignupDone(true)
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="mb-1 text-lg font-semibold text-foreground">
          {mode === "signin" ? "Log in to Agro Vision" : "Create your account"}
        </h1>
        <p className="mb-5 text-sm text-muted-foreground">
          {mode === "signin" ? "Welcome back, farmer." : "Let's get your fields set up."}
        </p>

        {signupDone ? (
          <p className="rounded-xl bg-primary/10 p-3 text-sm text-primary">
            Account created! Check your email to confirm, then log in.
          </p>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="mb-4 w-full justify-center"
              onClick={signInWithGoogle}
            >
              Continue with Gmail
            </Button>

            <div className="mb-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button type="submit" disabled={loading} className="w-full justify-center">
                {loading ? "Please wait…" : mode === "signin" ? "Log in" : "Sign up"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin")
                  setError(null)
                }}
                className="font-medium text-primary hover:underline"
              >
                {mode === "signin" ? "Create an account" : "Log in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
