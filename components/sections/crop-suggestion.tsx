"use client"

import { useState } from "react"
import { Leaf, Sprout, Droplets, Thermometer, FlaskConical, CloudRain, Loader2, AlertTriangle } from "lucide-react"
import { NumberField } from "@/components/form-fields"

const PREDICT_CROP_URL = "/api/predict-crop"

type Fields = {
  N: string
  P: string
  K: string
  temperature: string
  humidity: string
  ph: string
  rainfall: string
}

const EMPTY: Fields = {
  N: "",
  P: "",
  K: "",
  temperature: "",
  humidity: "",
  ph: "",
  rainfall: "",
}

export function CropSuggestion() {
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setField = (key: keyof Fields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(PREDICT_CROP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          n: Number(fields.N),
          p: Number(fields.P),
          k: Number(fields.K),
          temperature: Number(fields.temperature),
          humidity: Number(fields.humidity),
          ph: Number(fields.ph),
          rainfall: Number(fields.rainfall),
        }),
      })

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const data = (await res.json()) as { recommended_crop?: string }
      if (!data.recommended_crop) {
        throw new Error("No crop returned")
      }

      setResult(data.recommended_crop)
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
        <h2 className="font-heading text-lg font-semibold text-foreground">Soil & Climate Inputs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your field readings to get a recommended crop.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Nitrogen (N)"
            name="nitrogen"
            unit="kg/ha"
            value={fields.N}
            onChange={setField("N")}
            icon={<Sprout size={16} />}
          />
          <NumberField
            label="Phosphorous (P)"
            name="phosphorous"
            unit="kg/ha"
            value={fields.P}
            onChange={setField("P")}
            icon={<Sprout size={16} />}
          />
          <NumberField
            label="Potassium (K)"
            name="potassium"
            unit="kg/ha"
            value={fields.K}
            onChange={setField("K")}
            icon={<Sprout size={16} />}
          />
          <NumberField
            label="Temperature"
            name="temperature"
            unit="°C"
            value={fields.temperature}
            onChange={setField("temperature")}
            icon={<Thermometer size={16} />}
          />
          <NumberField
            label="Humidity"
            name="humidity"
            unit="%"
            value={fields.humidity}
            onChange={setField("humidity")}
            icon={<Droplets size={16} />}
          />
          <NumberField
            label="pH"
            name="ph"
            value={fields.ph}
            onChange={setField("ph")}
            icon={<FlaskConical size={16} />}
          />
          <NumberField
            label="Rainfall"
            name="rainfall"
            unit="mm"
            value={fields.rainfall}
            onChange={setField("rainfall")}
            icon={<CloudRain size={16} />}
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
              <Leaf size={18} />
              Get Suggestion
            </>
          )}
        </button>
      </form>

      <div className="lg:col-span-2">
        <div className="flex h-full flex-col justify-center rounded-2xl border border-border bg-gradient-to-br from-secondary to-card p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recommended Crop
          </span>
          {loading ? (
            <div className="mt-4 flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Loader2 size={40} strokeWidth={1.75} className="animate-spin" />
              </div>
              <p className="max-w-[16rem] text-sm text-muted-foreground">
                Analyzing your soil profile… This can take up to{" "}
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
                <Leaf size={40} strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-heading text-3xl font-bold capitalize text-foreground">{result}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Best suited for your current soil profile.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Leaf size={40} strokeWidth={1.5} />
              </div>
              <p className="max-w-[16rem] text-sm text-muted-foreground">
                Fill in the field values and tap{" "}
                <span className="font-medium text-foreground">Get Suggestion</span> to see the recommended crop here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
