import { NextResponse } from "next/server";
import { BookingRecord, BookingFormInput } from "@/types";
import { siteConfig } from "@/config/siteConfig";
import {
  checkIpRateLimit,
  checkPhoneCooldown,
  isValidVietnamesePhone,
  containsSpamContent,
  sanitizeInput,
} from "@/lib/security";
import { getFleetSettings, loadFleetStateFromTelegramCloud } from "@/lib/drivers";
import { getBookingsFromDb, saveBookingToDb, updateBookingInDb } from "@/lib/firebaseDb";
import { getAdminSessionFromRequest } from "@/lib/adminAuth";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// On Vercel serverless, /tmp is the only writable directory
const DATA_DIR = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

// In-memory cache for fast access
let inMemoryBookings: BookingRecord[] = [];

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (e) {
    console.error("Error creating data directory/file:", e);
  }
}

function getBookings(): BookingRecord[] {
  try {
    ensureDataFile();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return inMemoryBookings;
  } catch (error) {
    console.error("Error reading bookings file:", error);
    return inMemoryBookings;
  }
}

function saveBookings(bookings: BookingRecord[]) {
  inMemoryBookings = bookings;
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving bookings file:", error);
  }
}

function escapeHtml(text: string) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function calculateFareAndCommission(body: BookingFormInput) {
  let grossFare = 450000;
  if (body.estimatedPrice) {
    const numericStr = body.estimatedPrice.replace(/\D/g, "");
    const parsed = parseInt(numericStr, 10);
    if (!isNaN(parsed) && parsed >= 30000) {
      grossFare = parsed;
    }
  } else {
    // Ước lượng chuẩn theo dòng xe
    if (body.carType === "4-seats") grossFare = 350000;
    else if (body.carType === "6-seats") grossFare = 450000;
    else if (body.carType === "16-seats") grossFare = 900000;
    else if (body.carType === "32-seats") grossFare = 1600000;
    else if (body.carType === "vip-limousine") grossFare = 1200000;
    if (body.tripType === "round-trip") grossFare = Math.round(grossFare * 1.7);
  }

  const settings = getFleetSettings();
  const commissionRate = settings.commissionRate || 0.15; // 15%
  const commissionAmount = Math.round(grossFare * commissionRate);
  const driverNetEarning = grossFare - commissionAmount;

  return { grossFare, commissionRate, commissionAmount, driverNetEarning };
}

