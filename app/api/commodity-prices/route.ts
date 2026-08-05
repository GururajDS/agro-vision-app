import { NextResponse } from "next/server"

const COMMODITY_URL = "https://qhqbzrpwjlvfqgtsaozl.supabase.co/functions/v1/commodity-prices"

export async function GET() {
  const token = process.env.JWT

  if (!token) {
    return NextResponse.json({ error: "Server is missing the commodity API credentials." }, { status: 500 })
  }

  try {
    const upstream = await fetch(COMMODITY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Give the edge function some room, and avoid caching stale prices.
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    })

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream request failed with status ${upstream.status}` },
        { status: 502 },
      )
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Could not reach the commodity price service." }, { status: 502 })
  }
}
