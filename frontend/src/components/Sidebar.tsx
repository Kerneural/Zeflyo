"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  Sliders, 
  Settings, 
  Globe, 
  Sun, 
  Moon, 
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState<"en" | "vi">("vi");
  const pathname = usePathname();

  useEffect(() => {
    const savedUser = localStorage.getItem("zeflyo_user");
    const savedTheme = localStorage.getItem("zeflyo_theme") || "dark";
    const savedLang = localStorage.getItem("zeflyo_lang") || "vi";

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
    setTheme(savedTheme as "dark" | "light");
    setLang(savedLang as "en" | "vi");

    // Listen for profile update events
    const handleProfileUpdate = () => {
      const updatedUser = localStorage.getItem("zeflyo_user");
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener("zeflyo_profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("zeflyo_profile_updated", handleProfileUpdate);
    };
  }, []);

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
    window.dispatchEvent(new Event("zeflyo_lang_changed"));
  };

  const handleLogout = () => {
    localStorage.removeItem("zeflyo_token");
    localStorage.removeItem("zeflyo_user");
    localStorage.removeItem("zeflyo_mock_pages");
    window.location.href = "/";
  };

  const isHomeActive = pathname === "/";
  const isSchedulerActive = pathname === "/scheduler";
  const isChatActive = pathname === "/chat";
  const isRulesActive = pathname === "/rules";
  const isSettingsActive = pathname?.startsWith("/settings");

  return (
    <aside className="hidden lg:flex w-72 bg-[#18181b] border-r border-zinc-800 flex-col relative z-20 transition-all duration-300">
      {/* Sidebar Header / Logo */}
      <div className="p-6 border-b border-zinc-850 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="font-extrabold text-white text-base">Z</span>
        </div>
        <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent logo-text">
          ZEFLYO
        </span>
      </div>

      {/* User Stats Card */}
      <div className="p-4 mx-4 mt-6 bg-[#09090b]/40 rounded-2xl border border-green-500/20 text-center flex flex-col gap-1 shadow-inner">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          {lang === "en" ? "Total Points" : "Tổng điểm"}
        </span>
        <span className="text-3xl font-extrabold text-emerald-400">200</span>
      </div>

      {/* Sidebar Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
        {/* Trang chủ */}
        <a
          href="/"
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-xs font-semibold uppercase ${
            isHomeActive 
              ? "bg-zinc-900 text-zinc-200 font-bold shadow-sm" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Home className={`w-4 h-4 ${isHomeActive ? "text-blue-500" : "text-zinc-500"}`} />
          <span>{lang === "en" ? "Home" : "Trang chủ"}</span>
        </a>

        {/* Lên lịch đăng bài */}
        <a
          href="/scheduler"
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-xs font-semibold uppercase ${
            isSchedulerActive 
              ? "bg-zinc-900 text-zinc-200 font-bold shadow-sm" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Calendar className={`w-4 h-4 ${isSchedulerActive ? "text-blue-500" : "text-zinc-500"}`} />
          <span>{lang === "en" ? "Scheduler" : "Lên lịch đăng bài"}</span>
        </a>

        {/* Hộp thư tập trung */}
        <a
          href="/chat"
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-xs font-semibold uppercase ${
            isChatActive 
              ? "bg-zinc-900 text-zinc-200 font-bold shadow-sm" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <MessageSquare className={`w-4 h-4 ${isChatActive ? "text-blue-500" : "text-zinc-500"}`} />
          <span>{lang === "en" ? "Live Inbox" : "Hộp thư tập trung"}</span>
        </a>

        {/* Luật Auto-reply */}
        <a
          href="/rules"
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-xs font-semibold uppercase ${
            isRulesActive 
              ? "bg-zinc-900 text-zinc-200 font-bold shadow-sm" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Sliders className={`w-4 h-4 ${isRulesActive ? "text-blue-500" : "text-zinc-500"}`} />
          <span>{lang === "en" ? "Auto-Reply Rules" : "Luật Auto-Reply"}</span>
        </a>

        {/* Cài đặt */}
        <a
          href="/settings/general"
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-xs font-semibold uppercase ${
            isSettingsActive 
              ? "bg-zinc-900 text-zinc-200 font-bold shadow-sm" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Settings className={`w-4 h-4 ${isSettingsActive ? "text-blue-500" : "text-zinc-500"}`} />
          <span>{lang === "en" ? "Settings" : "Cài đặt"}</span>
        </a>
      </nav>

      {/* Sidebar Footer with user info & toggles */}
      <div className="p-4 border-t border-zinc-850 flex flex-col gap-4">
        {/* User profile row */}
        {user && (
          <div className="flex items-center justify-between bg-zinc-950/40 border border-zinc-850/50 p-2.5 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-450 flex-shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.display_name ? user.display_name.charAt(0) : user.name.charAt(0)
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-zinc-200 font-bold truncate block">
                  {user.display_name || user.name}
                </span>
                <span className="text-[10px] text-zinc-500 truncate block">
                  {user.email || "user@zeflyo.io"}
                </span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer flex-shrink-0"
              title={lang === "en" ? "Sign Out" : "Đăng xuất"}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Utility actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-full text-xs font-semibold transition-all border border-zinc-850 cursor-pointer active:scale-95 shadow-sm"
            title="Switch Language / Đổi ngôn ngữ"
          >
            <Globe className="w-3.5 h-3.5 text-blue-455" />
            <span>{lang === "en" ? "EN" : "VI"}</span>
          </button>
          
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-full transition-all border border-zinc-850 cursor-pointer active:scale-95 shadow-sm"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
