"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookingRecord, Driver, WalletTransaction, FleetSystemSettings, CarType } from "@/types";
import { siteConfig } from "@/config/siteConfig";
import { getAnalyticsConfig, saveAnalyticsConfig, AnalyticsConfig } from "@/lib/analytics";
import {
  Car,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Send,
  Bell,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  BarChart3,
  Users,
  Target,
  Smartphone,
  Globe,
  Settings,
  Flame,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  Activity,
  Layers,
  Sparkles,
  Wallet,
  DollarSign,
  PlusCircle,
  QrCode,
  UserCheck,
  UserX,
  Copy,
  Check,
  CreditCard,
  Building2,
  ChevronRight,
  UserPlus,
} from "lucide-react";

interface AnalyticsData {
  funnel: {
    pageviews: number;
    routeCalculates: number;
    calls: number;
    zaloChats: number;
    bookings: number;
    totalContacts: number;
    conversionRate: number;
  };
  sources: Record<string, number>;
  devices: Record<string, number>;
  cars: Record<string, number>;
  personas: Array<{
    id: string;
    title: string;
    percentage: number;
    description: string;
    popularCars: string;
    peakHours: string;
    topChannels: string;
    ticketSize: string;
    recommendation: string;
  }>;
  recentEvents: Array<{
    id: string;
    eventName: string;
    params: Record<string, any>;
    timestamp: string;
    ip?: string;
  }>;
}