// Hàm gửi thông báo đơn đặt xe về Telegram (Nhóm Đội Xe & Chủ Xe)
async function sendTelegramNotification(booking: BookingRecord) {
  const token =
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
    "8888405865:AAG0tj-prAYFngu4qlcRYBtF2T_13xHZQo4";
  const ownerChatId =
    process.env.TELEGRAM_CHAT_ID ||
    process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ||
    "1499064181";

  if (!token) {
    console.log("Telegram token not configured.");
    return;
  }

  const settings = getFleetSettings();
  const driverGroupId = settings.telegramGroupId || process.env.TELEGRAM_GROUP_ID;

  const getCarLabel = (type: string) => {
    switch (type) {
      case "4-seats":
        return "🚗 Xe 4 - 5 Chỗ (Sedan)";
      case "6-seats":
        return "🚙 Xe 6 - 7 Chỗ (MPV/SUV)";
      case "16-seats":
        return "🚐 Xe 16 Chỗ Du Lịch";
      case "32-seats":
        return "🚌 Xe 32 Chỗ Đoàn Lớn";
      case "vip-limousine":
        return "👑 VIP Limousine 9 Chỗ";
      default:
        return type;
    }
  };

  const cleanPhone = (booking.phone || "").replace(/\D/g, "");
  const maskedPhone =
    cleanPhone.length >= 7
      ? cleanPhone.slice(0, 4) + "***" + cleanPhone.slice(-3)
      : "0988***456";
  const zaloUrl = cleanPhone ? `https://zalo.me/${cleanPhone}` : "https://zalo.me";

  const grossFareStr = (booking.grossFare || 450000).toLocaleString("vi-VN");
  const commissionStr = (booking.commissionAmount || 67500).toLocaleString("vi-VN");
  const netEarningStr = (booking.driverNetEarning || 382500).toLocaleString("vi-VN");

  // 1. NỘI DUNG GỬI VÀO NHÓM TELEGRAM TÀI XẾ (Ẩn SĐT khách, có nút nhận cuốc)
  const groupMessage = `
🚖 <b>ĐƠN TAXI MỚI CHỜ NHẬN - ${siteConfig.name.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Mã đơn:</b> <code>#${booking.id}</code>
📍 <b>Điểm đón:</b> <b>${escapeHtml(booking.pickupLocation)}</b>
🏁 <b>Điểm đến:</b> <b>${escapeHtml(booking.dropoffLocation)}</b>
🚘 <b>Loại xe:</b> ${getCarLabel(booking.carType)} • ${booking.tripType === "round-trip" ? "Khứ hồi 2 chiều" : "1 Chiều"}
⏰ <b>Thời gian đón:</b> ${booking.pickupTime} (Ngày ${booking.pickupDate})
━━━━━━━━━━━━━━━━━━━━
💰 <b>Tổng cước thu khách:</b> <b>${grossFareStr} VNĐ</b>
💵 <b>Phí chiết khấu (15% trừ ví):</b> <b>-${commissionStr} VNĐ</b>
👉 <b>BÁC TÀI THỰC NHẬN:</b> <b>+${netEarningStr} VNĐ</b>
📞 <b>SĐT Khách:</b> <code>${maskedPhone}</code> <i>(Bấm nút dưới để nhận SĐT & Zalo khách)</i>
${booking.notes ? `📝 <b>Ghi chú:</b> ${escapeHtml(booking.notes)}\n` : ""}━━━━━━━━━━━━━━━━━━━━
⚡ <i>Bác tài nào gần khu vực đón hãy bấm nút dưới đây để nhận chuyến ngay:</i>
`;

  // 2. NỘI DUNG GỬI CHO CHỦ XE / ADMIN (Đầy đủ SĐT, link gọi & admin)
  const ownerMessage = `
🚖 <b>ĐƠN ĐẶT TAXI MỚI - ${siteConfig.name.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Mã đơn:</b> <code>#${booking.id}</code>
👤 <b>Khách hàng:</b> <b>${escapeHtml(booking.fullName || "Khách đặt xe")}</b>
📞 <b>Số điện thoại:</b> <code>${booking.phone}</code> <i>(Chạm để sao chép / gọi)</i>
📍 <b>Điểm đón:</b> ${escapeHtml(booking.pickupLocation)}
🏁 <b>Điểm đến:</b> ${escapeHtml(booking.dropoffLocation)}
🚘 <b>Loại xe:</b> ${getCarLabel(booking.carType)}
🔄 <b>Loại chuyến:</b> ${booking.tripType === "round-trip" ? "Khứ hồi 2 chiều" : "1 chiều"}
⏰ <b>Thời gian đón:</b> ${booking.pickupTime} (Ngày ${booking.pickupDate})
💰 <b>Cước khách:</b> ${grossFareStr}đ | <b>Phí 15%:</b> ${commissionStr}đ | <b>Tài xế nhận:</b> ${netEarningStr}đ
${booking.notes ? `📝 <b>Ghi chú:</b> ${escapeHtml(booking.notes)}\n` : ""}━━━━━━━━━━━━━━━━━━━━
⚡ <i>Chạm vào số điện thoại hoặc bấm nút bên dưới:</i>
`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  // A. Gửi vào Nhóm Telegram Đội Tài Xế (nếu có cấu hình)
  if (driverGroupId) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: driverGroupId,
          text: groupMessage.trim(),
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚕 [ BẤM NHẬN CUỐC NÀY ]",
                  callback_data: `claim_${booking.id}`,
                },
              ],
            ],
          },
        }),
      });
      const data = await res.json();
      console.log(`[DISPATCH TO GROUP ${driverGroupId}]:`, data?.ok ? "SUCCESS" : data);
    } catch (err) {
      console.error("Error sending to driver group:", err);
    }
  } else {
    console.warn("[DISPATCH WARNING] No telegramGroupId configured in Fleet Settings. Trips cannot be sent to group yet.");
  }

  const mapPickupUrl = booking.pickupLat && booking.pickupLng
    ? `https://www.google.com/maps/dir/?api=1&destination=${booking.pickupLat},${booking.pickupLng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.pickupLocation)}`;

  // B. Gửi tin nhắn về Telegram của Chủ xe
  if (ownerChatId) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ownerChatId,
          text: ownerMessage.trim(),
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚕 Bấm Nhận Cuốc Này",
                  callback_data: `claim_${booking.id}`,
                },
              ],
              [
                { text: "🧭 Bản Đồ Điểm Đón", url: mapPickupUrl },
                { text: "💬 Nhắn Zalo Khách", url: zaloUrl },
              ],
              [
                { text: "📊 Xem Đơn / Quản Trị", url: "https://taxiquangtri.com.vn/admin" },
              ],
            ],
          },
        }),
      });
    } catch (err) {
      console.error("Error sending to owner Telegram:", err);
    }
  }
}

