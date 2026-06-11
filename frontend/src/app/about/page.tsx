"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Award, Shield } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
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

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

export default function AboutPage() {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, value: "100K+", label: t.about.happyGamers },
    { icon: Award, value: "15s", label: t.about.avgDeliveryTime },
    { icon: Shield, value: "99.9%", label: t.about.transactionSecurity },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full py-16 px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Banner */}
        <motion.div
          className="text-center space-y-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-black text-white tracking-tight sm:text-5xl">
            {t.about.title} <span className="text-brand-cyan">{t.about.brand}</span>
          </h1>
          <p className="text-base text-gray-400 font-medium leading-relaxed">
            {t.about.subtitle}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="bg-[#111625]/60 border border-[#1d2438] hover:border-brand-cyan/20 p-8 rounded-2xl text-center space-y-2 transition duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <motion.div
                  className="mx-auto w-10 h-10 rounded-full bg-brand-cyan/10 flex items-center justify-center border border-brand-cyan/20"
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-5 h-5 text-brand-cyan" />
                </motion.div>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Details Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeUpVariants}
            className="bg-[#111625]/30 border border-[#1d2438]/50 p-8 rounded-2xl space-y-4 transition duration-300"
          >
            <h2 className="text-xl font-bold text-white">{t.about.whoWeAre}</h2>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              {t.about.whoWeAreBody}
            </p>
          </motion.div>
          <motion.div
            variants={fadeUpVariants}
            className="bg-[#111625]/30 border border-[#1d2438]/50 p-8 rounded-2xl space-y-4 transition duration-300"
          >
            <h2 className="text-xl font-bold text-white">{t.about.ourMission}</h2>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              {t.about.ourMissionBody}
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
