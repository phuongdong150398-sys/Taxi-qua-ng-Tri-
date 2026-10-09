import { PayOS } from "@payos/node";
import { Driver } from "@/types";

export const PAYOS_CLIENT_ID =
  process.env.PAYOS_CLIENT_ID || "2fbbc726-49f4-476f-aa7f-ae7431a6b5e1";
export const PAYOS_API_KEY =
  process.env.PAYOS_API_KEY || "e360e644-0524-4f20-82ac-3ab1acc8f8d7";
export const PAYOS_CHECKSUM_KEY =
  process.env.PAYOS_CHECKSUM_KEY || "aaf87f0fe51a68648bd3496b9626f4ea95ee419b0cac1de93db7d16a1d70f0eb";

export const payOS = new PayOS({
  clientId: PAYOS_CLIENT_ID,
  apiKey: PAYOS_API_KEY,
  checksumKey: PAYOS_CHECKSUM_KEY,
});

export interface DepositPaymentResult {
  qrUrl: string;
  checkoutUrl?: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  amount: number;
  description: string;
  orderCode: number;
}

/**
 * Tạo yêu cầu nạp tiền payOS với VietQR động chuẩn xác và đăng ký theo dõi tự động
 */
export async function createPayOSDepositPayment(
  driver: Driver,
  amount: number
): Promise<DepositPaymentResult> {
  const cleanPhone = driver.phone.replace(/\D/g, "");
  const safeDesc = `NAP VI ${cleanPhone}`.slice(0, 25);
  const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 90 + 10));

  try {
    const paymentReq = await payOS.paymentRequests.create({
      orderCode,
      amount,
      description: safeDesc,
      returnUrl: "https://taxiquangtri.com.vn",
      cancelUrl: "https://taxiquangtri.com.vn",
    });

    const bin = paymentReq.bin || "970422";
    const accNum = paymentReq.accountNumber || "1736668888173";
    const accName = paymentReq.accountName || "NGUYEN PHUONG DONG";
    const desc = paymentReq.description || safeDesc;
    const qrUrl = `https://img.vietqr.io/image/${bin}-${accNum}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(desc)}&accountName=${encodeURIComponent(accName)}`;

    return {
      qrUrl,
      checkoutUrl: paymentReq.checkoutUrl,
      accountNumber: accNum,
      accountName: accName,
      bankName: "MBBank",
      amount,
      description: desc,
      orderCode,
    };
  } catch (e) {
    console.error("payOS createPaymentLink error, fallback to direct VietQR:", e);
    const fallbackDesc = `NAP VI ${cleanPhone}`;
    const qrUrl = `https://img.vietqr.io/image/MBBank-1736668888173-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(fallbackDesc)}&accountName=NGUYEN%20PHUONG%20DONG`;
    return {
      qrUrl,
      accountNumber: "1736668888173",
      accountName: "NGUYEN PHUONG DONG",
      bankName: "MBBank",
      amount,
      description: fallbackDesc,
      orderCode,
    };
  }
}

/**
 * Trích xuất số điện thoại tài xế từ nội dung chuyển khoản ngân hàng
 * Hỗ trợ các cú pháp: "NAP VI 0912345678", "NAPVI0912345678", "0912345678", v.v.
 */
export function extractPhoneFromDescription(desc: string): string | null {
  if (!desc) return null;
  const clean = desc.replace(/[\s\-_.:]/g, " ").toUpperCase();
  
  // 1. Tìm theo cụm "NAP VI 0xxxxxxxxx" hoặc "NAPVI 0xxxxxxxxx"
  const napViMatch = clean.match(/NAP\s*VI\s*(0[35789]\d{8})/i);
  if (napViMatch && napViMatch[1]) {
    return napViMatch[1];
  }

  // 2. Tìm bất kỳ số điện thoại di động Việt Nam 10 chữ số (đầu 03, 05, 07, 08, 09)
  const phoneMatch = clean.match(/(0[35789]\d{8})/);
  if (phoneMatch && phoneMatch[1]) {
    return phoneMatch[1];
  }

  // 3. Tìm dạng quốc tế 84xxxxxxxxx
  const intlMatch = clean.match(/(?:84)([35789]\d{8})/);
  if (intlMatch && intlMatch[1]) {
    return "0" + intlMatch[1];
  }

  return null;
}
