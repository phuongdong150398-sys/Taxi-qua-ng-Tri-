import { TravelGuide } from "@/data/travelGuides";
import { saveTravelGuide, getAllTravelGuidesAsync, sanitizeGuide } from "@/lib/travelGuidesService";
import { getVerifiedImageForTopic, DEFAULT_FALLBACK_IMAGE, isReliableImageUrl } from "@/lib/verifiedImages";
import { cleanVietnameseText, sanitizeGuideText } from "@/lib/textSanitizer";

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
  "8888405865:AAG0tj-prAYFngu4qlcRYBtF2T_13xHZQo4";

const OWNER_CHAT_ID =
  process.env.TELEGRAM_CHAT_ID ||
  process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ||
  "1499064181";

// Kho chủ đề du lịch chuyên sâu & chuẩn SEO cho Quảng Bình & Quảng Trị
export interface TopicSeed {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  coverImage: string;
  destination: string;
  distanceFromDongHoi: string;
  taxiFare4Seats: string;
  taxiFare6Seats: string;
  ticketPrice: string;
  bestTimeToVisit: string;
  readTime: string;
  publishedDate?: string;
  highlights: string[];
  gallery?: Array<{ url: string; caption: string }>;
  sections: Array<{
    heading: string;
    content: string;
    image?: string;
    imageCaption?: string;
    tips?: string[];
  }>;
  faqs: Array<{ question: string; answer: string }>;
}

