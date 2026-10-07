"use client";

import { siteConfig } from "@/config/siteConfig";
import { Phone, MessageCircle, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

import { trackConversionEvent } from "@/lib/analytics";

export default function FloatingWidgets() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCall = (position: string) => {
    trackConversionEvent("call_hotline", {
      position,
      number: siteConfig.hotline,
    });
  };

  const handleZalo = (position: string) => {
    trackConversionEvent("click_zalo", {
      position,
      number: siteConfig.zalo,
    });
  };

  return (
    <>
      {/* Floating Buttons: Bottom Left (Hotline) & Bottom Right (Zalo & Scroll) */}
      <div className="fixed bottom-6 left-5 z-40 flex flex-col items-start gap-3">
        {/* Hotline Pulsing Call Button */}
        <a
          href={`tel:${siteConfig.hotlineFormatted}`}
          onClick={() => handleCall("floating_left_button")}
          className="relative group flex items-center"
          aria-label="Gọi hotline"
        >
          {/* Pulsing ring behind */}
          <div className="w-14 h-14 rounded-full bg-red-600 pulse-red flex items-center justify-center text-white shadow-2xl shadow-red-600/50 hover:scale-110 transition-transform">
            <Phone className="w-7 h-7 animate-ring" />
          </div>
          {/* Label tooltip / pill */}
          <div className="hidden sm:flex items-center ml-3 bg-slate-900/90 backdrop-blur-md border border-red-500/40 text-white px-3.5 py-1.5 rounded-full shadow-lg text-xs font-bold pointer-events-none group-hover:scale-105 transition-all">
            <span className="text-red-400 mr-1.5">Hotline:</span>
            <span>{siteConfig.hotline}</span>
          </div>
        </a>
      </div>

      <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3">
        {/* Zalo Button */}
        <a
          href={siteConfig.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleZalo("floating_right_button")}
          className="relative group flex items-center"
          aria-label="Chat Zalo"
        >
          {/* Label tooltip */}
          <div className="hidden sm:flex items-center mr-3 bg-slate-900/90 backdrop-blur-md border border-blue-500/40 text-white px-3.5 py-1.5 rounded-full shadow-lg text-xs font-bold pointer-events-none group-hover:scale-105 transition-all">
            <span className="text-blue-400 mr-1.5">Zalo:</span>
            <span>Đặt xe nhanh</span>
          </div>
          <div className="w-14 h-14 rounded-full bg-blue-600 pulse-blue flex items-center justify-center text-white shadow-2xl shadow-blue-600/50 hover:scale-110 transition-transform">
            <MessageCircle className="w-7 h-7" />
          </div>
        </a>

        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-sm border border-slate-700 transition shadow cursor-pointer"
            aria-label="Lên đầu trang"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar for High Conversion */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-2.5 flex items-center gap-2">
        <a
          href={`tel:${siteConfig.hotlineFormatted}`}
          onClick={() => handleCall("mobile_bottom_bar")}
          className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
        >
          <Phone className="w-4 h-4 animate-ring" />
          <span>GỌI TAXI NGAY</span>
        </a>

        <a
          href={siteConfig.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleZalo("mobile_bottom_bar")}
          className="flex-1 py-3 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
        >
          <MessageCircle className="w-4 h-4" />
          <span>NHẮN ZALO</span>
        </a>
      </div>
    </>
  );
}
