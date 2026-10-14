"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Check,
  Image as ImageIcon,
  Sparkles,
  Link2,
  Loader2,
  Upload,
  Globe,
  Camera,
} from "lucide-react";
import ArticleImage from "@/components/ui/ArticleImage";
import { TravelImageResult } from "@/lib/imageSearchService";

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, caption?: string) => void;
  initialQuery?: string;
  modalTitle?: string;
}

const QUICK_TAGS = [
  "Biển Nhật Lệ Đồng Hới",
  "Cầu Nhật Lệ Bảo Ninh",
  "Tượng đài Mẹ Suốt",
  "Quảng Bình Quan",
  "Bãi Đá Nhảy Bố Trạch",
  "Động Phong Nha Kẻ Bàng",
  "Động Thiên Đường",
  "Hang Sơn Đoòng",
  "Suối Nước Moọc",
  "Thung lũng Hava Sông Chày",
  "Bánh bột lọc Mệ Xuân",
  "Cháo canh cá lóc Đồng Hới",
];

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelectImage,
  initialQuery = "Biển Nhật Lệ",
  modalTitle = "Chọn Hình Ảnh Cho Bài Viết",
}: ImagePickerModalProps) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [images, setImages] = useState<TravelImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "upload" | "custom">("search");

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [uploadCaption, setUploadCaption] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Link State
  const [customUrl, setCustomUrl] = useState("");
  const [customCaption, setCustomCaption] = useState("");

  const handleSearch = async (termToSearch: string) => {
    if (!termToSearch.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(termToSearch.trim())}&limit=16`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setImages(data.data);
      }
    } catch (e) {
      console.error("Failed to load travel images:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const query = initialQuery || "Biển Nhật Lệ";
      setSearchTerm(query);
      handleSearch(query);
    }
  }, [isOpen, initialQuery]);

  // Xử lý nén ảnh ở Client để tải lên nhanh và mượt mà
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1080;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        let compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);
        if (compressedDataUrl.length > 700000) {
          compressedDataUrl = canvas.toDataURL("image/jpeg", 0.65);
        }
        setUploadPreview(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!uploadPreview) return;
    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataUrl: uploadPreview,
          fileName: uploadFile?.name || "photo.jpg",
          caption: uploadCaption,
        }),
      });

      const data = await res.json();
      if (data.success && data.url) {
        onSelectImage(data.url, uploadCaption || uploadFile?.name);
        onClose();
        // Reset state
        setUploadFile(null);
        setUploadPreview("");
        setUploadCaption("");
      } else {
        alert("Lỗi tải ảnh lên: " + (data.message || "Không xác định"));
      }
    } catch (err: any) {
      alert("Lỗi kết nối khi tải ảnh: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#07172C] border border-[#133863] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#133863] bg-[#040E1C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{modalTitle}</h3>
              <p className="text-[11px] text-slate-400">
                Tìm ảnh đẹp chất lượng cao từ Google Du Lịch hoặc tải ảnh thực tế từ thiết bị của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#133863] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#133863] bg-[#0B2240] px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("search")}
            className={`py-2 px-4 rounded-t-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "search"
                ? "bg-[#07172C] text-amber-400 border-t border-x border-[#133863]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Tìm Ảnh Du Lịch Đẹp (Google & Web)</span>
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`py-2 px-4 rounded-t-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "upload"
                ? "bg-[#07172C] text-amber-400 border-t border-x border-[#133863]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tải Ảnh Từ Máy / Điện Thoại</span>
          </button>

          <button
            onClick={() => setActiveTab("custom")}
            className={`py-2 px-4 rounded-t-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "custom"
                ? "bg-[#07172C] text-amber-400 border-t border-x border-[#133863]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Dán Link Trực Tiếp</span>
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: GOOGLE & TRAVEL WEB SEARCH */}
          {activeTab === "search" && (
            <>
              {/* Search bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(searchTerm);
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nhập địa danh cần tìm ảnh đẹp (VD: Biển Nhật Lệ, Cầu Nhật Lệ, Động Phong Nha...)"
                    className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#040E1C] font-black text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Tìm ảnh HD</span>
                </button>
              </form>

              {/* Quick tags */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Địa danh nổi tiếng:</span>
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchTerm(tag);
                      handleSearch(tag);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
                      searchTerm === tag
                        ? "bg-amber-500 text-[#040E1C] border-amber-400 font-bold"
                        : "bg-[#040E1C] text-slate-300 border-[#133863] hover:border-amber-400/50 hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Image Grid */}
              {loading ? (
                <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-xs font-semibold">Đang tìm ảnh du lịch chất lượng cao...</span>
                </div>
              ) : images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
                  {images.map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-[#040E1C] rounded-2xl overflow-hidden border border-[#133863] hover:border-amber-400 shadow-lg flex flex-col transition"
                    >
                      <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-900">
                        <ArticleImage
                          src={item.thumbUrl || item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-[#040E1C]/80 backdrop-blur-sm text-[9px] text-amber-300 font-bold border border-[#133863]">
                          {item.source === "google"
                            ? "Google HD"
                            : item.source === "travel_web"
                            ? "Báo Du Lịch"
                            : "Bản Địa"}
                        </div>
                      </div>

                      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight font-medium" title={item.caption}>
                          {item.caption || item.title}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectImage(item.url, item.caption || item.title);
                            onClose();
                          }}
                          className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-[11px] flex items-center justify-center gap-1 shadow transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Chọn ảnh này</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Chưa tìm thấy ảnh phù hợp</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Quý khách có thể thử chọn các danh lam thắng cảnh phổ biến bên dưới hoặc tải ảnh trực tiếp từ thiết bị:
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    {["Biển Nhật Lệ Đồng Hới", "Bãi Đá Nhảy Bố Trạch", "Động Phong Nha Kẻ Bàng", "Đồi cát Quang Phú"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSearchTerm(tag);
                          handleSearch(tag);
                        }}
                        className="text-xs px-3 py-1.5 rounded-xl bg-[#040E1C] border border-[#133863] text-amber-400 hover:border-amber-400 transition cursor-pointer font-semibold"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("upload")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-600/20"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Chuyển sang Tab: Tải ảnh từ máy / điện thoại</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    💡 Mẹo: Nếu muốn tìm kiếm toàn bộ ảnh trên Google, quản trị viên có thể thêm Google Search API Key vào hệ thống.
                  </p>
                </div>
              )}
            </>
          )}

          {/* TAB 2: UPLOAD FROM DEVICE */}
          {activeTab === "upload" && (
            <div className="max-w-xl mx-auto py-4 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!uploadPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#133863] hover:border-amber-400 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#040E1C]/60 hover:bg-[#040E1C] transition group"
                >
                  <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Bấm vào đây để chọn ảnh từ máy tính hoặc điện thoại</h4>
                    <p className="text-xs text-slate-400 mt-1">Hỗ trợ định dạng JPG, PNG, WEBP (tự động tối ưu dung lượng)</p>
                  </div>
                  <button
                    type="button"
                    className="mt-2 px-5 py-2 rounded-xl bg-[#0B2240] border border-[#133863] text-amber-400 font-bold text-xs"
                  >
                    Chọn tệp hình ảnh
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative h-60 rounded-2xl overflow-hidden border border-[#133863] bg-slate-900 group">
                    <img src={uploadPreview} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadFile(null);
                        setUploadPreview("");
                      }}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 text-white hover:bg-red-600 transition"
                      title="Chọn ảnh khác"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-200 block mb-1">
                      Chú thích ảnh (tùy chọn):
                    </label>
                    <input
                      type="text"
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder="VD: Xe taxi 7 chỗ đón khách tại Sân bay Đồng Hới..."
                      className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-4 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-3 rounded-2xl bg-[#040E1C] border border-[#133863] text-slate-300 font-bold text-xs hover:bg-[#0B2240] transition"
                    >
                      Chọn ảnh khác
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={handleUploadSubmit}
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#040E1C] font-black text-xs shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang tải lên...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Tải Lên &amp; Áp Dụng Ngay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOM URL */}
          {activeTab === "custom" && (
            <div className="space-y-4 max-w-xl mx-auto py-4">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Đường dẫn ảnh (URL trực tiếp):
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://... (link ảnh từ bất kỳ trang web nào)"
                  className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Chú thích ảnh (Caption):
                </label>
                <input
                  type="text"
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  placeholder="VD: Khách du lịch chụp ảnh kỷ niệm tại bãi biển Nhật Lệ"
                  className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              {customUrl && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold block">Xem trước ảnh:</label>
                  <div className="h-44 rounded-2xl overflow-hidden border border-[#133863] bg-slate-900">
                    <ArticleImage src={customUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!customUrl.trim()}
                onClick={() => {
                  if (customUrl.trim()) {
                    onSelectImage(customUrl.trim(), customCaption.trim());
                    onClose();
                  }
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-xs shadow-xl transition disabled:opacity-50 cursor-pointer"
              >
                Áp dụng ảnh này cho bài viết
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