export const SEO_TOPICS_DATABASE: TopicSeed[] = [
  {
    slug: "kinh-nghiem-vieng-thanh-co-quang-tri-lich-su",
    title: "Kinh Nghiệm Viếng Thành Cổ Quảng Trị 2026: Dấu Ấn Lịch Sử 81 Ngày Đêm Khói Lửa & Tour Tâm Linh",
    metaTitle: "Kinh Nghiệm Viếng Thành Cổ Quảng Trị 2026 | Hướng Dẫn Di Chuyển Taxi 24H",
    metaDescription: "Cẩm nang hướng dẫn viếng thăm Di tích Quốc gia đặc biệt Thành Cổ Quảng Trị: Lịch sử 81 ngày đêm, kinh nghiệm dâng hương, thả hoa đăng bờ sông Thạch Hãn và thuê xe taxi trọn gói.",
    excerpt: "Thành Cổ Quảng Trị - bản tráng ca bất tử gắn liền với cuộc chiến đấu 81 ngày đêm bảo vệ Thành Cổ mùa hè đỏ lửa 1972. Từng tấc đất nơi đây thấm đượm máu xương của hàng vạn người con anh dũng hiến dâng tuổi thanh xuân vì độc lập non sông.",
    category: "Di Tích Lịch Sử Tâm Linh",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Th%C3%A0nh_c%E1%BB%95_Qu%E1%BA%A3ng_Tr%E1%BB%8B_Foto.jpg",
    destination: "Thành Cổ Quảng Trị (Thị xã Quảng Trị)",
    distanceFromDongHoi: "95 km (khoảng 80 - 90 phút đi xe)",
    taxiFare4Seats: "850.000 VNĐ",
    taxiFare6Seats: "1.050.000 VNĐ",
    ticketPrice: "Miễn phí vé vào cổng (Ủng hộ nhang đèn tùy tâm)",
    bestTimeToVisit: "Quanh năm, đặc biệt dịp 27/7, 30/4 và các ngày Rằm",
    readTime: "8 phút đọc",
    highlights: [
      "Di tích Quốc gia đặc biệt thiêng liêng tưởng niệm các anh hùng liệt sĩ bảo vệ Thành Cổ mùa hè đỏ lửa 1972",
      "Đài Tưởng Niệm Trung Tâm với 81 bậc đá tượng trưng cho 81 ngày đêm khói lửa kiên cường",
      "Bảo tàng Chứng tích Thành Cổ lưu giữ những bức thư thời chiến lay động hàng triệu trái tim",
      "Đại lễ thả hoa đăng tri ân xúc động trên dòng sông Thạch Hãn lịch sử",
      "Dịch vụ xe taxi đưa đón trọn gói tham quan cụm di tích tâm linh Quảng Trị chỉ từ 12.000đ/km",
    ],
    gallery: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/0/09/Th%C3%A0nh_c%E1%BB%95_Qu%E1%BA%A3ng_Tr%E1%BB%8B_4.jpg",
        caption: "Đài tưởng niệm trung tâm Thành Cổ - Ngôi mộ chung linh thiêng của hàng vạn liệt sĩ",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Th%C3%A0nh_c%E1%BB%95_Qu%E1%BA%A3ng_Tr%E1%BB%8B_Foto.jpg",
        caption: "Cổng Tiền cổ kính rêu phong thời nhà Nguyễn in đậm dấu tích lịch sử",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/1/11/S%C3%B4ng_Th%E1%BA%A1ch_H%C3%A3n_4.JPG",
        caption: "Dòng sông Thạch Hãn huyền thoại - Bến thả hoa tri nụ hoa bất tử",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/To%C3%A0n_c%E1%BA%A3nh_qu%E1%BA%A3ng_tr%C6%B0%E1%BB%9Dng_La_Vang.JPG",
        caption: "Quảng trường và Vương cung Thánh đường La Vang cách Thành Cổ 6km",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Th%C3%A0nh_c%E1%BB%95_Qu%E1%BA%A3ng_Tr%E1%BB%8B_ng%C3%A0y_nay.jpg",
        caption: "Khuôn viên Thành Cổ xanh tươi hòa bình sau hơn nửa thế kỷ độc lập",
      },
    ],
    sections: [
      {
        heading: "1. Thành Cổ Quảng Trị - Bản hùng ca bất tử 81 ngày đêm đỏ lửa 1972",
        content: `Thành Cổ Quảng Trị là minh chứng hào hùng và xúc động bậc nhất cho ý chí sắt đá của dân tộc Việt Nam. Trong suốt 81 ngày đêm mùa hè năm 1972 (từ 28/6 đến 16/9/1972), trên diện tích vỏn vẹn chưa đầy 3 cây số vuông của Thành Cổ và thị xã Quảng Trị, quân đội Mỹ - ngụy đã trút xuống hơn 328.000 tấn bom đạn, tương đương sức công phá của 7 quả bom nguyên tử ném xuống Hiroshima.

Từng tấc đất, từng viên gạch nơi đây đều thấm đượm máu xương của hàng vạn cán bộ chiến sĩ quân giải phóng, phần lớn là những thanh niên, sinh viên tuổi mới mười chín, đôi mươi rời giảng đường đại học bước vào chiến hào. Đài tưởng niệm trung tâm được xây dựng theo hình tượng ngôi mộ chung khổng lồ với 81 bậc đá tượng trưng cho 81 ngày đêm chiến đấu ngoan cường, bốn mặt đài khắc họa những áng thơ và ngọn lửa thiêng soi rọi sự bất tử của các anh hùng liệt sĩ.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/0/09/Th%C3%A0nh_c%E1%BB%95_Qu%E1%BA%A3ng_Tr%E1%BB%8B_4.jpg",
        imageCaption: "Đài Tưởng Niệm Trung Tâm Thành Cổ Quảng Trị - Nấm mồ chung linh thiêng của hàng vạn người lính giải phóng",
        tips: [
          "Khi vào dâng hương tại Đài tưởng niệm, quý khách nên mặc trang phục trang nghiêm, đi lại nhẹ nhàng và giữ trật tự tôn kính.",
          "Bạn có thể chuẩn bị nhang đèn và hoa tươi ngay tại quầy lễ tân bên ngoài cổng di tích.",
        ],
      },
      {
        heading: "2. Cổng Tiền rêu phong và Bảo tàng Chứng tích chiến tranh nghẹn ngào",
        content: `Thành Cổ vốn được khởi công xây dựng từ thời vua Gia Long (1809) và củng cố dưới thời vua Minh Mạng (1827) bằng gạch vồ kiên cố. Trải qua mưa bom bão đạn năm 1972, gần như toàn bộ kiến trúc thành quách đều bị san phẳng, chỉ còn lại dấu tích Cổng Tiền với những mảng tường loang lổ vết đạn cày xới rêu phong theo năm tháng.

Ngay bên cạnh cổng thành là Bảo tàng Chứng tích Thành Cổ Quảng Trị. Nơi đây trưng bày hàng trăm kỷ vật xúc động: chiếc bi đông méo mó vì mảnh bom, chiếc ba lô nhuộm màu thời gian, và đặc biệt là bức thư bất hủ của liệt sĩ Lê Văn Huỳnh (sinh viên ĐH Bách Khoa Hà Nội) gửi mẹ già và người vợ trẻ trước lúc hy sinh: 'Mẹ kính yêu, con đi mẹ đừng buồn... Toàn thể gia đình đừng buồn vì con đã cống hiến trọn vẹn tuổi xuân cho ngày đất nước thống nhất'. Cạnh bảo tàng, Tháp Chuông Thành Cổ ngày ngày ngân vang hồi chuông thanh thản cầu chúc linh hồn các chiến sĩ an giấc ngàn thu.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Th%C3%A0nh_c%E1%BB%95_Qu%E1%BA%A3ng_Tr%E1%BB%8B_Foto.jpg",
        imageCaption: "Cổng Tiền Thành Cổ Quảng Trị - Dấu tích thời gian và những vết thương chiến tranh còn mãi tạc vào đá gạch",
        tips: [
          "Nên liên hệ hướng dẫn viên tại bảo tàng để được nghe thuyết minh về những bức thư thời chiến xúc động rơi nước mắt.",
        ],
      },
      {
        heading: "3. Bến Thả Hoa Sông Thạch Hãn - Nơi huyền thoại nở hoa",
        content: `Cách cổng Tây Thành Cổ chỉ vài trăm mét là dòng sông Thạch Hãn êm đềm chảy qua lòng thị xã. Trong 81 ngày đêm lịch sử, dòng sông này chính là huyết mạch tiếp tế sinh tử của quân giải phóng. Dưới làn đạn pháo và bom bầy từ máy bay địch, hàng ngàn chiến sĩ đã mãi mãi gửi thân xác dưới đáy dòng sông xanh.

Cựu chiến binh Lê Bá Dương khi trở lại thăm dòng sông xưa đã nghẹn ngào chắp bút 4 câu thơ lay động hàng triệu trái tim:
'Đò lên Thạch Hãn ơi... chèo nhẹ,
Đáy sông còn đó bạn tôi nằm.
Tan theo bọt nước thay phù sa,
Cứ mỗi thu sang lại nở hoa.'

Ngày nay, Bến thả hoa sông Thạch Hãn là điểm đến tâm linh không thể tách rời khi viếng Thành Cổ. Hàng năm vào các dịp Rằm tháng Bảy, ngày 27/7 và 30/4, hàng vạn ngọn hoa đăng lung linh được người dân và du khách thập phương thả xuống dòng sông để tri ân những người con kiên trung của đất mẹ.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/1/11/S%C3%B4ng_Th%E1%BA%A1ch_H%C3%A3n_4.JPG",
        imageCaption: "Dòng sông Thạch Hãn huyền thoại - Bến thả hoa đăng tưởng niệm những người lính đã ngã xuống trong lòng nước",
        tips: [
          "Bạn có thể mua hoa tươi và đèn hoa đăng thả bên bờ sông lúc hoàng hôn (khoảng 17h00 - 18h00) để cảm nhận không gian linh thiêng, lắng đọng.",
        ],
      },
      {
        heading: "4. Gợi ý lịch trình Tour Tâm Linh Quảng Trị 1 Ngày trọn vẹn",
        content: `Một hành trình tâm linh ý nghĩa và khoa học nhất được đông đảo du khách lựa chọn khi thuê xe Taxi Quảng Trị 24H:

• 07:30 - 09:00: Xe đón tại khách sạn/ga Đông Hà, di chuyển dâng hương tưởng niệm tại Thành Cổ Quảng Trị & Bến thả hoa sông Thạch Hãn.
• 09:30 - 11:00: Viếng Trung tâm Hành hương Thánh địa La Vang (cách Thành Cổ chỉ 6km), chiêm ngưỡng Tháp chuông cổ kính và Đức Mẹ bồng Chúa.
• 11:30 - 13:00: Thưởng thức bữa trưa đặc sản nức tiếng: Bánh bột lọc Mỹ Chánh, Bún hến Mai Xá hoặc Cháo bột cá lóc Diên Sanh.
• 13:30 - 15:30: Di chuyển viếng Nghĩa trang Liệt sĩ Quốc gia Trường Sơn (hơn 10.000 phần mộ liệt sĩ) và Nghĩa trang Quốc gia Đường 9.
• 15:45 - 17:30: Tham quan Di tích Đôi bờ Hiền Lương - Sông Bến Hải (Cầu Hiền Lương lịch sử, Cột cờ giới tuyến Vĩ tuyến 17) và Cụm địa đạo Vịnh Mốc.
• 17:30: Xe đưa đoàn trở về điểm hẹn, kết thúc hành trình về nguồn đầy cảm xúc.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/b/b3/To%C3%A0n_c%E1%BA%A3nh_qu%E1%BA%A3ng_tr%C6%B0%E1%BB%9Dng_La_Vang.JPG",
        imageCaption: "Thánh địa La Vang - Điểm đến thanh tịnh nằm ngay sát Thành Cổ trên cung đường tâm linh Quảng Trị",
        tips: [
          "Nên đặt xe trọn gói khứ hồi với Taxi Quảng Trị 24H để bác tài đón đúng giờ, hỗ trợ hướng dẫn điểm ăn uống và tiết kiệm tới 50% chiều về.",
        ],
      },
      {
        heading: "5. Thưởng thức đặc sản ẩm thực nức tiếng đất Quảng Trị",
        content: `Sau những giờ phút lắng đọng tâm linh, đừng quên thưởng thức văn hóa ẩm thực đậm đà hồn quê của mảnh đất gió Lào cát trắng:
• Bánh bột lọc Mỹ Chánh: Vỏ bánh trong suốt dai giòn bọc tôm sông óng ả và thịt mỡ béo ngậy, chấm nước mắm ớt cay xé lưỡi đặc trưng.
• Bún hến Mai Xá (đặc sản tiến vua): Nấu từ con chắt chắt sông Thạch Hãn ngọt lịm tự nhiên, ăn cùng rau sống bắp chuối bùi bùi.
• Cháo bột cá lóc (Bánh canh Diên Sanh): Sợi bột gạo dai mềm quyện nước dùng cá lóc đồng rim nghệ vàng óng thơm lừng.
• Thịt trâu lá trơng: Thịt trâu non nướng than hoa cuộn với lá trơng rừng the nồng mang lại hương vị khó quên.
• Bánh ướt Phương Lang: Bánh tráng mỏng mềm mịn ăn kèm thịt ba chỉ luộc và bát nước mắm tương ớt mè truyền thống.`,
        tips: [
          "Bác tài Taxi Quảng Trị 24H luôn sẵn sàng đưa bạn đến đúng những quán ăn gốc bản địa lâu năm, giá cả bình dân không lo chặt chém.",
        ],
      },
      {
        heading: "6. Dịch vụ Taxi Quảng Trị - Quảng Bình 24H: Đồng hành chu đáo & an toàn",
        content: `Taxi Quảng Trị 24H tự hào là người bạn đồng hành tin cậy của hàng ngàn đoàn du khách, cựu chiến binh và gia đình về thăm chiến trường xưa:
• Đội xe đời mới từ 4 chỗ (Vios, Accent, City) đến 7 chỗ (Xpander, Veloz, Fortuner) nội thất sạch bóng, máy lạnh mát rượi.
• Tài xế là người con bản địa Quảng Trị, hiểu rõ từng di tích lịch sử, tận tâm hỗ trợ xách hành lý, mua nhang đèn và dẫn đường chu đáo.
• Bảng giá cước công khai minh bạch chỉ từ 12.000đ/km, cam kết không phát sinh phụ phí ẩn, đón tận nơi 24/7 sau 5 - 10 phút gọi.`,
        tips: [
          "Gọi ngay Hotline 0877.669.555 để đặt xe trước và nhận ưu đãi giảm giá tour tâm linh trọn gói trong ngày.",
        ],
      },
    ],
    faqs: [
      {
        question: "Từ TP. Đông Hà đi Taxi đến Thành Cổ Quảng Trị mất bao xa và bao lâu?",
        answer: "Khoảng cách từ trung tâm TP. Đông Hà đến Thành Cổ Quảng Trị là khoảng 14km, thời gian di chuyển bằng taxi chỉ mất khoảng 15 đến 20 phút. Giá cước taxi 4 chỗ chỉ khoảng 160.000đ - 180.000đ.",
      },
      {
        question: "Thành Cổ Quảng Trị có mở cửa ban đêm không?",
        answer: "Khu di tích mở cửa đón khách dâng hương từ 07h00 sáng đến 17h30 chiều hàng ngày. Tuy nhiên, Đài tưởng niệm và Bến thả hoa sông Thạch Hãn thường sáng đèn lung linh vào buổi tối các ngày rằm, mùng một và dịp lễ 27/7.",
      },
      {
        question: "Thuê xe taxi tour trọn gói đi Thành Cổ và các điểm tâm linh Quảng Trị có đắt không?",
        answer: "Giá tour taxi trọn gói cả ngày đi Thành Cổ, La Vang, Nghĩa trang Trường Sơn, Cầu Hiền Lương rất tiết kiệm, dao động từ 900.000đ - 1.200.000đ tùy loại xe 4 hoặc 7 chỗ, xe phục vụ riêng suốt hành trình.",
      },
    ],
  },
  {
    slug: "kinh-nghiem-du-lich-hang-son-doong-quang-binh",
    title: "Kinh Nghiệm Du Lịch Hang Sơn Đoòng Quảng Bình 2026: Khám Phá Kỳ Quan Lớn Nhất Thế Giới",
    metaTitle: "Kinh Nghiệm Khám Phá Hang Sơn Đoòng Quảng Bình 2026 | Taxi 24H",
    metaDescription: "Cẩm nang hướng dẫn du lịch khám phá Hang Sơn Đoòng Quảng Bình chi tiết nhất 2026: Chi phí, lịch trình tour, thể lực yêu cầu và dịch vụ taxi đón tiễn tận nơi.",
    excerpt: "Sơn Đoòng - hang động tự nhiên lớn nhất thế giới ẩn chứa cả một khu rừng nguyên sinh và dòng sông ngầm kỳ bí. Cùng tìm hiểu cẩm nang chinh phục và phương tiện di chuyển an toàn nhất.",
    category: "Di Sản Thiên Nhiên Thế Giới",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/1/16/Son_Doong_Cave_DB_%282%29.jpg",
    destination: "Hang Sơn Đoòng (Vườn Quốc Gia Phong Nha - Kẻ Bàng)",
    distanceFromDongHoi: "55 km (khoảng 60 phút đi xe ô tô)",
    taxiFare4Seats: "600.000 VNĐ",
    taxiFare6Seats: "750.000 VNĐ",
    ticketPrice: "Theo tour thám hiểm chuyên nghiệp",
    bestTimeToVisit: "Tháng 1 đến tháng 8 hàng năm",
    readTime: "7 phút đọc",
    highlights: [
      "Hang động tự nhiên lớn nhất hành tinh với vòm hang cao chứa vừa tòa nhà 40 tầng",
      "Khu rừng nguyên sinh 'Vườn Địa Đàng' độc nhất vô nhị phát triển ngay trong lòng hang",
      "Bức tường Việt Nam cao 90m - thử thách leo núi đỉnh cao của các nhà thám hiểm",
      "Dịch vụ taxi 4-7 chỗ đưa đón tận điểm tập kết Oxalis tại Phong Nha",
    ],
    gallery: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/1/16/Son_Doong_Cave_DB_%282%29.jpg",
        caption: "Vòm hang kỳ vĩ Sơn Đoòng chứa vừa tòa nhà chọc trời 40 tầng",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Son_Doong_Cave_DB_%283%29.jpg",
        caption: "Hố sụt 2 - Doline 2 nơi ánh nắng chiếu rọi tạo nên khu rừng nhiệt đới Vườn Địa Đàng",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Son_Doong_Cave_DB_%281%29.jpg",
        caption: "Thạch nhũ khổng lồ kiến tạo qua hàng triệu năm trong lòng hang Sơn Đoòng",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Son_Doong_Cave_by_Daniel_Burka.jpg",
        caption: "Dòng sông ngầm thám hiểm kỳ bí chảy xuyên qua khối núi đá vôi",
      },
    ],
    sections: [
      {
        heading: "1. Vẻ đẹp kỳ vĩ vô tiền khoáng hậu của Hang Sơn Đoòng",
        content: `Nằm sâu trong Vườn Quốc gia Phong Nha - Kẻ Bàng, Sơn Đoòng được Hiệp hội Nghiên cứu Hang động Hoàng gia Anh công bố là hang động tự nhiên lớn nhất thế giới với thể tích ước tính lên đến 38,5 triệu mét khối. Bước vào lòng hang, du khách sẽ choáng ngợp trước hệ thống thạch nhũ khổng lồ, những hố sụt đón ánh nắng ban mai và cả một hệ sinh thái rừng nhiệt đới trù phú tồn tại độc lập.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/1/16/Son_Doong_Cave_DB_%282%29.jpg",
        imageCaption: "Vòm hang khổng lồ lộng lẫy được chiếu sáng bởi đội ngũ thám hiểm hang động quốc tế",
        tips: ["Tour Sơn Đoòng yêu cầu đặt trước từ 6 tháng đến 1 năm vì số lượng giới hạn mỗi năm chỉ đón khoảng 1.000 du khách."],
      },
      {
        heading: "2. Hố sụt Doline 2 và khu rừng nguyên sinh Vườn Địa Đàng",
        content: `Một trong những kỳ quan ngoạn mục nhất của Sơn Đoòng là Hố sụt 2 (Doline 2), nơi vòm đá vôi sụp đổ từ hàng trăm ngàn năm trước tạo thành giếng trời khổng lồ. Ánh sáng mặt trời chiếu rọi xuống đáy hang đã nuôi dưỡng cả một khu rừng nhiệt đới nguyên sinh tươi tốt mang tên 'Vườn Địa Đàng' (Garden of Edam). Nơi đây có cây cổ thụ cao hàng chục mét, dương xỉ cổ đại và cả hệ động vật riêng biệt chưa từng thấy ở nơi nào khác trên Trái Đất.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Son_Doong_Cave_DB_%283%29.jpg",
        imageCaption: "Hố sụt Doline 2 với thảm thực vật rừng nguyên sinh phát triển ngoạn mục dưới lòng đất",
        tips: ["Đừng quên mang ống kính góc rộng để bắt trọn những luồng ánh sáng mặt trời huyền ảo xuyên qua hố sụt."],
      },
      {
        heading: "3. Thạch nhũ nghìn năm và dòng sông ngầm kỳ bí",
        content: `Hệ thống thạch nhũ trong hang Sơn Đoòng thuộc hàng lớn nhất thế giới, với những cột măng đá cao tới hơn 70m như Tháp Bàn Chân Chó (Hand of Dog). Dòng sông ngầm Rào Thương chảy ngầm cuồn cuộn qua lòng hang tạo nên những hồ nước ngọc bích trong vắt, nơi du khách có thể chèo thuyền vượt sông trong lòng đất đầy kỳ thú.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Son_Doong_Cave_DB_%281%29.jpg",
        imageCaption: "Kiệt tác măng đá và thạch nhũ kỳ quan triệu năm kiến tạo trong bóng tối vĩnh hằng",
        tips: ["Tuân thủ tuyệt đối quy tắc không chạm tay vào thạch nhũ đang phát triển để bảo tồn nguyên vẹn kỳ quan."],
      },
      {
        heading: "4. Gợi ý lịch trình Tour Phong Nha - Kẻ Bàng kết hợp 1 Ngày",
        content: `Nếu chưa đủ điều kiện tham gia tour thám hiểm Sơn Đoòng nhiều ngày, du khách có thể lựa chọn lịch trình 1 ngày trải nghiệm trọn vẹn tinh hoa Phong Nha:

• 07:30 - 08:30: Xe đón tại sân bay/khách sạn Đồng Hới đưa lên thị trấn Phong Nha theo đường Hồ Chí Minh.
• 08:45 - 11:30: Ngồi thuyền máy xuôi dòng sông Son ngắm cảnh non nước hữu tình, khám phá Động Phong Nha hoặc Động Tiên Sơn.
• 12:00 - 13:30: Ăn trưa mẹt gà nướng than muối cheo và cá trắm sông Son om măng tại nhà hàng ven sông.
• 13:45 - 16:30: Khám phá Động Thiên Đường - 'Hoàng cung trong lòng đất' hoặc vui chơi tắm suối tại Suối Nước Moọc / Thung lũng Hava.
• 17:00: Xe Taxi đưa đón quý khách trở về Đồng Hới an toàn, thư thái.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Son_Doong_Cave_by_Daniel_Burka.jpg",
        imageCaption: "Dòng sông ngầm thám hiểm uốn lượn bên trong lòng núi đá vôi Phong Nha",
        tips: ["Đặt taxi trọn gói khứ hồi với Taxi Quảng Trị - Quảng Bình 24H để bác tài đồng hành cả ngày, không lo chờ xe."],
      },
      {
        heading: "5. Thưởng thức ẩm thực miền sơn cước Phong Nha trứ danh",
        content: `Ẩm thực Phong Nha mang đậm hương vị núi rừng đại ngàn hoang sơ:
• Mẹt gà đồi nướng than chấm muối cheo: Gà thả đồi thịt săn chắc nướng vàng ươm, chấm cùng muối cheo cay nồng thơm lừng mùi lá chanh và hạt dổi.
• Cá trắm sông Son: Cá được nuôi lồng trên dòng sông Son nước trong vắt, thịt bùi béo ngọt tự nhiên nướng lá chuối hoặc om măng cay.
• Bánh lọc Phong Nha: Nhân tôm thịt đậm đà, gói lá chuối hấp nóng hổi ăn kèm nước mắm ớt cay xé lưỡi.
• Rau dớn xào tỏi: Loại rau rừng mọc bên bờ suối đá giòn sần sật ngọt thanh giải nhiệt cực tốt.`,
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Mẹt ẩm thực gà đồi nướng than và đặc sản Phong Nha đậm đà phong vị bản xứ",
        tips: ["Nhờ bác tài Taxi 24H giới thiệu những quán ăn ngon có view nhìn thẳng ra dòng sông Son thơ mộng."],
      },
      {
        heading: "6. Dịch vụ Taxi Quảng Trị - Quảng Bình 24H: Đón tiễn Sân bay Đồng Hới chu đáo",
        content: `Dịch vụ Taxi Quảng Trị - Quảng Bình 24H chuyên phục vụ đưa đón khách du lịch và các đoàn thám hiểm hang động:
• Đón trả đúng giờ tại Sân bay Đồng Hới (VDH), Ga Đồng Hới lên thẳng Phong Nha (45-50km) chỉ sau 45 phút chạy xe.
• Đội xe 4 chỗ và 7 chỗ đời mới, cốp xe siêu rộng chứa vừa hành lý trekking cồng kềnh.
• Bảng giá niêm yết rõ ràng chỉ từ 12.000đ/km, ưu đãi chiều về tới 50%, bác tài bản xứ nhiệt tình hỗ trợ khuân vác hành lý.`,
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Taxi Quảng Bình 24H túc trực 24/7 sẵn sàng đồng hành cùng chuyến phiêu lưu của bạn",
        tips: ["Gọi Hotline 0877.669.555 trước giờ hạ cánh để xe đợi sẵn ở sảnh sân bay, không phải chen lấn chờ xe."],
      },
    ],
    faqs: [
      {
        question: "Từ TP. Đồng Hới đi taxi lên trung tâm Phong Nha mất bao lâu?",
        answer: "Khoảng cách từ trung tâm Đồng Hới lên Phong Nha là 45-50km, thời gian di chuyển bằng taxi chỉ mất khoảng 45 đến 50 phút. Xe 4 chỗ và 7 chỗ phục vụ 24/7.",
      },
      {
        question: "Thời điểm nào lý tưởng nhất để tham quan Sơn Đoòng?",
        answer: "Thời điểm lý tưởng nhất là từ tháng 2 đến tháng 8, lúc này thời tiết khô ráo, nắng ấm và nước trong hang êm dịu nhất.",
      },
      {
        question: "Giá taxi 4 chỗ từ Sân bay Đồng Hới lên Phong Nha là bao nhiêu?",
        answer: "Giá taxi 4 chỗ trọn gói từ Sân bay Đồng Hới lên thẳng các khách sạn tại Phong Nha dao động từ 450.000đ - 540.000đ/chuyến. Đặt khứ hồi 2 chiều được giảm ngay 50% chiều về.",
      },
    ],
  },
  {
    slug: "cam-nang-du-lich-dia-dao-vinh-moc-quang-tri",
    title: "Cẩm Nang Du Lịch Địa Đạo Vịnh Mốc 2026: Huyền Thoại Làng Hầm Trong Lòng Đất Quảng Trị",
    metaTitle: "Cẩm Nang Khám Phá Địa Đạo Vịnh Mốc Quảng Trị 2026 | Taxi 24H",
    metaDescription: "Khám phá huyền thoại làng hầm Địa đạo Vịnh Mốc Quảng Trị: Giá vé, hướng dẫn tham quan các tầng địa đạo, kinh nghiệm thuê xe taxi trọn gói từ Đông Hà và Đồng Hới.",
    excerpt: "Địa đạo Vịnh Mốc - kỳ tích kiến trúc quân sự lòng đất độc nhất vô nhị của nhân loại. Giữa mưa bom bão đạn, quân và dân Vĩnh Linh đã kiến tạo một thành phố ngầm kiên cường, nơi 17 đứa trẻ cất tiếng khóc chào đời trong lòng đất mẹ.",
    category: "Di Tích Lịch Sử Tâm Linh",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/c/c8/C%E1%BB%ADa_s%E1%BB%91_13_c%E1%BB%A7a_%C4%91%E1%BB%8Ba_%C4%91%E1%BA%A1o_V%E1%BB%8Bnh_M%E1%BB%91c.JPG",
    destination: "Địa Đạo Vịnh Mốc (Huyện Vĩnh Linh, Quảng Trị)",
    distanceFromDongHoi: "65 km (khoảng 60 - 70 phút đi xe)",
    taxiFare4Seats: "650.000 VNĐ",
    taxiFare6Seats: "800.000 VNĐ",
    ticketPrice: "50.000đ/người lớn (Trẻ em miễn phí)",
    bestTimeToVisit: "Quanh năm, thời tiết trong lòng hầm luôn mát mẻ 22-25°C",
    readTime: "8 phút đọc",
    highlights: [
      "Hệ thống làng hầm 3 tầng kỳ vĩ dài gần 2km đào hoàn toàn bằng bàn tay và công cụ thô sơ",
      "Kỳ tích 17 đứa trẻ cất tiếng khóc chào đời an toàn ngay trong phòng hộ sinh lòng đất",
      "Hệ thống 13 cửa hầm thông gió thông minh với 6 cửa trổ thẳng ra bờ biển Đông lộng gió",
      "Di tích Quốc gia đặc biệt tiêu biểu cho ý chí 'Một tấc không đi, một ly không rời'",
      "Dịch vụ taxi đưa đón trọn gói từ Đồng Hới hoặc Đông Hà chỉ từ 12.000đ/km",
    ],
    gallery: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/c/c8/C%E1%BB%ADa_s%E1%BB%91_13_c%E1%BB%A7a_%C4%91%E1%BB%8Ba_%C4%91%E1%BA%A1o_V%E1%BB%8Bnh_M%E1%BB%91c.JPG",
        caption: "Cửa hầm số 13 trổ thẳng ra bãi biển Vịnh Mốc đón gió mát lành",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Family_Room_in_Vinh_Moc_tunnel.JPG",
        caption: "Căn hộ gia đình khoét sâu vào vách đất son - Nơi sinh hoạt ấm cúng thời chiến",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/6/68/Gi%E1%BA%BFng_n%C6%B0%E1%BB%9Bc_%E1%BB%9F_V%E1%BB%8Bnh_M%E1%BB%91c.JPG",
        caption: "Giếng nước ngọt sinh hoạt khoét sâu giữa lòng địa đạo",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Visitors_in_Vinh_Moc_tunnel.JPG",
        caption: "Du khách quốc tế ngỡ ngàng trước quy mô đường hầm 3 tầng kiên cố",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/C%E1%BA%A7u_Hi%E1%BB%81n_L%C6%B0%C6%A1ng_%28nh%C3%ACn_t%E1%BB%AB_b%E1%BB%9D_Nam%29.JPG",
        caption: "Cầu Hiền Lương - Sông Bến Hải nằm trên cùng cung đường tour Vịnh Mốc",
      },
    ],
    sections: [
      {
        heading: "1. Địa đạo Vịnh Mốc - Bản trường ca sống trong lòng đất của lũy thép Vĩnh Linh",
        content: `Nằm bên bờ biển Vĩnh Thạch, huyện Vĩnh Linh, Địa đạo Vịnh Mốc là di tích lịch sử huyền thoại minh chứng cho sức sống quật cường của nhân dân vùng giới tuyến Vĩ tuyến 17. Trong những năm tháng chiến tranh khốc liệt (1965 - 1972), mỗi người dân Vĩnh Linh phải gánh chịu trung bình 7 tấn bom đạn. Để bám đất, giữ làng và tiếp tế cho đảo Cồn Cỏ tiền tiêu, người dân nơi đây đã quyết định chuyển toàn bộ cuộc sống xuống lòng đất.

Chỉ bằng những chiếc cuốc, xẻng thô sơ và đôi bàn tay trần, quân và dân Vịnh Mốc đã đào và di chuyển hơn 6.000 mét khối đất đá bazan cứng, kiến tạo nên một công trình địa đạo đồ sộ với tổng chiều dài gần 2.000 mét. Địa đạo trở thành pháo đài thép bất khả xâm phạm, chở che cho hàng trăm con người suốt gần 2.000 ngày đêm khói lửa.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/c/c8/C%E1%BB%ADa_s%E1%BB%91_13_c%E1%BB%A7a_%C4%91%E1%BB%8Ba_%C4%91%E1%BA%A1o_V%E1%BB%8Bnh_M%E1%BB%91c.JPG",
        imageCaption: "Cửa hầm số 13 của địa đạo Vịnh Mốc nhìn ra biển xanh - Điểm check-in biểu tượng của di tích",
        tips: [
          "Nên mang giày thể thao chống trơn trượt vì lối đi trong lòng hầm là đất đất sét nén tự nhiên.",
        ],
      },
      {
        heading: "2. Kiến trúc 3 tầng lòng đất thông minh và khoa học vượt thời đại",
        content: `Hệ thống địa đạo Vịnh Mốc được thiết kế với 3 tầng sâu khác nhau:
• Tầng 1 (sâu 12 - 15m): Là nơi cơ động chiến đấu, trực chiến bắn máy bay và tàu chiến địch.
• Tầng 2 (sâu 18m): Là trung tâm sinh hoạt của dân làng, gồm trạm xá, hội trường sức chứa 60 người, bếp Hoàng Cầm, kho lương thực và trường học cho các em nhỏ.
• Tầng 3 (sâu 22 - 23m): Dùng làm kho cất giấu vũ khí, đạn dược và trung chuyển hàng hóa tiếp tế cho bộ đội đảo Cồn Cỏ.

Toàn bộ địa đạo có 13 cửa hầm thông ra ngoài (7 cửa trổ lên đồi, 6 cửa trổ thẳng ra biển) cùng hệ thống giếng thông hơi thông minh giúp luồng gió biển luôn lưu thông mát rượi, xua tan cảm giác ngột ngạt ngỡ như đang ở trên mặt đất.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Visitors_in_Vinh_Moc_tunnel.JPG",
        imageCaption: "Du khách trải nghiệm khám phá các tầng địa đạo được giữ gìn nguyên vẹn qua hơn nửa thế kỷ",
        tips: [
          "Chiều cao lòng hầm từ 1m50 - 1m80, du khách đi bộ hơi cúi đầu nhẹ ở một số đoạn ngắn.",
        ],
      },
      {
        heading: "3. Kỳ tích 17 đứa trẻ chào đời trong lòng đất tối",
        content: `Điều khiến du khách trong và ngoài nước xúc động nhất khi đặt chân đến Vịnh Mốc chính là Căn phòng hộ sinh dã chiến nằm ở tầng 2 địa đạo. Giữa tiếng gầm rú của bom tọa độ và pháo hạm từ biển bắn vào, nữ hộ sinh địa phương đã đỡ đẻ thành công cho 17 em bé chào đời bình an vô sự.

Những mầm sống non nớt cất tiếng khóc đầu đời trong lòng đất mẹ sâu thẳm dưới ánh đèn dầu le lói là biểu tượng bất diệt cho tình yêu thương, niềm tin mãnh liệt vào hòa bình và sự trường tồn của dân tộc Việt Nam.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Family_Room_in_Vinh_Moc_tunnel.JPG",
        imageCaption: "Căn hộ gia đình khoét sâu vào vách đất - Nơi lưu giữ ký ức về cuộc sống kiên cường của nhân dân Vịnh Mốc",
        tips: [
          "Hãy dành vài phút lắng đọng tại khu phòng hộ sinh để nghe hướng dẫn viên kể câu chuyện về các 'em bé địa đạo' nay đã thành đạt.",
        ],
      },
      {
        heading: "4. Gợi ý lịch trình Tour Vĩ Tuyến 17 - Vịnh Mốc - Cầu Hiền Lương 1 Ngày",
        content: `Lịch trình kết hợp hoàn hảo khám phá cụm Di tích lịch sử Quốc gia đặc biệt Vĩnh Linh:
• 07:30 - 08:30: Xe đón tại khách sạn Đồng Hới hoặc Đông Hà, khởi hành theo QL1A đi Vĩnh Linh.
• 08:45 - 10:15: Tham quan Cụm di tích Đôi bờ Hiền Lương - Sông Bến Hải (Cầu Hiền Lương lịch sử, Nhà trưng bày Vĩ tuyến 17, Cột cờ giới tuyến).
• 10:30 - 12:30: Khám phá Địa đạo Vịnh Mốc, Bảo tàng chứng tích và check-in Cửa hầm số 13 ngắm biển xanh.
• 12:30 - 14:00: Ăn trưa hải sản tươi sống tại Bãi tắm Cửa Tùng - nơi từng được mệnh danh là 'Nữ hoàng của các bãi tắm'.
• 14:30 - 16:00: Check-in Mũi Trèo Vĩnh Linh với vách đá nhô ra biển hùng vĩ hoặc Rừng nguyên sinh Rú Lịnh.
• 16:30: Xe trả quý khách về lại khách sạn hoặc ga tàu, sân bay an toàn.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f0/C%E1%BA%A7u_Hi%E1%BB%81n_L%C6%B0%C6%A1ng_%28nh%C3%ACn_t%E1%BB%AB_b%E1%BB%9D_Nam%29.JPG",
        imageCaption: "Cầu Hiền Lương bắc qua sông Bến Hải - Điểm kết hợp hoàn hảo cùng tour Vịnh Mốc",
        tips: [
          "Đặt xe taxi trọn gói khứ hồi với Taxi Quảng Trị 24H để bác tài chở thẳng tuyến tour không cần lo tìm đường hay đổi xe.",
        ],
      },
      {
        heading: "5. Thưởng thức ẩm thực hải sản Cửa Tùng & đặc sản Vĩnh Linh",
        content: `Đến Vịnh Mốc, du khách sẽ được thưởng thức những món quà ẩm thực đậm đà phong vị biển miền Trung:
• Mực nháy Cửa Tùng hấp gừng: Mực câu trong đêm tươi rói giòn ngọt sần sật chấm muối tiêu chanh ớt xiêm xanh.
• Bánh đúc rau câu Vĩnh Linh: Món ăn thanh mát độc đáo nấu từ rau câu biển tự nhiên, chấm nước ruốc biển cay nồng.
• Canh chua cá bớp nấu lá giang: Vị chua thanh ngọt đậm đà đánh tan mệt mỏi sau chuyến đi bộ.
• Nước mắm truyền thống Cửa Tùng và Tiêu đen Vĩnh Linh: Món quà đặc sản hảo hạng du khách thường mua về biếu người thân.`,
        tips: [
          "Bác tài Taxi 24H sẽ gợi ý những quán hải sản bình dân của bà con ngư dân Cửa Tùng, đồ tươi rói giá cả phải chăng.",
        ],
      },
      {
        heading: "6. Dịch vụ Taxi Quảng Trị 24H đưa đón Vịnh Mốc tận tâm, giá rẻ",
        content: `Taxi Quảng Trị - Quảng Bình 24H tự hào là sự lựa chọn hàng đầu của du khách khi khám phá Di tích Vịnh Mốc:
• Đội xe đời mới từ 4 đến 7 chỗ máy lạnh sạch sẽ, chạy êm ái trên các cung đường ven biển.
• Giá cước trọn gói cam kết chỉ từ 12.000đ/km, rẻ hơn 20-30% so với taxi truyền thống, không phí phụ trội.
• Đội ngũ tài xế bản địa thân thiện, lái xe cẩn thận, am hiểu sâu sắc lịch sử và hỗ trợ khách hàng nhiệt tình suốt chuyến đi.`,
        tips: [
          "Gọi ngay Hotline 0877.669.555 để đặt xe trước và giữ xe đời mới nhất cho hành trình khám phá.",
        ],
      },
    ],
    faqs: [
      {
        question: "Từ TP. Đông Hà hoặc Đồng Hới đi taxi đến Vịnh Mốc mất bao xa?",
        answer: "Từ Đông Hà đi Vịnh Mốc khoảng 38km (40 phút). Từ Đồng Hới đi Vịnh Mốc khoảng 65km (65 phút). Taxi phục vụ đón tận nơi 24/7.",
      },
      {
        question: "Đi trong lòng địa đạo Vịnh Mốc có ngột ngạt hoặc thiếu oxy không?",
        answer: "Hoàn toàn không. Hệ thống địa đạo Vịnh Mốc có các giếng thông gió tự nhiên thông thẳng ra bờ biển nên không khí bên trong luôn mát mẻ 22-25°C, thông thoáng và rất dễ thở.",
      },
      {
        question: "Vé vào cổng Địa đạo Vịnh Mốc là bao nhiêu?",
        answer: "Giá vé tham quan hiện tại là 50.000đ/người lớn. Trẻ em dưới 1m2 được miễn phí vé tham quan.",
      },
    ],
  },
  {
    slug: "kinh-nghiem-hanh-huong-thanh-dia-la-vang-quang-tri",
    title: "Kinh Nghiệm Hành Hương Thánh Địa La Vang Quảng Trị 2026: Trung Tâm Thánh Mẫu Linh Thiêng Bậc Nhất",
    metaTitle: "Kinh Nghiệm Hành Hương Đức Mẹ La Vang Quảng Trị 2026 | Taxi 24H",
    metaDescription: "Cẩm nang hướng dẫn hành hương Thánh địa Đức Mẹ La Vang Quảng Trị: Nguồn gốc tích Đức Mẹ hiện ra, giờ lễ, kinh nghiệm xin ơn và dịch vụ xe taxi đón tiễn từ Huế, Đông Hà, Đồng Hới.",
    excerpt: "Thánh địa La Vang là trung tâm hành hương Công giáo lớn bậc nhất Việt Nam. Nơi đây gắn liền với sự tích Đức Mẹ Maria hiện ra che chở đoàn con trong rừng thẳm Dinh Cát năm 1798.",
    category: "Di Tích Lịch Sử Tâm Linh",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/b/b3/To%C3%A0n_c%E1%BA%A3nh_qu%E1%BA%A3ng_tr%C6%B0%E1%BB%9Dng_La_Vang.JPG",
    destination: "Thánh Địa La Vang (Huyện Hải Lăng, Quảng Trị)",
    distanceFromDongHoi: "110 km (khoảng 95 - 105 phút đi xe)",
    taxiFare4Seats: "950.000 VNĐ",
    taxiFare6Seats: "1.200.000 VNĐ",
    ticketPrice: "Miễn phí tham quan và hành hương",
    bestTimeToVisit: "Quanh năm, đặc biệt dịp Đại hội La Vang ngày 15/8 và các ngày Lễ trọng",
    readTime: "8 phút đọc",
    highlights: [
      "Trung tâm Thánh Mẫu Quốc gia thiêng liêng thu hút hàng triệu tín hữu và du khách thập phương",
      "Vương cung Thánh đường La Vang mới với quy mô nguy nga mang đậm nét kiến trúc truyền thống Việt Nam",
      "Tháp chuông cổ rêu phong lịch sử in hằn dấu ấn thăng trầm của thời gian",
      "Cây đa La Vang lịch sử - nơi tương truyền Đức Mẹ bồng Chúa Hài Đồng hiện ra chữa lành bệnh tật",
      "Dịch vụ taxi đón tiễn sân bay Phú Bài (Huế), ga Đông Hà về La Vang giá rẻ chỉ từ 12.000đ/km",
    ],
    gallery: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/To%C3%A0n_c%E1%BA%A3nh_qu%E1%BA%A3ng_tr%C6%B0%E1%BB%9Dng_La_Vang.JPG",
        caption: "Toàn cảnh quảng trường và Vương cung Thánh đường La Vang bề thế nguy nga",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Th%C3%A1p_chu%C3%B4ng_La_Vang.JPG",
        caption: "Di tích Tháp chuông cổ kính La Vang sừng sững qua bao biến thiên lịch sử",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/7/75/T%C6%B0%E1%BB%A3ng_%C4%90%E1%BB%A9c_M%E1%BA%B9_La_Vang.JPG",
        caption: "Tượng Đức Mẹ La Vang nhân từ trong tà áo dài truyền thống Việt Nam",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/0/09/Th%C3%A0nh_c%E1%BB%95_Qu%E1%BA%A3ng_Tr%E1%BB%8B_4.jpg",
        caption: "Thành Cổ Quảng Trị cách La Vang chỉ 6km - Điểm kết hợp lý tưởng trong ngày",
      },
    ],
    sections: [
      {
        heading: "1. Sự tích huyền thoại Đức Mẹ La Vang hiện ra che chở giáo dân",
        content: `Năm 1798, dưới thời vua Cảnh Thịnh nhà Tây Sơn, nhiều tín hữu Công giáo đã chạy trốn vào khu rừng rậm hoang vu La Vang thuộc vùng đất Dinh Cát xưa (nay thuộc xã Hải Phú, huyện Hải Lăng, Quảng Trị). Giữa cảnh đói khổ, bệnh tật và thú dữ rình rập, giáo dân đêm ngày tụ họp dưới gốc cây đa cổ thụ đọc kinh cầu nguyện xin ơn che chở.

Tương truyền, vào một đêm thanh vắng, Đức Mẹ Maria đã hiện ra trong ánh hào quang rực rỡ, khoác áo choàng lộng lẫy, tay bồng Chúa Giêsu Hài Đồng và có hai thiên thần hầu cận. Đức Mẹ ủi an đoàn con đau khổ và chỉ dạy họ hái một loại lá cây mọc quanh vùng (cây lá Vằng) đun nước uống để chữa lành bệnh tật. Từ đó, địa danh La Vang trở thành mảnh đất linh thiêng, nơi Đức Mẹ luôn lắng nghe và ban ơn lành cho mọi người đến cầu xin.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/7/75/T%C6%B0%E1%BB%A3ng_%C4%90%E1%BB%A9c_M%E1%BA%B9_La_Vang.JPG",
        imageCaption: "Tượng Đức Mẹ La Vang bồng Chúa Hài Đồng nhân từ chở che đoàn con cái",
        tips: [
          "Du khách có thể chuẩn bị bình nước sạch để xin nước thánh tại nguồn nước suối thiêng La Vang mang về cho gia đình.",
        ],
      },
      {
        heading: "2. Chiêm ngưỡng kiến trúc Vương cung Thánh đường và Tháp chuông cổ rêu phong",
        content: `Quần thể Trung tâm Hành hương La Vang là sự kết hợp hài hòa giữa văn hóa Công giáo và nét kiến trúc cung đình, đình làng Việt Nam:
• Tháp chuông cổ La Vang: Là chứng tích còn sót lại của ngôi thánh đường xây dựng năm 1928, trải qua bom đạn chiến tranh năm 1972 vẫn sừng sững đứng vững, rêu phong cổ kính như chứng nhân của lịch sử.
• Cụm tượng đài Ba Cây Đa: Nơi đặt tượng Đức Mẹ La Vang mặc trang phục áo dài truyền thống Việt Nam, đầu đội khăn đóng bồng Chúa Giêsu, che chở bên dưới là ba cây đa nhân tạo khổng lồ vươn tán rộng lớn.
• Vương cung Thánh đường mới: Công trình đồ sộ mang phong cách kiến trúc Á Đông với mái ngói đỏ cong vút, cột gỗ chạm khắc tinh xảo có sức chứa hàng ngàn người tham dự thánh lễ.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Th%C3%A1p_chu%C3%B4ng_La_Vang.JPG",
        imageCaption: "Tháp chuông cổ La Vang - Di tích linh thiêng sừng sững giữa đất trời Quảng Trị",
        tips: [
          "Khuôn viên La Vang rất rộng lớn và rợp bóng cây xanh, du khách nên mặc trang phục lịch sự, kín đáo khi vào chiêm bái.",
        ],
      },
      {
        heading: "3. Lễ hội Hành hương La Vang và các giờ Thánh Lễ thiêng liêng",
        content: `Hàng năm, Thánh địa La Vang đón hàng triệu lượt khách hành hương. Đặc biệt vào dịp Đại hội La Vang (tổ chức định kỳ 3 năm một lần vào ngày 13 - 15/8 kỷ niệm Lễ Đức Mẹ Hồn Xác Lên Trời), biển người từ khắp mọi miền đất nước và kiều bào hải ngoại đổ về đây hiệp dâng thánh lễ, rước kiệu Đức Mẹ trong bầu không khí thánh thiện và xúc động khôn tả.

Vào những ngày thường, Thánh địa cử hành thánh lễ hàng ngày vào các khung giờ: 05h00 sáng và 19h00 tối. Riêng ngày Chúa Nhật có các thánh lễ vào 05h00, 08h00 sáng và 15h00 chiều.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/b/b3/To%C3%A0n_c%E1%BA%A3nh_qu%E1%BA%A3ng_tr%C6%B0%E1%BB%9Dng_La_Vang.JPG",
        imageCaption: "Quảng trường trung tâm La Vang - Nơi diễn ra các đại lễ hành hương long trọng",
        tips: [
          "Nếu có kế hoạch tham dự thánh lễ, bạn nên có mặt trước giờ lễ 20 phút để chọn được vị trí ngồi thuận lợi.",
        ],
      },
      {
        heading: "4. Lịch trình Tour Hành Hương La Vang - Thành Cổ Quảng Trị 1 Ngày",
        content: `Cung đường tâm linh kết hợp lý tưởng nhất trong ngày:
• 08:00: Xe đón tại Ga Đông Hà hoặc khách sạn, di chuyển đến Thánh địa La Vang (cách 18km).
• 08:30 - 11:00: Tham quan Vương cung Thánh đường, viếng tượng đài Ba Cây Đa, dâng hạt chuỗi mân côi và lấy nước thánh tại giếng thiêng.
• 11:30: Thưởng thức bữa trưa đặc sản Bánh bột lọc Mỹ Chánh và Cháo bột Hải Lăng trứ danh ngay gần La Vang.
• 13:30 - 15:30: Di chuyển về viếng Thành Cổ Quảng Trị (cách La Vang chỉ 6km), dâng hương Bến thả hoa sông Thạch Hãn.
• 16:00: Xe đưa đoàn ghé mua đặc sản bánh ướt Phương Lang, cao lá vằng làm quà và trả khách về điểm hẹn.`,
        tips: [
          "Đặt xe taxi phục vụ riêng trọn gói cả ngày với Taxi Quảng Trị 24H để thoải mái thời gian cầu nguyện mà không bị giục giã.",
        ],
      },
      {
        heading: "5. Đặc sản ẩm thực Hải Lăng & Quà tặng phước lành La Vang",
        content: `Vùng đất Hải Lăng bao bọc La Vang có nền ẩm thực dân dã nhưng vô cùng độc đáo:
• Cao lá Vằng La Vang: Chiết xuất từ lá vằng sẻ tự nhiên nơi Đức Mẹ chỉ dạy, có tác dụng mát gan, bổ máu, kích thích tiêu hóa và lợi sữa cho phụ nữ sau sinh.
• Bánh bột lọc Mỹ Chánh: Nổi tiếng nhất tỉnh Quảng Trị với hương vị đậm đà khó quên.
• Bánh ướt Phương Lang: Món bánh ướt thịt heo chấm tương ớt mè gia truyền hơn 100 năm tuổi.`,
        tips: [
          "Nên mua cao lá vằng tại các quầy dòng tu bên trong trung tâm La Vang để đảm bảo chất lượng tinh chất nguyên chất 100%.",
        ],
      },
      {
        heading: "6. Dịch vụ Taxi Quảng Trị 24H đưa đón hành hương La Vang chu đáo",
        content: `Taxi Quảng Trị 24H hân hạnh phục vụ bà con giáo dân và du khách hành hương về đất Mẹ:
• Đưa đón tận nơi từ Sân bay Phú Bài (Huế - 55km), Sân bay Đồng Hới (110km), Ga Đông Hà (18km) hoặc Ga Huế.
• Xe 4 - 7 chỗ đời mới sạch sẽ, trang bị điều hòa êm ái, bác tài bản xứ tận tình, chu đáo hỗ trợ đồ lễ và hành lý.
• Mức giá cước trọn gói tiết kiệm nhất khu vực chỉ từ 12.000đ/km, cam kết không tăng giá vào các dịp lễ hội cao điểm.`,
        tips: [
          "Liên hệ Hotline 0877.669.555 để đặt xe trước 30 phút hoặc đặt xe theo ngày trọn gói ưu đãi nhất.",
        ],
      },
    ],
    faqs: [
      {
        question: "Từ Ga Đông Hà hoặc TP. Huế đi taxi đến La Vang mất bao lâu?",
        answer: "Từ Ga Đông Hà đến La Vang chỉ 18km (khoảng 20 phút đi taxi, giá khoảng 200.000đ - 220.000đ). Từ trung tâm TP. Huế đến La Vang khoảng 55km (khoảng 60 phút đi taxi, giá khoảng 550.000đ - 650.000đ).",
      },
      {
        question: "Người không theo đạo Công giáo có được vào tham quan Thánh địa La Vang không?",
        answer: "Thánh địa La Vang mở cửa tự do và nồng nhiệt chào đón tất cả mọi người, không phân biệt tôn giáo, đến tham quan, chiêm bái và tận hưởng không gian thanh tịnh.",
      },
      {
        question: "Tại La Vang có chỗ nghỉ qua đêm cho khách hành hương không?",
        answer: "Có. Trung tâm Hành hương La Vang có các dãy nhà lưu trú phục vụ khách hành hương với chi phí hỗ trợ tùy tâm hoặc giá tượng trưng rất rẻ.",
      },
    ],
  },
  {
    slug: "kinh-nghiem-du-lich-doi-bo-hien-luong-song-ben-hai",
    title: "Kinh Nghiệm Tham Quan Đôi Bờ Hiền Lương - Sông Bến Hải 2026: Vĩ Tuyến 17 & Khát Vọng Thống Nhất",
    metaTitle: "Kinh Nghiệm Du Lịch Đôi Bờ Hiền Lương Sông Bến Hải 2026 | Taxi 24H",
    metaDescription: "Cẩm nang tham quan Cụm Di tích Quốc gia đặc biệt Đôi bờ Hiền Lương - Sông Bến Hải: Cầu Hiền Lương sơn 2 màu, Cột cờ giới tuyến, Nhà liên hợp và taxi đón tiễn giá rẻ.",
    excerpt: "Đôi bờ Hiền Lương - Sông Bến Hải, nơi chia cắt hai miền Nam - Bắc suốt hơn 20 năm ròng rã trong chiến tranh. Cầu Hiền Lương lịch sử là chứng nhân bi tráng cho khát vọng non sông liền một dải.",
    category: "Di Tích Lịch Sử Tâm Linh",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/f/f0/C%E1%BA%A7u_Hi%E1%BB%81n_L%C6%B0%C6%A1ng_%28nh%C3%ACn_t%E1%BB%AB_b%E1%BB%9D_Nam%29.JPG",
    destination: "Cụm Di Tích Đôi Bờ Hiền Lương (Huyện Vĩnh Linh, Quảng Trị)",
    distanceFromDongHoi: "70 km (khoảng 65 phút đi xe)",
    taxiFare4Seats: "680.000 VNĐ",
    taxiFare6Seats: "850.000 VNĐ",
    ticketPrice: "50.000đ/người lớn (Trẻ em miễn phí)",
    bestTimeToVisit: "Quanh năm, đặc biệt dịp kỷ niệm 30/4 ngày Thống nhất non sông",
    readTime: "8 phút đọc",
    highlights: [
      "Di tích Quốc gia đặc biệt biểu tượng cho nỗi đau chia cắt và niềm vui sum họp non sông",
      "Cây cầu Hiền Lương lịch sử được phục dựng với 2 màu sơn xanh - vàng chia đôi ranh giới",
      "Cột cờ giới tuyến bờ Bắc cao 38m sừng sững tung bay lá cờ Tổ quốc rộng 108m2",
      "Nhà trưng bày 'Vĩ tuyến 17 và khát vọng thống nhất' lưu giữ hàng trăm hiện vật quý giá",
      "Dịch vụ taxi đưa đón trọn gói tuyến Cầu Hiền Lương - Địa đạo Vịnh Mốc chỉ từ 12.000đ/km",
    ],
    gallery: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/C%E1%BA%A7u_Hi%E1%BB%81n_L%C6%B0%C6%A1ng_%28nh%C3%ACn_t%E1%BB%AB_b%E1%BB%9D_Nam%29.JPG",
        caption: "Cây cầu Hiền Lương lịch sử bắc qua dòng sông Bến Hải êm đềm",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/c/c8/C%E1%BB%ADa_s%E1%BB%91_13_c%E1%BB%A7a_%C4%91%E1%BB%8Ba_%C4%91%E1%BA%A1o_V%E1%BB%8Bnh_M%E1%BB%91c.JPG",
        caption: "Địa đạo Vịnh Mốc kề bên - Cùng nằm trên tuyến du lịch Vĩ tuyến 17",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Th%C3%A0nh_c%E1%BB%95_Qu%E1%BA%A3ng_Tr%E1%BB%8B_ng%C3%A0y_nay.jpg",
        caption: "Non sông gấm vóc Quảng Trị ngày nay xanh tươi ngút ngàn",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/1/11/S%C3%B4ng_Th%E1%BA%A1ch_H%C3%A3n_4.JPG",
        caption: "Sông Thạch Hãn và Bến Hải - Hai dòng sông huyền thoại của mảnh đất anh hùng",
      },
    ],
    sections: [
      {
        heading: "1. Vĩ tuyến 17 và nỗi đau chia cắt hơn 20 năm ròng rã",
        content: `Theo Hiệp định Genève năm 1954, dòng sông Bến Hải chảy dọc theo Vĩ tuyến 17 được chọn làm giới tuyến quân sự tạm thời chia cắt Việt Nam thành hai miền. Ranh giới ấy ngỡ chỉ kéo dài 2 năm để chờ ngày tổng tuyển cử, nhưng lại kéo dài đằng đẵng hơn 20 năm (1954 - 1975) với biết bao máu xương và nước mắt của đồng bào hai miền.

Dòng sông Bến Hải hiền hòa bỗng chốc trở thành ranh giới ngăn cách mẹ xa con, vợ xa chồng. Nhưng chính tại nơi đây, ý chí sắt đá 'Nước Việt Nam là một, dân tộc Việt Nam là một, sông có thể cạn, núi có thể mòn, song chân lý ấy không bao giờ thay đổi' đã tỏa sáng rực rỡ hơn bao giờ hết.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f0/C%E1%BA%A7u_Hi%E1%BB%81n_L%C6%B0%C6%A1ng_%28nh%C3%ACn_t%E1%BB%AB_b%E1%BB%9D_Nam%29.JPG",
        imageCaption: "Cầu Hiền Lương nối hai bờ Nam - Bắc sông Bến Hải - Biểu tượng bất diệt cho hòa bình và thống nhất",
        tips: [
          "Nên đi bộ chậm rãi trên cầu gỗ Hiền Lương để cảm nhận vạch sơn trắng phân định giới tuyến giữa hai màu sơn xanh và vàng.",
        ],
      },
      {
        heading: "2. Cột cờ giới tuyến bờ Bắc và cuộc chiến âm thanh huyền thoại",
        content: `Nổi bật bên bờ Bắc là Cột cờ Hiền Lương cao 38m kiêu hãnh tung bay lá đại kỳ đỏ sao vàng rộng 108m2. Trong những năm tháng chiến tranh, nơi đây diễn ra cuộc chiến 'chọi cờ' vô cùng quyết liệt: địch nâng cột cờ bờ Nam cao thêm vài mét, quân ta lập tức nâng cột cờ bờ Bắc cao hơn. Dù bom đạn Mỹ bắn phá làm gãy đổ hàng chục lần, lá cờ Tổ quốc bên bờ Bắc chưa từng một ngày ngừng tung bay.

Cạnh đó là hệ thống giàn loa phóng thanh công suất 500W khổng lồ. Cuộc 'đấu loa' phát đi tiếng hát quê hương, lời kêu gọi hòa bình sang bờ Nam đã trở thành câu chuyện huyền thoại độc nhất vô nhị trong lịch sử chiến tranh thế giới.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Th%C3%A0nh_c%E1%BB%95_Qu%E1%BA%A3ng_Tr%E1%BB%8B_ng%C3%A0y_nay.jpg",
        imageCaption: "Quần thể di tích Đôi bờ Hiền Lương lưu giữ những kỷ vật hào hùng của lịch sử giải phóng dân tộc",
        tips: [
          "Bên trong Nhà trưng bày Vĩ tuyến 17 có mô hình giàn loa phóng thanh và các tài liệu mật thời chiến rất đáng xem.",
        ],
      },
      {
        heading: "3. Tượng đài Khát Vọng Thống Nhất lắng đọng bờ Nam",
        content: `Bước sang bờ Nam sông Bến Hải, du khách sẽ bắt gặp cụm Tượng đài 'Khát vọng thống nhất' tạc hình tượng người mẹ miền Nam bồng con ngóng về bờ Bắc. Ánh mắt đau đáu, da diết hướng về dòng sông chở nặng phù sa gợi nhắc bao nỗi niềm ly tán thời chiến.

Đứng bên tượng đài trong tiếng gió lộng bờ sông, bất kỳ ai cũng rưng rưng xúc động trước cái giá quá đắt của nền độc lập hôm nay, để thêm trân quý từng phút giây hòa bình trên non sông đất mẹ.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/1/11/S%C3%B4ng_Th%E1%BA%A1ch_H%C3%A3n_4.JPG",
        imageCaption: "Dòng nước êm ả bờ Nam sông Bến Hải nơi từng in đậm nỗi đau chia cắt đôi bờ",
        tips: [
          "Thời điểm chụp ảnh đẹp nhất tại Cột cờ và Cầu Hiền Lương là vào khoảng 08h00 - 09h30 sáng khi nắng sớm chiếu rọi lá cờ.",
        ],
      },
      {
        heading: "4. Lịch trình Tour Vĩ Tuyến 17 - Hiền Lương - Vịnh Mốc 1 Ngày",
        content: `Hành trình trọn vẹn khám phá cụm di tích lịch sử Vĩnh Linh trong 1 ngày:
• 07:30: Xe Taxi 24H đón quý khách tại khách sạn ở TP. Đông Hà hoặc Đồng Hới.
• 08:30 - 10:30: Tham quan Cụm di tích Đôi bờ Hiền Lương - Sông Bến Hải, Cột cờ bờ Bắc, Nhà trưng bày và Cụm loa phóng thanh.
• 10:45 - 12:30: Di chuyển về Địa đạo Vịnh Mốc (cách 14km), trải nghiệm đường hầm 3 tầng trong lòng đất mát lạnh.
• 12:30 - 14:00: Nghỉ ngơi và thưởng thức hải sản tươi rói tại bãi biển Cửa Tùng.
• 14:30 - 16:30: Tham quan Nghĩa trang Liệt sĩ Quốc gia Trường Sơn hoặc Cồn Cỏ vọng cảnh.
• 17:00: Xe đưa đoàn về lại điểm hẹn an toàn.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/c/c8/C%E1%BB%ADa_s%E1%BB%91_13_c%E1%BB%A7a_%C4%91%E1%BB%8Ba_%C4%91%E1%BA%A1o_V%E1%BB%8Bnh_M%E1%BB%91c.JPG",
        imageCaption: "Địa đạo Vịnh Mốc - Điểm dừng chân kết hợp tiếp theo trên cung đường Vĩ tuyến 17",
        tips: [
          "Nên đặt xe trọn gói khứ hồi với Taxi Quảng Trị 24H để bác tài chở thẳng tuyến tour không cần lo đổi xe dọc đường.",
        ],
      },
      {
        heading: "5. Thưởng thức đặc sản ẩm thực Vĩnh Linh trứ danh",
        content: `Mảnh đất Vĩnh Linh kiên cường sở hữu nét văn hóa ẩm thực mộc mạc mà khó quên:
• Hải sản Cửa Tùng: Mực nhảy nướng than, tôm tít hấp sả, cua biển chắc thịt chấm muối tiêu chanh cay nồng.
• Bánh đúc rau câu Vĩnh Linh: Món ăn thanh mát nấu từ rau câu thiên nhiên giải nhiệt ngày nắng.
• Gà đồi luộc chấm muối ớt tiêu rừng thơm nức mũi.
• Tiêu đen Vĩnh Linh và nước mắm Cửa Tùng: Quà tặng đậm đà phong vị đất miền Trung.`,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Bãi biển Cửa Tùng thanh bình nơi du khách thưởng thức hải sản sau chuyến thăm di tích",
        tips: [
          "Bác tài Taxi 24H sẽ gợi ý những quán hải sản bình dân ngon chuẩn vị của bà con ngư dân Cửa Tùng.",
        ],
      },
      {
        heading: "6. Dịch vụ Taxi Quảng Trị 24H: Đưa đón tận nơi, an toàn & chu đáo",
        content: `Taxi Quảng Trị - Quảng Bình 24H tự hào phục vụ hàng ngàn chuyến xe đưa đón cựu chiến binh và du khách về nguồn:
• Dòng xe 4 - 7 chỗ đời mới nội thất sạch bóng, máy lạnh mát sâu.
• Bác tài người bản địa tận tâm, am hiểu cặn kẽ từng câu chuyện lịch sử Vĩ tuyến 17.
• Giá cước trọn gói cam kết chỉ từ 12.000đ/km, ưu đãi chiều về tới 50%, Hotline 0877.669.555 phục vụ 24/7.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f0/C%E1%BA%A7u_Hi%E1%BB%81n_L%C6%B0%C6%A1ng_%28nh%C3%ACn_t%E1%BB%AB_b%E1%BB%9D_Nam%29.JPG",
        imageCaption: "Đội xe Taxi Quảng Trị 24H luôn sẵn sàng đồng hành cùng bạn trên mọi nẻo đường lịch sử",
        tips: [
          "Gọi ngay Hotline 0877.669.555 trước 30 phút để nhận ưu đãi giá xe trọn gói trong ngày tốt nhất.",
        ],
      },
    ],
    faqs: [
      {
        question: "Từ TP. Đông Hà hoặc Đồng Hới đi taxi đến Cầu Hiền Lương mất bao xa?",
        answer: "Từ Đông Hà đến Cầu Hiền Lương khoảng 24km (25 phút đi taxi). Từ Đồng Hới đến Cầu Hiền Lương khoảng 70km (65 phút đi taxi). Tuyến đường QL1A trải nhựa rất êm ái.",
      },
      {
        question: "Vé tham quan Cụm di tích Đôi bờ Hiền Lương là bao nhiêu?",
        answer: "Giá vé tham quan hiện tại là 50.000đ/người lớn (bao gồm vé qua cầu Hiền Lương, Cột cờ và Nhà trưng bày Vĩ tuyến 17). Trẻ em được miễn phí.",
      },
      {
        question: "Có thể kết hợp Cầu Hiền Lương với Địa đạo Vịnh Mốc trong cùng chuyến đi không?",
        answer: "Rất thuận tiện! Cầu Hiền Lương và Địa đạo Vịnh Mốc chỉ cách nhau 14km, Taxi 24H luôn có gói tour kết hợp 2 điểm này với giá ưu đãi đặc biệt.",
      },
    ],
  },
  {
    slug: "kinh-nghiem-du-lich-thung-lung-hava-quang-binh",
    title: "Kinh Nghiệm Du Lịch Thung Lũng Hava Quảng Bình 2026: Thiên Đường Check-in Sông Chày Mát Lạnh",
    metaTitle: "Kinh Nghiệm Du Lịch Thung Lũng Hava Quảng Bình 2026 | Taxi 24H",
    metaDescription: "Review chi tiết Thung lũng ngọc bích Hava Quảng Bình 2026: Giá vé trọn gói trò chơi zipline, chèo thuyền kayak, ẩm thực mẹt gà nướng muối cheo và taxi đưa đón trọn gói.",
    excerpt: "Thung lũng Hava với làn nước xanh màu ngọc bích tuyệt đẹp, bao bọc bởi núi đá vôi hùng vĩ là tọa độ vui chơi giải nhiệt hot bậc nhất tại Quảng Bình mùa du lịch 2026.",
    category: "Điểm Đến Du Lịch Hot",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    destination: "Xã Sơn Trạch, Huyện Bố Trạch, Tỉnh Quảng Bình",
    distanceFromDongHoi: "50 km (khoảng 50 phút đi xe)",
    taxiFare4Seats: "550.000 VNĐ",
    taxiFare6Seats: "700.000 VNĐ",
    ticketPrice: "150.000đ - 250.000đ/người (Tùy gói trò chơi)",
    bestTimeToVisit: "Tháng 3 đến tháng 9",
    readTime: "8 phút đọc",
    highlights: [
      "Làn nước sông Chày xanh biếc tự nhiên mát lạnh xua tan cái nắng hè gay gắt",
      "Đường trượt siêu tốc zipline đáp nước dài 600m mang lại cảm giác cực đã và sảng khoái",
      "Chèo thuyền kayak, thuyền SUP len lỏi qua các hẻm núi đá vôi kỳ vĩ như tranh thủy mặc",
      "Bờ cát vàng thoai thoải tắm mát an toàn cho cả gia đình và trẻ nhỏ",
      "Dịch vụ taxi đưa đón 2 chiều tận khách sạn chỉ từ 12.000đ/km",
    ],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        caption: "Làn nước xanh màu ngọc bích đặc trưng của sông Chày tại Thung lũng Hava",
      },
      {
        url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        caption: "Trải nghiệm chèo thuyền SUP len lỏi giữa hai bờ vách đá vôi kỳ vĩ",
      },
      {
        url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
        caption: "Cây cầu gỗ và các chòi nghỉ ngơi râm mát bên dòng suối mát lành",
      },
      {
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        caption: "Mẹt gà đồi nướng than và cá suối chiên giòn thơm lừng tại Hava",
      },
    ],
    sections: [
      {
        heading: "1. Thung lũng ngọc bích Hava - Viên ngọc giải nhiệt bên dòng sông Chày",
        content: `Nằm kề bên vùng lõi Di sản Phong Nha - Kẻ Bàng, Thung lũng Hava được mệnh danh là thiên đường giải nhiệt mùa hè của Quảng Bình. Sở hữu dòng nước sông Chày xanh màu ngọc bích trong vắt nhìn thấy đáy, bao bọc xung quanh là những dãy núi đá vôi sừng sững rợp bóng cây rừng cổ thụ.

Không gian tại Hava khoáng đạt, trong lành và hoang sơ, mang đến cho du khách cảm giác tách biệt hoàn toàn khỏi phố thị ồn ào. Dù vào những ngày hè miền Trung đổ lửa, khi đặt chân đến Hava, bạn sẽ lập tức cảm nhận luồng khí mát rượi 20 - 22°C tỏa ra từ mặt nước và khe núi đá.`,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Thung lũng Hava với làn nước ngọc bích mát lạnh quyến rũ giữa lòng di sản",
        tips: [
          "Nên mang theo đồ bơi, kính bơi và khăn tắm cá nhân để thỏa thích tắm suối mát.",
        ],
      },
      {
        heading: "2. Chuỗi trò chơi nước mạo hiểm: Zipline đáp nước & Chèo thuyền SUP",
        content: `Điểm nhấn thu hút giới trẻ tại Hava là hệ thống trò chơi dưới nước đầy hào hứng:
• Đường trượt Zipline siêu tốc 600m: Bay lượn trên không trung ngắm trọn phong cảnh núi rừng trước khi đáp thẳng xuống làn nước xanh mát rượi.
• Chèo thuyền Kayak và SUP: Tự tay chèo thuyền xuôi dòng sông Chày, len lỏi qua các hẻm đá vôi và chụp những bức ảnh check-in triệu view.
• Cầu trượt nước mạo hiểm và bạt nhún lò xo trên sông: Nơi các nhóm bạn cùng nhau vui cười sảng khoái với những cú nhảy nước điệu nghệ.`,
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Chèo SUP và đu dây Zipline trên sông Chày là hoạt động yêu thích của du khách tại Hava",
        tips: [
          "Nên mua vé trọn gói bao gồm tất cả các trò chơi để tiết kiệm chi phí hơn so với mua vé lẻ từng trò.",
        ],
      },
      {
        heading: "3. Thư thái giữa thiên nhiên hoang sơ và các góc check-in tuyệt đẹp",
        content: `Không chỉ dành cho những ai mê trò chơi cảm giác mạnh, Hava còn là chốn dừng chân lý tưởng cho người lớn tuổi và trẻ nhỏ muốn thư giãn. Những chiếc chòi tranh lợp cọ, dãy võng dù mắc dưới bóng cây rừng râm mát bên bờ suối là nơi hoàn hảo để nhâm nhi tách cà phê, đọc sách và lắng nghe tiếng chim rừng hót véo von.

Bãi cát vàng thoai thoải nông nước ở khúc sông kề bên là bể bơi tự nhiên an toàn tuyệt đối cho trẻ nhỏ thỏa sức vẫy vùng.`,
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Góc check-in cầu gỗ và chòi nghỉ thơ mộng giữa thiên nhiên hoang sơ",
        tips: [
          "Thời điểm check-in ánh sáng đẹp nhất là từ 08h30 - 10h30 sáng và 14h30 - 16h30 chiều.",
        ],
      },
      {
        heading: "4. Lịch trình Tour Hava - Động Thiên Đường 1 Ngày siêu hấp dẫn",
        content: `Cung đường kết hợp 1 ngày vui chơi khám phá Phong Nha hoàn hảo nhất:
• 07:30 - 08:30: Xe đón tại khách sạn Đồng Hới khởi hành lên Phong Nha theo đường Hồ Chí Minh nhánh Tây.
• 08:45 - 11:30: Tham quan Động Thiên Đường - 'Hoàng cung trong lòng đất' với cầu gỗ dài 1.000m chiêm ngưỡng thạch nhũ kỳ vĩ.
• 11:45 - 13:30: Di chuyển sang Thung lũng Hava (cách chỉ 7km), thưởng thức bữa trưa mẹt gà nướng muối cheo bên bờ sông.
• 13:30 - 16:30: Trải nghiệm đu zipline đáp nước, chèo thuyền SUP, bơi lội tắm suối xua tan cái nóng mùa hè.
• 16:45: Xe Taxi Quảng Trị - Quảng Bình 24H đón quý khách đưa về khách sạn hoặc bãi biển Nhật Lệ nghỉ ngơi.`,
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Mẹt ẩm thực gà đồi nướng than và xôi ba màu đặc trưng phục vụ ngay tại Hava",
        tips: [
          "Đặt xe taxi phục vụ trọn gói cả ngày để thoải mái thời gian chơi nước mà không phải gọi xe nhiều lần.",
        ],
      },
      {
        heading: "5. Thưởng thức mẹt gà đồi nướng muối cheo & cá suối chiên giòn",
        content: `Ẩm thực tại Thung lũng Hava nổi tiếng với những mẹt đồ nướng đậm chất núi rừng Quảng Bình:
• Gà đồi nướng than hoa: Gà bản thả rông thịt dai ngọt, nướng vừa tới vàng ruộm thơm nức mũi.
• Muối cheo Phong Nha: Gia vị chấm thần thánh làm từ ớt xanh rừng, lá chanh và hạt dổi cay the nồng nàn.
• Cá suối sông Chày chiên giòn: Cá sông tự nhiên béo ngậy, chiên giòn rụm chấm nước mắm ớt gừng.
• Xôi nếp nương ba màu: Hạt xôi bóng bẩy, dẻo thơm quyện cùng thịt nướng ăn no bụng cả buổi vui chơi.`,
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Bữa tiệc giữa thiên nhiên núi rừng sông nước đem lại trải nghiệm khó quên",
        tips: [
          "Nên đặt món trước khi xuống tắm sông 30 phút để lên bờ có ngay đồ ăn nóng hổi.",
        ],
      },
      {
        heading: "6. Dịch vụ Taxi Quảng Trị - Quảng Bình 24H: Đưa đón tận nơi chu đáo",
        content: `Taxi Quảng Trị - Quảng Bình 24H là sự lựa chọn hàng đầu cho các chuyến đi tour Thung lũng Hava:
• Xe 4 chỗ và 7 chỗ đời mới trang bị điều hòa mát lạnh, khoang hành lý rộng rãi chứa đồ bơi và phao bơi thoải mái.
• Giá cước trọn gói từ Đồng Hới đi Hava chỉ từ 12.000đ/km, giảm tới 50% cho chiều về khi đặt khứ hồi 2 chiều.
• Đội ngũ bác tài bản địa lái xe điềm đạm, sẵn sàng chờ đợi bạn vui chơi cả buổi mà không tính phí chờ phụ trội.`,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Dịch vụ Taxi 24H luôn túc trực đưa đón quý khách an toàn trên cung đường Phong Nha",
        tips: [
          "Gọi Hotline 0877.669.555 để đặt xe trước và yêu cầu bác tài chuẩn bị nước khoáng lạnh miễn phí trên xe.",
        ],
      },
    ],
    faqs: [
      {
        question: "Nên đi Hava vào thời gian nào trong ngày?",
        answer: "Nên đến Hava vào buổi sáng từ 8h30 hoặc đầu giờ chiều từ 14h00 để thỏa thích tắm suối và tham gia các trò chơi mà không bị gắt nắng.",
      },
      {
        question: "Đến Hava ăn gì ngon?",
        answer: "Món ăn đặc sản trứ danh tại Hava là mẹt gà đồi nướng than chấm muối cheo Phong Nha, cá suối chiên giòn và xôi ba màu thơm dẻo.",
      },
      {
        question: "Cước taxi 4 chỗ từ Đồng Hới đi Hava bao nhiêu tiền?",
        answer: "Giá taxi 4 chỗ khoảng 550.000đ/chuyến 1 chiều. Khi đặt tour trọn gói khứ hồi 2 chiều bao gồm thời gian chờ, giá chỉ từ 950.000đ - 1.050.000đ rất tiết kiệm.",
      },
    ],
  },
  {
    slug: "kinh-nghiem-du-lich-cong-vien-ozo-treetop-park-quang-binh",
    title: "Kinh Nghiệm Du Lịch Công Viên Ozo Treetop Park Quảng Bình 2026: Thử Thách Rừng Nguyên Sinh",
    metaTitle: "Kinh Nghiệm Khám Phá Công Viên Ozo Quảng Bình 2026 | Taxi 24H",
    metaDescription: "Cẩm nang du lịch Công viên Ozo Treetop Park Quảng Bình 2026: Trải nghiệm công viên trên cây đầu tiên tại Việt Nam, chèo kayak suối Ozo, ẩm thực rừng và dịch vụ taxi đón tiễn giá rẻ.",
    excerpt: "Công viên Ozo Treetop Park với hệ thống trò chơi trên cây độc đáo giữa rừng nguyên sinh Phong Nha - Kẻ Bàng là điểm dừng chân hấp dẫn cho những ai yêu thiên nhiên và phiêu lưu mạo hiểm.",
    category: "Điểm Đến Du Lịch Hot",
    coverImage: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
    destination: "Vườn Quốc Gia Phong Nha - Kẻ Bàng, Quảng Bình",
    distanceFromDongHoi: "52 km (khoảng 55 phút đi xe)",
    taxiFare4Seats: "580.000 VNĐ",
    taxiFare6Seats: "720.000 VNĐ",
    ticketPrice: "200.000đ/người lớn (Bao gồm tắm suối & trò chơi trên cây)",
    bestTimeToVisit: "Tháng 4 đến tháng 9",
    readTime: "8 phút đọc",
    highlights: [
      "Công viên trò chơi trên cây giữa rừng nguyên sinh đầu tiên và dài nhất Việt Nam (800m)",
      "Hệ thống cầu gỗ đi bộ uốn lượn xuyên rừng dài hàng cây số check-in siêu đẹp",
      "Tắm suối Ozo mát lạnh tự nhiên và thưởng thức bữa tiệc rừng nướng thơm phức",
      "Khu vui chơi suối cạn an toàn cho trẻ nhỏ và gia đình trải nghiệm dã ngoại",
      "Dịch vụ taxi đưa đón tận cổng vườn quốc gia Phong Nha chỉ từ 12.000đ/km",
    ],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
        caption: "Cầu gỗ uốn lượn dưới tán rừng nguyên sinh xanh mướt tại Công viên Ozo",
      },
      {
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        caption: "Hệ thống trò chơi đu dây và thăng bằng trên ngọn cây mạo hiểm",
      },
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        caption: "Dòng suối Ozo trong vắt mát lạnh chảy qua lòng công viên",
      },
      {
        url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        caption: "Không gian dã ngoại cắm trại lý tưởng giữa thiên nhiên hoang dã",
      },
    ],
    sections: [
      {
        heading: "1. Thử thách lòng can đảm với hệ thống trò chơi trên cây Ozo",
        content: `Với diện tích gần 5ha nằm trọn trong lòng rừng nguyên sinh Phong Nha - Kẻ Bàng, Công viên Ozo sở hữu chuỗi trò chơi liên hoàn trên cây gồm 16 chặng thử thách: đi cầu thăng bằng, đu dây zipline qua tán rừng, bước chân ninja và trượt ván trên không. Mỗi du khách đều được trang bị đai bảo hộ đạt chuẩn châu Âu dưới sự giám sát chặt chẽ của các huấn luyện viên chuyên nghiệp.

Cảm giác lướt đi giữa những vòm cây cổ thụ râm mát, hít thở không khí trong lành thoang thoảng mùi nhựa thông và hoa rừng là một trải nghiệm giải phóng năng lượng tuyệt vời.`,
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Hệ thống trò chơi trên cây Ozo Treetop Park đạt chuẩn an toàn quốc tế",
        tips: [
          "Du khách nên mặc trang phục thể thao năng động, mang giày thể thao ôm chân chống trượt để thuận tiện leo trèo.",
        ],
      },
      {
        heading: "2. Cầu gỗ xuyên rừng và dòng suối Ozo nguyên sơ mát lạnh",
        content: `Men theo dòng suối Ozo là hệ thống cầu gỗ uốn lượn dài gần 1km dẫn lối du khách vào sâu trong khu rừng nguyên sinh rậm rạp. Dưới gầm cầu, dòng nước suối đá trong veo nhìn thấu từng hòn cuội cuộn tròn theo dòng chảy.

Du khách có thể dừng chân tại các chòi gỗ ven suối, ngâm đôi bàn chân mỏi mệt vào làn nước mát rượi hoặc tham gia chèo thuyền kayak xuôi theo dòng suối ngắm hoa lan rừng nở rộ hai bên bờ.`,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Dòng suối Ozo trong vắt uốn lượn dưới tán rừng rậm rạp",
        tips: [
          "Đoạn suối nông phía hạ lưu rất thích hợp cho trẻ em tắm mát dưới sự quan sát của cha mẹ.",
        ],
      },
      {
        heading: "3. Khám phá hệ sinh thái động thực vật phong phú",
        content: `Là một phần của Di sản Thiên nhiên Thế giới, Ozo là ngôi nhà chung của hàng trăm loài thực vật quý hiếm như gõ lau, sến, táu cùng các loài bướm rừng ngũ sắc bay lượn rợp trời. Tiếng ve sầu râm ran hòa cùng tiếng suối róc rách tạo nên bản hòa ca du dương của đại ngàn mà bạn khó lòng tìm thấy ở bất kỳ khu du lịch nhân tạo nào.`,
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Hệ sinh thái rừng nguyên sinh được bảo tồn nguyên vẹn tại Ozo",
        tips: [
          "Nên bôi thuốc chống côn trùng trước khi vào rừng để có chuyến đi trọn vẹn nhất.",
        ],
      },
      {
        heading: "4. Lịch trình Tour Ozo - Suối Nước Moọc 1 Ngày xả stress",
        content: `Lịch trình dã ngoại cuối tuần cực 'chill' cho gia đình và nhóm bạn:
• 07:30 - 08:30: Xe đón tại TP. Đồng Hới khởi hành đi Phong Nha dọc theo đường 20 Quyết Thắng rợp bóng cây.
• 08:45 - 12:00: Chinh phục chuỗi trò chơi trên cây Ozo Treetop Park, chụp ảnh check-in cầu gỗ và tắm suối mát.
• 12:00 - 13:30: Thưởng thức bữa trưa BBQ tiệc nướng nhà rông bên bờ suối với gà nướng than, sườn heo bản và cơm lam.
• 13:45 - 16:30: Di chuyển sang Suối Nước Moọc hoặc Hang Tối (cách 8km) tắm bùn tự nhiên và chèo thuyền kayak.
• 17:00: Xe đón đoàn trở về TP. Đồng Hới an toàn.`,
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Bữa tiệc ẩm thực nhà rông mộc mạc thơm lừng bên bờ suối",
        tips: [
          "Liên hệ Taxi Quảng Trị - Quảng Bình 24H để đặt xe trọn gói đi đường 20 Quyết Thắng đèo dốc cực an toàn.",
        ],
      },
      {
        heading: "5. Thưởng thức tiệc nướng nhà rông Ozo đậm đà phong vị núi rừng",
        content: `Bữa trưa tại nhà hàng Ozo mang đậm phong cách dã ngoại ngoài trời:
• Gà nướng bản chấm muối kiến vàng: Vị chua dịu của muối kiến kết hợp cùng thịt gà đồi săn chắc tạo nên hương vị bùng nổ.
• Sườn nướng mật ong rừng: Từng dải sườn vàng óng quyện mật ong rừng Phong Nha ngọt thanh đậm đà.
• Cơm lam nướng ống tre: Dẻo thơm mùi nếp nương và tre tươi nướng trên than hồng.
• Nước chè xanh om đá: Thức uống mộc mạc đập tan mệt mỏi sau những giờ leo trèo vận động.`,
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Thưởng thức ẩm thực giữa không gian nhà rông mở thoáng mát giữa rừng",
        tips: [
          "Có thể đặt trước các set ăn theo nhóm để nhà hàng chuẩn bị sẵn sàng ngay khi kết thúc trò chơi.",
        ],
      },
      {
        heading: "6. Dịch vụ Taxi Quảng Trị - Quảng Bình 24H đưa đón Ozo giá rẻ",
        content: `Cung đường 20 Quyết Thắng dẫn vào Công viên Ozo là một trong những cung đường rừng đẹp nhất miền Trung. Để tận hưởng trọn vẹn cảnh sắc mà không lo lắng về tay lái đường đèo dốc, thuê taxi gia đình 4 - 7 chỗ của Taxi Quảng Trị 24H là lựa chọn tối ưu nhất. Xe luôn sạch sẽ thơm tho, tài xế rành đường và nhiệt tình giới thiệu các điểm dừng chân ngắm cảnh dọc đường.`,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Đội xe Taxi 24H luôn phục vụ quý khách chu đáo trên mọi nẻo đường rừng",
        tips: [
          "Hãy gọi Hotline 0877.669.555 để đặt xe đi và về, bác tài sẽ túc trực đón bạn ngay khi kết thúc chuyến vui chơi.",
        ],
      },
    ],
    faqs: [
      {
        question: "Trẻ em có chơi được trò chơi tại Công viên Ozo không?",
        answer: "Có. Ozo có khu vực trò chơi dành riêng cho trẻ em với độ cao an toàn và suối tắm thoai thoải nước cạn rất thích hợp cho cả gia đình.",
      },
      {
        question: "Cước taxi 4 chỗ từ Đồng Hới đi Ozo là bao nhiêu?",
        answer: "Giá taxi 4 chỗ khoảng 550.000đ - 580.000đ/chuyến 1 chiều. Khi đặt khứ hồi 2 chiều, bạn sẽ nhận được mức ưu đãi giảm giá lên đến 50% cho chiều về.",
      },
      {
        question: "Thời gian mở cửa của Công viên Ozo là mấy giờ?",
        answer: "Công viên Ozo mở cửa đón khách từ 07h30 sáng đến 16h30 chiều tất cả các ngày trong tuần.",
      },
    ],
  },
  {
    slug: "kinh-nghiem-du-lich-suoi-khoang-nong-bang-quang-binh",
    title: "Kinh Nghiệm Du Lịch Suối Khoáng Nóng Bang Quảng Bình 2026: Dòng Khoáng Nóng 105 Độ Độc Nhất",
    metaTitle: "Kinh Nghiệm Tắm Suối Khoáng Nóng Bang Onsen Quảng Bình 2026 | Taxi 24H",
    metaDescription: "Cẩm nang khám phá Suối khoáng nóng Bang Onsen Quảng Bình 2026: Trải nghiệm tắm khoáng Onsen Nhật Bản, luộc trứng tại nguồn sôi 105 độ C và dịch vụ xe taxi đưa đón trọn gói.",
    excerpt: "Suối Bang là dòng suối khoáng nóng lộ thiên có nhiệt độ kỷ lục lên đến 105 độ C tại Việt Nam. Nơi đây hiện đã được đầu tư thành khu nghỉ dưỡng Onsen chuẩn Nhật Bản đẳng cấp.",
    category: "Nghỉ Dưỡng & Sức Khỏe",
    coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    destination: "Xã Kim Thủy, Huyện Lệ Thủy, Tỉnh Quảng Bình",
    distanceFromDongHoi: "60 km (khoảng 65 phút đi xe)",
    taxiFare4Seats: "620.000 VNĐ",
    taxiFare6Seats: "780.000 VNĐ",
    ticketPrice: "Theo gói tắm Onsen từ 250.000đ - 650.000đ/người",
    bestTimeToVisit: "Quanh năm, đặc biệt mùa thu đông mát mẻ",
    readTime: "8 phút đọc",
    highlights: [
      "Suối nước khoáng nóng lộ thiên duy nhất tại Việt Nam có nhiệt độ sôi tự nhiên 105°C",
      "Khu nghỉ dưỡng Bang Onsen Spa & Resort chuẩn Nhật Bản với hồ tắm khoáng đa dạng",
      "Trải nghiệm tự tay luộc trứng chín lòng đào bằng nguồn nước khoáng nguyên chất giàu vi chất",
      "Cung đường kết hợp viếng Nhà lưu niệm Đại tướng Võ Nguyên Giáp tại Lệ Thủy",
      "Dịch vụ taxi 4-7 chỗ đón tận nơi từ Đồng Hới hoặc Đông Hà chỉ từ 12.000đ/km",
    ],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        caption: "Hồ tắm khoáng nóng ngoài trời giữa thung lũng nguyên sinh xanh mát",
      },
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        caption: "Làn khói khoáng nghi ngút bốc lên từ mạch nguồn nước nóng 105 độ C",
      },
      {
        url: "https://images.unsplash.com/photo-1548625361-1979ad2d67ad?auto=format&fit=crop&w=800&q=80",
        caption: "Kiến trúc khu nghỉ dưỡng Bang Onsen chuẩn phong cách Nhật Bản thanh lịch",
      },
      {
        url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
        caption: "Dòng suối Bang chảy êm đềm giữa rừng thông đại ngàn Lệ Thủy",
      },
    ],
    sections: [
      {
        heading: "1. Kỳ quan suối khoáng nóng Bang 105°C lộ thiên độc nhất vô nhị",
        content: `Nằm ẩn mình giữa thung lũng nguyên sinh thuộc xã Kim Thủy, huyện Lệ Thủy, Suối khoáng nóng Bang giữ kỷ lục là nguồn nước khoáng lộ thiên duy nhất tại Việt Nam có nhiệt độ tại lỗ phun lên đến 105°C. Đứng giữa thung lũng, du khách ngỡ ngàng như lạc vào chốn bồng lai khi từng cột khói hơi nước trắng xóa bốc lên nghi ngút giữa màu xanh bát ngát của rừng già.

Nguồn nước khoáng Bang chứa hàm lượng lưu huỳnh, silic và các khoáng chất quý hiếm cực cao, có giá trị trị liệu sức khỏe vượt trội được các nhà khoa học đánh giá sánh ngang với những suối khoáng hàng đầu thế giới.`,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Khu tắm khoáng Bang Onsen đẳng cấp giữa thung lũng xanh mướt",
        tips: [
          "Nên ngâm khoáng nóng từ các hồ có nhiệt độ thấp (38°C) trước khi chuyển sang hồ ấm hơn (40 - 42°C).",
        ],
      },
      {
        heading: "2. Trải nghiệm luộc trứng tại nguồn sôi và tắm Onsen chuẩn Nhật",
        content: `Một trong những hoạt động thú vị nhất mà bất kỳ du khách nào cũng háo hức thử là tự tay thả những chiếc giỏ trứng gà xuống dòng suối sôi sùng sục. Chỉ sau khoảng 8 - 10 phút, những quả trứng chín tới với phần lòng đào béo ngậy, thấm đượm vi chất khoáng tự nhiên thơm ngon lạ kỳ.

Hiện nay, khu nghỉ dưỡng Bang Onsen Spa & Resort đã được đầu tư bài bản với hệ thống bể ngâm Onsen ngoài trời và trong nhà chuẩn phong cách Nhật Bản. Các liệu trình ngâm khoáng, xông hơi đá muối Himalaya và massage bấm huyệt mang đến sự tái sinh kỳ diệu cho cơ thể.`,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Trải nghiệm luộc trứng khoáng nóng 105 độ C độc đáo tại nguồn sôi",
        tips: [
          "Không nên ngâm khoáng nóng quá 20 phút mỗi hiệp và cần bổ sung nước ấm đầy đủ sau khi tắm.",
        ],
      },
      {
        heading: "3. Tác dụng phục hồi sức khỏe và thư giãn tinh thần tuyệt vời",
        content: `Khoáng nóng Bang có tác dụng kỳ diệu trong việc hỗ trợ điều trị các bệnh về cơ xương khớp, thần kinh tọa, phục hồi làn da và đào thải độc tố cơ thể. Sau những ngày làm việc mệt mỏi, được ngâm mình trong dòng nước ấm áp giữa tiếng thông reo rì rào, mọi căng thẳng âu lo dường như tan biến theo từng làn hơi nước.`,
        image: "https://images.unsplash.com/photo-1548625361-1979ad2d67ad?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Không gian tĩnh dưỡng thanh bình mang lại sự an yên cho tâm hồn",
        tips: [
          "Người có tiền sử huyết áp cao hoặc tim mạch nên tham khảo hướng dẫn viên tại bể ngâm để chọn hồ có nhiệt độ vừa phải.",
        ],
      },
      {
        heading: "4. Lịch trình Tour Suối Bang - Nhà Đại Tướng Võ Nguyên Giáp 1 Ngày",
        content: `Cung đường kết hợp ý nghĩa khám phá vùng quê sông nước Lệ Thủy:
• 07:30: Xe Taxi 24H đón tại Đồng Hới hoặc Đông Hà, khởi hành theo đường tránh QL1A hoặc đường Hồ Chí Minh Đông đi Lệ Thủy.
• 08:30 - 10:00: Ghé thăm Nhà lưu niệm Đại tướng Võ Nguyên Giáp tại làng An Xá, xã Lộc Thủy bên bờ sông Kiến Giang hiền hòa.
• 10:30 - 12:30: Di chuyển đến Suối khoáng nóng Bang (cách 20km), nhận vé và trải nghiệm các hồ ngâm khoáng Onsen thư giãn.
• 12:30 - 14:00: Ăn trưa đặc sản đồng quê Lệ Thủy tại nhà hàng Onsen.
• 14:30 - 16:30: Thử thách luộc trứng khoáng nóng, dạo bộ ngắm cảnh thung lũng rừng thông nguyên sinh.
• 17:00: Xe đón đoàn trở về lại khách sạn an toàn.`,
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Cảnh sắc quê hương Lệ Thủy thanh bình trên cung đường đến Suối Bang",
        tips: [
          "Đặt xe taxi khứ hồi 2 chiều với Taxi Quảng Trị 24H để bác tài đợi đoàn trong suốt thời gian ngâm khoáng.",
        ],
      },
      {
        heading: "5. Thưởng thức đặc sản ẩm thực đồng quê Lệ Thủy đậm đà",
        content: `Đến Lệ Thủy, du khách sẽ say lòng trước những món ăn dân dã thấm đượm ân tình quê lúa:
• Cá lóc đồng kho nghệ: Cá lóc tươi bắt từ đầm sen Lệ Thủy rim cùng củ nghệ vàng óng và ớt xiêm cay nồng đậm đà.
• Cháo cá đầm An Mã: Nấu từ hạt gạo Lệ Thủy thơm dẻo quyện thịt cá béo ngọt và rau thì là thơm lừng.
• Gà đồi Kiến Giang nướng lá chanh: Gà thả đồi thịt dai chắc ngọt lịm chấm muối tiêu chanh cay xé.
• Bánh bèo tôm cháy Lệ Thủy: Từng chén bánh bèo mỏng tang phủ đầy tôm cháy đỏ au giòn rụm.`,
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Hương vị ẩm thực miền quê lúa Lệ Thủy đậm đà khó quên",
        tips: [
          "Bác tài Taxi 24H sẽ chở bạn đến đúng những quán ăn đồng quê nức tiếng gần ngã ba Cam Liên giá cả rất bình dân.",
        ],
      },
      {
        heading: "6. Dịch vụ Taxi Quảng Trị - Quảng Bình 24H: Đón tiễn chu đáo, trọn gói",
        content: `Suối Bang thuộc huyện Lệ Thủy, nằm ở vị trí giáp ranh giữa Quảng Bình và Quảng Trị. Du khách từ TP. Đồng Hới (khoảng 60km) hoặc TP. Đông Hà (khoảng 70km) đều có thể di chuyển bằng dịch vụ Taxi Quảng Trị - Quảng Bình 24H vô cùng thuận tiện. Xe luôn sạch sẽ thơm tho, tài xế rành đường và nhiệt tình hỗ trợ suốt chuyến đi.`,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Taxi Quảng Bình 24H luôn đồng hành đưa đón quý khách nghỉ dưỡng tận tâm",
        tips: [
          "Liên hệ Hotline 0877.669.555 để nhận ưu đãi gói tour taxi trọn gói cả ngày rẻ hơn 30% so với taxi truyền thống.",
        ],
      },
    ],
    faqs: [
      {
        question: "Nước suối khoáng nóng Bang có uống được không?",
        answer: "Nguồn nước khoáng tự nhiên ở các mạch hạ lưu sau khi qua xử lý đạt chuẩn khoáng tinh khiết, rất giàu khoáng chất tốt cho hệ tiêu hóa.",
      },
      {
        question: "Cước taxi đi Suối Bang từ Đồng Hới giá bao nhiêu?",
        answer: "Giá xe 4 chỗ đón tận nơi từ Đồng Hới đi Suối Bang khoảng 600.000đ - 650.000đ. Đặt khứ hồi sẽ có giá ưu đãi trọn gói cả ngày chỉ từ 1.100.000đ.",
      },
      {
        question: "Suối Bang mở cửa vào mùa nào đẹp nhất?",
        answer: "Suối Bang mở cửa quanh năm, nhưng thời điểm tắm khoáng tuyệt vời nhất là từ tháng 9 đến tháng 3 năm sau khi tiết trời miền Trung mát mẻ, se se lạnh.",
      },
    ],
  },
  {
    slug: "kinh-nghiem-bat-taxi-san-bay-dong-hoi-ve-trung-tam",
    title: "Kinh Nghiệm Bắt Taxi Sân Bay Đồng Hới Về Trung Tâm & Đi Phong Nha Giá Rẻ Nhất 2026",
    metaTitle: "Kinh Nghiệm Đặt Taxi Sân Bay Đồng Hới Giá Rẻ 2026 | Đón Nhanh 5 Phút",
    metaDescription: "Hướng dẫn bắt taxi tại Sân bay Đồng Hới (VDH) về trung tâm TP. Đồng Hới và đi tour Phong Nha giá rẻ nhất 2026: Bảng giá cước từ 12.000đ/km, mẹo tránh taxi dù chặt chém.",
    excerpt: "Sân bay Đồng Hới là cửa ngõ hàng không trọng điểm đón du khách đến Quảng Bình. Xem ngay bảng giá taxi chuẩn niêm yết và kinh nghiệm đặt xe đón tận sảnh không lo phát sinh phí.",
    category: "Tuyến Đường & Đón Tiễn",
    coverImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
    destination: "Cảng Hàng Không Đồng Hới (VDH), Xã Lộc Ninh, TP. Đồng Hới",
    distanceFromDongHoi: "6 km (khoảng 10 phút đi xe)",
    taxiFare4Seats: "80.000 - 100.000 VNĐ",
    taxiFare6Seats: "120.000 - 140.000 VNĐ",
    ticketPrice: "Theo vé máy bay",
    bestTimeToVisit: "24/7 theo tất cả các chuyến bay",
    readTime: "8 phút đọc",
    highlights: [
      "Đón nhanh sau 5 phút tại sảnh đến Sân bay Đồng Hới, có biển đón tên nếu yêu cầu",
      "Giá cước niêm yết rõ ràng chỉ từ 12.000đ/km, không thu thêm phí phụ trội sân bay",
      "Nhận chạy thẳng từ sân bay lên các khách sạn tại Động Phong Nha chỉ 45 phút",
      "Hệ thống xe 4-7 chỗ đời mới sạch sẽ, cốp rộng chứa trọn vẹn hành lý",
      "Tài xế bản xứ am hiểu mọi điểm du lịch và quán ăn ngon tại Đồng Hới",
    ],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
        caption: "Cảng hàng không Đồng Hới - Cửa ngõ đón du khách thập phương đến Quảng Bình",
      },
      {
        url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        caption: "Đội xe Taxi 24H đời mới túc trực đón trả khách tại sảnh sân bay",
      },
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        caption: "Bờ biển Nhật Lệ thơ mộng cách sân bay Đồng Hới chỉ 10 phút đi xe",
      },
      {
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        caption: "Ẩm thực bánh lọc và cháo canh Đồng Hới đón chào du khách",
      },
    ],
    sections: [
      {
        heading: "1. Vị trí Cảng hàng không Đồng Hới và nhu cầu di chuyển kết nối",
        content: `Cảng hàng không Đồng Hới (mã sân bay: VDH) tọa lạc tại xã Lộc Ninh, TP. Đồng Hới, tỉnh Quảng Bình. Nằm ngay sát trục Quốc lộ 1A và kề bên bờ biển Nhật Lệ thơ mộng, sân bay chỉ cách trung tâm thành phố khoảng 6km về phía Bắc và cách Di sản Phong Nha - Kẻ Bàng khoảng 45km.

Với lượng khách du lịch đổ về ngày càng đông qua các chuyến bay hàng ngày của Vietnam Airlines, Vietjet Air và Bamboo Airways, nhu cầu thuê xe taxi đón tiễn nhanh chóng, minh bạch về giá cả luôn là ưu tiên hàng đầu của mọi du khách.`,
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Cảng hàng không Đồng Hới hiện đại và thuận tiện cho du khách đáp chuyến bay",
        tips: [
          "Sau khi máy bay hạ cánh và nhận hành lý, hãy gọi ngay Hotline 0877.669.555 để tài xế đánh xe vào đúng cột sảnh đón bạn.",
        ],
      },
      {
        heading: "2. Bảng giá cước Taxi từ Sân bay Đồng Hới đi các địa điểm nổi tiếng",
        content: `Khoảng cách từ Sân bay Đồng Hới về trung tâm thành phố (các khách sạn trên đường Trương Pháp, Quách Xuân Kỳ, Lý Thường Kiệt) chỉ khoảng 6-8km với giá cước taxi 4 chỗ dao động từ 80.000đ đến 100.000đ. Nếu du khách có kế hoạch đi thẳng lên Phong Nha (45km), giá trọn gói chỉ khoảng 450.000đ - 540.000đ cho xe 4 chỗ và 650.000đ cho xe 7 chỗ rộng rãi.`,
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Dòng xe đời mới sang trọng, cốp rộng rãi đón khách tại sảnh sân bay",
        tips: [
          "Đặt xe trước khi máy bay cất cánh, tài xế sẽ theo dõi lịch trình chuyến bay thực tế để căn giờ có mặt chính xác ngay khi bạn hạ cánh.",
        ],
      },
      {
        heading: "3. Mẹo nhận biết và tránh taxi dù chèo kéo chặt chém",
        content: `Vào các khung giờ cao điểm có nhiều chuyến bay hạ cánh cùng lúc, khu vực ngoài sảnh thường có hiện tượng tài xế chèo kéo khách với giá mập mờ hoặc chạy lòng vòng bấm đồng hồ sai lệch. Để đảm bảo an toàn và chuyến đi thoải mái, hãy liên hệ tổng đài Taxi Quảng Trị - Quảng Bình 24H qua Hotline 0877.669.555 hoặc Zalo 0398.567.070 để được điều xe biển số rõ ràng và báo giá trọn gói trước khi khởi hành.`,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Tận hưởng chuyến xe an toàn ngắm trọn phong cảnh ven biển Nhật Lệ",
        tips: [
          "Lưu lại số hotline 0877.669.555 vào danh bạ trước chuyến bay để gọi ngay khi vừa bật điện thoại.",
        ],
      },
      {
        heading: "4. Lịch trình di chuyển thẳng từ Sân bay đi tour Phong Nha 1 Ngày",
        content: `Nhiều du khách có quỹ thời gian ngắn thường chọn phương án đi thẳng từ sân bay lên Phong Nha để tiết kiệm một ngày di chuyển:
• 08:30: Xe đón tại sân bay Đồng Hới ngay khi chuyến bay hạ cánh.
• 09:30: Đến thị trấn Phong Nha, gửi hành lý tại khách sạn và lên thuyền máy khám phá Động Phong Nha.
• 12:00: Ăn trưa mẹt gà đồi nướng than và cá trắm sông Son.
• 13:30 - 16:30: Tham quan Động Thiên Đường hoặc Suối Nước Moọc tắm mát.
• 17:00: Xe đưa đoàn về khách sạn nhận phòng nghỉ ngơi, kết thúc một ngày trọn vẹn không lãng phí phút giây nào.`,
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Cung đường di chuyển thẳng lên Phong Nha tiết kiệm tối đa thời gian",
        tips: [
          "Báo trước số lượng hành lý để tài xế sắp xếp xe 7 chỗ có cốp gập phù hợp nếu đoàn có nhiều vali lớn.",
        ],
      },
      {
        heading: "5. Khám phá ẩm thực Đồng Hới nức tiếng ngay sau khi hạ cánh",
        content: `Nếu về trung tâm thành phố, đừng bỏ lỡ cơ hội thưởng thức ngay những món ăn làm nên thương hiệu ẩm thực Đồng Hới:
• Bánh bột lọc Mệ Xuân: Nổi tiếng nhất Quảng Bình với vỏ bánh trong veo dẻo dai bọc tôm sông đậm đà chấm mắm ớt cay nồng.
• Cháo canh cá lóc Đồng Hới: Bát cháo sợi mềm quyện nước dùng cá lóc đồng ngọt thanh thơm mùi hành ngò.
• Bánh bèo tôm nhảy đường Cô Tám: Từng chén bánh bèo nóng hổi rưới nước mắm tôm rim thơm nức.
• Hải sản bờ kè Nhật Lệ: Thưởng thức mực nhảy, sò điệp nướng mỡ hành ngay bên bờ sông Nhật Lệ lộng gió.`,
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Thưởng thức đĩa bánh lọc Mệ Xuân trứ danh ngay khi về đến trung tâm thành phố",
        tips: [
          "Bác tài Taxi 24H sẽ chở bạn ghé ăn nhẹ tại quán Mệ Xuân trước khi về nhận phòng khách sạn.",
        ],
      },
      {
        heading: "6. Dịch vụ Taxi Quảng Trị - Quảng Bình 24H: Đón nhanh 5 phút, giá tốt nhất",
        content: `Taxi Quảng Trị - Quảng Bình 24H cam kết mang đến dịch vụ đón tiễn sân bay chất lượng cao nhất:
• Xe đời mới sạch sẽ, không mùi xe, trang bị đầy đủ khăn lạnh và nước suối.
• Tài xế văn minh lịch sự, lái xe an toàn, có biển đón tên chu đáo nếu có yêu cầu.
• Giá cước trọn gói cam kết không phụ phí cầu đường hay phí đỗ xe sân bay.`,
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80",
        imageCaption: "Tổng đài Taxi 24H túc trực 24/7 phục vụ mọi chuyến bay ngày và đêm",
        tips: [
          "Gọi Hotline 0877.669.555 để được giữ xe đời mới nhất và nhận ưu đãi giảm giá chiều về tới 50%.",
        ],
      },
    ],
    faqs: [
      {
        question: "Chuyến bay đêm muộn có taxi đón tại Sân bay Đồng Hới không?",
        answer: "Có. Đội xe Taxi 24H túc trực 24/7 đón tất cả các chuyến bay đêm hoặc sáng sớm của Vietnam Airlines, Vietjet Air, Bamboo Airways.",
      },
      {
        question: "Có phải trả thêm tiền vé vào cổng sân bay không?",
        answer: "Giá báo trọn gói của Taxi Quảng Trị 24H đã bao gồm vé cầu đường và vé vào cổng sân bay, quý khách hoàn toàn không phát sinh chi phí phụ trội.",
      },
      {
        question: "Thời gian taxi chạy từ sân bay về các khách sạn đường Trương Pháp bao lâu?",
        answer: "Chỉ mất khoảng 8 đến 10 phút chạy xe vì đường Trương Pháp nằm ngay kề sân bay dọc theo bãi biển Nhật Lệ.",
      },
    ],
  },
];

