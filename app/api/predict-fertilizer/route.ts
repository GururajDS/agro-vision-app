import { NextResponse } from "next/server"

const UPSTREAM_URL = "https://agro-vision-api.onrender.com/predict-fertilizer"

// Allow up to ~60s for the upstream service to "wake up" from cold start.
export const maxDuration = 60

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60_000)

    const upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Prediction service responded with status ${upstream.status}.` },
        { status: 502 },
      )
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Could not reach the prediction service. It may be waking up — please try again." },
      { status: 504 },
    )
  }
}
