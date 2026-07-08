"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  User, 
  LogOut, 
  RefreshCw, 
  Sliders, 
  Activity, 
  Bell, 
  Power, 
  Loader2,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Database,
  MessageSquare,
  Calendar,
  Globe,
  Sun,
  Moon,
  Home,
  ArrowLeft,
  Zap,
  Clock,
  Image as ImageIcon,
  ChevronDown,
  Play,
  Sparkles,
  Star,
  Check,
  Menu,
  X
} from "lucide-react";

// Inline Facebook SVG Icon (since Lucide removed brand icons)
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={props.className}
      {...props}
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
    </svg>
  );
}

interface Fanpage {
  id: number;
  user_id: string | number;
  fb_page_id: string;
  name: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string | number;
  name: string;
  email: string;
  avatar: string | null;
}

const translations = {
  en: {
    title: "Omnichannel AI Automation",
    subtitle: "Connect your Facebook page, synchronize access keys, and deploy automated intelligent responders instantly.",
    loginFb: "Continue with Facebook",
    mockLogin: "Mock Dev Mode (Demo Sandbox)",
    backendLogin: "Dev Login (Real Backend)",
    devUtilities: "Developer Utilities",
    serverSettings: "Server Connection Settings",
    apiEndpoint: "Backend API Endpoint",
    appId: "Facebook App ID",
    saveConfig: "Save Configurations",
    servicesOnline: "Services Online",
    authSecure: "OAuth 2.0 Secure",
    metaConsole: "Meta Console",
    activateAutomations: "Activate Automations",
    activateSub: "Select and toggle the specific Facebook Pages connected to your Zeflyo auto-responder.",
    refreshList: "Refresh List",
    noPages: "No Pages Detected",
    noPagesSub: "We couldn't detect any managed Facebook Fanpages linked to this Facebook Account. Verify your permissions in Meta Developer Console.",
    aiAgentLive: "AI Agent Live",
    offline: "Offline",
    toggleAuto: "Toggle Automation State",
    recentActivity: "Recent Activity Log",
    activitySub: "Live status updates and processing reports.",
    syncServices: "Synchronizing with system services...",
    authSuccess: "Authenticated successfully with Facebook!",
    loginSuccess: "Logged into mock developer mode!",
    backendLoginSuccess: "Authenticated successfully in Backend Developer Mode!",
    pageStatusUpdated: "Fanpage status updated successfully",
    unauthorizedPage: "Unauthorized to access this page",
    connectionError: "Connection error. Make sure your backend server is running.",
    sdkNotLoaded: "Facebook SDK has not loaded yet. Try Mock Login below or check your App ID.",
    signOut: "Sign Out",
    gatewayStatus: "Real-time Gateway Status",
    webhookReceiver: "Webhook Receiver",
    listening: "Listening (200 OK)",
    redisQueue: "Redis Queue Horizon",
    activeJobs: "Active (0 jobs)",
    websocketBroadcasting: "WebSocket Broadcasting",
    soketiOnline: "Soketi Online",
    liveActivity: "Live Activity Feeds",
    logReady: "Auto-reply triggers & logs ready",
    active: "Active",
    deactivated: "Deactivated"
  },
  vi: {
    title: "Tự Động Hóa AI Đa Kênh",
    subtitle: "Kết nối trang Facebook của bạn, đồng bộ hóa mã truy cập và triển khai các phản hồi thông minh tự động ngay lập tức.",
    loginFb: "Tiếp tục với Facebook",
    mockLogin: "Chế độ Giả lập (Hộp cát Demo)",
    backendLogin: "Đăng nhập Developer (Backend thật)",
    devUtilities: "Công cụ Nhà phát triển",
    serverSettings: "Cấu hình Kết nối Máy chủ",
    apiEndpoint: "Địa chỉ Backend API",
    appId: "Facebook App ID",
    saveConfig: "Lưu Cấu hình",
    servicesOnline: "Dịch vụ Hoạt động",
    authSecure: "Bảo mật OAuth 2.0",
    metaConsole: "Bảng điều khiển Meta",
    activateAutomations: "Kích hoạt Tự động hóa",
    activateSub: "Lựa chọn và bật/tắt tự động hóa AI cho các Fanpage đã kết nối Zeflyo.",
    refreshList: "Làm mới danh sách",
    noPages: "Không tìm thấy Trang nào",
    noPagesSub: "Chúng tôi không tìm thấy bất kỳ Fanpage Facebook nào được liên kết với tài khoản Facebook này. Hãy xác minh quyền truy cập trong Meta Developer Console.",
    aiAgentLive: "AI Agent Hoạt động",
    offline: "Ngoại tuyến",
    toggleAuto: "Chuyển trạng thái Tự động hóa",
    recentActivity: "Nhật ký hoạt động gần đây",
    activitySub: "Cập nhật trạng thái trực tiếp và báo cáo xử lý tin nhắn.",
    syncServices: "Đang đồng bộ hóa với hệ thống...",
    authSuccess: "Đăng nhập thành công bằng Facebook!",
    loginSuccess: "Đã đăng nhập chế độ giả lập!",
    backendLoginSuccess: "Đã đăng nhập chế độ Developer với Backend thành công!",
    pageStatusUpdated: "Cập nhật trạng thái Fanpage thành công",
    unauthorizedPage: "Không có quyền truy cập vào Fanpage này",
    connectionError: "Lỗi kết nối. Hãy chắc chắn rằng máy chủ backend đang chạy.",
    sdkNotLoaded: "Facebook SDK chưa được tải xong. Hãy thử chế độ Giả lập hoặc kiểm tra App ID.",
    signOut: "Đăng xuất",
    gatewayStatus: "Trạng thái Cổng kết nối",
    webhookReceiver: "Bộ nhận Webhook",
    listening: "Đang lắng nghe (200 OK)",
    redisQueue: "Hàng đợi Redis Horizon",
    activeJobs: "Hoạt động (0 jobs)",
    websocketBroadcasting: "Phát sóng WebSocket",
    soketiOnline: "Soketi Trực tuyến",
    liveActivity: "Hoạt động Thời gian thực",
    logReady: "Sẵn sàng nhận diện & phản hồi",
    active: "Hoạt động",
    deactivated: "Đã tắt"
  }
};

