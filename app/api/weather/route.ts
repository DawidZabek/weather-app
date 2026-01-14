import { NextResponse } from "next/server";

type GeoResponse = {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  }>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  if (!city || city.trim().length < 2) {
    return NextResponse.json(
      { error: "Query parameter 'city' is required" },
      { status: 400 }
    );
  }

  try {
    // 1) Geocoding: city -> coordinates
    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}` + `&count=1&language=en&format=json`;

    const geoRes = await fetch(geoUrl, { cache: "no-store" });
    if (!geoRes.ok) {
      return NextResponse.json(
        { error: "Geocoding service error" },
        { status: 502 }
      );
    }

    const geoData = (await geoRes.json()) as GeoResponse;
    const place = geoData.results?.[0];

    if (!place) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    // 2) Current weather (no API key required)
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}` +
      `&longitude=${place.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m` +
      `&timezone=auto`;

    const weatherRes = await fetch(weatherUrl, { cache: "no-store" });
    if (!weatherRes.ok) {
      return NextResponse.json(
        { error: "External weather service error" },
        { status: 502 }
      );
    }

    const weatherData = await weatherRes.json();

    return NextResponse.json(
      {
        city: place.name,
        country: place.country,
        region: place.admin1 ?? null,
        latitude: place.latitude,
        longitude: place.longitude,
        current: {
          temperature: weatherData?.current?.temperature_2m,
          humidity: weatherData?.current?.relative_humidity_2m,
          windSpeed: weatherData?.current?.wind_speed_10m,
          time: weatherData?.current?.time,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch weather data (network/connection issue)" },
      { status: 502 }
    );
  }
}
