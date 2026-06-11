"use client";

import React from "react";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck } from "lucide-react";

// ── KHQR Logo SVG ─────────────────────────────────────────────────────────────
const KhqrLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#e21a22" />
    <path
      d="M50 20 C55 35 65 35 70 35 C65 40 65 50 65 50 C65 50 65 60 70 65 C65 65 55 65 50 80 C45 65 35 65 30 65 C35 60 35 50 35 50 C35 50 35 40 30 35 C35 35 45 35 50 20 Z"
      fill="white"
    />
    <circle cx="50" cy="50" r="10" fill="#e21a22" />
    <circle cx="50" cy="50" r="4" fill="white" />
  </svg>
);

// ── Bank data ─────────────────────────────────────────────────────────────────
const BANKS = [
  { name: "ABA Bank",              abbr: "ABA",  color: "#e5a93b", bg: "rgba(229,169,59,0.08)",  border: "rgba(229,169,59,0.18)"  },
  { name: "ACLEDA",                abbr: "ACL",  color: "#00b2ff", bg: "rgba(0,178,255,0.08)",   border: "rgba(0,178,255,0.18)"   },
  { name: "Wing Bank",             abbr: "WING", color: "#e21a22", bg: "rgba(226,26,34,0.08)",   border: "rgba(226,26,34,0.18)"   },
  { name: "Public Bank",           abbr: "CPB",  color: "#a855f7", bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.18)"  },
  { name: "Canadia Bank",          abbr: "CAN",  color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.18)"   },
  { name: "Maybank",               abbr: "MAY",  color: "#facc15", bg: "rgba(250,204,21,0.08)",  border: "rgba(250,204,21,0.18)"  },
  { name: "AMK MFI",               abbr: "AMK",  color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.18)"  },
];

// ── Animations ────────────────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function PaymentMethods() {
  const { t } = useLanguage();
  const pm = t.paymentMethods;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* ── Section Header ─────────────────────────────────────────────────── */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e21a22]/10 border border-[#e21a22]/20 mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-[#e21a22]" />
          <span className="text-[11px] font-bold text-[#e21a22] uppercase tracking-widest">
            Trusted Payments
          </span>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight">
          {pm.title}
        </h2>
        <p className="text-sm text-gray-500 mt-2.5 max-w-sm mx-auto leading-relaxed">
          {pm.subtitle}
        </p>
      </motion.div>

      {/* ── KHQR Hero Card ─────────────────────────────────────────────────── */}
      <motion.div
        className="max-w-xl mx-auto mb-8"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-[#e21a22]/15 bg-[#0d1117]">
          {/* Red top stripe */}
          <div className="h-[2px] w-full bg-gradient-to-r from-[#e21a22] via-[#f0b429] to-[#e21a22]" />

          <div className="flex items-center gap-5 p-6">
            {/* Logo */}
            <motion.div
              whileHover={{ rotate: 6, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="shrink-0"
            >
              <KhqrLogo className="w-14 h-14 drop-shadow-lg" />
            </motion.div>

            {/* Text */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-base font-black text-white">{pm.khqrName}</span>
                <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {pm.khqrBadge}
                </span>
              </div>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                {pm.khqrDesc}
              </p>
            </div>

            {/* Visual decoration — subtle scan lines */}
            <div className="shrink-0 hidden md:flex flex-col gap-[3px] opacity-20 select-none">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[2px] bg-[#e21a22] rounded-full"
                  style={{ width: `${20 + (i % 3) * 8}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Supported Banks Grid ───────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {BANKS.map((bank, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.05, transition: { duration: 0.15 } }}
            className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-1.5 rounded-xl border cursor-default transition-all"
            style={{ background: bank.bg, borderColor: bank.border }}
          >
            <span
              className="text-[11px] font-black tracking-wider"
              style={{ color: bank.color }}
            >
              {bank.abbr}
            </span>
            <span className="text-[8px] text-gray-600 font-semibold text-center leading-snug">
              {bank.name}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── NBC Note ───────────────────────────────────────────────────────── */}
      <motion.div
        className="flex items-center justify-center gap-2 mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <div className="h-px w-12 bg-white/[0.06]" />
        <p className="text-[11px] text-gray-600 font-medium text-center">
          {pm.nbcNote}
        </p>
        <div className="h-px w-12 bg-white/[0.06]" />
      </motion.div>

    </section>
  );
}
