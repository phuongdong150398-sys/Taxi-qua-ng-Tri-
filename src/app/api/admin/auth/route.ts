import { NextResponse } from "next/server";
import {
  getFleetSettings,
  saveFleetSettings,
  loadFleetStateFromTelegramCloud,
  syncFleetStateToTelegramCloud,
} from "@/lib/drivers";
import {
  checkPinRateLimit,
  recordPinFailure,
  resetPinFailures,
  createAdminToken,
  getAdminSessionFromRequest,
  createAdminSessionCookie,
  createAdminLogoutCookie,
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "127.0.0.1";
}

/**
 * GET: Kiểm tra trạng thái phiên làm việc Admin & cấu hình PIN
 */
export async function GET(request: Request) {
  try {
    await loadFleetStateFromTelegramCloud();
    const settings = getFleetSettings();
    const isAuthenticated = getAdminSessionFromRequest(request);

    return NextResponse.json({
      success: true,
      authenticated: isAuthenticated,
      hasCustomPin: Boolean(settings.adminPin && settings.adminPin !== "8888"),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

/**
 * POST: Xử lý Đăng nhập, Đổi mã PIN, Đăng xuất
 */
export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  try {
    await loadFleetStateFromTelegramCloud();
    const settings = getFleetSettings();
    const currentValidPin = (settings.adminPin || "8888").trim();

    const body = await request.json();
    const action = body?.action || "verify";

    // ==========================================
    // 1. ĐĂNG XUẤT (LOGOUT)
    // ==========================================
    if (action === "logout") {
      const response = NextResponse.json({
        success: true,
        message: "Đã đăng xuất khỏi tài khoản Quản trị viên an toàn!",
      });
      response.headers.set("Set-Cookie", createAdminLogoutCookie());
      return response;
    }

    // ==========================================
    // 2. XÁC THỰC MÃ PIN ĐĂNG NHẬP (VERIFY)
    // ==========================================
    if (action === "verify") {
      // Kiểm tra khóa Brute-force
      const rateLimit = checkPinRateLimit(clientIp);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            message: `Bạn đã nhập sai mã PIN quá nhiều lần. Vui lòng thử lại sau ${rateLimit.lockMinutes} phút!`,
          },
          { status: 429 }
        );
      }

      const inputPin = String(body?.pin || "").trim();
      if (!inputPin) {
        return NextResponse.json(
          { success: false, message: "Vui lòng nhập mã PIN bảo mật!" },
          { status: 400 }
        );
      }

      if (inputPin === currentValidPin) {
        // Đúng mã PIN: Reset số lần sai và cấp Signed HttpOnly Token
        resetPinFailures(clientIp);
        const token = createAdminToken();

        const response = NextResponse.json({
          success: true,
          message: "Xác thực mã PIN thành công!",
          token,
        });

        // Đặt HttpOnly Cookie bảo vệ phiên làm việc
        response.headers.set("Set-Cookie", createAdminSessionCookie(token));
        return response;
      } else {
        // Sai mã PIN: Ghi nhận và cảnh báo số lần còn lại
        const failure = recordPinFailure(clientIp);
        if (failure.locked) {
          return NextResponse.json(
            {
              success: false,
              message: "Bạn đã nhập sai mã PIN 5 lần! Hệ thống tạm thời khóa đăng nhập trong 15 phút.",
            },
            { status: 429 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            message: `Mã PIN không chính xác! Bạn còn ${failure.remainingAttempts} lần thử trước khi bị khóa.`,
          },
          { status: 401 }
        );
      }
    }

    // ==========================================
    // 3. ĐỔI MÃ PIN MỚI (YÊU CẦU MÃ PIN CŨ HOẶC PHIÊN ĐĂNG NHẬP HỢP LỆ)
    // ==========================================
    if (action === "change_pin") {
      const isCurrentlyAuth = getAdminSessionFromRequest(request);
      const providedCurrentPin = String(body?.currentPin || "").trim();

      // Bắt buộc: Hoặc có session cookie hợp lệ, hoặc cung cấp đúng mã PIN hiện tại
      if (!isCurrentlyAuth && providedCurrentPin !== currentValidPin) {
        return NextResponse.json(
          {
            success: false,
            message: "Xác thực thất bại! Bạn phải nhập đúng mã PIN hiện tại để đổi mã PIN mới.",
          },
          { status: 401 }
        );
      }

      const newPin = String(body?.newPin || "").trim();
      if (!newPin || newPin.length < 4 || !/^\d+$/.test(newPin)) {
        return NextResponse.json(
          { success: false, message: "Mã PIN mới phải gồm ít nhất 4 chữ số!" },
          { status: 400 }
        );
      }

      // Lưu mã PIN mới lên Google Cloud Firestore
      saveFleetSettings({ adminPin: newPin });
      await syncFleetStateToTelegramCloud();

      // Cấp token mới với PIN mới
      const newToken = createAdminToken();
      const response = NextResponse.json({
        success: true,
        message: "✓ Đổi mã PIN thành công! Đã đồng bộ lên toàn bộ hệ thống.",
      });
      response.headers.set("Set-Cookie", createAdminSessionCookie(newToken));
      return response;
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
