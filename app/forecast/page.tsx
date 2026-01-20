"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ForecastDay = {
  date: string;
  tempMax: number | null;
  tempMin: number | null;
  precipitationSum: number | null;
  windSpeedMax: number | null;
};

type ForecastResponse = {
  city: string;
  country: string | null;
  latitude: number;
  longitude: number;
  days: ForecastDay[];
};

function formatNumber(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) return "—";
  return `${value}${unit}`;
}

export default function ForecastPage() {
  const sp = useSearchParams();
  const initialCity = (sp.get("city") ?? "").trim();

  const [city, setCity] = useState(initialCity);
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const subtitle = useMemo(() => {
    if (!data) return "7-day forecast powered by Open-Meteo (via server API).";
    const countryPart = data.country ? `, ${data.country}` : "";
    return `${data.city}${countryPart} · ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`;
  }, [data]);

  async function loadForecast(nextCity: string) {
    const normalized = nextCity.trim();
    if (!normalized) {
      setError("Please provide a city name.");
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/forecast?city=${encodeURIComponent(normalized)}`);
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setData(null);
        setError(body?.error ?? `Request failed with status ${res.status}`);
        return;
      }

      setData(body as ForecastResponse);
    } catch {
      setData(null);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (initialCity) {
      loadForecast(initialCity);
    }
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            7-day Forecast
          </h1>
          <p className="mt-2 text-sm text-zinc-300">{subtitle}</p>
        </div>

        <Link
          href="/"
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold"
        >
          ← Back
        </Link>
      </header>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadForecast(city);
          }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-zinc-200">
              City name
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Warsaw"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Show forecast"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <div className="border-b border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-100">
          Next 7 days
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-zinc-950/40 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Min</th>
                <th className="px-4 py-3">Max</th>
                <th className="px-4 py-3">Precip</th>
                <th className="px-4 py-3">Wind max</th>
              </tr>
            </thead>
            <tbody>
              {(data?.days ?? []).map((d) => (
                <tr key={d.date} className="border-t border-zinc-800">
                  <td className="px-4 py-3 font-semibold text-zinc-100">{d.date}</td>
                  <td className="px-4 py-3">{formatNumber(d.tempMin, "°C")}</td>
                  <td className="px-4 py-3">{formatNumber(d.tempMax, "°C")}</td>
                  <td className="px-4 py-3">{formatNumber(d.precipitationSum, " mm")}</td>
                  <td className="px-4 py-3">{formatNumber(d.windSpeedMax, " km/h")}</td>
                </tr>
              ))}

              {!data?.days?.length && (
                <tr className="border-t border-zinc-800">
                  <td className="px-4 py-4 text-zinc-400" colSpan={5}>
                    Enter a city name to load the forecast.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-auto text-xs text-zinc-500">
        Server-side endpoint: <span className="text-zinc-300">/api/forecast</span>
      </footer>
    </main>
  );
}
