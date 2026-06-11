import { NextRequest, NextResponse } from "next/server";

// Admin auth middleware - protects /admin routes (except /admin/login)
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page without auth
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_session")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Verify token using Web Crypto (edge-compatible)
    try {
      const valid = await verifyToken(token);
      if (!valid) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("expired", "1");
        const response = NextResponse.redirect(loginUrl);
        // Clear invalid cookie
        response.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
        return response;
      }
    } catch {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
      return response;
    }
  }

  return NextResponse.next();
}

// Edge-compatible token verification (duplicated from lib/auth for edge runtime)
async function verifyToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;

    const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "nitipcatip-default-secret";
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const signature = base64urlDecode(signatureB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature as BufferSource,
      encoder.encode(signingInput) as BufferSource,
    );

    if (!valid) return false;

    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

function base64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  return new Uint8Array(binary.split("").map((c) => c.charCodeAt(0)));
}

export const config = {
  matcher: ["/admin/:path*"],
};
