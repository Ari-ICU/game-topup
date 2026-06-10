"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import KhqrPaymentCard from "@/components/KhqrPaymentCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Check, ShieldCheck, Search } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { apiService } from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";

const KhqrLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="48" fill="#e21a22" />
    <path
      d="M50 20 C55 35 65 35 70 35 C65 40 65 50 65 50 C65 50 65 60 70 65 C65 65 55 65 50 80 C45 65 35 65 30 65 C35 60 35 50 35 50 C35 50 35 40 30 35 C35 35 45 35 50 20 Z"
      fill="white"
    />
    <circle cx="50" cy="50" r="10" fill="#e21a22" />
    <circle cx="50" cy="50" r="4" fill="white" />
  </svg>
);

interface Package {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  bestValue?: boolean;
}

interface GameDetail {
  name: string;
  image: string;
  slug: string;
  idType: string;
  hasZoneId?: boolean;
  packages: Package[];
}

const gameDatabase: Record<string, GameDetail> = {
  "mobile-legends": {
    name: "Mobile Legends",
    image: "/images/mlbb.png",
    slug: "mobile-legends",
    idType: "User ID",
    hasZoneId: true,
    packages: [
      { id: "ml-1", name: "86 Diamonds", price: 1.5, originalPrice: 1.8 },
      { id: "ml-2", name: "172 Diamonds", price: 3.0, originalPrice: 3.6 },
      { id: "ml-3", name: "257 Diamonds", price: 4.5, originalPrice: 5.4 },
      { id: "ml-4", name: "706 Diamonds", price: 12.0, originalPrice: 15.0, bestValue: true },
      { id: "ml-5", name: "2195 Diamonds", price: 35.0, originalPrice: 42.0 },
    ],
  },
  "pubg-mobile": {
    name: "PUBG Mobile",
    image: "/images/pubg.png",
    slug: "pubg-mobile",
    idType: "Character ID",
    packages: [
      { id: "pubg-1", name: "60 UC", price: 1.0, originalPrice: 1.2 },
      { id: "pubg-2", name: "325 UC", price: 5.0, originalPrice: 6.0 },
      { id: "pubg-3", name: "660 UC", price: 10.0, originalPrice: 12.0, bestValue: true },
      { id: "pubg-4", name: "1800 UC", price: 25.0, originalPrice: 30.0 },
      { id: "pubg-5", name: "3850 UC", price: 50.0, originalPrice: 60.0 },
    ],
  },
  "free-fire": {
    name: "Garena Free Fire",
    image: "/images/free_fire.png",
    slug: "free-fire",
    idType: "Player ID",
    packages: [
      { id: "ff-1", name: "100 Diamonds", price: 1.0, originalPrice: 1.2 },
      { id: "ff-2", name: "310 Diamonds", price: 3.0, originalPrice: 3.6 },
      { id: "ff-3", name: "520 Diamonds", price: 5.0, originalPrice: 6.0, bestValue: true },
      { id: "ff-4", name: "1060 Diamonds", price: 10.0, originalPrice: 12.0 },
      { id: "ff-5", name: "2180 Diamonds", price: 20.0, originalPrice: 24.0 },
    ],
  },
  "roblox": {
    name: "Roblox",
    image: "/images/roblox.png",
    slug: "roblox",
    idType: "Roblox Username",
    packages: [
      { id: "rb-1", name: "400 Robux", price: 5.0, originalPrice: 6.0 },
      { id: "rb-2", name: "800 Robux", price: 10.0, originalPrice: 12.0, bestValue: true },
      { id: "rb-3", name: "1700 Robux", price: 20.0, originalPrice: 24.0 },
      { id: "rb-4", name: "4500 Robux", price: 50.0, originalPrice: 60.0 },
    ],
  },
};

type TxStatus = "IDLE" | "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

// Animation variants
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

const pkgContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const pkgCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const statusVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
  exit: { opacity: 0, scale: 0.85, y: -20, transition: { duration: 0.3 } },
};

