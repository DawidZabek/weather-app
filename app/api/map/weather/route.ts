import { NextResponse } from "next/server";

function toNumber(value: string | null) {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = toNumber(searchParams.get("lat"));
    const lon = toNumber(searchParams.get("lon"));

    if (lat === null || lon === null) {
      return NextResponse.json(
        { error: "Missing or invalid lat/lon" },
        { status: 400 }
      );
    }

    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${encodeURIComponent(String(lat))}` +
      `&longitude=${encodeURIComponent(String(lon))}` +
      "&current=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m" +
      "&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm" +
      "&timezone=UTC";

    const upstream = await fetch(url, { cache: "no-store" });

    const data = await upstream.json().catch(async () => {
      const text = await upstream.text().catch(() => "");
      return { _raw: text };
    });

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: "Upstream weather API error",
          upstreamStatus: upstream.status,
          upstreamBody: data,
        },
        { status: 502 }
      );
    }

    const current = data?.current ?? {};

    return NextResponse.json(
      {
        latitude: lat,
        longitude: lon,
        current: {
          temperature:
            typeof current.temperature_2m === "number"
              ? current.temperature_2m
              : null,
          precipitation:
            typeof current.precipitation === "number" ? current.precipitation : null,
          windSpeed:
            typeof current.wind_speed_10m === "number" ? current.wind_speed_10m : null,
          windDirection:
            typeof current.wind_direction_10m === "number"
              ? current.wind_direction_10m
              : null,
          time: typeof current.time === "string" ? current.time : null,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Server error while loading map weather" },
      { status: 500 }
    );
  }
}
