"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { Users, Zap, ShieldCheck, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function StatsBar() {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, value: "50,000+", label: t.stats.gamersServed, color: "text-brand-cyan" },
    { icon: Zap, value: "< 15s", label: t.stats.avgDelivery, color: "text-emerald-400" },
    { icon: ShieldCheck, value: "100%", label: t.stats.securePayments, color: "text-purple-400" },
    { icon: Star, value: "4.9/5", label: t.stats.customerRating, color: "text-amber-400" },
  ];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 border-y border-[#1d2438]/60 bg-[#090c15]/60 backdrop-blur-sm">
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="flex items-center gap-3 min-w-0"
            >
              <div className={`w-10 h-10 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-gray-500 font-semibold leading-tight break-words">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
