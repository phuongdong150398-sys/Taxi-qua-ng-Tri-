import { NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import {
  getDrivers,
  getDriverByTelegramId,
  adjustDriverWallet,
  validateDriverForBooking,
  getFleetSettings,
  generateDepositVietQRUrl,
  getRegistrationSession,
  setRegistrationSession,
  clearRegistrationSession,
  registerDriverFromTelegram,
  getDriverById,
  saveFleetSettings,
  loadFleetStateFromTelegramCloud,
  syncFleetStateToTelegramCloud,
} from "@/lib/drivers";
import { BookingRecord, CarType } from "@/types";
import { isValidVietnamesePhone } from "@/lib/security";
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
    message: "Telegram Webhook is ready for Driver Registration, Dispatching and Wallet Deductions.",
  });
}

export async function POST(request: Request) {
  try {
    // Tải dữ liệu tài xế & số dư mới nhất từ Telegram Cloud
    await loadFleetStateFromTelegramCloud();

    const update = await request.json();
    const settings = getFleetSettings();

    // =========================================================================
    // 1. XỬ LÝ SỰ KIỆN CALLBACK QUERY (BẤM NÚT INLINE KEYBOARD)
    // =========================================================================
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const callbackId = callbackQuery.id;
      const data = callbackQuery.data || "";
      const fromUser = callbackQuery.from;
      const telegramId = String(fromUser.id);
      const telegramUsername = fromUser.username;
      const message = callbackQuery.message;
      const chatId = message?.chat?.id;
      const messageId = message?.message_id;

      // A. BẤM NÚT NHẬN CUỐC: claim_<bookingId>
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

        // Kiểm tra đơn đã có người nhận chưa
        if (booking.status !== "pending" || booking.driverId) {
          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: `❌ Cuốc xe #${booking.id} đã được Bác tài ${booking.driverName || "khác"} nhận trước rồi!`,
            show_alert: true,
          });
          return NextResponse.json({ ok: true });
        }

        // Tìm thông tin tài xế
        const driver = getDriverByTelegramId(telegramId);
        if (!driver) {
          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: `⚠️ Bạn chưa đăng ký tài xế! Hãy chat riêng với Bot @Dolysmart_Bot và gõ /dangky để đăng ký & nạp ví nhé.`,
            show_alert: true,
          });
          return NextResponse.json({ ok: true });
        }

        // Kiểm tra điều kiện ví & loại xe
        const validation = validateDriverForBooking(driver, booking);
        if (!validation.allowed) {
          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: validation.reason,
            show_alert: true,
          });
          return NextResponse.json({ ok: true });
        }

        // ĐỦ ĐIỀU KIỆN ➡️ NHẬN CUỐC & TRỪ VÍ TỰ ĐỘNG
        const commissionAmount = booking.commissionAmount || Math.round((booking.grossFare || 500000) * 0.15);
        const grossFare = booking.grossFare || (commissionAmount / 0.15);

        // Khấu trừ ví cọc của tài xế
        const walletResult = adjustDriverWallet(
          driver.id,
          -commissionAmount,
          "deduction",
          `Phí chiết khấu 15% cuốc #${booking.id} (${booking.pickupLocation} ➔ ${booking.dropoffLocation})`,
          booking.id
        );

        // Gán đơn cho tài xế và cập nhật trạng thái
        booking.driverId = driver.id;
        booking.driverName = driver.name;
        booking.driverPhone = driver.phone;
        booking.driverPlate = driver.plateNumber;
        booking.driverTelegramId = telegramId;
        booking.status = "confirmed";
        booking.claimedAt = new Date().toISOString();
        bookings[bookingIndex] = booking;
        saveBookings(bookings);

        // Trả về thông báo thành công cho tài xế
        await sendTelegramApi("answerCallbackQuery", {
          callback_query_id: callbackId,
          text: `🎉 BÁC TÀI ${driver.name.toUpperCase()} ĐÃ NHẬN THÀNH CÔNG CUỐC #${booking.id}!\nĐã trừ 15%: -${commissionAmount.toLocaleString("vi-VN")}đ (Số dư ví mới: ${walletResult.balanceAfter?.toLocaleString("vi-VN")}đ).\nHãy kiểm tra tin nhắn riêng với Bot để gọi khách!`,
          show_alert: true,
        });

        // Cập nhật lại tin nhắn trong Nhóm Telegram
        if (chatId && messageId) {
          const updatedGroupText = `
✅ <b>ĐÃ CÓ TÀI XẾ NHẬN CUỐC #${booking.id}</b>
━━━━━━━━━━━━━━━━━━━━
🚕 <b>Tài xế nhận chuyến:</b> <b>${driver.name}</b> (<code>${driver.phone}</code>)
🚘 <b>Xe:</b> ${driver.carType === "6-seats" ? "🚙 6-7 Chỗ" : "🚗 4-5 Chỗ"} • Biển số: <code>${driver.plateNumber}</code>
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

        // Gửi tin nhắn riêng (Private Message) cho tài xế với SĐT, Tên khách, Google Maps & Cập nhật tiến độ
        const cleanPhone = (booking.phone || "").replace(/\D/g, "");
        const mapPickupUrl = booking.pickupLat && booking.pickupLng
          ? `https://www.google.com/maps/dir/?api=1&destination=${booking.pickupLat},${booking.pickupLng}`
          : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.pickupLocation)}`;
        const zaloUrl = cleanPhone ? `https://zalo.me/${cleanPhone}` : "https://zalo.me";

        const driverPrivateMsg = `
🚖 <b>THÔNG TIN KHÁCH HÀNG CUỐC #${booking.id}</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> <b>${booking.fullName || "Khách đặt xe"}</b>
📞 <b>Số điện thoại:</b> <code>${booking.phone}</code> <i>(Chạm số để gọi)</i>
📍 <b>Điểm đón:</b> <b>${booking.pickupLocation}</b>
🏁 <b>Điểm đến:</b> <b>${booking.dropoffLocation}</b>
🚘 <b>Loại xe:</b> ${booking.carType === "6-seats" ? "Xe 6-7 Chỗ" : "Xe 4-5 Chỗ"}
⏰ <b>Thời gian đón:</b> ${booking.pickupTime} (Ngày ${booking.pickupDate})
━━━━━━━━━━━━━━━━━━━━
💰 <b>SỐ TIỀN BẠN CẦN THU KHÁCH:</b> <b>${grossFare.toLocaleString("vi-VN")} VNĐ</b>
💵 <b>Phí 15% đã tự trừ ví:</b> -${commissionAmount.toLocaleString("vi-VN")} VNĐ
💼 <b>Số dư ví còn lại của bạn:</b> <b>${walletResult.balanceAfter?.toLocaleString("vi-VN")} VNĐ</b>
${booking.notes ? `📝 <b>Ghi chú:</b> ${booking.notes}\n` : ""}━━━━━━━━━━━━━━━━━━━━
⚡ <b>TIỆN ÍCH CHỈ ĐƯỜNG & CẬP NHẬT TIẾN ĐỘ CUỐC XE:</b>
`;

        await sendTelegramApi("sendMessage", {
          chat_id: telegramId,
          text: driverPrivateMsg.trim(),
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: `🧭 Google Maps Chỉ Đường`, url: mapPickupUrl },
                { text: `💬 Nhắn Zalo Khách`, url: zaloUrl },
              ],
              [
                { text: `🚗 BÁO ĐANG ĐẾN ĐIỂM ĐÓN`, callback_data: `trip_onway_${booking.id}` },
              ],
            ],
          },
        });

        // Báo tin về Telegram của BẠN (Chủ xe)
        if (OWNER_CHAT_ID && OWNER_CHAT_ID !== telegramId) {
          const ownerNotice = `
🔔 <b>BÁC TÀI ĐÃ NHẬN CUỐC #${booking.id}</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Tài xế:</b> ${driver.name} (<code>${driver.phone}</code> - ${driver.plateNumber})
👤 <b>Khách:</b> ${booking.fullName} (<code>${booking.phone}</code>)
📍 <b>Lộ trình:</b> ${booking.pickupLocation} ➔ ${booking.dropoffLocation}
💰 <b>Cước khách:</b> ${grossFare.toLocaleString("vi-VN")}đ | <b>Phí 15%:</b> ${commissionAmount.toLocaleString("vi-VN")}đ
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

      // =======================================================================
      // B. TÀI XẾ BÁO: ĐANG TRÊN ĐƯỜNG ĐẾN ĐÓN KHÁCH (trip_onway_<bookingId>)
      // =======================================================================
      if (data.startsWith("trip_onway_")) {
        const bookingId = data.replace("trip_onway_", "");
        const bookings = getBookings();
        const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

        if (bookingIndex !== -1) {
          const booking = bookings[bookingIndex];

          // Xác thực chính chủ tài xế
          if (booking.driverTelegramId && String(booking.driverTelegramId).trim() !== String(telegramId).trim()) {
            await sendTelegramApi("answerCallbackQuery", {
              callback_query_id: callbackId,
              text: "❌ Bạn không phải là tài xế đã nhận cuốc xe này!",
              show_alert: true,
            });
            return NextResponse.json({ ok: true });
          }

          if (booking.status === "completed") {
            await sendTelegramApi("answerCallbackQuery", {
              callback_query_id: callbackId,
              text: "✅ Cuốc xe này đã hoàn thành!",
              show_alert: true,
            });
            return NextResponse.json({ ok: true });
          }

          booking.onWayAt = new Date().toISOString();
          bookings[bookingIndex] = booking;
          saveBookings(bookings);

          const mapPickupUrl = booking.pickupLat && booking.pickupLng
            ? `https://www.google.com/maps/dir/?api=1&destination=${booking.pickupLat},${booking.pickupLng}`
            : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.pickupLocation)}`;
          const cleanPhone = (booking.phone || "").replace(/\D/g, "");

          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: `🚗 Đã ghi nhận Bác tài đang trên đường đến đón khách cuốc #${booking.id}!`,
            show_alert: true,
          });

          if (chatId && messageId) {
            await sendTelegramApi("editMessageText", {
              chat_id: chatId,
              message_id: messageId,
              text: `
🚖 <b>CUỐC #${booking.id} - ĐANG TRÊN ĐƯỜNG ĐẾN ĐÓN KHÁCH</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> <b>${booking.fullName || "Khách đặt xe"}</b> (<code>${booking.phone}</code>)
📍 <b>Điểm đón:</b> <b>${booking.pickupLocation}</b>
🏁 <b>Điểm đến:</b> ${booking.dropoffLocation}
💰 <b>Thu khách:</b> <b>${(booking.grossFare || 450000).toLocaleString("vi-VN")} VNĐ</b>
⏰ <b>Thời gian báo xuất phát:</b> ${new Date().toLocaleTimeString("vi-VN")}
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Khi đã đón được khách lên xe, Bác tài hãy bấm nút bên dưới:</i>
`.trim(),
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: `🧭 Google Maps Chỉ Đường`, url: mapPickupUrl },
                    { text: `💬 Nhắn Zalo Khách`, url: `https://zalo.me/${cleanPhone}` },
                  ],
                  [
                    { text: `🙋‍♂️ BÁO ĐÃ ĐÓN ĐƯỢC KHÁCH`, callback_data: `trip_pickedup_${booking.id}` },
                  ],
                ],
              },
            });
          }

          // Báo cho Admin
          if (OWNER_CHAT_ID && OWNER_CHAT_ID !== telegramId) {
            await sendTelegramApi("sendMessage", {
              chat_id: OWNER_CHAT_ID,
              text: `🚗 <b>TÀI XẾ ĐANG ĐẾN ĐÓN KHÁCH CUỐC #${booking.id}</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 Bác tài: <b>${booking.driverName}</b> (<code>${booking.driverPhone}</code>)\n👤 Khách: ${booking.fullName} (<code>${booking.phone}</code>)\n📍 Đang đến đón tại: <b>${booking.pickupLocation}</b>\n⏰ Lúc: ${new Date().toLocaleTimeString("vi-VN")}`,
              parse_mode: "HTML",
            });
          }
        }
        return NextResponse.json({ ok: true });
      }

      // =======================================================================
      // C. TÀI XẾ BÁO: ĐÃ ĐÓN ĐƯỢC KHÁCH LÊN XE (trip_pickedup_<bookingId>)
      // =======================================================================
      if (data.startsWith("trip_pickedup_")) {
        const bookingId = data.replace("trip_pickedup_", "");
        const bookings = getBookings();
        const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

        if (bookingIndex !== -1) {
          const booking = bookings[bookingIndex];

          // Xác thực chính chủ tài xế
          if (booking.driverTelegramId && String(booking.driverTelegramId).trim() !== String(telegramId).trim()) {
            await sendTelegramApi("answerCallbackQuery", {
              callback_query_id: callbackId,
              text: "❌ Bạn không phải là tài xế đã nhận cuốc xe này!",
              show_alert: true,
            });
            return NextResponse.json({ ok: true });
          }

          if (booking.status === "completed") {
            await sendTelegramApi("answerCallbackQuery", {
              callback_query_id: callbackId,
              text: "✅ Cuốc xe này đã hoàn thành!",
              show_alert: true,
            });
            return NextResponse.json({ ok: true });
          }

          // BẢO VỆ TUẦN TỰ: Phải bấm "Đang đến điểm đón" trước
          if (!booking.onWayAt) {
            await sendTelegramApi("answerCallbackQuery", {
              callback_query_id: callbackId,
              text: "⚠️ Bác tài vui lòng bấm '🚗 Báo Đang Đến Điểm Đón' trước khi báo đã đón khách!",
              show_alert: true,
            });
            return NextResponse.json({ ok: true });
          }

          booking.status = "in_progress";
          booking.pickedUpAt = new Date().toISOString();
          bookings[bookingIndex] = booking;
          saveBookings(bookings);

          const mapDropoffUrl = booking.dropoffLat && booking.dropoffLng
            ? `https://www.google.com/maps/dir/?api=1&destination=${booking.dropoffLat},${booking.dropoffLng}`
            : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.dropoffLocation)}`;

          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: `🙋‍♂️ ĐÃ GHI NHẬN ĐÓN KHÁCH THÀNH CÔNG! Chúc Bác tài lái xe an toàn và chu đáo.`,
            show_alert: true,
          });

          if (chatId && messageId) {
            await sendTelegramApi("editMessageText", {
              chat_id: chatId,
              message_id: messageId,
              text: `
