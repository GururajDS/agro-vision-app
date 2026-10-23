"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Sprout, Locate, Loader2, CheckCircle2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { NumberField, SelectField } from "@/components/form-fields"
import { SOIL_TYPES, SOIL_NPK_DEFAULTS } from "@/lib/agro-data"
import { getFieldProfile, saveFieldProfile } from "@/lib/field-profile"
import { enablePushNotifications, getPushPermissionState } from "@/lib/push-notifications"
import { useT } from "@/lib/i18n"

// The push helper throws English messages; map the known ones to translated text.
const PUSH_ERRORS: Record<string, string> = {
  "Not logged in": "myField.err.notLoggedIn",
  "Notifications aren't supported on this browser/device": "myField.err.pushUnsupported",
  "Notification permission was not granted": "myField.err.pushDenied",
}

function MyFieldForm() {
  const router = useRouter()
  const { t, lang } = useT()
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
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const [pushError, setPushError] = useState<string | null>(null)

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
      getPushPermissionState().then((state) => setPushEnabled(state === "granted"))
    })
  }, [])

  function handleDetectLocation() {
    setLocationError(null)
    if (!("geolocation" in navigator)) {
      setLocationError(t("myField.err.locUnsupported"))
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
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`,
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
          err.code === err.PERMISSION_DENIED ? t("myField.err.locDenied") : t("myField.err.locFailed"),
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
    return <p className="p-6 text-sm text-muted-foreground">{t("common.loading")}</p>
  }

  return (
    <div className="mx-auto max-w-md p-5">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MapPin size={20} />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">{t("myField.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("myField.subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <NumberField
          label={t("myField.landArea")}
          name="landArea"
          value={landArea}
          onChange={setLandArea}
          unit={t("myField.acres")}
          placeholder={t("myField.placeholder")}
        />

        <SelectField
          label={t("myField.soilType")}
          name="soilType"
          value={soilType}
          onChange={(v) => setSoilType(v as (typeof SOIL_TYPES)[number])}
          options={SOIL_TYPES}
          getLabel={(o) => t(`soil.${o}`)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <span className="text-primary">
              <MapPin size={14} />
            </span>
            {t("myField.location")}
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
                {detecting ? t("myField.detecting") : t("myField.redetect")}
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
                  {t("myField.detecting")}
                </>
              ) : (
                <>
                  <Locate size={16} className="mr-1.5" />
                  {t("myField.detect")}
                </>
              )}
            </Button>
          )}

          {locationError ? <p className="text-xs text-destructive">{locationError}</p> : null}
          <p className="text-xs text-muted-foreground/80">{t("myField.locHelp")}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t("myField.weatherAlerts")}</label>
          <Button
            variant="outline"
            onClick={async () => {
              setPushBusy(true)
              setPushError(null)
              try {
                await enablePushNotifications()
                setPushEnabled(true)
              } catch (e) {
                const msg = e instanceof Error ? e.message : ""
                setPushError(PUSH_ERRORS[msg] ? t(PUSH_ERRORS[msg]) : msg || t("login.somethingWrong"))
              } finally {
                setPushBusy(false)
              }
            }}
            disabled={pushBusy || pushEnabled}
            className="w-full justify-center"
          >
            {pushEnabled ? t("myField.pushEnabled") : pushBusy ? t("myField.pushEnabling") : t("myField.pushEnable")}
          </Button>
          {pushError ? <p className="text-xs text-destructive">{pushError}</p> : null}
        </div>

        <div className="rounded-xl bg-primary/5 p-3.5 text-sm">
          <p className="mb-1.5 flex items-center gap-1.5 font-medium text-primary">
            <Sprout size={14} />
            {t("myField.nutrients")}
          </p>
          <p className="text-muted-foreground">{t("myField.npkLine", { N: npk.N, P: npk.P, K: npk.K })}</p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            {t("myField.npkNote", { soil: t(`soil.${soilType}.lower`) })}
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving || !landArea} className="w-full justify-center">
          {saving ? t("myField.saving") : t("myField.save")}
        </Button>

        {saved ? (
          <div className="flex flex-col gap-2">
            <p className="text-center text-sm text-primary">{t("myField.saved")}</p>
            <Button variant="outline" onClick={() => router.push("/")} className="w-full justify-center">
              {t("myField.goDashboard")}
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
