/**
 * Taxi Quảng Trị - Driver Fleet & Wallet Management Module
 * Quản lý đội ngũ tài xế THỰC TẾ, Ví cọc tạm ứng, Lịch sử giao dịch và Cấu hình chiết khấu
 * Tích hợp Telegram Cloud Storage Sync Bridge để lưu trữ vĩnh viễn và đồng bộ thời gian thực
 */

import { Driver, WalletTransaction, FleetSystemSettings, BookingRecord, CarType } from "@/types";
import {
  getDriversFromDb,
  saveDriverToDb,
  getFleetSettingsFromDb,
  saveFleetSettingsToDb,
  getWalletTransactionsFromDb,
  saveWalletTransactionToDb,
} from "./firebaseDb";
import fs from "fs";
import path from "path";
import os from "os";

const DATA_DIR = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), "data");
const DRIVERS_FILE = path.join(DATA_DIR, "drivers.json");
const TRANSACTIONS_FILE = path.join(DATA_DIR, "wallet_transactions.json");
const SETTINGS_FILE = path.join(DATA_DIR, "fleet_settings.json");
const SESSIONS_FILE = path.join(DATA_DIR, "driver_reg_sessions.json");

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
  "8888405865:AAG0tj-prAYFngu4qlcRYBtF2T_13xHZQo4";

const OWNER_CHAT_ID =
  process.env.TELEGRAM_CHAT_ID ||
  process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ||
  "1499064181";

// Mock IDs to purge
const MOCK_DRIVER_IDS = new Set(["DRV-7401", "DRV-7402", "DRV-7301", "DRV-7302"]);

// Default Fleet Settings
export const DEFAULT_FLEET_SETTINGS: FleetSystemSettings = {
  commissionRate: 0.15, // 15% chiết khấu
  minWalletBalance: 50000, // Tối thiểu 50.000đ trong ví để nhận cuốc
  telegramGroupId: process.env.TELEGRAM_GROUP_ID || "",
  bankName: "MBBank",
  bankAccount: "1736668888173",
  bankAccountName: "NGUYEN PHUONG DONG",
};

// Initial Driver Fleet data (Empty - Only Real Drivers!)
const INITIAL_DRIVERS: Driver[] = [];

export interface DriverRegistrationSession {
  telegramId: string;
  step: "name" | "phone" | "plate" | "cartype" | "completed";
  name?: string;
  phone?: string;
  plateNumber?: string;
  carType?: CarType;
  region?: string;
  telegramUsername?: string;
  updatedAt: number;
}

let inMemoryDrivers: Driver[] = [];
let inMemoryTransactions: WalletTransaction[] = [];
let inMemorySettings: FleetSystemSettings = { ...DEFAULT_FLEET_SETTINGS };
let inMemorySessions: Record<string, DriverRegistrationSession> = {};

let lastCloudFetchTime = 0;
let cachedStateMessageId: number | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {}
}

function cleanRealDrivers(drivers: Driver[]): Driver[] {
  if (!Array.isArray(drivers)) return [];
  return drivers.filter((d) => d && d.id && !MOCK_DRIVER_IDS.has(d.id));
}

/**
 * Tải dữ liệu Đội Xe & Số Dư từ Google Cloud Firestore về bộ nhớ
 */