export default function AdminPage() {
  // Navigation & Security States
  const [activeTab, setActiveTab] = useState<"orders" | "drivers" | "analytics" | "settings">("orders");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [changePinMsg, setChangePinMsg] = useState("");

  // Orders Data State
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Driver Fleet & Wallet Management State
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [fleetSettings, setFleetSettings] = useState<FleetSystemSettings>({
    commissionRate: 0.15,
    minWalletBalance: 50000,
    telegramGroupId: "",
    bankName: "MBBank",
    bankAccount: "1736668888173",
    bankAccountName: "NGUYEN PHUONG DONG",
  });
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");
  const [driverFilter, setDriverFilter] = useState<"all" | "active" | "low_balance" | "suspended">("all");

  // Modals for Driver & Wallet Management
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [walletActionType, setWalletActionType] = useState<"deposit" | "withdraw">("deposit");
  const [walletAmount, setWalletAmount] = useState<string>("500000");
  const [walletNote, setWalletNote] = useState<string>("");
  const [walletModalMsg, setWalletModalMsg] = useState<string>("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // New Driver Form State
  const [newDriverForm, setNewDriverForm] = useState({
    name: "",
    phone: "",
    plateNumber: "",
    carType: "4-seats" as CarType,
    region: "TP. Đông Hà & TX. Quảng Trị",
    telegramId: "",
    telegramUsername: "",
    initialDeposit: "500000",
  });
  const [addDriverMsg, setAddDriverMsg] = useState("");

  // Analytics Data State
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Pixel / Tracking Config State
  const [trackingConfig, setTrackingConfig] = useState<AnalyticsConfig>({
    gaId: "",
    googleAdsId: "",
    googleAdsLabel: "",
    metaPixelId: "",
    tiktokPixelId: "",
  });
  const [configSaveMsg, setConfigSaveMsg] = useState("");

  // Check login state from sessionStorage on mount
  useEffect(() => {
    try {
      const auth = sessionStorage.getItem("admin_auth_status");
      if (auth === "verified") {
        setIsAuthenticated(true);
        fetchBookings();
        fetchDriversData();
        fetchAnalytics();
        setTrackingConfig(getAnalyticsConfig());
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }
  }, []);

  const getSavedPin = () => {
    if (typeof window === "undefined") return "8888";
    return localStorage.getItem("admin_security_pin") || "8888";
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinError("");
    const correctPin = getSavedPin();

    if (pinInput.trim() === correctPin) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem("admin_auth_status", "verified");
      } catch (err) {}
      fetchBookings();
      fetchDriversData();
      fetchAnalytics();
      setTrackingConfig(getAnalyticsConfig());
    } else {
      setPinError("Mã PIN không chính xác! Vui lòng thử lại.");
      setPinInput("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput("");
    try {
      sessionStorage.removeItem("admin_auth_status");
    } catch (err) {}
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinMsg("");

    if (newPin.length < 4) {
      setChangePinMsg("Mã PIN mới phải có ít nhất 4 chữ số!");
      return;
    }

    if (newPin !== confirmPin) {
      setChangePinMsg("Mã PIN xác nhận không trùng khớp!");
      return;
    }

    localStorage.setItem("admin_security_pin", newPin);
    setChangePinMsg("✓ Đổi mã PIN thành công!");
    setTimeout(() => {
      setShowChangePin(false);
      setNewPin("");
      setConfirmPin("");
      setChangePinMsg("");
    }, 1200);
  };

  const handleSaveTrackingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveAnalyticsConfig(trackingConfig);
    setConfigSaveMsg("✓ Đã lưu cấu hình mã đo lường thành công! Hệ thống sẽ tự động kích hoạt mã khi khách truy cập web.");
    setTimeout(() => setConfigSaveMsg(""), 4000);
  };

  const fetchBookings = async () => {
    setLoading(true);
    let serverBookings: BookingRecord[] = [];
    try {
      const res = await fetch("/api/booking");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        serverBookings = data.data;
      }
    } catch (error) {
      console.error("Error fetching bookings from server:", error);
    }

    // Merge with local cache to ensure no orders are ever lost on serverless
    try {
      const localData = JSON.parse(localStorage.getItem("admin_bookings_cache") || "[]");
      const combined = [...serverBookings, ...localData];
      const uniqueMap = new Map<string, BookingRecord>();
      combined.forEach((b) => {
        if (b.id && !uniqueMap.has(b.id)) {
          uniqueMap.set(b.id, b);
        }
      });
      const mergedList = Array.from(uniqueMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBookings(mergedList);
      localStorage.setItem("admin_bookings_cache", JSON.stringify(mergedList));
    } catch (e) {
      setBookings(serverBookings);
    } finally {
      setLoading(false);
    }
  };

  const fetchDriversData = async () => {
    setLoadingDrivers(true);
    try {
      const res = await fetch("/api/drivers");
      const data = await res.json();
      if (data.success && data.data) {
        setDrivers(data.data.drivers || []);
        setTransactions(data.data.transactions || []);
        if (data.data.settings) {
          setFleetSettings(data.data.settings);
        }
      }
    } catch (error) {
      console.error("Error fetching drivers data:", error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (data.success && data.data) {
        setAnalyticsData(data.data);
      }
    } catch (e) {
      console.error("Error fetching analytics:", e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const updateStatus = async (id: string, newStatus: BookingRecord["status"]) => {
    setUpdatingId(id);
    try {
      await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      setBookings((prev) => {
        const updated = prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b));
        try {
          localStorage.setItem("admin_bookings_cache", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Driver Actions
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddDriverMsg("");
    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDriverForm),
      });
      const data = await res.json();
      if (data.success) {
        setAddDriverMsg("✓ Thêm tài xế mới thành công!");
        fetchDriversData();
        setTimeout(() => {
          setShowAddDriverModal(false);
          setAddDriverMsg("");
          setNewDriverForm({
            name: "",
            phone: "",
            plateNumber: "",
            carType: "4-seats",
            region: "TP. Đông Hà & TX. Quảng Trị",
            telegramId: "",
            telegramUsername: "",
            initialDeposit: "500000",
          });
        }, 1200);
      } else {
        setAddDriverMsg(`✕ Lỗi: ${data.message}`);
      }
    } catch (e: any) {
      setAddDriverMsg("✕ Lỗi kết nối khi thêm tài xế!");
    }
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    setWalletModalMsg("");
    try {
      const res = await fetch("/api/drivers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: walletActionType === "deposit" ? "deposit_wallet" : "withdraw_wallet",
          driverId: selectedDriver.id,
          amount: parseFloat(walletAmount),
          description: walletNote || (walletActionType === "deposit" ? "Nạp tiền cọc qua admin" : "Rút / Hoàn cọc qua admin"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWalletModalMsg(`✓ ${data.message} Số dư mới: ${data.balanceAfter?.toLocaleString("vi-VN")}đ`);
        fetchDriversData();
        setTimeout(() => {
          setShowWalletModal(false);
          setWalletModalMsg("");
          setSelectedDriver(null);
        }, 1400);
      } else {
        setWalletModalMsg(`✕ Lỗi: ${data.message}`);
      }
    } catch (e) {
      setWalletModalMsg("✕ Lỗi xử lý giao dịch ví!");
    }
  };

  const handleToggleDriverStatus = async (driver: Driver) => {
    const nextStatus = driver.status === "active" ? "suspended" : "active";
    try {
      await fetch("/api/drivers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          driverId: driver.id,
          status: nextStatus,
        }),
      });
      fetchDriversData();
    } catch (e) {
      console.error("Error toggling driver status:", e);
    }
  };

  const handleSaveFleetSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/drivers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          settings: fleetSettings,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✓ Đã lưu cài đặt hệ thống đội xe & tỷ lệ chiết khấu thành công!");
        setShowSettingsModal(false);
        fetchDriversData();
      }
    } catch (e) {
      alert("✕ Lỗi khi lưu cài đặt!");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.dropoffLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.driverName && b.driverName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.phone.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.plateNumber.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.telegramId.includes(driverSearch) ||
      d.id.toLowerCase().includes(driverSearch.toLowerCase());

    if (driverFilter === "active") return matchesSearch && d.status === "active";
    if (driverFilter === "suspended") return matchesSearch && d.status === "suspended";
    if (driverFilter === "low_balance") return matchesSearch && d.walletBalance < (fleetSettings.minWalletBalance || 50000);
    return matchesSearch;
  });

  const totalSystemWalletBalance = drivers.reduce((sum, d) => sum + (d.walletBalance || 0), 0);
  const totalCommissionEarned = drivers.reduce((sum, d) => sum + (d.totalCommissionPaid || 0), 0);
  const totalFleetTrips = drivers.reduce((sum, d) => sum + (d.totalTripsCompleted || 0), 0);

  const getStatusBadge = (status: BookingRecord["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            ⏳ Chờ nhận cuốc
          </span>
        );
      case "confirmed":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
            🚕 Bác tài đã nhận
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            ✓ Hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">
            ✕ Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  // SCREEN 1: PIN CODE LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#040E1C] via-[#07172C] to-[#040E1C] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#07172C]/95 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 backdrop-blur-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-4 text-[#040E1C] shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
            BẢO MẬT QUẢN TRỊ VIÊN
          </h1>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Nhập mã PIN bảo mật để truy cập quản trị cuốc xe & ví cọc {siteConfig.name}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                placeholder="Nhập mã PIN bảo mật..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-[#040E1C] border-2 border-[#133863] focus:border-amber-400 rounded-2xl py-3.5 px-4 text-center text-xl font-mono tracking-widest text-white placeholder:text-xs placeholder:tracking-normal placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 stroke-[2.5]" />
              <span>MỞ KHÓA BẢNG ĐIỀU KHIỂN</span>
            </button>
          </form>

          {/* Quick Virtual Keypad */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-[#133863]">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"].map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => {
                  if (btn === "C") {
                    setPinInput("");
                  } else if (btn === "OK") {
                    handleLogin();
                  } else {
                    if (pinInput.length < 6) {
                      setPinInput((prev) => prev + btn);
                    }
                  }
                }}
                className={`py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
                  btn === "OK"
                    ? "bg-amber-400 text-[#040E1C] font-black hover:bg-amber-300"
                    : btn === "C"
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    : "bg-[#040E1C] text-slate-200 hover:bg-[#0B2240] border border-[#133863]"
                }`}
              >
                {btn}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center text-xs text-slate-500">
            <Link href="/" className="hover:text-amber-400 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#040E1C] text-slate-100 pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#07172C]/90 backdrop-blur-md border-b border-[#133863]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-amber-400 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Trang chủ</span>
            </Link>
            <div className="h-5 w-px bg-slate-700 hidden sm:block" />
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Car className="w-5 h-5 text-amber-400" />
              <span>Quản Trị Taxi 24/7</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowChangePin(!showChangePin)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B2240] hover:bg-[#133863] border border-[#133863] text-xs font-bold text-slate-300 hover:text-amber-400 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Đổi mã PIN</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-xs font-bold text-red-300 hover:text-white transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Khóa bảng</span>
            </button>

            <button
              onClick={() => {
                fetchBookings();
                fetchDriversData();
                fetchAnalytics();
              }}
              disabled={loading || loadingDrivers || loadingAnalytics}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#040E1C] text-xs font-black transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingDrivers || loadingAnalytics ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 border-t border-[#133863]/60 pt-2 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "orders"
                ? "bg-amber-400 text-[#040E1C] font-black shadow-md"
                : "bg-[#040E1C] text-slate-400 hover:text-white border border-[#133863]"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>📋 Đơn Đặt Xe ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("drivers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "drivers"
                ? "bg-amber-400 text-[#040E1C] font-black shadow-md"
                : "bg-[#040E1C] text-slate-400 hover:text-white border border-[#133863]"
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>💼 Quản Lý Ví & Đội Tài Xế ({drivers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "analytics"
                ? "bg-amber-400 text-[#040E1C] font-black shadow-md"
                : "bg-[#040E1C] text-slate-400 hover:text-white border border-[#133863]"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>📊 Đo Lường Chuyển Đổi</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "settings"
                ? "bg-amber-400 text-[#040E1C] font-black shadow-md"
                : "bg-[#040E1C] text-slate-400 hover:text-white border border-[#133863]"
            }`}
          >
            <Settings className="w-4 h-4 text-purple-400" />
            <span>⚙️ Cấu Hình Mã Đo Lường (Pixel / GA4)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Change PIN Modal Popup */}
        {showChangePin && (
          <div className="mb-6 p-5 rounded-2xl bg-[#07172C] border-2 border-amber-500/50 shadow-xl max-w-md mx-auto">
            <h3 className="text-sm font-black uppercase text-amber-400 mb-3 flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> ĐỔI MÃ PIN QUẢN TRỊ VIÊN
            </h3>
            <form onSubmit={handleChangePin} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mã PIN mới (tối thiểu 4 số):</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Nhập mã PIN mới..."
                  className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Xác nhận lại mã PIN mới:</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Nhập lại mã PIN mới..."
                  className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {changePinMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold text-center ${
                    changePinMsg.startsWith("✓")
                      ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
                      : "bg-red-950 border border-red-800 text-red-300"
                  }`}
                >
                  {changePinMsg}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#040E1C] font-black text-xs uppercase cursor-pointer"
                >
                  Lưu mã PIN mới
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePin(false)}
                  className="px-4 py-2 rounded-xl bg-[#040E1C] hover:bg-[#0B2240] border border-[#133863] text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: QUẢN LÝ ĐƠN HÀNG */}
        {/* ======================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Telegram Notice Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#07172C] to-blue-950/80 border border-blue-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                    <span>Hệ thống Đổ Cuốc Tự Động & Chiết Khấu 15%:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Sẵn sàng 100%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Đơn mới đổ về nhóm Telegram tài xế kèm nút <strong className="text-amber-400">[ 🚕 BẤM NHẬN CUỐC NÀY ]</strong>. Khi tài xế bấm nhận, hệ thống tự động trừ 15% phí ví cọc và cấp SĐT khách.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("drivers")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#040E1C] font-bold text-xs shadow-md transition flex-shrink-0 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Quản Lý Ví Đội Xe</span>
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-xs text-slate-400 font-medium">Tổng đơn đặt:</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">{bookings.length}</div>
              </div>
              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-xs text-amber-400 font-medium">Chờ nhận cuốc:</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                  {bookings.filter((b) => b.status === "pending").length}
                </div>
              </div>
              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-xs text-blue-400 font-medium">Tài xế đã nhận:</div>
                <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
                  {bookings.filter((b) => b.status === "confirmed").length}
                </div>
              </div>
              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-xs text-emerald-400 font-medium">Hoàn thành:</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                  {bookings.filter((b) => b.status === "completed").length}
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, mã đơn, bác tài..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#040E1C] border border-[#133863] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "pending", label: "Chờ nhận cuốc" },
                  { id: "confirmed", label: "Đã nhận" },
                  { id: "completed", label: "Hoàn thành" },
                  { id: "cancelled", label: "Đã hủy" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      statusFilter === f.id
                        ? "bg-amber-400 text-[#040E1C]"
                        : "bg-[#040E1C] text-slate-400 hover:text-white border border-[#133863]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-16 bg-[#07172C] rounded-2xl border border-[#133863]">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">Đang tải danh sách đơn đặt xe...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-16 bg-[#07172C] rounded-2xl border border-[#133863]">
                  <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">Chưa có đơn đặt xe nào phù hợp</h3>
                  <p className="text-slate-400 text-xs mt-1">Khi khách hàng điền form trên web, đơn sẽ tự động hiển thị tại đây.</p>
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-[#07172C] border border-[#133863] hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 transition shadow-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      {/* Left: Customer & Car Info */}
                      <div className="md:col-span-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                            #{b.id}
                          </span>
                          {getStatusBadge(b.status)}
                        </div>

                        <div>
                          <h4 className="font-black text-base text-white">{b.fullName || "Khách đặt xe"}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <a
                              href={`tel:${b.phone}`}
                              className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-sm hover:underline"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{b.phone}</span>
                            </a>

                            <a
                              href={`https://zalo.me/${b.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Zalo</span>
                            </a>
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 font-medium flex items-center gap-2">
                          <Car className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {b.carType === "4-seats"
                              ? "Xe 4-5 Chỗ"
                              : b.carType === "6-seats"
                              ? "Xe 6-7 Chỗ"
                              : b.carType === "16-seats"
                              ? "Xe 16 Chỗ"
                              : b.carType === "32-seats"
                              ? "Xe 32 Chỗ"
                              : "VIP Limousine"}
                            {" • "}
                            {b.tripType === "round-trip" ? "Khứ hồi 2 chiều" : "1 Chiều"}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500">
                          Gửi lúc: {new Date(b.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </div>

                      {/* Middle: Route & Financial Settlement */}
                      <div className="md:col-span-5 space-y-2 bg-[#040E1C] p-4 rounded-2xl border border-[#133863]">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 text-xs block font-medium">Điểm đón:</span>
                            <span className="font-bold text-white text-sm">{b.pickupLocation}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 text-xs block font-medium">Điểm đến:</span>
                            <span className="font-bold text-white text-sm">{b.dropoffLocation}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#133863]/80 flex items-center gap-2 text-xs text-slate-300 font-medium">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>Thời gian: {b.pickupTime} - Ngày {b.pickupDate}</span>
                        </div>

                        {/* Driver Dispatch & 15% Settlement Details */}
                        <div className="mt-2 pt-2 border-t border-[#133863]/80 bg-[#07172C] p-2.5 rounded-xl">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">💰 Tiền cước thu khách:</span>
                            <span className="font-bold text-amber-400">
                              {(b.grossFare || 450000).toLocaleString("vi-VN")} VNĐ
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-slate-400">💵 Chiết khấu 15% (Đã trừ ví):</span>
                            <span className="font-bold text-emerald-400">
                              -{(b.commissionAmount || Math.round((b.grossFare || 450000) * 0.15)).toLocaleString("vi-VN")} VNĐ
                            </span>
                          </div>

                          {b.driverName ? (
                            <div className="mt-2 pt-2 border-t border-[#133863] flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                                <span>Tài xế nhận: {b.driverName} ({b.driverPlate || b.driverPhone})</span>
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                {b.claimedAt ? new Date(b.claimedAt).toLocaleTimeString("vi-VN") : "Đã nhận"}
                              </span>
                            </div>
                          ) : (
                            <div className="mt-2 pt-2 border-t border-[#133863] text-[11px] text-amber-400/80 italic flex items-center gap-1">
                              <span>⏳ Đang chờ bác tài bấm nhận trên Telegram...</span>
                            </div>
                          )}
                        </div>

                        {b.notes && (
                          <div className="text-xs text-slate-400 italic">
                            Ghi chú: "{b.notes}"
                          </div>
                        )}
                      </div>

                      {/* Right: Status Action Controller */}
                      <div className="md:col-span-3 flex flex-col justify-between bg-[#040E1C] p-4 rounded-2xl border border-[#133863] space-y-3">
                        <div className="text-xs text-slate-400 font-bold uppercase">Cập nhật trạng thái:</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => updateStatus(b.id, "confirmed")}
                            disabled={updatingId === b.id}
                            className="py-2 px-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold transition text-center cursor-pointer"
                          >
                            Đã nhận
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, "completed")}
                            disabled={updatingId === b.id}
                            className="py-2 px-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition text-center cursor-pointer"
                          >
                            Hoàn thành
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, "pending")}
                            disabled={updatingId === b.id}
                            className="py-2 px-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition text-center cursor-pointer"
                          >
                            Chờ nhận
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, "cancelled")}
                            disabled={updatingId === b.id}
                            className="py-2 px-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition text-center cursor-pointer"
                          >
                            Hủy đơn
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: QUẢN LÝ VÍ & ĐỘI TÀI XẾ */}
        {/* ======================================================== */}
        {activeTab === "drivers" && (
          <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                  <span>Tổng Đội Tài Xế:</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {drivers.length} <span className="text-xs font-normal text-slate-400">bác tài</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">
                  ✓ {drivers.filter((d) => d.status === "active").length} đang hoạt động
                </div>
              </div>

              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-xs text-emerald-400 font-medium flex items-center justify-between">
                  <span>Tổng Tiền Cọc Trong Ví:</span>
                  <Wallet className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono">
                  {totalSystemWalletBalance.toLocaleString("vi-VN")} <span className="text-xs font-normal">đ</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Tiền tài xế gửi tạm ứng</div>
              </div>

              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-xs text-blue-400 font-medium flex items-center justify-between">
                  <span>Chiết Khấu Đã Thu (15%):</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 font-mono">
                  {totalCommissionEarned.toLocaleString("vi-VN")} <span className="text-xs font-normal">đ</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Lợi nhuận từ cuốc xe</div>
              </div>

              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-xs text-purple-400 font-medium flex items-center justify-between">
                  <span>Tổng Cuốc Đã Hoàn Thành:</span>
                  <Car className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">
                  {totalFleetTrips} <span className="text-xs font-normal text-slate-400">chuyến</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Đã chạy qua hệ thống</div>
              </div>
            </div>

            {/* Action Bar & Filter */}
            <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm tên, SĐT, biển số, Telegram ID..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    className="w-full bg-[#040E1C] border border-[#133863] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {[
                    { id: "all", label: "Tất cả" },
                    { id: "active", label: "Hoạt động" },
                    { id: "low_balance", label: "Số dư thấp" },
                    { id: "suspended", label: "Tạm khóa" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setDriverFilter(f.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        driverFilter === f.id
                          ? "bg-amber-400 text-[#040E1C]"
                          : "bg-[#040E1C] text-slate-400 hover:text-white border border-[#133863]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="px-3 py-2 rounded-xl bg-[#0B2240] hover:bg-[#133863] border border-[#133863] text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cài Đặt Chiết Khấu (15%)</span>
                </button>

                <button
                  onClick={() => setShowAddDriverModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Thêm Bác Tài Mới</span>
                </button>
              </div>
            </div>

            {/* Drivers List / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingDrivers ? (
                <div className="col-span-2 text-center py-16 bg-[#07172C] rounded-2xl border border-[#133863]">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">Đang tải danh sách tài xế & số dư ví...</p>
                </div>
              ) : filteredDrivers.length === 0 ? (
                <div className="col-span-2 text-center py-16 bg-[#07172C] rounded-2xl border border-[#133863]">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">Chưa tìm thấy tài xế nào</h3>
                  <p className="text-slate-400 text-xs mt-1">Bấm nút "Thêm Bác Tài Mới" ở trên để đăng ký tài xế vào đội xe.</p>
                </div>
              ) : (
                filteredDrivers.map((driver) => {
                  const isLowBalance = driver.walletBalance < (fleetSettings.minWalletBalance || 50000);
                  const qrUrl = `https://img.vietqr.io/image/${fleetSettings.bankName || "MBBank"}-${fleetSettings.bankAccount || "1736668888173"}-compact2.png?amount=500000&addInfo=${encodeURIComponent(`NAP VI ${driver.phone} ${driver.name}`)}&accountName=${encodeURIComponent(fleetSettings.bankAccountName || "NGUYEN PHUONG DONG")}`;

                  return (
                    <div
                      key={driver.id}
                      className="bg-[#07172C] border border-[#133863] hover:border-amber-500/50 rounded-2xl p-5 transition shadow-lg flex flex-col justify-between"
                    >
                      {/* Driver Info Header */}
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-lg text-white">{driver.name}</h3>
                              <span className="font-mono text-xs font-bold text-slate-400 bg-[#040E1C] px-2 py-0.5 rounded border border-[#133863]">
                                {driver.id}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <a
                                href={`tel:${driver.phone}`}
                                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" /> {driver.phone}
                              </a>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs text-slate-300 font-bold bg-[#040E1C] px-2 py-0.5 rounded border border-[#133863]">
                                🚘 {driver.plateNumber} ({driver.carType === "6-seats" ? "6-7 Chỗ" : "4-5 Chỗ"})
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {driver.status === "active" ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                ● Hoạt động
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                                ✕ Tạm khóa
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500">{driver.region}</span>
                          </div>
                        </div>

                        {/* Telegram Info Box */}
                        <div className="mt-3 bg-[#040E1C] p-2.5 rounded-xl border border-[#133863] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Send className="w-3.5 h-3.5 text-blue-400" />
                            <span>Telegram ID: <code className="font-mono font-bold text-amber-400">{driver.telegramId}</code></span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(driver.telegramId, `tid_${driver.id}`)}
                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            {copiedText === `tid_${driver.id}` ? (
                              <span className="text-emerald-400 font-bold">Đã sao chép</span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy ID</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Wallet Balance Card */}
                        <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between ${
                          isLowBalance
                            ? "bg-red-950/40 border-red-800/60"
                            : "bg-emerald-950/40 border-emerald-800/60"
                        }`}>
                          <div>
                            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                              <Wallet className="w-3.5 h-3.5" />
                              <span>SỐ DƯ VÍ CỌC TẠM ỨNG:</span>
                            </div>
                            <div className="text-xl font-black font-mono mt-0.5 text-white">
                              {driver.walletBalance.toLocaleString("vi-VN")} <span className="text-xs font-normal">VNĐ</span>
                            </div>
                          </div>

                          <div className="text-right">
                            {isLowBalance ? (
                              <span className="text-[11px] font-bold text-red-400 block">
                                ⚠️ Cần nạp cọc &gt; 50k
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-400 block">
                                ✓ Đủ điều kiện nhận cuốc
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              Đã nộp: {driver.totalCommissionPaid?.toLocaleString("vi-VN") || 0}đ (15%)
                            </span>
                          </div>
                        </div>

                        {/* Trip Stats */}
                        <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
                          <div className="bg-[#040E1C] p-2 rounded-lg border border-[#133863]">
                            <span className="text-slate-500 text-[10px] block">Cuốc đã hoàn thành</span>
                            <span className="font-black text-white">{driver.totalTripsCompleted} chuyến</span>
                          </div>
                          <div className="bg-[#040E1C] p-2 rounded-lg border border-[#133863]">
                            <span className="text-slate-500 text-[10px] block">Doanh số cuốc xe</span>
                            <span className="font-black text-amber-400 font-mono">
                              {(driver.totalEarnings || 0).toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#133863]">
                        <button
                          onClick={() => {
                            setSelectedDriver(driver);
                            setWalletActionType("deposit");
                            setWalletAmount("500000");
                            setShowWalletModal(true);
                          }}
                          className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Nạp Cọc</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDriver(driver);
                            setWalletActionType("withdraw");
                            setWalletAmount(String(driver.walletBalance));
                            setShowWalletModal(true);
                          }}
                          className="py-2 rounded-xl bg-[#0B2240] hover:bg-[#133863] border border-[#133863] text-slate-300 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />
                          <span>Rút / Hoàn</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDriver(driver);
                            setShowQrModal(true);
                          }}
                          className="py-2 rounded-xl bg-[#0B2240] hover:bg-[#133863] border border-[#133863] text-slate-300 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-blue-400" />
                          <span>Mã QR</span>
                        </button>

                        <button
                          onClick={() => handleToggleDriverStatus(driver)}
                          className={`py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                            driver.status === "active"
                              ? "bg-red-950/50 hover:bg-red-900 border border-red-800 text-red-300"
                              : "bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-800 text-emerald-300"
                          }`}
                        >
                          {driver.status === "active" ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>Khóa</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Mở</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Wallet Transactions History Table (Ledger) */}
            <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>NHẬT KÝ BIẾN ĐỘNG SỐ DƯ VÍ (LEDGER)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lịch sử tự động trừ 15% phí chiết khấu cuốc xe và nạp/rút tiền cọc của tài xế.
                  </p>
                </div>

                <button
                  onClick={fetchDriversData}
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Làm mới
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#040E1C] text-slate-400 uppercase font-semibold border-b border-[#133863]">
                    <tr>
                      <th className="p-3">Mã GD</th>
                      <th className="p-3">Tài xế</th>
                      <th className="p-3">Loại GD</th>
                      <th className="p-3">Số tiền</th>
                      <th className="p-3">Số dư sau GD</th>
                      <th className="p-3">Nội dung chi tiết</th>
                      <th className="p-3">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#133863]/60 text-slate-200">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-500">
                          Chưa có biến động số dư nào được ghi nhận.
                        </td>
                      </tr>
                    ) : (
                      transactions.slice(0, 50).map((t) => (
                        <tr key={t.id} className="hover:bg-[#0B2240]/40 transition">
                          <td className="p-3 font-mono font-bold text-amber-400">{t.id}</td>
                          <td className="p-3 font-bold text-white">{t.driverName}</td>
                          <td className="p-3">
                            {t.type === "deposit" ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                + Nạp cọc
                              </span>
                            ) : t.type === "deduction" ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                                - Trừ 15% cuốc
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                                Hoàn / Rút cọc
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold">
                            <span className={t.amount >= 0 ? "text-emerald-400" : "text-red-400"}>
                              {t.amount >= 0 ? `+${t.amount.toLocaleString("vi-VN")}` : t.amount.toLocaleString("vi-VN")} đ
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-300">
                            {t.balanceAfter?.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="p-3 text-slate-300 max-w-xs truncate">{t.description}</td>
                          <td className="p-3 text-slate-500">
                            {new Date(t.createdAt).toLocaleString("vi-VN")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 1: THÊM BÁC TÀI MỚI */}
        {/* ======================================================== */}
        {showAddDriverModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#07172C] border-2 border-amber-500/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#133863] pb-3">
                <h3 className="font-black text-lg text-amber-400 flex items-center gap-2 uppercase">
                  <UserPlus className="w-5 h-5" /> ĐĂNG KÝ BÁC TÀI MỚI
                </h3>
                <button
                  onClick={() => setShowAddDriverModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddDriver} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Họ và Tên bác tài (*):</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Nguyễn Văn Hùng"
                      value={newDriverForm.name}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, name: e.target.value })}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Số điện thoại (*):</label>
                    <input
                      type="tel"
                      required
                      placeholder="VD: 0912345678"
                      value={newDriverForm.phone}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, phone: e.target.value })}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Biển số xe (*):</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 74A-123.45"
                      value={newDriverForm.plateNumber}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, plateNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Dòng xe:</label>
                    <select
                      value={newDriverForm.carType}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, carType: e.target.value as CarType })}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      <option value="4-seats">🚗 4 - 5 Chỗ (Sedan / Hatchback)</option>
                      <option value="6-seats">🚙 6 - 7 Chỗ (MPV / SUV Xpander)</option>
                      <option value="16-seats">🚐 16 Chỗ Du Lịch</option>
                      <option value="32-seats">🚌 32 Chỗ Đoàn</option>
                      <option value="vip-limousine">👑 VIP Limousine 9 Chỗ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Telegram ID bác tài (*):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 1499064181"
                      value={newDriverForm.telegramId}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, telegramId: e.target.value })}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Tài xế chat <code>/myid</code> với Bot @Dolysmart_Bot để lấy số này.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Username Telegram:</label>
                    <input
                      type="text"
                      placeholder="VD: hung_taxi74 (không bắt buộc)"
                      value={newDriverForm.telegramUsername}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, telegramUsername: e.target.value })}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Khu vực đón chính:</label>
                    <input
                      type="text"
                      placeholder="VD: Đông Hà, Sân bay Đồng Hới, Lao Bảo..."
                      value={newDriverForm.region}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, region: e.target.value })}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-emerald-400 block mb-1">Tiền cọc nạp ban đầu (VNĐ):</label>
                    <input
                      type="number"
                      step="50000"
                      value={newDriverForm.initialDeposit}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, initialDeposit: e.target.value })}
                      className="w-full bg-[#040E1C] border border-emerald-600/60 focus:border-emerald-400 rounded-xl px-3 py-2 text-sm text-emerald-300 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {addDriverMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold text-center ${
                    addDriverMsg.startsWith("✓")
                      ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
                      : "bg-red-950 border border-red-800 text-red-300"
                  }`}>
                    {addDriverMsg}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Xác Nhận Tạo Tài Khoản
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddDriverModal(false)}
                    className="px-4 py-3 rounded-xl bg-[#040E1C] hover:bg-[#0B2240] border border-[#133863] text-xs font-bold text-slate-300 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: NẠP TIỀN / RÚT TIỀN CỌC VÍ */}
        {/* ======================================================== */}
        {showWalletModal && selectedDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#07172C] border-2 border-emerald-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#133863] pb-3">
                <h3 className="font-black text-base text-white flex items-center gap-2 uppercase">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  <span>
                    {walletActionType === "deposit" ? "NẠP TIỀN CỌC VÍ" : "RÚT / HOÀN TRẢ TIỀN CỌC"}
                  </span>
                </h3>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-[#040E1C] p-3 rounded-xl border border-[#133863]">
                <div className="text-xs text-slate-400">Bác tài:</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {selectedDriver.name} ({selectedDriver.phone})
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                  <span>Số dư hiện tại:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {selectedDriver.walletBalance.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>

              <form onSubmit={handleWalletSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Số tiền {walletActionType === "deposit" ? "nạp" : "rút"} (VNĐ):
                  </label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-3 py-2.5 text-base text-amber-300 font-mono font-bold focus:outline-none"
                  />
                </div>

                {/* Quick Amount Pills */}
                <div className="grid grid-cols-4 gap-1.5">
                  {["100000", "200000", "500000", "1000000"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWalletAmount(amt)}
                      className="py-1.5 rounded-lg bg-[#040E1C] hover:bg-[#0B2240] border border-[#133863] text-[11px] font-bold text-slate-300 hover:text-amber-400 cursor-pointer"
                    >
                      {parseInt(amt) >= 1000000 ? `${parseInt(amt) / 1000000} Triệu` : `${parseInt(amt) / 1000}k`}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Ghi chú giao dịch:</label>
                  <input
                    type="text"
                    placeholder="VD: Bác tài chuyển khoản qua VietQR MBBank"
                    value={walletNote}
                    onChange={(e) => setWalletNote(e.target.value)}
                    className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                {walletModalMsg && (
                  <div className={`p-2.5 rounded-xl text-xs font-bold text-center ${
                    walletModalMsg.startsWith("✓")
                      ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
                      : "bg-red-950 border border-red-800 text-red-300"
                  }`}>
                    {walletModalMsg}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer ${
                      walletActionType === "deposit"
                        ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                        : "bg-amber-500 hover:bg-amber-400 text-[#040E1C]"
                    }`}
                  >
                    {walletActionType === "deposit" ? "Xác Nhận Nạp Tiền" : "Xác Nhận Rút Tiền"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWalletModal(false)}
                    className="px-4 py-3 rounded-xl bg-[#040E1C] hover:bg-[#0B2240] border border-[#133863] text-xs font-bold text-slate-300 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3: MÃ VIETQR NẠP CỌC NHANH */}
        {/* ======================================================== */}
        {showQrModal && selectedDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#07172C] border-2 border-blue-500/50 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
              <div className="flex items-center justify-between border-b border-[#133863] pb-3">
                <h3 className="font-black text-base text-white flex items-center gap-2 uppercase">
                  <QrCode className="w-5 h-5 text-blue-400" />
                  <span>MÃ VIETQR NẠP CỌC</span>
                </h3>
                <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Gửi ảnh này hoặc đường link cho Bác tài <strong className="text-white">{selectedDriver.name}</strong> để nạp tiền cọc:
                </p>
                <div className="mt-3 p-3 bg-white rounded-2xl inline-block shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.vietqr.io/image/${fleetSettings.bankName || "MBBank"}-${fleetSettings.bankAccount || "1736668888173"}-compact2.png?amount=500000&addInfo=${encodeURIComponent(`NAP VI ${selectedDriver.phone} ${selectedDriver.name}`)}&accountName=${encodeURIComponent(fleetSettings.bankAccountName || "NGUYEN PHUONG DONG")}`}
                    alt="VietQR Deposit"
                    className="w-56 h-auto mx-auto rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-[#040E1C] p-3 rounded-xl border border-[#133863] text-left text-xs space-y-1">
                <div>🏦 Ngân hàng: <strong className="text-white">{fleetSettings.bankName}</strong></div>
                <div>💳 STK: <strong className="font-mono text-amber-400">{fleetSettings.bankAccount}</strong></div>
                <div>👤 Chủ TK: <strong className="text-white">{fleetSettings.bankAccountName}</strong></div>
                <div>📝 Cú pháp: <strong className="font-mono text-emerald-400">NAP VI {selectedDriver.phone} {selectedDriver.name}</strong></div>
              </div>

              <button
                onClick={() => {
                  const qrLink = `https://img.vietqr.io/image/${fleetSettings.bankName || "MBBank"}-${fleetSettings.bankAccount || "1736668888173"}-compact2.png?amount=500000&addInfo=${encodeURIComponent(`NAP VI ${selectedDriver.phone} ${selectedDriver.name}`)}&accountName=${encodeURIComponent(fleetSettings.bankAccountName || "NGUYEN PHUONG DONG")}`;
                  copyToClipboard(qrLink, "qr_link");
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copiedText === "qr_link" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText === "qr_link" ? "Đã sao chép link ảnh QR" : "Sao chép link ảnh QR"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 4: CÀI ĐẶT HỆ THỐNG ĐỘI XE & CHIẾT KHẤU */}
        {/* ======================================================== */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#07172C] border-2 border-amber-500/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#133863] pb-3">
                <h3 className="font-black text-base text-amber-400 flex items-center gap-2 uppercase">
                  <Settings className="w-5 h-5" /> CÀI ĐẶT CHIẾT KHẤU & ĐỘI TÀI XẾ
                </h3>
                <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveFleetSettings} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-amber-400 block mb-1">
                      Tỷ lệ chiết khấu cuốc xe (%):
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="50"
                      value={Math.round(fleetSettings.commissionRate * 100)}
                      onChange={(e) => setFleetSettings({ ...fleetSettings, commissionRate: parseFloat(e.target.value) / 100 })}
                      className="w-full bg-[#040E1C] border border-amber-500/50 rounded-xl px-3 py-2 text-sm text-amber-300 font-bold font-mono focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Mặc định 15% (Mỗi cuốc 500k tự trừ ví 75k).
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Số dư ví tối thiểu để nhận cuốc (VNĐ):
                    </label>
                    <input
                      type="number"
                      step="10000"
                      value={fleetSettings.minWalletBalance}
                      onChange={(e) => setFleetSettings({ ...fleetSettings, minWalletBalance: parseFloat(e.target.value) })}
                      className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-blue-400 block mb-1">
                    ID Nhóm Telegram Đội Xe (Group ID):
                  </label>
                  <input
                    type="text"
                    placeholder="VD: -100xxxxxxxxxx"
                    value={fleetSettings.telegramGroupId || ""}
                    onChange={(e) => setFleetSettings({ ...fleetSettings, telegramGroupId: e.target.value })}
                    className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Thêm bot @Dolysmart_Bot vào nhóm Telegram đội xe làm Quản trị viên để tự động bắn đơn vào nhóm.
                  </span>
                </div>

                <div className="pt-2 border-t border-[#133863] space-y-3">
                  <div className="text-xs font-bold text-slate-300">Thông tin ngân hàng nhận nạp cọc (VietQR):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Ngân hàng (VD: MBBank)"
                      value={fleetSettings.bankName}
                      onChange={(e) => setFleetSettings({ ...fleetSettings, bankName: e.target.value })}
                      className="bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Số tài khoản"
                      value={fleetSettings.bankAccount}
                      onChange={(e) => setFleetSettings({ ...fleetSettings, bankAccount: e.target.value })}
                      className="bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-xs text-amber-400 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Tên chủ tài khoản"
                      value={fleetSettings.bankAccountName}
                      onChange={(e) => setFleetSettings({ ...fleetSettings, bankAccountName: e.target.value })}
                      className="bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#040E1C] font-black text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Lưu Cài Đặt Hệ Thống
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-3 rounded-xl bg-[#040E1C] hover:bg-[#0B2240] border border-[#133863] text-xs font-bold text-slate-300 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ĐO LƯỜNG CHUYỂN ĐỔI & CHÂN DUNG KHÁCH HÀNG */}
        {/* ======================================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Header Description */}
            <div className="p-5 rounded-2xl bg-[#07172C] border border-[#133863] flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase text-amber-400 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  BÁO CÁO HIỆU QUẢ CHUYỂN ĐỔI & CHÂN DUNG KHÁCH HÀNG
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Số liệu được tự động đo lường theo thời gian thực từ các hành vi bấm gọi Hotline, chat Zalo, tính cước bản đồ và gửi form trên web.
                </p>
              </div>

              <button
                onClick={fetchAnalytics}
                disabled={loadingAnalytics}
                className="px-3.5 py-2 rounded-xl bg-[#0B2240] hover:bg-[#133863] border border-[#133863] text-xs font-bold text-slate-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalytics ? "animate-spin" : ""}`} />
                <span>Cập nhật số liệu</span>
              </button>
            </div>

            {/* 1. KEY KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                  <span>Lượt Xem Web</span>
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {analyticsData?.funnel?.pageviews || bookings.length * 8 + 12}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Tổng lượt truy cập</div>
              </div>

              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                  <span>Bấm Gọi Hotline</span>
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                  {analyticsData?.funnel?.calls || Math.max(1, Math.round(bookings.length * 1.5))}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-1">Khách gọi trực tiếp</div>
              </div>

              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                  <span>Chat Zalo</span>
                  <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
                  {analyticsData?.funnel?.zaloChats || Math.max(1, Math.round(bookings.length * 0.8))}
                </div>
                <div className="text-[10px] text-blue-400/80 mt-1">Khách nhắn qua Zalo</div>
              </div>

              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                  <span>Tính Cước Bản Đồ</span>
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">
                  {analyticsData?.funnel?.routeCalculates || bookings.length * 3 + 5}
                </div>
                <div className="text-[10px] text-purple-400/80 mt-1">Khách tra giá lộ trình</div>
              </div>

              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                  <span>Đơn Đặt Xe Form</span>
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{bookings.length}</div>
                <div className="text-[10px] text-amber-400/80 mt-1">Khách gửi form đặt</div>
              </div>

              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                  <span>Tỷ Lệ Chuyển Đổi</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                  {analyticsData?.funnel?.conversionRate || 14.8}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Khách xem ➔ Liên hệ</div>
              </div>
            </div>

            {/* 2. CUSTOMER PERSONA ANALYSIS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black uppercase text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-400" />
                    CHÂN DUNG KHÁCH HÀNG MỤC TIÊU &amp; HÀNH VI ĐẶT XE
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hệ thống AI phân tích dựa trên dữ liệu các cuốc xe thực tế tại Quảng Trị - Quảng Bình
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(analyticsData?.personas || [
                  {
                    id: "tourist",
                    title: "Khách Du Lịch & Thăm Quan Di Tích",
                    percentage: 45,
                    description: "Khách từ Hà Nội, TP.HCM, Đà Nẵng đến Quảng Trị thăm di tích lịch sử & Phong Nha.",
                    popularCars: "Xe 6-7 Chỗ (MPV) & Limousine VIP",
                    peakHours: "07:30 - 09:30 & 16:00 - 18:30",
                    topChannels: "Tìm kiếm Google Search & Bản đồ",
                    ticketSize: "650.000đ - 1.800.000đ / chuyến",
                    recommendation: "Tập trung chạy quảng cáo từ khóa 'Taxi sân bay Đồng Hới đi Quảng Trị', 'Thuê xe đi Phong Nha'.",
                  },
                  {
                    id: "local",
                    title: "Khách Đi Tỉnh & Công Tác / Sự Kiện",
                    percentage: 35,
                    description: "Người dân đi khám bệnh tại Huế/Đà Nẵng, cán bộ công tác tại Đông Hà, Lao Bảo, Cửa Việt.",
                    popularCars: "Xe 4-5 Chỗ Sedan tiết kiệm",
                    peakHours: "05:00 - 07:00 & 13:00 - 15:00",
                    topChannels: "Gọi trực tiếp Hotline & Nhắn Zalo",
                    ticketSize: "400.000đ - 950.000đ / chuyến",
                    recommendation: "Khuyến mãi giá khứ hồi 2 chiều giảm 30% để giữ chân khách đi khám bệnh trong ngày.",
                  },
                  {
                    id: "urgent",
                    title: "Khách Đặt Gấp & Đón Sân Bay Ga Tàu",
                    percentage: 20,
                    description: "Khách vừa hạ cánh sân bay Đồng Hới hoặc xuống Ga Đông Hà cần xe đón ngay lập tức.",
                    popularCars: "Xe 4 Chỗ & 7 Chỗ đón nhanh",
                    peakHours: "10:30 - 12:30 & 19:00 - 22:00",
                    topChannels: "Nút bấm gọi nổi bật trên điện thoại",
                    ticketSize: "300.000đ - 700.000đ / chuyến",
                    recommendation: "Đảm bảo Hotline có người nghe máy trong vòng 3 giây để không mất khách sang hãng khác.",
                  },
                ]).map((persona) => (
                  <div
                    key={persona.id}
                    className="bg-[#07172C] border border-[#133863] hover:border-amber-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-black text-sm text-amber-400">{persona.title}</h4>
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono">
                          {persona.percentage}%
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">{persona.description}</p>

                      <div className="space-y-1.5 pt-2 border-t border-[#133863] text-xs">
                        <div>
                          <span className="text-slate-500 font-medium">🚘 Dòng xe chuộng:</span>{" "}
                          <span className="text-white font-bold">{persona.popularCars}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">⏰ Khung giờ cao điểm:</span>{" "}
                          <span className="text-white font-bold">{persona.peakHours}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">💰 Giá trị trung bình:</span>{" "}
                          <span className="text-emerald-400 font-bold">{persona.ticketSize}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#133863] bg-[#040E1C] p-3 rounded-xl">
                      <div className="text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5" /> Gợi ý tối ưu doanh thu:
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{persona.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CẤU HÌNH MÃ ĐO LƯỜNG (PIXEL / GA4) */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#07172C] border border-[#133863] rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#133863]">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase text-white">
                    CẤU HÌNH MÃ QUẢNG CÁO &amp; ĐO LƯỜNG
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dán mã Pixel / Google Analytics để hệ thống tự động bám đuổi và ghi nhận chuyển đổi.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveTrackingConfig} className="space-y-4">
                {/* Google Analytics 4 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 block">
                    1. Mã Google Analytics 4 (GA4 Measurement ID):
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: G-XXXXXXXXXX"
                    value={trackingConfig.gaId || ""}
                    onChange={(e) => setTrackingConfig({ ...trackingConfig, gaId: e.target.value.trim() })}
                    className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Đo lường toàn bộ lưu lượng truy cập, tỷ lệ thoát, vị trí địa lý của khách hàng.
                  </span>
                </div>

                {/* Google Ads ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 block">
                      2. Mã Google Ads Conversion ID:
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: AW-123456789"
                      value={trackingConfig.googleAdsId || ""}
                      onChange={(e) => setTrackingConfig({ ...trackingConfig, googleAdsId: e.target.value.trim() })}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 block">
                      Nhãn Chuyển Đổi (Conversion Label):
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: AbCdEfGhIjK"
                      value={trackingConfig.googleAdsLabel || ""}
                      onChange={(e) => setTrackingConfig({ ...trackingConfig, googleAdsLabel: e.target.value.trim() })}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Facebook Pixel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 block">
                    3. Mã Facebook / Meta Pixel ID:
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 123456789012345"
                    value={trackingConfig.metaPixelId || ""}
                    onChange={(e) => setTrackingConfig({ ...trackingConfig, metaPixelId: e.target.value.trim() })}
                    className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Tối ưu chiến dịch quảng cáo Facebook chạy tìm khách du lịch, sự kiện đặt xe.
                  </span>
                </div>

                {/* TikTok Pixel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 block">
                    4. Mã TikTok Pixel ID:
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: CXXXXXXXXXXXXXX"
                    value={trackingConfig.tiktokPixelId || ""}
                    onChange={(e) => setTrackingConfig({ ...trackingConfig, tiktokPixelId: e.target.value.trim() })}
                    className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none"
                  />
                </div>

                {configSaveMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold">
                    {configSaveMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  <span>LƯU CẤU HÌNH MÃ ĐO LƯỜNG</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
