import { NextResponse } from "next/server";
import {
  getDrivers,
  saveDrivers,
  deleteDriver,
  getWalletTransactions,
  getFleetSettings,
  saveFleetSettings,
  adjustDriverWallet,
  loadFleetStateFromTelegramCloud,
  syncFleetStateToTelegramCloud,
} from "@/lib/drivers";
import { Driver } from "@/types";
import { getAdminSessionFromRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET: Lấy danh sách tài xế, giao dịch ví và cấu hình (Yêu cầu quyền Admin)
 */
export async function GET(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Yêu cầu quyền Quản trị viên để xem danh sách tài xế!" },
      { status: 401 }
    );
  }

  try {
    await loadFleetStateFromTelegramCloud();

    const drivers = getDrivers();
    const transactions = getWalletTransactions();
    const settings = getFleetSettings();

    return NextResponse.json({
      success: true,
      data: {
        drivers,
        transactions,
        settings,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi tải dữ liệu tài xế" },
      { status: 500 }
    );
  }
}

/**
 * POST: Tạo tài khoản tài xế mới (Yêu cầu quyền Admin)
 */
export async function POST(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Yêu cầu quyền Quản trị viên để thêm tài xế!" },
      { status: 401 }
    );
  }

  try {
    await loadFleetStateFromTelegramCloud();

    const body = await request.json();
    const { name, phone, plateNumber, carType, region, telegramId, telegramUsername, initialDeposit } = body;

    if (!name || !phone || !plateNumber || !telegramId) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ Tên, SĐT, Biển số xe và Telegram ID!" },
        { status: 400 }
      );
    }

    const drivers = getDrivers();
    
    // Kiểm tra trùng lặp
    const existing = drivers.find((d) => d.telegramId === telegramId || d.phone === phone);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Tài xế với SĐT hoặc Telegram ID này đã tồn tại trong hệ thống!" },
        { status: 400 }
      );
    }

    const depositAmount = parseFloat(initialDeposit) || 0;

    const newDriver: Driver = {
      id: `DRV-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      phone: phone.trim(),
      plateNumber: plateNumber.trim().toUpperCase(),
      carType: carType || "4-seats",
      region: region || "Toàn tỉnh",
      telegramId: String(telegramId).trim(),
      telegramUsername: telegramUsername ? telegramUsername.replace("@", "").trim() : undefined,
      walletBalance: depositAmount,
      status: "active",
      totalTripsCompleted: 0,
      totalEarnings: 0,
      totalCommissionPaid: 0,
      registeredAt: new Date().toISOString(),
    };

    drivers.unshift(newDriver);
    saveDrivers(drivers);

    // Nếu có nạp tiền cọc ban đầu -> ghi nhận giao dịch
    if (depositAmount > 0) {
      adjustDriverWallet(
        newDriver.id,
        depositAmount,
        "deposit",
        `Nạp tiền cọc tạm ứng ban đầu khi tạo tài khoản`
      );
    }

    // Đồng bộ lên Telegram Cloud
    await syncFleetStateToTelegramCloud();

    return NextResponse.json({
      success: true,
      message: "Thêm tài xế thành công!",
      driver: newDriver,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi tạo tài khoản tài xế" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Nạp/rút tiền ví, cập nhật trạng thái, sửa cài đặt (Yêu cầu quyền Admin)
 */
export async function PATCH(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Yêu cầu quyền Quản trị viên để chỉnh sửa thông tin!" },
      { status: 401 }
    );
  }

  try {
    await loadFleetStateFromTelegramCloud();

    const body = await request.json();
    const { action, driverId, amount, description, status, settings } = body;

    // 1. Cập nhật cài đặt hệ thống đội xe
    if (action === "update_settings" && settings) {
      const updatedSettings = saveFleetSettings(settings);
      await syncFleetStateToTelegramCloud();
      return NextResponse.json({
        success: true,
        message: "Cập nhật cài đặt chiết khấu và hệ thống thành công!",
        settings: updatedSettings,
      });
    }

    // 2. Nạp tiền vào ví cọc
    if (action === "deposit_wallet" && driverId && amount) {
      const result = adjustDriverWallet(
        driverId,
        Math.abs(parseFloat(amount)),
        "deposit",
        description || "Nạp tiền cọc tạm ứng qua ngân hàng / tiền mặt"
      );
      await syncFleetStateToTelegramCloud();
      return NextResponse.json(result);
    }

    // 3. Rút tiền / Hoàn cọc
    if (action === "withdraw_wallet" && driverId && amount) {
      const withdrawAmount = Math.abs(parseFloat(amount));
      const result = adjustDriverWallet(
        driverId,
        -withdrawAmount,
        "refund",
        description || "Rút tiền / Hoàn trả tiền cọc cho tài xế"
      );
      await syncFleetStateToTelegramCloud();
      return NextResponse.json(result);
    }

    // 4. Cập nhật trạng thái hoạt động của tài xế
    if (action === "update_status" && driverId && status) {
      const drivers = getDrivers();
      const index = drivers.findIndex((d) => d.id === driverId);
      if (index === -1) {
        return NextResponse.json({ success: false, message: "Không tìm thấy tài xế!" }, { status: 404 });
      }
      drivers[index].status = status;
      saveDrivers(drivers);
      await syncFleetStateToTelegramCloud();
      return NextResponse.json({ success: true, message: "Cập nhật trạng thái tài xế thành công!", driver: drivers[index] });
    }

    // 5. Xóa tài xế khỏi hệ thống
    if (action === "delete_driver" && driverId) {
      deleteDriver(driverId);
      await syncFleetStateToTelegramCloud();
      return NextResponse.json({ success: true, message: "Đã xóa tài xế thành công!" });
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ!" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi xử lý yêu cầu" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Xóa tài xế (Yêu cầu quyền Admin)
 */
export async function DELETE(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Yêu cầu quyền Quản trị viên để xóa tài xế!" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
      deleteDriver(id);
      await syncFleetStateToTelegramCloud();
      return NextResponse.json({ success: true, message: "Đã xóa tài xế thành công!" });
    }
    return NextResponse.json({ success: false, message: "Thiếu mã tài xế" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
