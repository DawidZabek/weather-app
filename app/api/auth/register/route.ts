import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body?.email ?? "").trim().toLowerCase();
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    if (!email || !username || password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Email, username and password (min 6 characters) are required",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      email,
      username,
      passwordHash,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
