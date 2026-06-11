"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageSquare, Send, Mail, HelpCircle } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();

  const contacts = [
    {
      icon: Send,
      title: t.supportPage.telegramTitle,
      detail: t.supportPage.telegramDetail,
      action: t.supportPage.telegramAction,
      link: "https://t.me",
    },
    {
      icon: MessageSquare,
      title: t.supportPage.liveChatTitle,
      detail: t.supportPage.liveChatDetail,
      action: t.supportPage.liveChatAction,
      link: "#",
    },
    {
      icon: Mail,
      title: t.supportPage.emailTitle,
      detail: t.supportPage.emailDetail,
      action: t.supportPage.emailAction,
      link: "mailto:support@gamexcambodia.com",
    },
  ];

  const faqs = [
    {
      q: t.supportPage.faq1q,
      a: t.supportPage.faq1a,
    },
    {
      q: t.supportPage.faq2q,
      a: t.supportPage.faq2a,
    },
    {
      q: t.supportPage.faq3q,
      a: t.supportPage.faq3a,
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
            {t.supportPage.title} <span className="text-brand-cyan">{t.supportPage.titleHighlight}</span>
          </h1>
          <p className="text-base text-gray-400 font-medium leading-relaxed">
            {t.supportPage.subtitle}
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
            <span>{t.supportPage.faqTitle}</span>
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
