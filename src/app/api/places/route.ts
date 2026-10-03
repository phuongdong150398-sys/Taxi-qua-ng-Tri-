import { NextResponse } from "next/server";

// Danh mục địa điểm phổ biến tại Quảng Bình, Quảng Trị và lân cận
const KNOWN_PLACES = [
  { name: "Động Phong Nha", address: "Xã Sơn Trạch, Bố Trạch, Quảng Bình", lat: 17.5898, lng: 106.2828, tags: ["phong nha", "dong phong nha", "hang phong nha"] },
  { name: "Động Thiên Đường", address: "Vườn quốc gia Phong Nha - Kẻ Bàng, Bố Trạch, Quảng Bình", lat: 17.5190, lng: 106.2230, tags: ["thien duong", "dong thien duong"] },
  { name: "Suối Nước Moọc", address: "Xã Phúc Trạch, Bố Trạch, Quảng Bình", lat: 17.5458, lng: 106.2625, tags: ["suoi mooc", "suoi nuoc mooc", "mooc"] },
  { name: "Sông Chày - Hang Tối", address: "Xã Sơn Trạch, Bố Trạch, Quảng Bình", lat: 17.5645, lng: 106.2575, tags: ["song chay", "hang toi", "song chay hang toi"] },
  { name: "Thung Lũng Ngọc Hava", address: "Xã Sơn Trạch, Bố Trạch, Quảng Bình", lat: 17.5580, lng: 106.2600, tags: ["hava", "thung lung hava", "thung lung ngoc hava"] },
  { name: "Công Viên Rừng Ozo (Ozo Park)", address: "Tân Trạch, Bố Trạch, Quảng Bình", lat: 17.5100, lng: 106.2900, tags: ["ozo", "cong vien ozo", "ozo park", "rung ozo"] },
  { name: "Vũng Chùa Đảo Yến (Mộ Đại Tướng Võ Nguyên Giáp)", address: "Xã Quảng Đông, Quảng Trạch, Quảng Bình", lat: 17.9150, lng: 106.4780, tags: ["vung chua", "dao yen", "mo dai tuong", "vo nguyen giap"] },
  { name: "Bãi Tắm Đá Nhảy", address: "Xã Thanh Trạch, Bố Trạch, Quảng Bình", lat: 17.6980, lng: 106.5250, tags: ["da nhay", "bai tam da nhay", "bien da nhay"] },
  { name: "Đồi Cát Quang Phú", address: "Xã Quang Phú, TP. Đồng Hới, Quảng Bình", lat: 17.5150, lng: 106.6180, tags: ["doi cat", "quang phu", "doi cat quang phu"] },
  { name: "Suối Khe Nước Lạnh", address: "Xã Ngân Thủy, Lệ Thủy - Quảng Ninh, Quảng Bình", lat: 17.3100, lng: 106.6300, tags: ["khe nuoc lanh", "suoi khe nuoc lanh"] },
  { name: "TP. Đồng Hới (Trung tâm)", address: "TP. Đồng Hới, Quảng Bình", lat: 17.4696, lng: 106.6225, tags: ["dong hoi", "tp dong hoi", "trung tam dong hoi", "dong hoi city"] },
  { name: "Sân Bay Đồng Hới (VDH)", address: "Xã Lộc Ninh, TP. Đồng Hới, Quảng Bình", lat: 17.5153, lng: 106.5908, tags: ["san bay dong hoi", "san bay", "vdh"] },
  { name: "Ga Đồng Hới", address: "Tiểu khu 4, Phường Nam Lý, TP. Đồng Hới, Quảng Bình", lat: 17.4725, lng: 106.6075, tags: ["ga dong hoi", "ga tau dong hoi"] },
  { name: "Biển Nhật Lệ", address: "Đường Trương Pháp, Phường Hải Thành, TP. Đồng Hới, Quảng Bình", lat: 17.4850, lng: 106.6300, tags: ["nhat le", "bien nhat le", "bai bien nhat le"] },
  { name: "Biển Bảo Ninh", address: "Xã Bảo Ninh, TP. Đồng Hới, Quảng Bình", lat: 17.4650, lng: 106.6380, tags: ["bao ninh", "bien bao ninh"] },
  { name: "Thị Xã Ba Đồn", address: "Thị xã Ba Đồn, Quảng Bình", lat: 17.7550, lng: 106.4250, tags: ["ba don", "tx ba don"] },
  { name: "Huyện Lệ Thủy (Chùa Hoằng Phúc, Nhà Đại Tướng)", address: "Huyện Lệ Thủy, Quảng Bình", lat: 17.2150, lng: 106.7850, tags: ["le thuy", "huyen le thuy", "kien giang"] },
  { name: "TP. Đông Hà (Trung tâm)", address: "TP. Đông Hà, Quảng Trị", lat: 16.8167, lng: 107.1000, tags: ["dong ha", "tp dong ha", "quang tri"] },
  { name: "Ga Đông Hà", address: "Đường Lê Thánh Tôn, Đông Lễ, TP. Đông Hà, Quảng Trị", lat: 16.8210, lng: 107.0950, tags: ["ga dong ha", "ga tau dong ha"] },
  { name: "Thị Xã Quảng Trị", address: "Thị xã Quảng Trị, Quảng Trị", lat: 16.7450, lng: 107.1850, tags: ["tx quang tri", "thi xa quang tri"] },
  { name: "Thành Cổ Quảng Trị", address: "Phường 2, Thị xã Quảng Trị, Quảng Trị", lat: 16.7510, lng: 107.1920, tags: ["thanh co", "thanh co quang tri"] },
  { name: "Thánh Địa La Vang", address: "Xã Hải Phú, Hải Lăng, Quảng Trị", lat: 16.7050, lng: 107.1950, tags: ["la vang", "thanh dia la vang", "duc me la vang"] },
  { name: "Cửa Khẩu Quốc Tế Lao Bảo", address: "Thị trấn Lao Bảo, Hướng Hóa, Quảng Trị", lat: 16.6150, lng: 106.5850, tags: ["lao bao", "cua khau lao bao", "ql9"] },
  { name: "Thị Trấn Khe Sanh", address: "Huyện Hướng Hóa, Quảng Trị", lat: 16.6300, lng: 106.7300, tags: ["khe sanh", "tt khe sanh", "huong hoa"] },
  { name: "Nghĩa Trang Trường Sơn", address: "Xã Vĩnh Trường, Gio Linh, Quảng Trị", lat: 16.9550, lng: 106.9850, tags: ["nghia trang truong son", "truong son"] },
  { name: "Địa Đạo Vịnh Mốc", address: "Xã Kim Thạch, Vĩnh Linh, Quảng Trị", lat: 17.0700, lng: 107.1100, tags: ["vinh moc", "dia dao vinh moc"] },
  { name: "Biển Cửa Tùng", address: "Thị trấn Cửa Tùng, Vĩnh Linh, Quảng Trị", lat: 17.0200, lng: 107.1000, tags: ["cua tung", "bien cua tung"] },
  { name: "Biển Cửa Việt", address: "Thị trấn Cửa Việt, Gio Linh, Quảng Trị", lat: 16.8950, lng: 107.1800, tags: ["cua viet", "bien cua viet"] },
  { name: "Sân Bay Phú Bài (Huế)", address: "Thị xã Hương Thủy, Thừa Thiên Huế", lat: 16.4010, lng: 107.7020, tags: ["san bay phu bai", "phu bai", "hue airport"] },
  { name: "TP. Huế (Trung tâm)", address: "TP. Huế, Thừa Thiên Huế", lat: 16.4637, lng: 107.5909, tags: ["hue", "tp hue", "thua thien hue"] },
  { name: "Sân Bay Đà Nẵng", address: "Hải Châu, Đà Nẵng", lat: 16.0538, lng: 108.2022, tags: ["san bay da nang", "da nang airport"] },
  { name: "TP. Đà Nẵng", address: "TP. Đà Nẵng", lat: 16.0544, lng: 108.2022, tags: ["da nang", "tp da nang"] },
];

