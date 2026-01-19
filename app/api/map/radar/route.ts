import { NextResponse } from "next/server";

export async function GET() {
  try {
    const upstream = await fetch(
      "https://api.rainviewer.com/public/weather-maps.json",
      { cache: "no-store" }
    );

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok || !data) {
      return NextResponse.json(
        {
          error: "Upstream radar API error",
          upstreamStatus: upstream.status,
        },
        { status: 502 }
      );
    }

    const host = String(data.host ?? "https://tilecache.rainviewer.com");
    const pastFrames = Array.isArray(data?.radar?.past) ? data.radar.past : [];
    const latest = pastFrames.length ? pastFrames[pastFrames.length - 1] : null;

    if (!latest?.path) {
      return NextResponse.json(
        { error: "Radar frames unavailable" },
        { status: 502 }
      );
    }

    // RainViewer tiled radar format (example): [RADAR_PATH]/256/{z}/{x}/{y}/1/1_1.png
    // See official examples/docs.
    const tileUrlTemplate = `${host}${latest.path}/256/{z}/{x}/{y}/1/1_1.png`;

    return NextResponse.json(
      {
        tileUrlTemplate,
        generated: Number(data.generated ?? 0),
        maxZoom: 10, // free tier limitation mentioned in examples
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Server error while loading radar tiles" },
      { status: 500 }
    );
  }
}
