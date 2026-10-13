import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return new NextResponse("Not found", { status: 404 });
    }

    // 1. Kiểm tra nhanh trong thư mục local /public/uploads/ nếu có
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      const extensions = ["jpg", "png", "webp", "jpeg"];
      for (const ext of extensions) {
        const filePath = path.join(uploadsDir, `${id}.${ext}`);
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
          return new NextResponse(fileBuffer, {
            headers: {
              "Content-Type": mime,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      }
    } catch (e) {
      // Fallback sang Firestore
    }

    // 2. Lấy dữ liệu từ Firestore database
    const docRef = doc(db, "uploaded_images", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const docData = snap.data();
    const base64Data = docData.data;
    const contentType = docData.contentType || "image/jpeg";

    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Error serving uploaded image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
