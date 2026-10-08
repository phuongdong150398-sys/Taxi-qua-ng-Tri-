import { NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import {
  getDrivers,
  getDriverByTelegramId,
  adjustDriverWallet,
  validateDriverForBooking,
  getFleetSettings,
  generateDepositVietQRUrl,
} from "@/lib/drivers";
import { BookingRecord } from "@/types";
import fs from "fs";
import path from "path";
import os from "os";

const DATA_DIR = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

function getBookings(): BookingRecord[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

function saveBookings(bookings: BookingRecord[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  } catch (e) {}
}

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
  "8888405865:AAG0tj-prAYFngu4qlcRYBtF2T_13xHZQo4";

const OWNER_CHAT_ID =
  process.env.TELEGRAM_CHAT_ID ||
  process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ||
  "1499064181";

async function sendTelegramApi(method: string, payload: any) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e) {
    console.error("Telegram API call error:", e);
    return null;
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Telegram Webhook is ready for Driver Dispatching and Wallet Deductions.",
  });
}

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // =========================================================================
    // 1. XỬ LÝ SỰ KIỆN TÀI XẾ BẤM NÚT [ 🚕 BẤM NHẬN CUỐC NÀY ] (CALLBACK QUERY)
    // =========================================================================
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const callbackId = callbackQuery.id;
      const data = callbackQuery.data || "";
      const fromUser = callbackQuery.from;
      const telegramId = String(fromUser.id);
      const message = callbackQuery.message;
      const chatId = message?.chat?.id;
      const messageId = message?.message_id;

      if (data.startsWith("claim_")) {
        const bookingId = data.replace("claim_", "");
        const bookings = getBookings();
        const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

        if (bookingIndex === -1) {
          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: "❌ Không tìm thấy thông tin cuốc xe này trên hệ thống!",
            show_alert: true,
          });
          return NextResponse.json({ ok: true });
        }

        const booking = bookings[bookingIndex];

        // A. Kiểm tra đơn đã có người nhận chưa
        if (booking.status !== "pending" || booking.driverId) {
          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: `❌ Cuốc xe #${booking.id} đã được Bác tài ${booking.driverName || "khác"} nhận trước rồi!`,
            show_alert: true,
          });
          return NextResponse.json({ ok: true });
        }

        // B. Tìm thông tin tài xế
        const driver = getDriverByTelegramId(telegramId);
        if (!driver) {
          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: `⚠️ Bạn chưa đăng ký/được duyệt vào đội xe! Vui lòng chat riêng với Bot @Dolysmart_Bot để đăng ký trước khi nhận cuốc.`,
            show_alert: true,
          });
          return NextResponse.json({ ok: true });
        }

        // C. Kiểm tra điều kiện: Trạng thái, Loại xe và Số dư ví cọc
        const validation = validateDriverForBooking(driver, booking);
        if (!validation.allowed) {
          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: validation.reason,
            show_alert: true,
          });
          return NextResponse.json({ ok: true });
        }

        // D. ĐỦ ĐIỀU KIỆN ➡️ TIẾN HÀNH NHẬN CUỐC & TRỪ VÍ TỰ ĐỘNG
        const commissionAmount = booking.commissionAmount || Math.round((booking.grossFare || 500000) * 0.15);
        const grossFare = booking.grossFare || (commissionAmount / 0.15);

        // 1. Khấu trừ ví cọc của tài xế
        const walletResult = adjustDriverWallet(
          driver.id,
          -commissionAmount,
          "deduction",
          `Phí chiết khấu 15% cuốc #${booking.id} (${booking.pickupLocation} ➔ ${booking.dropoffLocation})`,
          booking.id
        );

        // 2. Gán đơn cho tài xế và cập nhật trạng thái
        booking.driverId = driver.id;
        booking.driverName = driver.name;
        booking.driverPhone = driver.phone;
        booking.driverPlate = driver.plateNumber;
        booking.driverTelegramId = telegramId;
        booking.status = "confirmed";
        booking.claimedAt = new Date().toISOString();
        bookings[bookingIndex] = booking;
        saveBookings(bookings);

        // 3. Trả về thông báo thành công cho tài xế trên Telegram
        await sendTelegramApi("answerCallbackQuery", {
          callback_query_id: callbackId,
          text: `🎉 CHÚC MỪNG BÁC TÀI ${driver.name.toUpperCase()}!\nBạn đã nhận thành công cuốc #${booking.id}.\nĐã trừ ví: -${commissionAmount.toLocaleString("vi-VN")}đ (Số dư mới: ${walletResult.balanceAfter?.toLocaleString("vi-VN")}đ).\nHãy kiểm tra tin nhắn riêng để gọi khách!`,
          show_alert: true,
        });

        // 4. Cập nhật lại tin nhắn trong Nhóm Telegram (Khóa nút và đổi giao diện)
        if (chatId && messageId) {
          const updatedGroupText = `
✅ <b>ĐÃ CÓ TÀI XẾ NHẬN CUỐC #${booking.id}</b>
━━━━━━━━━━━━━━━━━━━━
🚕 <b>Tài xế nhận chuyến:</b> <b>${driver.name}</b> (<code>${driver.phone}</code>)
🚘 <b>Xe đón khách:</b> ${driver.carType === "6-seats" ? "🚙 6-7 Chỗ" : "🚗 4-5 Chỗ"} • Biển số: <code>${driver.plateNumber}</code>
📍 <b>Điểm đón:</b> ${booking.pickupLocation}
🏁 <b>Điểm đến:</b> ${booking.dropoffLocation}
💰 <b>Tiền cước thu khách:</b> <b>${grossFare.toLocaleString("vi-VN")} VNĐ</b>
💵 <b>Đã trừ ví cọc:</b> <b>${commissionAmount.toLocaleString("vi-VN")} VNĐ</b> (15%)
⏰ <b>Thời gian nhận đơn:</b> ${new Date().toLocaleTimeString("vi-VN")}
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Chúc bác tài có một chuyến đi an toàn & phục vụ chu đáo!</i>
          `;

          await sendTelegramApi("editMessageText", {
            chat_id: chatId,
            message_id: messageId,
            text: updatedGroupText.trim(),
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `✅ Đã Nhận: Bác tài ${driver.name}`, url: `https://taxiquangtri.com.vn/admin` },
                ],
              ],
            },
          });
        }

        // 5. Gửi tin nhắn riêng (Private Message) cho tài xế với đầy đủ SĐT & Tên khách
        const cleanPhone = (booking.phone || "").replace(/\D/g, "");
        const driverPrivateMsg = `
🚖 <b>THÔNG TIN KHÁCH HÀNG CUỐC #${booking.id}</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> <b>${booking.fullName || "Khách đặt xe"}</b>
📞 <b>Số điện thoại:</b> <code>${booking.phone}</code> <i>(Chạm số để gọi)</i>
📍 <b>Điểm đón:</b> ${booking.pickupLocation}
🏁 <b>Điểm đến:</b> ${booking.dropoffLocation}
🚘 <b>Loại xe:</b> ${booking.carType === "6-seats" ? "Xe 6-7 Chỗ" : "Xe 4-5 Chỗ"}
⏰ <b>Thời gian đón:</b> ${booking.pickupTime} (Ngày ${booking.pickupDate})
━━━━━━━━━━━━━━━━━━━━
💰 <b>SỐ TIỀN BẠN CẦN THU KHÁCH:</b> <b>${grossFare.toLocaleString("vi-VN")} VNĐ</b>
💵 <b>Phí 15% đã tự trừ ví:</b> -${commissionAmount.toLocaleString("vi-VN")} VNĐ
💼 <b>Số dư ví còn lại của bạn:</b> <b>${walletResult.balanceAfter?.toLocaleString("vi-VN")} VNĐ</b>
${booking.notes ? `📝 <b>Ghi chú:</b> ${booking.notes}\n` : ""}━━━━━━━━━━━━━━━━━━━━
⚡ <i>Bác tài hãy bấm nút gọi hoặc nhắn Zalo cho khách ngay nhé:</i>
        `;

        await sendTelegramApi("sendMessage", {
          chat_id: telegramId,
          text: driverPrivateMsg.trim(),
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: `💬 Nhắn Zalo Khách`, url: `https://zalo.me/${cleanPhone}` },
                { text: `💼 Kiểm Tra Ví Cọc`, callback_data: "check_wallet" },
              ],
            ],
          },
        });

        // 6. Báo tin về Telegram của BẠN (Chủ xe) để theo dõi
        if (OWNER_CHAT_ID && OWNER_CHAT_ID !== telegramId) {
          const ownerNotice = `
🔔 <b>BÁC TÀI ĐÃ NHẬN CUỐC #${booking.id}</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Tài xế:</b> ${driver.name} (SĐT: <code>${driver.phone}</code> - Xe: ${driver.plateNumber})
👤 <b>Khách:</b> ${booking.fullName} (<code>${booking.phone}</code>)
📍 <b>Lộ trình:</b> ${booking.pickupLocation} ➔ ${booking.dropoffLocation}
💰 <b>Cước khách:</b> ${grossFare.toLocaleString("vi-VN")}đ | <b>Phí 15% đã thu:</b> ${commissionAmount.toLocaleString("vi-VN")}đ
💼 <b>Số dư ví tài xế sau khi trừ:</b> ${walletResult.balanceAfter?.toLocaleString("vi-VN")}đ
          `;
          await sendTelegramApi("sendMessage", {
            chat_id: OWNER_CHAT_ID,
            text: ownerNotice.trim(),
            parse_mode: "HTML",
          });
        }

        return NextResponse.json({ ok: true });
      }

      // Xử lý nút xem ví
      if (data === "check_wallet") {
        const driver = getDriverByTelegramId(telegramId);
        if (driver) {
          const qrUrl = generateDepositVietQRUrl(driver, 500000);
          await sendTelegramApi("sendMessage", {
            chat_id: telegramId,
            text: `💼 <b>VÍ TÀI XẾ: ${driver.name.toUpperCase()}</b>\n━━━━━━━━━━━━━━━━━━━━\n💰 Số dư hiện tại: <b>${driver.walletBalance.toLocaleString("vi-VN")} VNĐ</b>\n🚘 Xe: ${driver.plateNumber} (${driver.carType})\n📊 Tổng số cuốc đã chạy: <b>${driver.totalTripsCompleted} chuyến</b>\n━━━━━━━━━━━━━━━━━━━━\n⚡ Trạng thái: ${driver.walletBalance >= 50000 ? "✅ ĐỦ ĐIỀU KIỆN NHẬN CUỐC" : "⚠️ CẦN NẠP THÊM TIỀN CỌC"}\n\n📲 <i>Quét mã VietQR bên dưới hoặc chuyển khoản để nạp cọc:</i>`,
            parse_mode: "HTML",
          });
        }
        return NextResponse.json({ ok: true });
      }
    }

    // =========================================================================
    // 2. XỬ LÝ LỆNH CHAT VỚI BOT TELEGRAM (/start, /vi, /sodu, /myid)
    // =========================================================================
    if (update.message) {
      const msg = update.message;
      const text = (msg.text || "").trim();
      const chatId = msg.chat.id;
      const telegramId = String(msg.from.id);
      const userName = msg.from.first_name || "Bác tài";

      // Lệnh /myid
      if (text === "/myid") {
        await sendTelegramApi("sendMessage", {
          chat_id: chatId,
          text: `🆔 <b>Mã Telegram ID của bạn là:</b> <code>${telegramId}</code>\n\nHãy gửi mã số này cho tổng đài để kích hoạt tài khoản tài xế nhé!`,
          parse_mode: "HTML",
        });
        return NextResponse.json({ ok: true });
      }

      // Lệnh /vi hoặc /sodu
      if (text === "/vi" || text === "/sodu" || text.includes("ví") || text.includes("số dư")) {
        const driver = getDriverByTelegramId(telegramId);
        if (driver) {
          const qrUrl = generateDepositVietQRUrl(driver, 500000);
          await sendTelegramApi("sendMessage", {
            chat_id: chatId,
            text: `💼 <b>THÔNG TIN VÍ CỌC TÀI XẾ</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 <b>Bác tài:</b> ${driver.name}\n🚘 <b>Xe:</b> ${driver.plateNumber} (${driver.carType === "6-seats" ? "6-7 Chỗ" : "4-5 Chỗ"})\n💰 <b>Số dư ví hiện tại:</b> <b>${driver.walletBalance.toLocaleString("vi-VN")} VNĐ</b>\n📊 <b>Tổng cuốc đã nhận:</b> ${driver.totalTripsCompleted} chuyến\n💵 <b>Tổng chiết khấu 15% đã nộp:</b> ${driver.totalCommissionPaid?.toLocaleString("vi-VN") || 0} VNĐ\n━━━━━━━━━━━━━━━━━━━━\n${driver.walletBalance >= 50000 ? "✅ <b>Trạng thái:</b> Đủ điều kiện nhận cuốc trong nhóm" : "⚠️ <b>Trạng thái:</b> Số dư thấp, hãy nạp thêm để không bỏ lỡ cuốc mới!"}`,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `💳 Nạp Cọc Qua VietQR`, url: qrUrl },
                  { text: `📞 Liên Hệ Tổng Đài`, url: `https://zalo.me/0398567070` },
                ],
              ],
            },
          });
        } else {
          await sendTelegramApi("sendMessage", {
            chat_id: chatId,
            text: `⚠️ Bạn chưa đăng ký tài xế trong hệ thống. Mã Telegram ID của bạn là: <code>${telegramId}</code>. Hãy liên hệ chủ xe để được thêm vào đội xe!`,
            parse_mode: "HTML",
          });
        }
        return NextResponse.json({ ok: true });
      }

      // Lệnh /start hoặc /dangky
      if (text.startsWith("/start") || text.startsWith("/dangky")) {
        const driver = getDriverByTelegramId(telegramId);
        if (driver) {
          await sendTelegramApi("sendMessage", {
            chat_id: chatId,
            text: `👋 Chào Bác tài <b>${driver.name}</b>!\n\nBạn đang hoạt động trong đội xe <b>${siteConfig.name.toUpperCase()}</b>.\n💰 Số dư ví của bạn: <b>${driver.walletBalance.toLocaleString("vi-VN")} VNĐ</b>.\n\n👉 Gõ <code>/vi</code> để kiểm tra số dư và nạp cọc.\n👉 Khi có cuốc trong nhóm, hãy bấm nút nhận cuốc để được cấp SĐT khách!`,
            parse_mode: "HTML",
          });
        } else {
          await sendTelegramApi("sendMessage", {
            chat_id: chatId,
            text: `🚖 <b>CHÀO MỪNG BÁC TÀI ĐẾN VỚI ${siteConfig.name.toUpperCase()}</b>\n━━━━━━━━━━━━━━━━━━━━\nĐể đăng ký nhận cuốc trong đội xe, bạn cần cung cấp thông tin:\n\n1️⃣ Họ và tên của bạn\n2️⃣ Số điện thoại liên hệ\n3️⃣ Biển số xe & Dòng xe (4 chỗ hay 7 chỗ)\n4️⃣ Mã Telegram ID của bạn: <code>${telegramId}</code>\n\n📲 Vui lòng gửi thông tin trên qua Zalo: <b>0398.567.070</b> để tổng đài kích hoạt tài khoản và nạp ví cọc tạm ứng cho bạn nhé!`,
            parse_mode: "HTML",
          });
        }
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
