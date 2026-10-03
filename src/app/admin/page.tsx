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
} from "lucide-react";

export default function AdminPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/booking");
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: BookingRecord["status"]) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }
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

  const getCarName = (type: string) => {
    switch (type) {
      case "4-seats":
        return "Xe 4 - 5 Chỗ";
      case "6-seats":
        return "Xe 6 - 7 Chỗ";
      case "16-seats":
        return "Xe 16 Chỗ";
      case "32-seats":
        return "Xe 32 Chỗ";
      case "vip-limousine":
        return "Limousine VIP";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-[#040E1C] text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header with Logo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#07172C] border border-[#133863] p-5 rounded-3xl shadow-xl">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2.5 rounded-2xl bg-[#0B2240] hover:bg-[#133863] text-slate-300 hover:text-white transition border border-[#133863]"
              title="Về trang chủ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="bg-white/95 rounded-2xl p-1.5 shadow-md border border-amber-400/40">
              <img
                src={siteConfig.logo}
                alt={siteConfig.name}
                className="h-9 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Quản Lý Đơn Đặt Xe</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-400 text-[#040E1C]">
                  Admin Panel
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {siteConfig.name} • Hotline: {siteConfig.hotline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0B2240] hover:bg-[#133863] text-white text-xs font-bold transition cursor-pointer border border-[#133863]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
              <span>Làm mới</span>
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040E1C] text-xs font-black transition shadow-lg hover:from-amber-400 hover:to-yellow-300"
            >
              Xem Website
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 shadow-lg">
            <div className="text-xs text-slate-400 font-semibold uppercase">Tổng số chuyến</div>
            <div className="text-3xl font-black text-white mt-1 font-mono">{bookings.length}</div>
          </div>

          <div className="bg-[#07172C] border border-amber-400/50 rounded-2xl p-4 shadow-lg">
            <div className="text-xs text-amber-400 font-semibold uppercase">Chờ xử lý</div>
            <div className="text-3xl font-black text-amber-400 mt-1 font-mono">
              {bookings.filter((b) => b.status === "pending").length}
            </div>
          </div>

          <div className="bg-[#07172C] border border-blue-400/50 rounded-2xl p-4 shadow-lg">
            <div className="text-xs text-blue-400 font-semibold uppercase">Đã nhận chuyến</div>
            <div className="text-3xl font-black text-blue-400 mt-1 font-mono">
              {bookings.filter((b) => b.status === "confirmed").length}
            </div>
          </div>

          <div className="bg-[#07172C] border border-emerald-400/50 rounded-2xl p-4 shadow-lg">
            <div className="text-xs text-emerald-400 font-semibold uppercase">Đã hoàn thành</div>
            <div className="text-3xl font-black text-emerald-400 mt-1 font-mono">
              {bookings.filter((b) => b.status === "completed").length}
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#07172C] border border-[#133863] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo SĐT, Tên, Điểm đón, Điểm đến..."
              className="w-full bg-[#040E1C] border border-[#133863] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
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
                    ? "bg-amber-400 text-[#040E1C] shadow"
                    : "bg-[#0B2240] text-slate-300 hover:text-white"
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
            <div className="bg-[#07172C] border border-[#133863] rounded-3xl p-12 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
              Đang tải danh sách chuyến xe...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-[#07172C] border border-[#133863] rounded-3xl p-12 text-center text-slate-400 text-sm font-medium">
              Chưa có đơn đặt xe nào phù hợp.
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#07172C] border border-[#133863] hover:border-amber-400/60 rounded-3xl p-5 sm:p-6 transition shadow-xl space-y-4"
              >
                {/* Top Row: ID, Time, Status, Quick Call */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#133863]">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-amber-400 font-mono">
                      #{b.id}
                    </span>
                    {getStatusBadge(b.status)}
                    <span className="text-xs text-slate-400 font-medium">
                      Tạo lúc: {new Date(b.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  {/* Customer Quick Call / Zalo */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${b.phone}`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Gọi: {b.phone}</span>
                    </a>
                    <a
                      href={`https://zalo.me/${b.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0068FF] hover:bg-[#0055D4] text-white text-xs font-bold transition shadow"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Zalo</span>
                    </a>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs sm:text-sm">
                  {/* Left: Passenger info */}
                  <div className="md:col-span-4 space-y-1.5 bg-[#040E1C] p-4 rounded-2xl border border-[#133863]">
                    <div className="text-slate-400 text-xs font-semibold">Khách hàng:</div>
                    <div className="font-bold text-white text-base">{b.fullName}</div>
                    <div className="text-amber-400 font-mono font-black text-sm">📞 {b.phone}</div>
                    <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                      <span className="bg-[#0B2240] px-2.5 py-1 rounded-lg border border-[#133863]">
                        🚗 {getCarName(b.carType)}
                      </span>
                      <span className="bg-[#0B2240] px-2.5 py-1 rounded-lg border border-[#133863]">
                        {b.tripType === "round-trip" ? "🔄 2 Chiều" : "➡️ 1 Chiều"}
                      </span>
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
