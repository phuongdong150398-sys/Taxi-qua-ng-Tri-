"use client";

import { siteConfig } from "@/config/siteConfig";
import { Users, Briefcase, Check, ArrowRight, Sparkles, Phone } from "lucide-react";

interface FleetSectionProps {
  onSelectCar: (carId: string) => void;
}

export default function FleetSection({ onSelectCar }: FleetSectionProps) {
  return (
    <section id="doi-xe" className="py-20 bg-[#07172C] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ĐỘI XE TAXI QUẢNG BÌNH & QUẢNG TRỊ ĐỜI MỚI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            ĐA DẠNG CÁC DÒNG XE TỪ 4 - 6 - 16 - 32 CHỖ & VIP
          </h2>
          <p className="text-slate-300 text-base">
            100% xe đời mới 2022 - 2025, máy lạnh mát sâu, không mùi say xe, tài xế bản địa lịch sự, lái xe an toàn và am hiểu mọi tuyến điểm du lịch.
          </p>
        </div>

        {/* Fleet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {siteConfig.fleet.map((car) => (
            <div
              key={car.id}
              className="bg-[#0B2240] border border-[#133863] hover:border-amber-400/80 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 shadow-xl hover:shadow-amber-500/15"
            >
              <div>
                {/* Image Container */}
                <div className="relative h-52 w-full overflow-hidden bg-[#040E1C]">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2240] via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040E1C] text-xs font-black px-3.5 py-1 rounded-full shadow-lg">
                    {car.startingPrice}
                  </div>
                </div>

                {/* Car Details */}
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                      {car.category}
                    </span>
                    <h3 className="text-xl font-black text-white mt-1 group-hover:text-amber-400 transition-colors">
                      {car.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      Mẫu xe: {car.models}
                    </p>
                  </div>

                  {/* Specs: Passengers & Luggage */}
                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-[#133863] text-xs">
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>{car.passengers} Hành khách</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Briefcase className="w-4 h-4 text-amber-400" />
                      <span className="truncate">{car.luggage}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-1.5">
                    {car.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 space-y-2">
                <button
                  type="button"
                  onClick={() => onSelectCar(car.id)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg group-hover:shadow-amber-500/30 cursor-pointer"
                >
                  <span>Đặt Xe Dòng Này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`tel:${siteConfig.hotlineFormatted}`}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#040E1C] hover:bg-[#07172C] text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition border border-[#133863]"
                >
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <span>Tổng đài: {siteConfig.hotline}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
