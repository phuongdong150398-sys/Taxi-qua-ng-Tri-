"use client";

import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { Phone, MessageCircle, Mail, MapPin, Clock, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#040E1C] text-slate-400 border-t border-[#133863] pt-16 pb-24 sm:pb-12 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#133863]">
          {/* Brand Col with Logo */}
          <div className="space-y-4">
            <Link href="#hero" className="inline-block bg-white/95 rounded-2xl p-2 shadow-lg border border-amber-400/40">
              <img
                src={siteConfig.logo}
                alt={siteConfig.name}
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold bg-[#0B2240] border border-[#133863] p-3 rounded-2xl">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>Giá cước chuẩn 20.000đ/km - Đón đúng giờ 100%</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Dịch Vụ Taxi Quảng Trị
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href="#dat-xe" className="hover:text-amber-400 transition">
                  • Taxi Đông Hà - Sân Bay Phú Bài (Huế)
                </a>
              </li>
              <li>
                <a href="#dat-xe" className="hover:text-amber-400 transition">
                  • Taxi Đông Hà - Sân Bay Đồng Hới (Quảng Bình)
                </a>
              </li>
              <li>
                <a href="#dat-xe" className="hover:text-amber-400 transition">
                  • Taxi Đông Hà - Cửa Khẩu Lao Bảo
                </a>
              </li>
              <li>
                <a href="#dat-xe" className="hover:text-amber-400 transition">
                  • Xe Đi Hành Hương Đức Mẹ La Vang
                </a>
              </li>
              <li>
                <a href="#doi-xe" className="hover:text-amber-400 transition">
                  • Thuê Xe Đi Du Lịch Cửa Việt - Cửa Tùng
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Tổng Đài Liên Hệ
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>
                  Hotline 24/7:{" "}
                  <a
                    href={`tel:${siteConfig.hotlineFormatted}`}
                    className="font-black text-amber-400 hover:underline font-mono text-sm"
                  >
                    {siteConfig.hotline}
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>
                  Zalo Đặt Xe:{" "}
                  <a
                    href={siteConfig.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-400 hover:underline font-mono"
                  >
                    {siteConfig.zalo}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 font-medium">{siteConfig.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">{siteConfig.workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Commitments & Policy */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Chính Sách & Quản Trị
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-300 font-medium">✓ Giá cước niêm yết 20.000 VNĐ/km</li>
              <li className="text-slate-300 font-medium">✓ Miễn phí hủy chuyến trước giờ đón</li>
              <li className="text-slate-300 font-medium">✓ Tài xế bản xứ thân thiện, an toàn</li>
              <li className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B2240] border border-[#133863] text-slate-200 hover:text-amber-400 hover:border-amber-400 transition text-xs font-bold"
                >
                  <span>🔐 Quản Trị Đơn Đặt Xe</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Phục vụ tận tâm 24/7 trên mọi nẻo đường Quảng Trị.</p>
          <p className="flex items-center gap-1 text-amber-400 font-bold">
            ⚡ Giá cước: 20.000 VNĐ / km
          </p>
        </div>
      </div>
    </footer>
  );
}
