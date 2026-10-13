import { getTravelGuidesFromDb, saveTravelGuideToDb } from "../src/lib/firebaseDb";
import { sanitizeGuide, getAllTravelGuides, saveTravelGuide } from "../src/lib/travelGuidesService";
import { isReliableImageUrl, getVerifiedImageForTopic } from "../src/lib/verifiedImages";
import fs from "fs";
import path from "path";

async function repairAllArticles() {
  console.log("=== BẮT ĐẦU KIỂM TRA VÀ SỬA TẤT CẢ BÀI VIẾT ===");
  const guides = await getTravelGuidesFromDb();
  if (!guides || guides.length === 0) {
    console.log("Không có bài viết trong Firestore.");
    return;
  }

  console.log(`Tìm thấy ${guides.length} bài viết trong Firestore.`);

  for (const guide of guides) {
    let modified = false;

    // Sửa riêng bài food-tour-am-thuc-dong-hoi
    if (guide.slug === "food-tour-am-thuc-dong-hoi") {
      console.log(">>> Đang sửa chi tiết bài food-tour-am-thuc-dong-hoi...");
      guide.sections = [
        {
          heading: "1. Đồng Hới – Nơi Hội Tụ Tinh Hoa Ẩm Thực Di Sản Miền Trung",
          content: guide.sections?.[0]?.content || "Thành phố Đồng Hới không chỉ nổi tiếng với biển Nhật Lệ và di sản Quảng Bình Quan mà còn là cái nôi ẩm thực phong phú với hương vị cay nồng đặc trưng miền Trung.",
          image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/B%C3%A1nh_b%C3%A8o%2C_b%E1%BB%99t_l%E1%BB%8Dc%2C_nem_chua.jpg/1280px-B%C3%A1nh_b%C3%A8o%2C_b%E1%BB%99t_l%E1%BB%8Dc%2C_nem_chua.jpg",
          imageCaption: "Mâm bánh bột lọc tôm sông lá chuối nóng hổi thơm nức tiếng Đồng Hới",
          tips: ["Nên ghé quán Bánh lọc Mệ Xuân trên đường Lê Thành Đồng để thưởng thức chuẩn vị gia truyền."],
        },
        {
          heading: "2. Khám Phá Kiến Trúc Chợ Cũ và Những Vết Tích Ẩm Thực Trên Phố Phường Đồng Hới",
          content: guide.sections?.[1]?.content || "Chợ Đồng Hới nằm sát bên bờ sông Nhật Lệ là trung tâm giao thương sầm uất, nơi hội tụ hàng trăm gánh hàng quà vặt, hải sản tươi rói vừa cập bến.",
          image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/B%C3%A1nh_canh_c%C3%A1_l%C3%B3c_%28b%C3%A1nh_canh_b%E1%BB%99t_m%C3%AC%29_%E1%BB%9F_P1_%C4%90%C3%B4ng_H%C3%A0%2C_T%E1%BA%BFt_n%C4%83m_2019_%282%29.jpg/1280px-B%C3%A1nh_canh_c%C3%A1_l%C3%B3c_%28b%C3%A1nh_canh_b%E1%BB%99t_m%C3%AC%29_%E1%BB%9F_P1_%C4%90%C3%B4ng_H%C3%A0%2C_T%E1%BA%BFt_n%C4%83m_2019_%282%29.jpg",
          imageCaption: "Tô cháo canh cá lóc nghệ vàng trứ danh - Bữa sáng đậm đà của người dân Đồng Hới",
          tips: ["Đi chợ buổi sớm từ 6h00 - 8h00 sáng để thưởng thức đồ ăn nóng hổi và cảm nhận nhịp sống bản địa."],
        },
        {
          heading: "3. Cảm Xúc Lắng Đọng Qua Hương Vị Ẩm Thực Quảng Bình",
          content: guide.sections?.[2]?.content || "Mỗi món ngon Đồng Hới mang trong mình sự chắt chiu, tinh tế của con người miền Trung nắng gió.",
          image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/B%C3%A1nh_b%E1%BB%99t_l%E1%BB%8Dc_saigonnais.jpg/1280px-B%C3%A1nh_b%E1%BB%99t_l%E1%BB%8Dc_saigonnais.jpg",
          imageCaption: "Bánh bột lọc trong veo dai giòn chấm nước mắm ớt cay xé lưỡi",
          tips: ["Nước chấm mắm ớt hiểm nguyên chất là linh hồn giúp món bánh bột lọc dậy mùi thơm nức."],
        },
        {
          heading: "4. Gợi ý lịch trình Food Tour 1 Ngày trọn vẹn xuất phát từ TP. Đồng Hới",
          content: guide.sections?.[3]?.content || "Lịch trình Food Tour trọn vẹn từ sáng đến tối khám phá toàn bộ ẩm thực danh bất hư truyền của Đồng Hới.",
          image: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Nhat_Le_River.jpg",
          imageCaption: "Bờ kè biển Nhật Lệ rực sáng - Thiên đường thưởng thức hải sản mực nhảy đêm",
          tips: ["Đặt taxi trọn gói khứ hồi với Taxi Đồng Hới 24H để bác tài đón đúng giờ và chở thẳng đến các quán ngon chuẩn bản địa."],
        },
        {
          heading: "5. Thưởng thức đặc sản ẩm thực TP. Đồng Hới & Quảng Bình nức tiếng",
          content: guide.sections?.[4]?.content || "Đồng Hới sở hữu vô số món ngon nức tiếng: chắt chắt xào xúc bánh tráng, ram đẻn biển, lẩu cá khoai, mực nhảy nướng than hoa...",
          image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
          imageCaption: "Hải sản tươi sống và các món ngon đậm đà phong vị bản xứ Đồng Hới",
          tips: ["Đừng quên mua khoai gieo Hải Ninh và bánh lọc sống đóng hộp về làm quà cho người thân."],
        },
        {
          heading: "6. Dịch vụ Taxi Quảng Bình - Đồng Hới 24H đưa đón chu đáo",
          content: guide.sections?.[5]?.content || "Đội xe Taxi Quảng Bình 24H tập trung đông đảo tại TP. Đồng Hới, đón nhanh sau 5 phút gọi điện, sẵn sàng làm 'hướng dẫn viên ẩm thực' nhiệt tình cho du khách.",
          image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/M%E1%BA%B7t_sau_ga_%C4%90%E1%BB%93ng_H%E1%BB%9Bi_%2809h59_-_21.05.2026%29.jpg/1280px-M%E1%BA%B7t_sau_ga_%C4%90%E1%BB%93ng_H%E1%BB%9Bi_%2809h59_-_21.05.2026%29.jpg",
          imageCaption: "Taxi Đồng Hới túc trực 24/7 sẵn sàng đưa đón bạn khám phá mọi ngõ ngách ẩm thực",
          tips: ["Hotline đặt xe nhanh: 0877.669.555, đón nhanh trong 5 phút."],
        },
      ];

      guide.gallery = [
        {
          url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/B%C3%A1nh_b%C3%A8o%2C_b%E1%BB%99t_l%E1%BB%8Dc%2C_nem_chua.jpg/1280px-B%C3%A1nh_b%C3%A8o%2C_b%E1%BB%99t_l%E1%BB%8Dc%2C_nem_chua.jpg",
          caption: "Mâm bánh bột lọc lá chuối tôm sông béo ngậy thơm nức",
        },
        {
          url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/B%C3%A1nh_canh_c%C3%A1_l%C3%B3c_%28b%C3%A1nh_canh_b%E1%BB%99t_m%C3%AC%29_%E1%BB%9F_P1_%C4%90%C3%B4ng_H%C3%A0%2C_T%E1%BA%BFt_n%C4%83m_2019_%282%29.jpg/1280px-B%C3%A1nh_canh_c%C3%A1_l%C3%B3c_%28b%C3%A1nh_canh_b%E1%BB%99t_m%C3%AC%29_%E1%BB%9F_P1_%C4%90%C3%B4ng_H%C3%A0%2C_T%E1%BA%BFt_n%C4%83m_2019_%282%29.jpg",
          caption: "Tô cháo canh cá lóc nghệ vàng đậm vị ngọt miền Trung",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Nhat_Le_River.jpg",
          caption: "Bờ kè sông Nhật Lệ thưởng thức mực nhảy và đẻn biển",
        },
        {
          url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/B%C3%A1nh_b%E1%BB%99t_l%E1%BB%8Dc_saigonnais.jpg/1280px-B%C3%A1nh_b%E1%BB%99t_l%E1%BB%8Dc_saigonnais.jpg",
          caption: "Bánh bột lọc trong veo chấm nước mắm ớt cay nồng",
        },
      ];

      modified = true;
    } else {
      // Với các bài khác: kiểm tra các ảnh hỏng Unsplash hoặc lặp lại
      const sanitized = sanitizeGuide(guide);
      if (JSON.stringify(sanitized) !== JSON.stringify(guide)) {
        guide.coverImage = sanitized.coverImage;
        guide.sections = sanitized.sections;
        guide.gallery = sanitized.gallery;
        modified = true;
      }
    }

    if (modified) {
      console.log(`Lưu cập nhật cho bài: ${guide.slug}`);
      await saveTravelGuideToDb(guide);
    }
  }

  // Cập nhật lại file JSON data local nếu có
  const localDataPath = path.join(process.cwd(), "data", "travel_guides.json");
  if (fs.existsSync(localDataPath)) {
    fs.writeFileSync(localDataPath, JSON.stringify(guides, null, 2), "utf-8");
  }

  console.log("=== HOÀN TẤT CẬP NHẬT TẤT CẢ BÀI VIẾT VÀ ẢNH! ===");
}

repairAllArticles().catch(console.error);
