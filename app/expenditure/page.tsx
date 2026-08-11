"use client"

import { useEffect, useState } from "react"
import { Wallet, Trash2, Plus, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { NumberField, SelectField } from "@/components/form-fields"
import {
  EXPENSE_CATEGORIES,
  getExpenditureEntries,
  addExpenditureEntry,
  deleteExpenditureEntry,
  type ExpenditureEntry,
} from "@/lib/expenditure"

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function ExpenditureDiary() {
  const [entries, setEntries] = useState<ExpenditureEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(todayStr())
  const [note, setNote] = useState("")
  const [adding, setAdding] = useState(false)

  async function load() {
    setLoading(true)
    setEntries(await getExpenditureEntries())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return
    setAdding(true)
    try {
      await addExpenditureEntry({
        category,
        amount: Number(amount),
        entry_date: date,
        note: note || undefined,
      })
      setAmount("")
      setNote("")
      setDate(todayStr())
      await load()
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    await deleteExpenditureEntry(id)
  }

  const total = entries.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="mx-auto max-w-2xl p-5">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Wallet size={20} />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">Expenditure Diary</h1>
          <p className="text-xs text-muted-foreground">Log what you spend, step by step</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Category" name="category" value={category} onChange={setCategory} options={EXPENSE_CATEGORIES} />
          <NumberField label="Amount" name="amount" unit="₹" value={amount} onChange={setAmount} placeholder="e.g. 500" />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="entry-date" className="text-sm font-medium text-foreground">
              Date
            </label>
            <input
              id="entry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={todayStr()}
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="note" className="text-sm font-medium text-foreground">
              What did you spend on? (optional)
            </label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Urea 2 bags from Ramesh's shop"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        <Button type="submit" disabled={adding || !amount} className="mt-4 w-full justify-center gap-2 sm:w-auto">
          {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add entry
        </Button>
      </form>

      <div className="mb-3 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
        <span className="text-sm font-medium text-foreground">Total spent</span>
        <span className="font-heading text-lg font-bold text-primary">₹{total.toLocaleString("en-IN")}</span>
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No entries yet. Add your first expense above.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {entry.category} · ₹{Number(entry.amount).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.entry_date}
                  {entry.note ? ` · ${entry.note}` : ""}
                </p>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                className="text-muted-foreground transition hover:text-destructive"
                aria-label="Delete entry"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ExpenditurePage() {
  return (
    <AuthGuard>
      <ExpenditureDiary />
    </AuthGuard>
  )
}
