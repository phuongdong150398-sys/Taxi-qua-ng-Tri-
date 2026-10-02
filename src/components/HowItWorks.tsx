"use client";

import { siteConfig } from "@/config/siteConfig";
import { PhoneCall, CheckCircle, Car, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Gửi Yêu Cầu Hoặc Bấm Gọi",
      desc: `Nhập điểm đón & điểm đến vào form trên website hoặc bấm gọi ngay Hotline ${siteConfig.hotline} / Zalo ${siteConfig.zalo}.`,
      icon: PhoneCall,
    },
    {
      step: "02",
      title: "Báo Giá & Điều Tài Xế",
      desc: "Tổng đài liên hệ lại sau 1-3 phút để chốt giá cước chuẩn 20.000 VNĐ/km và điều tài xế gần bạn nhất.",
      icon: CheckCircle,
    },
    {
      step: "03",
      title: "Đón Tận Nơi & Thanh Toán",
      desc: "Tài xế đón đúng giờ, phục vụ chu đáo. Quý khách thanh toán tiền mặt hoặc chuyển khoản QR sau khi đến nơi an toàn.",
      icon: Car,
    },
  ];

  return (
    <section className="py-20 bg-[#040E1C] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            QUY TRÌNH ĐẶT XE ĐƠN GIẢN TRONG 3 BƯỚC
          </h2>
          <p className="text-slate-300 text-base">
            Không cần cài app phức tạp. Chỉ cần một chạm là có xe đón tận nơi nhanh chóng.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-[#0B2240] border border-[#133863] rounded-3xl p-8 relative flex flex-col justify-between group hover:border-amber-400/80 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-black text-amber-400/40 group-hover:text-amber-400 transition-colors font-mono">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#133863] flex items-center text-xs font-bold text-amber-400 gap-1.5">
                  <span>Thực hiện nhanh 24/7</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
