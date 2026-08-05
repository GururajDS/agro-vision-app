"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search, MapPin, Thermometer, Droplets, CloudSun, Sunrise, Loader2, AlertTriangle } from "lucide-react"

type WeatherResult = {
  location: string
  temperature: number
  humidity: number
  condition: string
}

function describeWeatherCode(code: number): string {
  if (code === 0) return "Clear sky"
  if (code >= 1 && code <= 3) return "Partly cloudy"
  if (code === 45 || code === 48) return "Foggy"
  if (code >= 51 && code <= 67) return "Rainy"
  if (code >= 71 && code <= 86) return "Snowy"
  if (code >= 95) return "Thunderstorm"
  return "Unknown"
}

async function fetchWeather(location: string): Promise<WeatherResult> {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`,
  )
  if (!geoRes.ok) throw new Error("geocoding-failed")
  const geo = (await geoRes.json()) as {
    results?: { latitude: number; longitude: number; name: string; country?: string }[]
  }

  const place = geo.results?.[0]
  if (!place) throw new Error("not-found")

  const wxRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`,
  )
  if (!wxRes.ok) throw new Error("forecast-failed")
  const wx = (await wxRes.json()) as {
    current?: { temperature_2m: number; relative_humidity_2m: number; weather_code: number }
  }

  if (!wx.current) throw new Error("forecast-failed")

  return {
    location: place.country ? `${place.name}, ${place.country}` : place.name,
    temperature: Math.round(wx.current.temperature_2m),
    humidity: wx.current.relative_humidity_2m,
    condition: describeWeatherCode(wx.current.weather_code),
  }
}

export function Weather() {
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("Bengaluru")

  const { data: weather, error, isLoading } = useSWR(["weather", location], () => fetchWeather(location), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    keepPreviousData: true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = query.trim()
    if (next) setLocation(next)
  }

  const notFound = error instanceof Error && error.message === "not-found"

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MapPin
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a location (e.g. Nashik)"
            className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-3.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          Search
        </button>
      </form>

      {error ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground">
          <AlertTriangle size={20} className="shrink-0 text-destructive" />
          {notFound
            ? `We couldn't find "${location}". Please check the spelling and try another location.`
            : "We couldn't load the weather right now. Please try again in a moment."}
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-sm">
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
                  <MapPin size={16} />
                  {weather?.location ?? location}
                </div>
                <div className="mt-2 flex items-end gap-2">
                  {isLoading && !weather ? (
                    <Loader2 size={48} strokeWidth={1.5} className="my-1.5 animate-spin" />
                  ) : (
                    <>
                      <span className="font-heading text-6xl font-bold leading-none">{weather?.temperature}°</span>
                      <span className="pb-1 text-lg text-primary-foreground/80">C</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  {isLoading && !weather ? "Fetching latest conditions…" : weather?.condition}
                </p>
              </div>
              <CloudSun size={96} strokeWidth={1.25} className="text-primary-foreground/70" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              {
                label: "Temperature",
                value: weather ? `${weather.temperature}°C` : "—",
                icon: Thermometer,
              },
              {
                label: "Humidity",
                value: weather ? `${weather.humidity}%` : "—",
                icon: Droplets,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={18} />
                </div>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-0.5 font-heading text-lg font-semibold text-foreground">
                  {isLoading && !weather ? "…" : value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-accent/30 px-4 py-3 text-sm text-secondary-foreground">
            <Sunrise size={18} className="text-accent-foreground" />
            Live current conditions from Open-Meteo. No API key required.
          </div>
        </>
      )}
    </div>
  )
}
