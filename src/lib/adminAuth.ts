import crypto from "crypto";

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 ngày

// Secret key dùng để ký HMAC Token (Bảo mật tuyệt đối ở Server)
const ADMIN_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  "taxiquangtri_admin_secure_hmac_secret_key_9f8e7d6c5b4a3210_v2";

interface SessionPayload {
  role: "admin";
  iat: number;
  exp: number;
}

// Bộ nhớ đệm kiểm tra số lần nhập sai mã PIN (Chống Brute-force dò PIN)
interface PinAttemptRecord {
  failures: number;
  lockUntil: number;
}
const pinAttemptStore = new Map<string, PinAttemptRecord>();

/**
 * Kiểm tra xem IP có bị khóa vì nhập sai mã PIN quá nhiều lần không
 */
export function checkPinRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  lockMinutes?: number;
} {
  const now = Date.now();
  const record = pinAttemptStore.get(ip);

  if (record && record.lockUntil > now) {
    const lockMinutes = Math.ceil((record.lockUntil - now) / 60000);
    return { allowed: false, remainingAttempts: 0, lockMinutes };
  }

  const failures = record ? record.failures : 0;
  const remaining = Math.max(0, 5 - failures);
  return { allowed: true, remainingAttempts: remaining };
}

/**
 * Ghi nhận 1 lần nhập sai mã PIN (Khóa 15 phút nếu sai 5 lần)
 */
export function recordPinFailure(ip: string): {
  locked: boolean;
  lockMinutes: number;
  remainingAttempts: number;
} {
  const now = Date.now();
  const record = pinAttemptStore.get(ip) || { failures: 0, lockUntil: 0 };
  record.failures += 1;

  if (record.failures >= 5) {
    record.lockUntil = now + 15 * 60 * 1000; // Khóa 15 phút
    record.failures = 0;
    pinAttemptStore.set(ip, record);
    return { locked: true, lockMinutes: 15, remainingAttempts: 0 };
  }

  pinAttemptStore.set(ip, record);
  return { locked: false, lockMinutes: 0, remainingAttempts: 5 - record.failures };
}

/**
 * Reset số lần nhập sai khi đăng nhập thành công
 */
export function resetPinFailures(ip: string) {
  pinAttemptStore.delete(ip);
}

/**
 * Tạo Signed Session Token (HMAC SHA-256)
 */
export function createAdminToken(): string {
  const now = Date.now();
  const payload: SessionPayload = {
    role: "admin",
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(payloadStr)
    .digest("base64url");
  return `${payloadStr}.${signature}`;
}

/**
 * Xác thực tính hợp lệ của Token
 */
export function verifyAdminToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadStr, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(payloadStr)
    .digest("base64url");

  // So sánh Constant-Time chống Timing Attack
  if (
    signature.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
  ) {
    return false;
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf-8")
    );
    if (payload.role !== "admin") return false;
    if (Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Kiểm tra xem Request hiện tại có quyền Admin hợp lệ không
 */
export function getAdminSessionFromRequest(request: Request): boolean {
  // 1. Kiểm tra Authorization Header (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (verifyAdminToken(token)) return true;
  }

  // 2. Kiểm tra HttpOnly Cookie
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return false;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!sessionCookie) return false;

  const token = sessionCookie.slice(`${SESSION_COOKIE_NAME}=`.length);
  return verifyAdminToken(token);
}

/**
 * Tạo chuỗi Set-Cookie cho phiên đăng nhập an toàn
 */
export function createAdminSessionCookie(token: string): string {
  const isProd = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${
    isProd ? "; Secure" : ""
  }`;
}

/**
 * Tạo chuỗi Set-Cookie xóa phiên đăng nhập (Đăng xuất)
 */
export function createAdminLogoutCookie(): string {
  const isProd = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${
    isProd ? "; Secure" : ""
  }`;
}
