"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Sprout, Locate, Loader2, CheckCircle2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { NumberField, SelectField } from "@/components/form-fields"
import { SOIL_TYPES, SOIL_NPK_DEFAULTS } from "@/lib/agro-data"
import { getFieldProfile, saveFieldProfile } from "@/lib/field-profile"

function MyFieldForm() {
  const router = useRouter()
  const [landArea, setLandArea] = useState("")
  const [soilType, setSoilType] = useState<(typeof SOIL_TYPES)[number]>(SOIL_TYPES[0])
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationName, setLocationName] = useState<string | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getFieldProfile().then((profile) => {
      if (profile) {
        setLandArea(String(profile.land_area_acres))
        setSoilType(profile.soil_type as (typeof SOIL_TYPES)[number])
        setLatitude(profile.latitude ?? null)
        setLongitude(profile.longitude ?? null)
        setLocationName(profile.location_name ?? null)
      }
      setLoading(false)
    })
  }, [])

  function handleDetectLocation() {
    setLocationError(null)
    if (!("geolocation" in navigator)) {
      setLocationError("Location isn't supported on this device/browser.")
      return
    }
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setLatitude(lat)
        setLongitude(lon)
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
          )
          const data = await res.json()
          const name = [data.locality, data.principalSubdivision].filter(Boolean).join(", ")
          setLocationName(name || `${lat.toFixed(3)}, ${lon.toFixed(3)}`)
        } catch {
          setLocationName(`${lat.toFixed(3)}, ${lon.toFixed(3)}`)
        } finally {
          setDetecting(false)
        }
      },
      (err) => {
        setDetecting(false)
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. You can allow it in your browser settings and try again."
            : "Couldn't detect your location. Please try again.",
        )
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await saveFieldProfile({
        land_area_acres: Number(landArea),
        soil_type: soilType,
        latitude,
        longitude,
        location_name: locationName,
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const npk = SOIL_NPK_DEFAULTS[soilType]

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading…</p>
  }

  return (
    <div className="mx-auto max-w-md p-5">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MapPin size={20} />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">My Field</h1>
          <p className="text-xs text-muted-foreground">Saved once, editable anytime</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <NumberField
          label="Land area"
          name="landArea"
          value={landArea}
          onChange={setLandArea}
          unit="acres"
          placeholder="e.g. 2.5"
        />

        <SelectField
          label="Soil type"
          name="soilType"
          value={soilType}
          onChange={(v) => setSoilType(v as (typeof SOIL_TYPES)[number])}
          options={SOIL_TYPES}
        />

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <span className="text-primary">
              <MapPin size={14} />
            </span>
            Field location
          </label>

          {locationName ? (
            <div className="flex items-center justify-between rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm">
              <span className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 size={16} className="text-primary" />
                {locationName}
              </span>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detecting}
                className="text-xs font-medium text-primary hover:underline disabled:opacity-60"
              >
                {detecting ? "Detecting…" : "Re-detect"}
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleDetectLocation}
              disabled={detecting}
              className="w-full justify-center"
            >
              {detecting ? (
                <>
                  <Loader2 size={16} className="mr-1.5 animate-spin" />
                  Detecting…
                </>
              ) : (
                <>
                  <Locate size={16} className="mr-1.5" />
                  Detect my location
                </>
              )}
            </Button>
          )}

          {locationError ? <p className="text-xs text-destructive">{locationError}</p> : null}
          <p className="text-xs text-muted-foreground/80">
            Used for weather alerts. Your browser will ask permission the first time.
          </p>
        </div>

        <div className="rounded-xl bg-primary/5 p-3.5 text-sm">
          <p className="mb-1.5 flex items-center gap-1.5 font-medium text-primary">
            <Sprout size={14} />
            Estimated soil nutrients (starting point)
          </p>
          <p className="text-muted-foreground">
            N: {npk.N} kg/ha · P: {npk.P} kg/ha · K: {npk.K} kg/ha
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            These are general estimates for {soilType.toLowerCase()} soil. You can enter your
            own values later in Fertilizer Suggestion if you have exact numbers.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving || !landArea} className="w-full justify-center">
          {saving ? "Saving…" : "Save field details"}
        </Button>

        {saved ? (
          <div className="flex flex-col gap-2">
            <p className="text-center text-sm text-primary">Saved!</p>
            <Button variant="outline" onClick={() => router.push("/")} className="w-full justify-center">
              Go to dashboard
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function MyFieldPage() {
  return (
    <AuthGuard>
      <MyFieldForm />
    </AuthGuard>
  )
}