🚖 <b>CUỐC #${booking.id} - ĐÃ ĐÓN KHÁCH LÊN XE</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> <b>${booking.fullName || "Khách đặt xe"}</b>
📍 <b>Điểm đón:</b> ${booking.pickupLocation}
🏁 <b>Điểm đến:</b> <b>${booking.dropoffLocation}</b>
💰 <b>SỐ TIỀN CẦN THU KHÁCH:</b> <b>${(booking.grossFare || 450000).toLocaleString("vi-VN")} VNĐ</b>
⏰ <b>Thời gian đón khách:</b> ${new Date().toLocaleTimeString("vi-VN")}
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Khi đưa khách đến nơi an toàn và thu cước xong, Bác tài bấm nút bên dưới để hoàn tất:</i>
`.trim(),
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: `🧭 Google Maps Đến Điểm Trả`, url: mapDropoffUrl },
                  ],
                  [
                    { text: `🏁 BÁO HOÀN THÀNH CUỐC XE`, callback_data: `trip_completed_${booking.id}` },
                  ],
                ],
              },
            });
          }

          // Báo cho Admin
          if (OWNER_CHAT_ID && OWNER_CHAT_ID !== telegramId) {
            await sendTelegramApi("sendMessage", {
              chat_id: OWNER_CHAT_ID,
              text: `🙋‍♂️ <b>TÀI XẾ ĐÃ ĐÓN KHÁCH LÊN XE CUỐC #${booking.id}</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 Bác tài: <b>${booking.driverName}</b> (<code>${booking.driverPhone}</code>)\n👤 Khách: ${booking.fullName}\n🏁 Đang di chuyển đến: <b>${booking.dropoffLocation}</b>\n⏰ Lúc: ${new Date().toLocaleTimeString("vi-VN")}`,
              parse_mode: "HTML",
            });
          }
        }
        return NextResponse.json({ ok: true });
      }

      // =======================================================================
      // D. TÀI XẾ BÁO: HOÀN THÀNH CUỐC XE (trip_completed_<bookingId>)
      // =======================================================================
      if (data.startsWith("trip_completed_")) {
        const bookingId = data.replace("trip_completed_", "");
        const bookings = getBookings();
        const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

        if (bookingIndex !== -1) {
          const booking = bookings[bookingIndex];

          // Xác thực chính chủ tài xế
          if (booking.driverTelegramId && String(booking.driverTelegramId).trim() !== String(telegramId).trim()) {
            await sendTelegramApi("answerCallbackQuery", {
              callback_query_id: callbackId,
              text: "❌ Bạn không phải là tài xế đã nhận cuốc xe này!",
              show_alert: true,
            });
            return NextResponse.json({ ok: true });
          }

          if (booking.status === "completed") {
            await sendTelegramApi("answerCallbackQuery", {
              callback_query_id: callbackId,
              text: "✅ Cuốc xe này đã hoàn thành trước đó rồi!",
              show_alert: true,
            });
            return NextResponse.json({ ok: true });
          }

          // BẢO VỆ TUẦN TỰ: Phải đón khách trước khi hoàn thành
          if (!booking.onWayAt) {
            await sendTelegramApi("answerCallbackQuery", {
              callback_query_id: callbackId,
              text: "⚠️ Bác tài chưa bấm '🚗 Báo Đang Đến Điểm Đón'! Vui lòng thực hiện tuần tự theo quy trình.",
              show_alert: true,
            });
            return NextResponse.json({ ok: true });
          }

          if (!booking.pickedUpAt) {
            await sendTelegramApi("answerCallbackQuery", {
              callback_query_id: callbackId,
              text: "⚠️ Bác tài chưa đón khách lên xe! Vui lòng bấm '🙋‍♂️ Báo Đã Đón Được Khách' trước khi hoàn thành cuốc.",
              show_alert: true,
            });
            return NextResponse.json({ ok: true });
          }

          booking.status = "completed";
          booking.completedAt = new Date().toISOString();
          bookings[bookingIndex] = booking;
          saveBookings(bookings);

          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: `🎉 CHÚC MỪNG BÁC TÀI ĐÃ HOÀN THÀNH XUẤT SẮC CUỐC XE #${booking.id}!`,
            show_alert: true,
          });

          const grossFare = booking.grossFare || 450000;
          const commissionAmount = booking.commissionAmount || Math.round(grossFare * 0.15);
          const driverNetEarning = booking.driverNetEarning || grossFare - commissionAmount;

          if (chatId && messageId) {
            await sendTelegramApi("editMessageText", {
              chat_id: chatId,
              message_id: messageId,
              text: `
🎉 <b>CUỐC XE #${booking.id} ĐÃ HOÀN THÀNH THÀNH CÔNG!</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> ${booking.fullName || "Khách đặt xe"}
📍 <b>Lộ trình:</b> ${booking.pickupLocation} ➔ ${booking.dropoffLocation}
💰 <b>Tổng tiền cước đã thu khách:</b> <b>${grossFare.toLocaleString("vi-VN")} VNĐ</b>
💵 <b>Phí chiết khấu 15% đã trừ:</b> -${commissionAmount.toLocaleString("vi-VN")} VNĐ
👉 <b>TIỀN THỰC NHẬN CỦA BÁC TÀI:</b> <b>+${driverNetEarning.toLocaleString("vi-VN")} VNĐ</b>
⏰ <b>Thời gian hoàn thành:</b> ${new Date().toLocaleTimeString("vi-VN")}
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Cảm ơn Bác tài đã phục vụ chu đáo & lái xe an toàn!</i>
`.trim(),
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: `💼 Kiểm Tra Số Dư Ví Cọc`, callback_data: `check_wallet` },
                  ],
                ],
              },
            });
          }

          // Báo cho Admin
          if (OWNER_CHAT_ID && OWNER_CHAT_ID !== telegramId) {
            await sendTelegramApi("sendMessage", {
              chat_id: OWNER_CHAT_ID,
              text: `🎉 <b>CUỐC XE #${booking.id} ĐÃ HOÀN THÀNH XUẤT SẮC!</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 Bác tài: <b>${booking.driverName}</b> (<code>${booking.driverPhone}</code>)\n👤 Khách: ${booking.fullName} (<code>${booking.phone}</code>)\n📍 Lộ trình: ${booking.pickupLocation} ➔ ${booking.dropoffLocation}\n💰 Cước thu khách: <b>${grossFare.toLocaleString("vi-VN")}đ</b> | Phí 15%: <b>${commissionAmount.toLocaleString("vi-VN")}đ</b>\n⏰ Hoàn thành lúc: ${new Date().toLocaleTimeString("vi-VN")}`,
              parse_mode: "HTML",
            });
          }
        }
        return NextResponse.json({ ok: true });
      }

      // B. BẤM NÚT BẮT ĐẦU ĐĂNG KÝ: start_reg
      if (data === "start_reg") {
        setRegistrationSession({
          telegramId,
          step: "name",
          telegramUsername,
          updatedAt: Date.now(),
        });

        await sendTelegramApi("sendMessage", {
          chat_id: telegramId,
          text: `
🚖 <b>ĐĂNG KÝ TÀI XẾ - ${siteConfig.name.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━━━
Chào bạn! Để tham gia nhận cuốc xe trong đội xe với mức chiết khấu 15%/cuốc, bạn hãy hoàn thành 4 bước đăng ký nhanh sau:

👉 <b>Bước 1/4:</b> Vui lòng nhập <b>Họ và Tên</b> của bạn (Ví dụ: <i>Nguyễn Văn Hùng</i>):
`.trim(),
          parse_mode: "HTML",
        });

        await sendTelegramApi("answerCallbackQuery", { callback_query_id: callbackId });
        return NextResponse.json({ ok: true });
      }

      // C. BẤM NÚT CHỌN LOẠI XE: reg_cartype_<type>
      if (data.startsWith("reg_cartype_")) {
        const selectedCarType = data.replace("reg_cartype_", "") as CarType;
        const session = getRegistrationSession(telegramId);

        if (!session || !session.name || !session.phone || !session.plateNumber) {
          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: "⚠️ Phiên đăng ký đã hết hạn hoặc thiếu thông tin. Vui lòng gõ /dangky để thực hiện lại!",
            show_alert: true,
          });
          return NextResponse.json({ ok: true });
        }

        // Hoàn tất tạo tài xế trong hệ thống
        const newDriver = registerDriverFromTelegram({
          name: session.name,
          phone: session.phone,
          plateNumber: session.plateNumber,
          carType: selectedCarType,
          region: session.region || "Quảng Trị & Lân Cận",
          telegramId,
          telegramUsername: session.telegramUsername || telegramUsername,
        });

        clearRegistrationSession(telegramId);

        const qrUrl = generateDepositVietQRUrl(newDriver, 500000);
        const carName =
          selectedCarType === "6-seats"
            ? "🚙 Xe 6-7 Chỗ (MPV/SUV)"
            : selectedCarType === "16-seats"
            ? "🚐 Xe 16 Chỗ Du Lịch"
            : selectedCarType === "vip-limousine"
            ? "👑 VIP Limousine 9 Chỗ"
            : "🚗 Xe 4-5 Chỗ (Sedan)";

        // Gửi thông báo đăng ký thành công cho tài xế
        const successMsg = `
🎉 <b>CHÚC MỪNG BÁC TÀI ĐÃ ĐĂNG KÝ THÀNH CÔNG!</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Mã tài xế:</b> <code>${newDriver.id}</code>
👤 <b>Họ và tên:</b> <b>${newDriver.name}</b>
📞 <b>Số điện thoại:</b> <code>${newDriver.phone}</code>
🚘 <b>Biển số xe:</b> <code>${newDriver.plateNumber}</code> (${carName})
💼 <b>Số dư ví cọc hiện tại:</b> <b>0 VNĐ</b>
━━━━━━━━━━━━━━━━━━━━
⚠️ <b>BƯỚC TIẾP THEO ĐỂ NHẬN CUỐC:</b>
Hệ thống sẽ tự động trừ <b>phí chiết khấu 15%</b> vào ví cọc tạm ứng khi Bác tài bấm nhận chuyến.

👉 Bác tài hãy <b>Nạp tiền cọc tạm ứng (Tối thiểu 50.000 VNĐ)</b> để đủ điều kiện nhận các chuyến xe mới nhất nhé!

📲 <b>THÔNG TIN CHUYỂN KHOẢN NẠP CỌC:</b>
🏦 <b>Ngân hàng:</b> <b>${settings.bankName}</b>
💳 <b>Số tài khoản:</b> <code>${settings.bankAccount}</code> <i>(Chạm để sao chép)</i>
👤 <b>Chủ tài khoản:</b> <b>${settings.bankAccountName}</b>
📝 <b>Nội dung CK:</b> <code>NAP VI ${newDriver.phone} ${newDriver.name}</code>
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Quét mã VietQR được gửi kèm hoặc chuyển khoản, tổng đài sẽ duyệt cộng tiền vào ví trong 1 - 3 phút!</i>
`;

        await sendTelegramApi("sendPhoto", {
          chat_id: telegramId,
          photo: qrUrl,
          caption: successMsg.trim(),
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "💼 Kiểm Tra Số Dư Ví", callback_data: "check_wallet" },
                { text: "📞 Hỗ Trợ Nạp Cọc (Zalo)", url: "https://zalo.me/0398567070" },
              ],
            ],
          },
        });

        // Báo cho Admin / Chủ xe có tài xế mới đăng ký
        if (OWNER_CHAT_ID) {
          const adminNotice = `
🔔 <b>TÀI XẾ MỚI VỪA ĐĂNG KÝ QUA TELEGRAM!</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Mã:</b> <code>${newDriver.id}</code>
👤 <b>Bác tài:</b> <b>${newDriver.name}</b>
📞 <b>SĐT:</b> <code>${newDriver.phone}</code>
🚘 <b>Xe:</b> ${newDriver.plateNumber} (${carName})
🆔 <b>Telegram ID:</b> <code>${telegramId}</code>
💼 <b>Số dư ví:</b> 0 VNĐ
━━━━━━━━━━━━━━━━━━━━
👉 Khi bác tài chuyển khoản cọc, bạn có thể bấm nạp tiền nhanh bên dưới:
`;
          await sendTelegramApi("sendMessage", {
            chat_id: OWNER_CHAT_ID,
            text: adminNotice.trim(),
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "💳 Nạp 100k", callback_data: `admin_deposit_${newDriver.id}_100000` },
                  { text: "💳 Nạp 200k", callback_data: `admin_deposit_${newDriver.id}_200000` },
                  { text: "💳 Nạp 500k", callback_data: `admin_deposit_${newDriver.id}_500000` },
                ],
                [
                  { text: "📊 Mở Trang Quản Trị Admin", url: "https://taxiquangtri.com.vn/admin" },
                ],
              ],
            },
          });
        }

        await sendTelegramApi("answerCallbackQuery", { callback_query_id: callbackId });
        return NextResponse.json({ ok: true });
      }

      // D. BẤM NÚT XEM VÍ & MÃ NẠP CỌC: check_wallet / nap_vi
      if (data === "check_wallet" || data === "nap_vi") {
        const driver = getDriverByTelegramId(telegramId);
        if (driver) {
          const qrUrl = generateDepositVietQRUrl(driver, 500000);
          const isEligible = driver.walletBalance >= (settings.minWalletBalance || 50000);

          const walletMsg = `
💼 <b>VÍ CỌC TÀI XẾ: ${driver.name.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━━━
💰 <b>Số dư hiện tại:</b> <b>${driver.walletBalance.toLocaleString("vi-VN")} VNĐ</b>
🚘 <b>Biển số:</b> <code>${driver.plateNumber}</code> (${driver.carType === "6-seats" ? "6-7 Chỗ" : "4-5 Chỗ"})
📊 <b>Tổng cuốc đã hoàn thành:</b> ${driver.totalTripsCompleted} chuyến
💵 <b>Tổng chiết khấu 15% đã nộp:</b> ${(driver.totalCommissionPaid || 0).toLocaleString("vi-VN")} VNĐ
━━━━━━━━━━━━━━━━━━━━
⚡ <b>Trạng thái nhận cuốc:</b> ${
            isEligible
              ? "✅ <b>ĐỦ ĐIỀU KIỆN NHẬN CUỐC TRONG NHÓM</b>"
              : "⚠️ <b>CẦN NẠP THÊM CỌC (Tối thiểu 50.000đ)</b>"
          }

📲 <b>THÔNG TIN NẠP TIỀN CỌC TẠM ỨNG:</b>
🏦 Ngân hàng: <b>${settings.bankName}</b>
💳 STK: <code>${settings.bankAccount}</code>
👤 Chủ TK: <b>${settings.bankAccountName}</b>
📝 Nội dung: <code>NAP VI ${driver.phone} ${driver.name}</code>
`;

          await sendTelegramApi("sendPhoto", {
            chat_id: telegramId,
            photo: qrUrl,
            caption: walletMsg.trim(),
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🔄 Làm Mới Số Dư", callback_data: "check_wallet" },
                  { text: "📞 Nhắn Zalo Tổng Đài", url: "https://zalo.me/0398567070" },
                ],
              ],
            },
          });
        } else {
          await sendTelegramApi("sendMessage", {
            chat_id: telegramId,
            text: `⚠️ Bạn chưa đăng ký tài xế. Bấm nút dưới đây để đăng ký ngay:`,
            reply_markup: {
              inline_keyboard: [[{ text: "📝 Bấm Đăng Ký Tài Xế", callback_data: "start_reg" }]],
            },
          });
        }

        await sendTelegramApi("answerCallbackQuery", { callback_query_id: callbackId });
        return NextResponse.json({ ok: true });
      }

      // E. ADMIN NẠP TIỀN NHANH CHO TÀI XẾ TỪ TELEGRAM: admin_deposit_<driverId>_<amount>
      if (data.startsWith("admin_deposit_") && (telegramId === OWNER_CHAT_ID || telegramId === "1499064181")) {
        const parts = data.replace("admin_deposit_", "").split("_");
        const targetDriverId = parts[0];
        const depositAmount = parseFloat(parts[1]) || 500000;

        const driver = getDriverById(targetDriverId);
        if (!driver) {
          await sendTelegramApi("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: "❌ Không tìm thấy tài xế này!",
            show_alert: true,
          });
          return NextResponse.json({ ok: true });
        }

        const adjustRes = adjustDriverWallet(
          targetDriverId,
          depositAmount,
          "deposit",
          `Admin nạp tiền nhanh qua Telegram Bot (+${depositAmount.toLocaleString("vi-VN")}đ)`
        );

        await sendTelegramApi("answerCallbackQuery", {
          callback_query_id: callbackId,
          text: `✅ Đã nạp thành công +${depositAmount.toLocaleString("vi-VN")}đ cho Bác tài ${driver.name}!\nSố dư mới: ${adjustRes.balanceAfter?.toLocaleString("vi-VN")}đ`,
          show_alert: true,
        });

        // Báo ngay tin vui cho tài xế
        await sendTelegramApi("sendMessage", {
          chat_id: driver.telegramId,
          text: `
🎉 <b>VÍ CỌC CỦA BẠN ĐÃ ĐƯỢC CỘNG TIỀN!</b>
━━━━━━━━━━━━━━━━━━━━
💵 <b>Số tiền nạp:</b> <b>+${depositAmount.toLocaleString("vi-VN")} VNĐ</b>
💼 <b>Số dư ví hiện tại:</b> <b>${adjustRes.balanceAfter?.toLocaleString("vi-VN")} VNĐ</b>
✅ <b>Trạng thái:</b> Đã sẵn sàng nhận các chuyến xe trong nhóm với chiết khấu 15%!
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Chúc Bác tài luôn vạn dặm bình an và nhận được nhiều cuốc xe!</i>
`.trim(),
          parse_mode: "HTML",
        });

        return NextResponse.json({ ok: true });
      }
    }

    // =========================================================================
    // 2. XỬ LÝ SỰ KIỆN CÓ THÀNH VIÊN MỚI THAM GIA NHÓM (NEW CHAT MEMBERS)
    // =========================================================================
    if (update.message?.new_chat_members) {
      const newMembers = update.message.new_chat_members;
      const chatId = update.message.chat.id;

      for (const member of newMembers) {
        if (member.is_bot) continue;

        const memberName = member.first_name || "Bác tài";
        const welcomeText = `
👋 <b>CHÀO MỪNG BÁC TÀI ${memberName.toUpperCase()} ĐẾN VỚI ĐỘI XE ${siteConfig.name.toUpperCase()}!</b>
━━━━━━━━━━━━━━━━━━━━
🚕 Để tham gia nhận các chuyến xe tự động đổ về nhóm với mức <b>chiết khấu 15%</b>, Bác tài vui lòng:

1️⃣ Bấm nút <b>[ 💬 MỞ CHAT RIÊNG ĐĂNG KÝ ]</b> bên dưới.
2️⃣ Nhập Họ tên, Số điện thoại & Biển số xe trong tin nhắn riêng với Bot.
3️⃣ Nạp tiền cọc tạm ứng tối thiểu <b>50.000 VNĐ</b> để sẵn sàng nhận cuốc.
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Bấm nút bên dưới để mở tin nhắn riêng 1-1 với Bot (bảo mật thông tin):</i>
`;

        await sendTelegramApi("sendMessage", {
          chat_id: chatId,
          text: welcomeText.trim(),
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "💬 [ BẤM ĐĂNG KÝ RIÊNG VỚI BOT ]",
                  url: "https://t.me/Dolysmart_Bot?start=dangky",
                },
              ],
            ],
          },
        });
      }
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // 3. XỬ LÝ TIN NHẮN CHAT VỚI BOT TELEGRAM (/start, /dangky, /vi, flow đăng ký)
    // =========================================================================
    if (update.message) {
      const msg = update.message;
      const text = (msg.text || "").trim();
      const chatId = msg.chat.id;
      const chatType = msg.chat.type || "private";
      const isPrivate = chatType === "private";
      const telegramId = String(msg.from?.id || "");
      const telegramUsername = msg.from?.username;
      const userName = msg.from?.first_name || "Bác tài";

      // -----------------------------------------------------------------------
      // A. NẾU LÀ TIN NHẮN TRONG NHÓM (GROUP / SUPERGROUP):
      //    TỰ ĐỘNG LIÊN KẾT NHÓM NHẬN CUỐC & BẢO VỆ THÔNG TIN CÁ NHÂN.
      // -----------------------------------------------------------------------
      if (!isPrivate) {
        const chatIdStr = String(chatId);

        // Tự động lưu và cập nhật ID nhóm làm nhóm nhận cuốc chính nếu chưa có
        if (!settings.telegramGroupId || settings.telegramGroupId !== chatIdStr) {
          saveFleetSettings({ telegramGroupId: chatIdStr });
        }

        // Lệnh /setgroup hoặc /kichhoat để kết nối nhóm nhận cuốc
        if (
          text.startsWith("/setgroup") ||
          text.startsWith("/kichhoat") ||
          text.startsWith("/nhan_cuoc") ||
          text === "/start group"
        ) {
          saveFleetSettings({ telegramGroupId: chatIdStr });
          await sendTelegramApi("sendMessage", {
            chat_id: chatId,
            text: `
✅ <b>ĐÃ KÍCH HOẠT NHÓM NHẬN CUỐC THÀNH CÔNG!</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>ID Nhóm:</b> <code>${chatIdStr}</code>
🚕 Kể từ bây giờ, tất cả các chuyến xe khách đặt trên website sẽ được tự động bắn vào nhóm này kèm nút <b>[ 🚕 BẤM NHẬN CUỐC NÀY ]</b> để các Bác tài nhận khách!
⚡ Mức chiết khấu tự động trừ ví: <b>${Math.round((settings.commissionRate || 0.15) * 100)}%</b>/cuốc.
`.trim(),
            parse_mode: "HTML",
          });
          return NextResponse.json({ ok: true });
        }

        // Nếu bác tài gõ lệnh đăng ký trong nhóm
        if (text.startsWith("/start") || text.startsWith("/dangky") || text.toLowerCase().includes("đăng ký")) {
          await sendTelegramApi("sendMessage", {
            chat_id: chatId,
            text: `👋 Chào Bác tài <b>${userName}</b>! Để bảo mật thông tin cá nhân (SĐT, Biển số xe, Ví cọc), Bác tài vui lòng bấm nút bên dưới để nhắn tin riêng với Bot nhé:`,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "💬 [ MỞ TIN NHẮN RIÊNG VỚI BOT ]",
                    url: "https://t.me/Dolysmart_Bot?start=dangky",
                  },
                ],
              ],
            },
          });
          return NextResponse.json({ ok: true });
        }

        // Nếu bác tài gõ lệnh kiểm tra ví trong nhóm
        if (
          text === "/vi" ||
          text === "/sodu" ||
          text === "/napvi" ||
          text === "/naptien" ||
          text.toLowerCase().includes("nạp ví") ||
          text.toLowerCase().includes("số dư")
        ) {
          await sendTelegramApi("sendMessage", {
            chat_id: chatId,
            text: `💼 Bác tài <b>${userName}</b> vui lòng kiểm tra số dư ví và thông tin chuyển khoản nạp cọc trong tin nhắn riêng với Bot để bảo mật:`,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "💼 [ MỞ VÍ TRONG CHAT RIÊNG ]",
                    url: "https://t.me/Dolysmart_Bot?start=vi",
                  },
                ],
              ],
            },
          });
          return NextResponse.json({ ok: true });
        }

        // Lệnh /myid trong nhóm
        if (text === "/myid") {
          await sendTelegramApi("sendMessage", {
            chat_id: chatId,
            text: `🆔 <b>Mã Telegram ID của bạn là:</b> <code>${telegramId}</code>\n🆔 <b>ID Nhóm hiện tại:</b> <code>${chatIdStr}</code>`,
            parse_mode: "HTML",
          });
          return NextResponse.json({ ok: true });
        }

        // Với mọi tin nhắn text thông thường khác trong nhóm -> BỎ QUA HOÀN TOÀN để nhóm không bị loãng
        return NextResponse.json({ ok: true });
      }

      // -----------------------------------------------------------------------
      // B. NẾU LÀ TIN NHẮN RIÊNG 1-1 VỚI BOT (PRIVATE CHAT):
      //    XỬ LÝ ĐẦY ĐỦ QUY TRÌNH ĐĂNG KÝ, TRA CỨU VÍ VÀ NẠP TIỀN BẢO MẬT.
      // -----------------------------------------------------------------------

      // Lệnh /myid trong chat riêng
      if (text === "/myid") {
        await sendTelegramApi("sendMessage", {
          chat_id: telegramId,
          text: `🆔 <b>Mã Telegram ID của bạn là:</b> <code>${telegramId}</code>\n\nHãy gửi mã số này cho tổng đài để kích hoạt tài khoản tài xế nhé!`,
          parse_mode: "HTML",
        });
        return NextResponse.json({ ok: true });
      }

      // Lệnh /vi, /sodu, /napvi, /naptien trong chat riêng
      if (
        text === "/vi" ||
        text === "/sodu" ||
        text === "/napvi" ||
        text === "/naptien" ||
        text === "/start vi" ||
        text.toLowerCase().includes("nạp ví") ||
        text.toLowerCase().includes("số dư")
      ) {
        const driver = getDriverByTelegramId(telegramId);
        if (driver) {
          const qrUrl = generateDepositVietQRUrl(driver, 500000);
          const isEligible = driver.walletBalance >= (settings.minWalletBalance || 50000);

          await sendTelegramApi("sendPhoto", {
            chat_id: telegramId,
            photo: qrUrl,
            caption: `
💼 <b>THÔNG TIN VÍ CỌC TÀI XẾ</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Bác tài:</b> ${driver.name}
🚘 <b>Xe:</b> <code>${driver.plateNumber}</code> (${driver.carType === "6-seats" ? "6-7 Chỗ" : "4-5 Chỗ"})
💰 <b>Số dư ví hiện tại:</b> <b>${driver.walletBalance.toLocaleString("vi-VN")} VNĐ</b>
📊 <b>Tổng cuốc đã nhận:</b> ${driver.totalTripsCompleted} chuyến
💵 <b>Tổng chiết khấu 15% đã nộp:</b> ${(driver.totalCommissionPaid || 0).toLocaleString("vi-VN")} VNĐ
━━━━━━━━━━━━━━━━━━━━
${
  isEligible
    ? "✅ <b>Trạng thái:</b> Đủ điều kiện nhận cuốc trong nhóm"
    : "⚠️ <b>Trạng thái:</b> Số dư thấp, hãy nạp thêm để không bỏ lỡ cuốc mới!"
}

📲 <b>Cú pháp chuyển khoản nạp cọc:</b>
🏦 Ngân hàng: <b>${settings.bankName}</b>
💳 STK: <code>${settings.bankAccount}</code>
👤 Chủ TK: <b>${settings.bankAccountName}</b>
📝 Nội dung: <code>NAP VI ${driver.phone} ${driver.name}</code>
`.trim(),
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🔄 Làm Mới Số Dư", callback_data: "check_wallet" },
                  { text: "💬 Nhắn Zalo Hỗ Trợ", url: "https://zalo.me/0398567070" },
                ],
              ],
            },
          });
        } else {
          await sendTelegramApi("sendMessage", {
            chat_id: telegramId,
            text: `⚠️ Bạn chưa đăng ký tài xế trên hệ thống. Bấm nút dưới đây để đăng ký tài khoản & nạp ví nhé:`,
            reply_markup: {
              inline_keyboard: [[{ text: "📝 Đăng Ký Tài Xế Mới", callback_data: "start_reg" }]],
            },
          });
        }
        return NextResponse.json({ ok: true });
      }

      // Lệnh /start hoặc /dangky trong chat riêng
      if (text.startsWith("/start") || text.startsWith("/dangky")) {
        const driver = getDriverByTelegramId(telegramId);
        if (driver) {
          const qrUrl = generateDepositVietQRUrl(driver, 500000);
          await sendTelegramApi("sendMessage", {
            chat_id: telegramId,
            text: `
👋 Chào Bác tài <b>${driver.name}</b>!
━━━━━━━━━━━━━━━━━━━━
🚘 <b>Xe:</b> <code>${driver.plateNumber}</code> (${driver.carType === "6-seats" ? "6-7 Chỗ" : "4-5 Chỗ"})
💰 <b>Số dư ví cọc hiện tại:</b> <b>${driver.walletBalance.toLocaleString("vi-VN")} VNĐ</b>
📊 <b>Tổng cuốc đã chạy:</b> ${driver.totalTripsCompleted} chuyến
━━━━━━━━━━━━━━━━━━━━
👉 Khi có đơn mới bắn vào nhóm Telegram, hãy bấm <b>[ 🚕 BẤM NHẬN CUỐC NÀY ]</b> để nhận khách.
👉 Gõ <code>/vi</code> bất cứ lúc nào để kiểm tra số dư và lấy mã VietQR nạp cọc.
`.trim(),
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "💳 Nạp Tiền Cọc Ví", callback_data: "check_wallet" },
                  { text: "📊 Xem Số Dư Ví", callback_data: "check_wallet" },
                ],
              ],
            },
          });
          return NextResponse.json({ ok: true });
        }

        // Bắt đầu quy trình đăng ký
        setRegistrationSession({
          telegramId,
          step: "name",
          telegramUsername,
          updatedAt: Date.now(),
        });

        await sendTelegramApi("sendMessage", {
          chat_id: telegramId,
          text: `
🚖 <b>ĐĂNG KÝ TÀI XẾ - ${siteConfig.name.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━━━
Chào Bác tài <b>${userName}</b>! Để tham gia nhận các chuyến xe tự động với mức chiết khấu **15%/cuốc**, Bác tài hãy hoàn thành 4 bước đăng ký nhanh sau:

👉 <b>Bước 1/4:</b> Vui lòng nhập <b>Họ và Tên</b> của Bác tài (Ví dụ: <i>Nguyễn Văn Hùng</i>):
`.trim(),
          parse_mode: "HTML",
        });
        return NextResponse.json({ ok: true });
      }

      // =======================================================================
      // 4. XỬ LÝ CÁC BƯỚC ĐIỀN FORM ĐĂNG KÝ TRONG CHAT RIÊNG
      // =======================================================================
      const session = getRegistrationSession(telegramId);
      if (session) {
        // BƯỚC 1: NHẬP TÊN ➔ HỎI SĐT
        if (session.step === "name") {
          const name = text.replace(/[\n\r]/g, " ").trim();
          if (name.length < 2) {
            await sendTelegramApi("sendMessage", {
              chat_id: telegramId,
              text: "⚠️ Vui lòng nhập Họ và Tên đầy đủ (ít nhất 2 ký tự):",
            });
            return NextResponse.json({ ok: true });
          }

          session.name = name;
          session.step = "phone";
          session.updatedAt = Date.now();
          setRegistrationSession(session);

          await sendTelegramApi("sendMessage", {
            chat_id: telegramId,
            text: `
✅ <b>Họ và tên:</b> <b>${name}</b>
━━━━━━━━━━━━━━━━━━━━
👉 <b>Bước 2/4:</b> Vui lòng nhập <b>Số điện thoại</b> liên hệ của Bác tài (Ví dụ: <i>0912345678</i>):
`.trim(),
            parse_mode: "HTML",
          });
          return NextResponse.json({ ok: true });
        }

        // BƯỚC 2: NHẬP SĐT ➔ HỎI BIỂN SỐ XE
        if (session.step === "phone") {
          let phone = text.replace(/\D/g, "");
          if (msg.contact?.phone_number) {
            phone = msg.contact.phone_number.replace(/\D/g, "");
          }

          const validation = isValidVietnamesePhone(phone);
          if (!validation.valid && phone.length < 9) {
            await sendTelegramApi("sendMessage", {
              chat_id: telegramId,
              text: `⚠️ Số điện thoại không hợp lệ. Vui lòng nhập lại số điện thoại 10 số (Ví dụ: 0912345678):`,
            });
            return NextResponse.json({ ok: true });
          }

          session.phone = phone;
          session.step = "plate";
          session.updatedAt = Date.now();
          setRegistrationSession(session);

          await sendTelegramApi("sendMessage", {
            chat_id: telegramId,
            text: `
✅ <b>Số điện thoại:</b> <code>${phone}</code>
━━━━━━━━━━━━━━━━━━━━
👉 <b>Bước 3/4:</b> Vui lòng nhập <b>Biển số xe</b> của Bác tài (Ví dụ: <i>74A-123.45</i> hoặc <i>73A-567.89</i>):
`.trim(),
            parse_mode: "HTML",
          });
          return NextResponse.json({ ok: true });
        }

        // BƯỚC 3: NHẬP BIỂN SỐ ➔ HIỂN THỊ NÚT CHỌN DÒNG XE
        if (session.step === "plate") {
          const plate = text.replace(/[\s]/g, "").toUpperCase();
          if (plate.length < 5) {
            await sendTelegramApi("sendMessage", {
              chat_id: telegramId,
              text: `⚠️ Biển số xe không hợp lệ. Vui lòng nhập biển số xe (Ví dụ: 74A-123.45):`,
            });
            return NextResponse.json({ ok: true });
          }

          session.plateNumber = plate;
          session.step = "cartype";
          session.updatedAt = Date.now();
          setRegistrationSession(session);

          await sendTelegramApi("sendMessage", {
            chat_id: telegramId,
            text: `
✅ <b>Biển số xe:</b> <code>${plate}</code>
━━━━━━━━━━━━━━━━━━━━
👉 <b>Bước 4/4:</b> Vui lòng chọn <b>Dòng xe</b> của Bác tài bằng cách bấm nút dưới đây:
`.trim(),
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🚗 Xe 4 - 5 Chỗ (Sedan / Vios / Accent)", callback_data: "reg_cartype_4-seats" },
                ],
                [
                  { text: "🚙 Xe 6 - 7 Chỗ (MPV / SUV / Xpander / Innova)", callback_data: "reg_cartype_6-seats" },
                ],
                [
                  { text: "🚐 Xe 16 Chỗ Du Lịch (Ford Transit / Solati)", callback_data: "reg_cartype_16-seats" },
                ],
                [
                  { text: "👑 VIP Limousine 9 Chỗ", callback_data: "reg_cartype_vip-limousine" },
                ],
              ],
            },
          });
          return NextResponse.json({ ok: true });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