/**
 * Gửi thông báo đến Telegram Chủ xe khi bài viết mới được xuất bản
 */
export async function notifyArticlePublishedViaTelegram(guide: TravelGuide): Promise<boolean> {
  const token = TELEGRAM_BOT_TOKEN;
  const ownerChatId = OWNER_CHAT_ID;

  if (!token || !ownerChatId) {
    console.warn("[TELEGRAM NOTICE] Bot token or Owner Chat ID not configured.");
    return false;
  }

  const articleUrl = `https://www.taxiquangtri.com.vn/cam-nang-du-lich/${guide.slug}`;
  const editUrl = `https://www.taxiquangtri.com.vn/admin?tab=articles&edit=${guide.slug}`;

  const messageText = `
✨ <b>AI VỪA TỰ ĐỘNG XUẤT BẢN BÀI VIẾT CHUẨN SEO MỚI!</b>
━━━━━━━━━━━━━━━━━━━━
📚 <b>Tiêu đề:</b> <b>${escapeHtml(guide.title)}</b>
📍 <b>Địa điểm:</b> ${escapeHtml(guide.destination)}
🏷️ <b>Chuyên mục:</b> ${escapeHtml(guide.category)}
⏱️ <b>Thời lượng đọc:</b> ${guide.readTime} • 📅 <b>Ngày:</b> ${guide.publishedDate}
━━━━━━━━━━━━━━━━━━━━
💡 <i>Bài viết đã được tối ưu chuẩn SEO 100% (Heading H2, H3, Meta Title, Description, Schema FAQ) và tự động đồng bộ vào Sơ đồ trang web (Sitemap) cho Google!</i>

👇 <b>Chạm vào các nút bên dưới để xem hoặc chỉnh sửa bài viết ngay:</b>
`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ownerChatId,
        text: messageText.trim(),
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🌐 [ XEM BÀI VIẾT TRÊN WEB ]",
                url: articleUrl,
              },
            ],
            [
              {
                text: "✏️ [ BẤM VÀO ĐỂ CHỈNH SỬA BÀI ]",
                url: editUrl,
              },
            ],
          ],
        },
      }),
    });

    const data = await res.json();
    console.log("[TELEGRAM DISPATCH ARTICLE]:", data?.ok ? "SUCCESS" : data);
    return Boolean(data?.ok);
  } catch (err) {
    console.error("Error sending article telegram notice:", err);
    return false;
  }
}

