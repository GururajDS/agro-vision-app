"use client"

import { useState } from "react"
import { Leaf, FlaskConical, CloudSun, LineChart, Sprout, MapPin, Wallet } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CropSuggestion } from "@/components/sections/crop-suggestion"
import { FertilizerSuggestion } from "@/components/sections/fertilizer-suggestion"
import { Weather } from "@/components/sections/weather"
import { CommodityPrices } from "@/components/sections/commodity-prices"

const NAV = [
  { id: "crop", label: "Crop Suggestion", icon: Leaf, description: "Find the best crop for your soil" },
  { id: "fertilizer", label: "Fertilizer Suggestion", icon: FlaskConical, description: "Recommended fertilizer for your field" },
  { id: "weather", label: "Weather", icon: CloudSun, description: "Current conditions for your location" },
  { id: "prices", label: "Commodity Prices", icon: LineChart, description: "Latest market rates" },
] as const

type SectionId = (typeof NAV)[number]["id"]

export function Dashboard() {
  const [active, setActive] = useState<SectionId>("crop")
  const current = NAV.find((n) => n.id === active)!

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar p-5 text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout size={22} />
          </div>
          <div>
            <p className="font-heading text-lg font-bold leading-tight">Agro Vision</p>
            <p className="text-xs text-sidebar-foreground/70">Smart Farming</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition",
                active === id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              aria-current={active === id ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <Link
          href="/my-field"
          className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <MapPin size={18} />
          My Field
        </Link>

        <Link
          href="/expenditure"
          className="mt-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Wallet size={18} />
          Expenditure Diary
        </Link>

        <p className="mt-auto pt-6 text-xs text-sidebar-foreground/60">
          Demo build with sample data.
        </p>
      </aside>
      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-2.5 bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout size={20} />
          </div>
          <p className="font-heading text-lg font-bold">Agro Vision</p>
        </header>

        {/* Mobile nav (horizontal scroll) */}
        <nav className="flex gap-2 overflow-x-auto border-b border-border bg-card px-4 py-3 md:hidden">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition",
                active === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
              aria-current={active === id ? "page" : undefined}
            >
              <Icon size={16} />
              {label}
            </button>
         ))}
          <Link
            href="/my-field"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-sm font-medium text-muted-foreground"
          >
            <MapPin size={16} />
            My Field
          </Link>
          <Link
            href="/expenditure"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-sm font-medium text-muted-foreground"
          >
            <Wallet size={16} />
            Expenditure Diary
          </Link>
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <h1 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                {current.label}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">{current.description}</p>
            </div>

            {active === "crop" && <CropSuggestion />}
            {active === "fertilizer" && <FertilizerSuggestion />}
            {active === "weather" && <Weather />}
            {active === "prices" && <CommodityPrices />}
          </div>
        </main>
      </div>
    </div>
  )
}
