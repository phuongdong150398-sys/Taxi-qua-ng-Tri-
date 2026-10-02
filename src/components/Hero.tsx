"use client";

import { useState } from "react";
import { siteConfig } from "@/config/siteConfig";
import { CarType, TripType, ServiceType } from "@/types";
import {
  Phone,
  Car,
  MapPin,
  Calendar,
  Clock,
  Send,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

interface HeroProps {
  onBookingSuccess: (bookingData: any) => void;
}

export default function Hero({ onBookingSuccess }: HeroProps) {
  const [serviceType, setServiceType] = useState<ServiceType>("airport");
  const [carType, setCarType] = useState<CarType>("4-seats");
  const [tripType, setTripType] = useState<TripType>("one-way");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupDate, setPickupDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [pickupTime, setPickupTime] = useState("Đón ngay sau 5-10 phút");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Gợi ý điểm đến phổ biến tại Quảng Trị & Quảng Bình
  const popularLocations = [
    "TP. Đồng Hới",
    "Sân bay Đồng Hới",
    "Động Phong Nha",
    "Cửa khẩu Lao Bảo",
    "Đức Mẹ La Vang",
    "Thành Cổ Quảng Trị",
    "Địa đạo Vịnh Mốc",
    "TP. Đông Hà",
    "Sân bay Phú Bài",
  ];

  // Dự tính giá tham khảo theo địa danh Quảng Trị & Quảng Bình
  const getEstimatedPrice = () => {
    const combined = (pickupLocation + " " + dropoffLocation).toLowerCase();
    
    // Tuyến Đông Hà ⇄ Đồng Hới
    if (combined.includes("đồng hới") && (combined.includes("đông hà") || combined.includes("quảng trị"))) {
      return carType === "4-seats" ? "800.000đ - 900.000đ" : carType === "7-seats" ? "950.000đ - 1.100.000đ" : "1.600.000đ";
    }
    // Tuyến Phong Nha - Kẻ Bàng / Thiên Đường
    if (combined.includes("phong nha") || combined.includes("thiên đường") || combined.includes("kẻ bàng")) {
      return carType === "4-seats" ? "1.100.000đ - 1.250.000đ" : carType === "7-seats" ? "1.300.000đ - 1.500.000đ" : "2.100.000đ";
    }
    // Tuyến Vũng Chùa - Đảo Yến
    if (combined.includes("vũng chùa") || combined.includes("đảo yến") || combined.includes("mộ đại tướng")) {
      return carType === "4-seats" ? "1.350.000đ" : carType === "7-seats" ? "1.600.000đ" : "2.500.000đ";
    }
    // Tuyến Sân Bay Phú Bài / Huế
    if (combined.includes("phú bài") || combined.includes("huế")) {
      return carType === "4-seats" ? "750.000đ - 850.000đ" : carType === "7-seats" ? "900.000đ - 1.050.000đ" : "1.500.000đ";
    }
    // Tuyến Cửa Khẩu Lao Bảo / Khe Sanh
    if (combined.includes("lao bảo") || combined.includes("khe sanh") || combined.includes("hướng hóa")) {
      return carType === "4-seats" ? "700.000đ - 800.000đ" : carType === "7-seats" ? "850.000đ - 950.000đ" : "1.400.000đ";
    }
    // Tuyến La Vang / Thành Cổ / TX. Quảng Trị
    if (combined.includes("la vang") || combined.includes("thành cổ") || combined.includes("thị xã quảng trị")) {
      return carType === "4-seats" ? "250.000đ - 300.000đ" : carType === "7-seats" ? "320.000đ - 380.000đ" : "550.000đ";
    }
    // Tuyến Địa đạo Vịnh Mốc / Cầu Hiền Lương
    if (combined.includes("vịnh mốc") || combined.includes("hiền lương") || combined.includes("bến hải") || combined.includes("vĩnh linh")) {
      return carType === "4-seats" ? "380.000đ - 450.000đ" : carType === "7-seats" ? "480.000đ - 550.000đ" : "800.000đ";
    }
    // Tuyến Biển Cửa Việt / Cửa Tùng
    if (combined.includes("cửa việt") || combined.includes("cửa tùng")) {
      return carType === "4-seats" ? "220.000đ - 280.000đ" : carType === "7-seats" ? "290.000đ - 350.000đ" : "500.000đ";
    }
    // Tuyến Đà Nẵng
    if (combined.includes("đà nẵng")) {
      return carType === "4-seats" ? "1.500.000đ" : carType === "7-seats" ? "1.800.000đ" : "2.800.000đ";
    }
    // Mặc định tính theo km
    return carType === "4-seats" ? "20.000 VNĐ / km" : carType === "7-seats" ? "Từ 20.000 - 22.000đ / km" : "Giá ưu đãi theo tour";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!phone.trim() || !pickupLocation.trim() || !dropoffLocation.trim()) {
      setErrorMsg("Vui lòng điền Số điện thoại, Điểm đón và Điểm đến để đặt xe!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: fullName || "Khách hàng",
        phone,
        pickupLocation,
        dropoffLocation,
        pickupDate,
        pickupTime,
        carType,
        tripType,
        serviceType,
        notes,
      };

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }

        onBookingSuccess({
          ...data.booking,
          estimatedPrice: getEstimatedPrice(),
        });
      } else {
        setErrorMsg(data.message || "Không thể gửi yêu cầu đặt xe. Vui lòng thử lại!");
      }
    } catch (err) {
      setErrorMsg("Có lỗi kết nối. Bạn hãy bấm gọi Hotline để được phục vụ ngay!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-16 lg:pt-36 lg:pb-24 bg-gradient-to-b from-[#040E1C] via-[#07172C] to-[#040E1C] text-white overflow-hidden"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#FDB813]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 right-0 w-[450px] h-[450px] bg-[#0055D4]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Value Prop & Highlights */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Logo Badge in Hero */}
            <div className="inline-flex items-center gap-3 p-2 pr-4 rounded-2xl bg-white/95 border-2 border-amber-400 shadow-xl shadow-amber-500/10 hover:scale-105 transition-transform">
              <img
                src={siteConfig.logo}
                alt={siteConfig.name}
                className="h-10 sm:h-12 w-auto object-contain"
              />
              <div className="text-left border-l border-slate-300 pl-3">
                <div className="text-[11px] font-black text-[#07172C] uppercase tracking-wider">
                  Dịch Vụ Taxi Quảng Trị - Quảng Bình
                </div>
                <div className="text-xs font-bold text-amber-600">
                  Giá chuẩn: 20.000 VNĐ / KM
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-tight uppercase">
              <span className="text-white">TAXI </span>
              <span className="text-amber-400">QUẢNG TRỊ </span>
              <span className="inline-block px-3 py-0.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-[#07172C] text-2xl sm:text-4xl lg:text-5xl align-middle font-black shadow-lg">
                24H
              </span>
              <br />
              <span className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-200 mt-2 block normal-case">
                Đưa Đón Quảng Trị ⇄ Quảng Bình • Sân Bay • Đi Tỉnh
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Phục vụ tận tâm 24/7 tại <strong className="text-white font-bold">Đông Hà, Đồng Hới, Ba Đồn, Lao Bảo, La Vang, Vĩnh Linh, Phong Nha</strong>. Xe đời mới 4 - 7 - 16 chỗ sạch sẽ không mùi, giá cước niêm yết chuẩn <span className="text-amber-400 font-bold">20.000 VNĐ/km</span>.
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#0B2240] backdrop-blur-sm border border-[#133863] rounded-2xl p-3.5 text-left shadow-md">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <Zap className="w-4 h-4 stroke-[2.5]" /> Có mặt sau 5p
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Quảng Trị & Quảng Bình</div>
              </div>

              <div className="bg-[#0B2240] backdrop-blur-sm border border-[#133863] rounded-2xl p-3.5 text-left shadow-md">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" /> 20.000đ / km
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Giá cước niêm yết</div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-[#0B2240] backdrop-blur-sm border border-[#133863] rounded-2xl p-3.5 text-left shadow-md">
                <div className="flex items-center gap-2 text-blue-400 font-black text-sm">
                  <Car className="w-4 h-4 stroke-[2.5]" /> Xe 2022-2025
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Nội thất thơm mát</div>
              </div>
            </div>

            {/* Quick Call Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <a
                href={`tel:${siteConfig.hotlineFormatted}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-400 text-white font-black text-base shadow-xl shadow-red-600/30 hover:scale-105 transition-all"
              >
                <Phone className="w-5 h-5 animate-ring" />
                <span>GỌI TỔNG ĐÀI: {siteConfig.hotline}</span>
              </a>

              <a
                href={siteConfig.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#0068FF] hover:bg-[#0055D4] text-white font-bold text-base transition-all shadow-lg shadow-blue-500/20 hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Zalo: {siteConfig.zalo}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Booking Box Card */}
          <div className="lg:col-span-6" id="dat-xe">
            <div className="bg-[#07172C]/95 backdrop-blur-xl border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-500/10">
              {/* Card Header with Tabs */}
              <div className="flex items-center justify-between pb-4 border-b border-[#133863]">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3.5 w-3.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                    ĐẶT XE QUẢNG TRỊ - QUẢNG BÌNH
                  </h2>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-amber-400 text-[#040E1C] font-black tracking-wide shadow">
                  20.000 VNĐ / Km
                </span>
              </div>

              {/* Service Type Tabs */}
              <div className="grid grid-cols-4 gap-1.5 bg-[#040E1C] p-1.5 rounded-2xl mt-4 border border-[#133863]/80">
                {[
                  { id: "airport", label: "Sân Bay" },
                  { id: "provincial", label: "Đi Tỉnh" },
                  { id: "city", label: "Nội Tỉnh" },
                  { id: "convenient", label: "Du Lịch / Tour" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setServiceType(tab.id as ServiceType)}
                    className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                      serviceType === tab.id
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040E1C] font-black shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Booking Form */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Trip Type (1 chiều / 2 chiều) & Car Selection */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Trip Type */}
                  <div className="flex bg-[#040E1C] p-1 rounded-xl border border-[#133863]">
                    <button
                      type="button"
                      onClick={() => setTripType("one-way")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                        tripType === "one-way"
                          ? "bg-[#0B2240] text-amber-400 shadow-sm"
                          : "text-slate-400"
                      }`}
                    >
                      1 Chiều
                    </button>
                    <button
                      type="button"
                      onClick={() => setTripType("round-trip")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                        tripType === "round-trip"
                          ? "bg-[#0B2240] text-amber-400 shadow-sm"
                          : "text-slate-400"
                      }`}
                    >
                      2 Chiều (Giảm 50% về)
                    </button>
                  </div>

                  {/* Car Type Selector */}
                  <select
                    value={carType}
                    onChange={(e) => setCarType(e.target.value as CarType)}
                    className="w-full bg-[#040E1C] border border-[#133863] text-white rounded-xl px-3 py-2 text-xs sm:text-sm font-bold focus:border-amber-400 focus:outline-none"
                  >
                    <option value="4-seats">Xe 4 Chỗ (20.000đ/km)</option>
                    <option value="7-seats">Xe 7 Chỗ (22.000đ/km)</option>
                    <option value="16-seats">Xe 16 Chỗ (Transit Tour)</option>
                    <option value="vip-limousine">VIP Limousine 9 Chỗ</option>
                  </select>
                </div>

                {/* Pickup & Dropoff Locations */}
                <div className="space-y-2.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Điểm đón (VD: Đông Hà, Đồng Hới, Lao Bảo, Vĩnh Linh...)"
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-emerald-500 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      placeholder="Điểm đến (VD: Đồng Hới, Phong Nha, La Vang, Sân bay...)"
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-500 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Quick location buttons */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400 font-semibold">Tuyến nhanh:</span>
                  {popularLocations.slice(0, 5).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setDropoffLocation(loc)}
                      className="text-[11px] bg-[#0B2240] hover:bg-[#133863] text-slate-300 hover:text-amber-400 px-2.5 py-0.5 rounded-lg border border-[#133863] transition font-medium"
                    >
                      + {loc}
                    </button>
                  ))}
                </div>

                {/* Customer Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Số điện thoại đón xe (*)"
                    className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-bold"
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tên khách hàng (Không bắt buộc)"
                    className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
                  />
                </div>

                {/* Date and Time Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full bg-[#040E1C] border border-[#133863] rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none font-medium"
                    />
                  </div>

                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-[#040E1C] border border-[#133863] text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:border-amber-400 focus:outline-none font-medium"
                  >
                    <option value="Đón ngay sau 5-10 phút">⚡ Đón ngay sau 5-10 phút</option>
                    <option value="Sau 30 phút">Sau 30 phút</option>
                    <option value="Sau 1 tiếng">Sau 1 tiếng</option>
                    <option value="Sáng mai (05:00 - 08:00)">Sáng mai (05:00 - 08:00)</option>
                    <option value="Trưa mai (11:00 - 13:00)">Trưa mai (11:00 - 13:00)</option>
                    <option value="Tối mai (18:00 - 21:00)">Tối mai (18:00 - 21:00)</option>
                    <option value="Hẹn giờ theo ghi chú">Hẹn giờ khác (ghi chú)</option>
                  </select>
                </div>

                {/* Price Preview Banner */}
                <div className="bg-[#0B2240] border border-amber-400/40 rounded-2xl p-3.5 flex items-center justify-between shadow-inner">
                  <div>
                    <div className="text-[11px] text-amber-300 font-bold uppercase">Giá cước ước tính:</div>
                    <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                      {getEstimatedPrice()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-2.5 py-1 rounded-lg">
                      ✓ Chuẩn 20.000đ/km
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs text-center font-bold">
                    {errorMsg}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-base uppercase tracking-wider shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span>Đang gửi thông tin...</span>
                  ) : (
                    <>
                      <Send className="w-5 h-5 stroke-[2.5]" />
                      <span>XÁC NHẬN ĐẶT XE NGAY</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  ⚡ Tổng đài TAXI Quảng Trị 24h sẽ gọi lại trong <span className="text-amber-400 font-bold">1 - 3 phút</span>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
