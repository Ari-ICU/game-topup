"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageSquare, Send, Mail, HelpCircle } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
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

const faqVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

export default function SupportPage() {
  const contacts = [
    {
      icon: Send,
      title: "Telegram Support",
      detail: "@GamexCambodia_Bot",
      action: "Chat on Telegram",
      link: "https://t.me",
    },
    {
      icon: MessageSquare,
      title: "Live Chat Support",
      detail: "Available on our site 24/7",
      action: "Start Live Chat",
      link: "#",
    },
    {
      icon: Mail,
      title: "Email Assistance",
      detail: "support@gamexcambodia.com",
      action: "Send an Email",
      link: "mailto:support@gamexcambodia.com",
    },
  ];

  const faqs = [
    {
      q: "How long does it take for the diamonds/credits to arrive?",
      a: "Thanks to our direct API integrations, most top-ups are processed instantly and credited to your game account within 10 to 30 seconds of completing payment.",
    },
    {
      q: "What local payment methods can I use?",
      a: "We accept ABA Pay, Wing Bank, ACLEDA ToanChet, and Chip Mong Pay. All payments use official secure gateways.",
    },
    {
      q: "I entered the wrong Player ID. What should I do?",
      a: "If you entered an incorrect ID, please message our 24/7 Telegram Support immediately with your transaction reference. If the order has not been filled, we will help correct it.",
    },
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
            Support <span className="text-brand-cyan">Center</span>
          </h1>
          <p className="text-base text-gray-400 font-medium leading-relaxed">
            Have questions, billing issues, or technical problems? Our local team is here to assist you 24/7.
          </p>
        </motion.div>

        {/* Contact Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {contacts.map((contact, idx) => {
            const Icon = contact.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="bg-[#111625]/60 border border-[#1d2438] hover:border-brand-cyan/20 p-8 rounded-2xl flex flex-col justify-between items-center text-center space-y-4 transition duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <motion.div
                  className="w-10 h-10 rounded-full bg-brand-cyan/10 flex items-center justify-center border border-brand-cyan/20"
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-5 h-5 text-brand-cyan" />
                </motion.div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">{contact.title}</h3>
                  <p className="text-xs text-gray-400 font-medium">{contact.detail}</p>
                </div>
                <a
                  href={contact.link}
                  className="w-full bg-[#1d2438] hover:bg-brand-cyan hover:text-black text-gray-300 font-bold text-xs py-3 rounded-xl transition duration-300 text-center block"
                >
                  {contact.action}
                </a>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQs */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <motion.h2
            className="text-2xl font-black text-white tracking-tight flex items-center space-x-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <HelpCircle className="w-6 h-6 text-brand-cyan" />
            <span>Frequently Asked Questions</span>
          </motion.h2>
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                variants={faqVariants}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="bg-[#111625]/30 border border-[#1d2438]/50 hover:border-brand-cyan/20 p-6 rounded-xl space-y-2 transition duration-300"
              >
                <h3 className="text-base font-bold text-white">{faq.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
