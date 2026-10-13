import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let base64Data = "";
    let mimeType = "image/jpeg";
    let fileName = "upload.jpg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ success: false, message: "Không tìm thấy tệp tải lên" }, { status: 400 });
      }

      fileName = file.name || "photo.jpg";
      mimeType = file.type || "image/jpeg";
      const arrayBuffer = await file.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString("base64");
    } else {
      const body = await req.json();
      if (!body.dataUrl) {
        return NextResponse.json({ success: false, message: "Dữ liệu ảnh không hợp lệ" }, { status: 400 });
      }

      const match = body.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        base64Data = body.dataUrl;
      }
      fileName = body.fileName || "photo.jpg";
    }

    if (!base64Data) {
      return NextResponse.json({ success: false, message: "Không có dữ liệu ảnh" }, { status: 400 });
    }

    // Tạo ID duy nhất cho bức ảnh
    const imageId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // 1. Lưu trữ vĩnh viễn trên Google Firestore
    const docRef = doc(db, "uploaded_images", imageId);
    await setDoc(docRef, {
      id: imageId,
      data: base64Data,
      contentType: mimeType,
      fileName,
      createdAt: new Date().toISOString(),
    });

    // 2. Thử lưu bản sao cục bộ vào /public/uploads/ nếu có thể ghi đĩa
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
      const filePath = path.join(uploadsDir, `${imageId}.${ext}`);
      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
    } catch (e) {
      // Bỏ qua lỗi ghi đĩa trên môi trường serverless Vercel
    }

    const publicUrl = `/api/images/uploaded/${imageId}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      id: imageId,
      fileName,
      message: "Tải ảnh lên thành công!",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi khi tải ảnh lên" },
      { status: 500 }
    );
  }
}
