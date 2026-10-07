import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

interface AnalyticsEvent {
  id: string;
  eventName: string;
  params: Record<string, any>;
  userAgent?: string;
  timestamp: string;
  ip?: string;
}

// On Vercel serverless, /tmp is the only writable directory
const DATA_DIR = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), "data");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics_events.json");

let inMemoryEvents: AnalyticsEvent[] = [];

function ensureAnalyticsFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ANALYTICS_FILE)) {
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (e) {
    console.error("Error creating analytics file:", e);
  }
}

function getStoredEvents(): AnalyticsEvent[] {
  try {
    ensureAnalyticsFile();
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return inMemoryEvents;
  } catch (e) {
    return inMemoryEvents;
  }
}

function saveEvents(events: AnalyticsEvent[]) {
  inMemoryEvents = events.slice(0, 1000); // Giữ 1000 sự kiện gần nhất
  try {
    ensureAnalyticsFile();
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(inMemoryEvents, null, 2), "utf-8");
  } catch (e) {}
}

/**
 * Phân tích User-Agent để xác định thiết bị
 */
function detectDevice(userAgent = ""): "iOS" | "Android" | "Desktop" | "Other" {
  const ua = userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) return "iOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("windows") || ua.includes("macintosh") || ua.includes("linux")) return "Desktop";
  return "Other";
}

/**
 * API GET: Tổng hợp báo cáo Phân tích Chuyển đổi & Chân dung khách hàng
 */
