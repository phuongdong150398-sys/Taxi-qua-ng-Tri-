/**
 * Taxi Quảng Trị - Driver Fleet & Wallet Management Module
 * Quản lý đội ngũ tài xế, Ví cọc tạm ứng, Lịch sử giao dịch và Cấu hình chiết khấu
 */

import { Driver, WalletTransaction, FleetSystemSettings, BookingRecord, CarType } from "@/types";
import fs from "fs";
import path from "path";
import os from "os";

const DATA_DIR = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), "data");
const DRIVERS_FILE = path.join(DATA_DIR, "drivers.json");
const TRANSACTIONS_FILE = path.join(DATA_DIR, "wallet_transactions.json");
const SETTINGS_FILE = path.join(DATA_DIR, "fleet_settings.json");
const SESSIONS_FILE = path.join(DATA_DIR, "driver_reg_sessions.json");

// Default Fleet Settings
export const DEFAULT_FLEET_SETTINGS: FleetSystemSettings = {
  commissionRate: 0.15, // 15% chiết khấu
  minWalletBalance: 50000, // Tối thiểu 50.000đ trong ví để nhận cuốc
  telegramGroupId: process.env.TELEGRAM_GROUP_ID || "",
  bankName: "MBBank",
  bankAccount: "1736668888173",
  bankAccountName: "NGUYEN PHUONG DONG",
};

// Initial Driver Fleet data
const INITIAL_DRIVERS: Driver[] = [
  {
    id: "DRV-7401",
    name: "Nguyễn Văn Hùng",
    phone: "0912345678",
    plateNumber: "74A-123.45",
    carType: "4-seats",
    region: "TP. Đông Hà & TX. Quảng Trị",
    telegramId: "1499064181", // Khớp với ID Telegram của chủ xe để test ngay
    telegramUsername: "hung_taxi74",
    walletBalance: 500000,
    status: "active",
    totalTripsCompleted: 14,
    totalEarnings: 9200000,
    totalCommissionPaid: 1380000,
    registeredAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "DRV-7402",
    name: "Trần Quốc Tuấn",
    phone: "0988765432",
    plateNumber: "74A-678.90",
    carType: "6-seats",
    region: "TP. Đông Hà & Lao Bảo",
    telegramId: "1499064182",
    telegramUsername: "tuan_xpander",
    walletBalance: 350000,
    status: "active",
    totalTripsCompleted: 8,
    totalEarnings: 6800000,
    totalCommissionPaid: 1020000,
    registeredAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "DRV-7301",
    name: "Lê Hoàng Nam",
    phone: "0905123888",
    plateNumber: "73A-111.22",
    carType: "4-seats",
    region: "TP. Đồng Hới & Sân Bay",
    telegramId: "1499064183",
    telegramUsername: "nam_donghoi",
    walletBalance: 600000,
    status: "active",
    totalTripsCompleted: 19,
    totalEarnings: 12500000,
    totalCommissionPaid: 1875000,
    registeredAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "DRV-7302",
    name: "Phạm Minh Đức",
    phone: "0977889900",
    plateNumber: "73A-333.44",
    carType: "6-seats",
    region: "Phong Nha - Bố Trạch & Thiên Đường",
    telegramId: "1499064184",
    telegramUsername: "duc_phongnha",
    walletBalance: 400000,
    status: "active",
    totalTripsCompleted: 11,
    totalEarnings: 8400000,
    totalCommissionPaid: 1260000,
    registeredAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
];

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

let inMemoryDrivers: Driver[] = [...INITIAL_DRIVERS];
let inMemoryTransactions: WalletTransaction[] = [];
let inMemorySettings: FleetSystemSettings = { ...DEFAULT_FLEET_SETTINGS };
let inMemorySessions: Record<string, DriverRegistrationSession> = {};

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {}
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
  return inMemorySettings;
}

export function getDrivers(): Driver[] {
  try {
    ensureDataDir();
    if (fs.existsSync(DRIVERS_FILE)) {
      const data = fs.readFileSync(DRIVERS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return inMemoryDrivers;
}

export function saveDrivers(drivers: Driver[]) {
  inMemoryDrivers = drivers;
  try {
    ensureDataDir();
    fs.writeFileSync(DRIVERS_FILE, JSON.stringify(drivers, null, 2), "utf-8");
  } catch (e) {}
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
        return parsed;
      }
    }
  } catch (e) {}
  return inMemoryTransactions;
}

export function saveWalletTransactions(transactions: WalletTransaction[]) {
  inMemoryTransactions = transactions.slice(0, 500); // Lưu 500 giao dịch gần nhất
  try {
    ensureDataDir();
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(inMemoryTransactions, null, 2), "utf-8");
  } catch (e) {}
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
 * Đăng ký tài xế mới trực tiếp từ Telegram
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
    region: params.region || "Quảng Trị - Quảng Bình",
    telegramId: String(params.telegramId).trim(),
    telegramUsername: params.telegramUsername ? params.telegramUsername.replace("@", "").trim() : undefined,
    walletBalance: 0, // Bắt đầu từ 0đ và hướng dẫn nạp cọc
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