function removeVietnameseTones(str: string) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str.toLowerCase().trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ suggestions: KNOWN_PLACES.slice(0, 8) });
  }

  const cleanQuery = removeVietnameseTones(query);

  // 1. Search in our curated local places list
  const localMatches = KNOWN_PLACES.filter((p) => {
    const cleanName = removeVietnameseTones(p.name);
    const cleanAddress = removeVietnameseTones(p.address);
    const tagMatch = p.tags?.some((t) => removeVietnameseTones(t).includes(cleanQuery));
    return cleanName.includes(cleanQuery) || cleanAddress.includes(cleanQuery) || tagMatch;
  });

  // 2. Search OpenStreetMap Nominatim for Vietnam locations
  let osmMatches: any[] = [];
  try {
    const encoded = encodeURIComponent(query + ", Việt Nam");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=vn&limit=5&addressdetails=1`,
      {
        headers: {
          "User-Agent": "TaxiQuangTriApp/1.0",
        },
        next: { revalidate: 3600 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      osmMatches = data.map((item: any) => ({
        name: item.name || item.display_name.split(",")[0],
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
    }
  } catch (err) {
    // Ignore external geocoding errors
  }

  // Combine and deduplicate
  const combined = [...localMatches, ...osmMatches];
  const unique = Array.from(new Map(combined.map((item) => [item.name + item.lat, item])).values());

  return NextResponse.json({
    suggestions: unique.slice(0, 8),
  });
}
