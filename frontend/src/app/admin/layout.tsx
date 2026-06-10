"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Gamepad2, 
  Receipt, 
  Settings, 
  LogOut, 
  Lock, 
  KeyRound, 
  ChevronRight,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [inputCode, setInputCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  // Check auth state on mount
  useEffect(() => {
    // Scrub legacy localstorage variables to ensure they are not retained in user's browser
    localStorage.removeItem("admin_passcode");
    localStorage.removeItem("admin_token");
    verifyToken(true);
  }, []);

  const verifyToken = async (isAuto = false) => {
    setIsVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings");

      if (res.ok) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        if (!isAuto) {
          setError("Session Expired: Re-authenticate passcode.");
        }
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      setError("Network error. Could not reach server.");
      if (isAuto) setIsAuthorized(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode) return;
    setIsVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passcode: inputCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthorized(true);
      } else {
        setError(data.error || "Access Denied: Invalid Passcode");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Network connection failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    
    // Purge local storage just in case
    localStorage.removeItem("admin_passcode");
    localStorage.removeItem("admin_token");
    
    setInputCode("");
    setIsAuthorized(false);
    router.push("/");
  };

  // While checking local storage
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#080b11] text-gray-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Checking authorizations...</p>
        </div>
      </div>
    );
  }

  // Not authorized: Show passcode gate page
  if (!isAuthorized) {
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-[#080b11] overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-cyan/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-4000"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md p-8 mx-4 rounded-2xl bg-[#111625]/80 border border-white/5 backdrop-blur-xl shadow-2xl shadow-black/50"
        >
          {/* Logo / Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-4 bg-brand-cyan/10 rounded-2xl border border-brand-cyan/20 text-brand-cyan mb-4 shadow-lg shadow-brand-cyan/5">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Admin Gateway <Sparkles className="w-5 h-5 text-brand-cyan" />
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Enter secure passcode to manage Gaming Top-up Portal settings
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Security Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan transition-all text-center tracking-widest text-lg font-mono"
                  disabled={isVerifying}
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-400 font-medium text-center">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying || !inputCode}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-cyan to-brand-purple text-[#080b11] font-bold rounded-xl shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:pointer-events-none cursor-pointer"
            >
              {isVerifying ? (
                <span className="w-5 h-5 border-2 border-[#080b11] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Verify Passcode <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors mt-4"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Home Page
            </Link>
          </form>
        </motion.div>
      </div>
    );
  }

  // Navigation Sidebar Options
  const navItems = [
    { label: "Overview", path: "/admin", icon: LayoutDashboard },
    { label: "Games & Packages", path: "/admin/games", icon: Gamepad2 },
    { label: "Transactions", path: "/admin/transactions", icon: Receipt },
    { label: "System Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#080b11] text-gray-200">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-[#1d2438] bg-[#0c101b] hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-[#1d2438]">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-black bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent tracking-wider">
              TOPUP PAY
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-brand-cyan/10 text-brand-cyan border-l-4 border-brand-cyan pl-3 shadow-inner"
                    : "text-gray-400 hover:bg-[#111625] hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-brand-cyan" : "text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1d2438]">
          <button
            onClick={handleLogout}
            className="flex items-center justify-between w-full px-4 py-3 text-xs font-semibold text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
          >
            <span>Exit Session</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#1d2438] bg-[#0c101b]/80 backdrop-blur-md px-6 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
            {/* Mobile Nav Button (Simple logo for mobile) */}
            <div className="md:hidden flex items-center gap-3">
              <span className="text-lg font-black bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
                TP
              </span>
              <span className="text-[9px] uppercase font-bold px-1 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan">
                Admin
              </span>
            </div>
            
            <h2 className="text-sm font-semibold text-gray-300 hidden md:block">
              {pathname === "/admin" && "Dashboard Overview"}
              {pathname === "/admin/games" && "Game & Price Packages Management"}
              {pathname === "/admin/transactions" && "Top-up Order Log History"}
              {pathname === "/admin/settings" && "System Settings & Promo Codes"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick stats on live auth */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-full">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></div>
              <span>Secured Session</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Submenu Navigation bar */}
        <div className="md:hidden bg-[#0c101b] border-b border-[#1d2438] px-4 py-2 flex items-center justify-around overflow-x-auto gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Page Render Body */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
