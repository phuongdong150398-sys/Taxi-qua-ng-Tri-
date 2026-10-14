import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { BookingRecord, Driver, WalletTransaction, FleetSystemSettings } from "@/types";
import { TravelGuide, travelGuides as initialTravelGuides } from "@/data/travelGuides";
import { DEFAULT_FLEET_SETTINGS } from "./drivers";
import { sanitizeDataForFirestore } from "./textSanitizer";

// ==========================================
// 1. BOOKINGS (ĐƠN ĐẶT XE)
// ==========================================
const BOOKINGS_COLLECTION = "bookings";

export async function getBookingsFromDb(): Promise<BookingRecord[]> {
  try {
    const colRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(colRef, orderBy("createdAt", "desc"), limit(200));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs.map((doc) => doc.data() as BookingRecord);
    }
    return [];
  } catch (error) {
    console.error("[FIRESTORE ERROR] getBookingsFromDb:", error);
    return [];
  }
}

export async function saveBookingToDb(booking: BookingRecord): Promise<boolean> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
    await setDoc(docRef, booking, { merge: true });
    return true;
  } catch (error) {
    console.error("[FIRESTORE ERROR] saveBookingToDb:", error);
    return false;
  }
}

export async function getBookingByIdFromDb(id: string): Promise<BookingRecord | undefined> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as BookingRecord;
    }
    return undefined;
  } catch (error) {
    console.error("[FIRESTORE ERROR] getBookingByIdFromDb:", error);
    return undefined;
  }
}

export async function updateBookingInDb(
  id: string,
  updateData: Partial<BookingRecord>
): Promise<boolean> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, id);
    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error("[FIRESTORE ERROR] updateBookingInDb:", error);
    return false;
  }
}

// ==========================================
// 2. TRAVEL GUIDES (CẨM NANG DU LỊCH SEO)
// ==========================================
const GUIDES_COLLECTION = "travel_guides";

export async function getTravelGuidesFromDb(): Promise<TravelGuide[]> {
  try {
    const colRef = collection(db, GUIDES_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      const list = snapshot.docs.map((d) => d.data() as TravelGuide);
      // Sắp xếp theo ngày mới nhất hoặc theo danh sách
      return list;
    }

    // Nếu database Firestore chưa có bài viết nào, tự động seed 6 bài viết gốc lên Firestore!
    console.log("[FIRESTORE AUTO-SEED] Seeding default travel guides to Firestore...");
    for (const guide of initialTravelGuides) {
      await setDoc(doc(db, GUIDES_COLLECTION, guide.slug), guide);
    }
    return initialTravelGuides;
  } catch (error) {
    console.error("[FIRESTORE ERROR] getTravelGuidesFromDb:", error);
    return initialTravelGuides;
  }
}

export async function getTravelGuideBySlugFromDb(slug: string): Promise<TravelGuide | undefined> {
  try {
    const docRef = doc(db, GUIDES_COLLECTION, slug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as TravelGuide;
    }
    // Fallback nếu chưa kịp seed
    return initialTravelGuides.find((g) => g.slug === slug);
  } catch (error) {
    console.error("[FIRESTORE ERROR] getTravelGuideBySlugFromDb:", error);
    return initialTravelGuides.find((g) => g.slug === slug);
  }
}

export async function saveTravelGuideToDb(guide: TravelGuide): Promise<boolean> {
  try {
    const docRef = doc(db, GUIDES_COLLECTION, guide.slug);
    const cleaned = sanitizeDataForFirestore(guide);
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.error("[FIRESTORE ERROR] saveTravelGuideToDb:", error);
    throw error;
  }
}

export async function deleteTravelGuideFromDb(slug: string): Promise<boolean> {
  try {
    const docRef = doc(db, GUIDES_COLLECTION, slug);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("[FIRESTORE ERROR] deleteTravelGuideFromDb:", error);
    return false;
  }
}

// ==========================================
// 3. DRIVER FLEET & SETTINGS (ĐỘI XE & CẤU HÌNH)
// ==========================================
const DRIVERS_COLLECTION = "drivers";
const SETTINGS_COLLECTION = "system_settings";
const TRANSACTIONS_COLLECTION = "wallet_transactions";

export async function getDriversFromDb(): Promise<Driver[]> {
  try {
    const colRef = collection(db, DRIVERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => d.data() as Driver);
    }
    return [];
  } catch (error) {
    console.error("[FIRESTORE ERROR] getDriversFromDb:", error);
    return [];
  }
}

export async function saveDriverToDb(driver: Driver): Promise<boolean> {
  try {
    const docRef = doc(db, DRIVERS_COLLECTION, driver.id);
    await setDoc(docRef, driver, { merge: true });
    return true;
  } catch (error) {
    console.error("[FIRESTORE ERROR] saveDriverToDb:", error);
    return false;
  }
}

export async function deleteDriverFromDb(driverId: string): Promise<boolean> {
  try {
    const docRef = doc(db, DRIVERS_COLLECTION, driverId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("[FIRESTORE ERROR] deleteDriverFromDb:", error);
    return false;
  }
}

export async function getFleetSettingsFromDb(): Promise<FleetSystemSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, "fleet_config");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FleetSystemSettings;
    }
    // Seed default settings
    await setDoc(docRef, DEFAULT_FLEET_SETTINGS);
    return DEFAULT_FLEET_SETTINGS;
  } catch (error) {
    console.error("[FIRESTORE ERROR] getFleetSettingsFromDb:", error);
    return DEFAULT_FLEET_SETTINGS;
  }
}

export async function saveFleetSettingsToDb(settings: FleetSystemSettings): Promise<boolean> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, "fleet_config");
    await setDoc(docRef, settings, { merge: true });
    return true;
  } catch (error) {
    console.error("[FIRESTORE ERROR] saveFleetSettingsToDb:", error);
    return false;
  }
}

export async function getWalletTransactionsFromDb(): Promise<WalletTransaction[]> {
  try {
    const colRef = collection(db, TRANSACTIONS_COLLECTION);
    const q = query(colRef, orderBy("createdAt", "desc"), limit(200));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => d.data() as WalletTransaction);
    }
    return [];
  } catch (error) {
    console.error("[FIRESTORE ERROR] getWalletTransactionsFromDb:", error);
    return [];
  }
}

export async function saveWalletTransactionToDb(tx: WalletTransaction): Promise<boolean> {
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, tx.id);
    await setDoc(docRef, tx, { merge: true });
    return true;
  } catch (error) {
    console.error("[FIRESTORE ERROR] saveWalletTransactionToDb:", error);
    return false;
  }
}
