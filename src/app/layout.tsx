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
  metadataBase: new URL("http://localhost:3000"),
  title: `${siteConfig.name} - Dịch Vụ Taxi Giá Rẻ 20.000đ/km, Đón Nhanh 24/7`,
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
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    title: `${siteConfig.name} - Đón Nhanh Sau 5 Phút`,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`scroll-smooth ${montserrat.variable}`}>
      <body className={`${montserrat.className} bg-[#040E1C] text-slate-100 antialiased selection:bg-amber-400 selection:text-[#040E1C]`}>
        {children}
      </body>
    </html>
  );
}