export async function loadFleetStateFromTelegramCloud(): Promise<boolean> {
  // Tránh gọi API dồn dập nếu vừa fetch trong vòng 2 giây
  if (Date.now() - lastCloudFetchTime < 2000 && inMemoryDrivers.length > 0) {
    return true;
  }

  // 1. Tải trực tiếp từ Google Firestore
  try {
    const firestoreDrivers = await getDriversFromDb();
    if (firestoreDrivers && firestoreDrivers.length > 0) {
      inMemoryDrivers = cleanRealDrivers(firestoreDrivers);
      const dbSettings = await getFleetSettingsFromDb();
      if (dbSettings) inMemorySettings = { ...DEFAULT_FLEET_SETTINGS, ...dbSettings };
      const dbTxs = await getWalletTransactionsFromDb();
      if (dbTxs) inMemoryTransactions = dbTxs;
      lastCloudFetchTime = Date.now();
      return true;
    }
  } catch (e) {
    console.error("Error loading fleet from Firestore:", e);
  }

  // 2. Fallback tải từ file cục bộ
  try {
    ensureDataDir();
    if (fs.existsSync(DRIVERS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DRIVERS_FILE, "utf-8"));
      if (Array.isArray(parsed)) inMemoryDrivers = cleanRealDrivers(parsed);
    }
    if (fs.existsSync(SETTINGS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
      inMemorySettings = { ...DEFAULT_FLEET_SETTINGS, ...parsed };
    }
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, "utf-8"));
      if (Array.isArray(parsed)) inMemoryTransactions = parsed;
    }
  } catch (e) {}

  return true;
}

/**
 * Đồng bộ toàn bộ dữ liệu Đội Xe & Ví Cọc lên Google Firestore & Bộ nhớ cục bộ
 * ĐÃ TẮT HOÀN TOÀN VIỆC GỬI TIN NHẮN THÔ #FLEET_STATE# VÀO TELEGRAM
 */
export async function syncFleetStateToTelegramCloud(): Promise<boolean> {
  try {
    inMemoryDrivers = cleanRealDrivers(inMemoryDrivers);

    // 1. Đồng bộ vĩnh viễn lên Google Firestore
    try {
      await saveFleetSettingsToDb(inMemorySettings);
      for (const d of inMemoryDrivers) {
        await saveDriverToDb(d);
      }
      for (const t of inMemoryTransactions.slice(0, 50)) {
        await saveWalletTransactionToDb(t);
      }
    } catch (dbErr) {
      console.error("Error syncing to Firestore:", dbErr);
    }

    // 2. Lưu bản sao dự phòng vào /tmp
    ensureDataDir();
    try {
      fs.writeFileSync(DRIVERS_FILE, JSON.stringify(inMemoryDrivers, null, 2), "utf-8");
      fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(inMemoryTransactions, null, 2), "utf-8");
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(inMemorySettings, null, 2), "utf-8");
    } catch (e) {}

    return true;
  } catch (err) {
    console.error("Error syncing fleet state to Firestore:", err);
    return false;
  }
}

export function getFleetSettings(): FleetSystemSettings {
  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return { ...DEFAULT_FLEET_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {}
  return inMemorySettings;
}

export function saveFleetSettings(settings: Partial<FleetSystemSettings>): FleetSystemSettings {
  inMemorySettings = { ...getFleetSettings(), ...settings };
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(inMemorySettings, null, 2), "utf-8");
  } catch (e) {}

  // Đồng bộ Telegram Cloud
  syncFleetStateToTelegramCloud().catch(() => {});
  return inMemorySettings;
}

export function getDrivers(): Driver[] {
  try {
    ensureDataDir();
    if (fs.existsSync(DRIVERS_FILE)) {
      const data = fs.readFileSync(DRIVERS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        inMemoryDrivers = cleanRealDrivers(parsed);
        return inMemoryDrivers;
      }
    }
  } catch (e) {}
  inMemoryDrivers = cleanRealDrivers(inMemoryDrivers);
  return inMemoryDrivers;
}

export function saveDrivers(drivers: Driver[]) {
  inMemoryDrivers = cleanRealDrivers(drivers);
  try {
    ensureDataDir();
    fs.writeFileSync(DRIVERS_FILE, JSON.stringify(inMemoryDrivers, null, 2), "utf-8");
  } catch (e) {}

  // Đồng bộ Telegram Cloud
  syncFleetStateToTelegramCloud().catch(() => {});
}

