/**
 * BỘ TIỆN ÍCH CHUẨN HÓA TIẾNG VIỆT & XỬ LÝ LỖI FONT / ENTITY HTML
 * 
 * Khắc phục triệt để:
 * 1. Lỗi font / vỡ font do thực thể HTML: &#x27;, &#39;, &quot;, &amp;, &ldquo;, &rdquo;, &lsquo;, &rsquo;...
 * 2. Lỗi hiển thị thẻ thô <br/>, <b>, <strong>... ra màn hình
 * 3. Lỗi nhảy font tiếng Việt do mã Unicode NFD (Combining Diacritical Marks) -> Chuẩn hóa về NFC
 * 4. Tự động nâng cấp URL hình ảnh sang HTTPS an toàn
 * 5. Chuyển đổi dữ liệu chuẩn cho Google Firestore (loại bỏ giá trị undefined gây lỗi setDoc)
 */

import { TravelGuide } from "@/data/travelGuides";

/**
 * Tự động nâng cấp liên kết HTTP sang HTTPS để tránh bị trình duyệt chặn Mixed Content
 */
export function upgradeToHttps(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") &&
    !trimmed.includes("localhost") &&
    !trimmed.includes("127.0.0.1")
  ) {
    return trimmed.replace(/^http:\/\//i, "https://");
  }
  return trimmed;
}

/**
 * Giải mã các thực thể HTML, chuyển <br/> thành ký tự xuống dòng và chuẩn hóa chuỗi Unicode sang NFC tiếng Việt chuẩn
 */
export function cleanVietnameseText(str: string | undefined | null): string {
  if (!str || typeof str !== "string") return "";

  let decoded = str
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
    .replace(/&reg;/gi, "®")
    // Thẻ xuống dòng HTML -> chuyển về \n chuẩn văn bản
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<p>/gi, "")
    .replace(/<\/p>/gi, "\n");

  // Giới hạn tối đa 2 dấu xuống dòng liên tiếp
  decoded = decoded.replace(/\n{3,}/g, "\n\n");

  // Chuẩn hóa Unicode Canonical Composition (NFC) chuẩn tiếng Việt
  try {
    return decoded.normalize("NFC");
  } catch {
    return decoded;
  }
}

/**
 * Loại bỏ hoàn toàn các thẻ HTML để dùng cho tiêu đề, mô tả ngắn, meta tag
 */
export function stripHtmlTags(str: string | undefined | null): string {
  if (!str || typeof str !== "string") return "";
  return cleanVietnameseText(str)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Chuẩn hóa toàn bộ văn bản và đường dẫn ảnh của bài viết TravelGuide
 */
export function sanitizeGuideText(guide: TravelGuide): TravelGuide {
  if (!guide) return guide;

  return {
    ...guide,
    title: stripHtmlTags(guide.title),
    metaTitle: stripHtmlTags(guide.metaTitle || guide.title),
    metaDescription: stripHtmlTags(guide.metaDescription || guide.excerpt),
    excerpt: stripHtmlTags(guide.excerpt),
    category: stripHtmlTags(guide.category),
    destination: stripHtmlTags(guide.destination),
    coverImage: upgradeToHttps(guide.coverImage),
    author: stripHtmlTags(guide.author || "Ban Biên Tập Taxi Quảng Trị - Quảng Bình 24H"),
    readTime: stripHtmlTags(guide.readTime || "8 phút đọc"),
    distanceFromDongHoi: stripHtmlTags(guide.distanceFromDongHoi),
    taxiFare4Seats: stripHtmlTags(guide.taxiFare4Seats),
    taxiFare6Seats: stripHtmlTags(guide.taxiFare6Seats),
    ticketPrice: stripHtmlTags(guide.ticketPrice),
    bestTimeToVisit: stripHtmlTags(guide.bestTimeToVisit),
    highlights: Array.isArray(guide.highlights)
      ? guide.highlights.map(stripHtmlTags).filter(Boolean)
      : [],
    sections: Array.isArray(guide.sections)
      ? guide.sections.map((sec) => ({
          ...sec,
          heading: stripHtmlTags(sec.heading),
          content: cleanVietnameseText(sec.content),
          image: upgradeToHttps(sec.image),
          imageCaption: sec.imageCaption ? stripHtmlTags(sec.imageCaption) : undefined,
          tips: Array.isArray(sec.tips) ? sec.tips.map(stripHtmlTags).filter(Boolean) : undefined,
        }))
      : [],
    gallery: Array.isArray(guide.gallery)
      ? guide.gallery.map((g) => ({
          ...g,
          url: upgradeToHttps(g.url),
          caption: stripHtmlTags(g.caption),
        }))
      : [],
    faqs: Array.isArray(guide.faqs)
      ? guide.faqs.map((f) => ({
          question: stripHtmlTags(f.question),
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
