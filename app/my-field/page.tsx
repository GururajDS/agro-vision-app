"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Sprout } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { NumberField, SelectField } from "@/components/form-fields"
import { SOIL_TYPES, SOIL_NPK_DEFAULTS } from "@/lib/agro-data"
import { getFieldProfile, saveFieldProfile } from "@/lib/field-profile"

function MyFieldForm() {
  const router = useRouter()
  const [landArea, setLandArea] = useState("")
  const [soilType, setSoilType] = useState<(typeof SOIL_TYPES)[number]>(SOIL_TYPES[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getFieldProfile().then((profile) => {
      if (profile) {
        setLandArea(String(profile.land_area_acres))
        setSoilType(profile.soil_type as (typeof SOIL_TYPES)[number])
      }
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await saveFieldProfile({
        land_area_acres: Number(landArea),
        soil_type: soilType,
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
