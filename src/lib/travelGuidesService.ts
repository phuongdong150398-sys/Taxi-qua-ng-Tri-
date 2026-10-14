import fs from "fs";
import path from "path";
import os from "os";
import { TravelGuide, travelGuides as initialTravelGuides } from "@/data/travelGuides";
import {
  getTravelGuidesFromDb,
  saveTravelGuideToDb,
  deleteTravelGuideFromDb,
  getTravelGuideBySlugFromDb,
} from "./firebaseDb";
import { isReliableImageUrl, getVerifiedImageForTopic } from "./verifiedImages";
import { sanitizeGuideText, sanitizeDataForFirestore, upgradeToHttps } from "./textSanitizer";

const DATA_DIR = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), "data");
const GUIDES_FILE = path.join(DATA_DIR, "travel_guides.json");

let inMemoryGuides: TravelGuide[] | null = null;

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(GUIDES_FILE)) {
      fs.writeFileSync(GUIDES_FILE, JSON.stringify(initialTravelGuides, null, 2), "utf-8");
    }
  } catch (e) {
    console.error("Error creating travel guides file/directory:", e);
  }
}

export function sanitizeGuide(guide: TravelGuide): TravelGuide {
  if (!guide) return guide;
  
  // 1. Chuẩn hóa tiếng Việt NFC và giải mã toàn bộ HTML entities
  const textCleaned = sanitizeGuideText(guide);
  const destination = textCleaned.destination || "";
  const usedImages = new Set<string>();

  // 2. Chuẩn hóa Cover Image
  let coverImage = upgradeToHttps(textCleaned.coverImage);
  if (!isReliableImageUrl(coverImage)) {
    coverImage = upgradeToHttps(getVerifiedImageForTopic(destination, textCleaned.title, 0, usedImages));
  }
  if (coverImage) {
    usedImages.add(coverImage);
  }

  // 3. Chuẩn hóa Sections và đảm bảo không trùng lặp ảnh với nhau hoặc với ảnh bìa
  const sections = Array.isArray(textCleaned.sections)
    ? textCleaned.sections.map((sec, idx) => {
        let secImg = upgradeToHttps(sec.image);
        if (!secImg || !isReliableImageUrl(secImg) || usedImages.has(secImg)) {
          secImg = upgradeToHttps(getVerifiedImageForTopic(destination, sec.heading, idx + 1, usedImages));
        }
        if (secImg) {
          usedImages.add(secImg);
        }
        return {
          ...sec,
          image: secImg,
          imageCaption: sec.imageCaption || `Hình ảnh minh họa ${sec.heading.replace(/^[0-9.]+\s*/, "")} tại ${destination}`,
        };
      })
    : textCleaned.sections;

  // 4. Chuẩn hóa Gallery và đảm bảo không trùng lặp
  const gallery = Array.isArray(textCleaned.gallery)
    ? textCleaned.gallery.map((g, idx) => {
        let galUrl = upgradeToHttps(g.url);
        if (!galUrl || !isReliableImageUrl(galUrl) || usedImages.has(galUrl)) {
          galUrl = upgradeToHttps(getVerifiedImageForTopic(destination, g.caption || "thắng cảnh đẹp", idx + 7, usedImages));
        }
        if (galUrl) {
          usedImages.add(galUrl);
        }
        return {
          ...g,
          url: galUrl,
          caption: g.caption || `Góc nhìn đẹp về ${destination}`,
        };
      })
    : textCleaned.gallery;

  return {
    ...textCleaned,
    coverImage,
    sections,
    gallery,
  };
}

export function getAllTravelGuides(): TravelGuide[] {
  try {
    ensureDataFile();
    if (fs.existsSync(GUIDES_FILE)) {
      const data = fs.readFileSync(GUIDES_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryGuides = parsed.map(sanitizeGuide);
        return inMemoryGuides;
      }
    }
    if (inMemoryGuides && inMemoryGuides.length > 0) {
      return inMemoryGuides.map(sanitizeGuide);
    }
    inMemoryGuides = initialTravelGuides.map(sanitizeGuide);
    return inMemoryGuides;
  } catch (error) {
    console.error("Error reading travel guides file:", error);
    return (inMemoryGuides || initialTravelGuides).map(sanitizeGuide);
  }
}

