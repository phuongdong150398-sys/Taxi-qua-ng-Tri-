import { NextResponse } from "next/server";
import { payOS, extractPhoneFromDescription } from "@/lib/payos";
import {
  getDrivers,
  adjustDriverWallet,
  getWalletTransactions,
  loadFleetStateFromTelegramCloud,
  syncFleetStateToTelegramCloud,
} from "@/lib/drivers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
  "8888405865:AAG0tj-prAYFngu4qlcRYBtF2T_13xHZQo4";

const OWNER_CHAT_ID =
  process.env.TELEGRAM_CHAT_ID ||
  process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ||
  "1499064181";

async function sendTelegramMsg(chatId: string | number, text: string, replyMarkup?: any) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.trim(),
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }),
    });
  } catch (e) {
    console.error("Telegram send error in payOS webhook:", e);
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "payOS Webhook Service for Taxi Quảng Trị",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Xác thực dữ liệu webhook từ payOS
    let webhookData: any = body?.data || body;
    try {
      if (body && body.data && body.signature) {
        webhookData = await payOS.webhooks.verify(body);
      }
    } catch (verifyErr) {
      console.warn("payOS signature verify warning (fallback to raw body.data):", verifyErr);
      webhookData = body?.data || body;
    }

    if (!webhookData) {
      return NextResponse.json({ success: true, message: "Empty webhook data" });
    }

    // Trường hợp payOS gửi test ping khi cấu hình webhook URL
    if (webhookData.description === "Ma giao dich thu nghiem" || webhookData.orderCode === 123) {
      return NextResponse.json({ success: true, message: "Webhook test verified successfully" });
    }

    const amount = Number(webhookData.amount) || 0;
    const description = String(webhookData.description || "").trim();
    const reference = String(webhookData.reference || webhookData.orderCode || "");
    const orderCode = webhookData.orderCode;

    if (amount <= 0) {
      return NextResponse.json({ success: true, message: "Amount is zero or negative, skipped" });
    }

    // 2. Tải dữ liệu Đội xe & Ví cọc từ Google Firestore
    await loadFleetStateFromTelegramCloud();

    // 3. Kiểm tra chống cộng tiền trùng lặp (Idempotency)
    const txId = reference ? `TXN-POS-${reference}` : `TXN-POS-${orderCode || Date.now()}`;
    const existingTransactions = getWalletTransactions();
    const isDuplicate = existingTransactions.some(
      (t) => t.id === txId || (reference && t.description?.includes(reference))
    );

    if (isDuplicate) {
      return NextResponse.json({
        success: true,
        message: `Transaction ${reference} already processed. Skipped to prevent duplicate top-up.`,
      });
    }

    // 4. Tìm kiếm tài xế tương ứng từ nội dung chuyển khoản
    const phone = extractPhoneFromDescription(description);
    const drivers = getDrivers();
    let matchedDriver = null;

    if (phone) {
      const cleanTarget = phone.replace(/\D/g, "");
      matchedDriver = drivers.find((d) => d.phone.replace(/\D/g, "").endsWith(cleanTarget.slice(-9)));
    }

    // Nếu không khớp theo SĐT, thử tìm theo Mã tài xế trong nội dung (ví dụ: DRV-1234)
    if (!matchedDriver) {
      const drvIdMatch = description.toUpperCase().match(/DRV[ -]?\d{4}/);
      if (drvIdMatch) {
        const cleanId = drvIdMatch[0].replace(" ", "-");
        matchedDriver = drivers.find((d) => d.id.toUpperCase() === cleanId);
      }
    }

    // Nếu không khớp theo ID, thử tìm theo tên tài xế
    if (!matchedDriver) {
      const upperDesc = description.toUpperCase();
      matchedDriver = drivers.find(
        (d) => d.name && upperDesc.includes(d.name.toUpperCase().trim())
      );
    }

    // 5. NẾU TÌM THẤY TÀI XẾ ➔ TỰ ĐỘNG CỘNG TIỀN VÀO VÍ
    if (matchedDriver) {
      const walletResult = adjustDriverWallet(
        matchedDriver.id,
        amount,
        "deposit",
        `Tự động nạp qua payOS/MBBank (${reference || orderCode})`
      );

      // Đồng bộ ngay lên Firestore
      await syncFleetStateToTelegramCloud();

      // Gửi tin nhắn Telegram chúc mừng cho tài xế
      if (matchedDriver.telegramId) {
        const driverCongrats = `
🎉 <b>VÍ CỌC CỦA BẠN ĐÃ ĐƯỢC TỰ ĐỘNG CỘNG TIỀN!</b>
━━━━━━━━━━━━━━━━━━━━
💵 <b>Số tiền nạp:</b> <b>+${amount.toLocaleString("vi-VN")} VNĐ</b>
💼 <b>Số dư ví hiện tại:</b> <b>${walletResult.balanceAfter?.toLocaleString("vi-VN")} VNĐ</b>
🏦 <b>Kênh thanh toán:</b> MBBank (Tự động 24/7)
📝 <b>Nội dung CK:</b> <code>${description}</code>
🆔 <b>Mã giao dịch:</b> <code>${reference || orderCode}</code>
⏰ <b>Thời gian:</b> ${new Date().toLocaleTimeString("vi-VN")}
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Chúc Bác tài luôn vạn dặm bình an và nhận được nhiều cuốc xe!</i>
`;
        await sendTelegramMsg(matchedDriver.telegramId, driverCongrats, {
          inline_keyboard: [
            [{ text: "💼 Xem Số Dư Ví", callback_data: "check_wallet" }],
          ],
        });
      }

      // Gửi tin nhắn thông báo cho Admin
      if (OWNER_CHAT_ID) {
        const adminNotice = `
🔔 <b>TỰ ĐỘNG NẠP VÍ TÀI XẾ THÀNH CÔNG (payOS)!</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Bác tài:</b> <b>${matchedDriver.name}</b> (<code>${matchedDriver.phone}</code> - ${matchedDriver.plateNumber})
💵 <b>Số tiền nạp:</b> <b>+${amount.toLocaleString("vi-VN")} VNĐ</b>
💼 <b>Số dư sau khi nạp:</b> <b>${walletResult.balanceAfter?.toLocaleString("vi-VN")} VNĐ</b>
📝 <b>Nội dung CK:</b> <code>${description}</code>
🆔 <b>Mã GD:</b> <code>${reference || orderCode}</code>
⏰ <b>Thời gian:</b> ${new Date().toLocaleTimeString("vi-VN")}
`;
        await sendTelegramMsg(OWNER_CHAT_ID, adminNotice);
      }

      return NextResponse.json({
        success: true,
        message: `Successfully credited +${amount} VND to driver ${matchedDriver.name}`,
        driverId: matchedDriver.id,
        balanceAfter: walletResult.balanceAfter,
      });
    }

    // 6. NẾU KHÔNG TÌM THẤY TÀI XẾ TƯƠNG ỨNG (Gửi cảnh báo cho Admin để nạp thủ công nếu cần)
    if (OWNER_CHAT_ID) {
      const unknownNotice = `
⚠️ <b>NHẬN ĐƯỢC TIỀN VÀO MBBANK NHƯNG CHƯA KHỚP TÀI XẾ:</b>
━━━━━━━━━━━━━━━━━━━━
💵 <b>Số tiền:</b> <b>+${amount.toLocaleString("vi-VN")} VNĐ</b>
📝 <b>Nội dung:</b> <code>${description}</code>
🆔 <b>Mã GD:</b> <code>${reference || orderCode}</code>
⏰ <b>Thời gian:</b> ${new Date().toLocaleTimeString("vi-VN")}
━━━━━━━━━━━━━━━━━━━━
👉 Bác tài có thể đã ghi sai cú pháp SĐT. Bạn có thể vào trang Quản trị Admin để kiểm tra và nạp tay cho tài xế.
`;
      await sendTelegramMsg(OWNER_CHAT_ID, unknownNotice, {
        inline_keyboard: [
          [{ text: "📊 Mở Trang Quản Trị Admin", url: "https://taxiquangtri.com.vn/admin" }],
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Received payment, but no matching driver found from description.",
      description,
      amount,
    });
  } catch (error: any) {
    console.error("payOS Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
