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
import fs from "fs";
import path from "path";
import os from "os";

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

// Hàm gửi thông báo đơn đặt xe về Telegram của tài xế / chủ xe
async function sendTelegramNotification(booking: BookingRecord) {
  const token =
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
    "8888405865:AAG0tj-prAYFngu4qlcRYBtF2T_13xHZQo4";
  const chatId =
    process.env.TELEGRAM_CHAT_ID ||
    process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ||
    "1499064181";

  if (!token || !chatId) {
    console.log("Telegram not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in environment variables.");
    return;
  }

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
  const zaloUrl = cleanPhone ? `https://zalo.me/${cleanPhone}` : "https://zalo.me";

  const message = `
🚖 <b>ĐƠN ĐẶT TAXI MỚI - ${siteConfig.name.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Mã đơn:</b> <code>#${booking.id}</code>
👤 <b>Khách hàng:</b> <b>${escapeHtml(booking.fullName || "Khách đặt xe")}</b>
📞 <b>Số điện thoại:</b> <code>${booking.phone}</code> <i>(Chạm để sao chép)</i>
📍 <b>Điểm đón:</b> ${escapeHtml(booking.pickupLocation)}
🏁 <b>Điểm đến:</b> ${escapeHtml(booking.dropoffLocation)}
🚘 <b>Loại xe:</b> ${getCarLabel(booking.carType)}
🔄 <b>Loại chuyến:</b> ${booking.tripType === "round-trip" ? "Khứ hồi 2 chiều" : "1 chiều"}
⏰ <b>Thời gian đón:</b> ${booking.pickupTime} (Ngày ${booking.pickupDate})
${booking.estimatedPrice ? `💰 <b>Giá ước tính:</b> <b>${booking.estimatedPrice}</b>\n` : ""}${booking.notes ? `📝 <b>Ghi chú:</b> ${escapeHtml(booking.notes)}\n` : ""}━━━━━━━━━━━━━━━━━━━━
⚡ <i>Chạm vào số điện thoại hoặc bấm nút bên dưới để liên hệ ngay:</i>
`;

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message.trim(),
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "💬 Nhắn Zalo Khách", url: zaloUrl },
              { text: "📊 Xem Đơn / Quản Trị", url: "https://taxiquangtri.com.vn/admin" },
            ],
          ],
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Telegram API Error:", errText);
    } else {
      console.log("Telegram notification sent successfully for booking:", booking.id);
    }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

export async function GET() {
  const bookings = getBookings();
  return NextResponse.json({ success: true, data: bookings });
}

export async function POST(request: Request) {
  try {
    // 1. Thu thập IP client để Rate Limit
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "127.0.0.1";

    const body: BookingFormInput = await request.json();

    // 2. HONEYPOT CHECK (Bẫy Bot Spam)
    // Nếu trường ẩn hp_website có dữ liệu -> chắc chắn là bot tự động điền form
    if (body.hp_website && body.hp_website.trim().length > 0) {
      console.warn(`[SPAM DETECTED] Honeypot triggered from IP: ${clientIp}`);
      // Trả về thành công giả lập để bot không thử lại, nhưng KHÔNG lưu và KHÔNG gửi Telegram
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

    // 9. LÀM SẠCH VÀ CHUẨN HÓA DỮ LIỆU ĐẦU VÀO (XSS SANITIZATION)
    const sanitizedBooking: BookingRecord = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      fullName: sanitizeInput(body.fullName || "Khách hàng", 60),
      phone: body.phone.trim().slice(0, 15),
      pickupLocation: sanitizeInput(body.pickupLocation, 180),
      dropoffLocation: sanitizeInput(body.dropoffLocation, 180),
      pickupDate: sanitizeInput(body.pickupDate || new Date().toISOString().split("T")[0], 20),
      pickupTime: sanitizeInput(body.pickupTime || "Đón ngay", 40),
      carType: body.carType,
      tripType: body.tripType,
      serviceType: body.serviceType || "tour",
      estimatedPrice: body.estimatedPrice ? sanitizeInput(body.estimatedPrice, 80) : undefined,
      notes: body.notes ? sanitizeInput(body.notes, 300) : undefined,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const bookings = getBookings();
    bookings.unshift(sanitizedBooking);
    saveBookings(bookings);

    // 10. GỬI THÔNG BÁO TỨC THỜI VỀ TELEGRAM CHỦ XE
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
  try {
    const { id, status } = await request.json();
    const bookings = getBookings();
    const index = bookings.findIndex((b) => b.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, message: "Không tìm thấy chuyến xe" }, { status: 404 });
    }

    bookings[index].status = status;
    saveBookings(bookings);

    return NextResponse.json({ success: true, booking: bookings[index] });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi cập nhật trạng thái" }, { status: 500 });
  }
}
