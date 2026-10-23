"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FlaskConical, Sprout, Droplets, Thermometer, Waves, Layers, Wheat, Loader2, AlertTriangle, Info } from "lucide-react"
import { NumberField, SelectField } from "@/components/form-fields"
import { SOIL_TYPES } from "@/lib/agro-data"
import { getSelectedCrop } from "@/lib/selected-crop"
import { getOrganicAlternatives } from "@/lib/organic-data"
import { useT } from "@/lib/i18n"

const PREDICT_FERTILIZER_URL = "/api/predict-fertilizer"

// What the user sees  ->  what the fertilizer model understands.
// The fertilizer model only knows these 11 groups:
// Maize, Sugarcane, Cotton, Tobacco, Paddy, Barley, Wheat, Millets, Oil seeds, Pulses, Ground Nuts
const CROP_TO_MODEL: Record<string, string> = {
  // Good matches
  Rice: "Paddy",
  Maize: "Maize",
  Cotton: "Cotton",
  "Black Gram": "Pulses",
  Chickpea: "Pulses",
  "Kidney Beans": "Pulses",
  Lentil: "Pulses",
  "Moth Beans": "Pulses",
  "Mung Bean": "Pulses",
  "Pigeon Peas": "Pulses",
  // Field crops the fertilizer model already knows
  Barley: "Barley",
  "Ground Nuts": "Ground Nuts",
  Millets: "Millets",
  "Oil seeds": "Oil seeds",
  Sugarcane: "Sugarcane",
  Tobacco: "Tobacco",
  Wheat: "Wheat",
  // Closest-match approximations
  Jute: "Cotton",
  Coconut: "Oil seeds",
  Banana: "Sugarcane",
  Coffee: "Sugarcane",
  Mango: "Sugarcane",
  Papaya: "Sugarcane",
  Apple: "Sugarcane",
  Grapes: "Sugarcane",
  Orange: "Sugarcane",
  Pomegranate: "Sugarcane",
  Muskmelon: "Ground Nuts",
  Watermelon: "Ground Nuts",
}

// Crops that are a direct (not approximate) match — no note is shown for these.
const EXACT_MATCH = new Set([
  "Rice",
  "Maize",
  "Cotton",
  "Black Gram",
  "Chickpea",
  "Kidney Beans",
  "Lentil",
  "Moth Beans",
  "Mung Bean",
  "Pigeon Peas",
  "Barley",
  "Ground Nuts",
  "Millets",
  "Oil seeds",
  "Sugarcane",
  "Tobacco",
  "Wheat",
])

const CROP_OPTIONS = Object.keys(CROP_TO_MODEL).sort((a, b) => a.localeCompare(b))

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "")

type Fields = {
  temperature: string
  humidity: string
  moisture: string
  N: string
  K: string
  P: string
  soil: string
  crop: string
}

const INITIAL: Fields = {
  temperature: "",
  humidity: "",
  moisture: "",
  N: "",
  K: "",
  P: "",
  soil: SOIL_TYPES[0],
  crop: "Maize",
}