function escapeHtml(text: string) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


/**
 * BỘ BẢO VỆ CHUẨN VÀNG (QUALITY GUARD):
 * Đảm bảo 100% bài viết (dù sinh từ Gemini AI hay từ kho dự phòng) BẮT BUỘC phải tuân thủ đúng
 * Mẫu Chuẩn Vàng 6 Phần, có ảnh minh họa từng phần 100% HOẠT ĐỘNG (không bao giờ bị lỗi 404),
 * có gallery 4-5 ảnh, lịch trình tour 1 ngày, ẩm thực bản địa và dịch vụ Taxi 24H.
 */
export function ensureGoldenBlueprintQuality(seed: TopicSeed): TopicSeed {
  const result: TopicSeed = {
    ...seed,
    title: cleanVietnameseText(seed.title),
    metaTitle: cleanVietnameseText(seed.metaTitle || seed.title),
    metaDescription: cleanVietnameseText(seed.metaDescription || seed.excerpt),
    excerpt: cleanVietnameseText(seed.excerpt),
    category: cleanVietnameseText(seed.category),
    destination: cleanVietnameseText(seed.destination),
    distanceFromDongHoi: cleanVietnameseText(seed.distanceFromDongHoi),
    taxiFare4Seats: cleanVietnameseText(seed.taxiFare4Seats),
    taxiFare6Seats: cleanVietnameseText(seed.taxiFare6Seats),
    ticketPrice: cleanVietnameseText(seed.ticketPrice),
    bestTimeToVisit: cleanVietnameseText(seed.bestTimeToVisit),
  };

  const usedImages = new Set<string>();

  // 1. Kiểm tra ảnh đại diện (Cover Image)
  if (!isReliableImageUrl(result.coverImage)) {
    result.coverImage = getVerifiedImageForTopic(result.destination, result.title, 0, usedImages);
  }
  if (result.coverImage) {
    usedImages.add(result.coverImage);
  }

  // 2. Kiểm tra và chuẩn hóa Gallery (Đảm bảo 100% ảnh hoạt động và không trùng lặp)
  const existingGallery = (result.gallery || []).map((img, idx) => {
    let galUrl = img.url;
    if (!isReliableImageUrl(galUrl) || usedImages.has(galUrl)) {
      galUrl = getVerifiedImageForTopic(result.destination, img.caption || "thắng cảnh thiên nhiên", idx + 7, usedImages);
    }
    if (galUrl) {
      usedImages.add(galUrl);
    }
    return {
      url: galUrl,
      caption: cleanVietnameseText(img.caption) || `Hình ảnh đẹp về ${result.destination}`,
    };
  });

  if (existingGallery.length < 4) {
    const galleryPrompts = [
      "toàn cảnh vẻ đẹp kỳ vĩ",
      "không gian thiên nhiên thơ mộng",
      "ẩm thực đặc sản hấp dẫn",
      "lộ trình taxi đưa đón",
    ];
    result.gallery = galleryPrompts.map((p, idx) => {
      const gUrl = getVerifiedImageForTopic(result.destination, p, idx + 8, usedImages);
      if (gUrl) usedImages.add(gUrl);
      return {
        url: gUrl,
        caption: `Góc nhìn đẹp về ${result.destination}`,
      };
    });
  } else {
    result.gallery = existingGallery;
  }

  // 3. Kiểm tra và bổ sung Sections nếu chưa đủ 6 phần
  const sections = [...(result.sections || [])];

  // Đảm bảo từng section đều có ảnh 100% hoạt động và KHÔNG TRÙNG NHAU hoặc với ảnh bìa
  sections.forEach((sec, idx) => {
    sec.heading = cleanVietnameseText(sec.heading);
    sec.content = cleanVietnameseText(sec.content);
    if (!isReliableImageUrl(sec.image) || usedImages.has(sec.image!)) {
      sec.image = getVerifiedImageForTopic(result.destination, sec.heading, idx + 1, usedImages);
    }
    if (sec.image) {
      usedImages.add(sec.image);
    }
    if (!sec.imageCaption) {
      sec.imageCaption = `Hình ảnh minh họa ${sec.heading.replace(/^[0-9.]+\s*/, "")} tại ${result.destination}`;
    } else {
      sec.imageCaption = cleanVietnameseText(sec.imageCaption);
    }
    if (!sec.tips || sec.tips.length === 0) {
      sec.tips = ["Quý khách nên liên hệ Taxi Quảng Bình - Đồng Hới 24H để được bác tài tư vấn thời điểm tham quan đẹp nhất."];
    } else {
      sec.tips = sec.tips.map(cleanVietnameseText).filter(Boolean);
    }
  });

  // Nếu thiếu phần 4 (Lịch trình Tour 1 ngày)
  const hasTourSection = sections.some((s) => s.heading.toLowerCase().includes("lịch trình") || s.heading.toLowerCase().includes("tour"));
  if (!hasTourSection || sections.length < 4) {
    const tourImg = getVerifiedImageForTopic(result.destination, "lịch trình tour xe taxi", 4, usedImages);
    if (tourImg) usedImages.add(tourImg);
    sections.push({
      heading: `${sections.length + 1}. Gợi ý lịch trình Tour ${result.destination} 1 Ngày trọn vẹn xuất phát từ TP. Đồng Hới`,
      content: `Hành trình tham quan lý tưởng trong ngày cùng Taxi Quảng Bình - Đồng Hới 24H:

• 07:30 - 08:30: Xe đón tại khách sạn/ga tàu hoặc sân bay Đồng Hới, di chuyển đến ${result.destination}.
• 08:30 - 11:30: Thong thả tham quan các công trình biểu tượng, chụp ảnh lưu niệm và lắng nghe những câu chuyện văn hóa lịch sử hào hùng.
• 11:45 - 13:30: Thưởng thức bữa trưa đặc sản bản địa thơm ngon nức tiếng tại nhà hàng chuẩn vị gần điểm đến.
• 13:45 - 16:30: Kết hợp tham quan các danh lam thắng cảnh lân cận trên cùng cung đường thuận tiện.
• 17:00: Xe đưa đoàn trở về trung tâm TP. Đồng Hới an toàn, kết thúc chuyến đi trọn vẹn và ý nghĩa.`,
      image: tourImg,
      imageCaption: `Cung đường di chuyển thuận lợi và lịch trình tour 1 ngày kết nối các điểm đến nổi tiếng`,
      tips: ["Đặt xe taxi trọn gói khứ hồi với Taxi 24H để bác tài đồng hành suốt hành trình, tiết kiệm tới 50% cước chiều về."],
    });
  }

  // Nếu thiếu phần 5 (Ẩm thực)
  const hasFoodSection = sections.some((s) => s.heading.toLowerCase().includes("ẩm thực") || s.heading.toLowerCase().includes("đặc sản"));
  if (!hasFoodSection || sections.length < 5) {
    const foodImg = getVerifiedImageForTopic(result.destination, "ẩm thực đặc sản bánh lọc cháo canh", 5, usedImages);
    if (foodImg) usedImages.add(foodImg);
    sections.push({
      heading: `${sections.length + 1}. Thưởng thức đặc sản ẩm thực nức tiếng bản địa`,
      content: `Khám phá văn hóa ẩm thực đậm đà bản sắc của vùng đất miền Trung:

• Bánh bột lọc trứ danh: Vỏ bánh dai giòn trong suốt bọc tôm sông óng ả và thịt ba chỉ đậm vị, chấm nước mắm ớt cay xé lưỡi.
• Cháo bột cá lóc (Bánh canh): Sợi bột dai mềm quyện nước dùng cá lóc đồng rim nghệ vàng ươm ngào ngạt hương thơm.
• Gà đồi nướng than hoa: Gà thả đồi săn chắc nướng vừa tới chấm muối cheo cay the nồng nàn.
• Hải sản tươi sống: Thưởng thức mực nhảy, cá bớp, nghêu hấp thơm ngọt tươi rói đánh bắt trong ngày.`,
      image: foodImg,
      imageCaption: `Văn hóa ẩm thực miền Trung đậm đà với những món ngon dân dã khó quên`,
      tips: ["Bác tài Taxi 24H luôn sẵn sàng đưa bạn đến đúng quán ăn gốc địa phương lâu năm, giá bình dân không lo chặt chém."],
    });
  }

  // Nếu thiếu phần 6 (Dịch vụ Taxi 24H)
  const hasTaxiSection = sections.some((s) => s.heading.toLowerCase().includes("taxi") || s.heading.toLowerCase().includes("dịch vụ"));
  if (!hasTaxiSection || sections.length < 6) {
    const taxiImg = getVerifiedImageForTopic(result.destination, "taxi đưa đón sân bay ga tàu", 6, usedImages);
    if (taxiImg) usedImages.add(taxiImg);
    sections.push({
      heading: `${sections.length + 1}. Dịch vụ Taxi Quảng Bình - Đồng Hới 24H: Đón nhanh 5 phút, giá tốt nhất`,
      content: `Taxi Quảng Bình - Đồng Hới 24H luôn sẵn sàng đồng hành cùng bạn trên mọi nẻo đường:

• Đội ngũ tài xế tập trung đông đảo nhất tại TP. Đồng Hới, đón khách nhanh chóng chỉ sau 5 phút tại Sân bay, Ga tàu và các khách sạn.
• Đội xe 4 - 7 chỗ đời mới (Vios, Accent, Xpander, Veloz, Fortuner) nội thất sạch sẽ, điều hòa mát rượi.
• Tài xế bản xứ Đồng Hới am hiểu từng cung đường, lái xe điềm đạm, hỗ trợ xách hành lý và tư vấn điểm ăn chơi miễn phí.
• Giá cước trọn gói công khai chỉ từ 12.000đ/km, cam kết không phát sinh phụ phí ẩn, đưa đón tận nơi 24/7.
• Hotline tổng đài đặt xe nhanh 24/7: 0877.669.555 (Zalo: 0398.567.070).`,
      image: taxiImg,
      imageCaption: `Đội xe Taxi Quảng Bình - Đồng Hới 24H sẵn sàng phục vụ quý khách chu đáo trên mọi nẻo đường`,
      tips: ["Gọi Hotline 0877.669.555 trước 30 phút để đặt xe và nhận ưu đãi giảm giá lên tới 50% cho chiều về."],
    });
  }

  result.sections = sections;

  // 3. Đảm bảo có ít nhất 5 highlights
  if (!result.highlights || result.highlights.length < 4) {
    result.highlights = [
      `Điểm đến nổi tiếng ${result.destination} với bề dày lịch sử và vẻ đẹp thiên nhiên đặc sắc`,
      "Cung đường di chuyển thuận lợi bằng xe ô tô taxi đưa đón tận nơi",
      "Lịch trình tour 1 ngày khoa học kết nối các điểm du lịch hot nhất trong khu vực",
      "Thưởng thức nền ẩm thực bản địa phong phú với các món ngon khó cưỡng",
      "Dịch vụ taxi 4 - 7 chỗ giá rẻ chỉ từ 12.000đ/km, đón nhanh sau 5 - 10 phút gọi",
    ];
  } else {
    result.highlights = result.highlights.map(cleanVietnameseText).filter(Boolean);
  }

  // 4. Đảm bảo có 3 FAQs
  if (!result.faqs || result.faqs.length < 3) {
    result.faqs = [
      {
        question: `Từ Đồng Hới đi taxi đến ${result.destination} mất bao lâu?`,
        answer: `Thời gian di chuyển bằng taxi chỉ mất khoảng ${result.distanceFromDongHoi || "45 - 60 phút"}. Tuyến đường trải nhựa bằng phẳng, xe chạy êm ái.`,
      },
      {
        question: `Giá cước thuê xe taxi đưa đón ${result.destination} là bao nhiêu?`,
        answer: `Giá taxi 4 chỗ trọn gói dao động từ ${result.taxiFare4Seats || "550.000 VNĐ"}, xe 7 chỗ từ ${result.taxiFare6Seats || "750.000 VNĐ"}. Đặt khứ hồi 2 chiều được giảm ngay 50% chiều về.`,
      },
      {
        question: `Làm thế nào để đặt xe taxi nhanh nhất?`,
        answer: "Quý khách chỉ cần liên hệ Hotline 0877.669.555 hoặc Zalo 0398.567.070, tài xế sẽ có mặt đón tận nơi sau 5 - 10 phút.",
      },
    ];
  } else {
    result.faqs = result.faqs.map((f) => ({
      question: cleanVietnameseText(f.question),
      answer: cleanVietnameseText(f.answer),
    }));
  }

  return result;
}

