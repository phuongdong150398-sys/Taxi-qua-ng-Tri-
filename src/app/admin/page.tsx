"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookingRecord } from "@/types";
import { siteConfig } from "@/config/siteConfig";
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
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [changePinMsg, setChangePinMsg] = useState("");

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showTelegramGuide, setShowTelegramGuide] = useState(false);

  // Check login state from sessionStorage on mount
  useEffect(() => {
    try {
      const auth = sessionStorage.getItem("admin_auth_status");
      if (auth === "verified") {
        setIsAuthenticated(true);
        fetchBookings();
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
        } catch (e) {
          // ignore
        }
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
                placeholder="Nhập mã PIN (Mặc định: 8888)"
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

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-amber-400 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Về trang chủ
            </Link>
            <span>Mã PIN ban đầu: <b>8888</b></span>
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
              <span>Quản Lý Đơn Đặt Xe 24/7</span>
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
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#040E1C] text-xs font-black transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
                  className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#040E1C] font-black text-xs uppercase"
                >
                  Lưu mã PIN mới
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePin(false)}
                  className="px-4 py-2 rounded-xl bg-[#040E1C] hover:bg-[#0B2240] border border-[#133863] text-xs font-bold text-slate-300"
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Telegram Notice Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#07172C] to-blue-950/80 border border-blue-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
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
        <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
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
    </div>
  );
}
