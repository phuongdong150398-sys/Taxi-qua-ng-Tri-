import { NextResponse } from "next/server";
import {
  getFleetSettings,
  saveFleetSettings,
  loadFleetStateFromTelegramCloud,
  syncFleetStateToTelegramCloud,
} from "@/lib/drivers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await loadFleetStateFromTelegramCloud();
    const settings = getFleetSettings();
    return NextResponse.json({
      success: true,
      hasCustomPin: Boolean(settings.adminPin && settings.adminPin !== "8888"),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Tải cấu hình mới nhất từ Cloud Firestore
    await loadFleetStateFromTelegramCloud();
    const settings = getFleetSettings();
    const currentValidPin = (settings.adminPin || "8888").trim();

    const body = await request.json();
    const action = body?.action || "verify";

    // 2. XÁC THỰC ĐĂNG NHẬP MÃ PIN
    if (action === "verify") {
      const inputPin = String(body?.pin || "").trim();
      if (!inputPin) {
        return NextResponse.json(
          { success: false, message: "Vui lòng nhập mã PIN bảo mật!" },
          { status: 400 }
        );
      }

      if (inputPin === currentValidPin) {
        return NextResponse.json({
          success: true,
          message: "Xác thực mã PIN thành công!",
        });
      } else {
        return NextResponse.json(
          { success: false, message: "Mã PIN không chính xác! Vui lòng thử lại." },
          { status: 401 }
        );
      }
    }

    // 3. ĐỔI MÃ PIN MỚI & ĐỒNG BỘ TOÀN BỘ THIẾT BỊ (ĐIỆN THOẠI, MÁY TÍNH)
    if (action === "change_pin") {
      const newPin = String(body?.newPin || "").trim();

      if (!newPin || newPin.length < 4) {
        return NextResponse.json(
          { success: false, message: "Mã PIN mới phải có ít nhất 4 ký tự số!" },
          { status: 400 }
        );
      }

      // Cập nhật và lưu vĩnh viễn lên Google Cloud Firestore
      saveFleetSettings({ adminPin: newPin });
      await syncFleetStateToTelegramCloud();

      return NextResponse.json({
        success: true,
        message: "✓ Đổi mã PIN thành công! Mã PIN mới đã được đồng bộ lên toàn bộ các thiết bị (Điện thoại, Máy tính).",
      });
    }

    return NextResponse.json(
      { success: false, message: "Hành động không hợp lệ!" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Admin Auth API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi xử lý xác thực" },
      { status: 500 }
    );
  }
}
