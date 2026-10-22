"use client"

import { useT } from "@/lib/i18n"
import { LANGS } from "@/lib/translations"
import { cn } from "@/lib/utils"

export function LanguagePicker() {
  const { lang, setLang, t } = useT()

  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className="inline-flex overflow-hidden rounded-full border border-border"
    >
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={cn(
            "px-2.5 py-1 text-xs font-medium transition",
            lang === l.code
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
