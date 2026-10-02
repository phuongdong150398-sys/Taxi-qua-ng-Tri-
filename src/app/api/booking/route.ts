import { NextResponse } from "next/server";
import { BookingRecord, BookingFormInput } from "@/types";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function getBookings(): BookingRecord[] {
  try {
    ensureDataFile();
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading bookings file:", error);
    return [];
  }
}

function saveBookings(bookings: BookingRecord[]) {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving bookings file:", error);
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

    return NextResponse.json({
      success: true,
      message: "Đặt xe thành công! Tài xế sẽ liên hệ lại quý khách ngay.",
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
