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
    title: "1. Information Collection",
    body: "We collect information necessary to process your gaming top-ups. This includes your game Player ID, email address (optional for receipts), and transaction identifiers. We do not store full payment bank details directly on our servers.",
  },
  {
    title: "2. Information Security",
    body: "We implement industry-standard encryption protocols (SSL/TLS) to secure all communications and transaction requests. Your data is protected against unauthorized access and leaks.",
  },
  {
    title: "3. Third Party Integrations",
    body: "To fulfill top-up API queries and secure banking handshakes, we securely share order-related parameters with licensed payment channels (such as ABA Pay gateway) and official game publishers.",
  },
];

export default function PrivacyPage() {
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
            Privacy <span className="text-brand-cyan">Policy</span>
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