export function deleteDriver(id: string): boolean {
  const drivers = getDrivers();
  const filtered = drivers.filter((d) => d.id !== id);
  if (filtered.length !== drivers.length) {
    saveDrivers(filtered);
    return true;
  }
  return false;
}

export function getDriverByTelegramId(telegramId: string): Driver | undefined {
  const drivers = getDrivers();
  return drivers.find((d) => String(d.telegramId).trim() === String(telegramId).trim());
}

export function getDriverById(id: string): Driver | undefined {
  const drivers = getDrivers();
  return drivers.find((d) => d.id === id);
}

export function getWalletTransactions(): WalletTransaction[] {
  try {
    ensureDataDir();
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      const data = fs.readFileSync(TRANSACTIONS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        inMemoryTransactions = parsed.filter((t) => t && t.driverId && !MOCK_DRIVER_IDS.has(t.driverId));
        return inMemoryTransactions;
      }
    }
  } catch (e) {}
  return inMemoryTransactions;
}

export function saveWalletTransactions(transactions: WalletTransaction[]) {
  inMemoryTransactions = transactions.slice(0, 500);
  try {
    ensureDataDir();
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(inMemoryTransactions, null, 2), "utf-8");
  } catch (e) {}

  // Đồng bộ Telegram Cloud
  syncFleetStateToTelegramCloud().catch(() => {});
}

/**
 * Quản lý phiên đăng ký tài xế trên Telegram
 */
export function getRegistrationSession(telegramId: string): DriverRegistrationSession | null {
  try {
    if (inMemorySessions[telegramId]) {
      return inMemorySessions[telegramId];
    }
    ensureDataDir();
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf-8"));
      return data[telegramId] || null;
    }
  } catch (e) {}
  return inMemorySessions[telegramId] || null;
}

export function setRegistrationSession(session: DriverRegistrationSession) {
  inMemorySessions[session.telegramId] = session;
  try {
    ensureDataDir();
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(inMemorySessions, null, 2), "utf-8");
  } catch (e) {}
}

export function clearRegistrationSession(telegramId: string) {
  delete inMemorySessions[telegramId];
  try {
    ensureDataDir();
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(inMemorySessions, null, 2), "utf-8");
  } catch (e) {}
}

/**
 * Đăng ký tài xế mới trực tiếp từ Telegram & Đồng bộ ngay lên Telegram Cloud
 */
export function registerDriverFromTelegram(params: {
  name: string;
  phone: string;
  plateNumber: string;
  carType: CarType;
  region?: string;
  telegramId: string;
  telegramUsername?: string;
}): Driver {
  const drivers = getDrivers();
  
  // Kiểm tra nếu đã tồn tại thì cập nhật
  const existingIndex = drivers.findIndex((d) => String(d.telegramId) === String(params.telegramId));
  if (existingIndex !== -1) {
    const d = drivers[existingIndex];
    d.name = params.name;
    d.phone = params.phone;
    d.plateNumber = params.plateNumber.toUpperCase();
    d.carType = params.carType;
    d.telegramUsername = params.telegramUsername || d.telegramUsername;
    drivers[existingIndex] = d;
    saveDrivers(drivers);
    return d;
  }

  const newDriver: Driver = {
    id: `DRV-${Date.now().toString().slice(-4)}`,
    name: params.name.trim(),
    phone: params.phone.trim(),
    plateNumber: params.plateNumber.trim().toUpperCase(),
    carType: params.carType,
    region: params.region || "Quảng Trị & Lân Cận",
    telegramId: String(params.telegramId).trim(),
    telegramUsername: params.telegramUsername ? params.telegramUsername.replace("@", "").trim() : undefined,
    walletBalance: 0,
    status: "active",
    totalTripsCompleted: 0,
    totalEarnings: 0,
    totalCommissionPaid: 0,
    registeredAt: new Date().toISOString(),
  };

  drivers.unshift(newDriver);
  saveDrivers(drivers);
  return newDriver;
}

/**
 * Điều chỉnh số dư ví cọc của tài xế & Tạo lịch sử giao dịch
 */
