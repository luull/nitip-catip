import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, verifyAdminToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    if (!adminPassword) {
      return NextResponse.json(
        { success: false, error: "Admin password belum dikonfigurasi. Silakan set ADMIN_PASSWORD di environment." },
        { status: 503 },
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: "Username atau password salah" },
        { status: 401 },
      );
    }

    // Create signed token
    const token = await createAdminToken(username);

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 },
    );
  }
}

// Logout endpoint
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}

// Verify session endpoint (for client-side checks)
export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const result = await verifyAdminToken(token);
  if (!result.valid) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, username: result.username });
}
