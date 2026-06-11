"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Tag, Sparkles, Copy, Check, Zap, Clock, ArrowRight } from "lucide-react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

interface Deal {
  title: string;
  desc: string;
  code: string;
  discount: string;
  badge: string;
  badgeColor: string;
  expiresHours: number;
  game: string;
  gameSlug: string;
  gradient: string;
}

function CountdownTimer({ hours }: { hours: number }) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(() => {
    const totalSeconds = hours * 3600;
    return {
      h: Math.floor(totalSeconds / 3600),
      m: Math.floor((totalSeconds % 3600) / 60),
      s: totalSeconds % 60,
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds = prev.h * 3600 + prev.m * 60 + prev.s - 1;
        if (totalSeconds <= 0) return { h: 0, m: 0, s: 0 };
        return {
          h: Math.floor(totalSeconds / 3600),
          m: Math.floor((totalSeconds % 3600) / 60),
          s: totalSeconds % 60,
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 text-xs font-black text-white">
      <Clock className="w-3 h-3 text-brand-cyan shrink-0" />
      <span className="text-gray-400 font-medium">{t.offers.expiresIn}</span>
      <span className="font-black text-brand-cyan tabular-nums">{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}</span>
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 bg-[#080b11] border border-[#1d2438] hover:border-brand-cyan/40 px-4 py-2.5 rounded-xl transition-all duration-200 group w-full"
    >
      <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-300">{t.offers.codeLabel}</span>
      <span className="text-sm font-black text-brand-cyan uppercase flex-1 tracking-widest">{code}</span>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="shrink-0 text-green-400"
          >
            <Check className="w-3.5 h-3.5 stroke-[3px]" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="shrink-0 text-gray-500 group-hover:text-brand-cyan transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function OffersPage() {
  const { t } = useLanguage();

  const deals: Deal[] = [
    {
      title: t.offers.deal1Title,
      desc: t.offers.deal1Desc,
      code: "MLBB10",
      discount: "10% Extra",
      badge: t.offers.deal1Badge,
      badgeColor: "from-pink-500 to-purple-600",
      expiresHours: 47,
      game: "Mobile Legends",
      gameSlug: "mobile-legends",
      gradient: "from-blue-600/10 via-purple-600/5 to-transparent",
    },
    {
      title: t.offers.deal2Title,
      desc: t.offers.deal2Desc,
      code: "ROBLOXACC",
      discount: "Free Item",
      badge: t.offers.deal2Badge,
      badgeColor: "from-emerald-400 to-teal-500",
      expiresHours: 72,
      game: "Roblox",
      gameSlug: "roblox",
      gradient: "from-emerald-600/10 via-teal-600/5 to-transparent",
    },
    {
      title: t.offers.deal3Title,
      desc: t.offers.deal3Desc,
      code: "NEWGAMER",
      discount: "5% Back",
      badge: t.offers.deal3Badge,
      badgeColor: "from-amber-400 to-orange-500",
      expiresHours: 120,
      game: "All Games",
      gameSlug: "games",
      gradient: "from-amber-600/10 via-orange-600/5 to-transparent",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full py-16 px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <motion.div
          className="text-center space-y-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3" />
            {t.offers.badge}
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {t.offers.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-cyan-400">{t.offers.titleHighlight}</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            {t.offers.subtitle}
          </p>
        </motion.div>

        {/* Deal Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {deals.map((deal, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.22 } }}
              className={`relative bg-gradient-to-br ${deal.gradient} bg-[#111625] border border-[#1d2438] hover:border-brand-cyan/30 rounded-2xl overflow-hidden flex flex-col transition duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]`}
            >
              {/* Accent top bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${deal.badgeColor}`} />

              <div className="p-6 flex flex-col flex-1 space-y-5">
                {/* Badge + Discount */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${deal.badgeColor} bg-clip-text text-transparent`}>
                    {deal.badge}
                  </span>
                  <span className={`text-lg font-black bg-gradient-to-r ${deal.badgeColor} bg-clip-text text-transparent`}>
                    {deal.discount}
                  </span>
                </div>

                {/* Icon + Title */}
                <div className="flex items-start gap-4">
                  <motion.div
                    className="w-11 h-11 rounded-xl bg-brand-cyan/10 flex items-center justify-center border border-brand-cyan/20 shrink-0"
                    whileHover={{ scale: 1.12, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Tag className="w-5 h-5 text-brand-cyan" />
                  </motion.div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{deal.title}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{deal.game}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 font-medium leading-relaxed flex-1">{deal.desc}</p>

                {/* Countdown */}
                <CountdownTimer hours={deal.expiresHours} />

                {/* Copy Code */}
                <CopyButton code={deal.code} />

                {/* CTA */}
                <Link href={`/${deal.gameSlug}`} className="w-full">
                  <motion.div
                    className="flex items-center justify-center gap-2 bg-brand-cyan/10 hover:bg-brand-cyan hover:text-black border border-brand-cyan/20 hover:border-brand-cyan text-brand-cyan font-bold text-xs py-3 rounded-xl transition-all duration-200 cursor-pointer"
                    whileTap={{ scale: 0.97 }}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {t.offers.useOffer}
                    <ArrowRight className="w-3 h-3" />
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Banner */}
        <motion.div
          className="relative overflow-hidden bg-gradient-to-br from-brand-cyan/10 via-[#111625] to-[#111625] border border-brand-cyan/20 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.05)_0%,transparent_70%)]" />
          <div className="relative space-y-4">
            <h2 className="text-2xl font-black text-white">{t.offers.comingSoonTitle}</h2>
            <p className="text-sm text-gray-400 font-medium max-w-md mx-auto">
              {t.offers.comingSoonDesc}
            </p>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-cyan hover:bg-brand-cyan-hover text-white font-extrabold text-sm px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              {t.offers.joinTelegram}
            </a>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
