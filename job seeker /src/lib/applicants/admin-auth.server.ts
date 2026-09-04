import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "meridian_admin";
const WEEK_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "meridian-admin-dev-secret";
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "meridian-admin";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function createAdminCookie(requestUrl: string) {
  const exp = Math.floor(Date.now() / 1000) + WEEK_SECONDS;
  const payload = `admin.${exp}`;
  const value = `${payload}.${sign(payload)}`;
  const secure = requestUrl.startsWith("https:");
  const parts = [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${WEEK_SECONDS}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearAdminCookie(requestUrl: string) {
  const secure = requestUrl.startsWith("https:");
  const parts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";
  const parts = header.split(";").map((part) => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) return part.slice(name.length + 1);
  }
  return null;
}

export function isAdminAuthenticated(request: Request) {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return false;
  const segments = token.split(".");
  if (segments.length !== 3) return false;
  const [role, expRaw, signature] = segments;
  if (role !== "admin" || !expRaw || !signature) return false;
  const payload = `${role}.${expRaw}`;
  if (!safeEqual(signature, sign(payload))) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  return true;
}

export function passwordsMatch(provided: string) {
  const expected = getAdminPassword();
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    // Still compare to keep timing flatter on length mismatch
    createHmac("sha256", secret()).update(provided).digest();
    return false;
  }
  return timingSafeEqual(left, right);
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
