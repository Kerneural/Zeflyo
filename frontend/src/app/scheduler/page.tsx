"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Image as ImageIcon,
  Check,
  Globe,
  AlertTriangle,
  Loader2,
  Trash2,
  Sparkles,
  Plus,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Copy,
  Home,
  MessageSquare,
  Sliders,
  Activity,
  Bell,
  Power,
  RefreshCw,
  LogOut,
  HelpCircle,
  Send,
  X,
  Eye,
  Edit3,
  Pause,
  Play
} from "lucide-react";
import { syncCredits, handleApiCreditError } from "@/lib/credits";

interface Fanpage {
  id: number;
  user_id: string | number;
  fb_page_id: string;
  name: string;
  avatar_url: string | null;
  is_active: boolean;
}

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface ScheduledPost {
  id: number;
  user_id: string | number;
  fanpage_ids: number[];
  content: string;
  image_url: string | null;
  media_gallery?: MediaItem[];
  scheduled_at: string;
  status: "draft" | "pending" | "published" | "failed";
  error_log: string | null;
  created_at: string;
}

interface QueuePost {
  id: string;
  imageUrl: string;
  content: string;
  mediaGallery?: MediaItem[];
}

const promptPresets = [
  {
    label: "🎁 Tặng quà Minigame",
    topic: "Tổ chức chương trình Minigame đoán số may mắn nhận quà tri ân khách hàng thân thiết",
    goal: "Kích thích lượng tương tác (like, share, comment) cực lớn cho Fanpage và tặng voucher mua hàng 50K cho tất cả người tham gia"
  },
  {
    label: "💡 Mẹo vặt thời trang",
    topic: "Chia sẻ 3 mẹo phối đồ công sở cực hack dáng, thanh lịch nhưng vẫn trẻ trung cho chị em công sở bận rộn",
    goal: "Trao giá trị hữu ích về thời trang nhằm tạo lòng tin và khéo léo giới thiệu dòng sản phẩm sơ mi lụa mới ra mắt của shop"
  },
  {
    label: "🔥 Sale sập sàn 50%",
    topic: "Chương trình khuyến mãi lớn nhất năm: Siêu sale bùng nổ lên tới 50% toàn bộ sản phẩm hè tại cửa hàng",
    goal: "Thôi thúc khách hàng mua sắm gấp bằng cách giới thiệu mã voucher giới hạn, hotline đặt hàng và ưu tiên chốt đơn sớm"
  },
  {
    label: "📖 Kể chuyện khởi nghiệp",
    topic: "Câu chuyện hậu trường khởi nghiệp đầy chông gai và tâm huyết của đội ngũ sáng lập thương hiệu thời trang Zeflyo",
    goal: "Tạo sự đồng cảm sâu sắc, xây dựng mối quan hệ tin cậy dài lâu với khách hàng bằng triết lý Value-First tập trung vào chất lượng"
  }
];

interface TopicItem {
  id: number;
  title: string;
  status: "pending" | "generated" | "published" | "failed";
  generated_content: string | null;
  generated_image_url: string | null;
  fb_post_id: string | null;
  error_log: string | null;
  sort_order: number;
}

const POST_LENGTHS = [
  { value: "super_short", label: "Siêu ngắn", labelEn: "Super short" },
  { value: "short", label: "Ngắn", labelEn: "Short" },
  { value: "medium", label: "Trung bình", labelEn: "Medium" },
  { value: "full", label: "Đầy đủ", labelEn: "Full" },
  { value: "detailed", label: "Chi tiết", labelEn: "Detailed" },
];

const WRITING_STYLES = [
  { value: "professional", label: "Chuyên nghiệp", labelEn: "Professional" },
  { value: "humorous", label: "Hài hước", labelEn: "Humorous" },
  { value: "creative", label: "Sáng tạo", labelEn: "Creative" },
  { value: "emotional", label: "Cảm xúc", labelEn: "Emotional" },
  { value: "storytelling", label: "Kể chuyện", labelEn: "Storytelling" },
  { value: "advertising", label: "Quảng cáo", labelEn: "Advertising" },
  { value: "inspirational", label: "Truyền cảm hứng", labelEn: "Inspirational" },
];

const WEEKDAYS = [
  { value: 1, label: "T2", labelEn: "Mon" },
  { value: 2, label: "T3", labelEn: "Tue" },
  { value: 3, label: "T4", labelEn: "Wed" },
  { value: 4, label: "T5", labelEn: "Thu" },
  { value: 5, label: "T6", labelEn: "Fri" },
  { value: 6, label: "T7", labelEn: "Sat" },
  { value: 7, label: "CN", labelEn: "Sun" },
];

export default function PostScheduler() {
  return (
    <Suspense fallback={null}>
      <PostSchedulerContent />
    </Suspense>
  );
}

