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
 * Gọi Google Gemini API để tạo bài viết du lịch chuẩn SEO theo "MẪU CHUẨN VÀNG ĐẶC SẮC"
 * (Đầy đủ 6 phần chuyên sâu, ảnh minh họa từng phần, bộ sưu tập gallery, ẩm thực bản địa, tour 1 ngày và Taxi 24H)
 */
async function generateWithGemini(apiKey: string, promptTopic: string): Promise<TopicSeed | null> {
  const prompt = `
Bạn là chuyên gia biên tập nội dung du lịch và SEO hàng đầu, am hiểu sâu sắc về lịch sử, văn hóa và danh lam thắng cảnh tại Quảng Bình & Quảng Trị.
Hãy viết một bài viết cẩm nang du lịch và dịch vụ xe taxi chuẩn SEO ĐẶC SẮC NHẤT về chủ đề: "${promptTopic}".

BẮT BUỘC TUÂN THỦ "MẪU CHUẨN VÀNG" ĐÃ ĐƯỢC CHỦ XE DUYỆT SAU ĐÂY:
1. VĂN PHONG: Sâu sắc, hào hùng, giàu cảm xúc, thấm đượm giá trị văn hóa lịch sử, kết hợp mẹo thực tế bổ ích từ bác tài bản xứ.
2. CẤU TRÚC 6 PHẦN BẮT BUỘC:
   - Phần 1: Bối cảnh lịch sử hào hùng hoặc vẻ đẹp thiên nhiên kỳ vĩ (chi tiết số liệu, sự kiện, giá trị di sản, câu chuyện lay động lòng người).
   - Phần 2: Kiến trúc, vết tích chứng tích hoặc các điểm tham quan chi tiết bên trong di tích/thắng cảnh.
   - Phần 3: Trải nghiệm thi vị, thơ ca bất hủ, cảm xúc lắng đọng hoặc nghi thức tâm linh tri ân.
   - Phần 4: Gợi ý lịch trình Tour 1 ngày trọn vẹn theo khung giờ cụ thể (07:30 đến 17:30) kết nối với các điểm du lịch lân cận.
   - Phần 5: Cẩm nang ẩm thực đặc sản bản địa trứ danh (kể tên 4-5 món đặc sản độc đáo và cách thưởng thức chuẩn vị).
   - Phần 6: Dịch vụ Taxi Quảng Trị - Quảng Bình 24H: Tài xế bản xứ am hiểu lịch sử, xe sạch mát đời mới 4-7 chỗ, giá trọn gói từ 12.000đ/km, cam kết không phụ phí, Hotline 0877.669.555.
3. HÌNH ẢNH MINH HỌA: Mỗi phần (section) BẮT BUỘC phải có trường "image" (URL ảnh chất lượng cao) và "imageCaption" (chú thích ảnh chi tiết, cảm xúc).
4. BỘ SƯU TẬP ẢNH (GALLERY): Mảng "gallery" gồm 4-5 ảnh chụp các góc độ đặc sắc khác nhau của địa danh kèm "caption".
5. MẸO BÁC TÀI BẢN ĐỊA: Mỗi phần có 1-2 mẹo hữu ích từ kinh nghiệm lái xe thực tế (tips).
6. CÂU HỎI THƯỜNG GẶP (FAQS): 3 câu hỏi thực tế về thời gian di chuyển, giá cước taxi, trang phục và vé vào cổng.

Yêu cầu trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown code block hoặc text nào khác) với cấu trúc sau:
{
  "slug": "chu-de-khong-dau-ngan-gon",
  "title": "Tiêu đề hấp dẫn chuẩn SEO 2026 có từ khóa chính",
  "metaTitle": "Tiêu đề hiển thị Google < 65 ký tự",
  "metaDescription": "Đoạn mô tả SEO 150-160 ký tự",
  "excerpt": "Đoạn mở đầu truyền cảm hứng 2-3 câu sâu sắc",
  "category": "Di Tích Lịch Sử Tâm Linh" hoặc "Di Sản Thiên Nhiên Thế Giới" hoặc "Điểm Đến Du Lịch Hot",
  "coverImage": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
  "destination": "Tên địa danh cụ thể",
  "distanceFromDongHoi": "Khoảng cách và thời gian đi từ Đồng Hới",
  "taxiFare4Seats": "Giá xe 4 chỗ (VD: 650.000 VNĐ)",
  "taxiFare6Seats": "Giá xe 7 chỗ (VD: 800.000 VNĐ)",
  "ticketPrice": "Giá vé tham quan thực tế",
  "bestTimeToVisit": "Thời điểm đẹp nhất trong năm",
  "readTime": "8 phút đọc",
  "highlights": ["Điểm nổi bật 1", "Điểm nổi bật 2", "Điểm nổi bật 3", "Điểm nổi bật 4", "Điểm nổi bật 5"],
  "gallery": [
    { "url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", "caption": "Góc chụp 1" },
    { "url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80", "caption": "Góc chụp 2" },
    { "url": "https://images.unsplash.com/photo-1548625361-1979ad2d67ad?auto=format&fit=crop&w=800&q=80", "caption": "Góc chụp 3" },
    { "url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", "caption": "Góc chụp 4" }
  ],
  "sections": [
    {
      "heading": "1. Tiêu đề phần 1",
      "content": "Nội dung chi tiết 250-350 từ...",
      "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
      "imageCaption": "Chú thích ảnh phần 1",
      "tips": ["Mẹo hữu ích từ bác tài bản địa"]
    },
    {
      "heading": "2. Tiêu đề phần 2",
      "content": "Nội dung chi tiết 250-350 từ...",
      "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
      "imageCaption": "Chú thích ảnh phần 2",
      "tips": ["Mẹo phần 2"]
    },
    {
      "heading": "3. Tiêu đề phần 3",
      "content": "Nội dung chi tiết 250-350 từ...",
      "image": "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80",
      "imageCaption": "Chú thích ảnh phần 3",
      "tips": ["Mẹo phần 3"]
    },
    {
      "heading": "4. Gợi ý lịch trình Tour 1 Ngày chi tiết",
      "content": "Lịch trình theo các mốc giờ 07:30, 09:30, 11:30, 13:30, 15:30...",
      "image": "https://images.unsplash.com/photo-1548625361-1979ad2d67ad?auto=format&fit=crop&w=1000&q=80",
      "imageCaption": "Chú thích ảnh lịch trình tour",
      "tips": ["Mẹo đặt xe trọn gói khứ hồi"]
    },
    {
      "heading": "5. Thưởng thức đặc sản ẩm thực bản địa trứ danh",
      "content": "Giới thiệu 4-5 món đặc sản độc đáo và địa chỉ thưởng thức chuẩn vị...",
      "tips": ["Mẹo thưởng thức ẩm thực từ bác tài"]
    },
    {
      "heading": "6. Dịch vụ Taxi Quảng Trị - Quảng Bình 24H đưa đón chu đáo",
      "content": "Cam kết xe đời mới, giá từ 12.000đ/km, tài xế bản xứ am hiểu địa phương, Hotline 0877.669.555...",
      "tips": ["Mẹo liên hệ đặt xe trước để nhận ưu đãi chiều về tới 50%"]
    }
  ],
  "faqs": [
    { "question": "Câu hỏi 1?", "answer": "Trả lời câu hỏi 1 chi tiết" },
    { "question": "Câu hỏi 2?", "answer": "Trả lời câu hỏi 2 chi tiết" },
    { "question": "Câu hỏi 3?", "answer": "Trả lời câu hỏi 3 chi tiết" }
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
            maxOutputTokens: 3500,
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
