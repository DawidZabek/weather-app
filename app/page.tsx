"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

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

type FavoriteItem = {
  city: string;
  cityKey: string;
  createdAt?: string;
};

type FavoritesResponse = {
  favorites: FavoriteItem[];
};

function formatNumber(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) return "—";
  return `${value}${unit}`;
}

function normalizeCityKey(value: string) {
  return value.trim().toLowerCase();
}

export default function HomePage() {
  const [city, setCity] = useState("");
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);

  const { status, data: session } = useSession();
  const isLoggedIn = status === "authenticated";

  const subtitle = useMemo(() => {
    if (!data) return "Search for a city to see the current weather.";
    const regionPart = data.region ? `${data.region}, ` : "";
    return `${data.city} · ${regionPart}${data.country}`;
  }, [data]);

  const displayName =
    (session?.user as any)?.username ?? session?.user?.email ?? "User";

  const currentCityKey = normalizeCityKey(city);

  async function fetchFavorites() {
    if (!isLoggedIn) return;
    setIsFavoritesLoading(true);
    setFavoritesError(null);

    try {
      const res = await fetch("/api/favorites");
      const body = (await res.json().catch(() => null)) as FavoritesResponse | any;

      if (!res.ok) {
        setFavoritesError(body?.error ?? "Failed to load favorites");
        return;
      }

      const items = Array.isArray(body?.favorites) ? body.favorites : [];
      setFavorites(
        items.map((f: any) => ({
          city: String(f.city ?? ""),
          cityKey: String(f.cityKey ?? normalizeCityKey(String(f.city ?? ""))),
          createdAt: f.createdAt ? String(f.createdAt) : undefined,
        }))
      );
    } catch {
      setFavoritesError("Network error while loading favorites");
    } finally {
      setIsFavoritesLoading(false);
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoritesError(null);
    }
  }, [isLoggedIn]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          body?.error ?? `Request failed with status ${res.status}.`;
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

  async function searchCity(nextCity: string) {
  const normalized = nextCity.trim();
  if (!normalized) return;

  setCity(normalized);
  setError(null);
  setIsLoading(true);

  try {
  const res = await fetch(`/api/weather?city=${encodeURIComponent(normalized)}`);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
  const message = body?.error ?? `Request failed with status ${res.status}.`;
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

  async function addCurrentCityToFavorites() {
    if (!isLoggedIn) return;

    const cityDisplay = city.trim();
    const cityKey = normalizeCityKey(cityDisplay);
    if (!cityKey) return;

    setIsSavingFavorite(true);
    setFavoritesError(null);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: cityDisplay }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setFavoritesError(body?.error ?? "Failed to add favorite");
        return;
      }

      await fetchFavorites();
    } catch {
      setFavoritesError("Network error while adding favorite");
    } finally {
      setIsSavingFavorite(false);
    }
  }

  async function removeFavorite(cityKeyToRemove: string) {
    if (!isLoggedIn) return;

    setFavoritesError(null);

    try {
      const res = await fetch(
        `/api/favorites/${encodeURIComponent(cityKeyToRemove)}`,
        { method: "DELETE" }
      );
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setFavoritesError(body?.error ?? "Failed to remove favorite");
        return;
      }

      setFavorites((prev) => prev.filter((f) => f.cityKey !== cityKeyToRemove));
    } catch {
      setFavoritesError("Network error while removing favorite");
    }
  }

  const canAddFavorite = isLoggedIn && city.trim().length > 0;
  const isAlreadyFavorite = favorites.some((f) => f.cityKey === currentCityKey);

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
        <div>
          <p className="text-xs text-zinc-400">Mode</p>
          <p className="text-sm font-semibold text-zinc-100">
            {isLoggedIn ? `Logged in as ${displayName}` : "Guest"}
          </p>
        </div>

        <div className="flex items-center gap-2">
      <Link
        href="/map"
        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold"
      >
        Weather Map
      </Link>
      <Link
      href={`/forecast?city=${encodeURIComponent(city.trim())}`}
      className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold"
    >
      7-day Forecast
    </Link>

      {!isLoggedIn ? (
        <>
          <Link
            href="/login"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950"
          >
            Register
          </Link>
        </>
      ) : (
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold"
        >
          Logout
        </button>
      )}
    </div>
      </div>

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

          <button
            type="button"
            disabled={!canAddFavorite || isSavingFavorite || isAlreadyFavorite}
            onClick={addCurrentCityToFavorites}
            className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            title={!isLoggedIn ? "Login to save favorites" : undefined}
          >
            {isAlreadyFavorite
              ? "In favorites"
              : isSavingFavorite
              ? "Saving..."
              : "Add to favorites"}
          </button>
        </form>

        {!isLoggedIn && (
          <p className="mt-3 text-xs text-zinc-400">
            Login to save favorite cities to your account.
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Favorites</h2>
            <p className="text-sm text-zinc-300">
              {isLoggedIn
                ? "Your saved cities"
                : "Login to use favorites."}
            </p>
          </div>

          {isLoggedIn && (
            <button
              onClick={fetchFavorites}
              disabled={isFavoritesLoading}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {isFavoritesLoading ? "Refreshing..." : "Refresh"}
            </button>
          )}
        </div>

        {favoritesError && (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {favoritesError}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {isLoggedIn && favorites.length === 0 && !isFavoritesLoading && (
            <p className="text-sm text-zinc-400">No favorites yet.</p>
          )}

          {favorites.map((fav) => (
            <div
              key={fav.cityKey}
              className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-2"
            >
              <button
                className="text-sm font-semibold text-zinc-100 hover:underline"
                onClick={() => searchCity(fav.city)}
                type="button"
                title="Click to load city"
              >
                {fav.city}
              </button>
              <button
                className="text-xs text-zinc-400 hover:text-zinc-200"
                onClick={() => removeFavorite(fav.cityKey)}
                type="button"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
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
                  Coordinates & metadata returned by the API
                </p>
              </div>

              <div className="text-xs text-zinc-400">
                {data?.current?.time ? `Updated: ${data.current.time}` : "—"}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <KeyValue
                label="Latitude"
                value={data ? String(data.latitude) : "—"}
              />
              <KeyValue
                label="Longitude"
                value={data ? String(data.longitude) : "—"}
              />
              <KeyValue label="Country" value={data ? data.country : "—"} />
              <KeyValue label="Region" value={data ? data.region ?? "—" : "—"} />
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto text-xs text-zinc-500">
        Weather app by Dawid Ząbek.
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