function PostSchedulerContent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [token, setToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("http://localhost");
  const [fanpages, setFanpages] = useState<Fanpage[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [activeTab, setActiveTab] = useState<"setup" | "list" | "automation">("setup");

  interface UserProfile {
    id: string | number;
    name: string;
    email: string;
    avatar: string | null;
  }
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<"en" | "vi">("vi");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [publishingId, setPublishingId] = useState<string | number | null>(null);
  const [logs, setLogs] = useState<Array<{ id: string; page: string; event: string; time: string; status: "success" | "pending" | "info" }>>([
    { id: "1", page: "Zeflyo Fashion", event: "Webhook handshake verified", time: "2 minutes ago", status: "success" },
    { id: "2", page: "Zeflyo Food & Beverage", event: "Auto-reply sent: 'Hi! Thank you for contacting...'", time: "5 minutes ago", status: "success" },
    { id: "3", page: "Tech Support", event: "AI Agent assigned to customer thread", time: "12 minutes ago", status: "info" }
  ]);

  // Form State
  const [setupName, setSetupName] = useState<string>("");
  const [queue, setQueue] = useState<QueuePost[]>([
    { id: "1", content: "", imageUrl: "" }
  ]);
  const [activeQueueIndex, setActiveQueueIndex] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState<string>("");

  // AI Generator state
  const [aiTopic, setAiTopic] = useState<string>("");
  const [aiTone, setAiTone] = useState<string>("Thân thiện");
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [aiGoal, setAiGoal] = useState<string>("");
  const [aiFramework, setAiFramework] = useState<string>("aida");
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [presets, setPresets] = useState(promptPresets);
  const [isLoadingPresets, setIsLoadingPresets] = useState<boolean>(false);
  const [businessNiche, setBusinessNiche] = useState<string>("");
  const [scheduleMode, setScheduleMode] = useState<"weekly" | "fixed">("weekly");
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(["08:00"]);
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 3, 5]); // 1 = Mon, ..., 7 = Sun
  const [scheduleDate, setScheduleDate] = useState<string>("");

  // Extra options
  const [includeContactInfo, setIncludeContactInfo] = useState<boolean>(false);
  const [contactText, setContactText] = useState<string>("📞 Hotline: 0987-654-321 | 🌐 Website: shop.com");
  const [repeatQueue, setRepeatQueue] = useState<boolean>(false);
  const [autoWritePost, setAutoWritePost] = useState<boolean>(false);

  // ── AI Campaign Setup State ──
  const [creationMode, setCreationMode] = useState<"single" | "campaign">("single");
  const [campaignNiche, setCampaignNiche] = useState<string>("");
  const [isOptimizingCampaign, setIsOptimizingCampaign] = useState<boolean>(false);
  const [campaignTopicPrompt, setCampaignTopicPrompt] = useState<string>("");
  const [campaignTopicCount, setCampaignTopicCount] = useState<number>(30);
  const [campaignGeneratedTopics, setCampaignGeneratedTopics] = useState<string[]>([]);
  const [campaignNewTopicInput, setCampaignNewTopicInput] = useState<string>("");

  const [campaignLanguage, setCampaignLanguage] = useState<string>("vi");
  const [campaignPostLength, setCampaignPostLength] = useState<string>("medium");
  const [campaignWritingStyle, setCampaignWritingStyle] = useState<string>("professional");
  const [campaignCustomPrompt, setCampaignCustomPrompt] = useState<string>("");
  const [campaignUseFanpageInfo, setCampaignUseFanpageInfo] = useState<boolean>(false);
  const [campaignIncludeContact, setCampaignIncludeContact] = useState<boolean>(false);
  const [campaignContactInfo, setCampaignContactInfo] = useState<string>("📞 Hotline: 0987-654-321 | 🌐 Website: shop.com");
  const [campaignAutoPost, setCampaignAutoPost] = useState<boolean>(true);
  const [campaignAutoRepeat, setCampaignAutoRepeat] = useState<boolean>(false);
  const [campaignPublishMode, setCampaignPublishMode] = useState<"instant" | "review">("review");
  const [campaignAutoComment, setCampaignAutoComment] = useState<string>("");
  const [tempSetupId, setTempSetupId] = useState<number | null>(null);

  // ── AI Campaign Management State ──
  const [campaignSubTab, setCampaignSubTab] = useState<"posts" | "campaigns">("posts");
  const [setups, setSetups] = useState<any[]>([]);
  const [setupSearch, setSetupSearch] = useState<string>("");
  const [setupFilter, setSetupFilter] = useState<"all" | "active" | "paused" | "completed">("all");
  const [expandedSetup, setExpandedSetup] = useState<number | null>(null);
  const [setupTopics, setSetupTopics] = useState<any[]>([]);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(false);
  const [approvingTopic, setApprovingTopic] = useState<number | null>(null);
  const [generatingTopicId, setGeneratingTopicId] = useState<number | null>(null);
  const [batchGeneratingSetupId, setBatchGeneratingSetupId] = useState<number | null>(null);

  // ── Topic Edit & Review Modal State ──
  const [reviewTopic, setReviewTopic] = useState<any | null>(null);
  const [reviewContent, setReviewContent] = useState<string>("");
  const [reviewImageUrl, setReviewImageUrl] = useState<string>("");
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Statuses
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync tab parameter from URL reactively
  useEffect(() => {
    if (tab && (tab === "setup" || tab === "list" || tab === "automation")) {
      setActiveTab(tab as "setup" | "list" | "automation");
    }
  }, [tab]);

  // Load configuration & theme
  useEffect(() => {
    const savedToken = localStorage.getItem("zeflyo_token");
    const savedApiBase = localStorage.getItem("zeflyo_api_base");
    const savedPages = localStorage.getItem("zeflyo_mock_pages");
    const savedTheme = localStorage.getItem("zeflyo_theme") || "light";
    const savedUser = localStorage.getItem("zeflyo_user");
    const savedLang = localStorage.getItem("zeflyo_lang");

    if (savedToken) setToken(savedToken);
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    let defaultApiBase = currentOrigin;
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        defaultApiBase = "http://localhost";
      }
    }
    const isStaleLocalhost = savedApiBase && (savedApiBase.includes("localhost:") || savedApiBase.includes("127.0.0.1:"));
    if (!savedApiBase || isStaleLocalhost || (savedApiBase === "http://localhost" && defaultApiBase !== "http://localhost")) {
      localStorage.setItem("zeflyo_api_base", defaultApiBase);
      setApiBaseUrl(defaultApiBase);
    } else {
      setApiBaseUrl(savedApiBase);
    }
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedLang === "en" || savedLang === "vi") setLang(savedLang as "en" | "vi");

    setTheme(savedTheme as "dark" | "light");
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }

    // Set today's date as default for fixed schedule
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setScheduleDate(`${year}-${month}-${day}`);

    // Initial page load
    if (savedPages) {
      try {
        const pagesList = JSON.parse(savedPages);
        setFanpages(pagesList);
        if (pagesList.length > 0) {
          // Pre-select first fanpage by default
          setSelectedPages([pagesList[0].id]);
        }
      } catch (e) {
        console.error("Failed to parse mock pages", e);
      }
    }
  }, []);

  // Generate dynamic, AI-personalized prompt presets based on user business niche
  const handleGeneratePresets = async () => {
    if (!token || !businessNiche.trim() || isLoadingPresets) return;

    setIsLoadingPresets(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/posts/quick-presets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ niche: businessNiche.trim(), framework: aiFramework })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.presets && Array.isArray(data.presets)) {
          setPresets(data.presets);
          syncCredits(data.credits_remaining);
          if (!setupName.trim()) {
            const today = new Date();
            const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
            setSetupName(`Chiến dịch ${businessNiche.trim()} - ${formattedDate}`);
          }
          showNotification("success", "Đã tạo 4 gợi ý viết bài mới theo sản phẩm của bạn!");
        } else {
          showNotification("error", "Không thể lấy chủ đề gợi ý.");
        }
      } else {
        const creditErr = await handleApiCreditError(response);
        if (creditErr) {
          showNotification("error", creditErr);
        } else {
          showNotification("error", "Lỗi tạo gợi ý chủ đề.");
        }
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Lỗi kết nối.");
    } finally {
      setIsLoadingPresets(false);
    }
  };

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  // Fetch from Backend if real mode
  useEffect(() => {
    if (token) {
      fetchFanpagesList();
      if (!token.startsWith("mock_")) {
        fetchScheduledPosts();
      } else {
        // Load mock scheduled posts
        const mockPosts = localStorage.getItem("zeflyo_mock_scheduled_posts");
        if (mockPosts) {
          try {
            setScheduledPosts(JSON.parse(mockPosts));
          } catch (e) {
            console.error(e);
          }
        }
        setLoading(false);
      }
    }
  }, [token, apiBaseUrl]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("zeflyo_theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "vi" : "en";
    setLang(nextLang);
    localStorage.setItem("zeflyo_lang", nextLang);
    document.documentElement.lang = nextLang;
  };

  const handleLogout = () => {
    localStorage.removeItem("zeflyo_token");
    localStorage.removeItem("zeflyo_user");
    localStorage.removeItem("zeflyo_mock_pages");
    window.location.href = "/";
  };

  const showNotification = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const fetchFanpagesList = async () => {
    if (!token) return;

    if (token.startsWith("mock_")) {
      const savedMockPages = localStorage.getItem("zeflyo_mock_pages");
      if (savedMockPages) {
        try {
          const pagesList = JSON.parse(savedMockPages);
          setFanpages(pagesList);
          if (pagesList.length > 0 && selectedPages.length === 0) {
            setSelectedPages([pagesList[0].id]);
          }
        } catch (e) {
          console.error("Failed to parse mock pages", e);
        }
      } else {
        const defaultMockPages = [
          { id: 1, user_id: 99, fb_page_id: "109849204982312", name: "Zeflyo Fashion Store", avatar_url: null, is_active: true },
          { id: 2, user_id: 99, fb_page_id: "304958230495823", name: "Zeflyo Food & Beverage", avatar_url: null, is_active: false },
          { id: 3, user_id: 99, fb_page_id: "495829348572934", name: "Tech Support Portal", avatar_url: null, is_active: false }
        ];
        setFanpages(defaultMockPages);
        localStorage.setItem("zeflyo_mock_pages", JSON.stringify(defaultMockPages));
        if (selectedPages.length === 0) {
          setSelectedPages([1]);
        }
      }
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/fanpages`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const pagesList = data.fanpages || [];
        setFanpages(pagesList);
        if (pagesList.length > 0 && selectedPages.length === 0) {
          setSelectedPages([pagesList[0].id]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePageAutomation = async (pageId: number, fbPageId: string) => {
    setActionLoading(pageId);

    if (token && token.startsWith("mock_")) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const updatedPages = fanpages.map(p => {
        if (p.id === pageId) {
          const newState = !p.is_active;
          const newLog = {
            id: Math.random().toString(),
            page: p.name,
            event: newState ? "Automation activated (polling/webhook status UP)" : "Automation paused",
            time: "Just now",
            status: (newState ? "success" : "pending") as any
          };
          setLogs(prev => [newLog, ...prev.slice(0, 9)]);
          return { ...p, is_active: newState };
        }
        return p;
      });
      setFanpages(updatedPages);
      localStorage.setItem("zeflyo_mock_pages", JSON.stringify(updatedPages));
      showNotification("success", "Cập nhật trạng thái Fanpage thành công");
      setActionLoading(null);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/fanpages/${pageId}/toggle`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setFanpages(fanpages.map(p => p.id === pageId ? { ...p, is_active: data.fanpage.is_active } : p));
        showNotification("success", "Cập nhật trạng thái Fanpage thành công");
      } else {
        showNotification("error", data.error || "Không có quyền truy cập vào Fanpage này");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Lỗi kết nối. Hãy chắc chắn rằng máy chủ backend đang chạy.");
    } finally {
      setActionLoading(null);
    }
  };

  const fetchScheduledPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/posts/schedule`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setScheduledPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching scheduled posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch campaigns/auto-setups
  const fetchSetups = useCallback(async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams();
      if (setupFilter !== "all") params.set("status", setupFilter);
      if (setupSearch) params.set("search", setupSearch);
      const res = await fetch(`${apiBaseUrl}/api/auto-setups?${params}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const d = await res.json();
        setSetups(d.setups || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token, apiBaseUrl, setupFilter, setupSearch]);

  useEffect(() => {
    if (activeTab === "list" && campaignSubTab === "campaigns") {
      fetchSetups();
    }
  }, [activeTab, campaignSubTab, fetchSetups]);

  // Campaign AI Optimizer Logic (1-Click Optimization)
  const handleOptimizeCampaign = async () => {
    if (!campaignNiche.trim()) {
      showNotification("error", "Vui lòng nhập ngành hàng hoặc sản phẩm của bạn.");
      return;
    }
    setIsOptimizingCampaign(true);
    // Simulate a premium AI analysis and configure parameters
    await new Promise(resolve => setTimeout(resolve, 1200));

    const nicheLower = campaignNiche.trim().toLowerCase();
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

    setSetupName(`Chiến dịch ${campaignNiche.trim()} - ${formattedDate}`);

    // Map industry-specific options locally for speed & robustness
    if (nicheLower.includes("mỹ phẩm") || nicheLower.includes("spa") || nicheLower.includes("làm đẹp") || nicheLower.includes("da") || nicheLower.includes("son")) {
      setCampaignPostLength("medium");
      setCampaignWritingStyle("emotional");
      setCampaignCustomPrompt(`Nhấn mạnh lợi ích chăm sóc sắc đẹp từ ${campaignNiche.trim()}, thành phần thảo dược tự nhiên lành tính, cam kết chất lượng chuẩn khoa học. Giọng điệu gần gũi, chia sẻ giải pháp tự tin tỏa sáng.`);
      setCampaignTopicPrompt(`Viết các bài chia sẻ cách skincare tại nhà liên quan đến ${campaignNiche.trim()}, review dòng sản phẩm/dịch vụ mới ra mắt, bí quyết làm đẹp khoa học, mini-game nhận quà dùng thử`);
    } else if (nicheLower.includes("khóa học") || nicheLower.includes("ai") || nicheLower.includes("lập trình") || nicheLower.includes("dạy") || nicheLower.includes("học")) {
      setCampaignPostLength("detailed");
      setCampaignWritingStyle("professional");
      setCampaignCustomPrompt(`Nêu bật tính thực tế của ${campaignNiche.trim()}, công nghệ hiện đại, hướng dẫn từng bước (step-by-step) dễ hiểu cho người mới bắt đầu, kèm ưu đãi giảm giá sâu và quà tặng tài liệu.`);
      setCampaignTopicPrompt(`Các bài viết chia sẻ kiến thức về: ${campaignNiche.trim()}, giới thiệu các giải pháp/khóa học liên quan, quà tặng tài liệu hữu ích, feedback học viên hoặc khách hàng thành công`);
    } else if (nicheLower.includes("thời trang") || nicheLower.includes("quần áo") || nicheLower.includes("váy") || nicheLower.includes("giày") || nicheLower.includes("phối đồ")) {
      setCampaignPostLength("short");
      setCampaignWritingStyle("storytelling");
      setCampaignCustomPrompt(`Kể câu chuyện về phong cách thời trang từ ${campaignNiche.trim()}, phối đồ hack dáng cực xinh cho mọi vóc dáng, giới thiệu chất liệu bền đẹp thoải mái, kèm ưu đãi giới hạn.`);
      setCampaignTopicPrompt(`Gợi ý cách phối đồ thời trang liên quan đến ${campaignNiche.trim()}, giới thiệu bộ sưu tập mới nhất, chia sẻ chất liệu vải thoáng mát tốt nhất, ưu đãi giảm giá khi mua combo`);
    } else if (nicheLower.includes("ăn") || nicheLower.includes("uống") || nicheLower.includes("nhà hàng") || nicheLower.includes("caf") || nicheLower.includes("trà")) {
      setCampaignPostLength("medium");
      setCampaignWritingStyle("creative");
      setCampaignCustomPrompt(`Tập trung mô tả hương vị hấp dẫn đậm đà của ${campaignNiche.trim()}, không gian check-in lý tưởng, nguyên liệu tươi ngon an toàn, kêu gọi bạn bè lập hội đi ăn.`);
      setCampaignTopicPrompt(`Giới thiệu món best-seller của ${campaignNiche.trim()}, review không gian góc sống ảo cực chill, chương trình ưu đãi tri ân dịp cuối tuần, chia sẻ bí quyết làm đồ uống/món ăn giải nhiệt`);
    } else {
      // Default fallback
      setCampaignPostLength("medium");
      setCampaignWritingStyle("advertising");
      setCampaignCustomPrompt(`Nêu bật công dụng thực tế của sản phẩm ${campaignNiche.trim()}, cam kết uy tín bảo hành chu đáo, kêu gọi khách hàng để lại bình luận để nhận tư vấn miễn phí.`);
      setCampaignTopicPrompt(`Giới thiệu tính năng nổi bật của ${campaignNiche.trim()}, mẹo sử dụng bền bỉ hiệu quả tại nhà, feedback từ khách hàng đã trải nghiệm, voucher giảm giá khi liên hệ ngay`);
    }

    setCampaignIncludeContact(true);
    setCampaignContactInfo("📞 Hotline tư vấn: 0987-654-321 | 🌐 Website đặt hàng: shop.com");
    setCampaignLanguage("vi");
    setCampaignAutoPost(true);
    setCampaignAutoRepeat(false);
    setCampaignPublishMode("review");

    // Auto configure weekly schedule: Mon, Wed, Fri at 08:00
    setScheduleMode("weekly");
    setScheduleDays([1, 3, 5]);
    setScheduleTimes(["08:00"]);

    setIsOptimizingCampaign(false);
    showNotification("success", "AI đã tự động cấu hình và tối ưu hóa chiến dịch theo sản phẩm của bạn!");
  };

  const handleGenerateTopics = async () => {
    if (!campaignTopicPrompt.trim() || !token || !tempSetupId) return;
    setAiGenerating(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auto-setups/${tempSetupId}/generate-topics`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ prompt: campaignTopicPrompt, count: campaignTopicCount }),
      });
      if (res.ok) {
        const d = await res.json();
        setCampaignGeneratedTopics(d.topics?.map((t: TopicItem) => t.title) || []);
        syncCredits(d.credits_remaining);
        showNotification("success", `Đã tạo ${d.topics?.length || 0} chủ đề thành công!`);
      } else {
        const creditErr = await handleApiCreditError(res);
        if (creditErr) {
          showNotification("error", creditErr);
        } else {
          const err = await res.json().catch(() => ({}));
          showNotification("error", err.error || "Không thể tạo chủ đề.");
        }
      }
    } catch (e) {
      showNotification("error", "Lỗi kết nối khi tạo chủ đề.");
    }
    setAiGenerating(false);
  };

  const handleAddManualTopic = async () => {
    if (!campaignNewTopicInput.trim() || !token || !tempSetupId) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/auto-setups/${tempSetupId}/topics`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ title: campaignNewTopicInput.trim() }),
      });
      if (res.ok) {
        const d = await res.json();
        setCampaignGeneratedTopics(prev => [...prev, d.topic.title]);
        setCampaignNewTopicInput("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSetup = async () => {
    if (!token || !setupName.trim() || selectedPages.length === 0) {
      showNotification("error", "Vui lòng nhập tên thiết lập và chọn ít nhất 1 fanpage.");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        name: setupName,
        source_type: "topic",
        fanpage_ids: selectedPages,
        language: campaignLanguage,
        post_length: campaignPostLength,
        writing_style: campaignWritingStyle,
        custom_prompt: campaignCustomPrompt || null,
        use_fanpage_info: campaignUseFanpageInfo,
        include_contact: campaignIncludeContact,
        contact_info: campaignIncludeContact ? campaignContactInfo : null,
        schedule_mode: scheduleMode,
        schedule_days: scheduleMode === "weekly" ? scheduleDays : null,
        schedule_date: scheduleMode === "fixed" ? scheduleDate : null,
        schedule_times: scheduleTimes,
        auto_post: campaignAutoPost,
        auto_repeat: campaignAutoRepeat,
        publish_mode: campaignPublishMode,
        auto_comment: campaignAutoComment || null,
      };

      const res = await fetch(`${apiBaseUrl}/api/auto-setups`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const d = await res.json();
        setTempSetupId(d.setup.id);
        showNotification("success", "Thiết lập chiến dịch đã được tạo thành công!");
      } else {
        const err = await res.json();
        showNotification("error", err.error || err.message || "Không thể tạo thiết lập.");
      }
    } catch (e) {
      showNotification("error", "Lỗi kết nối.");
    }
    setSubmitting(false);
  };

  const handleToggleSetup = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/auto-setups/${id}/toggle`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) fetchSetups();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSetup = async (id: number) => {
    if (!token) return;
    try {
      await fetch(`${apiBaseUrl}/api/auto-setups/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      fetchSetups();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExpandSetup = async (id: number) => {
    if (expandedSetup === id) {
      setExpandedSetup(null);
      return;
    }
    setExpandedSetup(id);
    setLoadingTopics(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auto-setups/${id}/topics`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const d = await res.json();
        setSetupTopics(d.topics || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingTopics(false);
  };

  const handleGenerateTopicContent = async (topicId: number) => {
    if (!token) return;
    setGeneratingTopicId(topicId);
    try {
      const res = await fetch(`${apiBaseUrl}/api/topics/${topicId}/generate-content`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const d = await res.json();
        syncCredits(d.credits_remaining);
        showNotification("success", "Đã soạn thảo nội dung bài viết bằng AI thành công!");
        if (expandedSetup) {
          const res2 = await fetch(`${apiBaseUrl}/api/auto-setups/${expandedSetup}/topics`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          });
          if (res2.ok) {
            const d = await res2.json();
            setSetupTopics(d.topics || []);
          }
        }
      } else {
        const creditErr = await handleApiCreditError(res);
        if (creditErr) {
          showNotification("error", creditErr);
        } else {
          const err = await res.json().catch(() => ({}));
          showNotification("error", err.error || err.message || "Không thể sinh nội dung.");
        }
      }
    } catch (e) {
      showNotification("error", "Lỗi kết nối.");
    }
    setGeneratingTopicId(null);
  };

  const handleBatchGenerateContents = async (setupId: number) => {
    if (!token) return;
    setBatchGeneratingSetupId(setupId);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auto-setups/${setupId}/generate-all-contents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const d = await res.json();
        syncCredits(d.credits_remaining);
        showNotification("success", `Đã tự động soạn thảo thành công ${d.count || 0} bài viết bằng AI!`);
        const res2 = await fetch(`${apiBaseUrl}/api/auto-setups/${setupId}/topics`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (res2.ok) {
          const d2 = await res2.json();
          setSetupTopics(d2.topics || []);
        }
      } else {
        const creditErr = await handleApiCreditError(res);
        if (creditErr) {
          showNotification("error", creditErr);
        } else {
          const err = await res.json().catch(() => ({}));
          showNotification("error", err.error || err.message || "Không thể soạn thảo hàng loạt.");
        }
      }
    } catch (e) {
      showNotification("error", "Lỗi kết nối.");
    }
    setBatchGeneratingSetupId(null);
  };

  const handleApproveTopic = async (topicId: number) => {
    if (!token) return;
    setApprovingTopic(topicId);
    try {
      const res = await fetch(`${apiBaseUrl}/api/topics/${topicId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        if (expandedSetup) handleExpandSetup(expandedSetup);
        showNotification("success", "Đã duyệt và thêm bài viết vào hàng chờ!");
        fetchScheduledPosts();
      }
    } catch (e) {
      console.error(e);
    }
    setApprovingTopic(null);
  };

  const handleOpenReview = (topic: any) => {
    setReviewTopic(topic);
    setReviewContent(topic.generated_content || "");
    setReviewImageUrl(topic.generated_image_url || "");
    setReviewError(null);
  };

  const handleUploadReviewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingImage(true);
    setReviewError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${apiBaseUrl}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (res.ok) {
        const d = await res.json();
        setReviewImageUrl(d.url);
      } else {
        const err = await res.json();
        setReviewError(err.error || "Upload failed");
      }
    } catch (err) {
      setReviewError("Network error during upload");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveAndPublishTopic = async () => {
    if (!reviewTopic || !token) return;
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/topics/${reviewTopic.id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          content: reviewContent,
          image_url: reviewImageUrl || null,
        }),
      });

      if (res.ok) {
        setReviewTopic(null);
        if (expandedSetup) handleExpandSetup(expandedSetup);
        showNotification("success", "Đã xuất bản bài đăng thành công!");
        fetchScheduledPosts();
      } else {
        const err = await res.json();
        setReviewError(err.error || "Không thể xuất bản.");
      }
    } catch (e) {
      setReviewError("Lỗi mạng khi xuất bản.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSaveDraftTopic = async () => {
    if (!reviewTopic || !token) return;
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/topics/${reviewTopic.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          content: reviewContent,
          image_url: reviewImageUrl || null,
        }),
      });

      if (res.ok) {
        setReviewTopic(null);
        if (expandedSetup) handleExpandSetup(expandedSetup);
        showNotification("success", "Đã lưu bản nháp chủ đề thành công!");
      } else {
        const err = await res.json();
        setReviewError(err.error || "Không thể lưu nháp.");
      }
    } catch (e) {
      setReviewError("Lỗi kết nối.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Queue Item Actions
  const handleAddQueueItem = () => {
    const newItem = { id: Math.random().toString(), content: "", imageUrl: "" };
    setQueue(prev => [...prev, newItem]);
    setActiveQueueIndex(queue.length);
  };

  const handleDeleteQueueItem = (index: number) => {
    if (queue.length <= 1) {
      setQueue([{ id: Math.random().toString(), content: "", imageUrl: "" }]);
      setActiveQueueIndex(0);
      return;
    }
    const updated = queue.filter((_, idx) => idx !== index);
    setQueue(updated);
    setActiveQueueIndex(prev => Math.max(0, Math.min(updated.length - 1, prev - 1)));
  };

  const handleDuplicateQueueItem = (index: number) => {
    const itemToDuplicate = queue[index];
    if (!itemToDuplicate) return;
    const newItem = {
      ...itemToDuplicate,
      id: Math.random().toString()
    };
    setQueue(prev => [
      ...prev.slice(0, index + 1),
      newItem,
      ...prev.slice(index + 1)
    ]);
    setActiveQueueIndex(index + 1);
  };

  const handleContentChange = (val: string) => {
    setQueue(prev => prev.map((item, idx) => idx === activeQueueIndex ? { ...item, content: val } : item));
  };

  const handleImageUrlChange = (val: string) => {
    setQueue(prev => prev.map((item, idx) => idx === activeQueueIndex ? { ...item, imageUrl: val } : item));
  };

  const handleDeleteMediaItem = (itemIdx: number) => {
    setQueue(prev => prev.map((item, idx) => {
      if (idx === activeQueueIndex) {
        const updatedGallery = (item.mediaGallery || []).filter((_: MediaItem, i: number) => i !== itemIdx);
        return {
          ...item,
          imageUrl: updatedGallery[0]?.url || "",
          mediaGallery: updatedGallery
        };
      }
      return item;
    }));
  };

  const handleAddManualMediaUrl = (url: string) => {
    if (!url.trim()) return;
    const type: "image" | "video" = (url.endsWith(".mp4") || url.endsWith(".mov") || url.includes("video")) ? "video" : "image";
    const newMedia: MediaItem = { url: url.trim(), type };
    setQueue(prev => prev.map((item, idx) => {
      if (idx === activeQueueIndex) {
        const gallery = item.mediaGallery || [];
        const updatedGallery = [...gallery, newMedia];
        return {
          ...item,
          imageUrl: updatedGallery[0]?.url || "",
          mediaGallery: updatedGallery
        };
      }
      return item;
    }));
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!token) return;
    setUploadingImage(true);

    try {
      const isMock = token.startsWith("mock_");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (isMock) {
          await new Promise(resolve => setTimeout(resolve, 400));
          const mockImages = [
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
          ];
          const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
          const newMedia: MediaItem = {
            url: randomImg,
            type: file.type.startsWith("video/") ? ("video" as const) : ("image" as const)
          };
          
          setQueue(prev => prev.map((item, idx) => {
            if (idx === activeQueueIndex) {
              const gallery = item.mediaGallery || [];
              const updatedGallery = [...gallery, newMedia];
              return {
                ...item,
                imageUrl: updatedGallery[0]?.url || "",
                mediaGallery: updatedGallery
              };
            }
            return item;
          }));
          showNotification("success", `Đã tải ${file.name} lên thành công (Giả lập)!`);
        } else {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch(`${apiBaseUrl}/api/upload`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: formData,
          });

          if (res.ok) {
            const d = await res.json();
            const mediaType: "image" | "video" = (d.type === "video" || file.type.startsWith("video/")) ? "video" : "image";
            const newMedia: MediaItem = {
              url: d.url,
              type: mediaType
            };
            
            setQueue(prev => prev.map((item, idx) => {
              if (idx === activeQueueIndex) {
                const gallery = item.mediaGallery || [];
                const updatedGallery = [...gallery, newMedia];
                return {
                  ...item,
                  imageUrl: updatedGallery[0]?.url || "",
                  mediaGallery: updatedGallery
                };
              }
              return item;
            }));
            showNotification("success", `Tải file ${file.name} thành công!`);
          } else {
            const err = await res.json();
            showNotification("error", err.error || `Tải file ${file.name} thất bại`);
          }
        }
      }
    } catch (err) {
      showNotification("error", "Lỗi kết nối khi tải file");
    } finally {
      setUploadingImage(false);
    }
  };

  // Excel Mock Actions
  const handleImportExcel = () => {
    const mockImported = [
      {
        id: Math.random().toString(),
        content: "🔥 SIÊU KHUYẾN MÃI MÙA HÈ - GIẢM GIÁ ĐẾN 50%!\nBộ sưu tập mới nhất đã có mặt tại Zeflyo Store. Chất liệu mát lạnh, form cực chuẩn cho ngày hè năng động.\n👉 Inbox ngay để nhận ưu đãi!",
        imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: Math.random().toString(),
        content: "✨ GÓC CHIA SẺ BÍ QUYẾT PHỐI ĐỒ\nLàm sao để vừa thanh lịch vừa cá tính khi đi làm? Hãy thử kết hợp áo sơ mi oversized cùng quần jeans ống rộng từ Zeflyo nhé.\n💬 Bạn thích màu nào hơn?",
        imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: Math.random().toString(),
        content: "⭐ FEEDBACK SIÊU XỊN TỪ KHÁCH HÀNG THÂN YÊU\nSự hài lòng của mọi người là động lực lớn nhất của Zeflyo. Cảm ơn quý khách đã tin tưởng lựa chọn chất lượng hàng đầu của chúng tôi.\n❤️ Chúc cả nhà ngày mới vui vẻ!",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
      }
    ];
    setQueue(mockImported);
    setActiveQueueIndex(0);
    showNotification("success", "Đã import thành công 3 bài viết mẫu từ file Excel!");
  };

  const handleDownloadTemplate = () => {
    showNotification("success", "Đã tải file Excel Template về thiết bị (Giả lập)!");
  };

  // Date calculation scheduler logic
  const calculateTargetDates = () => {
    const dates: Date[] = [];
    const now = new Date();

    // Check next 14 days for slots matching selectedDays and selectedTimes
    for (let d = 0; d < 14; d++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + d);

      let jsDay = checkDate.getDay();
      if (jsDay === 0) jsDay = 7; // Map Sunday to 7

      if (scheduleDays.includes(jsDay)) {
        scheduleTimes.forEach(time => {
          const [hours, minutes] = time.split(":").map(Number);
          const slot = new Date(checkDate);
          slot.setHours(hours, minutes, 0, 0);

          if (slot > now) {
            dates.push(slot);
          }
        });
      }
    }

    return dates.sort((a, b) => a.getTime() - b.getTime());
  };

  // Submit Save
  const handleSaveSetup = async () => {
    if (selectedPages.length === 0) {
      showNotification("error", "Vui lòng chọn ít nhất một Fanpage để đăng bài.");
      return;
    }

    const validQueue = queue.filter(item => item.content.trim() !== "");
    if (validQueue.length === 0) {
      showNotification("error", "Hàng chờ bài viết đang rỗng hoặc các bài viết không có nội dung.");
      return;
    }

    if (scheduleMode === "weekly" && scheduleDays.length === 0) {
      showNotification("error", "Vui lòng chọn ít nhất một ngày trong tuần.");
      return;
    }

    if (scheduleTimes.length === 0) {
      showNotification("error", "Vui lòng chọn ít nhất một khung giờ đăng.");
      return;
    }

    setSubmitting(true);

    let targetDates: Date[] = [];
    if (scheduleMode === "weekly") {
      targetDates = calculateTargetDates();
    } else {
      // Fixed date mode: Schedule on the selected date
      if (!scheduleDate) {
        showNotification("error", "Vui lòng chọn ngày đăng bài.");
        setSubmitting(false);
        return;
      }

      const baseDate = new Date(scheduleDate);

      // Map times
      scheduleTimes.forEach(time => {
        const [hours, minutes] = time.split(":").map(Number);
        const slot = new Date(baseDate);
        slot.setHours(hours, minutes, 0, 0);
        targetDates.push(slot);
      });
      targetDates.sort((a, b) => a.getTime() - b.getTime());
    }

    if (targetDates.length === 0) {
      showNotification("error", "Không thể tìm thấy khung giờ đăng hợp lệ trong tương lai.");
      setSubmitting(false);
      return;
    }

    const postsToSchedule: any[] = [];
    const limit = Math.min(targetDates.length, repeatQueue ? 50 : validQueue.length);

    for (let i = 0; i < limit; i++) {
      const slot = targetDates[i];
      const postItem = validQueue[i % validQueue.length];

      let finalContent = postItem.content;
      if (includeContactInfo) {
        finalContent += "\n\n" + contactText;
      }

      postsToSchedule.push({
        fanpage_ids: selectedPages,
        content: finalContent,
        image_url: postItem.imageUrl || null,
        media_gallery: postItem.mediaGallery || (postItem.imageUrl ? [{ url: postItem.imageUrl, type: "image" as const }] : []),
        scheduled_at: slot.toISOString(),
        status: "pending"
      });
    }

    if (token && token.startsWith("mock_")) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newMockPosts = postsToSchedule.map(p => ({
        id: Math.floor(Math.random() * 100000),
        user_id: 99,
        fanpage_ids: p.fanpage_ids,
        content: p.content,
        image_url: p.image_url,
        media_gallery: p.media_gallery,
        scheduled_at: p.scheduled_at,
        status: "pending" as const,
        error_log: null,
        created_at: new Date().toISOString()
      }));

      const updatedList = [...newMockPosts, ...scheduledPosts];
      setScheduledPosts(updatedList);
      localStorage.setItem("zeflyo_mock_scheduled_posts", JSON.stringify(updatedList));

      showNotification("success", `Đã thiết lập lịch đăng thành công! Lên lịch ${newMockPosts.length} bài viết.`);
      setActiveTab("list");
      setSubmitting(false);
    } else {
      try {
        let successCount = 0;
        for (const postData of postsToSchedule) {
          const response = await fetch(`${apiBaseUrl}/api/posts/schedule`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(postData)
          });
          if (response.ok) {
            successCount++;
          }
        }

        if (successCount > 0) {
          showNotification("success", `Đã thiết lập lịch đăng thành công! Lên lịch thành công ${successCount}/${postsToSchedule.length} bài viết.`);
          fetchScheduledPosts();
          setActiveTab("list");
        } else {
          showNotification("error", "Lỗi lên lịch đăng bài.");
        }
      } catch (err) {
        showNotification("error", "Lỗi kết nối đến backend.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeletePost = async (id: number) => {
    if (token && token.startsWith("mock_")) {
      const updatedList = scheduledPosts.filter(post => post.id !== id);
      setScheduledPosts(updatedList);
      localStorage.setItem("zeflyo_mock_scheduled_posts", JSON.stringify(updatedList));
      showNotification("success", "Đã xóa bài đăng hẹn giờ.");
    } else {
      try {
        const response = await fetch(`${apiBaseUrl}/api/posts/schedule/${id}`, {
          method: "DELETE",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          showNotification("success", "Đã xóa bài đăng hẹn giờ.");
          fetchScheduledPosts();
        } else {
          showNotification("error", "Không thể xóa bài đăng.");
        }
      } catch (err) {
        showNotification("error", "Lỗi kết nối.");
      }
    }
  };

  const handlePublishImmediately = async (id: number | string) => {
    setPublishingId(id);
    if (token && token.startsWith("mock_")) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setScheduledPosts(prev => prev.map(p => p.id === id ? { ...p, status: "published" as const } : p));
      showNotification("success", "Đã đăng bài thành công lên Facebook (Chế độ giả lập).");
      setPublishingId(null);
    } else {
      try {
        const response = await fetch(`${apiBaseUrl}/api/posts/schedule/${id}/publish`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          showNotification("success", "Xuất bản bài viết thành công lên trang Facebook!");
          fetchScheduledPosts();
        } else {
          const data = await response.json();
          showNotification("error", data.error || "Không thể đăng bài viết ngay.");
        }
      } catch (err) {
        showNotification("error", "Lỗi kết nối.");
      } finally {
        setPublishingId(null);
      }
    }
  };

  const handleGenerateAiStream = async () => {
    if (!aiTopic.trim() || !aiGoal.trim()) return;

    const controller = new AbortController();
    setAbortController(controller);
    setIsStreaming(true);
    setAiGenerating(true);
    showNotification("success", "Đang khởi tạo kết nối AI...");

    // Clear active post content first
    handleContentChange("");

    if (token && token.startsWith("mock_")) {
      // Mock streaming mode
      const mockTemplates: Record<string, string> = {
        aida: `⚡ [Attention - Gây chú ý]: Bạn đang loay hoay viết nội dung Fanpage mỗi ngày? ${aiTopic}!\n\n💡 [Interest - Thích thú]: Đừng lo lắng, Zeflyo giúp tự động hóa 100% quá trình lên lịch, tạo nội dung chuẩn Marketing giúp fanpage tiếp cận hàng chục ngàn người dùng tự nhiên.\n\n🎁 [Desire - Khao khát]: Đăng ký ngay hôm nay để nhận Voucher 50% đặc quyền dành riêng cho bạn. Đạt mục tiêu: ${aiGoal} chưa bao giờ dễ dàng hơn thế!\n\n👉 [Action - Hành động]: Click vào liên kết bên dưới hoặc Inbox ngay để được Zeflyo hỗ trợ tư vấn trực tiếp 24/7!`,
        pas: `🔥 [Problem - Vấn đề]: ${aiTopic} đang gặp trở ngại lớn về lượng tương tác tự nhiên và bài viết kém thu hút?\n\n⚠️ [Agitate - Xoáy sâu]: Việc bài đăng thưa thớt khiến khách hàng dần lãng quên thương hiệu của bạn, trực tiếp ảnh hưởng đến doanh số bán hàng mùa này.\n\n🛡️ [Solve - Giải pháp]: Hãy để Zeflyo giải quyết triệt để! Hệ thống tự động tạo bài bằng AI chuẩn công thức PAS, giải quyết hoàn hảo mục tiêu: ${aiGoal} chỉ trong vài lượt nhấp chuột.\n\n👉 Nhấc máy liên hệ hotline 0987-654-321 ngay hôm nay!`,
        bab: `🌟 [Before - Trước đây]: Chưa sử dụng Zeflyo, bạn mất hàng giờ ngồi viết nội dung cho chiến dịch "${aiTopic}" nhưng không có kết quả.\n\n🌈 [After - Sau này]: Từ khi có Zeflyo, bài đăng tự động chạy đúng khung giờ vàng, lượng tương tác tăng vọt 200%, chốt đơn không ngừng nghỉ.\n\n🚀 [Bridge - Cầu nối]: Hãy nâng cấp tài khoản của bạn để kết nối AI Zeflyo ngay hôm nay, hoàn thành mục tiêu: ${aiGoal} một cách hoàn hảo nhất!\n\n💬 Để lại bình luận hoặc nhắn tin cho chúng tôi nhé.`
      };

      const mockResponseText = mockTemplates[aiFramework] || mockTemplates.aida;
      let currentText = "";
      let index = 0;

      const intervalId = setInterval(() => {
        if (index >= mockResponseText.length) {
          clearInterval(intervalId);
          setIsStreaming(false);
          setAiGenerating(false);
          setAbortController(null);
          showNotification("success", "Đã tạo nội dung bài viết bằng AI (Giả lập)!");
          return;
        }

        const nextChunk = mockResponseText.slice(index, index + 4);
        index += 4;
        currentText += nextChunk;

        setQueue(prev => prev.map((item, idx) => idx === activeQueueIndex ? { ...item, content: currentText } : item));
      }, 30);

      setAbortController({
        abort: () => {
          clearInterval(intervalId);
          setIsStreaming(false);
          setAiGenerating(false);
          setAbortController(null);
          showNotification("error", "Đã hủy viết bài!");
        }
      } as any);

      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/posts/generate-ai-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: aiTopic,
          goal: aiGoal,
          framework: aiFramework,
          tone: "Thân thiện",
          post_length: "medium"
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const creditErr = await handleApiCreditError(response);
        if (creditErr) {
          showNotification("error", creditErr);
          setIsStreaming(false);
          setAiGenerating(false);
          setAbortController(null);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Backend deducted 1 credit upfront before the SSE stream opened.
      // Re-fetch the user profile to get the accurate credits_remaining and update sidebar.
      fetch(`${apiBaseUrl}/api/user`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      })
        .then(r => r.ok ? r.json() : null)
        .then(profile => { if (profile) syncCredits(profile.credits); })
        .catch(() => {});

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      let partialLine = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split("\n");
        partialLine = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  setQueue(prev => prev.map((item, idx) =>
                    idx === activeQueueIndex ? { ...item, content: item.content + parsed.chunk } : item
                  ));
                }
              } catch (e) { }
            }
          } else if (trimmed.startsWith("event: end")) {
            setIsStreaming(false);
            break;
          }
        }
      }
      showNotification("success", "Đã tạo nội dung bài viết bằng AI thành công!");
    } catch (err: any) {
      if (err.name === "AbortError") {
        showNotification("error", "Đã hủy viết bài!");
      } else {
        console.error(err);
        showNotification("error", "Lỗi tạo bài đăng bằng AI.");
      }
    } finally {
      setIsStreaming(false);
      setAiGenerating(false);
      setAbortController(null);
      setQueue(prev => prev.map((item, idx) =>
        idx === activeQueueIndex ? { ...item, content: item.content.replace(/\*\*/g, "") } : item
      ));
    }
  };

  const handleCancelGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsStreaming(false);
    setAiGenerating(false);
  };

  const activePost = queue[activeQueueIndex] || { content: "", imageUrl: "" };

  if (!mounted) {
    return (
      <div className="h-screen bg-[#09090b] text-zinc-400 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold tracking-wider text-zinc-500">Đang tải thiết lập...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen animated-gradient text-[#f4f4f5] flex relative overflow-hidden font-sans">

      {/* Background Glow Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none animate-pulse-glow-delayed" />

      <Sidebar
        currentPath="/scheduler"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        lang={lang}
        toggleLanguage={toggleLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Mobile Header */}
        <header className="w-full bg-[#18181b]/50 border-b border-zinc-800 px-6 py-4 flex items-center justify-between relative z-10 lg:hidden">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 rounded-xl bg-zinc-900 border border-zinc-805 text-zinc-400">
              <ArrowLeft className="w-4 h-4" />
            </a>
            <span className="font-bold text-sm tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent logo-text">ZEFLYO</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === "setup" ? "list" : activeTab === "list" ? "automation" : "setup")}
              className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold"
            >
              {activeTab === "setup" ? "Xem danh sách" : activeTab === "list" ? "Tự động hóa" : "Thiết lập lịch"}
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-450 hover:text-red-400 cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Pane */}
        <div className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto flex flex-col gap-6 relative z-10">

          {/* Header title */}
          <div className="flex flex-col gap-1.5 border-b border-zinc-850 pb-5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-zinc-150 uppercase">
              {activeTab === "setup" ? "THIẾT LẬP LỊCH ĐĂNG CHO BÀI VIẾT CÓ SẴN" :
                activeTab === "list" ? "QUẢN LÝ LỊCH ĐĂNG BÀI VIẾT" :
                  "KÍCH HOẠT TỰ ĐỘNG HÓA AI"}
            </h1>
            <p className="text-xs text-zinc-500">
              {activeTab === "setup"
                ? "Lên lịch hàng loạt bài viết tự động theo khung giờ cố định hoặc lặp lại hàng tuần"
                : activeTab === "list"
                  ? "Quản lý và theo dõi trạng thái các bài viết đã hẹn giờ đăng lên Fanpage"
                  : "Lựa chọn và bật/tắt tự động hóa AI cho các Fanpage đã kết nối Zeflyo."}
            </p>
          </div>

          {activeTab === "setup" ? (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Mode Switcher */}
              <div className="flex bg-zinc-950/60 p-1 rounded-xl border border-zinc-850/80 self-start">
                <button
                  type="button"
                  onClick={() => {
                    setCreationMode("single");
                    setTempSetupId(null);
                    setCampaignGeneratedTopics([]);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${creationMode === "single"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  ✍️ Viết bài nhanh & Hẹn giờ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreationMode("campaign");
                    setTempSetupId(null);
                    setCampaignGeneratedTopics([]);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${creationMode === "campaign"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  🤖 Lên chiến dịch hàng loạt bằng AI
                </button>
              </div>

              {creationMode === "single" ? (
                <div className="flex flex-col gap-8">
                  {/* Setup Name Box */}
                  <div className="glass-panel rounded-2xl p-5 flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tên thiết lập</label>
                    <input
                      type="text"
                      value={setupName}
                      onChange={(e) => setSetupName(e.target.value)}
                      placeholder="Ví dụ: Chiến dịch khuyến mãi T10"
                      className="w-full bg-zinc-950/60 border border-zinc-850 focus:border-blue-500/50 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500/30 outline-none transition-all text-zinc-200 placeholder:text-zinc-650"
                    />
                  </div>

                  {/* Two-Column Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Post Queue Management */}
                    <div className="xl:col-span-7 flex flex-col gap-6">

                      <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
                          <div>
                            <h2 className="text-base font-bold text-zinc-200">Quản lý hàng chờ bài viết</h2>
                            <span className="text-[10px] text-zinc-550 font-bold uppercase">{queue.length} bài viết</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleDownloadTemplate}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                              title="Tải template file Excel"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Tải Template</span>
                            </button>
                            <button
                              onClick={handleImportExcel}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                              title="Import danh sách bài từ file Excel"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                              <span>Import Excel</span>
                            </button>
                            <button
                              onClick={handleAddQueueItem}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Thêm bài viết</span>
                            </button>
                          </div>
                        </div>

                        {/* Queued Posts list */}
                        <div className="flex gap-3 overflow-x-auto pb-3 custom-scrollbar">
                          {queue.map((item, idx) => {
                            const isActive = idx === activeQueueIndex;
                            return (
                              <div
                                key={item.id}
                                onClick={() => setActiveQueueIndex(idx)}
                                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer min-w-[140px] max-w-[200px] flex-shrink-0 transition-all ${isActive
                                  ? "bg-blue-600/10 border-blue-500/50 text-blue-300 shadow-md shadow-blue-500/5"
                                  : "bg-zinc-900/40 border-zinc-850 hover:border-zinc-800 text-zinc-400"
                                  }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">Bài #{idx + 1}</p>
                                  <p className="text-[10px] text-zinc-550 font-medium truncate">
                                    {item.content.trim() ? item.content : "Chờ đăng"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDuplicateQueueItem(idx);
                                    }}
                                    className="text-zinc-500 hover:text-zinc-300 p-0.5"
                                    title="Nhân bản"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteQueueItem(idx);
                                    }}
                                    className="text-zinc-500 hover:text-red-400 p-0.5"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* AI Writer Panel */}
                        <div className="flex flex-col gap-4 bg-blue-650/[0.03] border border-blue-500/10 rounded-2xl p-5 mt-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 text-blue-550" />
                            <span>Trình viết bài bằng AI</span>
                          </div>

                          {/* Lĩnh vực / Sản phẩm kinh doanh */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Lĩnh vực kinh doanh hoặc Sản phẩm của bạn</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={businessNiche}
                                onChange={(e) => setBusinessNiche(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleGeneratePresets();
                                  }
                                }}
                                placeholder="Ví dụ: Khóa học AI, Đồ điện gia dụng, Mỹ phẩm, Spa, Cafe..."
                                className="flex-1 bg-zinc-950/60 border border-zinc-850 focus:border-blue-500/50 rounded-xl px-3 py-2 text-xs outline-none text-zinc-250 placeholder:text-zinc-650"
                              />
                              <button
                                type="button"
                                onClick={handleGeneratePresets}
                                disabled={isLoadingPresets || !businessNiche.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                              >
                                {isLoadingPresets ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5" />
                                )}
                                Gợi ý bằng AI
                              </button>
                            </div>
                          </div>

                          {/* Prompt Chips */}
                          <div className="flex flex-col gap-1.5 mt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Gợi ý chủ đề nhanh</span>
                              {isLoadingPresets && (
                                <span className="text-[10px] text-blue-400 flex items-center gap-1 animate-pulse">
                                  <Loader2 className="w-3 h-3 animate-spin" /> AI đang cá nhân hóa...
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {presets.map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  disabled={isLoadingPresets}
                                  onClick={() => {
                                    setAiTopic(preset.topic);
                                    setAiGoal(preset.goal);
                                    showNotification("success", `Đã áp dụng: ${preset.label}`);
                                  }}
                                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-350 hover:text-zinc-100 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 shadow-sm ${isLoadingPresets ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[11px] text-zinc-450 font-bold">Chủ đề bài đăng</span>
                              <input
                                type="text"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder="Ví dụ: Giảm giá 20% váy hoa mùa hè..."
                                className="bg-zinc-950/60 border border-zinc-850 focus:border-blue-500/50 rounded-xl px-3 py-2.5 text-xs outline-none text-zinc-250 placeholder:text-zinc-650"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[11px] text-zinc-450 font-bold">Mục tiêu bài viết</span>
                              <input
                                type="text"
                                value={aiGoal}
                                onChange={(e) => setAiGoal(e.target.value)}
                                placeholder="Ví dụ: Tặng code giảm giá, kích thích tương tác..."
                                className="bg-zinc-950/60 border border-zinc-850 focus:border-blue-500/50 rounded-xl px-3 py-2.5 text-xs outline-none text-zinc-250 placeholder:text-zinc-650"
                              />
                            </div>
                          </div>

                          {/* visual framework selection cards */}
                          <div className="flex flex-col gap-2">
                            <span className="text-[11px] text-zinc-450 font-bold">Chọn công thức Marketing</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Card AIDA */}
                              <div
                                onClick={() => setAiFramework("aida")}
                                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col gap-1 ${aiFramework === "aida"
                                  ? "bg-[#6C63FF]/5 border-[#6C63FF] text-[#6C63FF] shadow-[0_0_15px_rgba(108,99,255,0.15)] opacity-100"
                                  : "bg-zinc-950/40 border-zinc-850 text-zinc-450 hover:border-zinc-800 opacity-60 hover:opacity-80"
                                  }`}
                              >
                                <span className="text-xs font-bold flex items-center gap-1.5">
                                  ⚡ Thuyết phục (AIDA)
                                </span>
                                <span className="text-[10px] text-zinc-550 leading-normal">
                                  Attention → Interest → Desire → Action. Phù hợp kêu gọi hành động.
                                </span>
                              </div>

                              {/* Card PAS */}
                              <div
                                onClick={() => setAiFramework("pas")}
                                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col gap-1 ${aiFramework === "pas"
                                  ? "bg-[#EF4444]/5 border-[#EF4444] text-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.15)] opacity-100"
                                  : "bg-zinc-950/40 border-zinc-850 text-zinc-450 hover:border-zinc-800 opacity-60 hover:opacity-80"
                                  }`}
                              >
                                <span className="text-xs font-bold flex items-center gap-1.5">
                                  🔥 Đồng cảm (PAS)
                                </span>
                                <span className="text-[10px] text-zinc-550 leading-normal">
                                  Problem → Agitate → Solve. Nhấn mạnh nỗi đau của khách hàng.
                                </span>
                              </div>

                              {/* Card BAB */}
                              <div
                                onClick={() => setAiFramework("bab")}
                                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col gap-1 ${aiFramework === "bab"
                                  ? "bg-[#3B82F6]/5 border-[#3B82F6] text-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.15)] opacity-100"
                                  : "bg-zinc-950/40 border-zinc-850 text-zinc-450 hover:border-zinc-800 opacity-60 hover:opacity-80"
                                  }`}
                              >
                                <span className="text-xs font-bold flex items-center gap-1.5">
                                  🌟 Kể chuyện (BAB)
                                </span>
                                <span className="text-[10px] text-zinc-550 leading-normal">
                                  Before → After → Bridge. Kể câu chuyện chuyển đổi của khách hàng.
                                </span>
                              </div>
                            </div>
                          </div>

                          {isStreaming ? (
                            <button
                              type="button"
                              onClick={handleCancelGeneration}
                              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-sm shadow-red-500/10 active:scale-95 animate-pulse"
                            >
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>🛑 Hủy viết bài (Cancel Generation)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleGenerateAiStream}
                              disabled={aiGenerating || !aiTopic.trim() || !aiGoal.trim()}
                              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-sm shadow-blue-500/5 active:scale-95"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>✍️ Bắt đầu viết bằng AI (Generate with AI)</span>
                            </button>
                          )}
                        </div>

                        {/* Post Content Input Area */}
                        <div className="flex flex-col gap-2 border-t border-zinc-850 pt-5">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nội dung bài viết #{activeQueueIndex + 1}</label>
                          <textarea
                            value={activePost.content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Nhập nội dung bài viết..."
                            rows={6}
                            className="w-full bg-zinc-950/60 border border-zinc-850 focus:border-blue-500/50 rounded-xl p-4 text-sm focus:ring-1 focus:ring-blue-500/30 outline-none resize-none transition-all text-zinc-200 placeholder:text-zinc-650"
                          />
                        </div>

                        {/* Media Attach Section */}
                        <div className="flex flex-col gap-3">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Đính kèm Media (Ảnh hoặc Video)</label>
                          
                          {/* Manual URL Input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={mediaUrlInput}
                              onChange={(e) => setMediaUrlInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddManualMediaUrl(mediaUrlInput);
                                  setMediaUrlInput("");
                                }
                              }}
                              placeholder="Nhập URL video hoặc ảnh rồi nhấn Enter..."
                              className="flex-1 bg-zinc-950/40 border border-zinc-850 focus:border-blue-500/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500/30 outline-none transition-all text-zinc-350 placeholder:text-zinc-700"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                handleAddManualMediaUrl(mediaUrlInput);
                                setMediaUrlInput("");
                              }}
                              className="px-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                              Thêm
                            </button>
                          </div>

                          {/* Media Preview Grid */}
                          <div className="flex flex-wrap gap-3 mt-1">
                            {/* Render existing items in mediaGallery */}
                            {(activePost.mediaGallery || (activePost.imageUrl ? [{ url: activePost.imageUrl, type: "image" as const }] : [])).map((item, idx) => (
                              <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/60 flex items-center justify-center group animate-fade-in">
                                {item.type === "video" ? (
                                  <div className="w-full h-full relative">
                                    <video src={item.url} muted className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                      <span className="text-[10px] font-extrabold uppercase bg-blue-600/90 text-white px-1.5 py-0.5 rounded shadow">VIDEO</span>
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={item.url}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                {/* Overlay hover delete button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMediaItem(idx)}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/85 hover:bg-red-950/90 text-zinc-400 hover:text-red-400 w-6 h-6 rounded-lg flex items-center justify-center border border-zinc-800 hover:border-red-900/50 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}

                            {/* Upload Area Box */}
                            {uploadingImage ? (
                              <div className="w-24 h-24 border-2 border-dashed border-zinc-850 rounded-xl flex flex-col items-center justify-center gap-1 bg-zinc-950/20">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                <span className="text-[9px] text-zinc-500">Đang tải...</span>
                              </div>
                            ) : (
                              <div
                                className="w-24 h-24 border-2 border-dashed border-zinc-850 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-zinc-950/20 hover:bg-zinc-900/10 hover:border-zinc-800 transition-all"
                                onClick={() => document.getElementById("scheduler-file-upload")?.click()}
                              >
                                <input
                                  type="file"
                                  id="scheduler-file-upload"
                                  className="hidden"
                                  accept="image/*,video/*"
                                  multiple
                                  onChange={handleUploadImage}
                                />
                                <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-850">
                                  <Plus className="w-4 h-4 text-zinc-500" />
                                </div>
                                <span className="text-[9px] font-semibold text-zinc-400">Tải tệp lên</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-650 mt-0.5">Bạn có thể đính kèm nhiều ảnh (tạo Album đăng cùng lúc) hoặc 1 Video lên Facebook.</p>
                        </div>

                        {/* Real-time Facebook Post Mockup Preview */}
                        <div className="flex flex-col gap-3 border-t border-zinc-850 pt-5">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Bản xem trước trực quan (Facebook Live Preview)</label>

                          <div className="w-full bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden shadow-xl text-zinc-200">
                            {/* Post Header */}
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                                  {fanpages.find(p => selectedPages.includes(p.id))?.avatar_url ? (
                                    <img
                                      src={fanpages.find(p => selectedPages.includes(p.id))?.avatar_url!}
                                      alt="Page Avatar"
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    "Z"
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-zinc-150">
                                    {fanpages.find(p => selectedPages.includes(p.id))?.name || "Zeflyo Fanpage"}
                                  </span>
                                  <span className="text-[10px] text-zinc-550 flex items-center gap-1">
                                    <span>Vừa xong</span>
                                    <span>•</span>
                                    <Globe className="w-3 h-3 text-zinc-550" />
                                  </span>
                                </div>
                              </div>

                              <button className="text-zinc-600 hover:text-zinc-400">
                                <span className="text-lg font-bold">•••</span>
                              </button>
                            </div>

                            {/* Post Text */}
                            <div className="px-4 pb-3 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed select-text">
                              {activePost.content || <span className="text-zinc-650 italic">Chưa nhập nội dung bài viết...</span>}
                            </div>

                            {/* Post Media */}
                            {(() => {
                              const mediaItems = activePost.mediaGallery || (activePost.imageUrl ? [{ url: activePost.imageUrl, type: "image" as const }] : []);
                              if (mediaItems.length === 0) return null;

                              if (mediaItems.length === 1) {
                                const item = mediaItems[0];
                                if (item.type === "video") {
                                  return (
                                    <div className="w-full border-y border-zinc-850 bg-zinc-950 flex items-center justify-center relative">
                                      <video src={item.url} controls className="w-full object-cover max-h-[320px]" />
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="w-full border-y border-zinc-850 max-h-[320px] overflow-hidden flex items-center justify-center bg-zinc-950">
                                      <img src={item.url} alt="Post Media Preview" className="w-full object-cover" />
                                    </div>
                                  );
                                }
                              }

                              if (mediaItems.length === 2) {
                                return (
                                  <div className="grid grid-cols-2 gap-0.5 border-y border-zinc-850 bg-zinc-950 max-h-[320px] overflow-hidden">
                                    {mediaItems.map((item, idx) => (
                                      <div key={idx} className="h-[240px] w-full relative flex items-center justify-center overflow-hidden">
                                        {item.type === "video" ? (
                                          <video src={item.url} muted className="w-full h-full object-cover" />
                                        ) : (
                                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                );
                              }

                              if (mediaItems.length === 3) {
                                return (
                                  <div className="grid grid-cols-3 gap-0.5 border-y border-zinc-850 bg-zinc-950 max-h-[320px] overflow-hidden">
                                    <div className="col-span-2 h-[260px] relative overflow-hidden">
                                      {mediaItems[0].type === "video" ? (
                                        <video src={mediaItems[0].url} muted className="w-full h-full object-cover" />
                                      ) : (
                                        <img src={mediaItems[0].url} alt="" className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                    <div className="grid grid-rows-2 gap-0.5 h-[260px]">
                                      {mediaItems.slice(1, 3).map((item, idx) => (
                                        <div key={idx} className="h-[129px] relative overflow-hidden">
                                          {item.type === "video" ? (
                                            <video src={item.url} muted className="w-full h-full object-cover" />
                                          ) : (
                                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div className="grid grid-cols-3 gap-0.5 border-y border-zinc-850 bg-zinc-950 max-h-[320px] overflow-hidden">
                                  <div className="col-span-2 h-[260px] relative overflow-hidden">
                                    {mediaItems[0].type === "video" ? (
                                      <video src={mediaItems[0].url} muted className="w-full h-full object-cover" />
                                    ) : (
                                      <img src={mediaItems[0].url} alt="" className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  <div className="grid grid-rows-3 gap-0.5 h-[260px]">
                                    {mediaItems.slice(1, 4).map((item, idx) => (
                                      <div key={idx} className="h-[86px] relative overflow-hidden">
                                        {item.type === "video" ? (
                                          <video src={item.url} muted className="w-full h-full object-cover" />
                                        ) : (
                                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                                        )}
                                        {idx === 2 && mediaItems.length > 4 && (
                                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-bold">
                                            +{mediaItems.length - 4}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Post Actions Mock */}
                            <div className="px-4 py-2 border-t border-zinc-850 flex items-center justify-between text-zinc-500 text-xs">
                              <button className="flex-1 py-1.5 flex items-center justify-center gap-2 hover:bg-zinc-900 rounded-lg transition-colors font-medium">
                                👍 Thích
                              </button>
                              <button className="flex-1 py-1.5 flex items-center justify-center gap-2 hover:bg-zinc-900 rounded-lg transition-colors font-medium">
                                💬 Bình luận
                              </button>
                              <button className="flex-1 py-1.5 flex items-center justify-center gap-2 hover:bg-zinc-900 rounded-lg transition-colors font-medium">
                                ↩️ Chia sẻ
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleAddQueueItem}
                          className="w-full py-3.5 border border-dashed border-zinc-850 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs font-bold transition-all cursor-pointer text-center bg-zinc-900/10"
                        >
                          + Thêm bài viết vào hàng chờ
                        </button>
                      </div>

                      {/* Free Storage Tips box */}
                      <div className="glass-panel rounded-2xl p-5 border border-amber-500/10 bg-amber-500/[0.02] flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-amber-450 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" /> Mẹo lưu trữ & lấy liên kết media miễn phí:
                        </h3>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          Nếu bạn chưa có sẵn link trực tuyến cho ảnh/video, bạn có thể tải chúng lên miễn phí tại các dịch vụ lưu trữ sau để lấy liên kết trực tiếp dán vào bài viết:
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs font-semibold">
                          <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">🌐 ImgBB (Tải ảnh nhanh)</a>
                          <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">🌐 Cloudinary (Ảnh & Video)</a>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Schedule Settings */}
                    <div className="xl:col-span-5 flex flex-col gap-6 xl:sticky xl:top-24 self-start">

                      <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
                        <h2 className="text-base font-bold text-zinc-200 border-b border-zinc-850 pb-4">Lịch đăng & thiết lập</h2>

                        {/* Account Selector */}
                        <div className="flex flex-col gap-3">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chọn tài khoản để đăng bài</label>

                          {fanpages.length === 0 ? (
                            <p className="text-xs text-amber-500 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                              Kết nối facebook fanpage hoặc Zalo OA trong hồ sơ trước khi sử dụng tính năng này.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2.5 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                              {fanpages.map(page => {
                                const isChecked = selectedPages.includes(page.id);
                                return (
                                  <div
                                    key={page.id}
                                    onClick={() => {
                                      setSelectedPages(prev => prev.includes(page.id) ? prev.filter(id => id !== page.id) : [...prev, page.id]);
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked
                                      ? "bg-blue-600/10 border-blue-500/30 text-blue-300"
                                      : "bg-zinc-950/40 border-zinc-850 hover:border-zinc-800 text-zinc-400"
                                      }`}
                                  >
                                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-700 bg-zinc-950"
                                      }`}>
                                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs font-semibold truncate block">{page.name}</span>
                                      <span className="text-[10px] text-zinc-500 truncate block">ID: {page.fb_page_id}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Schedule Mode */}
                        <div className="flex flex-col gap-3">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chế độ lịch đăng bài</label>
                          <div className="grid grid-cols-2 gap-3">
                            <div
                              onClick={() => setScheduleMode("weekly")}
                              className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${scheduleMode === "weekly"
                                ? "bg-blue-600/10 border-blue-500/50 text-blue-300 shadow-sm"
                                : "bg-zinc-950/40 border-zinc-850 hover:border-zinc-800 text-zinc-400"
                                }`}
                            >
                              <span className="text-xs font-bold flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-blue-400" /> Lặp lại theo tuần
                              </span>
                              <span className="text-[10px] text-zinc-550 leading-normal">Đăng bài lặp lại theo các ngày trong tuần.</span>
                            </div>
                            <div
                              onClick={() => setScheduleMode("fixed")}
                              className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${scheduleMode === "fixed"
                                ? "bg-blue-600/10 border-blue-500/50 text-blue-300 shadow-sm"
                                : "bg-zinc-950/40 border-zinc-850 hover:border-zinc-800 text-zinc-400"
                                }`}
                            >
                              <span className="text-xs font-bold flex items-center gap-1.5">
                                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" /> Ngày cố định
                              </span>
                              <span className="text-[10px] text-zinc-550 leading-normal">Đăng bài vào các ngày cụ thể đã đặt.</span>
                            </div>
                          </div>

                          {scheduleMode === "weekly" && (
                            <p className="text-[10px] text-amber-500 bg-amber-500/5 px-3 py-2 rounded-lg border border-amber-500/15 flex items-center gap-1">
                              💡 Mẹo: Chế độ lặp lại theo tuần phù hợp cho lịch đăng bài thường xuyên và đều đặn.
                            </p>
                          )}

                          {scheduleMode === "fixed" && (
                            <div className="flex flex-col gap-2 bg-blue-650/[0.03] border border-blue-500/10 rounded-xl p-3.5 mt-1 animate-fade-in">
                              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ngày đăng bài (Cố định)</label>
                              <input
                                type="date"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                suppressHydrationWarning
                                className="w-full bg-zinc-955 dark:bg-zinc-950 border border-zinc-850 focus:border-blue-500/50 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none"
                              />
                            </div>
                          )}
                        </div>

                        {/* Giờ đăng bài */}
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Giờ đăng bài</label>
                            <button
                              onClick={() => setScheduleTimes(prev => [...prev, "12:00"])}
                              className="text-[10.5px] text-blue-400 hover:text-blue-300 font-bold transition-all cursor-pointer"
                            >
                              + Thêm giờ đăng
                            </button>
                          </div>
                          <div className="flex flex-col gap-2.5">
                            {scheduleTimes.map((time, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={time}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setScheduleTimes(prev => prev.map((t, i) => i === idx ? val : t));
                                  }}
                                  className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-blue-500/50"
                                />
                                {scheduleTimes.length > 1 && (
                                  <button
                                    onClick={() => setScheduleTimes(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-zinc-500 hover:text-red-400 p-2 border border-zinc-850 rounded-xl bg-zinc-950/20 cursor-pointer"
                                    title="Xóa giờ đăng"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Ngày đăng bài (Weekdays Selector) */}
                        {scheduleMode === "weekly" && (
                          <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ngày đăng bài</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { name: "Thứ 2", value: 1 },
                                { name: "Thứ 3", value: 2 },
                                { name: "Thứ 4", value: 3 },
                                { name: "Thứ 5", value: 4 },
                                { name: "Thứ 6", value: 5 },
                                { name: "Thứ 7", value: 6 },
                                { name: "Chủ nhật", value: 7 }
                              ].map(day => {
                                const isSelected = scheduleDays.includes(day.value);
                                return (
                                  <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => {
                                      setScheduleDays(prev => prev.includes(day.value) ? prev.filter(d => d !== day.value) : [...prev, day.value]);
                                    }}
                                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${isSelected
                                      ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10"
                                      : "bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:border-zinc-805 hover:text-zinc-300"
                                      }`}
                                  >
                                    {day.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Switches */}
                        <div className="flex flex-col gap-5 border-t border-zinc-200 dark:border-zinc-850 pt-5">

                          {/* Thêm thông tin liên hệ */}
                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col gap-0.5 max-w-[80%]">
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Thêm thông tin liên hệ</span>
                                <span className="text-[10px] text-zinc-550 dark:text-zinc-400 leading-relaxed">Tự động chèn hotline, website hoặc địa chỉ vào cuối mỗi bài viết khi đăng.</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIncludeContactInfo(!includeContactInfo)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 outline-none cursor-pointer flex-shrink-0 ${includeContactInfo ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                                  }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-300 ${includeContactInfo ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                              </button>
                            </div>

                            {includeContactInfo && (
                              <div className="flex flex-col gap-1.5 bg-zinc-100 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-850/60 rounded-xl p-3 animate-fade-in">
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Nội dung liên hệ tùy chỉnh</span>
                                <textarea
                                  value={contactText}
                                  onChange={(e) => setContactText(e.target.value)}
                                  placeholder="Ví dụ: 📞 Hotline: 09xx-xxx-xxx | 🌐 Website: shop.com"
                                  rows={2}
                                  className="w-full bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-850/80 focus:border-blue-500/50 rounded-lg p-2 text-xs outline-none text-zinc-850 dark:text-zinc-300 placeholder:text-zinc-500 dark:placeholder:text-zinc-650 resize-none shadow-inner"
                                />
                              </div>
                            )}
                          </div>

                          {/* Lặp lại hàng chờ khi hết bài */}
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5 max-w-[80%]">
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Xoay vòng lặp lại hàng chờ</span>
                              <span className="text-[10px] text-zinc-550 dark:text-zinc-400 leading-relaxed">Tự động xoay vòng đăng lại các bài viết cũ nếu số lượng giờ đăng nhiều hơn bài viết.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setRepeatQueue(!repeatQueue)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 outline-none cursor-pointer flex-shrink-0 ${repeatQueue ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-300 ${repeatQueue ? "translate-x-6" : "translate-x-1"
                                  }`}
                              />
                            </button>
                          </div>

                          {/* Tự động viết và đăng bài */}
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5 max-w-[80%]">
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tự động viết bài bằng AI</span>
                              <span className="text-[10px] text-zinc-550 dark:text-zinc-400 leading-relaxed">AI tự sinh nội dung mới dựa trên chủ đề khi đến khung giờ đăng tiếp theo.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAutoWritePost(!autoWritePost)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 outline-none cursor-pointer flex-shrink-0 ${autoWritePost ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-300 ${autoWritePost ? "translate-x-6" : "translate-x-1"
                                  }`}
                              />
                            </button>
                          </div>

                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={handleSaveSetup}
                          disabled={submitting}
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-500/10 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang lưu thiết lập...</span>
                            </>
                          ) : (
                            <span>Lưu thiết lập</span>
                          )}
                        </button>

                      </div>

                    </div>

                  </div>
                </div>
              ) : (
                /* Campaign mode markup we wrote */
                <div className="flex flex-col gap-8 animate-fade-in">
                  {/* Campaign configuration mode */}
                  {!tempSetupId ? (
                    <>
                      {/* Ngành hàng / Lĩnh vực Input block */}
                      <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm font-bold text-zinc-250 dark:text-zinc-200">Ngành kinh doanh hoặc Sản phẩm của bạn</h3>
                          <p className="text-[11px] text-zinc-500">Nhập lĩnh vực kinh doanh của bạn để AI tự động tối ưu hóa chiến dịch chỉ với 1 click.</p>
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={campaignNiche}
                            onChange={(e) => setCampaignNiche(e.target.value)}
                            placeholder="Ví dụ: Mỹ phẩm thiên nhiên, Khóa học AI, Đồ gia dụng thông minh, Spa..."
                            className="flex-1 bg-zinc-950/60 border border-zinc-850 focus:border-blue-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-all text-zinc-200 placeholder:text-zinc-650"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleOptimizeCampaign();
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleOptimizeCampaign}
                            disabled={isOptimizingCampaign || !campaignNiche.trim()}
                            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 active:scale-[0.98]"
                          >
                            {isOptimizingCampaign ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Đang tối ưu...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Tối ưu bằng AI</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Settings grid */}
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                        {/* Left Column Settings */}
                        <div className="xl:col-span-7 flex flex-col gap-6">
                          {/* Cài đặt nội dung */}
                          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
                            <h2 className="text-base font-bold text-zinc-200 border-b border-zinc-850 pb-4 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-blue-500" />
                              <span>Cài đặt nội dung bài viết</span>
                            </h2>

                            {/* Tên thiết lập */}
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tên thiết lập chiến dịch</label>
                              <input
                                type="text"
                                value={setupName}
                                onChange={(e) => setSetupName(e.target.value)}
                                placeholder="Ví dụ: Chiến dịch Mỹ phẩm thiên nhiên - 08/07"
                                className="w-full bg-zinc-950/60 border border-zinc-850 focus:border-blue-500/50 rounded-xl px-4 py-3 text-xs outline-none text-zinc-200 placeholder:text-zinc-650"
                              />
                            </div>

                            {/* Ngôn ngữ & Độ dài */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ngôn ngữ bài viết</label>
                                <select
                                  value={campaignLanguage}
                                  onChange={(e) => setCampaignLanguage(e.target.value)}
                                  className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-blue-500/50"
                                >
                                  <option value="vi">Tiếng Việt</option>
                                  <option value="en">English</option>
                                </select>
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Độ dài bài viết</label>
                                <div className="flex flex-wrap gap-1.5 mt-0.5">
                                  {POST_LENGTHS.map((len) => (
                                    <button
                                      key={len.value}
                                      type="button"
                                      onClick={() => setCampaignPostLength(len.value)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${campaignPostLength === len.value
                                        ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10"
                                        : "bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:border-zinc-800 hover:text-zinc-300"
                                        }`}
                                    >
                                      {len.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Phong cách viết */}
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phong cách viết</label>
                              <div className="flex flex-wrap gap-1.5 mt-0.5">
                                {WRITING_STYLES.map((style) => (
                                  <button
                                    key={style.value}
                                    type="button"
                                    onClick={() => setCampaignWritingStyle(style.value)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${campaignWritingStyle === style.value
                                      ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10"
                                      : "bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:border-zinc-800 hover:text-zinc-300"
                                      }`}
                                  >
                                    {style.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Yêu cầu cá nhân hóa */}
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Yêu cầu cá nhân hóa (không bắt buộc)</label>
                              <textarea
                                value={campaignCustomPrompt}
                                onChange={(e) => setCampaignCustomPrompt(e.target.value)}
                                placeholder="Ví dụ: Tập trung làm nổi bật các chương trình ưu đãi, voucher giảm giá..."
                                rows={3}
                                className="w-full bg-zinc-950/60 border border-zinc-850 focus:border-blue-500/50 rounded-xl p-3 text-xs outline-none text-zinc-300 placeholder:text-zinc-650 resize-none"
                              />
                            </div>

                            {/* Contact details */}
                            <div className="flex flex-col gap-3 border-t border-zinc-850 pt-4">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-0.5 max-w-[80%]">
                                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Thêm thông tin liên hệ</span>
                                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">Tự động chèn hotline, website vào cuối mỗi bài đăng.</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setCampaignIncludeContact(!campaignIncludeContact)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 outline-none cursor-pointer flex-shrink-0 ${campaignIncludeContact ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                                    }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-300 ${campaignIncludeContact ? "translate-x-6" : "translate-x-1"
                                      }`}
                                  />
                                </button>
                              </div>
                              {campaignIncludeContact && (
                                <textarea
                                  value={campaignContactInfo}
                                  onChange={(e) => setCampaignContactInfo(e.target.value)}
                                  placeholder="Nhập hotline, địa chỉ hoặc liên kết mua hàng..."
                                  rows={2}
                                  className="w-full bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-850/80 focus:border-blue-500/50 rounded-lg p-2 text-xs outline-none text-zinc-850 dark:text-zinc-300 placeholder:text-zinc-500 dark:placeholder:text-zinc-650 resize-none shadow-inner animate-fade-in"
                                />
                              )}
                            </div>

                          </div>
                        </div>

                        {/* Right Column Settings */}
                        <div className="xl:col-span-5 flex flex-col gap-6 xl:sticky xl:top-24 self-start">
                          {/* Fanpage Selector */}
                          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chọn tài khoản để đăng bài</label>
                            <div className="flex flex-col gap-2.5 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                              {fanpages.map(page => {
                                const isChecked = selectedPages.includes(page.id);
                                return (
                                  <button
                                    key={page.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedPages(prev => prev.includes(page.id) ? prev.filter(id => id !== page.id) : [...prev, page.id]);
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer ${isChecked
                                      ? "bg-blue-600/10 border-blue-500/50 shadow-sm shadow-blue-500/5"
                                      : "bg-zinc-950/40 border-zinc-850/60 hover:border-zinc-800"
                                      }`}
                                  >
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-700 bg-zinc-950"
                                      }`}>
                                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className={`text-xs font-bold transition-all ${isChecked ? "text-blue-400" : "text-zinc-350"}`}>{page.name}</span>
                                      <span className="text-[10px] text-zinc-550">ID: {page.fb_page_id}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Lịch trình đăng bài */}
                          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cấu hình lịch đăng chiến dịch</h3>

                            {/* Weekly weekdays picker */}
                            <div className="flex flex-col gap-3">
                              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Ngày đăng bài trong tuần</label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { name: "Thứ 2", value: 1 },
                                  { name: "Thứ 3", value: 2 },
                                  { name: "Thứ 4", value: 3 },
                                  { name: "Thứ 5", value: 4 },
                                  { name: "Thứ 6", value: 5 },
                                  { name: "Thứ 7", value: 6 },
                                  { name: "Chủ nhật", value: 7 }
                                ].map(day => {
                                  const isSelected = scheduleDays.includes(day.value);
                                  return (
                                    <button
                                      key={day.value}
                                      type="button"
                                      onClick={() => {
                                        setScheduleDays(prev => prev.includes(day.value) ? prev.filter(d => d !== day.value) : [...prev, day.value]);
                                      }}
                                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${isSelected
                                        ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10"
                                        : "bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:border-zinc-800"
                                        }`}
                                    >
                                      {day.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Giờ đăng bài */}
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Giờ đăng bài</label>
                                <button
                                  type="button"
                                  onClick={() => setScheduleTimes(prev => [...prev, "12:00"])}
                                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-all cursor-pointer"
                                >
                                  + Thêm giờ đăng
                                </button>
                              </div>
                              <div className="flex flex-col gap-2">
                                {scheduleTimes.map((time, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <input
                                      type="time"
                                      value={time}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setScheduleTimes(prev => prev.map((t, i) => i === idx ? val : t));
                                      }}
                                      className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-blue-500/50"
                                    />
                                    {scheduleTimes.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => setScheduleTimes(prev => prev.filter((_, i) => i !== idx))}
                                        className="text-zinc-500 hover:text-red-400 p-2 border border-zinc-850 rounded-xl bg-zinc-950/20 cursor-pointer"
                                        title="Xóa"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Tùy chọn tự động hóa chiến dịch */}
                            <div className="flex flex-col gap-4 border-t border-zinc-850 pt-4">
                              <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-0.5 max-w-[80%]">
                                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tự động viết và đăng bài</span>
                                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">Hệ thống tự viết bài mới theo chủ đề khi tới khung giờ đã đặt.</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setCampaignAutoPost(!campaignAutoPost)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 outline-none cursor-pointer flex-shrink-0 ${campaignAutoPost ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                                    }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-300 ${campaignAutoPost ? "translate-x-6" : "translate-x-1"
                                      }`}
                                  />
                                </button>
                              </div>

                              <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-0.5 max-w-[80%]">
                                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Duyệt bài trước khi xuất bản</span>
                                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">Đăng ở trạng thái chờ duyệt (Review) thay vì tự động đăng ngay (Instant).</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setCampaignPublishMode(campaignPublishMode === "review" ? "instant" : "review")}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 outline-none cursor-pointer flex-shrink-0 ${campaignPublishMode === "review" ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                                    }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-300 ${campaignPublishMode === "review" ? "translate-x-6" : "translate-x-1"
                                      }`}
                                  />
                                </button>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <button
                              type="button"
                              onClick={handleCreateSetup}
                              disabled={submitting}
                              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-500/10 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Đang tạo thiết lập...</span>
                                </>
                              ) : (
                                <span>Tạo thiết lập chiến dịch</span>
                              )}
                            </button>

                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Step 2: Campaign Topics generation & approval */
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-fade-in">

                      {/* Left Column: Generate & List topics */}
                      <div className="xl:col-span-7 flex flex-col gap-6">

                        {/* Tạo chủ đề bằng AI */}
                        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
                          <div className="flex flex-col gap-1 border-b border-zinc-850 pb-3">
                            <h2 className="text-base font-bold text-zinc-200">Tạo chủ đề bài viết bằng AI</h2>
                            <p className="text-[11px] text-zinc-500">AI sẽ tự động sinh danh sách các chủ đề hấp dẫn nhất liên quan đến mô tả của bạn.</p>
                          </div>
                          <textarea
                            value={campaignTopicPrompt}
                            onChange={(e) => setCampaignTopicPrompt(e.target.value)}
                            placeholder="Mô tả nội dung bạn muốn đăng. Ví dụ: Chia sẻ các mẹo làm đẹp, giới thiệu liệu trình chăm sóc da mụn, tư vấn phục hồi da hư tổn..."
                            rows={3}
                            className="w-full bg-zinc-950/60 border border-zinc-850 focus:border-blue-500/50 rounded-xl p-3 text-xs outline-none text-zinc-300 placeholder:text-zinc-650 resize-none"
                          />
                          <div className="flex items-center justify-between gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-zinc-500 uppercase">Số lượng:</span>
                              <select
                                value={campaignTopicCount}
                                onChange={(e) => setCampaignTopicCount(Number(e.target.value))}
                                className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none"
                              >
                                {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n} bài viết</option>)}
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={handleGenerateTopics}
                              disabled={aiGenerating || !campaignTopicPrompt.trim()}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                            >
                              {aiGenerating ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Đang tạo chủ đề...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Tạo danh sách chủ đề</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Danh sách chủ đề đã sinh */}
                        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
                          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                            <h2 className="text-base font-bold text-zinc-200">Danh sách chủ đề đã lập ({campaignGeneratedTopics.length})</h2>
                            <span className="text-[10px] text-amber-500 bg-amber-50/5 px-2.5 py-1 rounded-full border border-amber-500/10 uppercase font-bold tracking-wider">Chờ sinh nội dung bài</span>
                          </div>

                          {campaignGeneratedTopics.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-zinc-550 gap-2 border border-dashed border-zinc-850 rounded-2xl bg-zinc-950/20">
                              <Sparkles className="w-8 h-8 opacity-40 text-blue-500" />
                              <p className="text-xs">Chưa có chủ đề nào được tạo. Hãy sử dụng form AI phía trên!</p>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                              {campaignGeneratedTopics.map((title, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl hover:border-zinc-800 transition-all">
                                  <div className="flex items-center gap-3 truncate">
                                    <span className="w-5 h-5 rounded-full bg-blue-600/15 text-[10px] font-bold text-blue-400 flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                                    <span className="text-xs text-zinc-300 font-semibold truncate">{title}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setCampaignGeneratedTopics(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Nút hoàn tất chuyển về danh sách quản lý chiến dịch */}
                          <button
                            type="button"
                            onClick={() => {
                              setTempSetupId(null);
                              setCampaignGeneratedTopics([]);
                              setCampaignTopicPrompt("");
                              setCampaignSubTab("campaigns");
                              setActiveTab("list");
                              fetchSetups();
                            }}
                            className="w-full mt-2 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                            <span>Hoàn tất thiết lập & Đi tới Quản lý chiến dịch</span>
                          </button>
                        </div>

                      </div>

                      {/* Right Column: Add topic manually */}
                      <div className="xl:col-span-5 flex flex-col gap-6 xl:sticky xl:top-24 self-start">
                        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Thêm chủ đề thủ công</h3>
                            <p className="text-[10px] text-zinc-550">Nếu bạn muốn thêm một chủ đề cụ thể của riêng bạn vào chiến dịch này.</p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={campaignNewTopicInput}
                              onChange={(e) => setCampaignNewTopicInput(e.target.value)}
                              placeholder="Nhập tiêu đề chủ đề..."
                              className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-blue-500/50"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddManualTopic();
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddManualTopic}
                              disabled={!campaignNewTopicInput.trim()}
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                              Thêm
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === "list" ? (
            /* Tab list of scheduled posts / setups campaigns */
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Sub-tab switcher */}
              <div className="flex bg-zinc-950/60 p-1 rounded-xl border border-zinc-850/80 self-start">
                <button
                  type="button"
                  onClick={() => setCampaignSubTab("posts")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${campaignSubTab === "posts"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  📅 Hàng chờ bài viết đã lên lịch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCampaignSubTab("campaigns");
                    fetchSetups();
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${campaignSubTab === "campaigns"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  ⚙️ Chiến dịch tự động bằng AI
                </button>
              </div>

              {campaignSubTab === "posts" ? (
                /* Tab list of scheduled posts */
                <div className="glass-panel rounded-2xl p-6 lg:p-8">
                  <h2 className="text-lg font-semibold text-zinc-250 mb-6 flex items-center justify-between border-b border-zinc-850 pb-3">
                    <span>Danh sách bài viết đã lên lịch ({scheduledPosts.length})</span>
                    {!token?.startsWith("mock_") && (
                      <button
                        onClick={fetchScheduledPosts}
                        className="text-xs text-zinc-500 hover:text-blue-455 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        Làm mới
                      </button>
                    )}
                  </h2>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-555 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      <span className="text-sm">Đang tải danh sách bài đăng...</span>
                    </div>
                  ) : scheduledPosts.length === 0 ? (
                    <div className="text-center py-12 text-zinc-650 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
                      <Clock className="w-8 h-8 mx-auto text-zinc-700 mb-2.5" />
                      <p className="text-sm font-medium">Chưa có bài đăng nào được lên lịch</p>
                      <p className="text-xs text-zinc-600 mt-1">Sử dụng form thiết lập để lên lịch cho các bài đăng của bạn.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {scheduledPosts.map((post) => {
                        const matchedPages = fanpages.filter(p => post.fanpage_ids.includes(p.id));

                        return (
                          <div key={post.id} className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-800 transition-all animate-fade-in">
                            <div>
                              <div className="flex items-center gap-2 border-b border-zinc-850/50 pb-2.5 mb-2.5">
                                <div className="flex -space-x-1 overflow-hidden">
                                  {matchedPages.map((page) => (
                                    <div key={page.id} className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-400 overflow-hidden" title={page.name}>
                                      {page.avatar_url ? <img src={page.avatar_url} alt="" className="w-full h-full object-cover" /> : page.name.charAt(0)}
                                    </div>
                                  ))}
                                </div>
                                <span className="text-[10px] text-zinc-550 font-bold truncate">
                                  {matchedPages.map(p => p.name).join(", ")}
                                </span>

                                <span className={`text-[9px] font-bold uppercase ml-auto px-2 py-0.5 rounded-full border ${post.status === "published"
                                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : post.status === "pending"
                                    ? "bg-blue-500/10 text-blue-450 border-blue-500/20"
                                    : post.status === "failed"
                                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                                      : "bg-zinc-800 text-zinc-550 border-zinc-800"
                                  }`}>
                                  {post.status === "published" ? "Đã đăng" : post.status === "pending" ? "Đang chờ" : post.status === "failed" ? "Lỗi" : "Bản nháp"}
                                </span>
                              </div>

                              <p className="text-xs text-zinc-350 leading-relaxed whitespace-pre-wrap line-clamp-4">{post.content}</p>

                              {(() => {
                                const gallery = post.media_gallery || (post.image_url ? [{ url: post.image_url, type: "image" as const }] : []);
                                if (gallery.length === 0) return null;

                                const first = gallery[0];
                                return (
                                  <div className="mt-3 rounded-lg overflow-hidden border border-zinc-850 max-h-[120px] relative bg-zinc-950 flex items-center justify-center">
                                    {first.type === "video" ? (
                                      <div className="w-full h-[120px] relative">
                                        <video src={first.url} muted className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                          <span className="text-[9px] font-extrabold uppercase bg-blue-600/90 text-white px-1.5 py-0.5 rounded shadow">VIDEO</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <img src={first.url} alt="Post Attachment" className="w-full h-full object-cover" />
                                    )}
                                    {gallery.length > 1 && (
                                      <div className="absolute bottom-1 right-1 bg-black/75 text-[9px] font-bold text-white px-1.5 py-0.5 rounded shadow-sm border border-zinc-800">
                                        +{gallery.length - 1} ảnh
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>

                            <div>
                              <div className="border-t border-zinc-850/80 pt-3 mt-2 flex items-center justify-between text-[11px] text-zinc-555">
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-zinc-650 uppercase font-semibold">Giờ đăng</span>
                                  <span className="text-zinc-400 font-medium">
                                    {new Date(post.scheduled_at).toLocaleString("vi-VN")}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {post.status !== "published" && (
                                    <button
                                      type="button"
                                      onClick={() => handlePublishImmediately(post.id)}
                                      disabled={publishingId === post.id}
                                      className="px-2.5 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer active:scale-95 border border-blue-500/10 hover:border-transparent flex-shrink-0"
                                      title="Đăng ngay lập tức lên các trang đã chọn"
                                    >
                                      {publishingId === post.id ? (
                                        <>
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          Đang đăng...
                                        </>
                                      ) : (
                                        <>
                                          <Send className="w-3 h-3" />
                                          Đăng ngay
                                        </>
                                      )}
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-zinc-600 hover:text-red-400 p-1.5 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                                    title="Hủy lịch & Xóa"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {post.status === "failed" && post.error_log && (
                                <div className="mt-3 p-2 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg text-[10px] font-mono break-all max-h-[80px] overflow-y-auto">
                                  <strong>Lỗi:</strong> {post.error_log}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Campaign configurations manager list */
                <div className="flex flex-col gap-6 animate-fade-in">
                  <div className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Trạng thái:</span>
                      <select
                        value={setupFilter}
                        onChange={(e) => setSetupFilter(e.target.value as any)}
                        className="bg-zinc-955 dark:bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none"
                      >
                        <option value="all">Tất cả chiến dịch</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="paused">Tạm dừng</option>
                        <option value="completed">Đã hoàn thành</option>
                      </select>
                    </div>
                    <div className="w-full sm:w-64">
                      <input
                        type="text"
                        value={setupSearch}
                        onChange={(e) => setSetupSearch(e.target.value)}
                        placeholder="Tìm kiếm chiến dịch..."
                        className="w-full bg-zinc-955 dark:bg-zinc-950 border border-zinc-850 focus:border-blue-500/50 rounded-lg px-3.5 py-1.5 text-xs outline-none text-zinc-300"
                      />
                    </div>
                  </div>

                  {setups.length === 0 ? (
                    <div className="text-center py-12 text-zinc-650 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
                      <Sliders className="w-8 h-8 mx-auto text-zinc-700 mb-2.5 animate-pulse" />
                      <p className="text-sm font-medium">Chưa có chiến dịch AI nào</p>
                      <p className="text-xs text-zinc-600 mt-1">Bấm mục "Lên lịch & Tạo bài AI" ở thanh bên để tạo chiến dịch mới của bạn.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {setups.map((setup) => {
                        const isExpanded = expandedSetup === setup.id;
                        const matchedPages = fanpages.filter(p => setup.fanpage_ids.includes(p.id));

                        return (
                          <div key={setup.id} className="glass-panel rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 animate-fade-in">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{setup.name}</h3>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5 text-[10px] text-zinc-555">
                                  <span className="font-bold text-zinc-400 uppercase">{setup.writing_style}</span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                  <span>Độ dài: {setup.post_length}</span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                  <span>{setup.topics_count || 0} chủ đề</span>
                                  {matchedPages.length > 0 && (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                      <span>Đăng lên: {matchedPages.map(p => p.name).join(", ")}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSetup(setup.id)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${setup.status === "active"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-green-400"
                                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    }`}
                                >
                                  {setup.status === "active" ? (
                                    <>
                                      <Play className="w-3 h-3 text-emerald-600 dark:text-green-400" />
                                      <span>Hoạt động</span>
                                    </>
                                  ) : (
                                    <>
                                      <Pause className="w-3 h-3 text-zinc-500" />
                                      <span>Tạm dừng</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleExpandSetup(setup.id)}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronDown className="w-3 h-3" />
                                      <span>Đóng danh sách</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronRight className="w-3 h-3" />
                                      <span>Xem chủ đề ({setup.topics_count || 0})</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteSetup(setup.id)}
                                  className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                  title="Xóa chiến dịch"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-zinc-850/60 pt-4 mt-2 flex flex-col gap-4 animate-fade-in">

                                {/* Batch Action Panel */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15 rounded-2xl">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">🤖 Tự động soạn thảo hàng loạt bằng AI</span>
                                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                      Hệ thống sẽ chạy ngầm để viết bài chi tiết cho tất cả {setupTopics.filter(t => t.status === "pending").length} chủ đề đang chờ.
                                      Bạn có thể xem, chỉnh sửa bài viết bất cứ lúc nào trước khi đăng.
                                    </span>
                                  </div>

                                  {setupTopics.some(t => t.status === "pending" || t.status === "failed") && (
                                    <button
                                      type="button"
                                      disabled={batchGeneratingSetupId === setup.id}
                                      onClick={() => handleBatchGenerateContents(setup.id)}
                                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                                    >
                                      {batchGeneratingSetupId === setup.id ? (
                                        <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          <span>Đang soạn thảo hàng loạt...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3.5 h-3.5" />
                                          <span>Soạn bài viết hàng loạt</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Danh sách bài đăng AI của chiến dịch:</span>
                                {loadingTopics ? (
                                  <div className="flex items-center justify-center py-6">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                  </div>
                                ) : setupTopics.length === 0 ? (
                                  <p className="text-xs text-zinc-555 italic py-2">Chiến dịch chưa có chủ đề bài viết nào.</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {setupTopics.map((topic) => (
                                      <div key={topic.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 rounded-xl flex flex-col gap-3 justify-between hover:border-zinc-300 dark:hover:border-zinc-800 transition-all animate-fade-in shadow-sm">
                                        <div>
                                          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-2 mb-2 gap-2">
                                            <span className="text-xs text-zinc-800 dark:text-zinc-200 font-bold truncate" title={topic.title}>{topic.title}</span>
                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 border ${topic.status === "published"
                                              ? "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border-emerald-500/20 dark:border-green-500/20"
                                              : topic.status === "generated"
                                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                                : topic.status === "failed"
                                                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                                                  : "bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                                              }`}>
                                              {topic.status === "published"
                                                ? "Đã đăng"
                                                : topic.status === "generated"
                                                  ? "Chờ duyệt"
                                                  : topic.status === "failed"
                                                    ? "Lỗi đăng"
                                                    : "Đang chờ"}
                                            </span>
                                          </div>

                                          {topic.generated_content ? (
                                            <p className="text-[11px] text-zinc-800 dark:text-zinc-400 leading-relaxed line-clamp-3 whitespace-pre-line">{topic.generated_content}</p>
                                          ) : (
                                            <p className="text-[10px] text-zinc-650 italic">Nội dung đang chờ AI soạn thảo...</p>
                                          )}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-900 text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                                          <span>Số thứ tự: {topic.sort_order}</span>
                                          <div className="flex items-center gap-2">
                                            {(!topic.generated_content || topic.status === "pending" || topic.status === "failed") && (
                                              <button
                                                type="button"
                                                disabled={generatingTopicId === topic.id}
                                                onClick={() => handleGenerateTopicContent(topic.id)}
                                                className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-[9px] transition-all flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                                              >
                                                {generatingTopicId === topic.id ? (
                                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                ) : (
                                                  <Sparkles className="w-2.5 h-2.5" />
                                                )}
                                                <span>Soạn bằng AI</span>
                                              </button>
                                            )}
                                            {topic.generated_content && topic.status !== "published" && (
                                              <button
                                                type="button"
                                                disabled={approvingTopic === topic.id}
                                                onClick={() => handleApproveTopic(topic.id)}
                                                className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded font-bold text-[9px] transition-all flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                                              >
                                                {approvingTopic === topic.id ? (
                                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                ) : (
                                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                )}
                                                <span>Duyệt đăng</span>
                                              </button>
                                            )}
                                            {topic.generated_content && (
                                              <button
                                                type="button"
                                                onClick={() => handleOpenReview(topic)}
                                                className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 rounded font-bold text-[9px] transition-all flex items-center gap-0.5 cursor-pointer"
                                              >
                                                <Edit3 className="w-2.5 h-2.5" />
                                                <span>Sửa & Xem</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Tab automation activation */
            <div className="flex flex-col gap-8 animate-fade-in">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                {/* Left section: Main controls and Active Fanpages */}
                <div className="xl:col-span-8 flex flex-col gap-6">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-zinc-200">Danh sách Fanpage kết nối</h2>
                      <p className="text-zinc-500 text-xs mt-1">Lựa chọn và bật/tắt tự động hóa AI cho các Fanpage đã kết nối Zeflyo.</p>
                    </div>
                    <button
                      onClick={fetchFanpagesList}
                      className="self-start sm:self-center flex items-center gap-2 py-1.5 px-3 text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Làm mới danh sách
                    </button>
                  </div>

                  {fanpages.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-10 text-center flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-805 flex items-center justify-center text-zinc-500">
                        <Sliders className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-200">Không tìm thấy Trang nào</h3>
                        <p className="text-zinc-500 text-xs max-w-sm mt-1">Chúng tôi không tìm thấy bất kỳ Fanpage Facebook nào được liên kết với tài khoản này. Hãy xác minh trong Meta Developer Console.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fanpages.map((page) => (
                        <div key={page.id} className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-4">

                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-850 flex items-center justify-center font-bold text-white text-lg relative overflow-hidden shadow-inner">
                              {page.avatar_url ? (
                                <img src={page.avatar_url} alt={page.name} className="w-full h-full object-cover" />
                              ) : (
                                page.name.charAt(0)
                              )}
                              <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-blue-500 border border-zinc-900 m-0.5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-zinc-250 truncate" title={page.name}>{page.name}</h4>
                              <span className="text-[10px] text-zinc-500 font-mono select-all">ID: {page.fb_page_id}</span>

                              <div className="flex items-center gap-1.5 mt-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${page.is_active ? "bg-green-500 animate-pulse" : "bg-zinc-650"}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${page.is_active ? "text-green-400" : "text-zinc-500"}`}>
                                  {page.is_active ? "AI Agent Hoạt động" : "Ngoại tuyến"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Action footer */}
                          <div className="pt-3 border-t border-zinc-850 flex items-center justify-between">
                            <span className="text-[10px] text-zinc-500">Sẵn sàng nhận diện & phản hồi</span>

                            <button
                              disabled={actionLoading === page.id}
                              onClick={() => togglePageAutomation(page.id, page.fb_page_id)}
                              className={`flex items-center gap-2 py-1 px-3 rounded-lg text-xs font-semibold select-none transition-all cursor-pointer ${page.is_active
                                ? "bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-850"
                                }`}
                            >
                              {actionLoading === page.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : page.is_active ? (
                                <>
                                  <Power className="w-3.5 h-3.5 text-green-400" />
                                  Hoạt động
                                </>
                              ) : (
                                <>
                                  <Power className="w-3.5 h-3.5 text-zinc-500" />
                                  Đã tắt
                                </>
                              )}
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right section: Webhook status and logs */}
                <div className="xl:col-span-4 flex flex-col gap-6">

                  {/* Webhook Connection status panel */}
                  <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                      <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-blue-500" />
                        Trạng thái Cổng kết nối
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">v20.0 SSL</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850">
                        <span className="text-xs text-zinc-450">Bộ nhận Webhook</span>
                        <span className="text-xs text-green-455 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Đang lắng nghe (200 OK)
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850">
                        <span className="text-xs text-zinc-455">Hàng đợi Redis Horizon</span>
                        <span className="text-xs text-green-455 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Hoạt động (0 jobs)
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850">
                        <span className="text-xs text-zinc-455">Phát sóng WebSocket</span>
                        <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Soketi Trực tuyến
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Logs Panel */}
                  <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 min-h-[300px]">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                      <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-violet-500" />
                        Hoạt động Thời gian thực
                      </span>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    </div>

                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px] pr-1">
                      {logs.map((log) => (
                        <div key={log.id} className="p-3 bg-zinc-950/30 rounded-xl border border-zinc-850 hover:bg-zinc-900/10 transition-colors flex flex-col gap-1">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-xs font-bold text-zinc-350 truncate">{log.page}</span>
                            <span className="text-[10px] text-zinc-550 shrink-0">{log.time}</span>
                          </div>
                          <p className="text-xs text-zinc-455 leading-relaxed">{log.event}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer Branding */}
        <Footer />

      </div>

      {/* Global Notifications */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 p-4 rounded-xl bg-zinc-900 border border-green-500/30 text-green-400 text-sm shadow-2xl flex items-center gap-3 z-50 animate-fade-in">
          <Check className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 p-4 rounded-xl bg-zinc-900 border border-red-500/30 text-red-400 text-sm shadow-2xl flex items-center gap-3 z-50 animate-fade-in">
          <AlertTriangle className="w-5 h-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Topic Review / Edit Modal */}
      {reviewTopic && (() => {
        const setupForReview = setups.find(s => s.id === reviewTopic.auto_setup_id);
        const matchedPagesForReview = setupForReview
          ? fanpages.filter(p => setupForReview.fanpage_ids.includes(p.id))
          : [];
        const previewPageName = matchedPagesForReview[0]?.name || "Zeflyo Fanpage";
        const previewPageAvatar = matchedPagesForReview[0]?.avatar_url || null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 animate-fade-in">
            <div className="w-full max-w-7xl h-[85vh] max-h-[850px] rounded-3xl border border-zinc-800 shadow-2xl bg-zinc-900 text-zinc-100 dark:bg-[#0c0c12] flex flex-col justify-between overflow-hidden">

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 p-6 flex-shrink-0">
                <h3 className="text-lg font-extrabold flex items-center gap-2.5 text-zinc-150 uppercase tracking-wider">
                  <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                  <span>Duyệt & Chỉnh sửa bài viết</span>
                </h3>
                <button onClick={() => setReviewTopic(null)} className="p-2 rounded-xl transition-all hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reviewError && (
                <div className="mx-6 my-2 p-4 text-xs font-semibold rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-fade-in flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-bounce text-red-500" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Side-by-Side Content Grid */}
              <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-0">

                  {/* Left Column: Form Editor (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col gap-4 h-full min-h-0">
                    <div className="flex flex-col gap-1.5 flex-1 min-h-0">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex-shrink-0">Nội dung bài viết</label>
                      <textarea
                        value={reviewContent}
                        onChange={e => setReviewContent(e.target.value)}
                        className="flex-1 w-full bg-zinc-955 border border-zinc-850 rounded-2xl p-5 text-sm outline-none text-zinc-200 placeholder:text-zinc-655 resize-none focus:border-blue-500/50 leading-relaxed custom-scrollbar shadow-inner"
                        placeholder="Nhập nội dung bài viết..."
                      />
                    </div>

                    <div className="flex flex-col gap-4 flex-shrink-0">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Đường dẫn hình ảnh (URL)</label>
                        <input
                          type="text"
                          value={reviewImageUrl}
                          onChange={e => setReviewImageUrl(e.target.value)}
                          className="w-full bg-zinc-955 border border-zinc-850 focus:border-blue-500/50 rounded-xl px-4 py-2.5 text-xs outline-none text-zinc-300 placeholder:text-zinc-655"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="flex items-center justify-center border border-dashed border-zinc-800 hover:border-blue-500/40 rounded-2xl p-4 cursor-pointer transition-all hover:bg-blue-500/5 bg-zinc-955/20 dark:bg-zinc-950/20">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadReviewImage}
                            className="hidden"
                          />
                          {uploadingImage ? (
                            <span className="flex items-center gap-2.5 text-xs font-bold text-blue-400">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang tải ảnh lên hệ thống...</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-2.5 text-xs font-bold text-blue-400">
                              <ImageIcon className="w-5 h-5" />
                              <span>Tải ảnh từ máy tính</span>
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Facebook Post Live Mockup (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-3 h-full min-h-0">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex-shrink-0">Facebook Live Preview</label>

                    <div className="flex-1 min-h-0 bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl text-zinc-200 flex flex-col">

                      {/* Post Author Header */}
                      <div className="p-4 flex items-center justify-between border-b border-zinc-850/30 flex-shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md overflow-hidden flex-shrink-0">
                            {previewPageAvatar ? (
                              <img src={previewPageAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              previewPageName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-100">{previewPageName}</span>
                            <span className="text-[10px] text-zinc-550 flex items-center gap-1">
                              <span>Vừa xong</span>
                              <span>•</span>
                              <Globe className="w-3 h-3 text-zinc-550" />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scrollable Message & Image Area */}
                      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col bg-zinc-955/10">
                        {/* Post Message Body */}
                        <div className="p-4 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {reviewContent || <span className="text-zinc-650 italic">Nhập hoặc sinh nội dung nháp để xem thử tại đây...</span>}
                        </div>

                        {/* Post Image Preview */}
                        {reviewImageUrl ? (
                          <div className="relative w-full h-[260px] bg-black/60 border-t border-zinc-850 flex items-center justify-center overflow-hidden flex-shrink-0 mt-auto">
                            <img src={reviewImageUrl} alt="Post preview image" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setReviewImageUrl("")}
                              className="absolute top-3 right-3 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-all shadow-md cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-[120px] bg-zinc-950/40 border-t border-dashed border-zinc-850 flex flex-col items-center justify-center text-zinc-650 gap-2 flex-shrink-0 mt-auto">
                            <ImageIcon className="w-7 h-7 text-zinc-700" />
                            <span className="text-[10px] italic">Bài đăng chưa có hình ảnh đính kèm</span>
                          </div>
                        )}
                      </div>

                      {/* Facebook Action Bar Mock */}
                      <div className="px-4 py-3 border-t border-zinc-850 flex items-center justify-between text-[11px] font-bold text-zinc-500 select-none flex-shrink-0 bg-[#18181b]">
                        <span className="hover:text-zinc-300 cursor-pointer">👍 Thích</span>
                        <span className="hover:text-zinc-300 cursor-pointer">💬 Bình luận</span>
                        <span className="hover:text-zinc-300 cursor-pointer">↩️ Chia sẻ</span>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

              {/* Action Footer */}
              <div className="flex gap-4 border-t border-zinc-800 p-6 flex-shrink-0 bg-zinc-950/40">
                <button
                  onClick={handleSaveDraftTopic}
                  disabled={reviewSubmitting || uploadingImage}
                  className="flex-1 py-3.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Lưu bản nháp
                </button>
                <button
                  onClick={handleSaveAndPublishTopic}
                  disabled={reviewSubmitting || uploadingImage || !reviewContent.trim()}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-650 to-indigo-650 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  {reviewSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Duyệt & Đăng bài</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
