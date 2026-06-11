"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Tag, Sparkles, Copy, Check, Zap, Clock, ArrowRight, Send } from "lucide-react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { apiService } from "@/services/api";

// ── Animation variants ────────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Deal {
  title: string;
  desc: string;
  code: string;
  discount: string;
  badge: string;
  accentFrom: string;
  accentTo: string;
  accentText: string;
  glowColor: string;
  expiresHours: number;
  game: string;
  gameSlug: string;
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function CountdownTimer({ hours }: { hours: number }) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(() => {
    const total = hours * 3600;
    return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const total = prev.h * 3600 + prev.m * 60 + prev.s - 1;
        if (total <= 0) return { h: 0, m: 0, s: 0 };
        return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
      <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
      <span className="text-[10px] text-gray-500 font-semibold">{t.offers.expiresIn}</span>
      <span className="font-mono font-black text-xs text-white tabular-nums ml-auto">
        {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
      </span>
    </div>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────
function CopyButton({ code, accentText }: { code: string; accentText: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#080c15] border border-white/[0.07] hover:border-white/[0.15] transition-all duration-200 overflow-hidden"
    >
      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest shrink-0">
        {t.offers.codeLabel}
      </span>
      <span
        className="flex-1 text-sm font-black uppercase tracking-[0.2em] text-center"
        style={{ color: accentText }}
      >
        {code}
      </span>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="shrink-0 text-emerald-400"
          >
            <Check className="w-3.5 h-3.5 stroke-[3px]" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="shrink-0 text-gray-600 group-hover:text-gray-400 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// ── Deal Card ─────────────────────────────────────────────────────────────────
function DealCard({ deal }: { deal: Deal }) {
  const { t } = useLanguage();

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="relative group rounded-2xl bg-[#0d1117] border border-white/[0.07] hover:border-white/[0.13] overflow-hidden flex flex-col transition-all duration-300"
      style={{
        boxShadow: `0 0 0 0 ${deal.glowColor}`,
      }}
      whileInView={{ boxShadow: "none" }}
    >
      {/* Gradient top bar */}
      <div
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(to right, ${deal.accentFrom}, ${deal.accentTo})` }}
      />

      {/* Subtle glow wash */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at top, ${deal.glowColor} 0%, transparent 65%)`,
        }}
      />

      <div className="relative flex flex-col flex-1 p-6 gap-5">
        {/* Top row: badge + discount pill */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-[10px] font-bold text-gray-500 leading-tight">{deal.badge}</span>
          <span
            className="text-xs font-black px-2.5 py-1 rounded-full border shrink-0"
            style={{
              color: deal.accentText,
              background: `${deal.glowColor}`,
              borderColor: `${deal.accentFrom}40`,
            }}
          >
            {deal.discount}
          </span>
        </div>

        {/* Title block */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              background: `${deal.glowColor}`,
              borderColor: `${deal.accentFrom}30`,
            }}
          >
            <Tag className="w-4.5 h-4.5" style={{ color: deal.accentText }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{deal.title}</h3>
            <p className="text-[10px] text-gray-600 font-semibold mt-0.5">{deal.game}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[12px] text-gray-500 leading-relaxed flex-1">{deal.desc}</p>

        {/* Countdown */}
        <CountdownTimer hours={deal.expiresHours} />

        {/* Copy code */}
        <CopyButton code={deal.code} accentText={deal.accentText} />

        {/* CTA */}
        <Link href={`/${deal.gameSlug}`}>
          <motion.div
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border font-bold text-xs transition-all duration-200 cursor-pointer"
            style={{
              color: deal.accentText,
              borderColor: `${deal.accentFrom}30`,
              background: `${deal.glowColor}`,
            }}
            whileHover={{
              scale: 1.02,
              background: deal.accentFrom,
              color: "#080b11",
              borderColor: deal.accentFrom,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap className="w-3.5 h-3.5" />
            {t.offers.useOffer}
            <ArrowRight className="w-3 h-3" />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

const mapPromoToDeal = (promo: any, t: any): Deal => {
  const codeUpper = promo.code.toUpperCase();
  
  if (codeUpper === "MLBB10") {
    return {
      title: t.offers.deal1Title || "MLBB Diamond Boost",
      desc: t.offers.deal1Desc || "Get 10% extra diamonds on Mobile Legends top-ups.",
      code: promo.code,
      discount: "10% Extra",
      badge: t.offers.deal1Badge || "Hot Deal",
      accentFrom: "#ec4899",
      accentTo: "#8b5cf6",
      accentText: "#e879f9",
      glowColor: "rgba(236,72,153,0.06)",
      expiresHours: 47,
      game: "Mobile Legends",
      gameSlug: "games/mobile-legends",
    };
  }
  
  if (codeUpper === "ROBLOXACC") {
    return {
      title: t.offers.deal2Title || "Roblox Accessories Bundle",
      desc: t.offers.deal2Desc || "Receive a free limited-edition accessory pack.",
      code: promo.code,
      discount: "Free Item",
      badge: t.offers.deal2Badge || "Exclusive",
      accentFrom: "#10b981",
      accentTo: "#14b8a6",
      accentText: "#34d399",
      glowColor: "rgba(16,185,129,0.06)",
      expiresHours: 72,
      game: "Roblox",
      gameSlug: "games/roblox",
    };
  }
  
  if (codeUpper === "NEWGAMER") {
    return {
      title: t.offers.deal3Title || "New User Cashback",
      desc: t.offers.deal3Desc || "5% cashback instantly credited on your first top-up.",
      code: promo.code,
      discount: "5% Back",
      badge: t.offers.deal3Badge || "New User",
      accentFrom: "#f59e0b",
      accentTo: "#f97316",
      accentText: "#fbbf24",
      glowColor: "rgba(245,158,11,0.06)",
      expiresHours: 120,
      game: "All Games",
      gameSlug: "games",
    };
  }

  const presets = [
    {
      accentFrom: "#00e5ff",
      accentTo: "#3b82f6",
      accentText: "#00e5ff",
      glowColor: "rgba(0,229,255,0.06)",
      badge: "Special Promo",
    },
    {
      accentFrom: "#ec4899",
      accentTo: "#f43f5e",
      accentText: "#f43f5e",
      glowColor: "rgba(244,63,94,0.06)",
      badge: "Limited Offer",
    },
    {
      accentFrom: "#a855f7",
      accentTo: "#6366f1",
      accentText: "#a855f7",
      glowColor: "rgba(168,85,247,0.06)",
      badge: "Flash Sale",
    },
    {
      accentFrom: "#10b981",
      accentTo: "#06b6d4",
      accentText: "#10b981",
      glowColor: "rgba(16,185,129,0.06)",
      badge: "Store Discount",
    }
  ];

  let hash = 0;
  for (let i = 0; i < codeUpper.length; i++) {
    hash = codeUpper.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % presets.length;
  const design = presets[index];

  const discPercent = Math.round(promo.discount * 100);
  const discountLabel = discPercent > 0 ? `${discPercent}% Off` : "Special Deal";

  const targetGameName = promo.game?.name || "All Games";
  const targetGameSlug = promo.game?.slug ? `games/${promo.game.slug}` : "games";

  return {
    title: promo.game ? `${promo.game.name} Discount` : `Exclusive Store Discount`,
    desc: promo.game 
      ? `Get a special ${discountLabel} discount on ${promo.game.name} packages. Apply the promo code at checkout.` 
      : `Get a special ${discountLabel} discount on your top-up. Apply the promo code at checkout.`,
    code: promo.code,
    discount: discountLabel,
    badge: design.badge,
    accentFrom: design.accentFrom,
    accentTo: design.accentTo,
    accentText: design.accentText,
    glowColor: design.glowColor,
    expiresHours: 48,
    game: targetGameName,
    gameSlug: targetGameSlug,
  };
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OffersPage() {
  const { t } = useLanguage();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
      try {
        const promoCodes = await apiService.getPromos();
        if (promoCodes && promoCodes.length > 0) {
          const mapped = promoCodes.map((p: any) => mapPromoToDeal(p, t));
          setDeals(mapped);
        } else {
          const fallback = [
            { code: "MLBB10", discount: 0.10 },
            { code: "ROBLOXACC", discount: 0.15 },
            { code: "NEWGAMER", discount: 0.05 }
          ].map(p => mapPromoToDeal(p, t));
          setDeals(fallback);
        }
      } catch (err) {
        console.error("Failed to load active promos:", err);
        const fallback = [
          { code: "MLBB10", discount: 0.10 },
          { code: "ROBLOXACC", discount: 0.15 },
          { code: "NEWGAMER", discount: 0.05 }
        ].map(p => mapPromoToDeal(p, t));
        setDeals(fallback);
      } finally {
        setLoading(false);
      }
    }
    loadDeals();
  }, [t]);

  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full py-16 px-4 sm:px-6 lg:px-8 space-y-14">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <motion.div
          className="text-center space-y-4 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-brand-cyan/8 text-brand-cyan border border-brand-cyan/15"
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3" />
            {t.offers.badge}
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t.offers.title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-sky-400">
              {t.offers.titleHighlight}
            </span>
          </h1>

          <p className="text-[13px] text-gray-500 leading-relaxed max-w-sm mx-auto">
            {t.offers.subtitle}
          </p>
        </motion.div>

        {/* ── Deal Cards ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="relative rounded-2xl bg-[#0d1117] border border-white/[0.07] p-6 h-[320px] flex flex-col justify-between animate-pulse"
              >
                <div className="flex justify-between items-start">
                  <div className="h-4 w-20 bg-white/[0.05] rounded" />
                  <div className="h-6 w-16 bg-white/[0.05] rounded-full" />
                </div>
                <div className="flex items-center gap-3.5 mt-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-2/3 bg-white/[0.05] rounded" />
                    <div className="h-3 w-1/3 bg-white/[0.05] rounded" />
                  </div>
                </div>
                <div className="space-y-2 mt-4 flex-1">
                  <div className="h-3 w-full bg-white/[0.05] rounded" />
                  <div className="h-3 w-5/6 bg-white/[0.05] rounded" />
                </div>
                <div className="h-9 w-full bg-white/[0.05] rounded-lg mt-4" />
                <div className="h-10 w-full bg-white/[0.05] rounded-xl mt-3" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {deals.map((deal, idx) => (
              <DealCard key={idx} deal={deal} />
            ))}
          </motion.div>
        )}

        {/* ── Coming Soon Banner ───────────────────────────────────────────── */}
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-[#0d1117] border border-white/[0.07]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Cyan top accent */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent" />

          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,255,0.04)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative px-8 py-10 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 mx-auto">
              <Sparkles className="w-5 h-5 text-brand-cyan" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">{t.offers.comingSoonTitle}</h2>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                {t.offers.comingSoonDesc}
              </p>
            </div>

            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-brand-cyan hover:brightness-110 text-[#080b11] font-extrabold text-sm px-7 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/25"
            >
              <Send className="w-4 h-4" />
              {t.offers.joinTelegram}
            </a>
          </div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}
