"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Star } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
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

export default function LoyaltyPage() {
  const { t } = useLanguage();

  const tiers = [
    { name: t.loyalty.bronzeName, pts: t.loyalty.bronzePts, color: "text-amber-600", border: "border-amber-600/20", desc: t.loyalty.bronzeDesc },
    { name: t.loyalty.silverName, pts: t.loyalty.silverPts, color: "text-gray-400", border: "border-gray-400/20", desc: t.loyalty.silverDesc },
    { name: t.loyalty.goldName, pts: t.loyalty.goldPts, color: "text-yellow-500", border: "border-yellow-500/20", desc: t.loyalty.goldDesc },
    { name: t.loyalty.platinumName, pts: t.loyalty.platinumPts, color: "text-cyan-400", border: "border-cyan-400/20", desc: t.loyalty.platinumDesc },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full py-16 px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          className="text-center space-y-4 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-black text-white tracking-tight">
            {t.loyalty.title} <span className="text-brand-cyan">{t.loyalty.titleHighlight}</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            {t.loyalty.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.22 } }}
              className={`bg-[#111625]/60 border border-[#1d2438] hover:${tier.border} p-6 rounded-2xl flex flex-col justify-between space-y-4 transition duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]`}
            >
              <div className="space-y-2">
                <div className={`text-sm font-black ${tier.color} uppercase tracking-wider`}>{tier.name}</div>
                <div className="text-xs font-bold text-gray-500">{tier.pts}</div>
                <p className="text-xs text-gray-400 leading-relaxed font-medium pt-2">{tier.desc}</p>
              </div>

              <motion.div
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10"
                whileHover={{ scale: 1.15, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Star className="w-3.5 h-3.5 text-brand-cyan" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          className="bg-[#111625]/30 border border-[#1d2438]/50 p-8 rounded-2xl space-y-4"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-cyan" />
            <h2 className="text-lg font-bold text-white">{t.loyalty.howEarnedTitle}</h2>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed font-medium">
            {t.loyalty.howEarnedBody}
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