export function FertilizerSuggestion() {
  const { t, tc, tf } = useT()
  const [fields, setFields] = useState<Fields>(INITIAL)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedContext, setSubmittedContext] = useState<{ crop: string; soil: string } | null>(null)
  // The note is kept as data (not text) so it re-translates when the language changes.
  const [savedCropNote, setSavedCropNote] = useState<{ kind: "using" | "missing"; crop: string } | null>(null)

  useEffect(() => {
    getSelectedCrop().then((saved) => {
      if (!saved) return
      const match = CROP_OPTIONS.find((c) => normalize(c) === normalize(saved))
      if (match) {
        setFields((prev) => ({ ...prev, crop: match }))
        setSavedCropNote({ kind: "using", crop: match })
      } else {
        setSavedCropNote({ kind: "missing", crop: saved })
      }
    })
  }, [])

  const setField = (key: keyof Fields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(PREDICT_FERTILIZER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: Number(fields.temperature),
          humidity: Number(fields.humidity),
          moisture: Number(fields.moisture),
          nitrogen: Number(fields.N),
          potassium: Number(fields.K),
          phosphorous: Number(fields.P),
          soil_type: fields.soil,
          crop_type: CROP_TO_MODEL[fields.crop] ?? fields.crop,
        }),
      })

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const data = (await res.json()) as { recommended_fertilizer?: string }
      if (!data.recommended_fertilizer) {
        throw new Error("No fertilizer returned")
      }

      setSubmittedContext({ crop: fields.crop, soil: fields.soil })
      setResult(data.recommended_fertilizer)
    } catch {
      setError(t("suggest.error"))
    } finally {
      setLoading(false)
    }
  }

  const showApproxNote = submittedContext ? !EXACT_MATCH.has(submittedContext.crop) : false
  const organic = result ? getOrganicAlternatives(result) : []

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("fertPage.formTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("fertPage.formSub")}</p>

        {savedCropNote ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-sm text-muted-foreground">
            <Info size={16} className="mt-0.5 shrink-0 text-primary" />
            <span>
              {savedCropNote.kind === "using"
                ? t("fertPage.savedUsing", { crop: tc(savedCropNote.crop) })
                : t("fertPage.savedMissing", { crop: tc(savedCropNote.crop) })}
            </span>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <NumberField
            label={t("label.temperature")}
            name="f-temperature"
            unit="°C"
            value={fields.temperature}
            onChange={setField("temperature")}
            icon={<Thermometer size={16} />}
          />
          <NumberField
            label={t("label.humidity")}
            name="f-humidity"
            unit="%"
            value={fields.humidity}
            onChange={setField("humidity")}
            icon={<Droplets size={16} />}
          />
          <NumberField
            label={t("label.moisture")}
            name="f-moisture"
            unit="%"
            value={fields.moisture}
            onChange={setField("moisture")}
            icon={<Waves size={16} />}
          />
          <NumberField
            label={t("label.nitrogen")}
            name="f-nitrogen"
            unit={t("unit.kgha")}
            value={fields.N}
            onChange={setField("N")}
            icon={<Sprout size={16} />}
          />
          <NumberField
            label={t("label.potassium")}
            name="f-potassium"
            unit={t("unit.kgha")}
            value={fields.K}
            onChange={setField("K")}
            icon={<Sprout size={16} />}
          />
          <NumberField
            label={t("label.phosphorous")}
            name="f-phosphorous"
            unit={t("unit.kgha")}
            value={fields.P}
            onChange={setField("P")}
            icon={<Sprout size={16} />}
          />
          <SelectField
            label={t("myField.soilType")}
            name="soil"
            value={fields.soil}
            onChange={setField("soil")}
            options={SOIL_TYPES}
            getLabel={(o) => t(`soil.${o}`)}
            icon={<Layers size={16} />}
          />
          <SelectField
            label={t("label.cropType")}
            name="crop"
            value={fields.crop}
            onChange={setField("crop")}
            options={CROP_OPTIONS}
            getLabel={(o) => tc(o)}
            icon={<Wheat size={16} />}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t("suggest.loading")}
            </>
          ) : (
            <>
              <FlaskConical size={18} />
              {t("suggest.button")}
            </>
          )}
        </button>
      </form>

      <div className="lg:col-span-2">
        <div className="flex h-full flex-col justify-center rounded-2xl border border-border bg-gradient-to-br from-secondary to-card p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("fertPage.resultTitle")}
          </span>
          {loading ? (
            <div className="mt-4 flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Loader2 size={40} strokeWidth={1.75} className="animate-spin" />
              </div>
              <p className="max-w-[16rem] text-sm text-muted-foreground">{t("fertPage.analyzing")}</p>
            </div>
          ) : error ? (
            <div className="mt-4 flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/12 text-destructive">
                <AlertTriangle size={40} strokeWidth={1.75} />
              </div>
              <p className="max-w-[16rem] text-sm text-muted-foreground">{error}</p>
            </div>
          ) : result ? (
            <div className="mt-4 flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/12 text-primary">
                <FlaskConical size={40} strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-heading text-3xl font-bold text-foreground">{tf(result)}</p>
                {submittedContext ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("fertPage.suggestedFor", {
                      crop: tc(submittedContext.crop),
                      soil: t(`soil.${submittedContext.soil}.lower`),
                    })}
                  </p>
                ) : null}
                {showApproxNote ? (
                  <p className="mt-2 text-xs text-muted-foreground">{t("fertPage.approx")}</p>
                ) : null}
              </div>

              {organic.length > 0 ? (
                <div className="w-full rounded-xl bg-primary/5 p-3 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("fertPage.organicTitle")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("fertPage.organicSub")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {organic.map((o) => {
                      const key = `organic.${o.id}.name`
                      const translated = t(key)
                      return (
                        <Link
                          key={o.id}
                          href={`/organic-fertilizers#${o.id}`}
                          className="rounded-full bg-card px-3 py-1.5 text-sm font-medium text-primary shadow-sm hover:underline"
                        >
                          {translated === key ? o.name : translated}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FlaskConical size={40} strokeWidth={1.5} />
              </div>
              <p className="max-w-[16rem] text-sm text-muted-foreground">{t("fertPage.empty")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