export async function getAllTravelGuidesAsync(): Promise<TravelGuide[]> {
  try {
    const listFromDb = await getTravelGuidesFromDb();
    if (listFromDb && listFromDb.length > 0) {
      const sanitized = listFromDb.map(sanitizeGuide);
      inMemoryGuides = sanitized;
      ensureDataFile();
      try {
        fs.writeFileSync(GUIDES_FILE, JSON.stringify(sanitized, null, 2), "utf-8");
      } catch (e) {}
      return sanitized;
    }
  } catch (err) {
    console.error("Error getting guides from Firestore:", err);
  }
  return getAllTravelGuides();
}

export function getTravelGuideBySlugSync(slug: string): TravelGuide | undefined {
  const list = getAllTravelGuides();
  const found = list.find((g) => g.slug === slug);
  return found ? sanitizeGuide(found) : undefined;
}

export async function getTravelGuideBySlugAsync(slug: string): Promise<TravelGuide | undefined> {
  try {
    const fromDb = await getTravelGuideBySlugFromDb(slug);
    if (fromDb) {
      return sanitizeGuide(fromDb);
    }
  } catch (err) {
    console.error("Error fetching travel guide by slug from DB:", err);
  }
  return getTravelGuideBySlugSync(slug);
}

export async function saveTravelGuide(guide: TravelGuide): Promise<{ success: boolean; message?: string; data?: TravelGuide }> {
  try {
    // 1. Chuẩn hóa tiếng Việt, loại bỏ HTML entities & gán ảnh thực tế không trùng lặp
    const sanitized = sanitizeGuide(guide);

    // 2. Lưu trực tiếp lên Google Cloud Firestore
    try {
      await saveTravelGuideToDb(sanitized);
    } catch (dbErr: any) {
      console.error("[CRITICAL FIRESTORE ERROR] Could not save travel guide to Firestore:", dbErr);
      return {
        success: false,
        message: `Lỗi kết nối cơ sở dữ liệu Firestore: ${dbErr?.message || "Không thể ghi dữ liệu"}`,
      };
    }

    // 3. Cập nhật bộ nhớ đệm In-Memory
    if (inMemoryGuides) {
      const idx = inMemoryGuides.findIndex((g) => g.slug === sanitized.slug);
      if (idx >= 0) {
        inMemoryGuides[idx] = sanitized;
      } else {
        inMemoryGuides.unshift(sanitized);
      }
    }

    // 4. Lưu bản sao cục bộ vào GUIDES_FILE
    try {
      ensureDataFile();
      const list = getAllTravelGuides();
      const existingIndex = list.findIndex((g) => g.slug === sanitized.slug);
      if (existingIndex >= 0) {
        list[existingIndex] = sanitized;
      } else {
        list.unshift(sanitized);
      }
      inMemoryGuides = list;
      fs.writeFileSync(GUIDES_FILE, JSON.stringify(list, null, 2), "utf-8");
    } catch (fsErr) {
      // Bỏ qua lỗi ghi đĩa trên môi trường serverless Vercel
    }

    return { success: true, data: sanitized };
  } catch (error: any) {
    console.error("Error saving travel guide:", error);
    return { success: false, message: error?.message || "Lỗi lưu bài viết" };
  }
}

export async function deleteTravelGuide(slug: string): Promise<{ success: boolean; message?: string }> {
  try {
    // 1. Delete from Firestore
    await deleteTravelGuideFromDb(slug).catch((err) => {
      console.error("Error deleting from Firestore:", err);
    });

    // 2. Delete locally
    ensureDataFile();
    const list = getAllTravelGuides();
    const filtered = list.filter((g) => g.slug !== slug);

    inMemoryGuides = filtered;
    fs.writeFileSync(GUIDES_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting travel guide:", error);
    return { success: false, message: error?.message || "Lỗi xóa bài viết" };
  }
}

export function resetToDefaults(): { success: boolean } {
  try {
    ensureDataFile();
    inMemoryGuides = [...initialTravelGuides];
    fs.writeFileSync(GUIDES_FILE, JSON.stringify(initialTravelGuides, null, 2), "utf-8");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
