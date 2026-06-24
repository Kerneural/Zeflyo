"use client";

import React, { useState, useEffect } from "react";
import { 
  Check, 
  X, 
  HelpCircle, 
  Loader2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number | null;
  currency: string | null;
  period: string | null;
  recommended?: boolean;
  contact?: boolean;
}

export default function PricingPage() {
  const [token, setToken] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("http://localhost");
  const [lang, setLang] = useState<"en" | "vi">("vi");

  // Plan data states
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<{ plan: string; expires_at: string | null }>({
    plan: "free",
    expires_at: null
  });

  // Action states
  const [loading, setLoading] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [targetPlanName, setTargetPlanName] = useState("");
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("zeflyo_token");
    const savedApiBase = localStorage.getItem("zeflyo_api_base") || "http://localhost";
    const savedLang = localStorage.getItem("zeflyo_lang") || "vi";

    if (savedToken) setToken(savedToken);
    if (savedApiBase) setApiBaseUrl(savedApiBase);
    setLang(savedLang as "en" | "vi");

    const handleLangChange = () => {
      const updatedLang = localStorage.getItem("zeflyo_lang") || "vi";
      setLang(updatedLang as "en" | "vi");
    };

    window.addEventListener("zeflyo_lang_changed", handleLangChange);
    return () => {
      window.removeEventListener("zeflyo_lang_changed", handleLangChange);
    };
  }, []);

  useEffect(() => {
    if (token) {
      fetchPlansAndSubscription();
    }
  }, [token, apiBaseUrl]);

  const fetchPlansAndSubscription = async () => {
    if (!token) return;
    setLoading(true);

    if (token.startsWith("mock_")) {
      setTimeout(() => {
        setPlans([
          { id: "free",     name: "Free",     price: 0,       currency: "VND", period: "month" },
          { id: "pro",      name: "Pro",      price: 299000,  currency: "VND", period: "month", recommended: true },
          { id: "business", name: "Business", price: null,    currency: null,  period: null,    contact: true }
        ]);
        setSubscription({ plan: "free", expires_at: null });
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const [plansRes, subRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/plans`, {
          headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
        }),
        fetch(`${apiBaseUrl}/api/user/subscription`, {
          headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
        })
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData);
      }
    } catch (e) {
      console.error("Failed to load plans & subscription data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = (planName: string) => {
    setTargetPlanName(planName);
    setShowComingSoon(true);
  };

  // Pricing Card Sub-component
  const PricingCard = ({ plan }: { plan: Plan }) => {
    const isCurrentPlan = subscription.plan === plan.id;
    const isRecommended = plan.recommended;

    // Feature check lists for each plan
    const features: Record<string, { labelVi: string; labelEn: string; included: boolean }[]> = {
      free: [
        { labelVi: "Quản lý tối đa 3 Fanpages", labelEn: "Manage up to 3 Fanpages", included: true },
        { labelVi: "5 Luật Auto-Reply phản hồi", labelEn: "5 Keyword Auto-reply rules", included: true },
        { labelVi: "Live Chat Hub (1 page)", labelEn: "Live Chat Hub (1 page)", included: true },
        { labelVi: "Tự động trả lời thông minh bằng AI", labelEn: "Intelligent AI Auto-responder", included: false },
        { labelVi: "Lên lịch đăng bài tự động (Scheduler)", labelEn: "Scheduled posts publisher", included: false },
        { labelVi: "Báo cáo thống kê & Phân tích", labelEn: "Reporting & analytics export", included: false }
      ],
      pro: [
        { labelVi: "Quản lý tối đa 20 Fanpages", labelEn: "Manage up to 20 Fanpages", included: true },
        { labelVi: "100 Luật Auto-Reply phản hồi", labelEn: "100 Keyword Auto-reply rules", included: true },
        { labelVi: "Live Chat Hub đa kênh đầy đủ", labelEn: "Full Live Chat Hub for all channels", included: true },
        { labelVi: "5,000 lượt phản hồi AI / tháng", labelEn: "5,000 AI respond events / month", included: true },
        { labelVi: "Lên lịch đăng bài tự động (Scheduler)", labelEn: "Scheduled posts publisher", included: true },
        { labelVi: "Báo cáo thống kê & Phân tích", labelEn: "Reporting & analytics export", included: true }
      ],
      business: [
        { labelVi: "Không giới hạn Fanpages", labelEn: "Unlimited Fanpages", included: true },
        { labelVi: "Không giới hạn Luật Auto-Reply", labelEn: "Unlimited Keyword Auto-reply rules", included: true },
        { labelVi: "Live Chat Hub đa kênh đầy đủ", labelEn: "Full Live Chat Hub for all channels", included: true },
        { labelVi: "Không giới hạn lượt phản hồi AI", labelEn: "Unlimited AI respond events", included: true },
        { labelVi: "Lên lịch đăng bài tự động (Scheduler)", labelEn: "Scheduled posts publisher", included: true },
        { labelVi: "Hỗ trợ riêng (Dedicated Support)", labelEn: "Dedicated account manager support", included: true }
      ]
    };

    const currentPlanFeatures = features[plan.id] || [];

    return (
      <div className={`rounded-3xl p-6 flex flex-col justify-between border relative transition-all duration-350 hover:translate-y-[-4px] ${
        isRecommended 
          ? "bg-gradient-to-b from-[#6C63FF]/15 via-zinc-900/40 to-zinc-950/60 border-[#6C63FF]/40 shadow-xl shadow-[#6C63FF]/5 w-full md:scale-[1.03]" 
          : "bg-zinc-900/30 border-white/5 shadow-lg w-full"
      }`}>
        {/* Recommended Badge */}
        {isRecommended && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-[#6C63FF] text-[10px] text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow shadow-[#6C63FF]/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {lang === "en" ? "Most Popular" : "Phổ biến nhất"}
          </span>
        )}

        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <span className={`text-xs font-bold uppercase tracking-widest ${isRecommended ? "text-[#6C63FF]" : "text-zinc-500"}`}>
              {plan.name}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              {plan.contact ? (
                <span className="text-3xl font-extrabold text-white">
                  {lang === "en" ? "Custom" : "Liên hệ"}
                </span>
              ) : (
                <>
                  <span className="text-3xl font-extrabold text-white">
                    {plan.price === 0 ? "0đ" : `${plan.price?.toLocaleString()}đ`}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {lang === "en" ? "/month" : "/tháng"}
                  </span>
                </>
              )}
            </div>
            {isCurrentPlan && (
              <span className="text-[10px] text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded w-fit mt-1">
                {lang === "en" ? "Active Subscription" : "Gói hiện tại"}
              </span>
            )}
          </div>

          <hr className="border-white/5" />

          {/* Features list */}
          <ul className="flex flex-col gap-3">
            {currentPlanFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                {feat.included ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <X className="w-4 h-4 text-zinc-650 shrink-0 mt-0.5" />
                )}
                <span className={feat.included ? "" : "text-zinc-555 line-through"}>
                  {lang === "en" ? feat.labelEn : feat.labelVi}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => handleUpgradeClick(plan.name)}
          className={`w-full py-2.5 mt-8 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 ${
            isCurrentPlan 
              ? "bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed"
              : isRecommended
                ? "bg-gradient-to-r from-indigo-600 to-[#6C63FF] hover:from-indigo-500 hover:to-[#7C73FF] text-white shadow-lg shadow-[#6C63FF]/15"
                : "bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/5"
          }`}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan 
            ? (lang === "en" ? "Current Plan" : "Đang sử dụng")
            : plan.contact
              ? (lang === "en" ? "Contact Support" : "Liên hệ hỗ trợ")
              : (lang === "en" ? "Upgrade Now" : "Nâng cấp ngay")}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          {lang === "en" ? "Zeflyo Pricing Plans" : "Bảng giá & Gói dịch vụ"}
        </h2>
        <p className="text-xs text-zinc-450 mt-1">
          {lang === "en" ? "Select the tier that fits your scale. Upgrade anytime to unlock AI features." : "Chọn gói dịch vụ phù hợp nhất với quy mô hoạt động của bạn. Nâng cấp bất cứ lúc nào."}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs">{lang === "en" ? "Loading pricing tables..." : "Đang tải bảng giá..."}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>

          {/* Accordion Detailed Comparison Table */}
          <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="w-full p-5 text-left flex justify-between items-center bg-white/[0.01] hover:bg-white/[0.02] outline-none select-none transition-colors border-b border-white/5"
            >
              <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                {lang === "en" ? "Detailed Feature Matrix" : "Bảng so sánh chi tiết tính năng"}
              </span>
              {showComparison ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>

            {showComparison && (
              <div className="overflow-x-auto animate-fadeIn">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-zinc-950/40 text-zinc-500 font-bold">
                      <th className="p-4">{lang === "en" ? "Feature" : "Tính năng"}</th>
                      <th className="p-4 w-[20%] text-center">Free</th>
                      <th className="p-4 w-[20%] text-center">Pro</th>
                      <th className="p-4 w-[20%] text-center">Business</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-350">
                    <tr>
                      <td className="p-4 font-semibold text-zinc-200">Fanpage Facebook</td>
                      <td className="p-4 text-center">3</td>
                      <td className="p-4 text-center">20</td>
                      <td className="p-4 text-center">{lang === "en" ? "Unlimited" : "Không giới hạn"}</td>
                    </tr>
                    <tr className="bg-white/[0.01]">
                      <td className="p-4 font-semibold text-zinc-200">Lượt AI phản hồi/tháng</td>
                      <td className="p-4 text-center">—</td>
                      <td className="p-4 text-center">5.000</td>
                      <td className="p-4 text-center">{lang === "en" ? "Unlimited" : "Không giới hạn"}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-zinc-200">Auto Post & Scheduler</td>
                      <td className="p-4 text-center"><X className="w-4 h-4 text-zinc-650 mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr className="bg-white/[0.01]">
                      <td className="p-4 font-semibold text-zinc-200">Live Chat Hub</td>
                      <td className="p-4 text-center">1 page</td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-zinc-200">Luật Auto-Reply</td>
                      <td className="p-4 text-center">5 luật</td>
                      <td className="p-4 text-center">100 luật</td>
                      <td className="p-4 text-center">{lang === "en" ? "Unlimited" : "Không giới hạn"}</td>
                    </tr>
                    <tr className="bg-white/[0.01]">
                      <td className="p-4 font-semibold text-zinc-200">Ưu tiên hỗ trợ</td>
                      <td className="p-4 text-center">Email</td>
                      <td className="p-4 text-center">Email + Chat</td>
                      <td className="p-4 text-center">Dedicated Support</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-zinc-200">Xuất báo cáo dữ liệu</td>
                      <td className="p-4 text-center"><X className="w-4 h-4 text-zinc-650 mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 w-full max-w-sm shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center text-[#6C63FF] mx-auto animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase text-zinc-200 tracking-wider">
                {lang === "en" ? "Coming Soon" : "Tính năng đang được phát triển"}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                {lang === "en"
                  ? `Payment gateway integration to upgrade to ${targetPlanName} package is coming soon in the next sprint.`
                  : `Cổng thanh toán điện tử để nâng cấp lên gói dịch vụ ${targetPlanName} sẽ sớm được ra mắt và hoàn thiện trong Phase tiếp theo.`}
              </p>
            </div>
            <button
              onClick={() => setShowComingSoon(false)}
              className="py-2.5 w-full mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow-lg shadow-blue-500/10 active:scale-95"
            >
              {lang === "en" ? "Close" : "Đóng"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