export default function GameTopupPage() {
  const { slug } = useParams();
  const { formatPrice } = useCurrency();

  const [apiGame, setApiGame] = useState<any>(null);
  const [loadingGame, setLoadingGame] = useState(true);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>("KHQR");
  const [status, setStatus] = useState<TxStatus>("IDLE");
  const [pkgSearch, setPkgSearch] = useState("");
  const [idCheckStatus, setIdCheckStatus] = useState<"IDLE" | "CHECKING" | "FOUND" | "NOT_FOUND">("IDLE");
  const [checkedName, setCheckedName] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300);

  const { language, t } = useLanguage();
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);
  const [promoCodeError, setPromoCodeError] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    setXp(parseInt(localStorage.getItem("app_xp") || "0", 10));
  }, []);

  const loyaltyDiscount = useMemo(() => {
    if (xp >= 2000) return 5;     // Platinum
    if (xp >= 500) return 2.5;    // Gold
    if (xp >= 100) return 1;      // Silver
    return 0;                     // Bronze
  }, [xp]);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim() || !selectedPkg) return;
    setIsValidatingPromo(true);
    setPromoCodeError("");
    try {
      const res = await fetch("/api/transactions/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCodeInput.trim(), packageId: selectedPkg })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setPromoDiscountAmount(data.discountAmount);
        setPromoCodeApplied(true);
      } else {
        setPromoCodeError(data.error?.message || "Invalid promo code");
      }
    } catch (err) {
      console.error(err);
      setPromoCodeError("Connection failure");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const fallbackGame = gameDatabase[slug as string];

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoadingGame(true);
        const data = await apiService.getGameDetails(slug as string);
        setApiGame(data);
      } catch (err) {
        console.warn("Backend API offline or game not found. Using local mock data.", err);
      } finally {
        setLoadingGame(false);
      }
    };
    if (slug) {
      fetchGame();
    }
  }, [slug]);

  const game = useMemo(() => {
    if (apiGame) {
      return {
        name: apiGame.name,
        image: apiGame.iconUrl,
        slug: apiGame.slug,
        idType: slug === "mobile-legends" ? "User ID" : slug === "roblox" ? "Roblox Username" : "Player ID",
        hasZoneId: slug === "mobile-legends",
        packages: apiGame.packages.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          price: Number(pkg.price),
          originalPrice: Number(pkg.originalPrice),
          bestValue: pkg.bestValue,
        })),
      };
    }
    return fallbackGame;
  }, [apiGame, fallbackGame, slug]);

  const activePackage = useMemo(() => {
    return game?.packages.find((p: Package) => p.id === selectedPkg);
  }, [game, selectedPkg]);

  const filteredPackages = useMemo(() => {
    if (!game) return [];
    const q = pkgSearch.trim().toLowerCase();
    if (!q) return game.packages;
    return game.packages.filter(
      (p: Package) =>
        p.name.toLowerCase().includes(q) ||
        p.price.toString().includes(q)
    );
  }, [game, pkgSearch]);

  const handleCheckId = () => {
    if (!playerId.trim()) return;
    setIdCheckStatus("CHECKING");
    setCheckedName("");
    setTimeout(() => {
      if (playerId.trim().length >= 4) {
        const mockNames = ["WarriorX", "ShadowBlade", "PhoenixRise", "NightHunter", "StarForge"];
        const name = mockNames[playerId.trim().length % mockNames.length];
        setCheckedName(name);
        setIdCheckStatus("FOUND");
      } else {
        setIdCheckStatus("NOT_FOUND");
      }
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !selectedPkg || !paymentMethod) return;

    const isRealObjectId = /^[0-9a-fA-F]{24}$/.test(selectedPkg);

    if (isRealObjectId) {
      try {
        setStatus("PENDING");
        const data = await apiService.createTransaction({
          packageId: selectedPkg,
          paymentMethod,
          playerInfo: {
            playerId,
            ...(zoneId ? { zoneId } : {}),
          },
          promoCode: promoCodeApplied ? promoCodeInput : undefined,
          vipDiscountPercentage: loyaltyDiscount,
        });
        setTransactionId(data.id);
        setQrCode(data.qrCode || null);
        setCountdown(300);
      } catch (err: any) {
        console.error("API error creating transaction:", err);
        alert(`API Error: ${err.message || "Failed to initiate transaction"}`);
        setStatus("IDLE");
      }
    } else {
      setStatus("PENDING");
      setCountdown(300);
    }
  };

  // Real transaction status polling
  useEffect(() => {
    if (!transactionId) return;

    const pollTransaction = async () => {
      try {
        const data = await apiService.getTransaction(transactionId);

        switch (data.status) {
          case "COMPLETED": {
            const baseAmount = activePackage ? activePackage.price : 10;
            const earnedXp = Math.max(5, Math.floor(baseAmount * 10));
            const currentXp = parseInt(localStorage.getItem("app_xp") || "0", 10);
            localStorage.setItem("app_xp", (currentXp + earnedXp).toString());
            window.dispatchEvent(new Event("xpUpdated"));

            setQrCode(null);
            setTransactionId(null);
            setStatus("COMPLETED");
            break;
          }

          case "PROCESSING":
            setQrCode(null);
            setStatus("PROCESSING");
            break;

          case "FAILED":
          case "EXPIRED":
            setQrCode(null);
            setTransactionId(null);
            setStatus("FAILED");
            break;

          case "PENDING":
            setQrCode(data.qrCode ?? null);
            setStatus("PENDING");
            break;
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollTransaction();

    const interval = setInterval(pollTransaction, 2000);

    return () => clearInterval(interval);
  }, [transactionId, activePackage]);

  // Mock flow (when there is no transactionId in database fallback mode)
  useEffect(() => {
    if (!transactionId) {
      if (status === "PENDING") {
        const timer = setTimeout(() => setStatus("PROCESSING"), 1800);
        return () => clearTimeout(timer);
      } else if (status === "PROCESSING") {
        const timer = setTimeout(() => {
          const baseAmount = activePackage ? activePackage.price : 10;
          const earnedXp = Math.max(5, Math.floor(baseAmount * 10));
          const currentXp = parseInt(localStorage.getItem("app_xp") || "0", 10);
          localStorage.setItem("app_xp", (currentXp + earnedXp).toString());
          window.dispatchEvent(new Event("xpUpdated"));

          setStatus("COMPLETED");
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [status, transactionId, activePackage]);

  // Real countdown timer hook
  useEffect(() => {
    if (status !== "PENDING" || !transactionId) {
      setCountdown(300);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, transactionId]);

  const handleSimulatePayment = async () => {
    if (!transactionId) return;
    try {
      await apiService.simulatePayment(transactionId);
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    }
  };

  const handleReset = () => {
    setPlayerId("");
    setZoneId("");
    setSelectedPkg(null);
    setPaymentMethod("KHQR");
    setStatus("IDLE");
    setIdCheckStatus("IDLE");
    setCheckedName("");
    setTransactionId(null);
    setQrCode(null); // Always clear QR on reset
    setCountdown(300);
  };

  // Go back to the form but keep player ID, package & payment method filled
  const handleCancelPayment = () => {
    setStatus("IDLE");
    setTransactionId(null);
    setQrCode(null);
    setCountdown(300);
  };

  // Renders loading state while fetching API
  if (loadingGame) {
    return (
      <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 rounded-full border-4 border-gray-700 border-t-brand-cyan animate-spin" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              {language === "en" ? "Loading Game Details..." : "កំពុងទាញយកព័ត៌មានលម្អិតនៃហ្គេម..."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!game) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column - Game details */}
        <motion.div
          className="lg:col-span-4 space-y-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="bg-[#111625] border border-[#1d2438] rounded-2xl overflow-hidden shadow-lg">
            <div className="relative aspect-[16/10]">
              <Image src={game.image} alt={game.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111625] via-transparent to-transparent" />
            </div>
            <div className="p-6 space-y-4">
              <h1 className="text-2xl font-black text-white">{game.name}</h1>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                {language === "en"
                  ? "Select your package, fill in your Player ID, pay with your local banking app, and receive the credit instantly."
                  : "ជ្រើសរើសកញ្ចប់របស់អ្នក បញ្ចូលលេខសម្គាល់គណនី (Player ID) ទូទាត់ប្រាក់តាមកម្មវិធីធនាគាររបស់អ្នក ហើយទទួលបានកាក់ហ្គេមភ្លាមៗ។"}
              </p>
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-cyan">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {language === "en" ? "Officially Licensed top-ups" : "ការបញ្ចូលលុយស្របច្បាប់ផ្លូវការ"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Purchase workflow */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {status === "IDLE" ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              >
                {/* Step 1: User Verification */}
                <motion.section
                  className="bg-[#111625]/60 border border-[#1d2438] p-6 rounded-2xl space-y-4 shadow-sm"
                  custom={0}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-cyan text-xs font-black text-white">
                      1
                    </span>
                    <h2 className="text-base font-bold text-white">{t.checkout.step1}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Player ID + Check button */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400">{game.idType}</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder={t.checkout.playerIdPlaceholder}
                          value={playerId}
                          onChange={(e) => {
                            setPlayerId(e.target.value);
                            setIdCheckStatus("IDLE");
                            setCheckedName("");
                          }}
                          className="flex-1 text-sm font-semibold rounded-xl border border-[#1d2438] bg-[#080b11] p-3 outline-none focus:border-brand-cyan transition min-w-0"
                        />
                      </div>
                    </div>
                    {game.hasZoneId && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400">Zone ID / Server ID</label>
                        <input
                          type="text"
                          required
                          placeholder={t.checkout.zoneIdPlaceholder}
                          value={zoneId}
                          onChange={(e) => setZoneId(e.target.value)}
                          className="w-full text-sm font-semibold rounded-xl border border-[#1d2438] bg-[#080b11] p-3 outline-none focus:border-brand-cyan transition"
                        />
                      </div>
                    )}
                  </div>
                  {/* ID check result */}
                      <AnimatePresence>
                        {idCheckStatus === "FOUND" && (
                          <motion.div
                            key="found"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20"
                          >
                            <Check className="w-3.5 h-3.5 text-green-400 shrink-0 stroke-[3px]" />
                            <span className="text-xs font-bold text-green-400">Found: <span className="text-white">{checkedName}</span></span>
                          </motion.div>
                        )}
                        {idCheckStatus === "NOT_FOUND" && (
                          <motion.div
                            key="notfound"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
                          >
                            <span className="text-xs font-bold text-red-400">Player ID not found. Please check and try again.</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                  <motion.button
                    type="button"
                    onClick={handleCheckId}
                    disabled={!playerId.trim() || idCheckStatus === "CHECKING"}
                    className="shrink-0 px-3 py-2 rounded-xl border-2 border-[#1d2438] bg-[#080b11] text-xs font-bold text-gray-300 hover:border-brand-cyan hover:text-brand-cyan disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex items-center gap-1.5"
                    whileTap={{ scale: 0.95 }}
                  >
                    {idCheckStatus === "CHECKING" ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-600 border-t-brand-cyan animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    {language === "en" ? "Check" : "ផ្ទៀងផ្ទាត់"}
                  </motion.button>
                </motion.section>

                {/* Step 2: Package Selection */}
                <motion.section
                  className="bg-[#111625]/60 border border-[#1d2438] p-6 rounded-2xl space-y-4 shadow-sm"
                  custom={1}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-cyan text-xs font-black text-white">
                        2
                      </span>
                      <h2 className="text-base font-bold text-white">{t.checkout.step2}</h2>
                      <span className="text-[10px] font-bold text-gray-500 bg-[#1d2438] px-2 py-0.5 rounded-full">
                        {filteredPackages.length} / {game.packages.length}
                      </span>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="text"
                        placeholder={language === "en" ? "Filter packages..." : "ស្វែងរកកញ្ចប់..."}
                        value={pkgSearch}
                        onChange={(e) => setPkgSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs font-semibold rounded-lg border border-[#1d2438] bg-[#080b11] text-white outline-none focus:border-brand-cyan/60 transition w-44 placeholder-gray-600"
                      />
                    </div>
                  </div>

                  {/* Scrollable package grid */}
                  <div
                    className="overflow-y-auto pr-1 pt-1 pb-1"
                    style={{
                      maxHeight: "420px",
                      scrollbarWidth: "thin",
                      scrollbarColor: "#1d2438 transparent",
                    }}
                  >
                    {filteredPackages.length === 0 ? (
                      <motion.div
                        className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Search className="w-8 h-8 opacity-30" />
                        <p className="text-sm font-semibold">
                          {language === "en" ? "No packages match" : "រកមិនឃើញកញ្ចប់ដែលត្រូវគ្នាជាមួយ"} &ldquo;{pkgSearch}&rdquo;
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5"
                        variants={pkgContainerVariants}
                        initial="hidden"
                        animate="visible"
                        key={pkgSearch} // re-animate on filter change
                      >
                        {filteredPackages.map((pkg: Package) => (
                          <motion.button
                            key={pkg.id}
                            type="button"
                            variants={pkgCardVariants}
                            onClick={() => setSelectedPkg(pkg.id)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className={`relative flex flex-col rounded-xl border-2 text-left transition-all duration-150 cursor-pointer overflow-hidden ${pkg.bestValue ? "pt-6 px-3 pb-3" : "p-3"
                              } ${selectedPkg === pkg.id
                                ? "border-brand-cyan bg-brand-cyan/5 text-white shadow-[0_0_12px_rgba(0,229,255,0.12)]"
                                : "border-[#1d2438] bg-[#080b11] hover:border-[#2d3856] hover:bg-[#0e1220] text-gray-300"
                              }`}
                          >
                            {/* Best Value absolute ribbon */}
                            {pkg.bestValue && (
                              <motion.div
                                className="absolute top-0 left-0 right-0 flex items-center justify-center gap-1 bg-gradient-to-r from-brand-cyan to-cyan-400 py-[3px]"
                                animate={{ opacity: [0.85, 1, 0.85] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <span className="text-[9px] font-black uppercase tracking-widest text-black">
                                  ⭐ {language === "en" ? "Best Value" : "តម្លៃល្អបំផុត"}
                                </span>
                              </motion.div>
                            )}

                            <div className="flex items-start justify-between gap-1">
                              <div className="font-bold text-xs leading-tight flex-1">{pkg.name}</div>
                              <AnimatePresence>
                                {selectedPkg === pkg.id && (
                                  <motion.div
                                    key="check"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    className="shrink-0 w-4 h-4 rounded-full bg-brand-cyan flex items-center justify-center"
                                  >
                                    <Check className="w-2.5 h-2.5 text-black stroke-[3.5px]" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="mt-2 font-black text-sm text-brand-cyan">
                              {formatPrice(Number((pkg.price * (1 - loyaltyDiscount / 100)).toFixed(2)))}
                              {loyaltyDiscount > 0 && (
                                <span className="text-[10px] text-yellow-500 font-bold ml-1">
                                  (-{loyaltyDiscount}%)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-600 line-through mt-0.5">{formatPrice(pkg.originalPrice)}</div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.section>

                {/* Step 3: Payment Method */}
                <motion.section
                  className="bg-[#111625]/60 border border-[#1d2438] p-6 rounded-2xl space-y-4 shadow-sm"
                  custom={2}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-cyan text-xs font-black text-white">
                      3
                    </span>
                    <h2 className="text-base font-bold text-white">{t.checkout.step3}</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-w-full mx-auto w-full">
                    {[
                      { name: "KHQR", code: "KHQR", bg: "bg-gradient-to-tr from-[#e21a22] to-[#e5a93b]", color: "text-white" },
                    ].map((bank) => (
                      <motion.button
                        key={bank.code}
                        type="button"
                        onClick={() => setPaymentMethod(bank.code)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex items-center space-x-3 rounded-xl border-2 p-3.5 text-left transition duration-200 cursor-pointer ${paymentMethod === bank.code
                          ? "border-brand-cyan bg-brand-cyan/5 text-white"
                          : "border-[#1d2438] bg-[#080b11] hover:border-gray-700 text-gray-300"
                          }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          <KhqrLogo className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm">{bank.name}</div>
                          <div className="text-[10px] text-gray-500">
                            {language === "en" ? "Scan code to pay instantly" : "ស្កែនកូដដើម្បីទូទាត់ប្រាក់ភ្លាមៗ"}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.section>

                {/* Step 4: Promo Code */}
                <motion.section
                  className="bg-[#111625]/60 border border-[#1d2438] p-6 rounded-2xl space-y-4 shadow-sm"
                  custom={3}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-cyan text-xs font-black text-white">
                      4
                    </span>
                    <h2 className="text-base font-bold text-white">{t.checkout.promoCodeLabel}</h2>
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="text"
                      placeholder={t.checkout.promoCodePlaceholder}
                      value={promoCodeInput}
                      onChange={(e) => {
                        setPromoCodeInput(e.target.value);
                        setPromoCodeError("");
                        setPromoCodeApplied(false);
                        setPromoDiscountAmount(0);
                      }}
                      disabled={!selectedPkg || promoCodeApplied || isValidatingPromo}
                      className="block w-full px-4 py-4 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-cyan transition-all text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={!selectedPkg || !promoCodeInput.trim() || promoCodeApplied || isValidatingPromo}
                      className="py-4 w-20 sm:w-[200px] bg-brand-cyan text-black font-bold text-xs rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40"
                    >
                      {isValidatingPromo ? (
                        <span className="w-3 h-3 border-1 border-black border-t-transparent rounded-full animate-spin block"></span>
                      ) : (
                        t.checkout.applyPromo
                      )}
                    </button>
                  </div>
                  {promoCodeApplied && (
                    <p className="text-xs text-green-400 font-semibold">{t.checkout.promoApplied}</p>
                  )}
                  {promoCodeError && (
                    <p className="text-xs text-red-400 font-semibold">{t.checkout.invalidPromo}</p>
                  )}
                </motion.section>

                {/* Step 5: Sticky Order Summary + Buy */}
                <motion.div
                  custom={4}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  className={`sticky bottom-4 z-20 rounded-2xl border p-4 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300 ${activePackage && idCheckStatus === "FOUND"
                    ? "bg-[#111625]/95 backdrop-blur border-brand-cyan/30 shadow-[0_0_30px_rgba(0,229,255,0.15)]"
                    : "bg-[#111625]/70 backdrop-blur border-[#1d2438]"
                    }`}
                >
                  <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{language === "en" ? "Selected Package" : "កញ្ចប់ដែលជ្រើសរើស"}</span>
                        <div className="font-bold text-sm text-white mt-0.5">
                          {activePackage ? activePackage.name : <span className="text-gray-600">{language === "en" ? "None selected" : "មិនទាន់ជ្រើសរើស"}</span>}
                        </div>
                      </div>
                      <AnimatePresence>
                        {activePackage && (
                          <motion.div
                            key="total"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.25 }}
                            className="ml-auto sm:ml-0 text-right sm:text-left space-y-1"
                          >
                            <div className="text-[10px] space-y-0.5 text-gray-400 font-semibold">
                              <div>{t.checkout.originalPriceLabel}: <span className="text-white">{formatPrice(activePackage.price)}</span></div>
                              {loyaltyDiscount > 0 && (
                                <div className="text-yellow-500">{t.checkout.vipDiscountLabel} (-{loyaltyDiscount}%): <span>-${formatPrice(Number((activePackage.price * (loyaltyDiscount / 100)).toFixed(2))).replace("$", "")}</span></div>
                              )}
                              {promoCodeApplied && (
                                <div className="text-green-400">{t.checkout.promoDiscountLabel}: <span>-${formatPrice(promoDiscountAmount).replace("$", "")}</span></div>
                              )}
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.checkout.finalPriceLabel}</span>
                              <div className="font-black text-lg text-brand-cyan">
                                {formatPrice(Math.max(0, Number((activePackage.price - Number((activePackage.price * (loyaltyDiscount / 100)).toFixed(2)) - promoDiscountAmount).toFixed(2))))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* Warning: ID not verified */}
                    <AnimatePresence>
                      {playerId && idCheckStatus !== "FOUND" && (
                        <motion.div
                          key="warn"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400"
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          {language === "en" ? "Please verify your Player ID before paying" : "សូមផ្ទៀងផ្ទាត់លេខសម្គាល់គណនីមុនពេលបង់ប្រាក់"}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={!playerId || !selectedPkg || !paymentMethod || idCheckStatus !== "FOUND"}
                    className="w-full sm:w-auto bg-brand-cyan hover:bg-brand-cyan-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_35px_rgba(0,229,255,0.6)] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    {language === "en" ? "Confirm & Pay" : "បញ្ជាក់ & បង់ប្រាក់"}
                  </motion.button>
                </motion.div>
              </motion.form>
            ) : (
              /* Transaction status machine */
              <motion.div
                key="status"
                className="bg-[#111625] border border-[#1d2438] p-10 rounded-2xl text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <AnimatePresence mode="wait">
                  {status === "PENDING" && (
                    <motion.div
                      key="pending"
                      variants={statusVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex flex-col items-center space-y-6"
                    >
                      {status === "PENDING" &&
                        paymentMethod === "KHQR" &&
                        qrCode ? (
                        <KhqrPaymentCard
                          qrCode={qrCode}
                          amount={activePackage ? formatPrice(Math.max(0, Number((activePackage.price - Number((activePackage.price * (loyaltyDiscount / 100)).toFixed(2)) - promoDiscountAmount).toFixed(2)))) : "$0.00"}
                          packageName={activePackage?.name}
                          countdown={countdown}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full border-4 border-gray-700 border-t-[#e21a22] animate-spin" />
                      )}
                      <div className="space-y-4 flex flex-col items-center">
                        <h2 className="text-xl font-bold text-white">
                          {language === "en" ? "Awaiting Payment Confirmation" : "កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់"}
                        </h2>
                        <p className="text-sm text-gray-400 max-w-sm text-center">
                          {language === "en"
                            ? "Scan the QR code with any Cambodian banking app. We'll confirm automatically."
                            : "ស្កែនរូបភាព QR កូដជាមួយកម្មវិធីធនាគារណាមួយក្នុងប្រទេសកម្ពុជា។ ប្រព័ន្ធនឹងផ្ទៀងផ្ទាត់ដោយស្វ័យប្រវត្តិ។"}
                        </p>
                        {/* Cancel & go back button */}
                        <motion.button
                          type="button"
                          onClick={handleCancelPayment}
                          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white border border-[#1d2438] hover:border-gray-600 bg-[#111625]/60 hover:bg-[#1d2438] px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          {language === "en" ? "Cancel & Change Package" : "បោះបង់ & ផ្លាស់ប្តូរកញ្ចប់"}
                        </motion.button>
                      </div>
                    </motion.div>

                  )}
                  {status === "PROCESSING" && (
                    <motion.div
                      key="processing"
                      variants={statusVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex flex-col items-center space-y-6"
                    >
                      <div className="w-14 h-14 rounded-full border-4 border-gray-700 border-t-brand-purple animate-spin" />
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">
                          {language === "en" ? "Verifying Transaction" : "កំពុងផ្ទៀងផ្ទាត់ប្រតិបត្តិការ"}
                        </h2>
                        <p className="text-sm text-gray-400 max-w-sm">
                          {language === "en"
                            ? "Delivering diamonds/credits to user ID: "
                            : "កំពុងបញ្ចូលកាក់ហ្គេមទៅកាន់លេខសម្គាល់គណនី: "}
                          <span className="text-brand-cyan font-bold">{playerId}</span>...
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {status === "FAILED" && (
                    <motion.div
                      key="failed"
                      variants={statusVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex flex-col items-center space-y-5 w-full"
                    >
                      <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shadow-[0_0_24px_rgba(239,68,68,0.2)]">
                        <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div className="text-center space-y-1">
                        <h2 className="text-2xl font-black text-red-400">
                          {language === "en" ? "Payment Failed or Expired" : "ការទូទាត់បរាជ័យ ឬហួសពេលកំណត់"}
                        </h2>
                        <p className="text-sm text-gray-400 font-medium">
                          {language === "en"
                            ? "The transaction was not completed. Please try again."
                            : "ប្រតិបត្តិការមិនត្រូវបានបញ្ចប់ឡើយ។ សូមព្យាយាមម្តងទៀត។"}
                        </p>
                      </div>
                      <motion.button
                        onClick={handleReset}
                        className="bg-brand-cyan hover:bg-brand-cyan-hover text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        {language === "en" ? "Try Again" : "ព្យាយាមម្តងទៀត"}
                      </motion.button>
                    </motion.div>
                  )}
                  {status === "COMPLETED" && (
                    <motion.div
                      key="completed"
                      variants={statusVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex flex-col items-center space-y-5 w-full"
                    >
                      {/* Success icon with radiate ring */}
                      <div className="relative flex items-center justify-center">
                        <motion.div
                          className="absolute w-24 h-24 rounded-full bg-green-400/10 border border-green-400/20"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: [0.5, 1.4, 1], opacity: [0, 0.6, 0] }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                        <motion.div
                          className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center shadow-[0_0_24px_rgba(34,197,94,0.2)]"
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          <Check className="w-7 h-7 text-green-400 stroke-[2.5px]" />
                        </motion.div>
                      </div>

                      {/* Title */}
                      <motion.div
                        className="text-center space-y-1"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h2 className="text-2xl font-black text-green-400">
                          {language === "en" ? "Top-up Successful!" : "បញ្ចូលលុយហ្គេមជោគជ័យ!"}
                        </h2>
                        <p className="text-sm text-gray-400 font-medium">
                          {language === "en"
                            ? "Credits delivered to your account instantly."
                            : "កាក់ហ្គេមត្រូវបានបញ្ចូលទៅក្នុងគណនីរបស់អ្នកភ្លាមៗ។"}
                        </p>
                      </motion.div>

                      {/* Receipt Card */}
                      <motion.div
                        className="w-full bg-[#111625]/80 border border-[#1d2438] rounded-2xl overflow-hidden"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="bg-green-500/10 border-b border-green-500/20 px-5 py-3 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-green-400" />
                          <span className="text-xs font-black text-green-400 uppercase tracking-wider">
                            {language === "en" ? "Payment Receipt" : "វិក្កយបត្រទូទាត់ប្រាក់"}
                          </span>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                          {[
                            { label: language === "en" ? "Game" : "ហ្គេម", value: game?.name ?? "—" },
                            { label: language === "en" ? "Package" : "កញ្ចប់", value: activePackage?.name ?? "—" },
                            { label: language === "en" ? "Amount Paid" : "ទឹកប្រាក់បានបង់", value: activePackage ? formatPrice(activePackage.price) : "—" },
                            { label: language === "en" ? "Payment" : "ការទូទាត់", value: "KHQR / Bakong" },
                            { label: language === "en" ? "Status" : "ស្ថានភាព", value: language === "en" ? "✅ Completed" : "✅ ជោគជ័យ" },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between text-xs font-medium border-b border-[#1d2438]/60 last:border-0 pb-2.5 last:pb-0">
                              <span className="text-gray-500">{label}</span>
                              <span className="text-white font-bold">{value}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* CTA buttons */}
                      <motion.div
                        className="flex gap-3 w-full"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                      >
                        <motion.button
                          onClick={handleReset}
                          className="flex-1 bg-[#1d2438] hover:bg-[#2d3856] text-white font-bold text-xs py-3 rounded-xl transition duration-200 cursor-pointer border border-[#2d3856]"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          {language === "en" ? "Top-up Again" : "បញ្ចូលលុយម្តងទៀត"}
                        </motion.button>
                        <motion.a
                          href="/games"
                          className="flex-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/25 text-green-400 font-bold text-xs py-3 rounded-xl transition duration-200 text-center flex items-center justify-center"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          {language === "en" ? "Browse Games" : "មើលហ្គេមផ្សេងទៀត"}
                        </motion.a>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
