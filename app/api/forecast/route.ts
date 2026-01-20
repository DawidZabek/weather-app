import { NextResponse } from "next/server";

function normalizeCity(value: string | null) {
  return String(value ?? "").trim();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = normalizeCity(searchParams.get("city"));

    if (!city) {
      return NextResponse.json({ error: "Missing city" }, { status: 400 });
    }

    const geoUrl =
      "https://geocoding-api.open-meteo.com/v1/search" +
      `?name=${encodeURIComponent(city)}` +
      "&count=1&language=en&format=json";

    const geoRes = await fetch(geoUrl, { cache: "no-store" });
    const geoData = await geoRes.json().catch(() => null);

    if (!geoRes.ok || !geoData?.results?.length) {
      return NextResponse.json(
        { error: "City not found" },
        { status: geoRes.ok ? 404 : 502 }
      );
    }

    const place = geoData.results[0];
    const lat = Number(place.latitude);
    const lon = Number(place.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: "Invalid geocoding result" }, { status: 502 });
    }

    const forecastUrl =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${encodeURIComponent(String(lat))}` +
      `&longitude=${encodeURIComponent(String(lon))}` +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max" +
      "&timezone=UTC";

    const upRes = await fetch(forecastUrl, { cache: "no-store" });
    const upData = await upRes.json().catch(() => null);

    if (!upRes.ok || !upData?.daily?.time) {
      return NextResponse.json(
        {
          error: "Upstream forecast API error",
          upstreamStatus: upRes.status,
          upstreamBody: upData,
        },
        { status: 502 }
      );
    }

    const daily = upData.daily;

    const days = (daily.time as string[]).slice(0, 7).map((date: string, i: number) => ({
      date,
      tempMax:
        typeof daily.temperature_2m_max?.[i] === "number" ? daily.temperature_2m_max[i] : null,
      tempMin:
        typeof daily.temperature_2m_min?.[i] === "number" ? daily.temperature_2m_min[i] : null,
      precipitationSum:
        typeof daily.precipitation_sum?.[i] === "number" ? daily.precipitation_sum[i] : null,
      windSpeedMax:
        typeof daily.wind_speed_10m_max?.[i] === "number" ? daily.wind_speed_10m_max[i] : null,
    }));

    return NextResponse.json(
      {
        city: String(place.name ?? city),
        country: place.country ?? null,
        latitude: lat,
        longitude: lon,
        days,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Server error while loading forecast" },
      { status: 500 }
    );
  }
}
