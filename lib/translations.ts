import { common } from "@/lib/tr/common"
import { shell } from "@/lib/tr/shell"
import { field } from "@/lib/tr/field"
import { crops } from "@/lib/tr/crops"

export type Lang = "en" | "kn" | "hi"

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "hi", label: "हिन्दी" },
]

type Area = Record<Lang, Record<string, string>>

// Every area's text file is listed here. New areas get added to this list.
const AREAS: Area[] = [common, shell, field, crops]

function merge(lang: Lang): Record<string, string> {
  return Object.assign({}, ...AREAS.map((a) => a[lang])) as Record<string, string>
}

export const DICT: Record<Lang, Record<string, string>> = {
  en: merge("en"),
  kn: merge("kn"),
  hi: merge("hi"),
}
