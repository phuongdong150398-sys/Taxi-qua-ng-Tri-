/**
 * BỘ TIỆN ÍCH CHUẨN HÓA TIẾNG VIỆT & XỬ LÝ LỖI FONT / ENTITY HTML
 * 
 * Khắc phục triệt để:
 * 1. Lỗi font / vỡ font do thực thể HTML: &#x27;, &#39;, &quot;, &amp;, &ldquo;, &rdquo;, &lsquo;, &rsquo;...
 * 2. Lỗi nhảy font tiếng Việt do mã Unicode NFD (Combining Diacritical Marks) -> Chuẩn hóa về NFC
 * 3. Chuyển đổi dữ liệu chuẩn cho Google Firestore (loại bỏ giá trị undefined gây lỗi setDoc)
 */

import { TravelGuide } from "@/data/travelGuides";

/**
 * Giải mã các thực thể HTML và chuẩn hóa chuỗi Unicode sang NFC tiếng Việt chuẩn
 */
export function cleanVietnameseText(str: string | undefined | null): string {
  if (!str || typeof str !== "string") return "";

  const decoded = str
    // Entity số hex & dec
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#x22;/gi, '"')
    .replace(/&#34;/gi, '"')
    .replace(/&#x2F;/gi, "/")
    .replace(/&#47;/gi, "/")
    .replace(/&#38;/gi, "&")
    .replace(/&#60;/gi, "<")
    .replace(/&#62;/gi, ">")
    .replace(/&#160;/gi, " ")
    .replace(/&#8211;/gi, "–")
    .replace(/&#8212;/gi, "—")
    .replace(/&#8216;/gi, "‘")
    .replace(/&#8217;/gi, "’")
    .replace(/&#8220;/gi, "“")
    .replace(/&#8221;/gi, "”")
    .replace(/&#8230;/gi, "...")
    // Entity tên thông dụng
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&rsquo;/gi, "’")
    .replace(/&ldquo;/gi, "“")
    .replace(/&rdquo;/gi, "”")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&hellip;/gi, "...")
    .replace(/&nbsp;/gi, " ")
    .replace(/&trade;/gi, "™")
    .replace(/&copy;/gi, "©")
    .replace(/&reg;/gi, "®");

  // Chuẩn hóa Unicode Canonical Composition (NFC) chuẩn tiếng Việt
  try {
    return decoded.normalize("NFC");
  } catch {
    return decoded;
  }
}

/**
 * Chuẩn hóa toàn bộ văn bản của bài viết TravelGuide
 */
export function sanitizeGuideText(guide: TravelGuide): TravelGuide {
  if (!guide) return guide;

  return {
    ...guide,
    title: cleanVietnameseText(guide.title),
    metaTitle: cleanVietnameseText(guide.metaTitle || guide.title),
    metaDescription: cleanVietnameseText(guide.metaDescription || guide.excerpt),
    excerpt: cleanVietnameseText(guide.excerpt),
    category: cleanVietnameseText(guide.category),
    destination: cleanVietnameseText(guide.destination),
    author: cleanVietnameseText(guide.author || "Ban Biên Tập Taxi Quảng Trị - Quảng Bình 24H"),
    readTime: cleanVietnameseText(guide.readTime || "8 phút đọc"),
    distanceFromDongHoi: cleanVietnameseText(guide.distanceFromDongHoi),
    taxiFare4Seats: cleanVietnameseText(guide.taxiFare4Seats),
    taxiFare6Seats: cleanVietnameseText(guide.taxiFare6Seats),
    ticketPrice: cleanVietnameseText(guide.ticketPrice),
    bestTimeToVisit: cleanVietnameseText(guide.bestTimeToVisit),
    highlights: Array.isArray(guide.highlights)
      ? guide.highlights.map(cleanVietnameseText).filter(Boolean)
      : [],
    sections: Array.isArray(guide.sections)
      ? guide.sections.map((sec) => ({
          ...sec,
          heading: cleanVietnameseText(sec.heading),
          content: cleanVietnameseText(sec.content),
          imageCaption: sec.imageCaption ? cleanVietnameseText(sec.imageCaption) : undefined,
          tips: Array.isArray(sec.tips) ? sec.tips.map(cleanVietnameseText).filter(Boolean) : undefined,
        }))
      : [],
    gallery: Array.isArray(guide.gallery)
      ? guide.gallery.map((g) => ({
          ...g,
          caption: cleanVietnameseText(g.caption),
        }))
      : [],
    faqs: Array.isArray(guide.faqs)
      ? guide.faqs.map((f) => ({
          question: cleanVietnameseText(f.question),
          answer: cleanVietnameseText(f.answer),
        }))
      : [],
  };
}

/**
 * Chuẩn hóa đối tượng trước khi gửi lên Firestore
 * Chuyển đổi mọi giá trị `undefined` thành `null` để tránh lỗi Firestore:
 * "FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeDataForFirestore<T>(data: T): T {
  if (data === undefined || data === null) {
    return null as unknown as T;
  }
  return JSON.parse(
    JSON.stringify(data, (key, value) => (value === undefined ? null : value))
  );
}
