"use client";

import { useState, useEffect } from "react";
import { Search, X, Check, Image as ImageIcon, Sparkles, ExternalLink, Link2, Loader2 } from "lucide-react";
import ArticleImage from "@/components/ui/ArticleImage";
import { WikimediaImageResult } from "@/lib/wikimediaService";

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, caption?: string) => void;
  initialQuery?: string;
  modalTitle?: string;
}

const QUICK_TAGS = [
  "Biển Nhật Lệ",
  "Cầu Nhật Lệ",
  "Tượng đài Mẹ Suốt",
  "Quảng Bình Quan",
  "Bãi Đá Nhảy",
  "Động Phong Nha",
  "Động Thiên Đường",
  "Hang Sơn Đoòng",
  "Vũng Chùa Đảo Yến",
  "Bánh bột lọc",
  "Cháo canh Đồng Hới",
  "Ga Đồng Hới",
];

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelectImage,
  initialQuery = "Biển Nhật Lệ",
  modalTitle = "Chọn Hình Ảnh Thực Tế (Wikimedia Commons)",
}: ImagePickerModalProps) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [images, setImages] = useState<WikimediaImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"wikimedia" | "custom">("wikimedia");

  // Custom URL Tab
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
      console.error("Failed to load Wikimedia images:", e);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#07172C] border border-[#133863] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#133863] bg-[#040E1C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{modalTitle}</h3>
              <p className="text-[11px] text-slate-400">
                Tìm kiếm ảnh thực tế bản địa Quảng Bình qua Wikimedia Commons hoặc dán link ảnh tự chọn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#133863] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#133863] bg-[#0B2240] px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("wikimedia")}
            className={`py-2 px-4 rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === "wikimedia"
                ? "bg-[#07172C] text-amber-400 border-t border-x border-[#133863]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Kho Ảnh Thực Tế Wikimedia</span>
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`py-2 px-4 rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === "custom"
                ? "bg-[#07172C] text-amber-400 border-t border-x border-[#133863]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Dán Link Ảnh Trực Tiếp</span>
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === "wikimedia" && (
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
                    placeholder="Nhập tên địa danh (VD: Biển Nhật Lệ, Tượng đài Mẹ Suốt, Động Phong Nha...)"
                    className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#040E1C] font-black text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Tìm ảnh</span>
                </button>
              </form>

              {/* Quick tags */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Gợi ý nhanh:</span>
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchTerm(tag);
                      handleSearch(tag);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium ${
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
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-xs">Đang tìm kiếm ảnh thực tế từ Wikimedia Commons...</span>
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
                          {item.source === "curated" ? "✓ Thực tế Đồng Hới" : "Wikimedia"}
                        </div>
                      </div>

                      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight font-medium" title={item.caption}>
                          {item.caption || item.title}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectImage(item.url, item.caption);
                            onClose();
                          }}
                          className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-[11px] flex items-center justify-center gap-1 shadow transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Chọn ảnh này</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Không tìm thấy hình ảnh phù hợp. Quý khách vui lòng thử tìm kiếm với từ khóa khác hoặc chuyển sang tab &quot;Dán link ảnh trực tiếp&quot;.
                </div>
              )}
            </>
          )}

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
                  placeholder="https://... (link ảnh từ Wikimedia, Facebook, Google Drive...)"
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
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-xs shadow-xl transition disabled:opacity-50"
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
