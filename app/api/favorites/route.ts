import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { FavoriteCity } from "@/models/FavoriteCity";

function normalizeCity(input: string) {
  return input.trim().toLowerCase();
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const favorites = await FavoriteCity.find({ userId: String(userId) })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    favorites: favorites.map((f: any) => ({
      city: f.cityDisplay ?? f.city,
      cityKey: f.city,
      createdAt: f.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const cityDisplay = String(body?.city ?? "").trim();
  const cityKey = normalizeCity(cityDisplay);

  if (!cityKey) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  await connectToDatabase();

  await FavoriteCity.updateOne(
    { userId: String(userId), city: cityKey },
    { $setOnInsert: { userId: String(userId), city: cityKey, cityDisplay } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
