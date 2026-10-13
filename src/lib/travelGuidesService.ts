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
  const destination = guide.destination || "";
  let coverImage = guide.coverImage;
  if (!isReliableImageUrl(coverImage)) {
    coverImage = getVerifiedImageForTopic(destination, guide.title, 0);
  }

  const sections = Array.isArray(guide.sections)
    ? guide.sections.map((sec, idx) => ({
        ...sec,
        image: isReliableImageUrl(sec.image)
          ? sec.image
          : getVerifiedImageForTopic(destination, sec.heading, idx),
      }))
    : guide.sections;

  const gallery = Array.isArray(guide.gallery)
    ? guide.gallery.map((g, idx) => ({
        ...g,
        url: isReliableImageUrl(g.url)
          ? g.url
          : getVerifiedImageForTopic(destination, g.caption, idx),
      }))
    : guide.gallery;

  return {
    ...guide,
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

export async function saveTravelGuide(guide: TravelGuide): Promise<{ success: boolean; message?: string }> {
  try {
    // 1. Save to Google Firestore
    await saveTravelGuideToDb(guide).catch((err) => {
      console.error("Error saving guide to Firestore:", err);
    });

    // 2. Save locally
    ensureDataFile();
    const list = getAllTravelGuides();
    const existingIndex = list.findIndex((g) => g.slug === guide.slug);

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...guide,
      };
    } else {
      list.unshift(guide);
    }

    inMemoryGuides = list;
    fs.writeFileSync(GUIDES_FILE, JSON.stringify(list, null, 2), "utf-8");
    return { success: true };
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