const landingTranslations = {
  en: {
    badge: "💎 Multichannel AI Marketing Platform",
    headline: "Automate Your Fanpage Management with AI",
    subheadline: "Schedule posts intelligently, write content with Gemini AI, and auto-reply to customers in real-time. Boost your engagement and sales effortlessly.",
    getStarted: "Get Started Now",
    viewGuide: "Read User Guide",
    features: "Features",
    workflow: "How It Works",
    pricing: "Pricing",
    faqs: "FAQs",
    featuresTitle: "Everything You Need to Scale Your Fanpage",
    featuresSub: "Powered by Gemini AI and real-time socket connections to handle all customer interactions and posting schedules.",
    postSchedule: "Automated Post Scheduling",
    postScheduleDesc: "Generate content ideas, write engaging posts with Gemini, attach compressed images, and auto-schedule publishing.",
    chatAgent: "Intelligent Chat Agent",
    chatAgentDesc: "Centralized chat hub. AI automatically handles comments and Messenger private messages with human-like behavior.",
    keywordRules: "Smart Reply Rules",
    keywordRulesDesc: "Set conditions to send automated replies based on keywords, contexts, or user intent automatically.",
    imageCompress: "Automatic Image Compression",
    imageCompressDesc: "In-place smart image compression to save host bandwidth and ensure instant previews on Facebook.",
    step1: "Connect Fanpage",
    step1Desc: "Authenticate securely with Facebook in 2 clicks and select the Fanpages you want to manage.",
    step2: "Set Campaigns",
    step2Desc: "Create topic concepts and customize AI instructions for post tone, length, and content ideas.",
    step3: "AI Auto-Write",
    step3Desc: "Gemini AI generates detailed draft posts complete with formatted text, emojis, and relevant images.",
    step4: "Automated Posting",
    step4Desc: "Approve posts individually or publish automatically on a weekly or fixed date schedule.",
    starter: "Starter",
    starterDesc: "For individuals exploring AI automations.",
    pro: "Pro Plan",
    proDesc: "Best for growing creators and online businesses.",
    enterprise: "Enterprise",
    enterpriseDesc: "For large agencies managing massive networks.",
    pricingSub: "Choose a plan that fits your growth stage. No hidden fees.",
    mostPopular: "Most Popular",
    free: "Free",
    month: "/month",
    customPrice: "Custom",
    faqTitle: "Frequently Asked Questions",
    faqSub: "Find answers to common questions about Zeflyo AI Agent.",
    ctaTitle: "Ready to Revolutionize Your Social Media?",
    ctaSub: "Join thousands of businesses who automate their marketing and support with Zeflyo.",
    backToHome: "Back to Homepage"
  },
  vi: {
    badge: "💎 Nền tảng Tiếp thị & Tự động hóa AI Đa Kênh",
    headline: "Tự Động Hóa Quản Lý Fanpage Bằng Trí Tuệ Nhân Tạo",
    subheadline: "Lên lịch thông minh, soạn bài tự động bằng AI Gemini, và tự phản hồi tin nhắn khách hàng trong thời gian thực. Bứt phá doanh số và tương tác vượt trội.",
    getStarted: "Trải nghiệm ngay",
    viewGuide: "Xem hướng dẫn",
    features: "Tính năng",
    workflow: "Quy trình",
    pricing: "Bảng giá",
    faqs: "Giải đáp",
    featuresTitle: "Đầy đủ công cụ tối ưu cho Fanpage của bạn",
    featuresSub: "Kết hợp sức mạnh từ Gemini AI và kết nối Socket thời gian thực giúp quản lý mọi bài viết và tương tác khách hàng.",
    postSchedule: "Tự động lập lịch bài đăng",
    postScheduleDesc: "AI lên ý tưởng chủ đề, viết bài chi tiết, đính kèm hình ảnh chuẩn và lập lịch đăng tự động theo tuần/ngày.",
    chatAgent: "Hộp chat tập trung & AI Agent",
    chatAgentDesc: "Quản lý tập trung bình luận & tin nhắn. AI tự động đọc hiểu và nhắn tin trả lời khách hàng siêu tốc.",
    keywordRules: "Quy tắc phản hồi từ khóa",
    keywordRulesDesc: "Thiết lập kịch bản gửi tin nhắn tự động khi phát hiện từ khóa phù hợp với nhu cầu tìm hiểu của khách hàng.",
    imageCompress: "Nén ảnh tối ưu tự động",
    imageCompressDesc: "Hình ảnh tải lên được nén thông minh trực tiếp trên máy chủ, tiết kiệm băng thông và xem thử cực nhanh.",
    step1: "Kết nối Fanpage",
    step1Desc: "Đăng nhập an toàn qua Facebook chỉ với 2 click và cấp quyền cho Fanpage bạn muốn chạy AI.",
    step2: "Thiết lập Chiến dịch",
    step2Desc: "Nhập sản phẩm hoặc chủ đề mong muốn, tùy chỉnh độ dài bài viết, văn phong và chỉ dẫn riêng cho AI.",
    step3: "AI Tự động soạn bài",
    step3Desc: "Gemini AI tự động lên danh sách chủ đề và viết sẵn các bài đăng nháp kèm hình ảnh chất lượng.",
    step4: "Duyệt & Đăng bài",
    step4Desc: "Xem trước bài viết dạng Facebook Live-Preview, phê duyệt đăng ngay hoặc để hệ thống tự động đăng theo lịch hẹn.",
    starter: "Trải nghiệm",
    starterDesc: "Dành cho cá nhân khám phá tự động hóa bằng AI.",
    pro: "Gói Pro chuyên nghiệp",
    proDesc: "Tối ưu nhất cho các nhà sáng tạo và chủ shop kinh doanh online.",
    enterprise: "Doanh nghiệp",
    enterpriseDesc: "Dành cho các Agency quản lý hệ thống trang mạng quy mô lớn.",
    pricingSub: "Lựa chọn gói dịch vụ phù hợp với nhu cầu tăng trưởng. Không phát sinh chi phí ẩn.",
    mostPopular: "Khuyên dùng",
    free: "Miễn phí",
    month: "/tháng",
    customPrice: "Liên hệ",
    faqTitle: "Những câu hỏi thường gặp",
    faqSub: "Giải đáp các thắc mắc phổ biến nhất khi sử dụng hệ thống Zeflyo AI Agent.",
    ctaTitle: "Sẵn sàng cách mạng hóa Fanpage của bạn?",
    ctaSub: "Tham gia cùng hàng ngàn thương hiệu đang tự động hóa quy trình tiếp thị và chăm sóc khách hàng với Zeflyo.",
    backToHome: "Quay lại Trang chủ"
  }
};

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fanpages, setFanpages] = useState<Fanpage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [isSdkLoaded, setIsSdkLoaded] = useState<boolean>(false);
  const [appId, setAppId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "vi">("vi"); // Default to Vietnamese
  const [theme, setTheme] = useState<"dark" | "light">("light");
  
  // Custom API configuration
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("http://localhost");

  // Simulated activity logs for premium dashboard feel
  const [logs, setLogs] = useState<Array<{ id: string; page: string; event: string; time: string; status: "success" | "pending" | "info" }>>([
    { id: "1", page: "Zeflyo Fashion", event: "Webhook handshake verified", time: "2 minutes ago", status: "success" },
    { id: "2", page: "Zeflyo Food & Beverage", event: "Auto-reply sent: 'Hi! Thank you for contacting...'", time: "5 minutes ago", status: "success" },
    { id: "3", page: "Tech Support", event: "AI Agent assigned to customer thread", time: "12 minutes ago", status: "info" }
  ]);

  // Read config & credentials from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("zeflyo_token");
    const savedUser = localStorage.getItem("zeflyo_user");
    const savedApiBase = localStorage.getItem("zeflyo_api_base");
    const savedAppId = localStorage.getItem("zeflyo_fb_app_id");
    const savedLang = localStorage.getItem("zeflyo_lang");
    const savedTheme = localStorage.getItem("zeflyo_theme") || "light";

    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user:", e);
        localStorage.removeItem("zeflyo_user");
      }
    }
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    let defaultApiBase = currentOrigin;
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        defaultApiBase = "http://localhost";
      }
    }
    const isStaleLocalhost = savedApiBase && (savedApiBase.includes("localhost:") || savedApiBase.includes("127.0.0.1:"));
    const targetApi = !savedApiBase || isStaleLocalhost || (savedApiBase === "http://localhost" && defaultApiBase !== "http://localhost")
      ? defaultApiBase
      : savedApiBase;

    if (!savedApiBase || isStaleLocalhost || (savedApiBase === "http://localhost" && defaultApiBase !== "http://localhost")) {
      localStorage.setItem("zeflyo_api_base", defaultApiBase);
      setApiBaseUrl(defaultApiBase);
    } else {
      setApiBaseUrl(savedApiBase);
    }
    if (savedAppId) setAppId(savedAppId);
    if (savedLang === "en" || savedLang === "vi") setLang(savedLang);
    
    setTheme(savedTheme as "dark" | "light");
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }

    // Fetch configuration from Backend dynamically
    const fetchConfig = async (url: string) => {
      try {
        const res = await fetch(`${url}/api/config`, {
          headers: { Accept: "application/json" }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.facebook_app_id) {
            setAppId(data.facebook_app_id);
            localStorage.setItem("zeflyo_fb_app_id", data.facebook_app_id);
          }
        }
      } catch (e) {
        console.error("Failed to fetch public config from backend", e);
      }
    };
    fetchConfig(targetApi);

    setLoading(false);
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  // Fetch fanpages when logged in
  useEffect(() => {
    if (token) {
      fetchFanpages();
    }
  }, [token, apiBaseUrl]);

  // Load Facebook SDK
  useEffect(() => {
    if (!appId) return;

    // Remove existing script if any
    const existingScript = document.getElementById("facebook-jssdk");
    if (existingScript) {
      existingScript.remove();
    }

    // Initialize SDK
    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId      : appId,
        cookie     : true,
        xfbml      : true,
        version    : "v20.0"
      });
      setIsSdkLoaded(true);
      console.log("Facebook SDK initialized successfully.");
    };

    // Load SDK script
    (function(d, s, id) {
      var js: any, fjs: any = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, "script", "facebook-jssdk"));

  }, [appId]);

  const showNotification = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "vi" : "en";
    setLang(nextLang);
    localStorage.setItem("zeflyo_lang", nextLang);
    document.documentElement.lang = nextLang;
  };

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

  const fetchFanpages = async () => {
    if (!token) return;

    // Handle mock token case locally to prevent calling real backend
    if (token.startsWith("mock_")) {
      const savedMockPages = localStorage.getItem("zeflyo_mock_pages");
      if (savedMockPages) {
        try {
          setFanpages(JSON.parse(savedMockPages));
        } catch (e) {
          console.error("Failed to parse mock pages from localStorage", e);
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
        setFanpages(data.fanpages || []);
      } else {
        console.error("Failed to fetch fanpages, server returned status:", response.status);
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (err) {
      console.error("Connection error while fetching fanpages:", err);
    }
  };

  const handleFacebookLogin = () => {
    const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (typeof window !== "undefined" && window.location.protocol !== "https:" && !isLocalhost) {
      showNotification("error", lang === "en"
        ? "Facebook Login requires a secure HTTPS connection. On HTTP local development, please use 'Mock Dev Mode' or 'Dev Login' below."
        : "Đăng nhập Facebook yêu cầu kết nối bảo mật HTTPS. Khi chạy local ở giao thức HTTP, vui lòng sử dụng 'Chế độ Giả lập' hoặc 'Đăng nhập Developer' bên dưới."
      );
      return;
    }

    if (!(window as any).FB) {
      showNotification("error", translations[lang].sdkNotLoaded);
      return;
    }

    setLoading(true);
    (window as any).FB.login(function(response: any) {
      console.log("FB.login response:", response);
      if (response.authResponse) {
        const userAccessToken = response.authResponse.accessToken;
        sendTokenToBackend(userAccessToken);
      } else {
        setLoading(false);
        showNotification("error", "User cancelled Facebook login or did not fully authorize.");
      }
    }, {
      scope: "pages_show_list,pages_messaging,pages_read_engagement,pages_manage_metadata,pages_manage_posts,email,public_profile",
      auth_type: "rerequest"
    });
  };

  const sendTokenToBackend = async (accessToken: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/facebook/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ access_token: accessToken })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("zeflyo_token", data.token);
        localStorage.setItem("zeflyo_user", JSON.stringify(data.user));
        showNotification("success", translations[lang].authSuccess);
      } else {
        showNotification("error", data.error || "Failed to authenticate with backend server.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", translations[lang].connectionError);
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockToken = "mock_token_" + Math.random().toString(36).substring(2);
    const mockUser: UserProfile = {
      id: "n0YkxX26RezeRFcCHy2ow4LtSENl2",
      name: "Đức Tiến",
      email: "demo@zeflyo.io",
      avatar: null
    };

    const mockPages: Fanpage[] = [
      {
        id: 1,
        user_id: "n0YkxX26RezeRFcCHy2ow4LtSENl2",
        fb_page_id: "109849204982312",
        name: "Zeflyo Fashion Store",
        avatar_url: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        user_id: "n0YkxX26RezeRFcCHy2ow4LtSENl2",
        fb_page_id: "304958230495823",
        name: "Zeflyo Food & Beverage",
        avatar_url: null,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        user_id: "n0YkxX26RezeRFcCHy2ow4LtSENl2",
        fb_page_id: "495829348572934",
        name: "Tech Support Portal",
        avatar_url: null,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setToken(mockToken);
    setUser(mockUser);
    setFanpages(mockPages);
    localStorage.setItem("zeflyo_token", mockToken);
    localStorage.setItem("zeflyo_user", JSON.stringify(mockUser));
    localStorage.setItem("zeflyo_mock_pages", JSON.stringify(mockPages));
    
    setLoading(false);
    showNotification("success", translations[lang].loginSuccess);
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/demo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("zeflyo_token", data.token);
        localStorage.setItem("zeflyo_user", JSON.stringify(data.user));
        showNotification("success", translations[lang].backendLoginSuccess);
      } else {
        showNotification("error", data.error || "Failed to authenticate with demo user.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", translations[lang].connectionError);
    } finally {
      setLoading(false);
    }
  };

  const togglePageAutomation = async (pageId: number, fbPageId: string) => {
    setActionLoading(pageId);
    
    if (token && token.startsWith("mock_token")) {
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
      showNotification("success", translations[lang].pageStatusUpdated);
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
        showNotification("success", translations[lang].pageStatusUpdated);
      } else {
        showNotification("error", data.error || translations[lang].unauthorizedPage);
      }
    } catch (err) {
      console.error(err);
      showNotification("error", translations[lang].connectionError);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setFanpages([]);
    localStorage.removeItem("zeflyo_token");
    localStorage.removeItem("zeflyo_user");
    localStorage.removeItem("zeflyo_mock_pages");
  };

  const saveSettings = async () => {
    localStorage.setItem("zeflyo_api_base", apiBaseUrl);
    
    let currentAppId = appId;
    try {
      const res = await fetch(`${apiBaseUrl}/api/config`, {
        headers: { Accept: "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.facebook_app_id) {
          currentAppId = data.facebook_app_id;
          setAppId(currentAppId);
        }
      }
    } catch (e) {
      console.error("Failed to fetch facebook app id from saved api address:", e);
    }

    localStorage.setItem("zeflyo_fb_app_id", currentAppId);
    showNotification("success", translations[lang].saveConfig);
  };

  const t = translations[lang];
  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  return (
    <div className="h-screen animated-gradient text-[#f4f4f5] flex relative overflow-hidden font-sans">
      
      {/* Background Glow Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none animate-pulse-glow-delayed" />

      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-200 backdrop-blur-md transition-all shadow-lg animate-float">
          <XCircle className="w-5 h-5 text-red-400" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border border-green-500/20 bg-green-500/10 text-green-200 backdrop-blur-md transition-all shadow-lg animate-float">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-screen py-20 relative z-10">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-zinc-400 text-sm">{t.syncServices}</p>
        </div>
      ) : !token && !showLogin ? (
        /* Marketing Landing Page */
        <div className="flex-1 flex flex-col min-h-screen w-full relative z-10 overflow-y-auto bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-200">
          
          {/* Header/Navbar */}
          <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              
              {/* Brand Logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg border border-white/10">
                  <span className="font-extrabold text-white text-base">Z</span>
                </div>
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  ZEFLYO
                </span>
              </div>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
                <a href="#features" className="hover:text-white transition-colors">{landingTranslations[lang].features}</a>
                <a href="#workflow" className="hover:text-white transition-colors">{landingTranslations[lang].workflow}</a>
                <a href="#pricing" className="hover:text-white transition-colors">{landingTranslations[lang].pricing}</a>
                <a href="#faqs" className="hover:text-white transition-colors">{landingTranslations[lang].faqs}</a>
              </nav>

              {/* Header Right toggles + CTA */}
              <div className="flex items-center gap-3.5">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 py-1.5 px-3 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-full text-xs font-semibold transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === "en" ? "EN" : "VI"}</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-full transition-all cursor-pointer"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                </button>
                
                <button
                  onClick={() => setShowLogin(true)}
                  className="hidden sm:flex items-center gap-1.5 py-2 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all cursor-pointer active:scale-95 border border-white/5"
                >
                  <span>{landingTranslations[lang].getStarted}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Mobile Menu Hamburguer Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-zinc-900 bg-zinc-950 p-6 flex flex-col gap-4 animate-fade-in absolute w-full left-0 top-full shadow-2xl">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-zinc-400 hover:text-white py-1">{landingTranslations[lang].features}</a>
                <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-zinc-400 hover:text-white py-1">{landingTranslations[lang].workflow}</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-zinc-400 hover:text-white py-1">{landingTranslations[lang].pricing}</a>
                <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-zinc-400 hover:text-white py-1">{landingTranslations[lang].faqs}</a>
                <button
                  onClick={() => { setMobileMenuOpen(false); setShowLogin(true); }}
                  className="w-full flex items-center justify-center gap-1.5 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer"
                >
                  <span>{landingTranslations[lang].getStarted}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </header>

          {/* Hero Section */}
          <section className="relative pt-12 pb-24 md:py-32 px-6 flex flex-col items-center text-center overflow-hidden border-b border-zinc-900 bg-zinc-950">
            {/* Background Glows */}
            <div className="absolute top-10 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 w-[600px] h-[300px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 relative z-10">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide shadow-sm animate-float">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{landingTranslations[lang].badge}</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                {lang === "vi" ? (
                  <>
                    Tự Động Hóa Quản Lý Fanpage <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                      Bằng Trí Tuệ Nhân Tạo
                    </span>
                  </>
                ) : (
                  <>
                    Automate Your Fanpage <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                      With Gemini AI
                    </span>
                  </>
                )}
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed mt-2">
                {landingTranslations[lang].subheadline}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer active:scale-[0.98] border border-white/10"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{landingTranslations[lang].getStarted}</span>
                </button>
                <a
                  href="https://github.com/Kerneural/Zeflyo/tree/main/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98]"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{landingTranslations[lang].viewGuide}</span>
                </a>
              </div>

              {/* Visual Mock Dashboard preview */}
              <div className="w-full max-w-5xl mt-12 md:mt-16 rounded-2xl border border-zinc-850 bg-zinc-900/40 p-3.5 md:p-5 backdrop-blur-sm relative shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 rounded-2xl pointer-events-none z-20" />
                
                {/* Header bar of mockup */}
                <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                    <span className="text-[10px] text-zinc-500 font-mono ml-2 select-none">ZEFLYO WORKSPACE PREVIEW</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-green-400 font-bold tracking-wider uppercase">Active Agent</span>
                  </div>
                </div>

                {/* Dashboard layout inside mockup */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  
                  {/* Left panel: active pages */}
                  <div className="glass-card rounded-xl p-4 flex flex-col gap-3.5 border border-zinc-850 bg-zinc-900/50">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Channels</span>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">F</div>
                        <span className="text-xs font-bold text-zinc-300">Zeflyo Fashion Shop</span>
                      </div>
                      <span className="text-[9px] font-mono text-green-400 font-bold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">LIVE</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-violet-600/20 text-violet-400 border border-violet-500/20 flex items-center justify-center font-bold text-xs">T</div>
                        <span className="text-xs font-bold text-zinc-300">Tech Course Center</span>
                      </div>
                      <span className="text-[9px] font-mono text-green-400 font-bold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">LIVE</span>
                    </div>
                  </div>

                  {/* Middle panel: stats and counter */}
                  <div className="glass-card rounded-xl p-4 flex flex-col gap-4 border border-zinc-850 bg-zinc-900/50">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Performance Insights</span>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-lg flex flex-col">
                        <span className="text-xl font-black text-white">4,289</span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Posts Drafted</span>
                      </div>
                      <div className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-lg flex flex-col">
                        <span className="text-xl font-black text-blue-400">924</span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Auto Replies</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-850 text-[10px] text-zinc-450 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>Next auto-post scheduled in 42 minutes.</span>
                    </div>
                  </div>

                  {/* Right panel: live preview mock interaction */}
                  <div className="glass-card rounded-xl p-4 flex flex-col gap-3.5 border border-zinc-850 bg-zinc-900/50">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Real-time AI Chat Agent</span>
                    
                    <div className="flex flex-col gap-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850 text-[10px]">
                      <div className="text-zinc-500 font-bold">👤 Customer (2m ago)</div>
                      <div className="text-zinc-300">"Tư vấn giá khóa học Claude AI cho em với ạ."</div>
                    </div>

                    <div className="flex flex-col gap-2 bg-blue-600/[0.04] p-2.5 rounded-lg border border-blue-500/10 text-[10px] animate-pulse">
                      <div className="text-blue-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span>Zeflyo AI Agent (Just now)</span>
                      </div>
                      <div className="text-zinc-300">
                        "Chào bạn! Khóa học Claude code đang được ưu đãi còn 499k. Bạn đăng ký luôn nha?"
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* Statistics / Social Proof Section */}
          <section className="py-16 px-6 bg-zinc-950 border-b border-zinc-900">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                
                <div className="flex flex-col items-center text-center p-6 bg-zinc-900/20 rounded-2xl border border-zinc-900/60 backdrop-blur-sm">
                  <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">
                    10,000+
                  </span>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-3">
                    {lang === "vi" ? "Bài viết đã lập lịch & đăng" : "Auto posts scheduled & published"}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-zinc-900/20 rounded-2xl border border-zinc-900/60 backdrop-blur-sm">
                  <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    99.99%
                  </span>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-3">
                    {lang === "vi" ? "Thời gian hoạt động cổng kết nối" : "Webhook Gateway Uptime"}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-zinc-900/20 rounded-2xl border border-zinc-900/60 backdrop-blur-sm">
                  <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    10x
                  </span>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-3">
                    {lang === "vi" ? "Tốc độ sản xuất & tương tác" : "Marketing efficiency increase"}
                  </span>
                </div>

              </div>
            </div>
          </section>

          {/* Core Features Grid Section */}
          <section id="features" className="py-24 px-6 bg-zinc-950 border-b border-zinc-900">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
              
              <div className="text-center flex flex-col gap-3">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{landingTranslations[lang].features}</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {landingTranslations[lang].featuresTitle}
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
                  {landingTranslations[lang].featuresSub}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
                
                {/* Feature 1 */}
                <div className="glass-card rounded-2xl p-6 border border-zinc-850 hover:border-blue-500/20 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all group flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <h3 className="font-bold text-white text-base">{landingTranslations[lang].postSchedule}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{landingTranslations[lang].postScheduleDesc}</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="glass-card rounded-2xl p-6 border border-zinc-850 hover:border-indigo-500/20 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all group flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <h3 className="font-bold text-white text-base">{landingTranslations[lang].chatAgent}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{landingTranslations[lang].chatAgentDesc}</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="glass-card rounded-2xl p-6 border border-zinc-850 hover:border-violet-500/20 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all group flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <h3 className="font-bold text-white text-base">{landingTranslations[lang].keywordRules}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{landingTranslations[lang].keywordRulesDesc}</p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="glass-card rounded-2xl p-6 border border-zinc-850 hover:border-fuchsia-500/20 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all group flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <h3 className="font-bold text-white text-base">{landingTranslations[lang].imageCompress}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{landingTranslations[lang].imageCompressDesc}</p>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* Workflow Roadmap Section */}
          <section id="workflow" className="py-24 px-6 bg-zinc-950 border-b border-zinc-900 relative">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-16">
              
              <div className="text-center flex flex-col gap-3">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{landingTranslations[lang].workflow}</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {lang === "vi" ? "4 bước vận hành siêu tốc cùng Zeflyo" : "Get started in 4 simple steps"}
                </h2>
              </div>

              {/* Step Roadmap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative w-full">
                
                {/* Connector line for desktop */}
                <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-0.5 border-t border-dashed border-zinc-800 z-0" />
                
                {/* Step 1 */}
                <div className="flex flex-col items-start gap-4 relative z-10 text-left group">
                  <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-400 flex items-center justify-center group-hover:border-blue-500/50 group-hover:text-blue-400 transition-colors bg-zinc-950">
                    01
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-white text-base">{landingTranslations[lang].step1}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{landingTranslations[lang].step1Desc}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-start gap-4 relative z-10 text-left group">
                  <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-400 flex items-center justify-center group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors bg-zinc-950">
                    02
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-white text-base">{landingTranslations[lang].step2}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{landingTranslations[lang].step2Desc}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-start gap-4 relative z-10 text-left group">
                  <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-400 flex items-center justify-center group-hover:border-violet-500/50 group-hover:text-violet-400 transition-colors bg-zinc-950">
                    03
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-white text-base">{landingTranslations[lang].step3}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{landingTranslations[lang].step3Desc}</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-start gap-4 relative z-10 text-left group">
                  <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-400 flex items-center justify-center group-hover:border-fuchsia-500/50 group-hover:text-fuchsia-400 transition-colors bg-zinc-950">
                    04
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-white text-base">{landingTranslations[lang].step4}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{landingTranslations[lang].step4Desc}</p>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-24 px-6 bg-zinc-950 border-b border-zinc-900">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-16">
              
              <div className="text-center flex flex-col gap-3">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{landingTranslations[lang].pricing}</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {lang === "vi" ? "Bảng giá dịch vụ hợp lý" : "Affordable Plans for Every Goal"}
                </h2>
                <p className="text-sm text-zinc-400 max-w-lg mx-auto">
                  {landingTranslations[lang].pricingSub}
                </p>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-6 items-stretch">
                
                {/* Plan 1: Starter */}
                <div className="glass-card rounded-2xl p-8 border border-zinc-850 flex flex-col justify-between bg-zinc-900/20 text-left hover:border-zinc-800 transition-colors relative">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-300">{landingTranslations[lang].starter}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{landingTranslations[lang].starterDesc}</p>
                    <div className="flex items-baseline gap-1 mt-6 mb-8">
                      <span className="text-3xl font-black text-white">{landingTranslations[lang].free}</span>
                    </div>
                    
                    <ul className="flex flex-col gap-3.5 text-xs text-zinc-450 border-t border-zinc-900 pt-6">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500 flex-shrink-0" /> <span>{lang === "vi" ? "Quản lý 1 Fanpage Facebook" : "Manage 1 Facebook Fanpage"}</span></li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500 flex-shrink-0" /> <span>{lang === "vi" ? "Lên lịch bài viết thủ công" : "Manual post scheduling"}</span></li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500 flex-shrink-0" /> <span>{lang === "vi" ? "50 Tín dụng AI / tháng" : "50 AI credits / month"}</span></li>
                      <li className="flex items-center gap-2 text-zinc-650 line-through"><Check className="w-4 h-4 flex-shrink-0" /> <span>{lang === "vi" ? "Tự động phản hồi bình luận" : "Auto reply to comments"}</span></li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowLogin(true)}
                    className="w-full py-3 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors mt-8 cursor-pointer animate-fade-in"
                  >
                    {lang === "vi" ? "Dùng thử miễn phí" : "Start For Free"}
                  </button>
                </div>

                {/* Plan 2: Pro */}
                <div className="glass-card rounded-2xl p-8 border border-blue-500/30 flex flex-col justify-between bg-zinc-900/30 text-left hover:border-blue-500/40 transition-colors relative shadow-xl shadow-blue-500/5">
                  <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-blue-500 text-white text-[9px] font-bold uppercase tracking-wider">
                    {landingTranslations[lang].mostPopular}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{landingTranslations[lang].pro}</span>
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">{landingTranslations[lang].proDesc}</p>
                    <div className="flex items-baseline gap-1 mt-6 mb-8">
                      <span className="text-4xl font-black text-white">499k</span>
                      <span className="text-xs text-zinc-500 font-bold">{landingTranslations[lang].month}</span>
                    </div>

                    <ul className="flex flex-col gap-3.5 text-xs text-zinc-300 border-t border-zinc-900 pt-6">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0" /> <span className="font-semibold text-white">{lang === "vi" ? "Quản lý 5 Fanpage" : "Manage 5 Fanpages"}</span></li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0" /> <span>{lang === "vi" ? "AI Campaign Hub (Tự soạn chủ đề)" : "AI Campaign Hub (Topic builder)"}</span></li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0" /> <span>{lang === "vi" ? "AI Agent Live Chat tự động 24/7" : "24/7 Auto AI Chat Agent"}</span></li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0" /> <span>{lang === "vi" ? "Không giới hạn nén ảnh tối ưu" : "Unlimited image compression"}</span></li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0" /> <span>{lang === "vi" ? "Tự động thiết lập quy tắc từ khóa" : "Custom keyword triggers"}</span></li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowLogin(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-colors mt-8 shadow-lg shadow-blue-600/10 cursor-pointer"
                  >
                    {landingTranslations[lang].getStarted}
                  </button>
                </div>

                {/* Plan 3: Enterprise */}
                <div className="glass-card rounded-2xl p-8 border border-zinc-850 flex flex-col justify-between bg-zinc-900/20 text-left hover:border-zinc-800 transition-colors relative">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-300">{landingTranslations[lang].enterprise}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{landingTranslations[lang].enterpriseDesc}</p>
                    <div className="flex items-baseline gap-1 mt-6 mb-8">
                      <span className="text-3xl font-black text-white">{landingTranslations[lang].customPrice}</span>
                    </div>

                    <ul className="flex flex-col gap-3.5 text-xs text-zinc-450 border-t border-zinc-900 pt-6">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400 flex-shrink-0" /> <span>{lang === "vi" ? "Không giới hạn số lượng Fanpage" : "Unlimited Facebook Fanpages"}</span></li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400 flex-shrink-0" /> <span>{lang === "vi" ? "Kết nối API riêng & Fine-tune Model" : "Dedicated API keys & fine-tuned LLM"}</span></li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400 flex-shrink-0" /> <span>{lang === "vi" ? "Quản trị viên chăm sóc tài khoản riêng" : "Dedicated Account Manager"}</span></li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400 flex-shrink-0" /> <span>{lang === "vi" ? "Hỗ trợ SLA cam kết phản hồi 15 phút" : "SLA 15-minute response support"}</span></li>
                    </ul>
                  </div>

                  <a
                    href="mailto:contact@zeflyo.com"
                    className="w-full py-3 rounded-xl border border-zinc-850 hover:bg-zinc-800 hover:text-white text-zinc-355 font-bold text-xs transition-colors mt-8 text-center flex items-center justify-center cursor-pointer"
                  >
                    {lang === "vi" ? "Liên hệ với chúng tôi" : "Contact Sales"}
                  </a>
                </div>

              </div>

            </div>
          </section>

          {/* FAQs Section */}
          <section id="faqs" className="py-24 px-6 bg-zinc-950 border-b border-zinc-900">
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-12">
              
              <div className="text-center flex flex-col gap-3">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{landingTranslations[lang].faqs}</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {landingTranslations[lang].faqTitle}
                </h2>
                <p className="text-sm text-zinc-400">
                  {landingTranslations[lang].faqSub}
                </p>
              </div>

              {/* FAQ Accordion */}
              <div className="flex flex-col gap-3.5 w-full mt-6">
                
                {[
                  {
                    q: lang === "vi" ? "Hệ thống Zeflyo có an toàn cho Fanpage không?" : "Is Zeflyo safe for my Facebook page?",
                    a: lang === "vi" 
                      ? "Cực kỳ an toàn. Zeflyo kết nối trực tiếp qua giao diện chính thức Meta Graph API và tuân thủ các chính sách bảo mật của Meta. Chúng tôi không thu thập thông tin mật khẩu cá nhân hay thực hiện các hành động spam phi pháp."
                      : "Absolutely. Zeflyo connects directly using official Meta Graph API and strictly conforms to Meta Developer policies. We do not store or collect personal passwords, nor engage in illegal spam."
                  },
                  {
                    q: lang === "vi" ? "Teammate của tôi vào hệ thống thì có cần cấu hình gì không?" : "Do my teammates need to do complex configuration?",
                    a: lang === "vi"
                      ? "Hoàn toàn không. Teammate của bạn chỉ cần truy cập vào hệ thống, nhấn đăng nhập qua tài khoản Facebook của họ và cấp quyền. Hệ thống của bạn đã tự động nạp mã ứng dụng Meta App ID ngầm định cấu hình sẵn từ máy chủ."
                      : "Not at all. Your team members simply visit the website, click Continue with Facebook, and authorize their pages. Zeflyo dynamically resolves the app configurations in the background from the backend server."
                  },
                  {
                    q: lang === "vi" ? "Thuật toán nén ảnh hoạt động thế nào? Có làm hỏng chất lượng ảnh không?" : "How does image compression work? Does it degrade quality?",
                    a: lang === "vi"
                      ? "Zeflyo sử dụng thư viện xử lý ảnh GD thông minh trên máy chủ. Hình ảnh tải lên sẽ được tính toán tỷ lệ khung hình chuẩn và tối ưu dung lượng (chuyển đổi định dạng, hạ quy mô kích thước nếu quá lớn). Bức ảnh vẫn giữ được độ sắc nét tối ưu nhưng dung lượng file nhẹ đi từ 50-80%, giúp tải trang cực nhanh."
                      : "Zeflyo uses intelligent GD compression on the server. Uploaded images are proportioned correctly and scale-down optimized in-place. The output retains crystal-clear sharpness but file sizes decrease by 50-80%, saving storage space."
                  },
                  {
                    q: lang === "vi" ? "Tôi có thể tùy chỉnh văn phong viết bài của AI không?" : "Can I customize the writing style of the AI?",
                    a: lang === "vi"
                      ? "Được chứ. Khi thiết lập chiến dịch tự động, bạn có thể lựa chọn 5 văn phong cốt lõi (Vui vẻ, Chuyên nghiệp, Thuyết phục, Hài hước, Kể chuyện) và tự điền văn bản Prompt chỉ thị riêng để AI bám sát thương hiệu của bạn."
                      : "Yes. When creating automated campaigns, you can choose from 5 primary tones (Friendly, Professional, Persuasive, Humorous, Narrative) and define custom AI instructions so content fits your brand identity."
                  }
                ].map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={idx} className="glass-card rounded-xl border border-zinc-850 overflow-hidden bg-zinc-900/20">
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-white hover:bg-zinc-900/40 transition-colors cursor-pointer select-none"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180 text-blue-400" : ""}`} />
                      </button>
                      
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900/50 bg-zinc-950/20 animate-fade-in">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>

            </div>
          </section>

          {/* Call to Action (CTA) bottom section */}
          <section className="py-24 px-6 bg-zinc-950">
            <div className="max-w-5xl mx-auto rounded-3xl border border-zinc-805 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-indigo-950/20 p-8 md:p-16 relative overflow-hidden text-center shadow-2xl">
              <div className="absolute top-[-30%] right-[-30%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-[-30%] left-[-30%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="max-w-2xl mx-auto flex flex-col items-center gap-5 relative z-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {landingTranslations[lang].ctaTitle}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-450 leading-relaxed">
                  {landingTranslations[lang].ctaSub}
                </p>
                <button
                  onClick={() => setShowLogin(true)}
                  className="mt-6 flex items-center gap-2 py-4 px-10 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-xl shadow-blue-500/15 hover:shadow-blue-500/30 transition-all cursor-pointer active:scale-95 border border-white/10"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{landingTranslations[lang].getStarted}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-6 border-t border-zinc-900 bg-zinc-950 text-xs text-zinc-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
              
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-extrabold text-white text-xs">Z</div>
                <span className="font-semibold text-zinc-400 tracking-wider">ZEFLYO © {new Date().getFullYear()}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6">
                <a href="#features" className="hover:text-zinc-350 transition-colors">{landingTranslations[lang].features}</a>
                <a href="#workflow" className="hover:text-zinc-355 transition-colors">{landingTranslations[lang].workflow}</a>
                <a href="#pricing" className="hover:text-zinc-350 transition-colors">{landingTranslations[lang].pricing}</a>
                <a href="#faqs" className="hover:text-zinc-350 transition-colors">{landingTranslations[lang].faqs}</a>
                <span>•</span>
                <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="hover:text-zinc-350 transition-colors">Meta Dev</a>
              </div>

            </div>
          </footer>

        </div>
      ) : !token && showLogin ? (
        /* Login Screen (Centered in the viewport) */
        <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10 min-h-screen">
          
          {/* Back to Home button */}
          <div className="absolute top-6 left-6">
            <button
              onClick={() => setShowLogin(false)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 rounded-full text-xs font-semibold transition-all border border-zinc-850 cursor-pointer active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{landingTranslations[lang].backToHome}</span>
            </button>
          </div>

          {/* Top small language/theme bar for login */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 rounded-full text-xs font-semibold transition-all border border-zinc-850 cursor-pointer active:scale-95 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === "en" ? "EN" : "VI"}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 rounded-full transition-all border border-zinc-850 cursor-pointer active:scale-95 shadow-sm"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>

          <div className="w-full max-w-md flex flex-col gap-6">
            <div className="text-center flex flex-col gap-2">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
                  <span className="font-extrabold text-white text-lg tracking-wider">Z</span>
                </div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent logo-text">
                  ZEFLYO
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-zinc-400 text-xs max-w-sm mx-auto leading-normal">
                {t.subtitle}
              </p>
            </div>

            {/* Glass Login Panel */}
            <div className="glass-panel rounded-2xl p-6 shadow-2xl relative">
              <div className="absolute top-0 right-0 p-3 flex gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">{t.servicesOnline}</span>
              </div>

              <div className="flex flex-col gap-5 mt-4">
                <button
                  onClick={handleFacebookLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/15 hover:shadow-blue-500/20 active:scale-[0.98] transition-all border border-blue-400/20 cursor-pointer"
                >
                  <FacebookIcon className="w-5 h-5 fill-current" />
                  {t.loginFb}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">{t.devUtilities}</span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                {/* Mock Dev login button */}
                <button
                  onClick={handleMockLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 dark:text-zinc-200 font-medium active:scale-[0.98] transition-all border border-zinc-200 dark:border-white/5 cursor-pointer"
                >
                  <Database className="w-4 h-4 text-zinc-650 dark:text-zinc-400" />
                  {t.mockLogin}
                </button>

                {/* Dev Login (Real Backend) button */}
                <button
                  onClick={handleDevLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 dark:text-indigo-200 font-medium active:scale-[0.98] transition-all border border-indigo-200 dark:border-indigo-500/20 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {t.backendLogin}
                </button>
              </div>

              {/* Collapsible settings config panel for local network custom API */}
              {isLocalhost && (
                <div className="mt-6 pt-5 border-t border-white/5 flex flex-col gap-4">
                  <details className="group">
                    <summary className="list-none flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-300 font-semibold cursor-pointer select-none">
                      <span className="flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 group-open:rotate-45 transition-transform" />
                        {t.serverSettings}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 group-open:rotate-90 transition-transform" />
                    </summary>
                    
                    <div className="flex flex-col gap-3.5 mt-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-wider">{t.apiEndpoint}</label>
                        <input 
                          type="text" 
                          value={apiBaseUrl} 
                          onChange={(e) => setApiBaseUrl(e.target.value)} 
                          className="w-full py-1.5 px-3 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-300 outline-none focus:border-blue-500/50 transition-colors"
                          placeholder="http://localhost"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-wider">{t.appId}</label>
                        <input 
                          type="text" 
                          value={appId} 
                          onChange={(e) => setAppId(e.target.value)} 
                          className="w-full py-1.5 px-3 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-300 outline-none focus:border-blue-500/50 transition-colors"
                          placeholder="App ID from Meta Developer console"
                        />
                      </div>
                      <button
                        onClick={saveSettings}
                        className="w-full py-1.5 px-3 text-xs font-semibold text-white rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-800 transition-colors border border-white/5"
                      >
                        {t.saveConfig}
                      </button>
                    </div>
                  </details>
                </div>
              )}
            </div>

            <div className="flex justify-center items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-blue-500" /> {t.authSecure}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5 text-violet-500" />
                <a href="https://developers.facebook.com" target="_blank" className="hover:text-zinc-400">{t.metaConsole}</a>
              </span>
            </div>
          </div>
          
        </div>
      ) : (
        /* Left Sidebar Layout (Authenticated) */
        <>
          <Sidebar
            currentPath="/"
            user={user}
            lang={lang}
            toggleLanguage={toggleLanguage}
            theme={theme}
            toggleTheme={toggleTheme}
            handleLogout={handleLogout}
          />

          {/* Main Content Workspace */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
            
            {/* Mobile Header */}
            <header className="w-full bg-[#18181b]/50 border-b border-zinc-800 px-6 py-4 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
                  <span className="font-extrabold text-white text-xs">Z</span>
                </div>
                <span className="font-bold text-sm tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent logo-text">ZEFLYO</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center justify-center gap-1 py-1 px-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold"
                >
                  {lang === "en" ? "EN" : "VI"}
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-8 h-8 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-zinc-450 hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Content Pane */}
            <div className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto flex flex-col gap-6">
              
              {/* Header title */}
              <div className="flex flex-col gap-1.5 border-b border-zinc-850 pb-5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-zinc-150 uppercase">
                  {t.activateAutomations}
                </h1>
                <p className="text-xs text-zinc-550">
                  {t.activateSub}
                </p>
              </div>

              {/* Two-Column Workspace */}
              <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Active Fanpages List */}
                <div className="xl:col-span-8 flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base font-bold text-zinc-200">Danh sách Fanpage kết nối</h2>
                    <button
                      onClick={fetchFanpages}
                      className="flex items-center gap-2 py-1.5 px-3 text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t.refreshList}
                    </button>
                  </div>

                  {fanpages.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-10 text-center flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-805 flex items-center justify-center text-zinc-500">
                        <Sliders className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-200">{t.noPages}</h3>
                        <p className="text-zinc-555 text-xs max-w-sm mt-1">{t.noPagesSub}</p>
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
                                  {page.is_active ? t.aiAgentLive : t.offline}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Action footer */}
                          <div className="pt-3 border-t border-zinc-850 flex items-center justify-between">
                            <span className="text-[10px] text-zinc-500">{t.logReady}</span>
                            
                            <button
                              disabled={actionLoading === page.id}
                              onClick={() => togglePageAutomation(page.id, page.fb_page_id)}
                              className={`flex items-center gap-2 py-1 px-3 rounded-lg text-xs font-semibold select-none transition-all cursor-pointer ${
                                page.is_active 
                                  ? "bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/30" 
                                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-850"
                              }`}
                            >
                              {actionLoading === page.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : page.is_active ? (
                                <>
                                  <Power className="w-3.5 h-3.5 text-green-400" />
                                  {t.active}
                                </>
                              ) : (
                                <>
                                  <Power className="w-3.5 h-3.5 text-zinc-500" />
                                  {t.deactivated}
                                </>
                              )}
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Webhook Gateway & Live Activity Logs */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                  
                  {/* Webhook Connection status panel */}
                  <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                      <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-blue-500" />
                        {t.gatewayStatus}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">v20.0 SSL</span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850">
                        <span className="text-xs text-zinc-455">{t.webhookReceiver}</span>
                        <span className="text-xs text-green-455 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {t.listening}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850">
                        <span className="text-xs text-zinc-455">{t.redisQueue}</span>
                        <span className="text-xs text-green-455 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {t.activeJobs}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850">
                        <span className="text-xs text-zinc-455">{t.websocketBroadcasting}</span>
                        <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {t.soketiOnline}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Logs Panel */}
                  <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 min-h-[300px]">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                      <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-violet-500" />
                        {t.liveActivity}
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

            {/* Footer Branding */}
            <Footer />

          </div>
        </>
      )}
    </div>
  );
}
