export type CarType = "4-seats" | "6-seats" | "16-seats" | "32-seats" | "vip-limousine";

export type TripType = "one-way" | "round-trip";

export type ServiceType = "airport" | "provincial" | "city" | "convenient" | "tour";

export interface BookingFormInput {
  fullName: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  carType: CarType;
  tripType: TripType;
  serviceType: ServiceType;
  notes?: string;
  estimatedPrice?: string;
  // Security & Anti-spam honeypot / timestamps
  hp_website?: string;
  submitTimestamp?: number;
}

export interface BookingRecord extends BookingFormInput {
  id: string;
  createdAt: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  estimatedPrice?: string;
  // Điều phối tài xế & Chiết khấu
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPlate?: string;
  driverTelegramId?: string;
  grossFare?: number; // Tổng cước khách trả (VD: 600000)
  commissionRate?: number; // Tỷ lệ chiết khấu (VD: 0.15 = 15%)
  commissionAmount?: number; // Tiền chiết khấu trừ ví (VD: 90000)
  driverNetEarning?: number; // Tiền tài xế thực nhận (VD: 510000)
  claimedAt?: string;
  onWayAt?: string;
  pickedUpAt?: string;
  completedAt?: string;
  groupMessageId?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  plateNumber: string;
  carType: CarType;
  region: string;
  telegramId: string;
  telegramUsername?: string;
  walletBalance: number; // Số dư ví cọc tạm ứng (VNĐ)
  status: "active" | "pending_approval" | "suspended";
  totalTripsCompleted: number;
  totalEarnings: number;
  totalCommissionPaid: number;
  registeredAt: string;
}

export interface WalletTransaction {
  id: string;
  driverId: string;
  driverName: string;
  type: "deposit" | "deduction" | "refund" | "adjustment";
  amount: number; // Dương nếu nạp tiền, Âm nếu trừ phí cuốc
  balanceAfter: number;
  bookingId?: string;
  description: string;
  createdAt: string;
}

export interface FleetSystemSettings {
  commissionRate: number; // Mặc định 0.15 (15%)
  minWalletBalance: number; // Số dư tối thiểu để được nhận cuốc (Mặc định 50.000đ)
  telegramGroupId?: string; // ID nhóm Telegram đội xe (VD: -100xxxxxxxxxx)
  bankName: string; // Tên ngân hàng nhận cọc (VD: MBBank, Vietcombank)
  bankAccount: string; // Số tài khoản nhận cọc
  bankAccountName: string; // Tên chủ tài khoản
}
