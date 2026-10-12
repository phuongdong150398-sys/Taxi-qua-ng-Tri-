import { NextResponse } from "next/server";
import {
  getAllTravelGuidesAsync,
  saveTravelGuide,
  deleteTravelGuide,
  resetToDefaults,
} from "@/lib/travelGuidesService";
import { TravelGuide } from "@/data/travelGuides";
import { getAdminSessionFromRequest } from "@/lib/adminAuth";

export async function GET() {
  try {
    const guides = await getAllTravelGuidesAsync();
    return NextResponse.json({ success: true, data: guides });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi tải danh sách bài viết" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Yêu cầu quyền Quản trị viên để lưu bài viết!" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    if (!body.title || !body.destination) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ Tiêu đề và Tên điểm đến!" },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    let slug = body.slug;
    if (!slug || slug.trim() === "") {
      slug = body.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }

    const newGuide: TravelGuide = {
      slug: slug.trim(),
      title: body.title.trim(),
      metaTitle: body.metaTitle?.trim() || `${body.title.trim()} 2026`,
      metaDescription:
        body.metaDescription?.trim() ||
        body.excerpt?.trim() ||
        `Cẩm nang kinh nghiệm du lịch ${body.destination.trim()} chi tiết và bảng giá thuê xe taxi trọn gói.`,
      excerpt:
        body.excerpt?.trim() ||
        `Khám phá ${body.destination.trim()} với cẩm nang kinh nghiệm, giá vé và dịch vụ thuê xe taxi đưa đón tận nơi giá rẻ.`,
      category: body.category?.trim() || "Điểm Đến Du Lịch",
      coverImage:
        body.coverImage?.trim() ||
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      destination: body.destination.trim(),
      distanceFromDongHoi: body.distanceFromDongHoi?.trim() || "Đang cập nhật",
      taxiFare4Seats: body.taxiFare4Seats?.trim() || "Liên hệ hotline",
      taxiFare6Seats: body.taxiFare6Seats?.trim() || "Liên hệ hotline",
      ticketPrice: body.ticketPrice?.trim() || "Miễn phí / Tùy dịch vụ",
      bestTimeToVisit: body.bestTimeToVisit?.trim() || "Tháng 3 đến tháng 9",
      author: body.author?.trim() || "Ban Biên Tập Taxi Quảng Trị - Quảng Bình 24H",
      publishedDate: body.publishedDate || new Date().toISOString().split("T")[0],
      readTime: body.readTime?.trim() || "5 phút đọc",
      rating: typeof body.rating === "number" ? body.rating : 5.0,
      reviewsCount: typeof body.reviewsCount === "number" ? body.reviewsCount : 100,
      highlights: Array.isArray(body.highlights) && body.highlights.length > 0
        ? body.highlights.filter((h: string) => h && h.trim())
        : ["Không gian thiên nhiên trong lành, cảnh quan tuyệt đẹp", "Dịch vụ taxi đưa đón tận nơi an toàn, chu đáo"],
      sections: Array.isArray(body.sections) && body.sections.length > 0
        ? body.sections
        : [
            {
              heading: `1. Giới thiệu tổng quan về ${body.destination.trim()}`,
              content: `Nằm tại Quảng Bình, ${body.destination.trim()} là điểm đến hấp dẫn thu hút đông đảo du khách trong và ngoài nước bởi vẻ đẹp thiên nhiên kỳ thú và không khí trong lành.`,
            },
            {
              heading: "2. Hướng dẫn di chuyển và cước xe taxi",
              content: `Du khách có thể dễ dàng di chuyển bằng dịch vụ taxi gia đình đời mới, đón tận nơi tại khách sạn, ga tàu hoặc sân bay Đồng Hới.`,
              tips: ["Nên đặt taxi khứ hồi 2 chiều để nhận ưu đãi giảm giá chiều về tới 50%."],
            },
          ],
      faqs: Array.isArray(body.faqs) && body.faqs.length > 0
        ? body.faqs
        : [
            {
              question: `Nên đi du lịch ${body.destination.trim()} vào thời điểm nào?`,
              answer: `Thời điểm lý tưởng nhất là mùa khô từ tháng 3 đến tháng 9, thời tiết nhiều nắng đẹp và thuận lợi tham quan, chụp ảnh.`,
            },
          ],
    };

    const res = await saveTravelGuide(newGuide);
    if (!res.success) {
      return NextResponse.json({ success: false, message: res.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Đã lưu bài viết cẩm nang thành công!",
      data: newGuide,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi xử lý lưu bài viết" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Yêu cầu quyền Quản trị viên để xóa bài viết!" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    let slug = searchParams.get("slug");

    if (!slug) {
      const body = await request.json().catch(() => ({}));
      slug = body?.slug;
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin slug của bài viết cần xóa" },
        { status: 400 }
      );
    }

    const res = await deleteTravelGuide(slug);
    if (!res.success) {
      return NextResponse.json({ success: false, message: res.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa bài viết thành công!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi xóa bài viết" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Yêu cầu quyền Quản trị viên!" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    if (body.action === "reset_defaults") {
      resetToDefaults();
      return NextResponse.json({
        success: true,
        message: "Đã khôi phục danh sách bài viết mặc định ban đầu!",
      });
    }
    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Lỗi" }, { status: 500 });
  }
}
