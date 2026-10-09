import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { getAllTravelGuides } from "@/lib/travelGuidesService";
import { siteConfig } from "@/config/siteConfig";
import {
  MapPin,
  Clock,
  Star,
  Sparkles,
  ArrowRight,
  Car,
  ShieldCheck,
  Phone,
  MessageCircle,
  Tag,
  Compass,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Cẩm Nang Du Lịch Quảng Bình 2026 - Bảng Giá Thuê Xe Taxi Tham Quan Đón Tận Nơi",
  description:
    "Tổng hợp kinh nghiệm du lịch Quảng Bình: Động Phong Nha, Động Thiên Đường, Suối Moọc, Hang Tối, Hava, Ozo, Vũng Chùa Đảo Yến, Đá Nhảy. Dịch vụ taxi du lịch trọn gói đưa đón tận nơi giá rẻ 24/7.",
  alternates: {
    canonical: "https://taxiquangtri.com.vn/cam-nang-du-lich",
  },
  openGraph: {
    title: "Cẩm Nang Du Lịch Quảng Bình 2026 - Thuê Xe Taxi Trọn Gói Giá Rẻ",
    description:
      "Kinh nghiệm khám phá Động Phong Nha, Thiên Đường, Suối Moọc, Hava, Ozo, Vũng Chùa. Dịch vụ xe đưa đón khách sạn, sân bay Đồng Hới chu đáo 24/7.",
    url: "https://taxiquangtri.com.vn/cam-nang-du-lich",
    type: "website",
    siteName: siteConfig.name,
    images: [
      {
        url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Cẩm nang du lịch Quảng Bình",
      },
    ],
  },
};

