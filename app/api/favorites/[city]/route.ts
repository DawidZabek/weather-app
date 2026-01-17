import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { FavoriteCity } from "@/models/FavoriteCity";

function normalizeCity(input: string) {
  return input.trim().toLowerCase();
}

function decodeParam(param: string) {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ city: string }> | { city: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams =
    context.params instanceof Promise ? await context.params : context.params;

  const rawCity = decodeParam(resolvedParams.city);
  const cityKey = normalizeCity(rawCity);

  if (!cityKey) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  await connectToDatabase();

  const result = await FavoriteCity.deleteOne({
    userId: String(userId),
    city: cityKey,
  });

  return NextResponse.json({
    ok: true,
    deletedCount: result.deletedCount,
    cityKey,
  });
}
