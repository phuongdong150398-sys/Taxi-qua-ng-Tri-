import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import {
  getAllTravelGuides,
  getAllTravelGuidesAsync,
  getTravelGuideBySlugAsync,
} from "@/lib/travelGuidesService";
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
  CheckCircle2,
  Calendar,
  DollarSign,
  HelpCircle,
  Share2,
  ChevronRight,
  Route,
  Compass,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const guides = await getAllTravelGuidesAsync();
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getTravelGuideBySlugAsync(slug);

  if (!guide) {
    return {
      title: "Bài Viết Không Tồn Tại | Taxi Quảng Trị 24H",
      description: "Không tìm thấy cẩm nang du lịch bạn đang tìm kiếm.",
    };
  }

  const canonicalUrl = `https://taxiquangtri.com.vn/cam-nang-du-lich/${guide.slug}`;

  return {
    title: `${guide.metaTitle} | Taxi 24H`,
    description: guide.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      guide.destination,
      `du lịch ${guide.destination}`,
      `taxi đi ${guide.destination}`,
      `giá vé ${guide.destination}`,
      `kinh nghiệm đi ${guide.destination}`,
      "taxi quảng bình",
      "taxi đồng hới",
      "thuê xe du lịch quảng bình",
    ],
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: canonicalUrl,
      type: "article",
      publishedTime: guide.publishedDate,
      authors: [guide.author],
      siteName: siteConfig.name,
      images: [
        {
          url: guide.coverImage,
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: [guide.coverImage],
    },
  };
}

