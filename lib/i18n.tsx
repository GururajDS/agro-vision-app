"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { DICT, type Lang } from "@/lib/translations"

const STORAGE_KEY = "agrovision_lang"

type TFunction = (key: string, vars?: Record<string, string | number>) => string

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: TFunction
  // Translates a crop name such as "rice", "Kidney Beans" or "Ground Nuts".
  tc: (name: string) => string
}

function cropKey(name: string) {
  return "crop." + name.toLowerCase().replace(/[^a-z]/g, "")
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => DICT.en[key] ?? key,
  tc: (name) => DICT.en[cropKey(name)] ?? name,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  // Remember the user's choice on this device.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === "en" || saved === "kn" || saved === "hi") setLangState(saved)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const t: TFunction = useCallback(
    (key, vars) => {
      let text = DICT[lang][key] ?? DICT.en[key] ?? key
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.split(`{${name}}`).join(String(value))
        }
      }
      return text
    },
    [lang],
  )

  const tc = useCallback(
    (name: string) => {
      const key = cropKey(name)
      return DICT[lang][key] ?? DICT.en[key] ?? name
    },
    [lang],
  )

  return <LanguageContext.Provider value={{ lang, setLang, t, tc }}>{children}</LanguageContext.Provider>
}

export function useT() {
  return useContext(LanguageContext)
}
