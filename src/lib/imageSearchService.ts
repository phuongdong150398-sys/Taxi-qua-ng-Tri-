/**
 * DỊCH VỤ TÌM KIẾM HÌNH ẢNH DU LỊCH ĐẸP & CHẤT LƯỢNG CAO (GOOGLE & TRAVEL WEB)
 * Hỗ trợ:
 * 1. Google Custom Search Image API (nếu cấu hình GOOGLE_SEARCH_API_KEY và GOOGLE_SEARCH_CX)
 * 2. Tìm kiếm ảnh chất lượng cao từ các cổng du lịch lớn (VnExpress, Traveloka, Mia.vn, ivivu...)
 * 3. Kho ảnh thực tế đã kiểm chứng nội bộ (Curated Local Repository)
 */

import { CURATED_QUANG_BINH_REAL_LANDMARKS } from "./wikimediaService";

export interface TravelImageResult {
  url: string;
  thumbUrl: string;
  title: string;
  caption: string;
  source: "google" | "travel_web" | "curated";
  width?: number;
  height?: number;
}

/**
 * Tìm kiếm ảnh thông qua Google Custom Search API
 */
async function searchGoogleCustomSearch(query: string, limit: number): Promise<TravelImageResult[]> {
  const apiKey =
    process.env.GOOGLE_SEARCH_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
  const cx =
    process.env.GOOGLE_SEARCH_CX ||
    process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
    return [];
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(
      query
    )}&searchType=image&num=${Math.min(limit, 10)}&fileType=jpg,png,webp&imgSize=large&safe=active`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data = await res.json();
    const items = data.items || [];

    return items.map((item: any) => ({
      url: item.link,
      thumbUrl: item.image?.thumbnailLink || item.link,
      title: item.title || query,
      caption: item.snippet || item.title || `Hình ảnh đẹp về ${query}`,
      source: "google" as const,
      width: item.image?.width,
      height: item.image?.height,
    }));
  } catch (error) {
    console.warn("Google Custom Search API error:", error);
    return [];
  }
}

/**
 * Tìm kiếm hình ảnh trực tiếp từ Google Images thông qua Serper API
 */
async function searchSerperImages(query: string, limit: number): Promise<TravelImageResult[]> {
  const apiKey =
    process.env.SERPER_API_KEY ||
    process.env.NEXT_PUBLIC_SERPER_API_KEY;

  if (!apiKey) return [];

  try {
    const res = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        gl: "vn",
        hl: "vi",
        num: Math.min(limit, 20),
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const images = data.images || [];

    return images.map((item: any) => ({
      url: item.imageUrl,
      thumbUrl: item.thumbnailUrl || item.imageUrl,
      title: item.title || query,
      caption: item.title || `Hình ảnh du lịch đẹp về ${query}`,
      source: "google" as const,
      width: item.imageWidth,
      height: item.imageHeight,
    }));
  } catch (error) {
    console.warn("Serper Images API error:", error);
    return [];
  }
}

/**
 * Tìm kiếm ảnh du lịch chất lượng cao từ các trang báo & tạp chí du lịch Việt Nam
 */
async function searchTravelWebImages(query: string, limit: number): Promise<TravelImageResult[]> {
  try {
    // Thêm từ khóa "du lịch" hoặc "Quảng Bình" nếu chưa có để tối ưu kết quả ảnh du lịch chuyên nghiệp
    let enrichedQuery = query.trim();
    if (!/du lịch|quảng bình|đồng hới/i.test(enrichedQuery)) {
      enrichedQuery = `${enrichedQuery} du lịch Quảng Bình`;
    }

    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(enrichedQuery)}`;
    const tokenRes = await fetch(tokenUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!tokenRes.ok) return [];
    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=([\d-]+)/) || html.match(/vqd="([^"]+)"/);
    if (!vqdMatch) return [];

    const vqd = vqdMatch[1];
    const searchApiUrl = `https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(
      enrichedQuery
    )}&vqd=${vqd}&f=,,,type:photo`;

    const imgRes = await fetch(searchApiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!imgRes.ok) return [];
    const data = await imgRes.json();
    const rawResults = data.results || [];

    const results: TravelImageResult[] = [];
    const seenUrls = new Set<string>();

    for (const item of rawResults) {
      if (!item.image) continue;
      const imgUrl = item.image;

      // Lọc bỏ file gif hoặc link theo dõi pixel
      if (imgUrl.endsWith(".gif") || imgUrl.includes("pixel") || imgUrl.includes("tracker")) {
        continue;
      }

      if (!seenUrls.has(imgUrl)) {
        seenUrls.add(imgUrl);
        results.push({
          url: imgUrl,
          thumbUrl: item.thumbnail || imgUrl,
          title: item.title || query,
          caption: item.title?.replace(/<[^>]*>?/gm, "").trim() || `Hình ảnh du lịch đẹp về ${query}`,
          source: "travel_web",
          width: item.width,
          height: item.height,
        });
      }

      if (results.length >= limit) break;
    }

    return results;
  } catch (error) {
    console.warn("Travel Web Image Search error:", error);
    return [];
  }
}

