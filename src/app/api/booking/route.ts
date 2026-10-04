import { NextResponse } from "next/server";
import { BookingRecord, BookingFormInput } from "@/types";
import { siteConfig } from "@/config/siteConfig";
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
    const body: BookingFormInput = await request.json();

    if (!body.phone || !body.pickupLocation || !body.dropoffLocation) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ Số điện thoại, Điểm đón và Điểm đến" },
        { status: 400 }
      );
    }

    const bookings = getBookings();
    const newBooking: BookingRecord = {
      ...body,
      id: `TX-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    bookings.unshift(newBooking);
    saveBookings(bookings);

    // Gửi thông báo tức thời về Telegram
    await sendTelegramNotification(newBooking);

    return NextResponse.json({
      success: true,
      message: "Đặt xe thành công! Tổng đài sẽ gọi lại quý khách sau 1-3 phút.",
      booking: newBooking,
    });
  } catch (error) {
    console.error("API Booking Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi gửi thông tin đặt xe" },
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
