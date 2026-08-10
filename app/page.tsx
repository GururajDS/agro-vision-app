"use client"

import { Dashboard } from "@/components/dashboard"
import { AuthGuard } from "@/components/auth-guard"

export default function Page() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}