/**
 * Tìm kiếm tổng hợp hình ảnh đẹp nhất cho điểm đến du lịch
 */
export async function searchTravelImages(
  query: string,
  limit: number = 16
): Promise<TravelImageResult[]> {
  const cleanQuery = (query || "").trim();
  const lower = cleanQuery.toLowerCase();
  const allResults: TravelImageResult[] = [];
  const seenUrls = new Set<string>();

  const addUnique = (item: TravelImageResult) => {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      allResults.push(item);
    }
  };

  // 1. Thử lấy từ Serper API (Google Images chính thống trực tiếp)
  const serperResults = await searchSerperImages(cleanQuery, limit);
  for (const item of serperResults) {
    addUnique(item);
  }

  // 2. Thử lấy từ Google Custom Search API nếu có cấu hình API Key & CX
  if (allResults.length < limit) {
    const googleResults = await searchGoogleCustomSearch(cleanQuery, limit - allResults.length);
    for (const item of googleResults) {
      addUnique(item);
    }
  }

  // 3. Tra cứu kho ảnh thực tế chuẩn xác của TP. Đồng Hới & Quảng Bình (Fuzzy Matching)
  for (const [key, list] of Object.entries(CURATED_QUANG_BINH_REAL_LANDMARKS)) {
    const keyWords = key.split(" ").filter((w) => w.length > 2);
    const isDirectMatch = lower.includes(key) || key.includes(lower);
    const isWordMatch = keyWords.length >= 2 && keyWords.every((w) => lower.includes(w));

    if (isDirectMatch || isWordMatch) {
      for (const item of list) {
        addUnique({
          url: item.url,
          thumbUrl: item.url,
          title: key.toUpperCase(),
          caption: item.caption,
          source: "curated",
        });
      }
    }
  }

  // 3. Tìm kiếm ảnh du lịch từ Travel Web nếu chưa đủ
  if (allResults.length < limit) {
    const webResults = await searchTravelWebImages(cleanQuery, limit - allResults.length);
    for (const item of webResults) {
      addUnique(item);
    }
  }

  // 4. Nếu vẫn chưa có kết quả (từ khóa lạ/không tìm thấy), trả về các danh lam thắng cảnh Đồng Hới nổi bật
  if (allResults.length === 0) {
    const defaultHighlights = [
      "biển nhật lệ",
      "bãi đá nhảy",
      "động phong nha",
      "cầu nhật lệ",
      "tượng đài mẹ suốt",
      "quảng bình quan",
      "đồi cát quang phú",
      "biển bảo ninh",
    ];

    for (const key of defaultHighlights) {
      const list = CURATED_QUANG_BINH_REAL_LANDMARKS[key];
      if (list && list[0]) {
        addUnique({
          url: list[0].url,
          thumbUrl: list[0].url,
          title: key.toUpperCase(),
          caption: list[0].caption,
          source: "curated",
        });
      }
      if (allResults.length >= limit) break;
    }
  }

  return allResults.slice(0, limit);
}
