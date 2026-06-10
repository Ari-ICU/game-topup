"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const mobileMenuVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.22, ease: "easeIn" as const },
  },
};

const mobileNavItemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, delay: i * 0.07, ease: "easeOut" as const },
  }),
};

const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.15 },
  },
};

import { useLanguage } from "@/context/LanguageContext";

const navLinks = [
  { href: "/", key: "home" as const },
  { href: "/games", key: "games" as const },
  { href: "/loyalty", key: "loyalty" as const },
  { href: "/support", key: "support" as const },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [xp, setXp] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch and update Loyalty XP
  useEffect(() => {
    const fetchXp = () => {
      const savedXp = parseInt(localStorage.getItem("app_xp") || "0", 10);
      setXp(savedXp);
    };
    fetchXp();

    const handleXpUpdate = () => {
      fetchXp();
    };
    window.addEventListener("xpUpdated", handleXpUpdate);
    return () => window.removeEventListener("xpUpdated", handleXpUpdate);
  }, []);

  const getLoyaltyDetails = (xpVal: number) => {
    if (xpVal >= 2000) return { name: "Platinum", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" };
    if (xpVal >= 500) return { name: "Gold", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" };
    if (xpVal >= 100) return { name: "Silver", color: "text-gray-400 bg-gray-400/10 border-gray-400/20" };
    return { name: "Bronze", color: "text-amber-600 bg-amber-600/10 border-amber-600/20" };
  };
  const loyalty = getLoyaltyDetails(xp);

  return (
    <nav className="sticky top-0 z-50 bg-[#080b11]/90 backdrop-blur-md border-b border-[#1d2438]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-wider text-brand-cyan hover:brightness-110 transition duration-300">
                GAMEX CAMBODIA
              </span>
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <motion.div
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          >
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition duration-200 ${
                    isActive ? "text-brand-cyan" : "text-gray-300 hover:text-brand-cyan"
                  }`}
                >
                  {t.nav[link.key]}
                </Link>
              );
            })}
          </motion.div>

          {/* User Controls */}
          <motion.div
            className="hidden md:flex items-center space-x-3 relative"
            ref={dropdownRef}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
          >
            {/* Loyalty Badge */}
            <Link href="/loyalty" className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${loyalty.color}`}>
              <span>{t.nav.tier}: {loyalty.name}</span>
              <span className="text-[10px] opacity-60">({xp} XP)</span>
            </Link>

            {/* Language Switcher */}
            <motion.button
              onClick={() => setLanguage(language === "en" ? "kh" : "en")}
              className="flex items-center space-x-1.5 bg-[#111625] hover:bg-[#1a2035] border border-[#1d2438] hover:border-[#2d3856] text-xs font-semibold text-gray-300 px-3 py-1.5 rounded-full transition duration-200 cursor-pointer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <span>{language === "en" ? "🇬🇧 EN" : "🇰🇭 KH"}</span>
            </motion.button>

            {/* Currency Switcher */}
            <div className="relative">
              <motion.button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center space-x-2 bg-[#111625] hover:bg-[#1a2035] border border-[#1d2438] hover:border-[#2d3856] text-xs font-semibold text-gray-300 px-3 py-1.5 rounded-full transition duration-200 cursor-pointer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Globe className="w-3.5 h-3.5 text-brand-cyan" />
                <span>{currency === "USD" ? "USD ($)" : "KHR (៛)"}</span>
                <motion.span
                  animate={{ rotate: currencyOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {currencyOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-32 bg-[#111625] border border-[#1d2438] rounded-xl shadow-lg py-1.5 z-50"
                  >
                    <button
                      onClick={() => { setCurrency("USD"); setCurrencyOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-brand-cyan hover:text-black transition duration-150 cursor-pointer ${currency === "USD" ? "text-brand-cyan" : "text-gray-300"}`}
                    >
                      USD ($)
                    </button>
                    <button
                      onClick={() => { setCurrency("KHR"); setCurrencyOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-brand-cyan hover:text-black transition duration-150 cursor-pointer ${currency === "KHR" ? "text-brand-cyan" : "text-gray-300"}`}
                    >
                      KHR (៛)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-brand-cyan p-2 focus:outline-none"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden overflow-hidden bg-[#080b11] border-b border-[#1d2438] px-4 pt-2 pb-6 space-y-3"
          >
            {navLinks.map((link, i) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <motion.div
                  key={link.href}
                  custom={i}
                  variants={mobileNavItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block text-base font-semibold py-2 transition duration-200 ${
                      isActive ? "text-brand-cyan" : "text-gray-300 hover:text-brand-cyan"
                    }`}
                  >
                    {t.nav[link.key]}
                  </Link>
                </motion.div>
              );
            })}

            {/* Mobile Switchers Grid */}
            <motion.div
              custom={navLinks.length}
              variants={mobileNavItemVariants}
              initial="hidden"
              animate="visible"
              className="pt-4 border-t border-[#1d2438] grid grid-cols-2 gap-2"
            >
              {/* Mobile Language Button */}
              <motion.button
                onClick={() => setLanguage(language === "en" ? "kh" : "en")}
                className="flex items-center justify-center space-x-2 bg-[#111625] text-gray-300 py-2.5 rounded-lg border border-[#1d2438] cursor-pointer"
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-sm font-semibold">
                  {language === "en" ? "🇬🇧 EN" : "🇰🇭 KH"}
                </span>
              </motion.button>

              {/* Mobile Currency Button */}
              <motion.button
                onClick={() => setCurrency(currency === "USD" ? "KHR" : "USD")}
                className="flex items-center justify-center space-x-2 bg-[#111625] text-gray-300 py-2.5 rounded-lg border border-[#1d2438] cursor-pointer"
                whileTap={{ scale: 0.97 }}
              >
                <Globe className="w-4 h-4 text-brand-cyan" />
                <span className="text-sm font-semibold">
                  {currency === "USD" ? "USD ($)" : "KHR (៛)"}
                </span>
              </motion.button>

              {/* Mobile Loyalty Badge */}
              <Link
                href="/loyalty"
                onClick={() => setIsOpen(false)}
                className={`col-span-2 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg border font-bold text-xs ${loyalty.color}`}
              >
                <span>{t.nav.tier}: {loyalty.name} ({xp} XP)</span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
