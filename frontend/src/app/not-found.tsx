"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Animated glow background */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-brand-cyan/5 blur-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 space-y-6 max-w-md">
          {/* Neon 404 */}
          <motion.h1
            className="text-8xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-cyan-500 drop-shadow-[0_0_30px_rgba(0,229,255,0.3)]"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            404
          </motion.h1>

          <motion.h2
            className="text-2xl sm:text-3xl font-extrabold text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            Page Not Found
          </motion.h2>

          <motion.p
            className="text-sm sm:text-base text-gray-400 font-medium leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
          >
            Oops! The page you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable.
          </motion.p>

          <motion.div
            className="pt-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          >
            <Link href="/">
              <motion.span
                className="inline-block bg-brand-cyan hover:bg-brand-cyan-hover text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.25)] hover:shadow-[0_0_25px_rgba(0,229,255,0.45)] transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                Back to Home
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
