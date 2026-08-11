"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { getValidSession, signOut } from "@/lib/supabase-auth"
import { getFieldProfile } from "@/lib/field-profile"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    async function check() {
      const session = await getValidSession()
      if (!session) {
        router.replace("/login")
        return
      }
      setEmail(session.user?.email ?? null)

      if (pathname !== "/my-field") {
        const profile = await getFieldProfile()
        if (!profile) {
          router.replace("/my-field")
          return
        }
      }

      setChecked(true)
    }
    check()
  }, [router, pathname])

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-3 border-b border-border bg-card px-4 py-2 text-sm text-muted-foreground">
        {email ? <span>{email}</span> : null}
        <button
          onClick={() => {
            signOut()
            router.replace("/login")
          }}
          className="flex items-center gap-1 font-medium text-foreground hover:text-primary"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
      {children}
    </div>
  )
}