/**
 * ĐỘNG CƠ SINH NỘI DUNG CHUẨN VÀNG TỰ ĐỘNG (GOLDEN BLUEPRINT SYNTHESIZER):
 * Tự động phân tích chủ đề bất kỳ do người dùng nhập (kể cả khi không có Gemini API Key)
 * và xây dựng bài viết hoàn chỉnh 100% theo đúng Mẫu Chuẩn Vàng 6 Phần của Thành Cổ Quảng Trị.
 */
export function synthesizeCustomGoldenTopic(rawTopic: string): TopicSeed {
  const cleanTopic = rawTopic.trim();
  const slug = cleanTopic
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const isQuangTri = /quảng trị|la vang|thành cổ|vịnh mốc|hiền lương|bến hải|cồn cỏ|đông hà|khe sanh|lao bảo/i.test(cleanTopic);
  const region = isQuangTri ? "Quảng Trị" : "Quảng Bình";

  const title = `Kinh Nghiệm Du Lịch ${cleanTopic} 2026: Cẩm Nang Chi Tiết & Thuê Xe Taxi Trọn Gói`;
  const metaTitle = `Kinh Nghiệm Khám Phá ${cleanTopic} 2026 | Taxi ${region} 24H`.slice(0, 65);
  const metaDescription = `Cẩm nang khám phá ${cleanTopic} ${region} 2026: Lịch trình tour 1 ngày chi tiết, kinh nghiệm tham quan, ẩm thực đặc sản và dịch vụ thuê xe taxi đưa đón trọn gói giá rẻ.`.slice(0, 160);
  const excerpt = `Khám phá ${cleanTopic} - điểm đến hấp dẫn và ý nghĩa bậc nhất tại ${region}. Nơi đây hội tụ vẻ đẹp thiên nhiên độc đáo, chiều sâu văn hóa lịch sử hào hùng và lòng hiếu khách của con người miền Trung.`;

  const coverImage = isQuangTri
    ? "https://upload.wikimedia.org/wikipedia/commons/1/1c/Th%C3%A0nh_c%E1%BB%95_Qu%E1%BA%A3ng_Tr%E1%BB%8B_Foto.jpg"
    : "https://upload.wikimedia.org/wikipedia/commons/1/16/Son_Doong_Cave_DB_%282%29.jpg";

  const rawSeed: TopicSeed = {
    slug,
    title,
    metaTitle,
    metaDescription,
    excerpt,
    category: isQuangTri ? "Di Tích Lịch Sử Tâm Linh" : "Điểm Đến Du Lịch Hot",
    coverImage,
    destination: cleanTopic,
    distanceFromDongHoi: isQuangTri ? "75 km (khoảng 70 phút đi xe)" : "50 km (khoảng 50 phút đi xe)",
    taxiFare4Seats: isQuangTri ? "750.000 VNĐ" : "550.000 VNĐ",
    taxiFare6Seats: isQuangTri ? "950.000 VNĐ" : "700.000 VNĐ",
    ticketPrice: "Theo quy định điểm tham quan",
    bestTimeToVisit: "Quanh năm, đẹp nhất từ tháng 3 đến tháng 9",
    readTime: "8 phút đọc",
    highlights: [
      `Khám phá vẻ đẹp độc đáo và giá trị văn hóa lịch sử sâu sắc tại ${cleanTopic}`,
      `Không gian thiên nhiên trong lành, thanh bình của vùng đất ${region}`,
      "Lịch trình tour 1 ngày khoa học kết nối thuận tiện các điểm tham quan lân cận",
      "Thưởng thức nền ẩm thực bản địa trứ danh đậm đà phong vị miền Trung",
      "Dịch vụ taxi đưa đón tận nơi giá niêm yết chỉ từ 12.000đ/km, phục vụ 24/7",
    ],
    gallery: [
      {
        url: getVerifiedImageForTopic(cleanTopic, "toàn cảnh điểm đến", 1),
        caption: `Toàn cảnh vẻ đẹp kỳ vĩ của ${cleanTopic} nhìn từ trên cao`,
      },
      {
        url: getVerifiedImageForTopic(cleanTopic, "khung cảnh thiên nhiên", 2),
        caption: `Không gian ấn tượng thu hút đông đảo du khách ghé thăm ${cleanTopic}`,
      },
      {
        url: getVerifiedImageForTopic(cleanTopic, "ẩm thực đặc sản", 3),
        caption: "Hương vị ẩm thực miền Trung làm say lòng du khách thập phương",
      },
      {
        url: getVerifiedImageForTopic(cleanTopic, "lộ trình taxi đưa đón", 4),
        caption: "Cung đường di chuyển bằng phẳng, thuận lợi cho mọi hành trình",
      },
    ],
    sections: [
      {
        heading: `1. Khám phá vẻ đẹp và ý nghĩa sâu sắc của ${cleanTopic}`,
        content: `${cleanTopic} là một trong những điểm đến nổi bật của vùng đất ${region}, nơi lưu giữ những nét đẹp thiên nhiên và giá trị văn hóa độc đáo. Đặt chân đến đây, du khách sẽ ngay lập tức cảm nhận được sự giao hòa tuyệt vời giữa cảnh sắc thiên nhiên hữu tình và chiều sâu lắng đọng của thời gian.\n\nVùng đất này đã chứng kiến bao biến thiên lịch sử, là niềm tự hào của người dân địa phương và luôn mở rộng vòng tay đón chào du khách từ khắp mọi miền Tổ quốc đến chiêm ngưỡng và khám phá.`,
        image: getVerifiedImageForTopic(cleanTopic, "vẻ đẹp thiên nhiên di sản", 1),
        imageCaption: `Vẻ đẹp ấn tượng của ${cleanTopic} chào đón du khách đến tham quan`,
        tips: ["Quý khách nên chuẩn bị máy ảnh hoặc điện thoại đầy pin để ghi lại những khoảnh khắc đẹp."],
      },
      {
        heading: `2. Những trải nghiệm và điểm check-in không thể bỏ lỡ tại ${cleanTopic}`,
        content: `Đến với ${cleanTopic}, du khách sẽ có cơ hội hòa mình vào không gian kiến trúc độc đáo, chiêm ngưỡng những góc cảnh sắc thiên nhiên tuyệt tác và tận hưởng bầu không khí trong lành, thư thái.\n\nTừng góc nhỏ nơi đây đều mang một nét duyên thầm riêng biệt, từ những lối đi rợp bóng cây xanh, các công trình biểu tượng cho đến khung cảnh thơ mộng khiến bất kỳ ai cũng muốn dừng chân thật lâu để lưu lại những bức hình kỷ niệm.`,
        image: getVerifiedImageForTopic(cleanTopic, "trải nghiệm check-in", 2),
        imageCaption: `Những góc check-in tuyệt đẹp và công trình đặc trưng tại ${cleanTopic}`,
        tips: ["Nên đi vào buổi sáng sớm hoặc xế chiều để có ánh sáng đẹp nhất và thời tiết mát mẻ."],
      },
      {
        heading: `3. Cảm xúc lắng đọng và giá trị tinh thần bất tận`,
        content: `Mỗi chuyến đi đến ${cleanTopic} không chỉ đơn thuần là một chuyến du lịch ngắm cảnh, mà còn là hành trình tìm về với sự bình yên trong tâm hồn. Lắng nghe những câu chuyện kể từ người dân bản xứ, ngắm nhìn nhịp sống bình dị trôi qua bên dòng sông hay triền núi, bạn sẽ cảm nhận rõ rệt tình yêu quê hương đất nước nồng nàn và trân quý hơn từng phút giây của cuộc sống.`,
        image: getVerifiedImageForTopic(cleanTopic, "không gian thanh tịnh bình yên", 3),
        imageCaption: `Không gian tĩnh lặng và cảm xúc sâu lắng tại điểm đến`,
        tips: ["Hãy dành một khoảng lặng để lắng nghe tiếng gió và tận hưởng không gian thanh tịnh."],
      },
      {
        heading: `4. Gợi ý lịch trình Tour ${cleanTopic} 1 Ngày trọn vẹn xuất phát từ TP. Đồng Hới`,
        content: `Một hành trình khoa học và tiện lợi nhất khi thuê xe Taxi Quảng Bình - Đồng Hới 24H:\n\n• 07:30 - 08:30: Xe đón quý khách tại trung tâm TP. Đồng Hới (Sân bay Đồng Hới, Ga tàu hoặc các khách sạn đường Trương Pháp, Bảo Ninh), khởi hành đi ${cleanTopic}.\n• 08:30 - 11:30: Tham quan chi tiết các điểm nhấn chính của ${cleanTopic}, chụp ảnh lưu niệm và tìm hiểu câu chuyện bản xứ.\n• 11:45 - 13:30: Thưởng thức bữa trưa đặc sản nức tiếng tại nhà hàng địa phương uy tín.\n• 13:45 - 16:30: Kết hợp tham quan các danh lam thắng cảnh lân cận trên cùng trục đường.\n• 17:00: Xe đưa đoàn trở về trung tâm TP. Đồng Hới an toàn, kết thúc chuyến đi đầy ắp kỷ niệm đẹp.`,
        image: getVerifiedImageForTopic(cleanTopic, "lịch trình tour taxi đón tiễn", 4),
        imageCaption: `Cung đường di chuyển thuận lợi xuất phát từ Đồng Hới kết nối tour 1 ngày hoàn hảo`,
        tips: ["Đặt xe taxi trọn gói khứ hồi với Taxi 24H từ Đồng Hới để không phải lo lắng việc tìm xe hay đổi xe giữa đường, tiết kiệm 50% chiều về."],
      },
      {
        heading: `5. Thưởng thức đặc sản ẩm thực TP. Đồng Hới & ${region} thơm ngon khó cưỡng`,
        content: `Ẩm thực Đồng Hới & ${region} luôn làm say lòng du khách với những món ăn đậm đà, mộc mạc mang trọn hồn quê:\n• Bánh bột lọc Mệ Xuân trứ danh với vỏ trong veo dai giòn bọc tôm sông thịt mỡ chấm mắm ớt cay nồng.\n• Cháo canh cá lóc (bánh canh) Đồng Hới nóng hổi ngọt lịm từ nước hầm xương cá đồng.\n• Gà đồi nướng than chấm muối cheo thơm lừng mùi lá rừng Phong Nha.\n• Hải sản bờ kè Nhật Lệ & Bảo Ninh tươi sống cập bến hàng ngày ngọt đậm đà vị biển miền Trung.`,
        image: getVerifiedImageForTopic(cleanTopic, "ẩm thực đặc sản bánh lọc cháo canh", 5),
        imageCaption: `Mâm đặc sản ẩm thực Đồng Hới đậm đà hương vị miền Trung`,
        tips: ["Bác tài Taxi 24H bản xứ Đồng Hới sẽ gợi ý những quán ăn ngon đúng điệu của người bản địa, giá cả rất bình dân."],
      },
      {
        heading: `6. Dịch vụ Taxi Quảng Bình - Đồng Hới 24H: Đón nhanh 5 phút, an toàn, giá tốt nhất`,
        content: `Taxi Quảng Bình - Đồng Hới 24H luôn sẵn sàng đồng hành cùng bạn trên mọi nẻo đường:\n• Đội ngũ tài xế tập trung đông đảo nhất tại TP. Đồng Hới, đón khách nhanh chóng chỉ sau 5 phút tại Sân bay, Ga tàu và các khách sạn.\n• Đội xe đời mới từ 4 chỗ đến 7 chỗ sang trọng, nội thất sạch sẽ, điều hòa mát rượi.\n• Tài xế bản xứ Đồng Hới thân thiện, rành đường, hỗ trợ hành lý chu đáo và tư vấn miễn phí suốt hành trình.\n• Giá cước niêm yết rõ ràng chỉ từ 12.000đ/km, ưu đãi giảm tới 50% cho chiều về khi đặt khứ hồi.\n• Tổng đài đặt xe nhanh 24/7: Hotline 0877.669.555 (Zalo: 0398.567.070).`,
        image: getVerifiedImageForTopic(cleanTopic, "taxi đồng hới đưa đón sân bay", 6),
        imageCaption: `Đội xe Taxi Quảng Bình - Đồng Hới 24H luôn túc trực phục vụ quý khách tận tình`,
        tips: ["Gọi ngay Hotline 0877.669.555 trước 30 phút để giữ xe đời mới nhất cho hành trình của bạn."],
      },
    ],
    faqs: [
      {
        question: `Từ trung tâm TP. Đồng Hới đi taxi đến ${cleanTopic} mất bao lâu?`,
        answer: `Thời gian di chuyển bằng taxi chỉ khoảng ${isQuangTri ? "60 - 80 phút" : "30 - 50 phút"} xuất phát từ trung tâm TP. Đồng Hới hoặc Sân bay Đồng Hới, đường đi rất êm ái và thuận tiện.`,
      },
      {
        question: "Cước thuê xe taxi đưa đón trọn gói từ Đồng Hới giá bao nhiêu?",
        answer: "Giá xe 4 chỗ trọn gói chỉ từ 12.000đ/km. Đặt khứ hồi trong ngày xuất phát từ Đồng Hới được giảm ngay 50% cước chiều về.",
      },
      {
        question: "Đón tại Sân bay Đồng Hới hoặc Ga xe lửa Đồng Hới có phụ phí không?",
        answer: "Cam kết giá báo trọn gói đã bao gồm vé vào cổng sân bay và ga tàu, quý khách hoàn toàn không phát sinh thêm bất kỳ phụ phí nào.",
      },
    ],
  };

  return ensureGoldenBlueprintQuality(rawSeed);
}