export default async function TravelGuideDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const guide = await getTravelGuideBySlugAsync(slug);

  if (!guide) {
    notFound();
  }

  const allGuides = await getAllTravelGuidesAsync();
  // Lọc các bài viết liên quan
  const relatedGuides = allGuides.filter((g) => g.slug !== guide.slug).slice(0, 3);

  // Schema JSON-LD cho Google Rich Snippets
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    image: guide.coverImage,
    datePublished: guide.publishedDate,
    dateModified: guide.publishedDate,
    author: {
      "@type": "Person",
      name: guide.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: "https://taxiquangtri.com.vn",
      logo: {
        "@type": "ImageObject",
        url: "https://taxiquangtri.com.vn/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://taxiquangtri.com.vn/cam-nang-du-lich/${guide.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "https://taxiquangtri.com.vn",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cẩm nang du lịch",
        item: "https://taxiquangtri.com.vn/cam-nang-du-lich",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.destination,
        item: `https://taxiquangtri.com.vn/cam-nang-du-lich/${guide.slug}`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#040E1C] text-slate-100 selection:bg-amber-400 selection:text-[#040E1C] overflow-x-hidden">
      {/* Google SEO JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {guide.faqs && guide.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Navigation */}
      <Navbar />

      {/* Breadcrumbs & Header */}
      <div className="pt-28 lg:pt-36 bg-gradient-to-b from-[#07172C] via-[#0B2240]/60 to-[#040E1C] border-b border-[#133863]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
            <Link href="/" className="hover:text-amber-400 transition">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <Link href="/cam-nang-du-lich" className="hover:text-amber-400 transition">
              Cẩm nang du lịch
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-amber-400 font-bold truncate max-w-xs sm:max-w-md">
              {guide.destination}
            </span>
          </nav>

          {/* Meta Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="px-3 py-1 rounded-xl bg-amber-500 text-[#040E1C] text-xs font-black shadow-md flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {guide.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-[#0B2240] px-3 py-1 rounded-xl border border-[#133863]">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{guide.rating.toFixed(1)} / 5</span>
              <span className="text-slate-400">({guide.reviewsCount} đánh giá)</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-300 bg-[#0B2240] px-3 py-1 rounded-xl border border-[#133863]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{guide.readTime}</span>
            </div>
          </div>

          {/* Article Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight uppercase">
            {guide.title}
          </h1>

          {/* Author & Date info */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400 border-t border-[#133863]/80 pt-4">
            <span className="font-semibold text-slate-300">✍️ {guide.author}</span>
            <span>•</span>
            <span>📅 Cập nhật mới nhất 2026</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">✓ Đã kiểm chứng giá vé & lộ trình</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Body (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Featured Image */}
            <div className="relative rounded-3xl overflow-hidden border border-[#133863] shadow-2xl">
              <img
                src={guide.coverImage}
                alt={guide.title}
                className="w-full h-72 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040E1C]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-200 bg-[#07172C]/90 backdrop-blur-sm p-3 rounded-2xl border border-[#133863]">
                📍 <strong>{guide.destination}</strong> - Thắng cảnh du lịch nổi bật tại Quảng Bình.
              </div>
            </div>

            {/* Excerpt Lead Paragraph */}
            <div className="p-5 rounded-3xl bg-[#07172C] border-l-4 border-amber-400 border-y border-r border-[#133863] text-slate-200 text-sm sm:text-base leading-relaxed font-medium italic">
              &ldquo;{guide.excerpt}&rdquo;
            </div>

            {/* Highlights Box */}
            <div className="bg-gradient-to-br from-[#0B2240] to-[#07172C] p-6 rounded-3xl border border-amber-500/40 shadow-xl space-y-3">
              <h3 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>ĐIỂM NỔI BẬT KHÔNG THỂ BỎ LỠ</span>
              </h3>
              <ul className="space-y-2.5">
                {guide.highlights.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* In-Article Booking Card (High Conversion CTA) */}
            <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-6 text-[#040E1C] shadow-2xl shadow-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase bg-[#040E1C] text-amber-400 px-3 py-1 rounded-full">
                  ⚡ TAXI TOUR TRỌN GÓI 24/7
                </span>
                <span className="text-xs font-black text-[#040E1C]">
                  Đón tận nơi sau 5 phút
                </span>
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-black uppercase leading-snug">
                  Đặt Taxi Đưa Đón Đi {guide.destination} Giá Rẻ
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#040E1C]/90 mt-1">
                  Khoảng cách: <strong>{guide.distanceFromDongHoi}</strong>. Xe đời mới đón tận nơi tại TP. Đồng Hới hoặc ga, sân bay.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#040E1C]/10 p-3 rounded-2xl text-xs font-bold">
                <div>
                  <span className="block text-[#040E1C]/70">Xe 4-5 chỗ:</span>
                  <span className="text-sm font-black font-mono">{guide.taxiFare4Seats}</span>
                </div>
                <div>
                  <span className="block text-[#040E1C]/70">Xe 6-7 chỗ:</span>
                  <span className="text-sm font-black font-mono">{guide.taxiFare6Seats}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Link
                  href={`/?to=${encodeURIComponent(guide.destination)}#dat-xe`}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#040E1C] hover:bg-[#0B2240] text-amber-400 font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-lg hover:scale-105"
                >
                  <Car className="w-4 h-4" />
                  <span>ĐẶT XE ĐI {guide.destination.toUpperCase()} NGAY</span>
                </Link>

                <a
                  href={`tel:${siteConfig.hotlineFormatted}`}
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm transition shadow-lg hover:scale-105"
                >
                  <Phone className="w-4 h-4 animate-ring" />
                  <span>{siteConfig.hotline}</span>
                </a>
              </div>
            </div>

            {/* Article Content Sections */}
            <div className="space-y-8 pt-4">
              {guide.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-white border-b border-[#133863] pb-2 text-amber-300">
                    {section.heading}
                  </h2>

                  <div className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                    {section.content}
                  </div>

                  {/* Section In-line Image */}
                  {section.image && (
                    <div className="my-5 rounded-3xl overflow-hidden border border-[#133863] shadow-xl bg-[#07172C] group">
                      <div className="overflow-hidden">
                        <img
                          src={section.image}
                          alt={section.imageCaption || section.heading}
                          className="w-full h-64 sm:h-80 md:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      {section.imageCaption && (
                        <div className="p-3 text-center text-xs text-slate-300 bg-[#07172C] border-t border-[#133863] flex items-center justify-center gap-1.5 italic font-medium">
                          <span>📸</span>
                          <span>{section.imageCaption}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {section.tips && section.tips.length > 0 && (
                    <div className="bg-[#07172C] p-4 sm:p-5 rounded-2xl border border-emerald-500/40 space-y-2 mt-3">
                      <div className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Mẹo Hữu Ích Từ Bác Tài Bản Địa:</span>
                      </div>
                      <ul className="space-y-1.5">
                        {section.tips.map((tip, tIdx) => (
                          <li key={tIdx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Photo Gallery Showcase */}
            {guide.gallery && guide.gallery.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-[#133863]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>GÓC NHÌN ĐẶC SẮC</span>
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Bộ Sưu Tập Hình Ảnh Về {guide.destination}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold bg-[#07172C] px-3 py-1.5 rounded-full border border-[#133863]">
                    {guide.gallery.length} góc chụp đẹp
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {guide.gallery.map((img, gIdx) => (
                    <div
                      key={gIdx}
                      className="group relative rounded-2xl overflow-hidden border border-[#133863] bg-[#07172C] shadow-lg flex flex-col"
                    >
                      <div className="h-48 sm:h-56 overflow-hidden">
                        <img
                          src={img.url}
                          alt={img.caption || `${guide.destination} hình ảnh ${gIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          loading="lazy"
                        />
                      </div>
                      {img.caption && (
                        <div className="p-3 text-xs text-slate-300 font-medium bg-[#07172C] border-t border-[#133863]">
                          📸 {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs Accordion Section */}
            {guide.faqs && guide.faqs.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-[#133863]">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <span>CÂU HỎI THƯỜNG GẶP VỀ {guide.destination.toUpperCase()}</span>
                </h3>

                <div className="space-y-3">
                  {guide.faqs.map((faq, fIdx) => (
                    <div
                      key={fIdx}
                      className="bg-[#07172C] p-4 sm:p-5 rounded-2xl border border-[#133863] space-y-2"
                    >
                      <h4 className="text-sm sm:text-base font-bold text-amber-400 flex items-start gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          Hỏi
                        </span>
                        <span>{faq.question}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-8">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Author Box */}
            <div className="bg-[#07172C] p-5 rounded-3xl border border-[#133863] flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl flex-shrink-0">
                🚕
              </div>
              <div className="space-y-1">
                <div className="text-xs text-amber-400 font-black uppercase">Đội Ngũ Biên Tập</div>
                <div className="text-sm font-bold text-white">{guide.author}</div>
                <p className="text-xs text-slate-400">
                  Cung cấp dịch vụ taxi đưa đón tham quan du lịch, công tác, sân bay và đi tỉnh trọn gói uy tín hàng đầu tại Quảng Trị & Quảng Bình.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Quick Trip Details Card */}
            <div className="sticky top-28 bg-[#07172C] p-6 rounded-3xl border border-amber-500/40 shadow-2xl space-y-5">
              <div className="border-b border-[#133863] pb-3">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
                  Thông Tin Tuyến Đường
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Đồng Hới ⇄ {guide.destination}
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Khoảng cách:</span>
                    <span className="text-slate-200 font-bold">{guide.distanceFromDongHoi}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <DollarSign className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Cước Taxi 4 chỗ:</span>
                    <span className="text-amber-400 font-black font-mono text-sm">
                      {guide.taxiFare4Seats}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <DollarSign className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Cước Taxi 7 chỗ:</span>
                    <span className="text-amber-300 font-black font-mono text-sm">
                      {guide.taxiFare6Seats}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Mùa lý tưởng:</span>
                    <span className="text-slate-200 font-medium">{guide.bestTimeToVisit}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-[#133863]">
                <Link
                  href={`/?to=${encodeURIComponent(guide.destination)}#dat-xe`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-xs uppercase tracking-wider transition shadow-xl hover:scale-105"
                >
                  <Car className="w-4 h-4" />
                  <span>ĐẶT XE TRỰC TUYẾN</span>
                </Link>

                <a
                  href={`tel:${siteConfig.hotlineFormatted}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-xs transition shadow-md hover:scale-105"
                >
                  <Phone className="w-4 h-4 animate-ring" />
                  <span>HOTLINE: {siteConfig.hotline}</span>
                </a>

                <a
                  href={siteConfig.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#0068FF] text-white font-bold text-xs transition shadow-md hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat Zalo: {siteConfig.zalo}</span>
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedGuides.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#133863]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Compass className="w-6 h-6 text-amber-400" />
                <span>CÁC ĐIỂM DU LỊCH NỔI TIẾNG KHÁC</span>
              </h3>
              <Link
                href="/cam-nang-du-lich"
                className="text-xs text-amber-400 hover:underline font-bold"
              >
                Xem tất cả cẩm nang →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedGuides.map((rel) => (
                <div
                  key={rel.slug}
                  className="bg-[#07172C] rounded-3xl border border-[#133863] overflow-hidden hover:border-amber-400 transition flex flex-col justify-between p-5 space-y-4 shadow-xl"
                >
                  <div className="space-y-3">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-40 object-cover rounded-2xl"
                      loading="lazy"
                    />
                    <span className="text-[10px] font-bold text-amber-400 uppercase bg-[#0B2240] px-2.5 py-1 rounded-lg border border-[#133863] inline-block">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>

                  <Link
                    href={`/cam-nang-du-lich/${rel.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
                  >
                    <span>Khám phá ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating Widgets */}
      <FloatingWidgets />
    </main>
  );
}
