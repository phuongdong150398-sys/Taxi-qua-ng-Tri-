import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/siteConfig";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-montserrat",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#07172C",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.taxiquangtri.com.vn"),
  title: "TAXI Quảng Trị 24H - Giá Rẻ Từ 12.000đ/km | Đón Nhanh Sau 5 Phút",
  description: siteConfig.description,
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  keywords: [
    "taxi quảng trị",
    "taxi đông hà",
    "taxi thị xã quảng trị",
    "taxi lao bảo",
    "taxi la vang",
    "taxi sân bay phú bài",
    "taxi sân bay đồng hới",
    "taxi quảng trị 24h",
    "đặt xe taxi quảng trị",
    "taxi giá rẻ quảng trị",
    "taxi đồng hới",
    "taxi phong nha",
    "taxi 12k km",
  ],
  verification: {
    google: "Wpdr4voiDswJPHNhkVnwSxjzzLKlPB_iGlRITgjjIJs",
  },
  openGraph: {
    title: "TAXI Quảng Trị 24H - Giá Rẻ Từ 12.000đ/km | Đón Nhanh 24/7",
    description: siteConfig.description,
    type: "website",
    locale: "vi_VN",
    siteName: siteConfig.name,
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 400,
        alt: siteConfig.name,
      },
    ],
  },
};

import AnalyticsScripts from "@/components/AnalyticsScripts";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TaxiService",
  name: "TAXI Quảng Trị 24H - Dịch Vụ Taxi Giá Rẻ Từ 12.000đ/km",
  url: "https://www.taxiquangtri.com.vn",
  logo: "https://www.taxiquangtri.com.vn/logo.png",
  image: "https://www.taxiquangtri.com.vn/logo.png",
  description: siteConfig.description,
  telephone: "0877.669.555",
  priceRange: "12.000đ/km - 15.000đ/km",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Đông Hà",
    addressRegion: "Quảng Trị",
    addressCountry: "VN",
  },
  areaServed: [
    "Quảng Trị",
    "Đông Hà",
    "Thị xã Quảng Trị",
    "Lao Bảo",
    "Quảng Bình",
    "Đồng Hới",
    "Phong Nha",
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`scroll-smooth ${montserrat.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${montserrat.className} bg-[#040E1C] text-slate-100 antialiased selection:bg-amber-400 selection:text-[#040E1C]`}>
        <AnalyticsScripts />
        {children}
      </body>
    </html>
  );
}
