"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, type Variants } from "framer-motion";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

const sections = [
  {
    title: "1. Agreement to Terms",
    body: "By accessing and placing top-up orders through GAMEX CAMBODIA, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.",
  },
  {
    title: "2. Account Responsibility",
    body: "It is your sole responsibility to provide the correct Player ID and Server ID details. GAMEX CAMBODIA is not liable for transactions made to incorrect accounts provided by the user.",
  },
  {
    title: "3. Refund and Cancellation",
    body: "Due to the nature of digital goods and instant programmatic deliveries, all top-up transactions are final. No refunds or cancellations will be issued once a transaction is processed.",
  },
];

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full py-16 px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
            Terms of <span className="text-brand-cyan">Service</span>
          </h1>
          <p className="text-xs text-gray-500 font-bold">Last updated: June 09, 2026</p>
        </motion.div>

        <motion.div
          className="bg-[#111625]/30 border border-[#1d2438]/50 p-8 rounded-2xl space-y-6 text-sm text-gray-400 font-medium leading-relaxed"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sections.map((sec, idx) => (
            <motion.section
              key={idx}
              variants={sectionVariants}
              className="space-y-2 border-b border-[#1d2438]/40 pb-6 last:border-0 last:pb-0"
            >
              <h2 className="text-base font-bold text-white uppercase tracking-wider">{sec.title}</h2>
              <p>{sec.body}</p>
            </motion.section>
          ))}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
