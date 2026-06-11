"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Gamepad2, UserCheck, CreditCard, Send, ChevronDown, CheckCircle, Lightbulb } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="border border-white/[0.07] rounded-xl overflow-hidden bg-[#0d1117]"
      initial={false}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors duration-200"
      >
        <span className="text-sm font-bold text-white">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-brand-cyan shrink-0" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <div className="px-5 pb-4 pt-2 text-[12px] text-gray-400 font-medium leading-relaxed border-t border-white/[0.07]">
          {a}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HowToTopUpPage() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Gamepad2,
      step: "01",
      title: t.howToTopUp.step01Title,
      desc: t.howToTopUp.step01Desc,
      tip: t.howToTopUp.step01Tip,
      accentColor: "#00e5ff",
      glowColor: "rgba(0,229,255,0.06)",
    },
    {
      icon: UserCheck,
      step: "02",
      title: t.howToTopUp.step02Title,
      desc: t.howToTopUp.step02Desc,
      tip: t.howToTopUp.step02Tip,
      accentColor: "#a855f7",
      glowColor: "rgba(168,85,247,0.06)",
    },
    {
      icon: CreditCard,
      step: "03",
      title: t.howToTopUp.step03Title,
      desc: t.howToTopUp.step03Desc,
      tip: t.howToTopUp.step03Tip,
      accentColor: "#f43f5e",
      glowColor: "rgba(244,63,94,0.06)",
    },
    {
      icon: Send,
      step: "04",
      title: t.howToTopUp.step04Title,
      desc: t.howToTopUp.step04Desc,
      tip: t.howToTopUp.step04Tip,
      accentColor: "#10b981",
      glowColor: "rgba(16,185,129,0.06)",
    },
  ];

  const faqs = [
    {
      q: t.howToTopUp.faq1q,
      a: t.howToTopUp.faq1a,
    },
    {
      q: t.howToTopUp.faq2q,
      a: t.howToTopUp.faq2a,
    },
    {
      q: t.howToTopUp.faq3q,
      a: t.howToTopUp.faq3a,
    },
    {
      q: t.howToTopUp.faq4q,
      a: t.howToTopUp.faq4a,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full py-16 px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
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
            <CheckCircle className="w-3 h-3" />
            {t.howToTopUp.badge}
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t.howToTopUp.title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-sky-400">
              {t.howToTopUp.titleHighlight}
            </span>
          </h1>
          <p className="text-[13px] text-gray-500 leading-relaxed max-w-md mx-auto">
            {t.howToTopUp.subtitle}
          </p>
        </motion.div>

        {/* Step Cards */}
        <motion.div
          className="relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Desktop: horizontal connector line passing through badges */}
          <div className="hidden lg:block absolute top-[16px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center w-full">
                  {/* Step number badge (inline above the card) */}
                  <div className="mb-3.5 z-10">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm"
                      style={{
                        color: item.accentColor,
                        borderColor: `${item.accentColor}25`,
                        backgroundColor: `${item.accentColor}10`,
                      }}
                    >
                      {t.howToTopUp.step} {item.step}
                    </span>
                  </div>

                  {/* Card */}
                  <motion.div
                    variants={stepVariants}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="relative bg-[#0d1117] border border-white/[0.07] hover:border-white/[0.13] rounded-2xl p-6 flex flex-col items-center text-center space-y-5 transition-all duration-300 group w-full flex-1"
                  >
                    {/* Hover radial glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                      style={{
                        background: `radial-gradient(circle at center, ${item.accentColor}08 0%, transparent 70%)`,
                      }}
                    />

                    {/* Icon container */}
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm"
                      style={{
                        backgroundColor: `${item.accentColor}10`,
                        borderColor: `${item.accentColor}25`,
                      }}
                      whileHover={{ scale: 1.1, rotate: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.accentColor }} strokeWidth={2} />
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-2 flex-1">
                      <h3 className="text-[14px] font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>

                    {/* Tip box */}
                    <div className="w-full text-left bg-white/[0.01] border border-white/[0.04] rounded-xl px-3.5 py-3 text-[10px] text-gray-500 leading-relaxed flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-500/80 shrink-0 mt-0.5" />
                      <span className="font-medium">{item.tip}</span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-[#0d1117] border border-white/[0.07]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Cyan top stripe */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent" />

          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,255,0.04)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative px-8 py-10 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 mx-auto">
              <Gamepad2 className="w-5 h-5 text-brand-cyan" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">{t.howToTopUp.ctaTitle}</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                {t.howToTopUp.ctaDesc}
              </p>
            </div>

            <Link href="/games" className="inline-block">
              <motion.button
                className="inline-flex items-center gap-2.5 bg-brand-cyan hover:brightness-110 text-[#080b11] font-extrabold text-sm px-7 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/25 cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Gamepad2 className="w-4 h-4" />
                {t.howToTopUp.ctaBrowse}
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">{t.howToTopUp.faqTitle}</h2>
            <p className="text-sm text-gray-500">{t.howToTopUp.faqSubtitle}</p>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
