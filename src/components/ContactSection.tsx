"use client";

import { siteConfig } from "@/config/siteConfig";
import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="lien-he" className="py-20 bg-[#07172C] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0B2240] via-[#07172C] to-[#040E1C] border-2 border-amber-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left info */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Phone className="w-3.5 h-3.5" />
                <span>LIÊN HỆ & TỔNG ĐÀI ĐIỀU XE 24/7</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                CẦN XE GẤP HOẶC TƯ VẤN LỘ TRÌNH TẠI QUẢNG TRỊ & QUẢNG BÌNH?
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Đội ngũ tài xế của <strong className="text-amber-400 font-bold">{siteConfig.name}</strong> túc trực 24/24 trên khắp các tuyến đường Quảng Trị và Quảng Bình (Đông Hà, Đồng Hới, Lao Bảo, Ba Đồn, Phong Nha, La Vang, Vĩnh Linh,...), sẵn sàng đón bạn sau 5 phút với giá mở cửa 20.000đ, xe 4 chỗ chỉ 12.000đ/km, xe 6 chỗ chỉ 15.000đ/km.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
                    <Phone className="w-6 h-6 animate-ring" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Hotline Đặt Xe (24/7):</div>
                    <a
                      href={`tel:${siteConfig.hotlineFormatted}`}
                      className="text-2xl sm:text-3xl font-black text-amber-400 hover:underline font-mono"
                    >
                      {siteConfig.hotline}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#0068FF]/20 border border-[#0068FF]/40 flex items-center justify-center text-[#0068FF] flex-shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Zalo Tư Vấn & Đặt Lịch:</div>
                    <a
                      href={siteConfig.zaloUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-black text-blue-400 hover:underline font-mono"
                    >
                      {siteConfig.zalo} (Bấm để chat Zalo)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Địa bàn hoạt động:</div>
                    <div className="text-sm font-semibold text-slate-200">
                      {siteConfig.address}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Thời gian hoạt động:</div>
                    <div className="text-sm font-semibold text-slate-200">
                      {siteConfig.workingHours}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Quick Action Callout with Logo */}
            <div className="bg-[#040E1C] border border-[#133863] rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
              <div className="bg-white/95 rounded-2xl p-2.5 max-w-[220px] mx-auto shadow-lg border border-amber-400/40">
                <img
                  src={siteConfig.logo}
                  alt={siteConfig.name}
                  className="h-14 w-auto object-contain mx-auto"
                />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white uppercase">ĐẶT TAXI SIÊU TỐC</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
                  Chỉ một cuộc gọi hoặc tin nhắn Zalo, tài xế gần bạn nhất tại Quảng Trị & Quảng Bình sẽ đến đón sau 5 phút!
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={`tel:${siteConfig.hotlineFormatted}`}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-400 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-red-600/30 hover:scale-[1.02] transition-transform"
                >
                  <Phone className="w-6 h-6 animate-ring" />
                  <span>BẤM GỌI: {siteConfig.hotline}</span>
                </a>

                <a
                  href={siteConfig.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-[#0068FF] hover:bg-[#0055D4] text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-transform"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>NHẮN ZALO: {siteConfig.zalo}</span>
                </a>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 font-medium">
                ✓ Miễn phí 100% cuộc gọi tư vấn • Giá Rẻ - Uy Tín - An Toàn
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
