"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Gamepad2, UserCheck, CreditCard, Send, ChevronRight, CheckCircle } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="border border-[#1d2438] rounded-xl overflow-hidden"
      initial={false}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-[#111625]/60 hover:bg-[#111625] transition-colors duration-200"
      >
        <span className="text-sm font-bold text-white">{q}</span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4 text-brand-cyan shrink-0" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <div className="px-5 pb-4 pt-2 text-xs text-gray-400 font-medium leading-relaxed border-t border-[#1d2438]">
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
      color: "from-blue-500 to-cyan-400",
      glow: "rgba(6,182,212,0.15)",
    },
    {
      icon: UserCheck,
      step: "02",
      title: t.howToTopUp.step02Title,
      desc: t.howToTopUp.step02Desc,
      tip: t.howToTopUp.step02Tip,
      color: "from-purple-500 to-pink-400",
      glow: "rgba(168,85,247,0.15)",
    },
    {
      icon: CreditCard,
      step: "03",
      title: t.howToTopUp.step03Title,
      desc: t.howToTopUp.step03Desc,
      tip: t.howToTopUp.step03Tip,
      color: "from-rose-500 to-orange-400",
      glow: "rgba(226,26,34,0.15)",
    },
    {
      icon: Send,
      step: "04",
      title: t.howToTopUp.step04Title,
      desc: t.howToTopUp.step04Desc,
      tip: t.howToTopUp.step04Tip,
      color: "from-emerald-500 to-teal-400",
      glow: "rgba(16,185,129,0.15)",
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

      <main className="flex-1 max-w-6xl mx-auto w-full py-16 px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <motion.div
          className="text-center space-y-4 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
          >
            <CheckCircle className="w-3 h-3" />
            {t.howToTopUp.badge}
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {t.howToTopUp.title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-cyan-400">
              {t.howToTopUp.titleHighlight}
            </span>
          </h1>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
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
          {/* Desktop: horizontal connector line */}
          <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#1d2438] to-transparent z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  variants={stepVariants}
                  whileHover={{ y: -8, transition: { duration: 0.22 } }}
                  className="relative bg-[#111625]/70 border border-[#1d2438] hover:border-brand-cyan/25 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 transition-all duration-300 group"
                  style={{
                    boxShadow: `0 0 0 0 ${item.glow}`,
                  }}
                  whileInView={{
                    boxShadow: [`0 0 0 0 ${item.glow}`, `0 0 30px 0 ${item.glow}`, `0 4px 20px 0 rgba(0,0,0,0.3)`],
                  }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  {/* Step number */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className={`inline-block bg-gradient-to-r ${item.color} text-black text-[10px] font-black px-3 py-1 rounded-full tracking-widest shadow-md`}>
                      {t.howToTopUp.step} {item.step}
                    </span>
                  </div>

                  {/* Icon */}
                  <motion.div
                    className={`mt-2 w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} bg-opacity-10 flex items-center justify-center shadow-lg border border-white/10`}
                    style={{ background: "rgba(255,255,255,0.04)" }}
                    whileHover={{ scale: 1.12, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
                  </motion.div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className={`text-base font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                  </div>

                  {/* Tip */}
                  <div className="w-full text-left bg-[#080b11]/60 border border-[#1d2438] rounded-xl px-3 py-2.5 text-[10px] font-semibold text-gray-500 leading-relaxed">
                    💡 {item.tip}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          className="relative overflow-hidden bg-gradient-to-br from-brand-cyan/10 via-[#111625] to-[#111625] border border-brand-cyan/20 rounded-2xl p-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.06)_0%,transparent_65%)]" />
          <div className="relative space-y-5">
            <h2 className="text-2xl font-black text-white">{t.howToTopUp.ctaTitle}</h2>
            <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto">
              {t.howToTopUp.ctaDesc}
            </p>
            <Link href="/games">
              <motion.button
                className="inline-flex items-center gap-2 bg-brand-cyan hover:bg-brand-cyan-hover text-white font-extrabold text-sm px-10 py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_40px_rgba(0,229,255,0.6)] transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">{t.howToTopUp.faqTitle}</h2>
            <p className="text-sm text-gray-400 font-medium">{t.howToTopUp.faqSubtitle}</p>
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
