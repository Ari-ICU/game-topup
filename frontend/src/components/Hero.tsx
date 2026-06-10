"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useLanguage } from "@/context/LanguageContext";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { language, t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/games");
    }
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden py-16 px-4">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero_bg.png"
          alt="Gaming Characters Background"
          fill
          priority
          className="object-cover object-center opacity-65 scale-105"
        />
        {/* Advanced Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b11] via-[#080b11]/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,43,226,0.15)_0%,transparent_60%)]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center min-h-[50vh]">
        <div className="max-w-2xl text-left space-y-6">
          {/* Badge */}
          <motion.div
            className="inline-block"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-purple/20 text-[#bf80ff] border border-brand-purple/30">
              Elite Top-up Store
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            Power Up Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-cyan-400 drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              Gaming Experience
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-300 font-medium leading-relaxed max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {t.hero.subtitle}
          </motion.p>

          {/* Call-to-action buttons */}
          <motion.div
            className="flex flex-wrap gap-4 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <Link href="/games">
              <motion.button
                className="bg-brand-cyan hover:bg-brand-cyan-hover text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_35px_rgba(0,229,255,0.6)] transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {language === "en" ? "Get Started Now" : "ចាប់ផ្តើមឥឡូវនេះ"}
              </motion.button>
            </Link>
            <Link href="/offers">
              <motion.button
                className="bg-transparent hover:bg-white/5 border-2 border-[#1d2438] hover:border-brand-cyan/50 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {language === "en" ? "View Offers" : "មើលប្រូម៉ូសិន"}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating Search Bar */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-16 md:mt-24"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
      >
        <form
          onSubmit={handleSearch}
          className="w-full max-w-3xl mx-auto bg-[#111625]/75 border border-[#1d2438] backdrop-blur-lg p-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-2 group focus-within:border-brand-cyan/50 focus-within:shadow-[0_0_20px_rgba(0,229,255,0.15)] transition-all duration-300"
        >
          <div className="flex items-center flex-1 pl-4">
            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-brand-cyan transition-colors duration-200" />
            <input
              type="text"
              placeholder={t.hero.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm sm:text-base font-medium px-3 placeholder-gray-400"
            />
          </div>
          <motion.button
            type="submit"
            className="bg-brand-cyan hover:bg-brand-cyan-hover text-white text-xs sm:text-sm font-bold px-6 sm:px-8 py-3 rounded-xl transition duration-200"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.hero.searchButton}
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
}
