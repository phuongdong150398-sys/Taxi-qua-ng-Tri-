"use client";

import { siteConfig } from "@/config/siteConfig";
import { CheckCircle, Phone, MessageCircle, X, MapPin, Calendar, Car, Copy, Check } from "lucide-react";
import { useState } from "react";

interface BookingSuccessModalProps {
  booking: any;
  onClose: () => void;
}

export default function BookingSuccessModal({ booking, onClose }: BookingSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const copyBookingInfo = () => {
    const text = `Mã đơn: ${booking.id}\nKhách hàng: ${booking.fullName} - ${booking.phone}\nĐón: ${booking.pickupLocation}\nĐến: ${booking.dropoffLocation}\nLoại xe: ${booking.carType}\nThời gian: ${booking.pickupTime} ngày ${booking.pickupDate}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCarLabel = (type: string) => {
    switch (type) {
      case "4-seats":
        return "Xe 4 - 5 Chỗ (Sedan)";
      case "6-seats":
        return "Xe 6 - 7 Chỗ (MPV/SUV)";
      case "16-seats":
        return "Xe 16 Chỗ (Transit / Solati)";
      case "32-seats":
        return "Xe 32 Chỗ Du Lịch";
      case "vip-limousine":
        return "VIP Limousine 9 Chỗ";
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040E1C]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#07172C] border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#0B2240] hover:bg-[#133863] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Confirmation */}
        <div className="text-center space-y-3">
          <div className="bg-white/95 rounded-2xl p-2 inline-block shadow-md border border-amber-400/40">
            <img
              src={siteConfig.logo}
              alt={siteConfig.name}
              className="h-10 w-auto object-contain mx-auto"
            />
          </div>

          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase">ĐẶT XE THÀNH CÔNG!</h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Cảm ơn quý khách! Tổng đài <strong className="text-amber-400">{siteConfig.name}</strong> sẽ gọi điện xác nhận trong <span className="text-amber-400 font-bold">1 - 3 phút</span>.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-[#0B2240] border border-[#133863] rounded-2xl p-4 my-5 space-y-3 text-xs sm:text-sm shadow-inner">
          <div className="flex justify-between items-center pb-2 border-b border-[#133863]">
            <span className="text-slate-300 font-semibold">Mã chuyến xe:</span>
            <span className="font-black text-amber-400 font-mono text-base">{booking.id}</span>
          </div>

          <div className="space-y-2 text-slate-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 text-xs block font-medium">Điểm đón:</span>
                <span className="font-bold text-white">{booking.pickupLocation}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 text-xs block font-medium">Điểm đến:</span>
                <span className="font-bold text-white">{booking.dropoffLocation}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#133863]">
              <div className="flex items-center gap-2 font-medium">
                <Car className="w-4 h-4 text-amber-400" />
                <span>{getCarLabel(booking.carType)}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{booking.pickupTime}</span>
              </div>
            </div>

            {booking.estimatedPrice && (
              <div className="pt-2 border-t border-[#133863] flex justify-between items-center">
                <span className="text-slate-300 font-medium">Giá cước:</span>
                <span className="font-black text-amber-400 font-mono">{booking.estimatedPrice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2.5">
          <a
            href={`tel:${siteConfig.hotlineFormatted}`}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition"
          >
            <Phone className="w-4 h-4 animate-ring" />
            <span>Gọi tổng đài xác nhận: {siteConfig.hotline}</span>
          </a>

          <div className="flex gap-2">
            <button
              onClick={copyBookingInfo}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#0B2240] hover:bg-[#133863] text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition border border-[#133863] cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Đã sao chép!" : "Sao chép thông tin"}</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-[#0B2240] hover:bg-[#133863] text-slate-200 hover:text-white text-xs font-bold transition border border-[#133863] cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