export function adjustDriverWallet(
  driverId: string,
  amount: number,
  type: WalletTransaction["type"],
  description: string,
  bookingId?: string
): { success: boolean; message: string; balanceAfter?: number; transaction?: WalletTransaction } {
  const drivers = getDrivers();
  const index = drivers.findIndex((d) => d.id === driverId);

  if (index === -1) {
    return { success: false, message: "Không tìm thấy tài xế trong hệ thống!" };
  }

  const driver = drivers[index];
  const balanceBefore = driver.walletBalance;
  const balanceAfter = balanceBefore + amount;

  // Cập nhật số dư
  driver.walletBalance = balanceAfter;
  if (type === "deduction") {
    driver.totalCommissionPaid = (driver.totalCommissionPaid || 0) + Math.abs(amount);
    driver.totalTripsCompleted = (driver.totalTripsCompleted || 0) + 1;
  }

  drivers[index] = driver;
  saveDrivers(drivers);

  // Tạo bản ghi giao dịch
  const transaction: WalletTransaction = {
    id: `TXN-${Date.now().toString().slice(-6)}`,
    driverId,
    driverName: driver.name,
    type,
    amount,
    balanceAfter,
    bookingId,
    description,
    createdAt: new Date().toISOString(),
  };

  const transactions = getWalletTransactions();
  transactions.unshift(transaction);
  saveWalletTransactions(transactions);

  return {
    success: true,
    message: "Điều chỉnh số dư ví thành công!",
    balanceAfter,
    transaction,
  };
}

/**
 * Kiểm tra tài xế có đủ điều kiện nhận cuốc hay không
 */
export function validateDriverForBooking(
  driver: Driver,
  booking: BookingRecord
): { allowed: boolean; reason?: string } {
  if (driver.status !== "active") {
    return { allowed: false, reason: "Tài khoản tài xế của bạn đang bị khóa hoặc chưa được kích hoạt!" };
  }

  // Kiểm tra loại xe tương thích
  if (booking.carType === "6-seats" && driver.carType === "4-seats") {
    return { allowed: false, reason: "Cuốc xe này yêu cầu Xe 6-7 Chỗ, xe của bạn là 4 chỗ không đủ chỗ!" };
  }
  if ((booking.carType === "16-seats" || booking.carType === "32-seats" || booking.carType === "vip-limousine") && driver.carType !== booking.carType) {
    return { allowed: false, reason: `Cuốc xe này yêu cầu dòng xe ${booking.carType}, không phù hợp với xe của bạn!` };
  }

  // Tính số tiền chiết khấu cần trừ ví
  const commissionAmount = booking.commissionAmount || Math.round((booking.grossFare || 500000) * 0.15);

  // Kiểm tra số dư ví cọc
  if (driver.walletBalance < commissionAmount) {
    return {
      allowed: false,
      reason: `Số dư ví của bạn còn ${driver.walletBalance.toLocaleString("vi-VN")}đ, không đủ để trừ phí chiết khấu 15% (${commissionAmount.toLocaleString("vi-VN")}đ). Vui lòng nạp thêm tiền cọc vào ví để tiếp tục nhận cuốc!`,
    };
  }

  return { allowed: true };
}

/**
 * Tạo link VietQR nhanh cho tài xế nạp tiền cọc
 */
export function generateDepositVietQRUrl(driver: Driver, amount = 500000): string {
  const settings = getFleetSettings();
  const bank = settings.bankName || "MBBank";
  const acc = settings.bankAccount || "1736668888173";
  const accountName = settings.bankAccountName || "NGUYEN PHUONG DONG";
  const desc = encodeURIComponent(`NAP VI ${driver.phone} ${driver.name}`);
  return `https://img.vietqr.io/image/${bank}-${acc}-compact2.png?amount=${amount}&addInfo=${desc}&accountName=${encodeURIComponent(accountName)}`;
}