export async function GET(request: Request) {
  // BẢO MẬT: Bắt buộc phiên đăng nhập Admin mới được phép đọc danh sách đơn đặt xe
  if (!getAdminSessionFromRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Yêu cầu quyền Quản trị viên để xem danh sách đơn!" },
      { status: 401 }
    );
  }

  try {
    let bookings = await getBookingsFromDb();
    if (!bookings || bookings.length === 0) {
      bookings = getBookings(); // fallback to local file
    }
    return NextResponse.json({ success: true, data: bookings });
  } catch (e) {
    const bookings = getBookings();
    return NextResponse.json({ success: true, data: bookings });
  }
}

export async function POST(request: Request) {
  try {
    // 0. Tải cấu hình Đội xe & ID Nhóm mới nhất từ Telegram Cloud
    await loadFleetStateFromTelegramCloud();

    // 1. Thu thập IP client để Rate Limit
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "127.0.0.1";

    const body: BookingFormInput = await request.json();

    // 2. HONEYPOT CHECK (Bẫy Bot Spam)
    if (body.hp_website && body.hp_website.trim().length > 0) {
      console.warn(`[SPAM DETECTED] Honeypot triggered from IP: ${clientIp}`);
      return NextResponse.json({
        success: true,
        message: "Đặt xe thành công! Tổng đài sẽ gọi lại quý khách sau 1-3 phút.",
        booking: { id: `TX-${Date.now().toString().slice(-6)}` },
      });
    }

    // 3. SUBMISSION SPEED CHECK (Bot thường submit < 2 giây)
    if (body.submitTimestamp) {
      const timeElapsedMs = Date.now() - body.submitTimestamp;
      if (timeElapsedMs < 2000) {
        console.warn(`[SPAM DETECTED] Fast submit (${timeElapsedMs}ms) from IP: ${clientIp}`);
        return NextResponse.json(
          { success: false, message: "Thao tác quá nhanh. Vui lòng kiểm tra lại thông tin và gửi lại sau vài giây!" },
          { status: 429 }
        );
      }
    }

    // 4. IP RATE LIMIT CHECK (Tối đa 5 lượt / 10 phút / IP)
    const ipCheck = checkIpRateLimit(clientIp, 5, 10 * 60 * 1000);
    if (!ipCheck.allowed) {
      console.warn(`[RATE LIMIT EXCEEDED] IP: ${clientIp} exceeded booking limit.`);
      return NextResponse.json(
        {
          success: false,
          message: `Hệ thống ghi nhận nhiều yêu cầu từ bạn. Vui lòng gọi trực tiếp Hotline ${siteConfig.hotline} để đặt xe ngay!`,
        },
        { status: 429 }
      );
    }

    // 5. KIỂM TRA DỮ LIỆU BẮT BUỘC
    if (!body.phone || !body.pickupLocation || !body.dropoffLocation) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ Số điện thoại, Điểm đón và Điểm đến!" },
        { status: 400 }
      );
    }

    // 6. VALIDATE SỐ ĐIỆN THOẠI CHUẨN VIỆT NAM & CHẶN SỐ RÁC
    const phoneValidation = isValidVietnamesePhone(body.phone);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { success: false, message: phoneValidation.reason || "Số điện thoại không hợp lệ!" },
        { status: 400 }
      );
    }

    // 7. PHONE COOLDOWN (Chống 1 người/tool spam liên tục cùng 1 SĐT trong 40 giây)
    const phoneCooldown = checkPhoneCooldown(body.phone, 40 * 1000);
    if (!phoneCooldown.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Yêu cầu đặt xe của số điện thoại ${body.phone} đã được tiếp nhận. Tài xế sẽ gọi lại cho bạn ngay! (Vui lòng chờ ${phoneCooldown.waitSeconds}s nếu muốn gửi thêm)`,
        },
        { status: 429 }
      );
    }

    // 8. KIỂM TRA NỘI DUNG SPAM / MÃ ĐỘC / QUẢNG CÁO RÁC
    const combinedContent = `${body.fullName || ""} ${body.pickupLocation} ${body.dropoffLocation} ${body.notes || ""}`;
    if (containsSpamContent(combinedContent)) {
      console.warn(`[MALICIOUS CONTENT DETECTED] From IP: ${clientIp}`);
      return NextResponse.json(
        { success: false, message: "Nội dung chứa từ khóa không hợp lệ hoặc bị nghi ngờ là tin rác!" },
        { status: 400 }
      );
    }

    // 9. TÍNH TOÁN CƯỚC VÀ CHIẾT KHẤU 15%
    const fareDetails = calculateFareAndCommission(body);

    // 10. LÀM SẠCH VÀ CHUẨN HÓA DỮ LIỆU ĐẦU VÀO (XSS SANITIZATION)
    const sanitizedBooking: BookingRecord = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      fullName: sanitizeInput(body.fullName || "Khách hàng", 60),
      phone: body.phone.trim().slice(0, 15),
      pickupLocation: sanitizeInput(body.pickupLocation, 180),
      dropoffLocation: sanitizeInput(body.dropoffLocation, 180),
      pickupLat: typeof body.pickupLat === "number" ? body.pickupLat : (body.pickupLat ? Number(body.pickupLat) : undefined),
      pickupLng: typeof body.pickupLng === "number" ? body.pickupLng : (body.pickupLng ? Number(body.pickupLng) : undefined),
      dropoffLat: typeof body.dropoffLat === "number" ? body.dropoffLat : (body.dropoffLat ? Number(body.dropoffLat) : undefined),
      dropoffLng: typeof body.dropoffLng === "number" ? body.dropoffLng : (body.dropoffLng ? Number(body.dropoffLng) : undefined),
      pickupDate: sanitizeInput(body.pickupDate || new Date().toISOString().split("T")[0], 20),
      pickupTime: sanitizeInput(body.pickupTime || "Đón ngay", 40),
      carType: body.carType,
      tripType: body.tripType,
      serviceType: body.serviceType || "tour",
      estimatedPrice: body.estimatedPrice
        ? sanitizeInput(body.estimatedPrice, 80)
        : `${fareDetails.grossFare.toLocaleString("vi-VN")} VNĐ`,
      notes: body.notes ? sanitizeInput(body.notes, 300) : undefined,
      createdAt: new Date().toISOString(),
      status: "pending",
      grossFare: fareDetails.grossFare,
      commissionRate: fareDetails.commissionRate,
      commissionAmount: fareDetails.commissionAmount,
      driverNetEarning: fareDetails.driverNetEarning,
    };

    // 11. GHI VÀO GOOGLE FIRESTORE (LƯU TRỮ ĐÁM MÂY VĨNH VIỄN)
    await saveBookingToDb(sanitizedBooking).catch((err) => {
      console.error("Error saving booking to Firestore:", err);
    });

    // Lưu backup file cục bộ
    const bookings = getBookings();
    bookings.unshift(sanitizedBooking);
    saveBookings(bookings);

    // 12. GỬI THÔNG BÁO TỨC THỜI VỀ TELEGRAM (NHÓM TÀI XẾ & CHỦ XE)
    await sendTelegramNotification(sanitizedBooking);

    return NextResponse.json({
      success: true,
      message: "Đặt xe thành công! Tổng đài sẽ gọi lại quý khách sau 1-3 phút.",
      booking: sanitizedBooking,
    });
  } catch (error) {
    console.error("API Booking Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi gửi thông tin đặt xe. Vui lòng gọi trực tiếp Hotline!" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  // BẢO MẬT: Bắt buộc phiên đăng nhập Admin mới được cập nhật trạng thái đơn
  if (!getAdminSessionFromRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Yêu cầu quyền Quản trị viên để sửa đơn!" },
      { status: 401 }
    );
  }

  try {
    const { id, status, driverId, driverName, driverPhone, driverPlate } = await request.json();

    // 1. Cập nhật trên Firestore
    await updateBookingInDb(id, {
      status,
      ...(driverId ? { driverId, driverName, driverPhone, driverPlate } : {}),
      ...(status === "confirmed" ? { claimedAt: new Date().toISOString() } : {}),
      ...(status === "completed" ? { completedAt: new Date().toISOString() } : {}),
    }).catch(() => {});

    // 2. Cập nhật file cục bộ
    const bookings = getBookings();
    const index = bookings.findIndex((b) => b.id === id);

    if (index !== -1) {
      bookings[index].status = status;
      if (driverId) {
        bookings[index].driverId = driverId;
        bookings[index].driverName = driverName;
        bookings[index].driverPhone = driverPhone;
        bookings[index].driverPlate = driverPlate;
      }
      saveBookings(bookings);
      return NextResponse.json({ success: true, booking: bookings[index] });
    }

    return NextResponse.json({ success: true, message: "Đã cập nhật trạng thái đơn" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi cập nhật trạng thái" }, { status: 500 });
  }
}
