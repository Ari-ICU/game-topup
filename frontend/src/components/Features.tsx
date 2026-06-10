"use client";

import React from "react";
import { Zap, ShieldCheck, Headphones, Star } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

const features = [
  {
    icon: Zap,
    title: "Instant Delivery",
    desc: "Game credits land in your account within seconds of payment — no waiting, no delays.",
    stat: "< 15s",
    statLabel: "avg. delivery",
    gradient: "from-brand-cyan to-cyan-500",
    glow: "rgba(0,229,255,0.12)",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "Bank-grade encryption and Bakong KHQR ensure your payment details stay completely private.",
    stat: "100%",
    statLabel: "encrypted",
    gradient: "from-emerald-400 to-teal-500",
    glow: "rgba(16,185,129,0.12)",
  },
  {
    icon: Headphones,
    title: "24/7 Local Support",
    desc: "Our Khmer and English-speaking team is available around the clock via Telegram live chat.",
    stat: "24/7",
    statLabel: "support",
    gradient: "from-purple-400 to-pink-500",
    glow: "rgba(168,85,247,0.12)",
  },
];

export default function Features() {
  return (
    <section className="py-20 px-4 bg-[#090d18]/80 border-y border-[#1d2438]/60 relative overflow-hidden">
      {/* Subtle radial bg glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 mb-4">
            <Star className="w-3 h-3" />
            Why Choose Us
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Built for Gamers in Cambodia
          </h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">
            Fast, safe, and always available — every time you need to top up.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.22 } }}
                className="flex flex-col items-center text-center p-8 bg-[#111625]/50 border border-[#1d2438] hover:border-brand-cyan/20 rounded-2xl transition-all duration-300 relative group"
                style={{
                  boxShadow: `0 0 0 0 ${item.glow}`,
                }}
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${item.glow} 0%, transparent 70%)` }}
                />

                {/* Stat badge */}
                <div className="absolute top-5 right-5 text-right">
                  <div className={`text-lg font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                    {item.stat}
                  </div>
                  <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">{item.statLabel}</div>
                </div>

                {/* Icon */}
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} bg-opacity-10 flex items-center justify-center mb-6 shadow-lg`}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  whileHover={{ scale: 1.12, rotate: 6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
                </motion.div>

                <h3 className={`text-lg font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-3`}>
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xs">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
