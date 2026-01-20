"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayersControl,
  MapContainer,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

type RadarInfo = {
  tileUrlTemplate: string;
  generated: number;
  maxZoom: number;
};

type MapWeatherResponse = {
  latitude: number;
  longitude: number;
  current: {
    temperature: number | null;
    precipitation: number | null;
    windSpeed: number | null;
    windDirection: number | null;
    time: string | null;
  };
};

function formatNumber(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) return "—";
  return `${value}${unit}`;
}

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapClient() {
  const [radar, setRadar] = useState<RadarInfo | null>(null);
  const [radarError, setRadarError] = useState<string | null>(null);

  const [picked, setPicked] = useState<{ lat: number; lon: number }>({
    lat: 52.2297,
    lon: 21.0122,
  });

  const [weather, setWeather] = useState<MapWeatherResponse | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  const center = useMemo<[number, number]>(
    () => [picked.lat, picked.lon],
    [picked.lat, picked.lon]
  );

  async function fetchRadar() {
    setRadarError(null);
    try {
      const res = await fetch("/api/map/radar");
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setRadarError(body?.error ?? "Failed to load radar tiles");
        return;
      }

      setRadar(body as RadarInfo);
    } catch {
      setRadarError("Network error while loading radar tiles");
    }
  }

  async function fetchWeather(lat: number, lon: number) {
    setWeatherError(null);
    setIsWeatherLoading(true);

    try {
      const res = await fetch(
        `/api/map/weather?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(
          String(lon)
        )}`
      );
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setWeatherError(body?.error ?? "Failed to load weather for this point");
        setWeather(null);
        return;
      }

      setWeather(body as MapWeatherResponse);
    } catch {
      setWeatherError("Network error while loading weather");
      setWeather(null);
    } finally {
      setIsWeatherLoading(false);
    }
  }

  useEffect(() => {
    fetchRadar();
  }, []);

  useEffect(() => {
    fetchWeather(picked.lat, picked.lon);
  }, [picked.lat, picked.lon]);

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Weather Map
          </h1>
          <p className="text-xs text-zinc-400">
            Click on the map to read current conditions for that point.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm font-semibold"
        >
          ← Back to app
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-8 lg:grid-cols-[1fr_340px]">
        {/* MAP */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
          <MapContainer
            center={center}
            zoom={4}
            scrollWheelZoom
            className="h-[70dvh] w-full"
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.Overlay checked name="Radar (precipitation)">
                {radar ? (
                  <TileLayer
                    url={radar.tileUrlTemplate}
                    opacity={0.6}
                    zIndex={10}
                    maxZoom={radar.maxZoom}
                  />
                ) : null}
              </LayersControl.Overlay>
            </LayersControl>

            <ClickHandler
              onPick={(lat, lon) => setPicked({ lat, lon })}
            />
          </MapContainer>
        </div>

        <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Point data</h2>
              <p className="text-xs text-zinc-400">
                Source: Open-Meteo (via server API)
              </p>
            </div>

            <button
              onClick={() => fetchWeather(picked.lat, picked.lon)}
              disabled={isWeatherLoading}
              className="rounded-xl border border-zinc-800 px-3 py-2 text-xs font-semibold disabled:opacity-60"
            >
              {isWeatherLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
              <div className="text-xs text-zinc-400">Latitude</div>
              <div className="text-sm font-semibold">{picked.lat.toFixed(4)}</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
              <div className="text-xs text-zinc-400">Longitude</div>
              <div className="text-sm font-semibold">{picked.lon.toFixed(4)}</div>
            </div>

            {weatherError && (
              <div className="rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                {weatherError}
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
              <div className="text-xs text-zinc-400">Updated</div>
              <div className="mt-1 text-sm">
                {weather?.current?.time ?? "—"}
              </div>

              <div className="mt-4 grid gap-3">
                <Metric
                  label="Temperature"
                  value={formatNumber(weather?.current?.temperature, "°C")}
                />
                <Metric
                  label="Precipitation"
                  value={formatNumber(weather?.current?.precipitation, " mm")}
                />
                <Metric
                  label="Wind speed"
                  value={formatNumber(weather?.current?.windSpeed, " km/h")}
                />
                <Metric
                  label="Wind direction"
                  value={formatNumber(weather?.current?.windDirection, "°")}
                />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
              <div className="text-xs text-zinc-400">Radar overlay</div>

              {radarError ? (
                <div className="mt-2 text-sm text-red-200">{radarError}</div>
              ) : radar ? (
                <div className="mt-2 text-sm text-zinc-200">
                  Tiles ready (max zoom: {radar.maxZoom})
                </div>
              ) : (
                <div className="mt-2 text-sm text-zinc-400">Loading…</div>
              )}

              <p className="mt-2 text-xs text-zinc-500">
                Radar tiles provided by RainViewer (limits may apply).
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 px-3 py-2">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