/**
 * Tự động tạo bài viết chuẩn SEO mới (hỗ trợ Gemini AI, Động cơ Chuẩn Vàng & Kho dữ liệu 6 phần)
 */
export async function generateAndPublishSeoArticle(
  customTopic?: string,
  overrideApiKey?: string
): Promise<{
  success: boolean;
  guide?: TravelGuide;
  message: string;
}> {
  try {
    const existingGuides = await getAllTravelGuidesAsync();
    const existingSlugs = new Set(existingGuides.map((g) => g.slug));

    let chosenSeed: TopicSeed | null = null;
    const geminiKey = overrideApiKey || process.env.GEMINI_API_KEY;

    // 1. Nếu có chủ đề tùy chỉnh
    if (customTopic && customTopic.trim()) {
      const topicStr = customTopic.trim();
      // 1.1 Nếu có Gemini API Key -> gọi Gemini AI
      if (geminiKey) {
        try {
          const aiGenerated = await generateWithGemini(geminiKey, topicStr);
          if (aiGenerated) {
            chosenSeed = ensureGoldenBlueprintQuality(aiGenerated);
          }
        } catch (e) {
          console.warn("Gemini call failed, falling back to Golden Synthesizer:", e);
        }
      }

      // 1.2 Nếu chưa có seed (không có key hoặc Gemini lỗi) -> dùng Động cơ Chuẩn Vàng Synthesizer
      if (!chosenSeed) {
        chosenSeed = synthesizeCustomGoldenTopic(topicStr);
      }
    }

    // 2. Nếu không có chủ đề tùy chỉnh -> ưu tiên các chủ đề trọng tâm Quảng Bình & TP. Đồng Hới
    if (!chosenSeed) {
      // Ưu tiên các bài viết thuộc địa bàn Quảng Bình & TP. Đồng Hới trước
      const quangBinhSeeds = SEO_TOPICS_DATABASE.filter(
        (s) =>
          !existingSlugs.has(s.slug) &&
          !/thanh-co|vinh-moc|la-vang|hien-luong|quang-tri/i.test(s.slug)
      );
      const remainingSeeds = SEO_TOPICS_DATABASE.filter((s) => !existingSlugs.has(s.slug));
      const availableSeeds = quangBinhSeeds.length > 0 ? quangBinhSeeds : remainingSeeds;

      if (availableSeeds.length > 0) {
        chosenSeed = ensureGoldenBlueprintQuality(availableSeeds[0]);
      } else {
        // Đã đăng hết các bài trong kho -> ưu tiên sáng tạo bài viết mới về TP. Đồng Hới & Quảng Bình
        const QUANG_BINH_TOPICS = [
          "Cẩm nang đặt Taxi Sân bay Đồng Hới về Khách sạn Biển Nhật Lệ & Bảo Ninh 2026",
          "Kinh nghiệm đi Tour Động Thiên Đường & Suối Nước Moọc 1 ngày xuất phát từ TP. Đồng Hới",
          "Tour Taxi Đồng Hới đi Động Phong Nha & Sông Chày Hang Tối trọn gói giá rẻ",
          "Kinh nghiệm viếng Mộ Đại Tướng Võ Nguyên Giáp (Vũng Chùa - Đảo Yến) & Bãi Đá Nhảy từ Đồng Hới",
          "Cẩm nang du lịch Bãi biển Nhật Lệ & Check-in Đồi cát Quang Phú Đồng Hới",
          "Kinh nghiệm đón Taxi Ga xe lửa Đồng Hới đi Phong Nha Kẻ Bàng",
          "Tour nghỉ dưỡng Onsen Suối khoáng nóng Bang Lệ Thủy từ TP. Đồng Hới 1 ngày",
          "Food tour ẩm thực đêm TP. Đồng Hới: Bánh lọc Mệ Xuân, Cháo canh, Hải sản Nhật Lệ",
          "Kinh nghiệm du lịch Thung lũng Hava & Công viên Ozo Treetop Park Quảng Bình từ Đồng Hới",
          "Cẩm nang thuê xe Taxi trọn gói đi Tour khám phá Hang Sơn Đoòng & Vườn quốc gia Phong Nha",
        ];
        const randomTopic = QUANG_BINH_TOPICS[Math.floor(Math.random() * QUANG_BINH_TOPICS.length)];

        if (geminiKey) {
          try {
            const aiGenerated = await generateWithGemini(geminiKey, randomTopic);
            if (aiGenerated) {
              const timestamp = Date.now().toString().slice(-4);
              chosenSeed = ensureGoldenBlueprintQuality({
                ...aiGenerated,
                slug: `${aiGenerated.slug || "tour-quang-binh"}-${timestamp}`,
                publishedDate: new Date().toISOString().split("T")[0],
              });
            }
          } catch (e) {
            console.warn("Gemini auto-generation failed, falling back to database seed:", e);
          }
        }

        if (!chosenSeed) {
          const randomSeed = SEO_TOPICS_DATABASE[Math.floor(Math.random() * SEO_TOPICS_DATABASE.length)];
          const timestamp = Date.now().toString().slice(-4);
          chosenSeed = ensureGoldenBlueprintQuality({
            ...randomSeed,
            slug: `${randomSeed.slug}-${timestamp}`,
            title: `${randomSeed.title.replace(/2026/g, "").trim()} Mới Nhất 2026`,
            publishedDate: new Date().toISOString().split("T")[0],
          });
        }
      }
    }

    if (!chosenSeed) {
      return { success: false, message: "Không tìm thấy chủ đề phù hợp để xuất bản bài viết!" };
    }

    // Chuẩn hóa thành TravelGuide đầy đủ chuẩn mẫu vàng
    const rawGuide: TravelGuide = {
      slug: chosenSeed.slug,
      title: chosenSeed.title,
      metaTitle: chosenSeed.metaTitle,
      metaDescription: chosenSeed.metaDescription,
      excerpt: chosenSeed.excerpt,
      category: chosenSeed.category,
      coverImage: chosenSeed.coverImage,
      destination: chosenSeed.destination,
      distanceFromDongHoi: chosenSeed.distanceFromDongHoi,
      taxiFare4Seats: chosenSeed.taxiFare4Seats,
      taxiFare6Seats: chosenSeed.taxiFare6Seats,
      ticketPrice: chosenSeed.ticketPrice,
      bestTimeToVisit: chosenSeed.bestTimeToVisit,
      author: "Ban Biên Tập Taxi Quảng Trị - Quảng Bình 24H",
      publishedDate: new Date().toISOString().split("T")[0],
      readTime: chosenSeed.readTime || "8 phút đọc",
      rating: 5.0,
      reviewsCount: Math.floor(Math.random() * 50) + 110,
      highlights: chosenSeed.highlights,
      gallery: chosenSeed.gallery || [],
      sections: chosenSeed.sections,
      faqs: chosenSeed.faqs,
    };

    // Chuẩn hóa và gán ảnh thực tế đã kiểm chứng, loại bỏ 100% link Unsplash hỏng
    const newGuide = sanitizeGuide(rawGuide);

    // Lưu vào database (Firestore + JSON backup)
    const saveRes = await saveTravelGuide(newGuide);
    if (!saveRes.success) {
      return { success: false, message: saveRes.message || "Lỗi lưu bài viết vào cơ sở dữ liệu" };
    }

    // Gửi thông báo đến Telegram chủ xe kèm link xem & link chỉnh sửa
    await notifyArticlePublishedViaTelegram(newGuide);

    return {
      success: true,
      guide: newGuide,
      message: `Đã tự động xuất bản bài viết '${newGuide.title}' theo Mẫu Chuẩn Vàng 6 Phần thành công và thông báo qua Telegram!`,
    };
  } catch (error: any) {
    console.error("Error generating and publishing SEO article:", error);
    return { success: false, message: error.message || "Lỗi tạo bài viết AI" };
  }
}

