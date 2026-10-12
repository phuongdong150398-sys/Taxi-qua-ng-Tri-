import { TravelGuide } from "@/data/travelGuides";
import { saveTravelGuide, getAllTravelGuidesAsync } from "@/lib/travelGuidesService";

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
        heading: "4. Hướng dẫn di chuyển và xe taxi đón tiễn Sân bay Đồng Hới",
        content: `Để bắt đầu hành trình, du khách thường bay đến Sân bay Đồng Hới hoặc đi tàu hỏa đến Ga Đồng Hới, sau đó di chuyển khoảng 50km về thị trấn Phong Nha để tham gia buổi huấn luyện an toàn. Dịch vụ Taxi Quảng Trị - Quảng Bình 24H cung cấp dòng xe đời mới từ 4 đến 7 chỗ, đón đúng giờ tại sảnh sân bay với mức giá trọn gói tiết kiệm chỉ từ 12.000đ/km.`,
        image: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Son_Doong_Cave_by_Daniel_Burka.jpg",
        imageCaption: "Dòng sông ngầm thám hiểm uốn lượn bên trong hang Sơn Đoòng",
        tips: ["Nên liên hệ Hotline 0877.669.555 để đặt xe trước giờ hạ cánh 30 phút, tài xế sẽ có mặt sẵn sàng hỗ trợ hành lý chu đáo."],
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
    ],
  },
  {
    slug: "cam-nang-du-lich-dia-dao-vinh-moc-quang-tri",
    title: "Cẩm Nang Du Lịch Địa Đạo Vịnh Mốc 2026: Kỳ Tích Sống Trong Lòng Đất Quảng Trị",
    metaTitle: "Cẩm Nang Khám Phá Địa Đạo Vịnh Mốc Quảng Trị 2026 | Taxi 24H",
    metaDescription: "Khám phá huyền thoại làng hầm Địa đạo Vịnh Mốc Quảng Trị: Giá vé, hướng dẫn tham quan các tầng địa đạo, kinh nghiệm thuê xe taxi trọn gói từ Đông Hà và Đồng Hới.",
    excerpt: "Địa đạo Vịnh Mốc - kỳ tích kiến trúc quân sự lòng đất độc nhất vô nhị. Nơi đây từng là ngôi làng kiên cường che chở cho hàng trăm người dân và bộ đội suốt những năm tháng kháng chiến.",
    category: "Di Tích Lịch Sử Tâm Linh",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    destination: "Xã Vĩnh Thạch, Huyện Vĩnh Linh, Tỉnh Quảng Trị",
    distanceFromDongHoi: "65 km (khoảng 65 phút đi xe)",
    taxiFare4Seats: "650.000 VNĐ",
    taxiFare6Seats: "800.000 VNĐ",
    ticketPrice: "50.000đ/người lớn (Trẻ em miễn phí)",
    bestTimeToVisit: "Quanh năm, thời tiết mát mẻ",
    readTime: "6 phút đọc",
    highlights: [
      "Hệ thống địa đạo 3 tầng kỳ vĩ dài gần 2km đào hoàn toàn bằng tay",
      "Đầy đủ giếng nước, hội trường, phòng sinh hoạt và cả phòng hộ sinh đón chào 17 đứa trẻ chào đời",
      "Không khí trong lòng hầm luôn mát rượi và thông gió tự nhiên ra bờ biển lộng gió",
    ],
    sections: [
      {
        heading: "1. Kiến trúc địa đạo 3 tầng độc đáo có một không hai",
        content: "Địa đạo Vịnh Mốc nằm sát bờ biển Vĩnh Linh, được người dân đào thủ công từ năm 1965 đến 1967. Toàn bộ công trình có kết cấu 3 tầng: tầng 1 sâu 12-15m dùng để chiến đấu và trú ẩn tạm thời; tầng 2 sâu 18m là nơi sinh hoạt, hội họp, trạm xá; tầng 3 sâu 22-23m dùng làm kho chứa vũ khí và lương thực. Hệ thống gồm 13 cửa thông ra ngoài, trong đó có 6 cửa trổ thẳng ra biển đón gió mát lành.",
        tips: ["Nên mang giày thể thao thoải mái và đi theo hướng dẫn của hướng dẫn viên để không bỏ sót các điểm tham quan thú vị."],
      },
      {
        heading: "2. Cách thức di chuyển đến Địa đạo Vịnh Mốc thuận tiện nhất",
        content: "Nằm cách QL1A khoảng 14km về phía biển, đường vào Vịnh Mốc rất đẹp, rợp bóng phi lao và cao su bạt ngàn. Du khách từ Đông Hà (khoảng 38km) hoặc Đồng Hới (khoảng 65km) có thể dễ dàng đặt taxi đưa đón trọn gói. Đội ngũ lái xe Taxi Quảng Trị 24H luôn sẵn sàng phục vụ với xe đời mới 4 - 7 chỗ máy lạnh mát sâu, lái xe an toàn và nhiệt tình hỗ trợ suốt chuyến đi.",
        tips: ["Có thể kết hợp tham quan Cầu Hiền Lương - Sông Bến Hải và Bãi biển Cửa Tùng trên cùng một cung đường."],
      },
    ],
    faqs: [
      {
        question: "Đi trong lòng địa đạo Vịnh Mốc có ngột ngạt không?",
        answer: "Hoàn toàn không. Hệ thống địa đạo được thiết kế các giếng thông hơi thông minh và cửa sổ hướng biển nên không khí bên trong luôn mát mẻ và dễ chịu.",
      },
      {
        question: "Giá taxi đi tour Vịnh Mốc từ TP. Đông Hà là bao nhiêu?",
        answer: "Giá taxi 4 chỗ khứ hồi từ Đông Hà đi Vịnh Mốc kết hợp Cầu Hiền Lương khoảng 500.000đ - 650.000đ trọn gói cả đi và về.",
      },
    ],
  },
  {
    slug: "kinh-nghiem-hanh-huong-thanh-dia-la-vang-quang-tri",
    title: "Kinh Nghiệm Hành Hương Thánh Địa La Vang Quảng Trị 2026: Trung Tâm Hành Hương Công Giáo Linh Thiêng",
    metaTitle: "Kinh Nghiệm Hành Hương Đức Mẹ La Vang Quảng Trị 2026 | Taxi 24H",
    metaDescription: "Cẩm nang hướng dẫn hành hương Thánh địa Đức Mẹ La Vang Quảng Trị: Nguồn gốc tích Đức Mẹ hiện ra, giờ lễ, kinh nghiệm xin ơn và dịch vụ xe taxi đón tiễn từ Huế, Đông Hà, Đồng Hới.",
    excerpt: "Thánh địa La Vang là trung tâm hành hương Công giáo lớn bậc nhất Việt Nam. Cùng khám phá cẩm nang chiêm bái linh thiêng, kiến trúc Vương cung Thánh đường và phương tiện di chuyển thuận tiện.",
    category: "Di Tích Lịch Sử Tâm Linh",
    coverImage: "https://images.unsplash.com/photo-1548625361-1979ad2d67ad?auto=format&fit=crop&w=1200&q=80",
    destination: "Xã Hải Phú, Huyện Hải Lăng, Tỉnh Quảng Trị",
    distanceFromDongHoi: "110 km (khoảng 100 phút đi xe)",
    taxiFare4Seats: "950.000 VNĐ",
    taxiFare6Seats: "1.200.000 VNĐ",
    ticketPrice: "Miễn phí tham quan và hành hương",
    bestTimeToVisit: "Quanh năm, đặc biệt dịp Đại hội La Vang ngày 15/8",
    readTime: "6 phút đọc",
    highlights: [
      "Trung tâm Thánh Mẫu Quốc gia thiêng liêng của cộng đồng Công giáo",
      "Vương cung Thánh đường La Vang mới với quy mô đồ sộ và kiến trúc đậm nét văn hóa Việt",
      "Cây đa La Vang lịch sử - nơi tương truyền Đức Mẹ bồng Chúa Hài Đồng hiện ra che chở đoàn con",
    ],
    sections: [
      {
        heading: "1. Sự tích huyền thoại Đức Mẹ La Vang hiện ra che chở giáo dân",
        content: "Năm 1798, dưới thời vua Cảnh Thịnh, nhiều giáo dân đã chạy trốn vào khu rừng rậm hoang vu La Vang thuộc vùng đất Dinh Cát xưa. Giữa cảnh đói khổ và dịch bệnh hoành hành, giáo dân đã tụ họp dưới gốc cây đa cổ thụ đọc kinh cầu nguyện. Tương truyền, Đức Mẹ Maria đã hiện ra với áo choàng lộng lẫy, tay bồng Chúa Giêsu, an ủi con cái và chỉ cho họ hái lá vằng đun nước uống để chữa lành bệnh tật.",
        tips: ["Du khách và giáo dân có thể mang theo bình nước sạch để lấy nước thánh từ nguồn nước tại trung tâm La Vang về làm quà phước lành."],
      },
      {
        heading: "2. Phương tiện di chuyển đến Thánh địa La Vang thuận tiện nhất",
        content: "Thánh địa La Vang nằm cách TP. Đông Hà 18km về phía Nam và cách TP. Huế khoảng 55km về phía Bắc, đường đi hoàn toàn trải nhựa phẳng phiu. Khách hành hương hạ cánh tại Sân bay Phú Bài (Huế) hoặc Ga Đông Hà có thể đặt Taxi Quảng Trị 24H để được đưa đón tận cửa Vương cung Thánh đường với mức cước rẻ nhất khu vực chỉ từ 12.000đ/km.",
        tips: ["Vào dịp Lễ Đức Mẹ Hồn Xác Lên Trời (15/8), lượng khách hành hương rất đông, du khách nên đặt xe trước 1-2 ngày để đảm bảo có xe đón đúng giờ."],
      },
    ],
    faqs: [
      {
        question: "Từ Ga Đông Hà đi taxi đến Thánh địa La Vang mất bao lâu?",
        answer: "Khoảng cách chỉ khoảng 18km, thời gian di chuyển bằng taxi mất khoảng 20-25 phút. Giá cước taxi 4 chỗ khoảng 200.000đ - 220.000đ.",
      },
      {
        question: "Người ngoài Công giáo có được vào tham quan Thánh địa La Vang không?",
        answer: "Hoàn toàn được. Thánh địa mở cửa chào đón tất cả du khách thập phương đến tham quan, chiêm bái và tìm hiểu nét đẹp kiến trúc trong không gian thanh tịnh.",
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
    readTime: "5 phút đọc",
    highlights: [
      "Làn nước sông Chày xanh biếc tự nhiên mát lạnh xua tan cái nắng hè",
      "Đường trượt siêu tốc zipline đáp nước dài 600m mang lại cảm giác cực đã",
      "Chèo thuyền kayak, thuyền SUP ngắm phong cảnh núi non trập trùng như tranh thủy mặc",
    ],
    sections: [
      {
        heading: "1. Những trải nghiệm không thể bỏ qua tại Thung lũng ngọc bích Hava",
        content: "Nằm kề bên Di sản Phong Nha - Kẻ Bàng, Hava sở hữu bờ cát vàng thoai thoải bên dòng sông Chày trong vắt. Đến đây, du khách thỏa sức thử thách bản thân với đường trượt zipline siêu dài đáp nước cực phấn khích, chèo thuyền SUP len lỏi qua các hẻm núi đá vôi, hoặc thư giãn trên những chiếc võng êm ái dưới bóng cây rừng râm mát.",
        tips: ["Nên mua vé trọn gói bao gồm tất cả các trò chơi và chèo thuyền để tiết kiệm chi phí hơn so với mua vé lẻ."],
      },
      {
        heading: "2. Hướng dẫn di chuyển và dịch vụ đưa đón taxi tận nơi",
        content: "Cách TP. Đồng Hới chỉ 50km theo hướng Tây Bắc, đường đi rải nhựa phẳng phiu uốn lượn qua những cánh rừng xanh ngút ngàn. Dịch vụ Taxi Quảng Trị - Quảng Bình 24H chuyên phục vụ các chuyến đi chơi tour Hava trong ngày, xe gia đình đón tận sảnh khách sạn hoặc ga tàu, điều hòa mát lạnh và sẵn sàng đợi đưa đón 2 chiều.",
        tips: ["Nên đi theo nhóm từ 4-7 người để đi taxi vừa thoải mái vừa chia tiền cước cực rẻ."],
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
    ],
  },
  {
    slug: "kinh-nghiem-du-lich-cong-vien-ozo-treetop-park-quang-binh",
    title: "Kinh Nghiệm Du Lịch Công Viên Ozo Treetop Park Quảng Bình 2026: Thử Thách Rừng Nguyên Sinh",
    metaTitle: "Kinh Nghiệm Khám Phá Công Viên Ozo Quảng Bình 2026 | Taxi 24H",
    metaDescription: "Cẩm nang du lịch Công viên Ozo Treetop Park Quảng Bình 2026: Trải nghiệm công viên trên cây đầu tiên tại Việt Nam, chèo kayak suối Ozo và dịch vụ taxi đón tiễn giá rẻ.",
    excerpt: "Công viên Ozo Treetop Park với hệ thống trò chơi trên cây độc đáo giữa rừng nguyên sinh Phong Nha - Kẻ Bàng là điểm dừng chân hấp dẫn cho những ai yêu thiên nhiên và phiêu lưu mạo hiểm.",
    category: "Điểm Đến Du Lịch Hot",
    coverImage: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
    destination: "Vườn Quốc Gia Phong Nha - Kẻ Bàng, Quảng Bình",
    distanceFromDongHoi: "52 km (khoảng 55 phút đi xe)",
    taxiFare4Seats: "580.000 VNĐ",
    taxiFare6Seats: "720.000 VNĐ",
    ticketPrice: "200.000đ/người lớn (Bao gồm tắm suối & trò chơi trên cây)",
    bestTimeToVisit: "Tháng 4 đến tháng 9",
    readTime: "5 phút đọc",
    highlights: [
      "Công viên trò chơi trên cây giữa rừng nguyên sinh đầu tiên và dài nhất Việt Nam (800m)",
      "Hệ thống cầu gỗ đi bộ uốn lượn xuyên rừng dài hàng cây số check-in siêu đẹp",
      "Tắm suối Ozo mát lạnh tự nhiên và thưởng thức bữa tiệc rừng nướng thơm phức",
    ],
    sections: [
      {
        heading: "1. Thử thách lòng can đảm với hệ thống trò chơi trên cây Ozo",
        content: "Với diện tích gần 5ha nằm trọn trong lòng rừng nguyên sinh, Công viên Ozo sở hữu chuỗi trò chơi liên hoàn trên cây gồm 16 chặng thử thách: đi cầu thăng bằng, đu dây zipline qua tán rừng, bước chân ninja và trượt ván trên không. Mỗi du khách đều được trang bị đai bảo hộ đạt chuẩn châu Âu dưới sự giám sát chặt chẽ của các huấn luyện viên chuyên nghiệp.",
        tips: ["Du khách nên mặc trang phục thể thao năng động, giày thể thao ôm chân để thuận tiện leo trèo và vận động."],
      },
      {
        heading: "2. Thuê taxi trọn gói từ Đồng Hới đi Công viên Ozo",
        content: "Cung đường 20 Quyết Thắng dẫn vào Công viên Ozo là một trong những cung đường rừng đẹp nhất miền Trung. Để tận hưởng trọn vẹn cảnh sắc mà không lo lắng về tay lái đường đèo dốc, thuê taxi gia đình 4 - 7 chỗ của Taxi Quảng Trị 24H là lựa chọn tối ưu nhất. Xe luôn sạch sẽ thơm tho, tài xế rành đường và nhiệt tình giới thiệu các điểm dừng chân ngắm cảnh dọc đường.",
        tips: ["Hãy gọi Hotline 0877.669.555 để đặt xe đi và về, bác tài sẽ túc trực đón bạn ngay khi kết thúc chuyến vui chơi."],
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
    readTime: "6 phút đọc",
    highlights: [
      "Suối nước khoáng nóng lộ thiên duy nhất tại Việt Nam có nhiệt độ sôi tự nhiên 105°C",
      "Khu nghỉ dưỡng Bang Onsen Spa & Resort chuẩn Nhật Bản với hồ tắm khoáng đa dạng",
      "Trải nghiệm tự tay luộc trứng chín lòng đào bằng nguồn nước khoáng nguyên chất giàu vi chất",
    ],
    sections: [
      {
        heading: "1. Tác dụng diệu kỳ của nguồn khoáng nóng Bang đối với sức khỏe",
        content: "Nguồn khoáng nóng Bang chứa hàm lượng lưu huỳnh và các khoáng chất quý hiếm cao, có tác dụng trị liệu tuyệt vời cho các bệnh về xương khớp, da liễu và giúp phục hồi năng lượng tinh thần. Ngâm mình trong dòng khoáng nóng giữa thung lũng nguyên sinh xanh mát sẽ mang lại cảm giác thư thái tột cùng, xua tan mọi mệt mỏi sau những ngày làm việc căng thẳng.",
        tips: ["Không nên ngâm khoáng nóng quá 20 phút mỗi lần và cần bổ sung nước lọc ấm đầy đủ trước và sau khi tắm."],
      },
      {
        heading: "2. Hướng dẫn lộ trình di chuyển và thuê xe taxi từ Đồng Hới hoặc Đông Hà",
        content: "Suối Bang thuộc huyện Lệ Thủy, nằm gần ranh giới giữa Quảng Bình và Quảng Trị. Du khách từ TP. Đồng Hới (khoảng 60km) hoặc TP. Đông Hà (khoảng 70km) đều có thể di chuyển bằng đường tránh QL1A hoặc đường Hồ Chí Minh Đông rất thuận tiện. Taxi Quảng Trị 24H chuyên nhận hợp đồng đưa đón khách đi nghỉ dưỡng Suối Bang, đưa đón tận nhà đúng giờ với chi phí trọn gói hợp lý.",
        tips: ["Có thể kết hợp ghé thăm Nhà lưu niệm Đại tướng Võ Nguyên Giáp tại làng An Xá, Lệ Thủy trên đường đi."],
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
    readTime: "5 phút đọc",
    highlights: [
      "Đón nhanh sau 5 phút tại sảnh đến Sân bay Đồng Hới, có biển đón tên nếu yêu cầu",
      "Giá cước niêm yết rõ ràng chỉ từ 12.000đ/km, không thu thêm phí phụ trội sân bay",
      "Nhận chạy thẳng từ sân bay lên các khách sạn tại Động Phong Nha chỉ 45 phút",
    ],
    sections: [
      {
        heading: "1. Bảng giá cước Taxi từ Sân bay Đồng Hới đi các địa điểm nổi tiếng",
        content: "Khoảng cách từ Sân bay Đồng Hới về trung tâm thành phố (các khách sạn trên đường Trương Pháp, Quách Xuân Kỳ, Lý Thường Kiệt) chỉ khoảng 6-8km với giá cước taxi 4 chỗ dao động từ 80.000đ đến 100.000đ. Nếu du khách có kế hoạch đi thẳng lên Phong Nha (45km), giá trọn gói chỉ khoảng 450.000đ - 540.000đ cho xe 4 chỗ và 650.000đ cho xe 7 chỗ rộng rãi.",
        tips: ["Đặt xe trước khi máy bay cất cánh, tài xế sẽ theo dõi lịch trình chuyến bay thực tế để căn giờ có mặt chính xác ngay khi bạn hạ cánh."],
      },
      {
        heading: "2. Cách nhận biết và tránh taxi dù chèo kéo tại sảnh sân bay",
        content: "Vào các khung giờ cao điểm có nhiều chuyến bay hạ cánh cùng lúc, khu vực ngoài sảnh thường có hiện tượng tài xế chèo kéo khách với giá mập mờ hoặc chạy lòng vòng bấm đồng hồ sai lệch. Để đảm bảo an toàn và chuyến đi thoải mái, hãy liên hệ tổng đài Taxi Quảng Trị - Quảng Bình 24H qua Hotline 0877.669.555 hoặc Zalo 0398.567.070 để được điều xe biển số rõ ràng và báo giá trọn gói trước khi khởi hành.",
        tips: ["Lưu lại số hotline 0877.669.555 vào danh bạ trước chuyến bay để gọi ngay khi vừa bật điện thoại."],
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
 * Tự động tạo bài viết chuẩn SEO mới (sử dụng Gemini AI nếu có key, hoặc kho chủ đề chuyên sâu)
 */
export async function generateAndPublishSeoArticle(customTopic?: string): Promise<{
  success: boolean;
  guide?: TravelGuide;
  message: string;
}> {
  try {
    const existingGuides = await getAllTravelGuidesAsync();
    const existingSlugs = new Set(existingGuides.map((g) => g.slug));

    let chosenSeed: TopicSeed | null = null;

    // 1. Nếu có Gemini API Key và người dùng yêu cầu chủ đề tùy chỉnh -> sinh bằng Gemini AI
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && customTopic) {
      const aiGenerated = await generateWithGemini(geminiKey, customTopic);
      if (aiGenerated) {
        chosenSeed = aiGenerated;
      }
    }

    // 2. Nếu chưa có chosenSeed -> tìm chủ đề tiếp theo trong kho chưa từng được đăng
    if (!chosenSeed) {
      const availableSeeds = SEO_TOPICS_DATABASE.filter((s) => !existingSlugs.has(s.slug));
      if (availableSeeds.length > 0) {
        // Chọn bài tiếp theo chưa đăng
        chosenSeed = availableSeeds[0];
      } else {
        // Nếu đã đăng hết -> chọn ngẫu nhiên 1 bài và tạo phiên bản cập nhật 2026 mới
        const randomSeed = SEO_TOPICS_DATABASE[Math.floor(Math.random() * SEO_TOPICS_DATABASE.length)];
        const timestamp = Date.now().toString().slice(-4);
        chosenSeed = {
          ...randomSeed,
          slug: `${randomSeed.slug}-${timestamp}`,
          title: `${randomSeed.title.replace(/2026/g, "").trim()} Mới Nhất 2026`,
          publishedDate: new Date().toISOString().split("T")[0],
        };
      }
    }

    if (!chosenSeed) {
      return { success: false, message: "Không tìm thấy chủ đề phù hợp để xuất bản bài viết!" };
    }

    // Chuẩn hóa thành TravelGuide đầy đủ
    const newGuide: TravelGuide = {
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
      readTime: chosenSeed.readTime || "6 phút đọc",
      rating: 5.0,
      reviewsCount: Math.floor(Math.random() * 50) + 110,
      highlights: chosenSeed.highlights,
      gallery: chosenSeed.gallery || [],
      sections: chosenSeed.sections,
      faqs: chosenSeed.faqs,
    };

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
      message: `Đã tự động xuất bản bài viết '${newGuide.title}' thành công và thông báo qua Telegram!`,
    };
  } catch (error: any) {
    console.error("Error generating and publishing SEO article:", error);
    return { success: false, message: error.message || "Lỗi tạo bài viết AI" };
  }
}

/**
 * Gọi Google Gemini API để tạo bài viết du lịch chuẩn SEO
 */
async function generateWithGemini(apiKey: string, promptTopic: string): Promise<TopicSeed | null> {
  const prompt = `
Bạn là chuyên gia SEO hàng đầu và người am hiểu sâu sắc về du lịch Quảng Bình & Quảng Trị.
Hãy viết một bài viết cẩm nang du lịch và dịch vụ xe taxi chuẩn SEO chi tiết về chủ đề: "${promptTopic}".
Yêu cầu trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown code block hoặc text nào khác) với cấu trúc sau:
{
  "slug": "chu-de-khong-dau-ngan-gon",
  "title": "Tiêu đề hấp dẫn chuẩn SEO 2026 có từ khóa chính",
  "metaTitle": "Tiêu đề hiển thị Google < 65 ký tự",
  "metaDescription": "Đoạn mô tả SEO 150-160 ký tự",
  "excerpt": "Đoạn tóm tắt mở đầu 2-3 câu",
  "category": "Kinh Nghiệm Du Lịch" hoặc "Di Tích Lịch Sử Tâm Linh" hoặc "Điểm Đến Nổi Tiếng",
  "coverImage": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
  "destination": "Tên địa danh cụ thể",
  "distanceFromDongHoi": "Khoảng cách và thời gian đi từ Đồng Hới",
  "taxiFare4Seats": "Giá xe 4 chỗ (VD: 450.000 VNĐ)",
  "taxiFare6Seats": "Giá xe 7 chỗ (VD: 600.000 VNĐ)",
  "ticketPrice": "Giá vé tham quan thực tế",
  "bestTimeToVisit": "Tháng mấy",
  "readTime": "6 phút đọc",
  "highlights": ["Điểm nổi bật 1", "Điểm nổi bật 2", "Điểm nổi bật 3"],
  "sections": [
    {
      "heading": "1. Giới thiệu tổng quan",
      "content": "Nội dung chi tiết 200-300 từ...",
      "tips": ["Mẹo hữu ích 1"]
    },
    {
      "heading": "2. Hướng dẫn di chuyển bằng Taxi Quảng Trị - Quảng Bình 24H",
      "content": "Nội dung chi tiết về cách đi lại, cam kết giá rẻ chỉ từ 12.000đ/km, xe mới đón nhanh...",
      "tips": ["Mẹo đặt xe trước"]
    }
  ],
  "faqs": [
    {
      "question": "Câu hỏi thường gặp 1?",
      "answer": "Trả lời câu hỏi 1 chi tiết"
    },
    {
      "question": "Câu hỏi thường gặp 2?",
      "answer": "Trả lời câu hỏi 2 chi tiết"
    }
  ]
}
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2500,
          },
        }),
      }
    );

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Gemini API generation error:", err);
    return null;
  }
}
