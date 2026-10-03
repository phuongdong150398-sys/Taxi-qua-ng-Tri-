"use client";

import { siteConfig } from "@/config/siteConfig";
import { Clock, ArrowRight, MapPin, Sparkles } from "lucide-react";

interface PopularRoutesProps {
  onSelectRoute: (from: string, to: string) => void;
}

export default function PopularRoutes({ onSelectRoute }: PopularRoutesProps) {
  return (
    <section id="tuyen-duong" className="py-20 bg-[#040E1C] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DANH SÁCH CÁC TUYẾN TOUR & ĐƯỜNG DÀI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            CÁC TUYẾN DU LỊCH & ĐƯỜNG DÀI TRỌN GÓI
          </h2>
          <p className="text-slate-300 text-base">
            Bảng giá áp dụng chuẩn cho xe 4 chỗ (12.000đ/km) và xe 6 chỗ (15.000đ/km). Đón tận nơi tại ga, sân bay, khách sạn Đồng Hới & các điểm lân cận.
          </p>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {siteConfig.popularRoutes.map((route) => (
            <div
              key={route.id}
              className="bg-[#0B2240] border border-[#133863] hover:border-amber-400/80 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-amber-500/15"
            >
              <div className="space-y-4">
                {/* Number Badge & Distance info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040E1C] font-black text-xs flex items-center justify-center shadow">
                      {route.number || "•"}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300">
                      {route.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{route.time}</span>
                    <span>•</span>
                    <span>{route.distance}</span>
                  </div>
                </div>

                {/* Route Name */}
                <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors leading-snug">
                  {route.name}
                </h3>

                {/* Route Path visual */}
                <div className="bg-[#040E1C] p-3.5 rounded-2xl space-y-2 text-xs border border-[#133863]">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="truncate">{route.from}</span>
                  </div>
                  <div className="border-l-2 border-dashed border-amber-400/50 ml-1 pl-3 h-2" />
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="truncate font-bold text-white">{route.to}</span>
                  </div>
                </div>

                {/* Price Table for this route */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="bg-[#040E1C] p-2.5 rounded-xl border border-[#133863]">
                    <div className="text-[10px] text-slate-400 font-medium">Xe 4 Chỗ</div>
                    <div className="text-xs sm:text-sm font-black text-amber-400 mt-0.5 font-mono">
                      {route.price4Seats}
                    </div>
                  </div>
                  <div className="bg-[#040E1C] p-2.5 rounded-xl border border-[#133863]">
                    <div className="text-[10px] text-slate-400 font-medium">Xe 6 Chỗ</div>
                    <div className="text-xs sm:text-sm font-black text-amber-400 mt-0.5 font-mono">
                      {route.price6Seats}
                    </div>
                  </div>
                  <div className="bg-[#040E1C] p-2.5 rounded-xl border border-[#133863]">
                    <div className="text-[10px] text-slate-400 font-medium">16/32/VIP</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-300 mt-0.5 truncate">
                      {route.priceOther || "Báo giá"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-5 mt-5 border-t border-[#133863]">
                <button
                  type="button"
                  onClick={() => onSelectRoute(route.from, route.to)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg group-hover:shadow-amber-500/30 cursor-pointer"
                >
                  <span>Đặt Tuyến Này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
