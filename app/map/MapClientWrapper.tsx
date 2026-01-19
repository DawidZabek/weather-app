"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70dvh] items-center justify-center text-zinc-400">
      Loading map…
    </div>
  ),
});

export default function MapClientWrapper() {
  return <MapClient />;
}
