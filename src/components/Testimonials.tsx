"use client";

import { siteConfig } from "@/config/siteConfig";
import { Star, MessageSquare } from "lucide-react";

export default function Testimonials() {
  return (
    <section id="danh-gia" className="py-20 bg-[#07172C] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>ĐÁNH GIÁ TỪ HÀNH KHÁCH</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            HƠN 10,000+ KHÁCH HÀNG ĐÃ HÀI LÒNG VỚI TAXI QUẢNG TRỊ 24H
          </h2>
          <p className="text-slate-300 text-base">
            Sự tin tưởng và nụ cười hài lòng của quý khách là động lực to lớn để chúng tôi phục vụ ngày càng tốt hơn.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {siteConfig.testimonials.map((review, index) => (
            <div
              key={index}
              className="bg-[#0B2240] border border-[#133863] rounded-3xl p-6 relative flex flex-col justify-between hover:border-amber-400/60 transition shadow-xl"
            >
              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic font-medium">
                  "{review.content}"
                </p>
              </div>

              {/* Author info */}
              <div className="pt-6 mt-6 border-t border-[#133863] flex items-center gap-3.5">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md"
                  loading="lazy"
                />
                <div>
                  <div className="font-black text-white text-sm">{review.name}</div>
                  <div className="text-xs text-slate-300 font-medium">{review.role}</div>
                  <div className="text-[11px] text-amber-400 font-bold mt-0.5">
                    Chuyến đi: {review.route}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
