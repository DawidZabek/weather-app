import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Favorite } from "@/models/Favorite";

export async function GET() {
  await connectDB();
  const favorites = await Favorite.find().sort({ createdAt: -1 });
  return NextResponse.json(favorites, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || !body.city || body.lat === undefined || body.lon === undefined) {
    return NextResponse.json(
      { message: "Wrong data. Expected: city, lat, lon" },
      { status: 400 }
    );
  }

  await connectDB();

  const exists = await Favorite.findOne({
    city: body.city,
    lat: body.lat,
    lon: body.lon,
  });

  if (exists) {
    return NextResponse.json(
      { message: "City i" },
      { status: 409 }
    );
  }

  const favorite = await Favorite.create({
    city: body.city,
    lat: body.lat,
    lon: body.lon,
  });

  return NextResponse.json(favorite, { status: 201 });
}
