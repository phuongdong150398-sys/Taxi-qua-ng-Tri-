import { NextRequest, NextResponse } from "next/server";
import { searchWikimediaImages } from "@/lib/wikimediaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || "Đồng Hới";
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const images = await searchWikimediaImages(query, limit);

    return NextResponse.json({
      success: true,
      query,
      data: images,
    });
  } catch (error: any) {
    console.error("API error in /api/images/search:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to search images",
        data: [],
      },
      { status: 500 }
    );
  }
}
