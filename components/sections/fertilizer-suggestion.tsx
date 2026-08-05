"use client"

import { useState } from "react"
import { FlaskConical, Sprout, Droplets, Thermometer, Waves, Layers, Wheat, Loader2, AlertTriangle } from "lucide-react"
import { NumberField, SelectField } from "@/components/form-fields"
import { SOIL_TYPES, CROP_TYPES } from "@/lib/agro-data"

const PREDICT_FERTILIZER_URL = "/api/predict-fertilizer"

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
  crop: CROP_TYPES[0],
}

export function FertilizerSuggestion() {
  const [fields, setFields] = useState<Fields>(INITIAL)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedContext, setSubmittedContext] = useState<{ crop: string; soil: string } | null>(null)

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
          crop_type: fields.crop,
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
      setError("We couldn't get a suggestion right now. Please check your inputs and try again in a moment.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <h2 className="font-heading text-lg font-semibold text-foreground">Field & Crop Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide soil nutrients and crop to get a fertilizer recommendation.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Temperature"
            name="f-temperature"
            unit="°C"
            value={fields.temperature}
            onChange={setField("temperature")}
            icon={<Thermometer size={16} />}
          />
          <NumberField
            label="Humidity"
            name="f-humidity"
            unit="%"
            value={fields.humidity}
            onChange={setField("humidity")}
            icon={<Droplets size={16} />}
          />
          <NumberField
            label="Moisture"
            name="f-moisture"
            unit="%"
            value={fields.moisture}
            onChange={setField("moisture")}
            icon={<Waves size={16} />}
          />
          <NumberField
            label="Nitrogen"
            name="f-nitrogen"
            unit="kg/ha"
            value={fields.N}
            onChange={setField("N")}
            icon={<Sprout size={16} />}
          />
          <NumberField
            label="Potassium"
            name="f-potassium"
            unit="kg/ha"
            value={fields.K}
            onChange={setField("K")}
            icon={<Sprout size={16} />}
          />
          <NumberField
            label="Phosphorous"
            name="f-phosphorous"
            unit="kg/ha"
            value={fields.P}
            onChange={setField("P")}
            icon={<Sprout size={16} />}
          />
          <SelectField
            label="Soil Type"
            name="soil"
            value={fields.soil}
            onChange={setField("soil")}
            options={SOIL_TYPES}
            icon={<Layers size={16} />}
          />
          <SelectField
            label="Crop Type"
            name="crop"
            value={fields.crop}
            onChange={setField("crop")}
            options={CROP_TYPES}
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
              Getting suggestion…
            </>
          ) : (
            <>
              <FlaskConical size={18} />
              Get Suggestion
            </>
          )}
        </button>
      </form>

      <div className="lg:col-span-2">
        <div className="flex h-full flex-col justify-center rounded-2xl border border-border bg-gradient-to-br from-secondary to-card p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recommended Fertilizer
          </span>
          {loading ? (
            <div className="mt-4 flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Loader2 size={40} strokeWidth={1.75} className="animate-spin" />
              </div>
              <p className="max-w-[16rem] text-sm text-muted-foreground">
                Analyzing your field details… This can take up to{" "}
                <span className="font-medium text-foreground">60 seconds</span> on the first request while the service
                wakes up.
              </p>
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
                <p className="font-heading text-3xl font-bold text-foreground">{result}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Suggested for {submittedContext?.crop} on {submittedContext?.soil} soil.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FlaskConical size={40} strokeWidth={1.5} />
              </div>
              <p className="max-w-[16rem] text-sm text-muted-foreground">
                Enter your details and tap{" "}
                <span className="font-medium text-foreground">Get Suggestion</span> to see the recommended fertilizer here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
