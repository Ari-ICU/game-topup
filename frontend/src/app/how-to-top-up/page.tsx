"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Gamepad2, UserCheck, CreditCard, Send, ChevronRight, CheckCircle } from "lucide-react";
import { motion, type Variants } from "framer-motion";

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

const steps = [
  {
    icon: Gamepad2,
    step: "01",
    title: "Select Game",
    desc: "Browse our catalog of popular games. Choose the title you want to top up from the games grid.",
    tip: "All available games are listed on the Games page.",
    color: "from-blue-500 to-cyan-400",
    glow: "rgba(6,182,212,0.15)",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Enter Player ID",
    desc: "Input your in-game Player ID and Zone ID (if required). Use the Verify button to confirm your account name before paying.",
    tip: "Find your Player ID inside your game's profile or settings.",
    color: "from-purple-500 to-pink-400",
    glow: "rgba(168,85,247,0.15)",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Scan KHQR",
    desc: "Select your package denomination, then pay securely via KHQR. Open any Cambodian banking app and scan the generated QR code.",
    tip: "Supports ABA Pay, ACLEDA, Wing, and all Bakong-connected apps.",
    color: "from-rose-500 to-orange-400",
    glow: "rgba(226,26,34,0.15)",
  },
  {
    icon: Send,
    step: "04",
    title: "Receive Credits",
    desc: "Our system detects your payment instantly. Game credits are delivered to your account within 15 seconds via our top-up API.",
    tip: "You will receive an on-screen confirmation when complete.",
    color: "from-emerald-500 to-teal-400",
    glow: "rgba(16,185,129,0.15)",
  },
];

const faqs = [
  {
    q: "How fast is the delivery?",
    a: "Typically under 15 seconds after payment confirmation. Complex orders may take up to 3 minutes.",
  },
  {
    q: "Which payment methods are supported?",
    a: "We support all Bakong KHQR-connected apps including ABA Pay, ACLEDA, Cambodian Public Bank, Wing, and more.",
  },
  {
    q: "What if my top-up fails?",
    a: "Reach our Telegram support bot immediately with your Order ID. We guarantee a full refund or retry within 24 hours.",
  },
  {
    q: "Do I need an account to top up?",
    a: "No! You only need your in-game Player ID. No registration or login is required on our platform.",
  },
];

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
            Instant Delivery Guaranteed
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            How to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-cyan-400">
              Top Up
            </span>
          </h1>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            Top up your account in under a minute. No registration needed — just your Player ID and a KHQR payment.
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
                      STEP {item.step}
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
            <h2 className="text-2xl font-black text-white">Ready to Top Up?</h2>
            <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto">
              Browse our game catalog and get your credits delivered instantly.
            </p>
            <Link href="/games">
              <motion.button
                className="inline-flex items-center gap-2 bg-brand-cyan hover:bg-brand-cyan-hover text-white font-extrabold text-sm px-10 py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_40px_rgba(0,229,255,0.6)] transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Gamepad2 className="w-4 h-4" />
                Browse Games
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
            <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-400 font-medium">Quick answers to common questions about our service.</p>
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
