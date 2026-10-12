import { NextResponse } from "next/server";
import { generateAndPublishSeoArticle } from "@/lib/aiContentGenerator";
import { getAdminSessionFromRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Hỗ trợ chạy tối đa 60 giây cho AI sinh bài

function isAuthorized(request: Request): boolean {
  // 1. Kiểm tra phiên đăng nhập Quản trị viên (nếu bấm từ Admin Panel)
  if (getAdminSessionFromRequest(request)) {
    return true;
  }

  // 2. Kiểm tra Header Authorization từ Vercel Cron Job
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "daily_taxi_seo_cron_secret_2026";
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // 3. Kiểm tra query param secret key
  const { searchParams } = new URL(request.url);
  const keyParam = searchParams.get("key") || searchParams.get("secret");
  if (keyParam && keyParam === cronSecret) {
    return true;
  }

  return false;
}

/**
 * GET: Dành cho Vercel Cron Job tự động chạy hàng ngày
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Yêu cầu mã xác thực Cron Secret hoặc quyền Admin!" },
      { status: 401 }
    );
  }

  try {
    const result = await generateAndPublishSeoArticle();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Cron Generate Article Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi tự động sinh bài viết" },
      { status: 500 }
    );
  }
}

/**
 * POST: Dành cho nút bấm "✨ AI Viết Bài Tự Động" trong trang Admin
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Yêu cầu quyền Admin!" },
      { status: 401 }
    );
  }

  try {
    let customTopic: string | undefined;
    try {
      const body = await request.json();
      if (body?.topic && typeof body.topic === "string" && body.topic.trim()) {
        customTopic = body.topic.trim();
      }
    } catch {}

    const result = await generateAndPublishSeoArticle(customTopic);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST Generate Article Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi tạo bài viết AI" },
      { status: 500 }
    );
  }
}
