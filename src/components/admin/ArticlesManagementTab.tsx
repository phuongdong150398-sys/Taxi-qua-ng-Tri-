"use client";

import { useState, useEffect } from "react";
import { TravelGuide } from "@/data/travelGuides";
import ArticleImage from "@/components/ui/ArticleImage";
import ImagePickerModal from "@/components/admin/ImagePickerModal";
import { upgradeToHttps } from "@/lib/textSanitizer";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  Eye,
  Sparkles,
  ExternalLink,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  X,
  Save,
  HelpCircle,
  Tag,
  Route,
  ImageIcon,
  ListPlus,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Key,
} from "lucide-react";

export default function ArticlesManagementTab() {
  const [guides, setGuides] = useState<TravelGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<"basic" | "pricing" | "content" | "gallery" | "faqs">("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Wikimedia Image Picker Modal State
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<{
    type: "cover" | "section" | "gallery";
    sectionIndex?: number;
    galleryIndex?: number;
    initialQuery?: string;
  }>({ type: "cover", initialQuery: "Biển Nhật Lệ" });

  // AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResultMsg, setAiResultMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("admin_gemini_api_key") || "";
      if (storedKey) setGeminiApiKey(storedKey);
    }
  }, []);

  // Form State
  const defaultFormState: TravelGuide = {
    slug: "",
    title: "",
    metaTitle: "",
    metaDescription: "",
    excerpt: "",
    category: "Di Sản Thiên Nhiên Thế Giới",
    coverImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    destination: "",
    distanceFromDongHoi: "45 km (khoảng 45 - 50 phút đi xe)",
    taxiFare4Seats: "540.000 VNĐ",
    taxiFare6Seats: "680.000 VNĐ",
    ticketPrice: "150.000đ/người lớn",
    bestTimeToVisit: "Tháng 3 đến tháng 9",
    author: "Đội Ngũ Hướng Dẫn Bản Địa Taxi 24H",
    publishedDate: new Date().toISOString().split("T")[0],
    readTime: "6 phút đọc",
    rating: 5.0,
    reviewsCount: 120,
    highlights: [
      "Không gian thiên nhiên trong lành, cảnh quan kỳ vĩ",
      "Dịch vụ taxi đưa đón tận nơi chu đáo, an toàn 24/7",
    ],
    sections: [
      {
        heading: "1. Giới thiệu tổng quan về điểm đến",
        content: "Nằm trong quần thể danh lam thắng cảnh nổi tiếng của tỉnh Quảng Bình, nơi đây mang vẻ đẹp tự nhiên hoang sơ say đắm lòng người...",
        tips: ["Nên đặt xe trước 1 ngày vào mùa cao điểm để được giữ xe đẹp."],
      },
      {
        heading: "2. Hướng dẫn di chuyển và cước taxi trọn gói",
        content: "Khoảng cách từ trung tâm TP. Đồng Hới khá thuận tiện cho việc di chuyển bằng xe ô tô gia đình hoặc taxi du lịch đời mới...",
        tips: ["Đặt khứ hồi 2 chiều để được ưu đãi giảm giá chiều về tới 50%."],
      },
    ],
    faqs: [
      {
        question: "Từ Đồng Hới đi taxi mất bao lâu và giá cước bao nhiêu?",
        answer: "Thời gian di chuyển khoảng 45 - 50 phút. Xe 4 chỗ và 7 chỗ đón tận nơi phục vụ 24/7.",
      },
    ],
  };

  const [formData, setFormData] = useState<TravelGuide>(defaultFormState);

  // Load articles
  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/travel-guides?t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setGuides(data.data);
      }
    } catch (e) {
      console.error("Error loading travel guides:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  // Tự động mở Modal chỉnh sửa bài viết khi truy cập từ link Telegram (?tab=articles&edit=slug)
  useEffect(() => {
    if (typeof window !== "undefined" && guides.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const editSlug = params.get("edit");
      if (editSlug) {
        const found = guides.find((g) => g.slug === editSlug);
        if (found) {
          handleOpenEditModal(found);
          // Xóa param edit khỏi URL sau khi đã mở để tránh lặp lại khi đóng modal hoặc tải lại danh sách
          const url = new URL(window.location.href);
          url.searchParams.delete("edit");
          window.history.replaceState({}, "", url.toString());
        }
      }
    }
  }, [guides]);

  // Kích hoạt AI viết bài tự động
  const handleTriggerAiGeneration = async () => {
    setIsAiGenerating(true);
    setAiResultMsg(null);
    try {
      if (typeof window !== "undefined" && geminiApiKey.trim()) {
        localStorage.setItem("admin_gemini_api_key", geminiApiKey.trim());
      }
      const res = await fetch("/api/cron/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopicInput.trim() || undefined,
          apiKey: geminiApiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiResultMsg({
          type: "success",
          text: `✓ ${data.message || "Đã xuất bản bài viết thành công!"}`,
        });
        await fetchGuides();
        if (data.guide) {
          setTimeout(() => {
            setShowAiModal(false);
            setAiTopicInput("");
            setAiResultMsg(null);
            handleOpenEditModal(data.guide);
          }, 1500);
        }
      } else {
        setAiResultMsg({
          type: "error",
          text: data.message || "Lỗi khi kích hoạt AI tạo bài viết!",
        });
      }
    } catch (err: any) {
      setAiResultMsg({
        type: "error",
        text: "Lỗi kết nối máy chủ khi tạo bài viết AI.",
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Filter list
  const categories = Array.from(new Set(guides.map((g) => g.category).filter(Boolean)));

  const filteredGuides = guides.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === "all" || g.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Auto-generate Slug from Title
  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleOpenCreateModal = () => {
    setEditingSlug(null);
    setFormData({
      ...defaultFormState,
      publishedDate: new Date().toISOString().split("T")[0],
    });
    setModalTab("basic");
    setSaveMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (guide: TravelGuide) => {
    setEditingSlug(guide.slug);
    setFormData(JSON.parse(JSON.stringify(guide)));
    setModalTab("basic");
    setSaveMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg(null);

    if (!formData.title.trim() || !formData.destination.trim()) {
      setSaveMsg({ type: "error", text: "Vui lòng nhập đầy đủ Tiêu đề bài viết và Tên điểm đến!" });
      return;
    }

    let slug = formData.slug.trim();
    if (!slug) {
      slug = generateSlugFromTitle(formData.title);
    }

    const payload: TravelGuide = {
      ...formData,
      slug,
      metaTitle: formData.metaTitle || formData.title,
      metaDescription: formData.metaDescription || formData.excerpt,
    };

    setIsSaving(true);
    try {
      const res = await fetch("/api/travel-guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg({ type: "success", text: "✓ Đã lưu và xuất bản bài viết thành công!" });
        fetchGuides();
        setTimeout(() => {
          setIsModalOpen(false);
          setSaveMsg(null);
        }, 1000);
      } else {
        setSaveMsg({ type: "error", text: data.message || "Lỗi khi lưu bài viết!" });
      }
    } catch (err) {
      setSaveMsg({ type: "error", text: "Lỗi kết nối khi gửi dữ liệu!" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async (guide: TravelGuide) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${guide.title}" không?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/travel-guides?slug=${encodeURIComponent(guide.slug)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("✓ Đã xóa bài viết thành công!");
        fetchGuides();
      } else {
        alert("✕ Không thể xóa: " + data.message);
      }
    } catch (e) {
      alert("✕ Lỗi kết nối khi xóa bài viết!");
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm("Khôi phục danh sách bài viết về mặc định ban đầu? (Các chỉnh sửa tùy biến có thể bị ghi đè)")) {
      return;
    }

    try {
      const res = await fetch("/api/travel-guides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✓ Đã khôi phục dữ liệu bài viết mặc định!");
        fetchGuides();
      }
    } catch (e) {
      alert("✕ Lỗi khi khôi phục dữ liệu!");
    }
  };

  // Section / FAQ / Highlight helpers
  const handleAddHighlight = () => {
    setFormData({
      ...formData,
      highlights: [...(formData.highlights || []), ""],
    });
  };

  const handleUpdateHighlight = (idx: number, val: string) => {
    const list = [...(formData.highlights || [])];
    list[idx] = val;
    setFormData({ ...formData, highlights: list });
  };

  const handleRemoveHighlight = (idx: number) => {
    const list = formData.highlights.filter((_, i) => i !== idx);
    setFormData({ ...formData, highlights: list });
  };

  const handleAddSection = () => {
    const nextIdx = (formData.sections?.length || 0) + 1;
    setFormData({
      ...formData,
      sections: [
        ...(formData.sections || []),
        {
          heading: `${nextIdx}. Tiêu đề mục mới`,
          content: "Nội dung chi tiết của phần này...",
          tips: [],
        },
      ],
    });
  };

  const handleUpdateSection = (
    idx: number,
    field: "heading" | "content" | "image" | "imageCaption",
    val: string
  ) => {
    const list = [...(formData.sections || [])];
    list[idx] = { ...list[idx], [field]: val };
    setFormData({ ...formData, sections: list });
  };

  const handleAddTipToSection = (sectionIdx: number) => {
    const list = [...(formData.sections || [])];
    const tips = list[sectionIdx].tips || [];
    list[sectionIdx] = { ...list[sectionIdx], tips: [...tips, ""] };
    setFormData({ ...formData, sections: list });
  };

  const handleUpdateTip = (sectionIdx: number, tipIdx: number, val: string) => {
    const list = [...(formData.sections || [])];
    const tips = [...(list[sectionIdx].tips || [])];
    tips[tipIdx] = val;
    list[sectionIdx] = { ...list[sectionIdx], tips };
    setFormData({ ...formData, sections: list });
  };

  const handleRemoveTip = (sectionIdx: number, tipIdx: number) => {
    const list = [...(formData.sections || [])];
    const tips = (list[sectionIdx].tips || []).filter((_, i) => i !== tipIdx);
    list[sectionIdx] = { ...list[sectionIdx], tips };
    setFormData({ ...formData, sections: list });
  };

  const handleRemoveSection = (idx: number) => {
    const list = formData.sections.filter((_, i) => i !== idx);
    setFormData({ ...formData, sections: list });
  };

  // Gallery helpers
  const handleAddGalleryItem = () => {
    setFormData({
      ...formData,
      gallery: [...(formData.gallery || []), { url: "", caption: "" }],
    });
  };

  const handleUpdateGalleryItem = (idx: number, field: "url" | "caption", val: string) => {
    const list = [...(formData.gallery || [])];
    const safeVal = field === "url" ? upgradeToHttps(val) : val;
    list[idx] = { ...list[idx], [field]: safeVal };
    setFormData({ ...formData, gallery: list });
  };

  const handleRemoveGalleryItem = (idx: number) => {
    const list = (formData.gallery || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, gallery: list });
  };

  // Image Picker Helpers
  const openImagePicker = (
    type: "cover" | "section" | "gallery",
    initialQuery: string = "",
    sectionIndex?: number,
    galleryIndex?: number
  ) => {
    // Làm sạch tiền tố dạng "1. ", "Mục 2: " để tìm kiếm ảnh chính xác hơn
    const cleanQuery = (initialQuery || "")
      .replace(/^(\d+[\.\:\-]\s*|phần\s*\d+[\.\:\-]\s*|mục\s*\d+[\.\:\-]\s*)/i, "")
      .trim();

    setImagePickerTarget({
      type,
      sectionIndex,
      galleryIndex,
      initialQuery: cleanQuery || formData.destination || formData.title || "Biển Nhật Lệ",
    });
    setImagePickerOpen(true);
  };

  const handleImageSelected = (url: string, caption?: string) => {
    const safeUrl = upgradeToHttps(url);
    if (imagePickerTarget.type === "cover") {
      setFormData((prev) => ({ ...prev, coverImage: safeUrl }));
      setSaveMsg({
        type: "success",
        text: "✓ Đã áp dụng ảnh bìa mới! Hãy bấm 'LƯU & XUẤT BẢN NGAY' ở bên dưới để hoàn tất lưu.",
      });
    } else if (imagePickerTarget.type === "section" && typeof imagePickerTarget.sectionIndex === "number") {
      const sIdx = imagePickerTarget.sectionIndex;
      setFormData((prev) => {
        const nextSections = [...(prev.sections || [])];
        if (nextSections[sIdx]) {
          nextSections[sIdx] = {
            ...nextSections[sIdx],
            image: safeUrl,
            imageCaption: caption || nextSections[sIdx].imageCaption || "",
          };
        } else {
          nextSections[sIdx] = {
            heading: `${sIdx + 1}. Phần nội dung`,
            content: "",
            image: safeUrl,
            imageCaption: caption || "",
          };
        }
        return { ...prev, sections: nextSections };
      });
      setSaveMsg({
        type: "success",
        text: `✓ Đã áp dụng ảnh cho mục #${sIdx + 1}! Hãy bấm 'LƯU & XUẤT BẢN NGAY' ở bên dưới để hoàn tất lưu.`,
      });
    } else if (imagePickerTarget.type === "gallery") {
      setFormData((prev) => {
        const nextGallery = [...(prev.gallery || [])];
        if (typeof imagePickerTarget.galleryIndex === "number" && nextGallery[imagePickerTarget.galleryIndex]) {
          nextGallery[imagePickerTarget.galleryIndex] = {
            ...nextGallery[imagePickerTarget.galleryIndex],
            url: safeUrl,
            caption: caption || nextGallery[imagePickerTarget.galleryIndex].caption || "",
          };
        } else {
          nextGallery.push({ url: safeUrl, caption: caption || "" });
        }
        return { ...prev, gallery: nextGallery };
      });
      setSaveMsg({
        type: "success",
        text: "✓ Đã thêm ảnh vào bộ sưu tập! Hãy bấm 'LƯU & XUẤT BẢN NGAY' ở bên dưới để hoàn tất lưu.",
      });
    }
  };

  const handleAddFaq = () => {
    setFormData({
      ...formData,
      faqs: [...(formData.faqs || []), { question: "", answer: "" }],
    });
  };

  const handleUpdateFaq = (idx: number, field: "question" | "answer", val: string) => {
    const list = [...(formData.faqs || [])];
    list[idx] = { ...list[idx], [field]: val };
    setFormData({ ...formData, faqs: list });
  };

  const handleRemoveFaq = (idx: number) => {
    const list = formData.faqs.filter((_, i) => i !== idx);
    setFormData({ ...formData, faqs: list });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#07172C] border border-[#133863] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEO CONTENT MANAGEMENT SYSTEM (CMS)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Quản Lý Cẩm Nang &amp; Bài Viết SEO Du Lịch
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Tạo mới, chỉnh sửa thông tin giá vé, cước taxi, câu hỏi thường gặp FAQs và tối ưu Google Rich Snippets cho các danh lam thắng cảnh Quảng Bình.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-purple-500/20 hover:scale-105 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>✨ AI Viết Bài Tự Động</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm Bài Viết Mới</span>
          </button>

          <a
            href="/cam-nang-du-lich"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#0B2240] hover:bg-[#133863] border border-[#133863] text-slate-200 hover:text-white text-xs sm:text-sm font-bold transition"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>Xem Trang Hub</span>
          </a>

          <button
            onClick={fetchGuides}
            disabled={loading}
            className="p-3 rounded-2xl bg-[#040E1C] hover:bg-[#0B2240] border border-[#133863] text-slate-300 hover:text-white transition cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#07172C] p-4 rounded-2xl border border-[#133863]">
          <div className="text-xs text-slate-400 font-semibold">Tổng số bài viết</div>
          <div className="text-2xl font-black text-white mt-1 font-mono">{guides.length}</div>
        </div>
        <div className="bg-[#07172C] p-4 rounded-2xl border border-[#133863]">
          <div className="text-xs text-slate-400 font-semibold">Danh mục chủ đề</div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{categories.length}</div>
        </div>
        <div className="bg-[#07172C] p-4 rounded-2xl border border-[#133863]">
          <div className="text-xs text-slate-400 font-semibold">Đánh giá trung bình</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono flex items-center gap-1">
            <Star className="w-5 h-5 fill-emerald-400 text-emerald-400" />
            <span>4.9 / 5.0</span>
          </div>
        </div>
        <div className="bg-[#07172C] p-4 rounded-2xl border border-[#133863]">
          <div className="text-xs text-slate-400 font-semibold">Schema Rich Snippets</div>
          <div className="text-sm font-black text-blue-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tự Động 100%</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#07172C] p-4 rounded-2xl border border-[#133863] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết, điểm đến, slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#040E1C] border border-[#133863] text-white rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:border-amber-400 focus:outline-none"
          >
            <option value="all">Tất cả danh mục ({guides.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={handleResetToDefaults}
            className="text-[11px] text-slate-400 hover:text-amber-400 px-3 py-2 rounded-xl bg-[#040E1C] border border-[#133863] transition"
            title="Khôi phục 6 bài viết gốc"
          >
            Mặc định
          </button>
        </div>
      </div>

      {/* Articles Grid View */}
      {loading ? (
        <div className="text-center py-12 bg-[#07172C] rounded-3xl border border-[#133863]">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Đang tải danh sách bài viết...</p>
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="text-center py-12 bg-[#07172C] rounded-3xl border border-[#133863] space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">Không tìm thấy bài viết nào phù hợp</p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-[#040E1C] font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bài viết ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <div
              key={guide.slug}
              className="bg-[#07172C] rounded-3xl border border-[#133863] hover:border-amber-400/50 overflow-hidden shadow-xl flex flex-col justify-between group transition"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <ArticleImage
                    src={guide.coverImage}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07172C] via-transparent to-black/30" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-amber-500 text-[#040E1C] text-[10px] font-black uppercase shadow">
                    {guide.category}
                  </span>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-[#040E1C]/85 text-amber-400 text-[10px] font-bold border border-[#133863] flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{guide.rating.toFixed(1)}</span>
                  </div>
                  <div className="absolute bottom-2.5 left-3 text-[11px] font-bold text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>{guide.destination}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{guide.readTime}</span>
                    <span>•</span>
                    <span>Cập nhật: {guide.publishedDate}</span>
                  </div>

                  <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                    {guide.title}
                  </h3>

                  <div className="bg-[#040E1C] p-2.5 rounded-xl border border-[#133863] text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Cự ly từ Đồng Hới:</span>
                      <span className="font-bold text-slate-200">{guide.distanceFromDongHoi.split("(")[0]}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Cước taxi 4 chỗ:</span>
                      <span className="font-bold text-amber-400 font-mono">{guide.taxiFare4Seats}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    URL: /cam-nang-du-lich/{guide.slug}
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="p-4 bg-[#040E1C]/60 border-t border-[#133863] flex items-center justify-between gap-2">
                <a
                  href={`/cam-nang-du-lich/${guide.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0B2240] hover:bg-[#133863] text-slate-200 hover:text-white text-xs font-bold transition"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Xem</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(guide)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400 hover:text-[#040E1C] border border-amber-400/40 text-amber-400 text-xs font-bold transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>

                  <button
                    onClick={() => handleDeleteArticle(guide)}
                    className="p-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-200 transition cursor-pointer"
                    title="Xóa bài viết"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: AI TỰ ĐỘNG VIẾT BÀI CHUẨN SEO */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#07172C] border-2 border-purple-500/50 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
            <div className="p-5 sm:p-6 border-b border-[#133863] flex items-center justify-between bg-[#040E1C]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase">
                    AI Viết Bài Chuẩn SEO Tự Động
                  </h3>
                  <p className="text-xs text-purple-300">
                    Sử dụng Google Gemini AI &amp; Kho chủ đề du lịch Quảng Bình - Quảng Trị
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isAiGenerating) setShowAiModal(false);
                }}
                className="p-2 rounded-xl bg-[#0B2240] text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tiêu chuẩn Mẫu Vàng được áp dụng */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/40 text-xs space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-400 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Tiêu Chuẩn Mẫu Vàng 6 Phần (Thành Cổ Quảng Trị Style):</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>6 phần nội dung chuyên sâu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Ảnh minh họa &amp; chú thích từng phần</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Lịch trình Tour 1 ngày (07:30 - 17:30)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Bộ sưu tập ảnh Gallery (4-5 ảnh)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Cẩm nang 4-5 món ẩm thực bản địa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Dịch vụ Taxi 24H &amp; Hotline tổng đài</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#040E1C] border border-blue-500/30 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Đã kích hoạt Lịch chạy tự động mỗi ngày (Vercel Cron 08:00 AM)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Hàng ngày vào lúc <b>08:00 sáng</b>, hệ thống sẽ tự động xuất bản 1 bài viết chuẩn SEO mới và gửi thông báo kèm link xem &amp; nút chỉnh sửa về Telegram của bạn.
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">
                    Nhập chủ đề muốn AI viết ngay (Tùy chọn):
                  </label>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    🎯 Trọng tâm Quảng Bình &amp; Đội xe TP. Đồng Hới
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="VD: Taxi Sân bay Đồng Hới, Động Thiên Đường, Suối Moọc, Biển Nhật Lệ..."
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  disabled={isAiGenerating}
                  className="w-full bg-[#040E1C] border border-[#133863] focus:border-purple-400 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none"
                />

                {/* Gợi ý chủ đề nhanh Quảng Bình & Đồng Hới */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Chủ đề gợi ý:</span>
                  {[
                    "Taxi Sân bay Đồng Hới ✈️",
                    "Động Thiên Đường & Suối Moọc 🏞️",
                    "Động Phong Nha & Hang Tối 🚣",
                    "Biển Nhật Lệ & Đồi cát Quang Phú 🏖️",
                    "Mộ Đại Tướng (Vũng Chùa) & Đá Nhảy 🙏",
                    "Taxi Ga xe lửa Đồng Hới 🚆",
                    "Suối Bang Onsen Lệ Thủy ♨️",
                    "Food Tour ẩm thực Đồng Hới 🍜",
                  ].map((topic) => {
                    const clean = topic.replace(/[✈️🏞️🚣🏖️🙏🚆♨️🍜]/g, "").trim();
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setAiTopicInput(clean)}
                        className="text-[10px] bg-[#0B2240] hover:bg-[#133863] text-amber-300 hover:text-white px-2 py-1 rounded-lg border border-[#133863] transition cursor-pointer"
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  💡 <i>Nếu để trống, AI sẽ tự động chọn chủ đề đón tiễn taxi &amp; danh thắng hot nhất tại Quảng Bình &amp; TP. Đồng Hới.</i>
                </p>
              </div>

              {/* Tùy chọn cấu hình Gemini API Key */}
              <div className="rounded-xl border border-[#133863] bg-[#040E1C] p-3 text-xs">
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className="flex items-center justify-between w-full text-slate-400 hover:text-white transition font-medium text-left cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                    <span>Cấu hình Google Gemini API Key (Tùy chọn)</span>
                    {geminiApiKey ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        ✓ Đã nhập Key riêng
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        ✓ Gemini 2.5 Flash Tích Hợp Sẵn
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-purple-300">{showKeyConfig ? "▲ Thu gọn" : "▼ Cài đặt"}</span>
                </button>
                {showKeyConfig && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#133863] space-y-2">
                    <input
                      type="password"
                      placeholder="Mặc định sử dụng GEMINI_API_KEY hệ thống (Dán key mới nếu muốn đổi)"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="w-full bg-[#07172C] border border-[#133863] focus:border-purple-400 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      💡 <i>Lấy API Key miễn phí tại <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-purple-400 underline font-semibold">aistudio.google.com</a>. Nếu để trống, hệ thống sẽ tự động sử dụng Động cơ Kiến thức Du lịch Chuẩn Vàng tích hợp sẵn 100% chuẩn mẫu Thành Cổ Quảng Trị.</i>
                    </p>
                  </div>
                )}
              </div>

              {aiResultMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold text-center ${
                    aiResultMsg.type === "success"
                      ? "bg-emerald-950/80 border border-emerald-700 text-emerald-300"
                      : "bg-red-950/80 border border-red-700 text-red-300"
                  }`}
                >
                  {aiResultMsg.text}
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6 border-t border-[#133863] bg-[#040E1C] flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAiModal(false)}
                disabled={isAiGenerating}
                className="px-5 py-2.5 rounded-xl bg-[#0B2240] hover:bg-[#133863] text-slate-300 text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-50"
              >
                Đóng
              </button>
              <button
                onClick={handleTriggerAiGeneration}
                disabled={isAiGenerating}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-purple-600/30 transition cursor-pointer disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Tạo &amp; Đăng Bài...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Kích Hoạt AI Viết Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-FEATURED ARTICLE EDITOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#07172C] border-2 border-amber-500/50 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#133863] flex items-center justify-between bg-[#040E1C]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase">
                    {editingSlug ? "CHỈNH SỬA BÀI VIẾT CẨM NANG" : "THÊM BÀI VIẾT CẨM NANG MỚI"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Điền đầy đủ thông tin để bài viết tự động tối ưu hóa SEO Google và hiển thị trên website.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-[#0B2240] text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="bg-[#0B2240] px-6 py-2 border-b border-[#133863] flex space-x-2 overflow-x-auto">
              {[
                { id: "basic", label: "1. Thông Tin Cơ Bản & Ảnh Bìa" },
                { id: "pricing", label: "2. Cự Ly & Cước Taxi" },
                { id: "content", label: "3. Nội Dung Chi Tiết" },
                { id: "gallery", label: "4. Bộ Sưu Tập Ảnh" },
                { id: "faqs", label: "5. FAQs & SEO Google" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalTab(tab.id as any)}
                  className={`py-1.5 px-3.5 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
                    modalTab === tab.id
                      ? "bg-amber-400 text-[#040E1C] font-black shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveArticle} className="flex-1 overflow-y-auto p-6 space-y-6">
              {saveMsg && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    saveMsg.type === "success"
                      ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
                      : "bg-red-950 border border-red-800 text-red-300"
                  }`}
                >
                  {saveMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{saveMsg.text}</span>
                </div>
              )}

              {/* TAB 1: BASIC INFO & IMAGE */}
              {modalTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block mb-1">
                      Tiêu đề bài viết (*):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Kinh Nghiệm Du Lịch Động Phong Nha 2026: Giá Vé &amp; Thuê Xe Taxi"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData({
                          ...formData,
                          title,
                          slug: formData.slug || generateSlugFromTitle(title),
                          metaTitle: formData.metaTitle || title,
                        });
                      }}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-200 block mb-1">
                        Tên điểm đến / Thắng cảnh (*):
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Động Phong Nha"
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-200 block mb-1">
                        Danh mục chủ đề:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Di Sản Thiên Nhiên Thế Giới"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-200">
                        Đường dẫn URL (Slug không dấu):
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, slug: generateSlugFromTitle(formData.title) })}
                        className="text-[10px] text-amber-400 hover:underline font-bold"
                      >
                        ⚡ Tự động tạo slug
                      </button>
                    </div>
                    <div className="flex items-center bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-xs font-mono">
                      <span className="text-slate-500">/cam-nang-du-lich/</span>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="kinh-nghiem-du-lich-dong-phong-nha"
                        className="bg-transparent text-amber-400 flex-1 focus:outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-200">
                        Ảnh đại diện bài viết (Cover Image):
                      </label>
                      <button
                        type="button"
                        onClick={() => openImagePicker("cover", formData.destination || formData.title || "Biển Nhật Lệ")}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>🔍 Tìm ảnh Google &amp; Tải từ máy</span>
                      </button>
                    </div>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                    />
                    {formData.coverImage && (
                      <div className="mt-2.5 relative h-40 sm:h-48 rounded-2xl overflow-hidden border border-[#133863] group">
                        <ArticleImage src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition duration-300">
                          <button
                            type="button"
                            onClick={() => openImagePicker("cover", formData.destination || formData.title || "Biển Nhật Lệ")}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#040E1C] font-black text-xs flex items-center gap-1.5 shadow-lg"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Thay đổi ảnh bìa</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-200 block mb-1">
                      Đoạn tóm tắt mở đầu (Excerpt Lead):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Đoạn mô tả ngắn gọn giới thiệu về vẻ đẹp và sự hấp dẫn của điểm đến..."
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-200 block mb-1">Tác giả:</label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-200 block mb-1">Thời gian đọc:</label>
                      <input
                        type="text"
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                        className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-200 block mb-1">Ngày xuất bản:</label>
                      <input
                        type="date"
                        value={formData.publishedDate}
                        onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                        className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & ROUTE */}
              {modalTab === "pricing" && (
                <div className="space-y-4">
                  <div className="bg-[#040E1C] p-4 rounded-2xl border border-amber-500/30 text-xs text-slate-300">
                    💡 <strong>Mẹo:</strong> Giá cước taxi này sẽ được hiển thị trên bảng giá nổi bật trong bài viết và gắn trực tiếp vào nút đặt xe của khách hàng.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-200 block mb-1">
                        Khoảng cách từ TP. Đồng Hới:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 45 km (khoảng 45 - 50 phút đi xe)"
                        value={formData.distanceFromDongHoi}
                        onChange={(e) => setFormData({ ...formData, distanceFromDongHoi: e.target.value })}
                        className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-4 py-2.5 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-200 block mb-1">
                        Thời điểm tham quan lý tưởng:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Tháng 3 đến tháng 9 (Mùa khô nắng đẹp)"
                        value={formData.bestTimeToVisit}
                        onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                        className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-4 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-amber-400 block mb-1">
                        Cước Taxi 4 - 5 Chỗ (Sedan/VF5):
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 540.000 VNĐ"
                        value={formData.taxiFare4Seats}
                        onChange={(e) => setFormData({ ...formData, taxiFare4Seats: e.target.value })}
                        className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-amber-400 font-black font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-amber-300 block mb-1">
                        Cước Taxi 6 - 7 Chỗ (MPV/VF7/VF8):
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 680.000 VNĐ"
                        value={formData.taxiFare6Seats}
                        onChange={(e) => setFormData({ ...formData, taxiFare6Seats: e.target.value })}
                        className="w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-black font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-200 block mb-1">
                      Giá vé tham quan &amp; dịch vụ tại điểm đến:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 150.000đ/người lớn (Thuyền sông Son: 550.000đ/thuyền)"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                      className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-4 py-2.5 text-sm text-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: CONTENT & SECTIONS */}
              {modalTab === "content" && (
                <div className="space-y-6">
                  {/* Highlights Checklist */}
                  <div className="bg-[#040E1C] p-4 rounded-2xl border border-[#133863] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Điểm nổi bật của chuyến đi (Checklist):</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm dòng
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.highlights || []).map((h, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={h}
                            onChange={(e) => handleUpdateHighlight(hIdx, e.target.value)}
                            placeholder="VD: Chiêm ngưỡng dòng sông ngầm dài nhất thế giới..."
                            className="flex-1 bg-[#07172C] border border-[#133863] rounded-xl px-3 py-2 text-xs text-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(hIdx)}
                            className="p-2 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Article Content Sections */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white uppercase">
                        Các phần nội dung bài viết (Sections):
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddSection}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-[#0B2240] px-3 py-1.5 rounded-xl border border-[#133863] hover:bg-[#133863]"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm phần nội dung
                      </button>
                    </div>

                    {(formData.sections || []).map((sec, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-[#040E1C] p-4 sm:p-5 rounded-2xl border border-[#133863] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-400 uppercase">
                            Mục #{sIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sIdx)}
                            className="text-xs text-red-400 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa mục này
                          </button>
                        </div>

                        <div>
                          <label className="text-xs text-slate-300 font-bold block mb-1">
                            Tiêu đề mục con:
                          </label>
                          <input
                            type="text"
                            value={sec.heading}
                            onChange={(e) => handleUpdateSection(sIdx, "heading", e.target.value)}
                            placeholder="VD: 1. Giới thiệu về Động Phong Nha"
                            className="w-full bg-[#07172C] border border-[#133863] rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-300 font-bold block mb-1">
                            Nội dung chi tiết (hỗ trợ xuống dòng):
                          </label>
                          <textarea
                            rows={4}
                            value={sec.content}
                            onChange={(e) => handleUpdateSection(sIdx, "content", e.target.value)}
                            placeholder="Viết nội dung hướng dẫn chi tiết ở đây..."
                            className="w-full bg-[#07172C] border border-[#133863] rounded-xl p-3 text-xs sm:text-sm text-slate-200 leading-relaxed"
                          />
                        </div>

                        {/* Section Image & Caption with Wikimedia Picker */}
                        <div className="bg-[#07172C] p-3.5 rounded-2xl border border-[#133863] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4 text-amber-400" />
                              <span>Hình ảnh minh họa cho mục này:</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => openImagePicker("section", sec.heading || formData.destination || "Quảng Bình", sIdx)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-[#040E1C] px-2.5 py-1 rounded-lg border border-amber-500/30 transition cursor-pointer"
                            >
                              <span>🔍 Tìm ảnh Google &amp; Tải từ máy</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block mb-1">Đường dẫn ảnh (URL):</label>
                              <input
                                type="text"
                                value={sec.image || ""}
                                onChange={(e) => handleUpdateSection(sIdx, "image", e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block mb-1">Chú thích ảnh:</label>
                              <input
                                type="text"
                                value={sec.imageCaption || ""}
                                onChange={(e) => handleUpdateSection(sIdx, "imageCaption", e.target.value)}
                                placeholder="VD: Khung cảnh thực tế tại điểm tham quan..."
                                className="w-full bg-[#040E1C] border border-[#133863] rounded-xl px-3 py-1.5 text-xs text-white"
                              />
                            </div>
                          </div>

                          {sec.image && (
                            <div className="relative h-32 rounded-xl overflow-hidden border border-[#133863] group">
                              <ArticleImage src={sec.image} alt={sec.imageCaption || sec.heading} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <button
                                  type="button"
                                  onClick={() => openImagePicker("section", sec.heading || formData.destination || "Quảng Bình", sIdx)}
                                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-[#040E1C] font-black text-xs flex items-center gap-1 shadow cursor-pointer"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  <span>Đổi ảnh này</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tips */}
                        <div className="pt-2 border-t border-[#133863]/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-emerald-400 font-bold">
                              💡 Mẹo của bác tài (tùy chọn):
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddTipToSection(sIdx)}
                              className="text-[11px] text-emerald-400 hover:underline"
                            >
                              + Thêm mẹo
                            </button>
                          </div>

                          {(sec.tips || []).map((tip, tIdx) => (
                            <div key={tIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tip}
                                onChange={(e) => handleUpdateTip(sIdx, tIdx, e.target.value)}
                                placeholder="VD: Mang theo áo khoác mỏng vì nhiệt độ trong hang 18 độ C..."
                                className="flex-1 bg-[#07172C] border border-[#133863] rounded-xl px-3 py-1.5 text-xs text-slate-300"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveTip(sIdx, tIdx)}
                                className="text-red-400 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PHOTO GALLERY (BỘ SƯU TẬP ẢNH) */}
              {modalTab === "gallery" && (
                <div className="space-y-4">
                  {/* Banner hướng dẫn phân biệt vị trí ảnh */}
                  <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl text-xs text-amber-200 flex items-start gap-3 shadow-md">
                    <span className="text-xl leading-none flex-shrink-0">💡</span>
                    <div className="space-y-1">
                      <div className="font-black text-amber-300 text-sm uppercase">Lưu ý phân biệt vị trí hiển thị ảnh:</div>
                      <p className="leading-relaxed text-slate-200 font-medium">
                        Các ảnh tại tab này là <strong className="text-amber-400">Bộ Sưu Tập Hình Ảnh (Gallery)</strong> hiển thị ở khối album cuối chân trang bài viết.
                        Nếu bạn muốn thay đổi ảnh minh họa xuất hiện xen kẽ giữa các đoạn văn (Ví dụ: mục Ẩm thực, Di tích lịch sử, Lộ trình tour...), vui lòng bấm sang <strong className="text-amber-400">Tab 3. Nội Dung Chi Tiết</strong> để đổi ảnh cho từng mục tương ứng!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                        <span>Bộ Sưu Tập Hình Ảnh Về Điểm Đến (Gallery):</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Hiển thị dạng album ảnh đặc sắc góc nhìn đẹp tại cuối bài viết.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openImagePicker("gallery", formData.destination || "Quảng Bình")}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-[#0B2240] px-3 py-1.5 rounded-xl border border-amber-500/40 hover:bg-[#133863] cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> <span>🔍 Tìm ảnh Google &amp; Tải từ máy</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddGalleryItem}
                        className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#0B2240] px-3 py-1.5 rounded-xl border border-[#133863] hover:bg-[#133863] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> <span>Thêm ô ảnh</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(formData.gallery || []).map((img, gIdx) => (
                      <div
                        key={gIdx}
                        className="bg-[#040E1C] p-4 rounded-2xl border border-[#133863] space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-400">Ảnh #{gIdx + 1}</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openImagePicker("gallery", img.caption || formData.destination || "Quảng Bình", undefined, gIdx)}
                                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                              >
                                <ImageIcon className="w-3 h-3" /> Đổi ảnh
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryItem(gIdx)}
                                className="text-xs text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {img.url ? (
                            <div className="h-36 rounded-xl overflow-hidden border border-[#133863]">
                              <ArticleImage src={img.url} alt={img.caption || `Ảnh ${gIdx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div
                              onClick={() => openImagePicker("gallery", formData.destination || "Quảng Bình", undefined, gIdx)}
                              className="h-36 rounded-xl border border-dashed border-[#133863] hover:border-amber-400 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-amber-400 cursor-pointer transition"
                            >
                              <ImageIcon className="w-6 h-6" />
                              <span className="text-xs font-bold">Bấm để chọn ảnh từ Wikimedia</span>
                            </div>
                          )}

                          <div>
                            <label className="text-[10px] text-slate-400 font-medium block mb-1">Link ảnh:</label>
                            <input
                              type="text"
                              value={img.url}
                              onChange={(e) => handleUpdateGalleryItem(gIdx, "url", e.target.value)}
                              placeholder="https://..."
                              className="w-full bg-[#07172C] border border-[#133863] rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 font-medium block mb-1">Chú thích (Caption):</label>
                            <input
                              type="text"
                              value={img.caption || ""}
                              onChange={(e) => handleUpdateGalleryItem(gIdx, "caption", e.target.value)}
                              placeholder="VD: Cửa động nhìn từ trên cao..."
                              className="w-full bg-[#07172C] border border-[#133863] rounded-xl px-3 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: FAQS & SEO GOOGLE */}
              {modalTab === "faqs" && (
                <div className="space-y-6">
                  {/* FAQs list */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-amber-400" />
                          <span>Câu hỏi thường gặp FAQs (Google FAQ Schema):</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Tự động xuất hiện dạng câu hỏi xổ xuống trên kết quả tìm kiếm Google.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFaq}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-[#0B2240] px-3 py-1.5 rounded-xl border border-[#133863]"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi
                      </button>
                    </div>

                    {(formData.faqs || []).map((faq, fIdx) => (
                      <div key={fIdx} className="bg-[#040E1C] p-4 rounded-2xl border border-[#133863] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-400">Câu hỏi #{fIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(fIdx)}
                            className="text-xs text-red-400 hover:underline"
                          >
                            Xóa câu này
                          </button>
                        </div>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleUpdateFaq(fIdx, "question", e.target.value)}
                          placeholder="VD: Đi tour Phong Nha có cần đặt trước vé thuyền không?"
                          className="w-full bg-[#07172C] border border-[#133863] rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-bold"
                        />
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => handleUpdateFaq(fIdx, "answer", e.target.value)}
                          placeholder="Câu trả lời chi tiết và lời khuyên..."
                          className="w-full bg-[#07172C] border border-[#133863] rounded-xl p-3 text-xs sm:text-sm text-slate-200"
                        />
                      </div>
                    ))}
                  </div>

                  {/* SEO Meta Tags */}
                  <div className="bg-[#040E1C] p-5 rounded-2xl border border-[#133863] space-y-4">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      CẤU HÌNH THẺ SEO GOOGLE (META TAGS)
                    </h4>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        SEO Meta Title (Tiêu đề hiển thị Google):
                      </label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="VD: Kinh Nghiệm Du Lịch Động Phong Nha 2026 - Bảng Giá Taxi Trọn Gói"
                        className="w-full bg-[#07172C] border border-[#133863] rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        SEO Meta Description (Mô tả tìm kiếm):
                      </label>
                      <textarea
                        rows={3}
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        placeholder="Mô tả 150-160 ký tự thu hút người tìm kiếm bấm vào bài viết..."
                        className="w-full bg-[#07172C] border border-[#133863] rounded-xl p-3 text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-[#133863] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-[#040E1C] hover:bg-[#0B2240] text-slate-300 font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Đóng
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#040E1C] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Đang lưu bài viết..." : "LƯU & XUẤT BẢN NGAY"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wikimedia Commons Image Picker Modal */}
      <ImagePickerModal
        isOpen={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelectImage={handleImageSelected}
        initialQuery={imagePickerTarget.initialQuery || formData.destination || "Biển Nhật Lệ"}
        modalTitle={
          imagePickerTarget.type === "cover"
            ? "Chọn / Tải Ảnh Bìa Bài Viết (Google Du Lịch & Thiết Bị)"
            : imagePickerTarget.type === "section"
            ? `Chọn / Tải Ảnh Cho Mục #${(imagePickerTarget.sectionIndex ?? 0) + 1}`
            : "Chọn / Tải Ảnh Cho Bộ Sưu Tập (Gallery)"
        }
      />
    </div>
  );
}
