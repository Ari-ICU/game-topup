"use client";

import React from "react";
import Link from "next/link";
import { Globe, MessageSquare } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const colVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#05070c] border-t border-[#1d2438] pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 mb-12">
        {/* Left Column (Brand info) */}
        <motion.div
          className="md:col-span-5 space-y-6"
          custom={0}
          variants={colVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <Link href="/" className="text-2xl font-black tracking-wider text-brand-cyan">
            GAMEX CAMBODIA
          </Link>
          <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-sm">
            {t.footer.description}
          </p>
          <div className="flex space-x-3">
            <motion.div whileHover={{ scale: 1.12, rotate: -6 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-[#111625] hover:bg-brand-cyan hover:text-black border border-[#1d2438] text-gray-400 flex items-center justify-center transition-all duration-300"
              >
                <Globe className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.12, rotate: 6 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-[#111625] hover:bg-brand-cyan hover:text-black border border-[#1d2438] text-gray-400 flex items-center justify-center transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Center/Right Columns (Links) */}
        <div className="md:col-span-7 grid grid-cols-2 gap-6 sm:gap-8">
          {/* Quick Links */}
          <motion.div
            className="space-y-4"
            custom={1}
            variants={colVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
          >
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: t.nav.home },
                { href: "/games", label: t.nav.games },
                { href: "/offers", label: t.footer.specialOffers },
                { href: "/loyalty", label: t.nav.loyalty },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-brand-cyan transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            className="space-y-4"
            custom={2}
            variants={colVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
          >
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.nav.support}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/support", label: t.footer.helpCenter },
                { href: "/how-to-top-up", label: t.footer.howToTopUp },
                { href: "/terms", label: t.footer.termsOfService },
                { href: "/privacy", label: t.footer.privacyPolicy },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-brand-cyan transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        className="max-w-7xl mx-auto pt-8 border-t border-[#1d2438]/50 flex flex-col sm:flex-row items-center justify-between gap-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <p className="text-xs text-gray-500 font-medium text-center sm:text-left">
          {t.footer.copyright}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-gray-500">
          <Link href="/terms" className="hover:text-brand-cyan transition">{t.footer.terms}</Link>
          <Link href="/privacy" className="hover:text-brand-cyan transition">{t.footer.privacy}</Link>
          <Link href="/contact" className="hover:text-brand-cyan transition">{t.footer.contact}</Link>
        </div>
      </motion.div>
    </footer>
  );
}
