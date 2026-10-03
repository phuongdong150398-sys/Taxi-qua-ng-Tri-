"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { Phone, MessageCircle, Menu, X, Clock, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Trang chủ", href: "#hero" },
    { name: "Đặt xe", href: "#dat-xe" },
    { name: "Bảng giá cước", href: "#bang-gia" },
    { name: "Đội xe", href: "#doi-xe" },
    { name: "Tuyến phổ biến", href: "#tuyen-duong" },
    { name: "Ưu điểm", href: "#uu-diem" },
    { name: "Đánh giá", href: "#danh-gia" },
    { name: "Liên hệ", href: "#lien-he" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#07172C]/95 backdrop-blur-md shadow-2xl py-2 border-b border-[#133863]"
          : "bg-[#07172C]/85 backdrop-blur-sm py-3.5 border-b border-[#133863]/60"
      }`}
    >
      {/* Top Banner Bar for Trust & 24/7 Guarantee */}
      <div className="hidden lg:block bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-[#040E1C] text-xs font-black py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 stroke-[2.5]" /> PHỤC VỤ 24/7 TẠI QUẢNG TRỊ - CÓ MẶT SAU 5 PHÚT
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" /> 4 CHỖ 12K/KM • 6 CHỖ 15K/KM • MỞ CỬA 20K
            </span>
          </div>
          <div className="flex items-center space-x-5 font-black tracking-wide">
            <span>📞 TỔNG ĐÀI ĐẶT XE: {siteConfig.hotline}</span>
            <span>💬 ZALO: {siteConfig.zalo}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo with Image */}
          <Link href="#hero" className="flex items-center gap-3 group py-1">
            <div className="bg-white/95 rounded-2xl p-1.5 shadow-md shadow-amber-500/10 border border-amber-400/40 group-hover:scale-105 transition-transform flex items-center justify-center">
              <img
                src={siteConfig.logo}
                alt={siteConfig.name}
                className="h-9 sm:h-12 w-auto object-contain max-w-[150px] sm:max-w-[200px]"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 text-sm font-semibold text-slate-200 hover:text-amber-400 hover:bg-[#0B2240] rounded-xl transition-all"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Buttons: Hotline & Zalo */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={siteConfig.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#0068FF] hover:bg-[#0055D4] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Zalo: {siteConfig.zalo}</span>
            </a>

            <a
              href={`tel:${siteConfig.hotlineFormatted}`}
              className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black transition-all shadow-lg shadow-red-600/30 hover:scale-105"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center animate-ring">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-red-100 uppercase tracking-wider font-bold leading-none">
                  Hotline 24/7
                </div>
                <div className="text-sm font-black leading-tight tracking-wide font-mono">
                  {siteConfig.hotline}
                </div>
              </div>
            </a>
          </div>

          {/* Mobile Action and Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <a
              href={`tel:${siteConfig.hotlineFormatted}`}
              className="sm:hidden flex items-center justify-center w-10 h-10 rounded-2xl bg-red-600 text-white animate-ring shadow-md shadow-red-600/30"
              aria-label="Gọi hotline"
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-2xl bg-[#0B2240] text-slate-200 hover:text-white hover:bg-[#133863] transition border border-[#133863]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#07172C] border-b border-[#133863] px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs sm:text-sm font-bold text-slate-200 hover:text-amber-400 hover:bg-[#0B2240] rounded-xl transition"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-[#133863] flex flex-col gap-2.5">
            <a
              href={`tel:${siteConfig.hotlineFormatted}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-center shadow-lg shadow-red-600/30 text-sm"
            >
              <Phone className="w-4 h-4 animate-ring" />
              GỌI XE NGAY: {siteConfig.hotline}
            </a>
            <a
              href={siteConfig.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0068FF] text-white font-bold text-center text-sm shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Chat Zalo: {siteConfig.zalo}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
