"use client";

import React from "react";
import { motion } from "framer-motion";

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

const banks = [
  { name: "ABA Bank", abbr: "ABA", color: "#e5a93b", bg: "rgba(229,169,59,0.1)", border: "rgba(229,169,59,0.2)" },
  { name: "ACLEDA", abbr: "ACL", color: "#00b2ff", bg: "rgba(0,178,255,0.1)", border: "rgba(0,178,255,0.2)" },
  { name: "Wing Bank", abbr: "WING", color: "#e21a22", bg: "rgba(226,26,34,0.1)", border: "rgba(226,26,34,0.2)" },
  { name: "Cambodian Public Bank", abbr: "CPB", color: "#9c59d1", bg: "rgba(156,89,209,0.1)", border: "rgba(156,89,209,0.2)" },
];

export default function PaymentMethods() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-black text-white tracking-tight">
          Trusted Payment Methods
        </h2>
        <p className="text-sm text-gray-400 mt-2 font-medium">
          Pay securely with your preferred Cambodian banking app via Bakong KHQR
        </p>
      </motion.div>

      {/* KHQR hero card */}
      <motion.div
        className="max-w-lg mx-auto mb-10"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a0e0e] via-[#120f14] to-[#0a0f1b] border border-[#e21a22]/20 rounded-2xl p-6 flex items-center gap-5 shadow-[0_10px_40px_rgba(226,26,34,0.12)]">
          {/* Accent bar */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#e21a22] via-[#f5c842] to-[#e21a22]" />

          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 250 }}
            className="shrink-0"
          >
            <KhqrLogo className="w-14 h-14" />
          </motion.div>

          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-black text-white">Bakong KHQR</span>
              <span className="text-[9px] font-black bg-green-500/15 text-green-400 border border-green-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Supported
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              The official National Bank of Cambodia QR payment network. Compatible with all major Cambodian banking apps.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Supported banks grid */}
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {banks.map((bank, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4, scale: 1.04, transition: { duration: 0.18 } }}
            className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border transition-all duration-200 cursor-default"
            style={{
              background: bank.bg,
              borderColor: bank.border,
            }}
          >
            <span
              className="text-sm font-black tracking-wider"
              style={{ color: bank.color }}
            >
              {bank.abbr}
            </span>
            <span className="text-[9px] text-gray-500 font-semibold text-center leading-tight">
              {bank.name}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* NBC badge */}
      <motion.p
        className="text-center text-[11px] text-gray-600 font-medium mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        🏦 Bakong KHQR is regulated by the National Bank of Cambodia (NBC)
      </motion.p>
    </section>
  );
}
