"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (!res?.ok) {
      setError("Invalid email or password");
      return;
    }

    router.push("/");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-1 text-sm text-zinc-300">
        You can also continue as a guest.
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
        />

        <label className="mt-4 block text-sm text-zinc-200">Password</label>
        <input
          type="password"
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          disabled={isLoading}
          className="mt-5 w-full rounded-xl bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-60"
        >
          {isLoading ? "Signing in..." : "Sign in"}
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
