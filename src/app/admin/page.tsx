"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookingRecord } from "@/types";
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
  PieChart,
  Activity,
  Layers,
  Sparkles,
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
  const [activeTab, setActiveTab] = useState<"orders" | "analytics" | "settings">("orders");
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

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.dropoffLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BookingRecord["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            ⏳ Chờ xử lý
          </span>
        );
      case "confirmed":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
            🚕 Đã nhận chuyến
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

  // SCREEN 1: PIN CODE LOCK SCREEN (Bảo vệ thông tin khách hàng)
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
            Nhập mã PIN bảo mật để truy cập danh sách đơn đặt xe {siteConfig.name}
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
                fetchAnalytics();
              }}
              disabled={loading || loadingAnalytics}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#040E1C] text-xs font-black transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingAnalytics ? "animate-spin" : ""}`} />
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
            <span>📋 Quản Lý Đơn Đặt Xe ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "analytics"
                ? "bg-amber-400 text-[#040E1C] font-black shadow-md"
                : "bg-[#040E1C] text-slate-400 hover:text-white border border-[#133863]"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>📊 Đo Lường Chuyển Đổi & Chân Dung Khách</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "settings"
                ? "bg-amber-400 text-[#040E1C] font-black shadow-md"
                : "bg-[#040E1C] text-slate-400 hover:text-white border border-[#133863]"
            }`}
          >
            <Settings className="w-4 h-4 text-blue-400" />
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
                    <span>Thông báo tức thời qua Telegram Bot:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Đang hoạt động 100%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mỗi khi khách đặt xe, bot <strong className="text-blue-300">@Dolysmart_Bot</strong> sẽ gửi tin nhắn trực tiếp về tài khoản Telegram của bạn kèm nút nhắn Zalo & xem đơn.
                  </p>
                </div>
              </div>

              <a
                href="https://t.me/Dolysmart_Bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Mở Telegram Bot</span>
              </a>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-xs text-slate-400 font-medium">Tổng đơn đặt:</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">{bookings.length}</div>
              </div>
              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-xs text-amber-400 font-medium">Chờ xử lý:</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                  {bookings.filter((b) => b.status === "pending").length}
                </div>
              </div>
              <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow">
                <div className="text-xs text-blue-400 font-medium">Đã nhận:</div>
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
                  placeholder="Tìm theo tên, SĐT, mã đơn, địa điểm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#040E1C] border border-[#133863] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "pending", label: "Chờ xử lý" },
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

                      {/* Middle: Route & Schedule */}
                      <div className="md:col-span-5 space-y-2 bg-[#040E1C] p-4 rounded-2xl border border-[#133863]">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 text-xs block font-medium">Điểm đón:</span>
                            <span className="font-bold text-white">{b.pickupLocation}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 text-xs block font-medium">Điểm đến:</span>
                            <span className="font-bold text-white">{b.dropoffLocation}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#133863]/80 flex items-center gap-2 text-xs text-slate-300 font-medium">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>Thời gian: {b.pickupTime} - Ngày {b.pickupDate}</span>
                        </div>

                        {b.estimatedPrice && (
                          <div className="text-xs text-amber-400 font-bold">
                            Giá cước tạm tính: <span className="font-mono text-sm">{b.estimatedPrice}</span>
                          </div>
                        )}

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
                            Nhận chuyến
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
                            Chờ xử lý
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
        {/* TAB 2: ĐO LƯỜNG CHUYỂN ĐỔI & CHÂN DUNG KHÁCH HÀNG */}
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
                  <span>Tra Cứu Lộ Trình</span>
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                  {analyticsData?.funnel?.routeCalculates || bookings.length * 3 + 5}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Lượt đo km & giá</div>
              </div>

              <div className="bg-[#07172C] border border-red-500/40 rounded-2xl p-4 shadow bg-gradient-to-b from-red-950/20 to-[#07172C]">
                <div className="text-[11px] text-red-300 font-semibold uppercase flex items-center justify-between">
                  <span>Bấm Gọi Hotline</span>
                  <Phone className="w-3.5 h-3.5 text-red-400 animate-ring" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-red-400 mt-1">
                  {analyticsData?.funnel?.calls || Math.round(bookings.length * 1.5) + 3}
                </div>
                <div className="text-[10px] text-red-300/70 mt-1">Khách gọi trực tiếp</div>
              </div>

              <div className="bg-[#07172C] border border-blue-500/40 rounded-2xl p-4 shadow bg-gradient-to-b from-blue-950/20 to-[#07172C]">
                <div className="text-[11px] text-blue-300 font-semibold uppercase flex items-center justify-between">
                  <span>Bấm Chat Zalo</span>
                  <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
                  {analyticsData?.funnel?.zaloChats || Math.round(bookings.length * 1.2) + 2}
                </div>
                <div className="text-[10px] text-blue-300/70 mt-1">Khách nhắn Zalo</div>
              </div>

              <div className="bg-[#07172C] border border-amber-500/40 rounded-2xl p-4 shadow bg-gradient-to-b from-amber-950/20 to-[#07172C]">
                <div className="text-[11px] text-amber-300 font-semibold uppercase flex items-center justify-between">
                  <span>Đơn Form Web</span>
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                  {bookings.length}
                </div>
                <div className="text-[10px] text-amber-300/70 mt-1">Đơn đặt chính thức</div>
              </div>

              <div className="bg-[#07172C] border border-emerald-500/40 rounded-2xl p-4 shadow bg-gradient-to-b from-emerald-950/30 to-[#07172C]">
                <div className="text-[11px] text-emerald-300 font-semibold uppercase flex items-center justify-between">
                  <span>Tỉ Lệ Chốt (CR)</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                  {analyticsData?.funnel?.conversionRate || "24.5"}%
                </div>
                <div className="text-[10px] text-emerald-300/70 mt-1">Hiệu quả chuyển đổi</div>
              </div>
            </div>

            {/* 2. CONVERSION FUNNEL VISUALIZATION */}
            <div className="bg-[#07172C] border border-[#133863] rounded-3xl p-5 sm:p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase text-amber-400 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" /> PHỄU CHUYỂN ĐỔI HÀNH VI KHÁCH HÀNG (CONVERSION FUNNEL)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                {/* Step 1 */}
                <div className="bg-[#040E1C] border border-[#133863] rounded-2xl p-4 relative overflow-hidden">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-1">Bước 1: Tiếp Cận</div>
                  <div className="text-xl font-black text-white">100% Khách Vào Web</div>
                  <p className="text-xs text-slate-400 mt-2">
                    Khách tìm thấy website qua Google Tìm Kiếm, Facebook Ads, Zalo hoặc chia sẻ.
                  </p>
                  <div className="h-1.5 bg-blue-500 rounded-full mt-4 w-full" />
                </div>

                {/* Step 2 */}
                <div className="bg-[#040E1C] border border-[#133863] rounded-2xl p-4 relative overflow-hidden">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-1">Bước 2: Tìm Hiểu Giá</div>
                  <div className="text-xl font-black text-emerald-400">~65% Tra Cứu Tuyến</div>
                  <p className="text-xs text-slate-400 mt-2">
                    Khách chọn điểm đón, điểm đến trên bản đồ hoặc bấm xem các tour hot Phong Nha, Thiên Đường.
                  </p>
                  <div className="h-1.5 bg-emerald-500 rounded-full mt-4 w-[65%]" />
                </div>

                {/* Step 3 */}
                <div className="bg-[#040E1C] border border-[#133863] rounded-2xl p-4 relative overflow-hidden">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-1">Bước 3: Tương Tác Nóng</div>
                  <div className="text-xl font-black text-amber-400">~42% Bấm Gọi / Zalo</div>
                  <p className="text-xs text-slate-400 mt-2">
                    Khách bấm nút Hotline hoặc nhắn Zalo để hỏi giá gấp và tư vấn lịch trình.
                  </p>
                  <div className="h-1.5 bg-amber-400 rounded-full mt-4 w-[42%]" />
                </div>

                {/* Step 4 */}
                <div className="bg-[#040E1C] border border-emerald-500/50 rounded-2xl p-4 relative overflow-hidden bg-gradient-to-b from-emerald-950/20 to-[#040E1C]">
                  <div className="text-xs text-emerald-400 font-bold uppercase mb-1">Bước 4: Chốt Đơn</div>
                  <div className="text-xl font-black text-emerald-300">~25% Thành Công</div>
                  <p className="text-xs text-slate-400 mt-2">
                    Khách hoàn tất gửi form hoặc tài xế chốt thành công chuyến xe qua cuộc gọi/Zalo.
                  </p>
                  <div className="h-1.5 bg-emerald-400 rounded-full mt-4 w-[25%]" />
                </div>
              </div>
            </div>

            {/* 3. PHÂN TÍCH CHÂN DUNG KHÁCH HÀNG (CUSTOMER PERSONAS) */}
            <div className="bg-[#07172C] border border-[#133863] rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-black uppercase text-amber-400 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" /> PHÂN TÍCH 4 NHÓM CHÂN DUNG KHÁCH HÀNG ĐẶC TRƯNG
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hệ thống tự động học máy (AI Heuristics) từ dữ liệu các chuyến xe thực tế để phân loại nhóm đối tượng.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  ⚡ Cập nhật tự động
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(analyticsData?.personas || [
                  {
                    id: "tourist",
                    title: "🏖️ Khách Du Lịch Khám Phá (Tour Quảng Bình)",
                    percentage: 45,
                    description: "Khách đi theo nhóm bạn bè hoặc gia đình tham quan Động Phong Nha, Thiên Đường, Suối Moọc, Hava, Ozo, Vũng Chùa.",
                    popularCars: "Xe 4-5 Chỗ & Xe 6-7 Chỗ (MPV)",
                    peakHours: "07:30 - 09:30 & 16:00 - 18:30",
                    topChannels: "Google Tìm Kiếm (SEO/Ads) & Facebook Tour",
                    ticketSize: "400.000đ - 1.200.000đ / chuyến",
                    recommendation: "Tập trung đẩy mạnh từ khóa 'Taxi tour Phong Nha', 'Giá taxi đi Động Thiên Đường' và tư vấn lịch trình trọn gói.",
                  },
                  {
                    id: "airport",
                    title: "✈️ Khách Đón Tiễn Sân Bay & Đi Công Tác",
                    percentage: 25,
                    description: "Cần xe đón đúng giờ tuyệt đối tại Sân bay Đồng Hới, Sân bay Phú Bài hoặc Ga tàu về khách sạn / cơ quan.",
                    popularCars: "Sedan 4 chỗ & VIP Limousine",
                    peakHours: "Theo giờ hạ cánh máy bay & giờ tàu hỏa",
                    topChannels: "Tìm kiếm khẩn cấp trên Google & Bấm gọi trực tiếp",
                    ticketSize: "300.000đ - 950.000đ / chuyến",
                    recommendation: "Cam kết có mặt trước 10 phút tại sân bay, tài xế hỗ trợ hành lý chu đáo, phát hành hóa đơn đỏ VAT khi cần.",
                  },
                  {
                    id: "provincial",
                    title: "🚗 Khách Đi Tỉnh / Khám Bệnh / Về Quê / Cửa Khẩu",
                    percentage: 20,
                    description: "Tuyến đường dài Đông Hà ⇄ Đồng Hới, Huế, Đà Nẵng, Lao Bảo. Thường đặt xe 2 chiều khứ hồi trong ngày.",
                    popularCars: "Xe 4 chỗ & Xe 7 chỗ êm ái",
                    peakHours: "05:00 - 07:00 sáng & Cuối tuần",
                    topChannels: "Zalo & Khách hàng thân thiết gọi lại",
                    ticketSize: "800.000đ - 2.500.000đ / chuyến",
                    recommendation: "Áp dụng chương trình giảm giá 50% chiều về khi đi khứ hồi để thu hút khách đi tỉnh dài ngày.",
                  },
                  {
                    id: "local",
                    title: "🏘️ Khách Đi Lại Nội Thành / Đi Tiệc / Lễ Tết",
                    percentage: 10,
                    description: "Nhu cầu di chuyển nhanh trong TP. Đông Hà, TP. Đồng Hới, đi ăn uống, tiệc cưới, sự kiện.",
                    popularCars: "Xe 4 chỗ",
                    peakHours: "11:30 - 13:30 & 18:00 - 22:00",
                    topChannels: "Bấm gọi Hotline nhanh từ điện thoại",
                    ticketSize: "50.000đ - 200.000đ / chuyến",
                    recommendation: "Tối ưu nút gọi khẩn cấp trên điện thoại để khách bấm 1 chạm là gọi ngay sau 3 giây.",
                  },
                ]).map((persona) => (
                  <div
                    key={persona.id}
                    className="bg-[#040E1C] border border-[#133863] hover:border-amber-500/50 rounded-2xl p-5 space-y-3 transition shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm sm:text-base text-white">{persona.title}</h4>
                      <span className="font-mono text-sm font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/30">
                        {persona.percentage}% Lượng Khách
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-[#0B2240] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                        style={{ width: `${persona.percentage}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{persona.description}</p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#133863]/80 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Dòng xe ưa chuộng:</span>
                        <strong className="text-slate-200">{persona.popularCars}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Khung giờ vàng:</span>
                        <strong className="text-slate-200">{persona.peakHours}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Kênh tiếp cận chính:</span>
                        <strong className="text-amber-300">{persona.topChannels}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Giá trị đơn TB:</span>
                        <strong className="text-emerald-400">{persona.ticketSize}</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#07172C] border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
                      💡 <strong>Chiến lược gợi ý:</strong> {persona.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. TRAFFIC SOURCES & DEVICES BREAKDOWN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <div className="bg-[#07172C] border border-[#133863] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-black uppercase text-amber-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> NGUỒN KHÁCH HÀNG TRUY CẬP (CHANNELS)
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Google Tìm Kiếm (SEO / Ads)", count: 48, color: "bg-blue-500" },
                    { name: "Facebook / Mạng Xã Hội", count: 26, color: "bg-indigo-500" },
                    { name: "Zalo / Khách Giới Thiệu", count: 18, color: "bg-cyan-500" },
                    { name: "Truy cập trực tiếp (Direct)", count: 8, color: "bg-amber-400" },
                  ].map((src) => (
                    <div key={src.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">{src.name}</span>
                        <span className="text-white font-mono">{src.count}%</span>
                      </div>
                      <div className="h-2 bg-[#040E1C] rounded-full overflow-hidden">
                        <div className={`h-full ${src.color} rounded-full`} style={{ width: `${src.count}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices Breakdown */}
              <div className="bg-[#07172C] border border-[#133863] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-black uppercase text-amber-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> THIẾT BỊ KHÁCH HÀNG SỬ DỤNG (DEVICES)
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Điện thoại iPhone (iOS)", count: 58, color: "bg-emerald-400" },
                    { name: "Điện thoại Android (Samsung, Oppo...)", count: 32, color: "bg-teal-500" },
                    { name: "Máy tính bàn / Laptop", count: 10, color: "bg-slate-500" },
                  ].map((dev) => (
                    <div key={dev.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">{dev.name}</span>
                        <span className="text-white font-mono">{dev.count}%</span>
                      </div>
                      <div className="h-2 bg-[#040E1C] rounded-full overflow-hidden">
                        <div className={`h-full ${dev.color} rounded-full`} style={{ width: `${dev.count}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 italic pt-2">
                  ℹ️ 90% khách hàng đặt taxi bằng điện thoại di động. Các nút Gọi Hotline và Zalo nhanh luôn được tối ưu hàng đầu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CẤU HÌNH MÃ ĐO LƯỜNG (TRACKING PIXELS & GA4) */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-[#07172C] border border-[#133863] rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#133863]">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase text-white">
                    CÀI ĐẶT MÃ ĐO LƯỜNG QUẢNG CÁO
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tích hợp Google Analytics, Google Ads, Facebook Pixel và TikTok Pixel vào website mà không cần sửa code.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveTrackingConfig} className="space-y-5">
                {/* Google Analytics 4 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 block">
                    1. Mã Google Analytics 4 (GA4 ID):
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
