// Simple HMAC-SHA256 signed token for admin auth
// Works in both Edge runtime (middleware) and Node.js (API routes)

function getSecret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "nitipcatip-default-secret";
}

async function getSigningKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(getSecret());
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function base64urlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  return new Uint8Array(binary.split("").map((c) => c.charCodeAt(0)));
}

export async function createAdminToken(username: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  };

  const encoder = new TextEncoder();
  const headerB64 = base64urlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
  const signatureB64 = base64urlEncode(new Uint8Array(signature));

  return `${signingInput}.${signatureB64}`;
}

export async function verifyAdminToken(token: string): Promise<{ valid: boolean; username?: string }> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };

    const [headerB64, payloadB64, signatureB64] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;

    const key = await getSigningKey();
    const encoder = new TextEncoder();
    const signature = base64urlDecode(signatureB64) as BufferSource;

    const valid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(signingInput) as BufferSource);
    if (!valid) return { valid: false };

    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }

    return { valid: true, username: payload.sub };
  } catch {
    return { valid: false };
  }
}
