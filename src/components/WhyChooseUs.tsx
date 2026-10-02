"use client";

import { siteConfig } from "@/config/siteConfig";
import { Clock, ShieldCheck, BadgePercent, UserCheck, CheckCircle2, Award, Headphones } from "lucide-react";

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: Clock,
      title: "Đón Nhanh 5 - 10 Phút",
      desc: "Mạng lưới tài xế phủ khắp TP. Đông Hà, TX. Quảng Trị, Lao Bảo, Khe Sanh, Cam Lộ, Triệu Phong,...",
      color: "from-amber-500 to-yellow-400",
    },
    {
      icon: BadgePercent,
      title: "Giá Chuẩn 20.000 VNĐ / Km",
      desc: "Bảng giá cước rõ ràng, không phát sinh chi phí. Giảm giá tới 50% chiều về khi đặt xe 2 chiều.",
      color: "from-emerald-500 to-teal-400",
    },
    {
      icon: ShieldCheck,
      title: "Xe Đời Mới 100% Sạch Sẽ",
      desc: "Dàn xe đời mới 2022 - 2025, điều hòa mát sâu, nội thất thơm tho, khử mùi tuyệt đối.",
      color: "from-blue-500 to-cyan-400",
    },
    {
      icon: UserCheck,
      title: "Tài Xế Bản Địa Lịch Sự",
      desc: "Nhiệt tình, chu đáo, am hiểu từng cung đường miền Trung và các địa điểm tham quan du lịch.",
      color: "from-purple-500 to-indigo-400",
    },
    {
      icon: Award,
      title: "Đón Sân Bay & Đường Dài Uy Tín",
      desc: "Đưa đón sân bay Phú Bài (Huế), Sân bay Đồng Hới (Quảng Bình) đúng giờ, an toàn tuyệt đối.",
      color: "from-rose-500 to-pink-400",
    },
    {
      icon: Headphones,
      title: "Phục Vụ 24/7 Xuyên Suốt",
      desc: "Tổng đài 0877.669.555 trực 24/24. Khách hàng đổi lịch hoặc hủy chuyến hoàn toàn miễn phí.",
      color: "from-orange-500 to-amber-400",
    },
  ];

  return (
    <section id="uu-diem" className="py-20 bg-[#07172C] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CAM KẾT CHẤT LƯỢNG HÀNG ĐẦU</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            TẠI SAO BẠN NÊN CHỌN {siteConfig.name.toUpperCase()}?
          </h2>
          <p className="text-slate-300 text-base">
            Chúng tôi luôn đặt sự an toàn, thoải mái và giá cước tiết kiệm của quý khách lên hàng đầu trong mỗi hành trình.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="bg-[#0B2240] border border-[#133863] hover:border-amber-400/60 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 group shadow-xl"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${reason.color} flex items-center justify-center text-[#040E1C] shadow-lg mb-5 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 stroke-[2.4]" />
                </div>
                <h3 className="text-lg font-black text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {reason.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {reason.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