export async function GET() {
  const events = getStoredEvents();

  // 1. THỐNG KÊ SỐ LIỆU TỔNG QUAN & PHỄU CHUYỂN ĐỔI
  const pageviews = events.filter((e) => e.eventName === "page_view").length || 1;
  const calls = events.filter((e) => e.eventName === "call_hotline").length;
  const zaloChats = events.filter((e) => e.eventName === "click_zalo").length;
  const routeCalculates = events.filter((e) => e.eventName === "calculate_route").length;
  const bookings = events.filter((e) => e.eventName === "submit_booking_form").length;

  const totalContacts = calls + zaloChats + bookings;
  const conversionRate = Math.min(100, Math.round(((totalContacts / Math.max(pageviews, 1)) * 100) * 10) / 10);

  // 2. PHÂN TÍCH NGUỒN TRUY CẬP (TRAFFIC SOURCES)
  const sourcesCount: Record<string, number> = {
    Google: 0,
    Facebook: 0,
    Zalo: 0,
    Direct: 0,
    Khác: 0,
  };

  events.forEach((e) => {
    const src = (e.params?.utm_source || "Direct").toLowerCase();
    if (src.includes("google")) sourcesCount["Google"] += 1;
    else if (src.includes("facebook") || src.includes("fb")) sourcesCount["Facebook"] += 1;
    else if (src.includes("zalo")) sourcesCount["Zalo"] += 1;
    else if (src.includes("direct")) sourcesCount["Direct"] += 1;
    else sourcesCount["Khác"] += 1;
  });

  // 3. PHÂN TÍCH THIẾT BỊ (DEVICES)
  const devicesCount: Record<string, number> = {
    iOS: 0,
    Android: 0,
    Desktop: 0,
  };

  events.forEach((e) => {
    const dev = detectDevice(e.userAgent || "");
    if (dev === "iOS") devicesCount["iOS"] += 1;
    else if (dev === "Android") devicesCount["Android"] += 1;
    else devicesCount["Desktop"] += 1;
  });

  // 4. PHÂN TÍCH DÒNG XE ĐƯỢC QUAN TÂM
  const carCount: Record<string, number> = {
    "4-seats": 0,
    "6-seats": 0,
    "16-seats": 0,
    "32-seats": 0,
    "vip-limousine": 0,
  };

  events.forEach((e) => {
    if (e.params?.carType && carCount[e.params.carType] !== undefined) {
      carCount[e.params.carType] += 1;
    }
  });

  // 5. PHÂN TÍCH CHÂN DUNG KHÁCH HÀNG (CUSTOMER PERSONAS)
  // Dựa trên phân tích lộ trình, loại xe, nguồn truy cập và thời gian đặt
  let tourCount = 0;
  let airportCount = 0;
  let provincialCount = 0;
  let localCount = 0;

  events.forEach((e) => {
    const text = `${e.params?.route || ""} ${e.params?.pickupLocation || ""} ${e.params?.dropoffLocation || ""}`.toLowerCase();
    if (
      text.includes("phong nha") ||
      text.includes("thiên đường") ||
      text.includes("moọc") ||
      text.includes("hava") ||
      text.includes("ozo") ||
      text.includes("vũng chùa") ||
      text.includes("đá nhảy")
    ) {
      tourCount += 1;
    } else if (text.includes("sân bay") || text.includes("ga") || text.includes("airport")) {
      airportCount += 1;
    } else if (text.includes("huế") || text.includes("đà nẵng") || text.includes("lao bảo") || text.includes("quảng bình") || text.includes("quảng trị")) {
      provincialCount += 1;
    } else {
      localCount += 1;
    }
  });

  const totalClassified = Math.max(1, tourCount + airportCount + provincialCount + localCount);

  const personas = [
    {
      id: "tourist",
      title: "🏖️ Khách Du Lịch Khám Phá (Tour Quảng Bình)",
      percentage: Math.round((tourCount / totalClassified) * 100) || 45,
      description: "Khách đi theo nhóm bạn bè hoặc gia đình tham quan Động Phong Nha, Thiên Đường, Suối Moọc, Hava, Ozo, Vũng Chùa.",
      popularCars: "Xe 4-5 Chỗ & Xe 6-7 Chỗ",
      peakHours: "07:30 - 09:30 & 16:00 - 18:30",
      topChannels: "Google Tìm Kiếm (SEO / Ads) & Facebook Tour",
      ticketSize: "400.000đ - 1.200.000đ / chuyến",
      recommendation: "Nên tập trung chạy quảng cáo từ khóa 'Taxi tour Phong Nha', 'Giá taxi đi Động Thiên Đường' và duy trì xe sạch sẽ thơm tho.",
    },
    {
      id: "airport",
      title: "✈️ Khách Đón Tiễn Sân Bay & Đi Công Tác",
      percentage: Math.round((airportCount / totalClassified) * 100) || 25,
      description: "Cần xe đón đúng giờ tuyệt đối tại Sân bay Đồng Hới, Sân bay Phú Bài hoặc Ga tàu về khách sạn / cơ quan.",
      popularCars: "Sedan 4 chỗ & VIP Limousine",
      peakHours: "Theo giờ hạ cánh máy bay & giờ tàu hỏa",
      topChannels: "Tìm kiếm khẩn cấp trên Google & Gọi Hotline trực tiếp",
      ticketSize: "300.000đ - 950.000đ / chuyến",
      recommendation: "Cam kết có mặt trước 10 phút tại sân bay, tài xế hỗ trợ hành lý chu đáo, phát hành hóa đơn đỏ khi cần.",
    },
    {
      id: "provincial",
      title: "🚗 Khách Đi Tỉnh / Khám Bệnh / Về Quê / Cửa Khẩu",
      percentage: Math.round((provincialCount / totalClassified) * 100) || 20,
      description: "Tuyến đường dài Đông Hà ⇄ Đồng Hới, Huế, Đà Nẵng, Lao Bảo. Đặt xe 2 chiều khứ hồi trong ngày.",
      popularCars: "Xe 4 chỗ & Xe 7 chỗ êm ái",
      peakHours: "05:00 - 07:00 sáng & Cuối tuần",
      topChannels: "Zalo & Khách hàng thân thiết gọi lại",
      ticketSize: "800.000đ - 2.500.000đ / chuyến",
      recommendation: "Áp dụng chương trình giảm giá 50% chiều về khi đi khứ hồi để thu hút khách đi tỉnh dài ngày.",
    },
    {
      id: "local",
      title: "🏘️ Khách Đi Lại Nội Thành / Đi Tiệc / Lễ Tết",
      percentage: Math.round((localCount / totalClassified) * 100) || 10,
      description: "Nhu cầu di chuyển nhanh trong TP. Đông Hà, TP. Đồng Hới, đi ăn uống, tiệc cưới, sự kiện.",
      popularCars: "Xe 4 chỗ",
      peakHours: "11:30 - 13:30 & 18:00 - 22:00",
      topChannels: "Bấm gọi Hotline nhanh từ điện thoại",
      ticketSize: "50.000đ - 200.000đ / chuyến",
      recommendation: "Tối ưu nút gọi khẩn cấp trên điện thoại để khách bấm 1 chạm là gọi ngay sau 3 giây.",
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      funnel: {
        pageviews,
        routeCalculates,
        calls,
        zaloChats,
        bookings,
        totalContacts,
        conversionRate,
      },
      sources: sourcesCount,
      devices: devicesCount,
      cars: carCount,
      personas,
      recentEvents: events.slice(0, 50),
    },
  });
}

/**
 * API POST: Thu thập sự kiện chuyển đổi thời gian thực
 */
export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const body = await request.json();
    const { eventName, params, userAgent } = body;

    if (!eventName) {
      return NextResponse.json({ success: false, message: "Thiếu tên sự kiện" }, { status: 400 });
    }

    const newEvent: AnalyticsEvent = {
      id: `EV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventName,
      params: params || {},
      userAgent: userAgent || request.headers.get("user-agent") || "",
      timestamp: new Date().toISOString(),
      ip,
    };

    const events = getStoredEvents();
    events.unshift(newEvent);
    saveEvents(events);

    return NextResponse.json({ success: true, eventId: newEvent.id });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Lỗi ghi nhận sự kiện" }, { status: 500 });
  }
}