export default function TravelGuideHubPage() {
  const travelGuides = getAllTravelGuides();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Cẩm Nang Du Lịch Quảng Bình & Dịch Vụ Taxi Tour Trọn Gói",
    description:
      "Cẩm nang kinh nghiệm du lịch, giá vé và dịch vụ thuê xe taxi đưa đón tham quan các danh lam thắng cảnh tại Quảng Bình.",
    url: "https://taxiquangtri.com.vn/cam-nang-du-lich",
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: "https://taxiquangtri.com.vn",
      logo: "https://taxiquangtri.com.vn/logo.png",
      telephone: siteConfig.hotline,
    },
    hasPart: travelGuides.map((guide) => ({
      "@type": "Article",
      headline: guide.title,
      description: guide.excerpt,
      url: `https://taxiquangtri.com.vn/cam-nang-du-lich/${guide.slug}`,
      image: guide.coverImage,
      datePublished: guide.publishedDate,
      author: {
        "@type": "Person",
        name: guide.author,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#040E1C] text-slate-100 selection:bg-amber-400 selection:text-[#040E1C] overflow-x-hidden">
      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-gradient-to-b from-[#07172C] via-[#0B2240] to-[#040E1C] border-b border-[#133863]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Breadcrumb */}
          <nav className="flex justify-center items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
            <Link href="/" className="hover:text-amber-400 transition">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-amber-400 font-bold">Cẩm nang du lịch Quảng Bình</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs sm:text-sm font-black mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>VƯƠNG QUỐC HANG ĐỘNG & DANH THẮNG NỔI TIẾNG 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight max-w-4xl mx-auto">
            CẨM NANG DU LỊCH <span className="text-amber-400">QUẢNG BÌNH</span>
            <br />
            <span className="text-xl sm:text-2xl md:text-3xl text-slate-200 normal-case font-bold mt-2 block">
              Kinh Nghiệm Tham Quan, Giá Vé & Dịch Vụ Thuê Xe Taxi Trọn Gói
            </span>
          </h1>

          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Tổng hợp cẩm nang chi tiết từ người bản xứ: giá vé thắng cảnh, mẹo vui chơi, lịch trình 1 ngày tối ưu và bảng giá thuê xe taxi 4 - 7 chỗ đưa đón tận nơi giá rẻ, an toàn.
          </p>

          {/* Quick CTA buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/#dat-xe"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-105 transition"
            >
              <Car className="w-4 h-4" />
              <span>ĐẶT XE TAXI DU LỊCH NGAY</span>
            </Link>

            <a
              href={`tel:${siteConfig.hotlineFormatted}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-sm shadow-lg shadow-red-600/30 hover:scale-105 transition"
            >
              <Phone className="w-4 h-4 animate-ring" />
              <span>TỔNG ĐÀI: {siteConfig.hotline}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Articles Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-[#133863]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-amber-400" />
              <span>CÁC ĐỊA ĐIỂM DU LỊCH HÀNG ĐẦU TẠI QUẢNG BÌNH</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Khám phá trọn bộ cẩm nang & đặt xe đưa đón nhanh sau 5 - 10 phút
            </p>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-xl bg-[#0B2240] border border-[#133863] text-amber-400 text-xs font-bold">
            {travelGuides.length} bài viết hướng dẫn
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {travelGuides.map((guide) => (
            <article
              key={guide.slug}
              className="bg-[#07172C] rounded-3xl border border-[#133863] hover:border-amber-400/60 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col group"
            >
              {/* Cover Image */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-900">
                <img
                  src={guide.coverImage}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07172C] via-transparent to-black/30" />
                
                {/* Category Badge */}
                <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-xl bg-amber-500 text-[#040E1C] text-xs font-black shadow-md flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {guide.category}
                </span>

                {/* Star Rating Badge */}
                <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-xl bg-[#040E1C]/85 backdrop-blur-sm text-amber-400 text-xs font-black border border-[#133863] flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{guide.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({guide.reviewsCount})
                  </span>
                </div>

                {/* Distance Badge */}
                <div className="absolute bottom-3 left-3.5 flex items-center gap-1 text-xs text-slate-200 font-bold bg-[#040E1C]/90 px-2.5 py-1 rounded-lg border border-[#133863]">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Cách Đồng Hới: {guide.distanceFromDongHoi.split("(")[0]}</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {guide.readTime}
                    </span>
                    <span>•</span>
                    <span>Cập nhật 2026</span>
                  </div>

                  <Link href={`/cam-nang-du-lich/${guide.slug}`}>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {guide.title}
                    </h3>
                  </Link>

                  <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {guide.excerpt}
                  </p>
                </div>

                {/* Price & Fare Info Box */}
                <div className="bg-[#0B2240] p-3 rounded-2xl border border-[#133863] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Taxi 4 chỗ từ Đồng Hới:</span>
                    <span className="font-black text-amber-400 font-mono">
                      {guide.taxiFare4Seats}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Taxi 7 chỗ từ Đồng Hới:</span>
                    <span className="font-black text-amber-300 font-mono">
                      {guide.taxiFare6Seats}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#133863]/60">
                  <Link
                    href={`/cam-nang-du-lich/${guide.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0B2240] hover:bg-[#133863] text-slate-200 hover:text-white text-xs font-bold border border-[#133863] transition"
                  >
                    <span>Xem Cẩm Nang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/?to=${encodeURIComponent(guide.destination)}#dat-xe`}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] text-xs font-black shadow-md transition hover:scale-105"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Đặt Taxi Đi Ngay</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why Choose Taxi 24H for Tourism */}
      <section className="py-16 bg-[#07172C] border-y border-[#133863]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/30">
              Dịch Vụ Taxi Tour Chuyên Nghiệp
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 uppercase">
              Vì Sao Nên Thuê Xe Taxi Tour Cùng Taxi Quảng Trị 24H?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Chúng tôi mang đến chuyến đi an toàn, thoải mái và trọn vẹn nhất cho bạn và gia đình
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#040E1C] p-6 rounded-3xl border border-[#133863] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xl">
                🚗
              </div>
              <h3 className="text-base font-bold text-white">Xe Mới Đời 2022 - 2025</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Đội xe VinFast điện hiện đại (VF5, VF6, VF7, VF8) và các dòng Sedan, MPV rộng rãi, máy lạnh mát sâu, không mùi say xe.
              </p>
            </div>

            <div className="bg-[#040E1C] p-6 rounded-3xl border border-[#133863] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold text-xl">
                👨‍✈️
              </div>
              <h3 className="text-base font-bold text-white">Tài Xế Bản Địa Am Hiểu</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Lái xe cẩn thận, niềm nở, sẵn sàng tư vấn điểm chụp ảnh đẹp, quán ăn ngon bổ rẻ và mua vé tham quan không phải chờ đợi.
              </p>
            </div>

            <div className="bg-[#040E1C] p-6 rounded-3xl border border-[#133863] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold text-xl">
                💰
              </div>
              <h3 className="text-base font-bold text-white">Giá Niêm Yết Trọn Gói</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Báo giá trọn gói 1 chiều / khứ hồi rõ ràng trước khi đi, cam kết không phát sinh bất kỳ phụ phí nào.
              </p>
            </div>

            <div className="bg-[#040E1C] p-6 rounded-3xl border border-[#133863] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-400/30 flex items-center justify-center text-red-400 font-bold text-xl">
                ⚡
              </div>
              <h3 className="text-base font-bold text-white">Đón Tận Nơi Sau 5 Phút</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Phục vụ 24/7 đón tại sảnh khách sạn, sân bay Đồng Hới, ga tàu Đồng Hới và mọi ngóc ngách toàn tỉnh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Booking Call to Action */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-8 sm:p-12 text-[#040E1C] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-amber-500/20">
          <div className="space-y-3 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-wider bg-[#040E1C] text-amber-400 px-3.5 py-1 rounded-full">
              ⚡ Đón Nhanh 24/7 Toàn Tỉnh
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Bạn Đã Sẵn Sàng Khám Phá Quảng Bình?
            </h2>
            <p className="text-sm font-semibold max-w-xl text-[#040E1C]/80">
              Đặt xe ngay hôm nay để nhận ưu đãi giảm giá chiều về tới 50% và tài xế riêng phục vụ suốt hành trình!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/#dat-xe"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#040E1C] hover:bg-[#0B2240] text-amber-400 font-black text-sm uppercase tracking-wider transition shadow-xl hover:scale-105"
            >
              <Car className="w-5 h-5" />
              <span>ĐẶT XE TRỰC TUYẾN</span>
            </Link>

            <a
              href={`tel:${siteConfig.hotlineFormatted}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider transition shadow-xl hover:scale-105"
            >
              <Phone className="w-5 h-5 animate-ring" />
              <span>GỌI {siteConfig.hotline}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Widgets */}
      <FloatingWidgets />
    </main>
  );
}
