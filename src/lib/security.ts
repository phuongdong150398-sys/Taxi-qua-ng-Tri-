/**
 * Taxi Quảng Trị - Security & Anti-Spam Protection Module
 * Bảo vệ hệ thống chống spam bot, rate limit, kiểm tra số điện thoại và lọc dữ liệu độc hại
 */

interface RateLimitRecord {
  count: number;
  firstRequestTime: number;
  lastRequestTime: number;
}

// In-memory rate limiting store (Key: IP or Phone)
const ipRateLimitStore = new Map<string, RateLimitRecord>();
const phoneCooldownStore = new Map<string, number>();

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  const TEN_MINUTES = 10 * 60 * 1000;
  for (const [ip, record] of ipRateLimitStore.entries()) {
    if (now - record.lastRequestTime > TEN_MINUTES) {
      ipRateLimitStore.delete(ip);
    }
  }
  for (const [phone, lastTime] of phoneCooldownStore.entries()) {
    if (now - lastTime > TEN_MINUTES) {
      phoneCooldownStore.delete(phone);
    }
  }
}, 5 * 60 * 1000);

/**
 * Kiểm tra Rate Limit theo IP (Tối đa 5 lượt đặt xe / 10 phút trên 1 IP)
 */
export function checkIpRateLimit(
  ip: string,
  maxRequests = 5,
  windowMs = 10 * 60 * 1000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const record = ipRateLimitStore.get(ip);

  if (!record) {
    ipRateLimitStore.set(ip, {
      count: 1,
      firstRequestTime: now,
      lastRequestTime: now,
    });
    return { allowed: true, remaining: maxRequests - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  // Nếu đã qua khoảng thời gian window thì reset
  if (now - record.firstRequestTime > windowMs) {
    record.count = 1;
    record.firstRequestTime = now;
    record.lastRequestTime = now;
    return { allowed: true, remaining: maxRequests - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  // Đang trong window
  record.lastRequestTime = now;
  if (record.count >= maxRequests) {
    const resetInSeconds = Math.ceil((record.firstRequestTime + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds: Math.max(1, resetInSeconds) };
  }

  record.count += 1;
  const resetInSeconds = Math.ceil((record.firstRequestTime + windowMs - now) / 1000);
  return { allowed: true, remaining: maxRequests - record.count, resetInSeconds };
}

/**
 * Kiểm tra Cooldown theo Số Điện Thoại (Tối thiểu 40 giây giữa 2 lần đặt từ cùng 1 SĐT)
 */
export function checkPhoneCooldown(
  phone: string,
  cooldownMs = 40 * 1000
): { allowed: boolean; waitSeconds: number } {
  const clean = phone.replace(/\D/g, "");
  if (!clean) return { allowed: true, waitSeconds: 0 };

  const now = Date.now();
  const lastTime = phoneCooldownStore.get(clean);

  if (lastTime && now - lastTime < cooldownMs) {
    const waitSeconds = Math.ceil((cooldownMs - (now - lastTime)) / 1000);
    return { allowed: false, waitSeconds: Math.max(1, waitSeconds) };
  }

  phoneCooldownStore.set(clean, now);
  return { allowed: true, waitSeconds: 0 };
}

/**
 * Kiểm tra định dạng số điện thoại Việt Nam hợp lệ & loại trừ số rác/spam
 */
export function isValidVietnamesePhone(phone: string): { valid: boolean; reason?: string } {
  if (!phone || typeof phone !== "string") {
    return { valid: false, reason: "Số điện thoại không được để trống" };
  }

  // Loại bỏ khoảng trắng, dấu chấm, dấu gạch nối
  const clean = phone.replace(/[\s\.\-\(\)]/g, "");

  // Định dạng: 10 chữ số (bắt đầu 03, 05, 07, 08, 09) hoặc 11-12 ký tự có +84
  const vnPhoneRegex = /^(0|\+84)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
  if (!vnPhoneRegex.test(clean)) {
    return { valid: false, reason: "Số điện thoại không đúng định dạng di động Việt Nam (03x, 05x, 07x, 08x, 09x)" };
  }

  // Lấy 10 số thuần
  const digits = clean.startsWith("+84") ? "0" + clean.slice(3) : clean;

  // Chặn các dãy số rác lặp vô nghĩa (vd: 0000000000, 0999999999, 0888888888, 0123456789)
  const allSameDigits = /^(\d)\1{9}$/.test(digits);
  if (allSameDigits) {
    return { valid: false, reason: "Số điện thoại không hợp lệ (chứa chuỗi số trùng lặp)" };
  }

  const junkNumbers = [
    "0123456789",
    "0987654321",
    "0900000000",
    "0911111111",
    "0922222222",
    "0933333333",
    "0944444444",
    "0955555555",
    "0966666666",
    "0977777777",
    "0988888888",
    "0999999999",
    "0888888888",
    "0777777777",
    "0333333333",
    "0555555555",
  ];
  if (junkNumbers.includes(digits)) {
    return { valid: false, reason: "Số điện thoại thử nghiệm/không có thực" };
  }

  return { valid: true };
}

/**
 * Kiểm tra các từ khóa spam (cờ bạc, quảng cáo rác, mã độc)
 */
export function containsSpamContent(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  
  const spamKeywords = [
    "casino", "bet88", "kubet", "thabet", "fun88", "w88", "sbobet", "jun88", "789bet", "hi88",
    "shbet", "fb88", "kèo bóng", "soi kèo", "lô đề", "tài xỉu", "hack", "viagra", "crypto",
    "bitcoin", "usdt", "vay tiền", "tín dụng đen", "bán acc", "tăng follow",
    "<script", "javascript:", "onload=", "onerror=", "document.cookie", "union select"
  ];

  return spamKeywords.some((keyword) => lower.includes(keyword));
}

/**
 * Làm sạch văn bản, cắt ngắn độ dài và loại bỏ ký tự nguy hiểm
 */
export function sanitizeInput(text: string, maxLength = 250): string {
  if (!text) return "";
  let clean = text
    .replace(/<[^>]*>?/gm, "") // Loại bỏ thẻ HTML
    .replace(/[^\p{L}\p{N}\s.,_\-/:()#+]/gu, "") // Giữ lại chữ tiếng Việt có dấu, số và dấu câu thông dụng
    .trim();

  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }
  return clean;
}