/**
 * Gọi Google Gemini API để tạo bài viết du lịch chuẩn SEO theo "MẪU CHUẨN VÀNG ĐẶC SẮC"
 * (Đầy đủ 6 phần chuyên sâu, ảnh minh họa từng phần, bộ sưu tập gallery, ẩm thực bản địa, tour 1 ngày và Taxi 24H)
 */
async function generateWithGemini(apiKey: string, promptTopic: string): Promise<TopicSeed | null> {
  const prompt = `
Bạn là chuyên gia biên tập nội dung du lịch và SEO hàng đầu, am hiểu sâu sắc về văn hóa, danh lam thắng cảnh và ẩm thực tại TỈNH QUẢNG BÌNH (cũ), đặc biệt là TP. ĐỒNG HỚI, Phong Nha - Kẻ Bàng, Biển Nhật Lệ, Bãi Đá Nhảy, Vũng Chùa - Đảo Yến, Suối Moọc, Động Thiên Đường...

CHIẾN LƯỢC KINH DOANH & ĐỊA BÀN HOẠT ĐỘNG BẮT BUỘC (THEO CHỈ ĐẠO TRỰC TIẾP TỪ CHỦ XE):
1. ĐỊA BÀN HOẠT ĐỘNG CỐT LÕI: Hoạt động chủ yếu tại địa bàn TỈNH QUẢNG BÌNH (cũ).
2. ĐỘI NGŨ TÀI XẾ CHỦ LỰC TẬP TRUNG TẠI TP. ĐỒNG HỚI: Nhà xe có lượng tài xế tập trung đông đảo nhất tại TP. ĐỒNG HỚI, túc trực 24/7 tại:
   - Cảng Hàng không Đồng Hới (Sân bay Đồng Hới)
   - Ga xe lửa Đồng Hới
   - Tuyến đường ven biển Trương Pháp, bán đảo Bảo Ninh
   - Bến xe Đồng Hới và toàn bộ khu vực nội thành trung tâm TP. Đồng Hới
   - Cam kết xe đón nhanh trong 5 phút sau khi gọi tổng đài.
3. MỐC QUY CHIẾU LỘ TRÌNH VÀ BẢNG GIÁ TAXI:
   - MỌI bài viết du lịch PHẢI lấy mốc xuất phát và quy chiếu chính từ TP. ĐỒNG HỚI (hoặc Sân bay Đồng Hới / Ga Đồng Hới) đi các điểm du lịch nổi tiếng Quảng Bình: Động Phong Nha, Động Thiên Đường, Suối Nước Moọc, Sông Chày - Hang Tối, Thung lũng Hava, Công viên Ozo, Bãi Đá Nhảy, Vũng Chùa - Đảo Yến (Mộ Đại Tướng Võ Nguyên Giáp), Đồi cát Quang Phú, Bãi biển Nhật Lệ, Bán đảo Bảo Ninh, Suối khoáng nóng Bang Onsen (Lệ Thủy)...
   - Khoảng cách và cước phí taxi: Báo giá trọn gói minh bạch từ Đồng Hới với đơn giá từ 12.000đ/km, cam kết không phụ phí, ưu đãi giảm giá chiều về tới 50%.
4. CẨM NANG ẨM THỰC BẢN ĐỊA:
   - Ưu tiên giới thiệu các món ẩm thực nức tiếng làm nên thương hiệu của TP. ĐỒNG HỚI và QUẢNG BÌNH: Bánh bột lọc Mệ Xuân, Cháo canh cá lóc Đồng Hới, Hải sản tươi sống bờ kè Nhật Lệ & Bảo Ninh (mực nhảy, đẻn biển, chắt chắt xào bánh tráng), Bánh xèo gạo lứt Ba Đồn, Khoai gieo Hải Ninh, Lẩu cá khoai mùa đông...
5. DỊCH VỤ TAXI:
   - Định vị thương hiệu: Taxi Quảng Bình - Đồng Hới 24H (Hotline: 0877.669.555, Zalo: 0398.567.070).
   - Đội xe đời mới 4 - 7 chỗ sạch mát, tài xế bản xứ Đồng Hới lịch sự, nhiệt tình, am hiểu từng ngõ ngách và tư vấn quán ăn chuẩn vị, giá địa phương không lo chặt chém.

Hãy viết một bài viết cẩm nang du lịch và dịch vụ xe taxi chuẩn SEO ĐẶC SẮC NHẤT về chủ đề: "${promptTopic}".

BẮT BUỘC TUÂN THỦ "MẪU CHUẨN VÀNG" ĐÃ ĐƯỢC CHỦ XE DUYỆT SAU ĐÂY:
1. VĂN PHONG: Sâu sắc, hào hùng, giàu cảm xúc, thấm đượm giá trị văn hóa lịch sử, kết hợp mẹo thực tế bổ ích từ bác tài bản xứ Đồng Hới.
2. CẤU TRÚC 6 PHẦN BẮT BUỘC:
   - Phần 1: Bối cảnh, giá trị di sản hoặc vẻ đẹp thiên nhiên kỳ vĩ của điểm đến tại Quảng Bình.
   - Phần 2: Kiến trúc, vết tích chứng tích hoặc các trải nghiệm tham quan chi tiết.
   - Phần 3: Trải nghiệm thi vị, thơ ca bất hủ, cảm xúc lắng đọng hoặc nghi thức tâm linh tri ân.
   - Phần 4: Gợi ý lịch trình Tour 1 ngày trọn vẹn theo khung giờ cụ thể (07:30 đến 17:30) XUẤT PHÁT TỪ TRUNG TÂM TP. ĐỒNG HỚI kết nối với các điểm du lịch lân cận.
   - Phần 5: Cẩm nang ẩm thực đặc sản bản địa trứ danh tại TP. Đồng Hới / Quảng Bình (4-5 món độc đáo và quán ăn ngon chuẩn vị).
   - Phần 6: Dịch vụ Taxi Quảng Bình - Đồng Hới 24H: Đội xe tập trung tại Đồng Hới đón nhanh 5 phút, xe sạch mát 4-7 chỗ, giá trọn gói từ 12.000đ/km, ưu đãi 50% chiều về, Hotline 0877.669.555.
3. HÌNH ẢNH & BỘ SƯU TẬP (GALLERY):
   - Mỗi phần (section) và mỗi ảnh gallery chỉ cần cung cấp "imageCaption" chi tiết, giàu cảm xúc miêu tả vẻ đẹp của góc chụp.
   - Không tự bịa URL ảnh hỏng, hệ thống sẽ tự động đối khớp ảnh thực tế bách khoa toàn thư đã kiểm chứng.
4. CHUẨN HÓA VĂN BẢN:
   - Viết tiếng Việt chuẩn, không sử dụng mã thực thể HTML như &#x27;, &quot;, &amp;. Dùng dấu nháy đơn ' và nháy kép " trực tiếp.

Yêu cầu trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown code block hoặc text nào khác) với cấu trúc sau:
{
  "slug": "chu-de-khong-dau-ngan-gon",
  "title": "Tiêu đề hấp dẫn chuẩn SEO 2026 có từ khóa chính",
  "metaTitle": "Tiêu đề hiển thị Google < 65 ký tự",
  "metaDescription": "Đoạn mô tả SEO 150-160 ký tự",
  "excerpt": "Đoạn mở đầu truyền cảm hứng 2-3 câu sâu sắc",
  "category": "Di Sản Thiên Nhiên Thế Giới" hoặc "Điểm Đến Du Lịch Hot" hoặc "Tuyến Đường & Đón Tiễn" hoặc "Di Tích Lịch Sử Tâm Linh",
  "coverImage": "",
  "destination": "Tên địa danh cụ thể tại Quảng Bình",
  "distanceFromDongHoi": "Khoảng cách và thời gian đi từ trung tâm TP. Đồng Hới",
  "taxiFare4Seats": "Giá xe 4 chỗ (VD: 550.000 VNĐ)",
  "taxiFare6Seats": "Giá xe 7 chỗ (VD: 700.000 VNĐ)",
  "ticketPrice": "Giá vé tham quan thực tế",
  "bestTimeToVisit": "Thời điểm đẹp nhất trong năm",
  "readTime": "8 phút đọc",
  "highlights": ["Điểm nổi bật 1", "Điểm nổi bật 2", "Điểm nổi bật 3", "Điểm nổi bật 4", "Điểm nổi bật 5"],
  "gallery": [
    { "caption": "Toàn cảnh vẻ đẹp kỳ vĩ tại điểm đến" },
    { "caption": "Góc check-in thiên nhiên thơ mộng" },
    { "caption": "Trải nghiệm tham quan đặc sắc" },
    { "caption": "Ẩm thực địa phương hấp dẫn" }
  ],
  "sections": [
    {
      "heading": "1. Tiêu đề phần 1",
      "content": "Nội dung giàu cảm xúc, thấm đượm văn hóa lịch sử khoảng 120-180 từ...",
      "imageCaption": "Chú thích góc chụp đẹp phần 1",
      "tips": ["Mẹo hữu ích từ bác tài bản địa Đồng Hới"]
    },
    {
      "heading": "2. Tiêu đề phần 2",
      "content": "Nội dung chi tiết 120-180 từ...",
      "imageCaption": "Chú thích góc chụp đẹp phần 2",
      "tips": ["Mẹo phần 2"]
    },
    {
      "heading": "3. Tiêu đề phần 3",
      "content": "Nội dung chi tiết 120-180 từ...",
      "imageCaption": "Chú thích góc chụp đẹp phần 3",
      "tips": ["Mẹo phần 3"]
    },
    {
      "heading": "4. Gợi ý lịch trình Tour 1 Ngày chi tiết xuất phát từ TP. Đồng Hới",
      "content": "Lịch trình theo các mốc giờ 07:30, 09:30, 11:30, 13:30, 15:30 từ TP. Đồng Hới...",
      "imageCaption": "Chú thích góc chụp lịch trình tour",
      "tips": ["Mẹo đặt xe trọn gói khứ hồi từ Đồng Hới để nhận ưu đãi 50% chiều về"]
    },
    {
      "heading": "5. Thưởng thức đặc sản ẩm thực TP. Đồng Hới & Quảng Bình nức tiếng",
      "content": "Giới thiệu 4-5 món đặc sản độc đáo và địa chỉ quán ngon chuẩn vị tại Đồng Hới...",
      "imageCaption": "Chú thích mâm đặc sản ẩm thực nức tiếng",
      "tips": ["Mẹo thưởng thức ẩm thực từ bác tài Đồng Hới"]
    },
    {
      "heading": "6. Dịch vụ Taxi Quảng Bình - Đồng Hới 24H đưa đón chu đáo",
      "content": "Đội xe tập trung tại TP. Đồng Hới đón nhanh 5 phút, giá từ 12.000đ/km, tài xế bản xứ am hiểu địa phương, Hotline 0877.669.555...",
      "imageCaption": "Chú thích đội xe taxi đón nhanh 5 phút",
      "tips": ["Mẹo liên hệ đặt xe trước để nhận ưu đãi chiều về tới 50%"]
    }
  ],
  "faqs": [
    { "question": "Từ trung tâm TP. Đồng Hới đi taxi mất bao lâu?", "answer": "Trả lời câu hỏi chi tiết thời gian và cự ly" },
    { "question": "Giá cước taxi trọn gói từ Đồng Hới là bao nhiêu?", "answer": "Trả lời bảng giá xe 4 chỗ và 7 chỗ" },
    { "question": "Đón tại Sân bay hoặc Ga Đồng Hới có phụ phí không?", "answer": "Cam kết giá trọn gói không phát sinh phụ phí" }
  ]
}
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    let parsed: any = null;
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } else {
      const cleanJson = rawText.substring(firstBrace, lastBrace + 1);
      parsed = JSON.parse(cleanJson);
    }

    if (!parsed) return null;

    // Giải mã toàn bộ thực thể HTML và chuẩn hóa Unicode NFC
    return {
      ...parsed,
      title: cleanVietnameseText(parsed.title),
      metaTitle: cleanVietnameseText(parsed.metaTitle),
      metaDescription: cleanVietnameseText(parsed.metaDescription),
      excerpt: cleanVietnameseText(parsed.excerpt),
      category: cleanVietnameseText(parsed.category),
      destination: cleanVietnameseText(parsed.destination),
      distanceFromDongHoi: cleanVietnameseText(parsed.distanceFromDongHoi),
      taxiFare4Seats: cleanVietnameseText(parsed.taxiFare4Seats),
      taxiFare6Seats: cleanVietnameseText(parsed.taxiFare6Seats),
      ticketPrice: cleanVietnameseText(parsed.ticketPrice),
      bestTimeToVisit: cleanVietnameseText(parsed.bestTimeToVisit),
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.map(cleanVietnameseText).filter(Boolean) : [],
      sections: Array.isArray(parsed.sections) ? parsed.sections.map((s: any) => ({
        ...s,
        heading: cleanVietnameseText(s.heading),
        content: cleanVietnameseText(s.content),
        imageCaption: cleanVietnameseText(s.imageCaption),
        tips: Array.isArray(s.tips) ? s.tips.map(cleanVietnameseText).filter(Boolean) : [],
      })) : [],
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery.map((g: any) => ({
        ...g,
        caption: cleanVietnameseText(g.caption),
      })) : [],
      faqs: Array.isArray(parsed.faqs) ? parsed.faqs.map((f: any) => ({
        question: cleanVietnameseText(f.question),
        answer: cleanVietnameseText(f.answer),
      })) : [],
    };
  } catch (err) {
    console.error("Gemini API generation error:", err);
    return null;
  }
}
