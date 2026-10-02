# 🚕 Website Đặt Xe Taxi - Taxi Booking Landing Page

Website giới thiệu và đặt xe taxi trực tuyến hiện đại, tối ưu trải nghiệm trên điện thoại (Mobile-First), chuẩn SEO, tích hợp tính năng ước tính cước phí tự động, form đặt xe và nút gọi Hotline / Chat Zalo chuyển đổi cao.

---

## 🌟 Tính Năng Nổi Bật

1. **Giao diện Hero & Form Đặt Xe Trực Tuyến**:
   - Khách hàng chọn loại dịch vụ (Sân bay, Đi tỉnh, Nội thành, Tiện chuyến).
   - Chọn loại xe: 4 chỗ (Sedan), 7 chỗ (SUV/MPV), 16 chỗ, VIP Limousine.
   - Chọn chuyến 1 chiều / 2 chiều (khứ hồi giảm tới 50%).
   - Gợi ý nhanh các điểm đến và sân bay phổ biến.
   - Ước tính giá cước động hiển thị ngay trên form.
   - Hiệu ứng pháo hoa Confetti và Popup chi tiết xác nhận sau khi gửi.

2. **Bảng Giá & Bộ Tính Cước Tự Động (Interactive Fare Calculator)**:
   - Bảng giá cước theo km minh bạch, niêm yết cho từng phân khúc xe.
   - Khách có thể kéo thanh trượt km để tính giá chuyến đi tức thì.

3. **Danh Sách Dòng Xe (Fleet Showcase)**:
   - Hiển thị hình ảnh, số lượng hành khách, hành lý, tiện nghi (wifi, máy lạnh).
   - Nút bấm đặt ngay dòng xe yêu thích.

4. **Tuyến Đường Cố Định & Đưa Đón Sân Bay**:
   - Hà Nội ⇄ Sân Bay Nội Bài, TP.HCM ⇄ Sân Bay Tân Sơn Nhất, Hà Nội ⇄ Hải Phòng / Quảng Ninh, TP.HCM ⇄ Vũng Tàu, Đà Nẵng ⇄ Hội An,...

5. **Nút Tương Tác Nổi Đổi Màu / Rung Lắc (Floating Action Buttons)**:
   - Nút gọi Hotline màu đỏ có hiệu ứng sóng xung quanh và rung chuông.
   - Nút Chat Zalo mở ứng dụng Zalo ngay lập tức.
   - Thanh Action Bar cố định dưới đáy màn hình trên điện thoại giúp tối đa hóa tỷ lệ khách gọi điện.

6. **Trang Quản Lý Đơn Đặt Xe Dành Cho Quản Trị Viên (Admin Panel)**:
   - Truy cập tại đường dẫn: `/admin`.
   - Xem toàn bộ danh sách đơn đặt xe với thông tin chi tiết (Tên, SĐT, Điểm đón, Điểm đến, Thời gian, Loại xe, Ghi chú).
   - Gọi điện hoặc nhắn Zalo trực tiếp cho khách hàng chỉ với 1 click.
   - Cập nhật trạng thái chuyến đi: *Chờ xử lý* ➔ *Đã nhận chuyến* ➔ *Hoàn thành* ➔ *Hủy*.

---

## ⚙️ Hướng Dẫn Tùy Chỉnh Thông Tin (Hotline, Zalo, Bảng Giá)

Mọi thông tin về Số điện thoại, Zalo, Tên website, Địa chỉ, Bảng giá cước, Đội xe đều được gom lại tại **duy nhất một file cấu hình**:

📁 **`src/config/siteConfig.ts`**

```typescript
export const siteConfig = {
  name: "TAXI NHANH 24/7",
  hotline: "0987.654.321",         // Thay đổi số hiển thị
  hotlineFormatted: "0987654321",  // Thay đổi số để bấm gọi
  zalo: "0987654321",              // Thay đổi số Zalo
  zaloUrl: "https://zalo.me/0987654321",
  address: "...",
  // ...
};
```

---

## 🚀 Cách Chạy Dự Án

### 1. Khởi động môi trường phát triển (Dev Server):
```bash
npm run dev
```
Truy cập trình duyệt tại: [http://localhost:3000](http://localhost:3000)

### 2. Xem trang quản trị đơn đặt xe:
Truy cập: [http://localhost:3000/admin](http://localhost:3000/admin)

### 3. Build chạy sản phẩm thực tế (Production):
```bash
npm run build
npm run start
```
