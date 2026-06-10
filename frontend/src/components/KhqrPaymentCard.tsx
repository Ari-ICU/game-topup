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
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(qrCode)}`;
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const mobileKeywords = ["android", "webos", "iphone", "ipad", "ipod", "blackberry", "iemobile", "opera mini"];
    const isMobileUA = mobileKeywords.some(keyword => ua.includes(keyword)) || window.innerWidth < 768;
    setIsMobile(isMobileUA);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-full max-w-xs mx-auto"
    >
      {/* Main Card Container */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#140f10] to-[#100a0b] border border-[#2a1a1a] rounded-3xl shadow-[0_30px_60px_rgba(226,26,34,0.25)] hover:shadow-[0_40px_80px_rgba(226,26,34,0.3)] transition-shadow duration-300">
        
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#e21a22] via-[#f5c842] to-[#e21a22] opacity-90" />

        {/* Header: KHQR pill + Live dot */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="relative bg-gradient-to-r from-[#e21a22] to-[#e5a93b] px-3 py-1 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10"/>
              <span className="relative text-[10px] font-black text-white tracking-widest">KHQR</span>
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Bakong
            </span>
          </div>

          {/* Live pulse indicator */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[9px] font-black text-green-400 uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Amount Section */}
        <div className="px-5 pt-5 pb-3 text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Amount Due
          </p>
          <p className="text-4xl font-black text-white tracking-tight bg-clip-text bg-gradient-to-br from-white to-gray-300 text-transparent">
            {amount}
          </p>
          {packageName && (
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block mt-2 px-3 py-1 text-[10px] font-bold text-cyan-200 bg-cyan-900/30 border border-cyan-800 rounded-full uppercase tracking-wider shadow-md"
            >
              {packageName}
            </motion.span>
          )}
        </div>

        {/* QR Code Section */}
        <div className="px-6 py-4 flex justify-center">
          <motion.div 
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ 
              repeat: Infinity,
              repeatType: "reverse",
              duration: 3
            }}
            className="relative"
          >
            {/* Glow ring */}
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#e21a22] to-[#e5a93b] opacity-20 blur-md group-hover:opacity-30 transition-opacity duration-300" />
            <div className="relative bg-white p-3 rounded-2xl shadow-xl border border-white/20">
              <div className="absolute inset-0 rounded-xl bg-[url('/images/noise.png')] opacity-10"/>
              <Image
                src={qrSrc}
                alt="Bakong KHQR Code"
                width={200}
                height={200}
                className="object-contain rounded-lg"
                unoptimized
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* Expiration Countdown Badge */}
        {countdown !== undefined && (
          <div className="flex justify-center pb-2.5">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-300 ${
              countdown < 60
                ? "bg-red-500/10 border-red-500/35 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                : "bg-white/[0.03] border-white/[0.08] text-gray-400"
            }`}>
              <svg className={`w-3.5 h-3.5 ${countdown < 60 ? "animate-pulse text-red-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Expires in: </span>
              <span className="font-mono font-black tracking-wider text-xs">
                {Math.floor(countdown / 60).toString().padStart(2, '0')}:
                {(countdown % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        {/* Mobile Banking Deep Links */}
        {isMobile && (
          <div className="px-5 pb-4 space-y-2 text-center border-b border-white/5 pt-1">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t.checkout.deepLinkLabel}</p>
            <div className="grid grid-cols-2 gap-2">
              <motion.a
                href={`abapay://pay?qr=${encodeURIComponent(qrCode)}`}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-[#005a9c] hover:brightness-110 text-white font-bold text-[9px] py-2 px-1 rounded-xl shadow-md cursor-pointer transition-all"
                whileTap={{ scale: 0.96 }}
              >
                {t.checkout.openAbaPay}
              </motion.a>
              <motion.a
                href={`bakong://pay?qr=${encodeURIComponent(qrCode)}`}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-[#e21a22] hover:brightness-110 text-white font-bold text-[9px] py-2 px-1 rounded-xl shadow-md cursor-pointer transition-all"
                whileTap={{ scale: 0.96 }}
              >
                {t.checkout.openBakong}
              </motion.a>
            </div>
          </div>
        )}

        {/* Instructions + Bank row */}
        <div className="px-5 pb-6 text-center space-y-3 pt-2">
          <p className="text-xs text-gray-400 font-medium leading-relaxed">
            Open your banking app and{" "}
            <span className="text-white/90 font-semibold">scan this QR code</span> <br/> 
            to complete payment
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {SUPPORTED_BANKS.map((bank) => (
              <motion.div
                key={bank}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs font-bold text-gray-400 bg-white/[0.03] border border-white/[0.1] px-2.5 py-1 rounded-lg shadow-sm"
              >
                {bank}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#e21a22]/40 to-transparent" />
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl border border-transparent shadow-[inset_0_0_20px_rgba(226,26,34,0.12)]"/>
      </div>
    </motion.div>
  );
}
