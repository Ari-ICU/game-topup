"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

interface KhqrPaymentCardProps {
  /** The EMVCo QR string from Bakong */
  qrCode: string;
  /** Display amount, e.g. "$1.50" */
  amount: string;
  /** Package label shown below the amount, e.g. "86 Diamonds" */
  packageName?: string;
  /** Expiration countdown in seconds */
  countdown?: number;
}

const SUPPORTED_BANKS = ["ABA", "ACLEDA", "Wing", "Bakong"];

export default function KhqrPaymentCard({
  qrCode,
  amount,
  packageName,
  countdown,
}: KhqrPaymentCardProps) {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(qrCode)}`;
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const mobileKeywords = ["android", "webos", "iphone", "ipad", "ipod", "blackberry", "iemobile", "opera mini"];
    const isMobileUA = mobileKeywords.some((k) => ua.includes(k)) || window.innerWidth < 768;
    setIsMobile(isMobileUA);
  }, []);

  // Countdown derived state
  const isUrgent = countdown !== undefined && countdown < 60;
  const mins = countdown !== undefined ? Math.floor(countdown / 60).toString().padStart(2, "0") : "00";
  const secs = countdown !== undefined ? (countdown % 60).toString().padStart(2, "0") : "00";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-full max-w-[340px] mx-auto"
    >
      {/* ── Card Shell ──────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0d1117] border border-white/[0.07] shadow-2xl shadow-black/60">

        {/* Top gradient accent */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#e21a22] via-[#f0b429] to-[#e21a22]" />

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
          {/* KHQR badge */}
          <div className="flex items-center gap-2.5">
            <div className="px-2.5 py-1 bg-gradient-to-r from-[#e21a22] to-[#d4880f] rounded-md">
              <span className="text-[10px] font-black text-white tracking-[0.2em]">KHQR</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-500 tracking-wider">BAKONG</span>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Live</span>
          </div>
        </div>

        {/* ── Amount ──────────────────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 text-center">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.18em] mb-2">
            Amount Due
          </p>
          <p className="text-[2.6rem] font-black text-white tracking-tight leading-none">
            {amount}
          </p>
          {packageName && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-3"
            >
              <span className="inline-block px-3 py-1 text-[10px] font-bold text-sky-300 bg-sky-500/10 border border-sky-500/20 rounded-full uppercase tracking-wider">
                {packageName}
              </span>
            </motion.div>
          )}
        </div>

        {/* ── QR Code ─────────────────────────────────────────────────────── */}
        <div className="px-6 pb-4 flex justify-center">
          <div className="relative">
            {/* Soft glow halo */}
            <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-[#e21a22]/20 to-[#f0b429]/10 blur-xl opacity-60" />

            {/* White QR frame */}
            <div className="relative bg-white p-3.5 rounded-xl shadow-lg">
              {/* Corner decorators */}
              {[
                "top-0 left-0 rounded-tl-lg border-t-2 border-l-2",
                "top-0 right-0 rounded-tr-lg border-t-2 border-r-2",
                "bottom-0 left-0 rounded-bl-lg border-b-2 border-l-2",
                "bottom-0 right-0 rounded-br-lg border-b-2 border-r-2",
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`absolute w-5 h-5 border-[#e21a22] ${cls}`}
                  style={{ margin: -1 }}
                />
              ))}

              <Image
                src={qrSrc}
                alt="Bakong KHQR Code"
                width={200}
                height={200}
                className="object-contain rounded-lg block"
                unoptimized
                priority
              />
            </div>
          </div>
        </div>

        {/* ── Countdown ───────────────────────────────────────────────────── */}
        {countdown !== undefined && (
          <div className="flex justify-center pb-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
                isUrgent
                  ? "bg-red-500/10 border-red-500/25 text-red-400"
                  : "bg-white/[0.03] border-white/[0.06] text-gray-500"
              }`}
            >
              {/* Clock icon */}
              <svg
                className={`w-3.5 h-3.5 shrink-0 ${isUrgent ? "animate-pulse" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-500 text-[11px]">Expires in:</span>
              <span className={`font-mono font-black tracking-widest ${isUrgent ? "text-red-400" : "text-gray-300"}`}>
                {mins}:{secs}
              </span>
            </div>
          </div>
        )}

        {/* ── Mobile deep links ────────────────────────────────────────────── */}
        {isMobile && (
          <div className="mx-5 mb-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2.5">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center">
              {t.checkout.deepLinkLabel}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <motion.a
                href={`abapay://pay?qr=${encodeURIComponent(qrCode)}`}
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-center py-2 px-2 bg-[#005a9c] hover:brightness-110 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer"
              >
                {t.checkout.openAbaPay}
              </motion.a>
              <motion.a
                href={`bakong://pay?qr=${encodeURIComponent(qrCode)}`}
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-center py-2 px-2 bg-[#c0171e] hover:brightness-110 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer"
              >
                {t.checkout.openBakong}
              </motion.a>
            </div>
          </div>
        )}

        {/* ── Instructions ─────────────────────────────────────────────────── */}
        <div className="px-5 pb-5 text-center space-y-3 border-t border-white/[0.04] pt-3.5">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Open your banking app and{" "}
            <span className="text-gray-300 font-semibold">scan this QR code</span>
            <br />
            to complete payment
          </p>

          {/* Bank pills */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {SUPPORTED_BANKS.map((bank) => (
              <motion.span
                key={bank}
                whileHover={{ scale: 1.05 }}
                className="text-[10px] font-semibold text-gray-500 bg-white/[0.04] border border-white/[0.07] px-2.5 py-0.5 rounded-md cursor-default"
              >
                {bank}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#e21a22]/30 to-transparent" />
      </div>
    </motion.div>
  );
}
