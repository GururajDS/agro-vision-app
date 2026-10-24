"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, MapPin, Wheat, Wallet, LogOut, ChevronRight, Loader2, ArrowLeft } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { getValidSession, signOut } from "@/lib/supabase-auth"
import { getFieldProfile, type FieldProfile } from "@/lib/field-profile"
import { getHarvestEstimate, type HarvestEstimate } from "@/lib/estimate"
import { getExpenditureEntries, type ExpenditureEntry } from "@/lib/expenditure"
import { useT } from "@/lib/i18n"

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

function formatDate(d: string) {
  const date = new Date(`${d}T00:00:00`)
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

function Card({
  icon,
  title,
  href,
  linkLabel,
  children,
}: {
  icon: React.ReactNode
  title: string
  href?: string
  linkLabel?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
        </div>
        {href && linkLabel ? (
          <Link href={href} className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline">
            {linkLabel}
            <ChevronRight size={14} />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border py-2 text-sm first:border-t-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function ProfileView() {
  const router = useRouter()
  const { t, tc } = useT()
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [field, setField] = useState<FieldProfile | null>(null)
  const [estimate, setEstimate] = useState<HarvestEstimate | null>(null)
  const [entries, setEntries] = useState<ExpenditureEntry[]>([])

  useEffect(() => {
    async function load() {
      const session = await getValidSession()
      const userEmail = session?.user?.email ?? ""
      const meta = (session?.user as unknown as { user_metadata?: { full_name?: string; name?: string } } | undefined)
        ?.user_metadata
      setEmail(userEmail)
      setName(meta?.full_name || meta?.name || (userEmail ? userEmail.split("@")[0] : ""))

      const [f, est, exp] = await Promise.all([getFieldProfile(), getHarvestEstimate(), getExpenditureEntries()])
      setField(f)
      setEstimate(est)
      setEntries(exp)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    )
  }

  const displayName = name || t("profile.farmer")
  const totalSpent = entries.reduce((sum, e) => sum + Number(e.amount), 0)
  const recent = entries.slice(0, 5)

  const catLabel = (c: string) => {
    const key = `expense.cat.${c}`
    const translated = t(key)
    return translated === key ? c : translated
  }

  const soilLabel = (s: string) => {
    const key = `soil.${s}`
    const translated = t(key)
    return translated === key ? s : translated
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-5">
      <Link href="/" className="flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft size={16} />
        {t("profile.back")}
      </Link>

      {/* Account */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-xl font-bold text-primary">
            {displayName ? displayName.charAt(0).toUpperCase() : <User size={24} />}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-heading text-lg font-bold text-foreground">{displayName}</h1>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
          <button
            onClick={() => {
              signOut()
              router.replace("/login")
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <LogOut size={14} />
            {t("common.logout")}
          </button>
        </div>
      </section>

      {/* Field */}
      <Card icon={<MapPin size={18} />} title={t("nav.myField")} href="/my-field" linkLabel={t("profile.edit")}>
        {field ? (
          <div>
            <Row label={t("myField.landArea")} value={t("estimate.acres", { n: field.land_area_acres })} />
            <Row label={t("myField.soilType")} value={soilLabel(field.soil_type)} />
            <Row label={t("myField.location")} value={field.location_name || t("profile.notSet")} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("profile.noField")}</p>
        )}
      </Card>

      {/* Crop + estimate */}
      <Card
        icon={<Wheat size={18} />}
        title={estimate?.crop ? t("profile.cropTitle", { crop: tc(estimate.crop) }) : t("profile.cropTitleDefault")}
        href="/estimate"
        linkLabel={t("profile.fullEstimate")}
      >
        {estimate?.crop ? (
          <div>
            <Row
              label={t("estimate.yield")}
              value={
                estimate.yieldKg !== null
                  ? t("estimate.kg", { n: Math.round(estimate.yieldKg).toLocaleString("en-IN") })
                  : "—"
              }
            />
            <Row
              label={t("estimate.price")}
              value={
                estimate.pricePerQuintal !== null
                  ? t("estimate.perQuintal", { price: inr(estimate.pricePerQuintal) })
                  : "—"
              }
            />
            <Row label={t("estimate.revenue")} value={estimate.revenue !== null ? inr(estimate.revenue) : "—"} />
            <Row label={t("estimate.expenditure")} value={inr(estimate.totalExpenditure)} />
            <Row
              label={t("estimate.profit")}
              value={estimate.profit !== null ? `${estimate.profit < 0 ? "-" : ""}${inr(Math.abs(estimate.profit))}` : "—"}
            />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            <p>{t("profile.noCrop")}</p>
            <Link href="/" className="mt-2 inline-block font-medium text-primary hover:underline">
              {t("nav.crop")} →
            </Link>
          </div>
        )}
      </Card>

      {/* Expenditure */}
      <Card icon={<Wallet size={18} />} title={t("profile.expenditure")} href="/expenditure" linkLabel={t("profile.openDiary")}>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">{t("exp.total")}</span>
          <span className="font-heading text-xl font-bold text-foreground">{inr(totalSpent)}</span>
        </div>
        {recent.length > 0 ? (
          <div>
            {recent.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 border-t border-border py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{catLabel(e.category)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(e.entry_date)}
                    {e.note ? ` · ${e.note}` : ""}
                  </p>
                </div>
                <span className="shrink-0 font-medium text-foreground">{inr(Number(e.amount))}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("profile.noExpenses")}</p>
        )}
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileView />
    </AuthGuard>
  )
}
