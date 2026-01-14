"use client";

import { useMemo, useState } from "react";

type WeatherResponse = {
  city: string;
  country: string;
  region: string | null;
  latitude: number;
  longitude: number;
  current: {
    temperature: number | null;
    humidity: number | null;
    windSpeed: number | null;
    time: string | null;
  };
};

function formatNumber(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) return "—";
  return `${value}${unit}`;
}

export default function HomePage() {
  const [city, setCity] = useState("Warsaw");
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const subtitle = useMemo(() => {
    if (!data) return "Search for a city to see the current weather.";
    const regionPart = data.region ? `${data.region}, ` : "";
    return `${data.city} · ${regionPart}${data.country}`;
  }, [data]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, {
        method: "GET",
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          body?.error ||
          `Request failed with status ${res.status}. Please try again.`;
        setData(null);
        setError(message);
        return;
      }

      setData(body);
    } catch {
      setData(null);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Weather App
          </h1>

          <span className="rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-300">
            Server-side API: /api/weather
          </span>
        </div>

        <p className="text-sm text-zinc-300 sm:text-base">{subtitle}</p>
      </header>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-sm sm:p-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              City name
            </label>
            <input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Warsaw"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Temperature"
          value={formatNumber(data?.current?.temperature ?? null, "°C")}
          hint="Current temperature"
        />
        <StatCard
          title="Humidity"
          value={formatNumber(data?.current?.humidity ?? null, "%")}
          hint="Relative humidity"
        />
        <StatCard
          title="Wind speed"
          value={formatNumber(data?.current?.windSpeed ?? null, " km/h")}
          hint="10m wind speed"
        />

        <div className="sm:col-span-2 lg:col-span-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">
                  Details
                </h2>
                <p className="text-sm text-zinc-300">
                  Coordinates & timestamp returned by the API
                </p>
              </div>

              <div className="text-xs text-zinc-400">
                {data?.current?.time ? `Updated: ${data.current.time}` : "—"}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <KeyValue label="Latitude" value={data ? String(data.latitude) : "—"} />
              <KeyValue label="Longitude" value={data ? String(data.longitude) : "—"} />
              <KeyValue label="Country" value={data ? data.country : "—"} />
              <KeyValue label="Region" value={data ? data.region ?? "—" : "—"} />
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto text-xs text-zinc-500">
        Tip: try an invalid city name to see REST errors (400/404).
      </footer>
    </main>
  );
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-sm">
      <div className="text-sm font-medium text-zinc-200">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-zinc-400">{hint}</div>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
      <div className="text-xs font-medium text-zinc-400">{label}</div>
      <div className="mt-1 text-sm text-zinc-100">{value}</div>
    </div>
  );
}
