"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type NumberFieldProps = {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  unit?: string
  placeholder?: string
  step?: string
  icon?: ReactNode
}

export function NumberField({
  label,
  name,
  value,
  onChange,
  unit,
  placeholder = "0",
  step = "any",
  icon,
}: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {icon ? <span className="text-primary">{icon}</span> : null}
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition",
            "placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30",
            unit && "pr-14",
          )}
        />
        {unit ? (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  )
}

type SelectFieldProps = {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  icon?: ReactNode
}

export function SelectField({ label, name, value, onChange, options, icon }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {icon ? <span className="text-primary">{icon}</span> : null}
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full appearance-none rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition",
          "focus:border-primary focus:ring-2 focus:ring-ring/30",
        )}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
