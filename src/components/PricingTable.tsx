"use client";

import { useState } from "react";
import { siteConfig } from "@/config/siteConfig";
import { Calculator, CheckCircle, HelpCircle, ArrowRight, Phone, Zap } from "lucide-react";

export default function PricingTable() {
  const [calcKm, setCalcKm] = useState<number>(30);
  const [calcCarType, setCalcCarType] = useState<string>("4-seats");
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);

  // Tính tiền tạm tính theo giá 20.000 VNĐ/km
  const calculateEstimatedCost = () => {
    let baseRate = 0;
    if (calcCarType === "4-seats") {
      if (calcKm <= 30) {
        baseRate = calcKm * 20000;
      } else if (calcKm <= 100) {
        baseRate = 30 * 20000 + (calcKm - 30) * 18000;
      } else {
        baseRate = 30 * 20000 + 70 * 18000 + (calcKm - 100) * 15000;
      }
    } else if (calcCarType === "7-seats") {
      if (calcKm <= 30) {
        baseRate = calcKm * 22000;
      } else if (calcKm <= 100) {
        baseRate = 30 * 22000 + (calcKm - 30) * 19000;
      } else {
        baseRate = 30 * 22000 + 70 * 19000 + (calcKm - 100) * 16000;
      }
    } else if (calcCarType === "16-seats") {
      if (calcKm <= 30) {
        baseRate = calcKm * 28000;
      } else {
        baseRate = 30 * 28000 + (calcKm - 30) * 24000;
      }
    } else {
      baseRate = calcKm * 35000;
    }

    if (isRoundTrip) {
      // Giảm giá 50% chiều về
      baseRate = baseRate + baseRate * 0.5;
    }

    return Math.round(baseRate / 10000) * 10000; // Làm tròn đến chục nghìn
  };

  return (
    <section id="bang-gia" className="py-20 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>BẢNG GIÁ NIÊM YẾT 20.000 VNĐ / KM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            BẢNG GIÁ CƯỚC TAXI QUẢNG TRỊ 24H
          </h2>
          <p className="text-slate-400 text-base">
            Giá cước chuẩn 20.000 VNĐ/km, ưu đãi giảm giá đặc biệt khi đi đường dài hoặc đặt xe khứ hồi 2 chiều.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {siteConfig.kmPricing.map((item, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between ${
                item.popular
                  ? "bg-slate-900 border-2 border-amber-500 shadow-2xl shadow-amber-500/15"
                  : "bg-slate-900/60 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {item.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow">
                  20.000 VNĐ / KM
                </div>
              )}

              <div>
                <div className="text-center pb-5 border-b border-slate-800">
                  <h3 className="text-xl font-black text-white">{item.carType}</h3>
                  <p className="text-xs text-slate-400 mt-1">{item.subTitle}</p>
                  <div className="mt-4">
                    <span className="text-2xl font-black text-amber-400">
                      {item.under30km}
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      (Giá cước niêm yết theo km)
                    </span>
                  </div>
                </div>

                {/* Pricing Details */}
                <div className="py-5 space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Giá cước chuẩn:</span>
                    <span className="font-bold text-white">{item.under30km}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Từ 31 - 100km:</span>
                    <span className="font-bold text-amber-400">{item.from31to100km}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Trên 100km:</span>
                    <span className="font-bold text-emerald-400">{item.over100km}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-1 rounded block text-center">
                      🎁 {item.roundTripDiscount}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href="#dat-xe"
                className={`w-full py-2.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider transition ${
                  item.popular
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
                    : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
              >
                Đặt xe ngay
              </a>
            </div>
          ))}
        </div>

        {/* Interactive Fare Calculator Tool */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Zap className="w-5 h-5" />
                <span>CÔNG CỤ TÍNH CƯỚC TAXI QUẢNG TRỊ 24H</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Ước tính giá cước theo quãng đường của bạn
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Kéo thanh trượt hoặc chọn dòng xe để xem ước tính chi phí cho chuyến đi của bạn.
              </p>

              {/* Sliders and selects */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-300">
                    <span>Quãng đường ước tính:</span>
                    <span className="text-amber-400 text-sm font-bold">{calcKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="300"
                    step="5"
                    value={calcKm}
                    onChange={(e) => setCalcKm(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>5 km</span>
                    <span>100 km</span>
                    <span>200 km</span>
                    <span>300 km</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Loại xe:</label>
                    <select
                      value={calcCarType}
                      onChange={(e) => setCalcCarType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="4-seats">Xe 4 chỗ (20.000đ/km)</option>
                      <option value="7-seats">Xe 7 chỗ (22.000đ/km)</option>
                      <option value="16-seats">Xe 16 chỗ</option>
                      <option value="vip-limousine">VIP Limousine</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Loại chuyến:</label>
                    <select
                      value={isRoundTrip ? "round" : "one"}
                      onChange={(e) => setIsRoundTrip(e.target.value === "round")}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="one">Đi 1 chiều</option>
                      <option value="round">Đi 2 chiều (Giảm 50% về)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated Result Box */}
            <div className="w-full md:w-72 bg-slate-950 border border-amber-500/40 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <div className="text-xs text-slate-400 font-medium">Chi phí tạm tính:</div>
              <div className="text-3xl font-black text-amber-400 tracking-tight">
                {calculateEstimatedCost().toLocaleString("vi-VN")} <span className="text-sm font-semibold">VNĐ</span>
              </div>
              <div className="text-[11px] text-emerald-400 bg-emerald-950/60 py-1 px-2 rounded-md border border-emerald-800">
                ✓ Báo giá chuẩn 20.000đ/km
              </div>
              <a
                href="#dat-xe"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <span>Đặt Xe Ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
