"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sprout, ArrowLeft, ChevronDown, Info, AlertCircle } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { cn } from "@/lib/utils"
import { ORGANIC_FERTILIZERS, NUTRIENT_FILTERS, KVK_NOTE } from "@/lib/organic-data"
import { useT } from "@/lib/i18n"

function OrganicView() {
  const { t } = useT()
  const [filter, setFilter] = useState<(typeof NUTRIENT_FILTERS)[number]>("All")
  const [openId, setOpenId] = useState<string | null>(null)

  // Shows the translated text if there is one, otherwise the English text from the data file.
  const tx = (key: string, fallback: string) => {
    const value = t(key)
    return value === key ? fallback : value
  }

  // If the page was opened from a link like /organic-fertilizers#vermicompost,
  // open that card and scroll to it.
  useEffect(() => {
    const id = window.location.hash.replace("#", "")
    if (id && ORGANIC_FERTILIZERS.some((f) => f.id === id)) {
      setOpenId(id)
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 150)
    }
  }, [])

  const list =
    filter === "All" ? ORGANIC_FERTILIZERS : ORGANIC_FERTILIZERS.filter((f) => f.nutrients.includes(filter))

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-5">
      <Link href="/" className="flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft size={16} />
        {t("profile.back")}
      </Link>

      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sprout size={20} />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">{t("nav.organic")}</h1>
          <p className="text-xs text-muted-foreground">{tx("organic.sub", "Natural alternatives and how to prepare them")}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-sm text-muted-foreground">
        <Info size={16} className="mt-0.5 shrink-0 text-primary" />
        <span>{tx("organic.kvk", KVK_NOTE)}</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {NUTRIENT_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition",
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {tx(`organic.filter.${f}`, f)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {list.map((f) => {
          const open = openId === f.id
          return (
            <section key={f.id} id={f.id} className="scroll-mt-4 rounded-2xl border border-border bg-card shadow-sm">
              <button
                onClick={() => setOpenId(open ? null : f.id)}
                className="flex w-full items-start justify-between gap-3 p-4 text-left"
                aria-expanded={open}
              >
                <div className="min-w-0">
                  <h2 className="font-heading text-base font-semibold text-foreground">
                    {tx(`organic.${f.id}.name`, f.name)}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{tx(`organic.${f.id}.summary`, f.summary)}</p>
                  {f.nutrients.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {f.nutrients.map((n) => (
                        <span
                          key={n}
                          className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {tx(`organic.filter.${n}`, n)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <ChevronDown
                  size={18}
                  className={cn("mt-1 shrink-0 text-muted-foreground transition", open && "rotate-180")}
                />
              </button>

              {open ? (
                <div className="flex flex-col gap-4 border-t border-border p-4 text-sm">
                  <div>
                    <h3 className="mb-1.5 font-semibold text-foreground">{tx("organic.need", "What you need")}</h3>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                      {f.ingredients.map((item, i) => (
                        <li key={i}>{tx(`organic.${f.id}.ing.${i}`, item)}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-1.5 font-semibold text-foreground">{tx("organic.prepare", "How to prepare")}</h3>
                    <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
                      {f.steps.map((step, i) => (
                        <li key={i}>{tx(`organic.${f.id}.steps.${i}`, step)}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3 className="mb-1.5 font-semibold text-foreground">{tx("organic.howToUse", "How to use")}</h3>
                    <p className="text-muted-foreground">{tx(`organic.${f.id}.use`, f.use)}</p>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{tx(`organic.${f.id}.caution`, f.caution)}</span>
                  </div>
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default function OrganicFertilizersPage() {
  return (
    <AuthGuard>
      <OrganicView />
    </AuthGuard>
  )
}
