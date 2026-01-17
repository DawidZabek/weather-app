"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const body = await res.json().catch(() => null);
      setIsLoading(false);

      if (!res.ok) {
        setError(body?.error ?? "Registration failed");
        return;
      }

      setInfo("Account created. You can now login.");
      setTimeout(() => router.push("/login"), 600);
    } catch {
      setIsLoading(false);
      setError("Network error");
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold">Register</h1>
      <p className="mt-1 text-sm text-zinc-300">
        Create an account or continue as a guest.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
      >
        <label className="block text-sm text-zinc-200">Email</label>
        <input
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <label className="mt-4 block text-sm text-zinc-200">Username</label>
        <input
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. dawidzabek"
        />

        <label className="mt-4 block text-sm text-zinc-200">Password</label>
        <input
          type="password"
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="min. 6 characters"
        />

        {error && (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {info && (
          <div className="mt-4 rounded-xl border border-emerald-900/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
            {info}
          </div>
        )}

        <button
          disabled={isLoading}
          className="mt-5 w-full rounded-xl bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-60"
        >
          {isLoading ? "Creating..." : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-3 w-full rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-100"
        >
          Continue as guest
        </button>
      </form>
    </main>
  );
}
