"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Send, Mail, MapPin, MessageSquare, Clock, ChevronRight, CheckCircle } from "lucide-react";
import { motion, type Variants, AnimatePresence } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const contactCards = [
  {
    icon: Send,
    title: "Telegram Helpdesk",
    desc: "Available 24/7 for instant support tickets and order inquiries.",
    link: "https://t.me",
    linkLabel: "@GamexCambodia_Bot",
    accent: "from-[#00b2ff] to-[#0069ff]",
    response: "< 5 min",
  },
  {
    icon: Mail,
    title: "Email Support",
    desc: "For corporate, business invoicing, and bulk top-up partnerships.",
    link: "mailto:support@gamexcambodia.com",
    linkLabel: "support@gamexcambodia.com",
    accent: "from-brand-cyan to-cyan-400",
    response: "< 2 hours",
  },
  {
    icon: MapPin,
    title: "Headquarters",
    desc: "Vattanac Capital Tower, Phnom Penh, Cambodia.",
    link: "https://maps.google.com",
    linkLabel: "View on Google Maps",
    accent: "from-purple-400 to-pink-500",
    response: "Walk-in by appointment",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const inputClass =
    "w-full bg-[#080b11] border border-[#1d2438] focus:border-brand-cyan/50 focus:ring-0 outline-none rounded-xl px-4 py-3 text-sm text-white font-medium placeholder-gray-600 transition-all duration-200";

  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full py-16 px-4 sm:px-6 lg:px-8 space-y-16">
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
            <MessageSquare className="w-3 h-3" />
            We&apos;re Here to Help
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-cyan-400">Us</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            Reach our team for support, partnership inquiries, or enterprise bulk top-up solutions.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {contactCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="bg-[#111625]/60 border border-[#1d2438] hover:border-brand-cyan/20 p-6 rounded-2xl flex flex-col space-y-4 transition duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] group"
              >
                <motion.div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.accent} bg-opacity-10 flex items-center justify-center shadow-lg`}
                  style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)" }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-5 h-5 text-brand-cyan" />
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">{card.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Response time: <span className="text-brand-cyan">{card.response}</span></span>
                </div>

                {card.link && card.linkLabel && (
                  <a
                    href={card.link}
                    target={card.link.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-cyan hover:text-white font-bold transition-colors group-hover:gap-2 duration-200"
                  >
                    {card.linkLabel}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Contact Form + Info Split */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Form */}
          <motion.div
            className="lg:col-span-3 bg-[#111625]/60 border border-[#1d2438] rounded-2xl p-8 space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.55, ease: "easeOut" }}
          >
            <div>
              <h2 className="text-xl font-black text-white">Send a Message</h2>
              <p className="text-xs text-gray-400 mt-1 font-medium">We&apos;ll respond within 2 business hours.</p>
            </div>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center"
                  >
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white">Message Sent!</h3>
                  <p className="text-sm text-gray-400 text-center max-w-xs">
                    Thanks <span className="text-white font-bold">{form.name}</span>! We&apos;ve received your message and will reply to <span className="text-brand-cyan">{form.email}</span> shortly.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-2 text-xs text-brand-cyan hover:underline font-bold"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400">Full Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400">Email Address *</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400">Subject</label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="" disabled>Select a topic...</option>
                      <option value="order">Order / Payment Issue</option>
                      <option value="partnership">Partnership / Business</option>
                      <option value="refund">Refund Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400">Message *</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Describe your issue or inquiry in detail..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-brand-cyan hover:bg-brand-cyan-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Info Sidebar */}
          <motion.div
            className="lg:col-span-2 space-y-5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.55, ease: "easeOut" }}
          >
            <div className="bg-[#111625]/60 border border-[#1d2438] rounded-2xl p-6 space-y-5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Business Hours</h3>
              {[
                { day: "Monday – Friday", time: "8:00 AM – 8:00 PM" },
                { day: "Saturday", time: "9:00 AM – 6:00 PM" },
                { day: "Sunday", time: "Telegram Only (24/7)" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-medium border-b border-[#1d2438] last:border-0 pb-3 last:pb-0">
                  <span className="text-gray-400">{item.day}</span>
                  <span className="text-white font-bold">{item.time}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-brand-cyan/10 to-[#111625] border border-brand-cyan/20 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-black text-brand-cyan uppercase tracking-wider">Quick Help</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                For urgent order issues, use Telegram for the fastest response — our bot handles order status checks 24/7.
              </p>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#00b2ff]/10 border border-[#00b2ff]/20 text-[#00b2ff] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#00b2ff]/20 transition-all duration-200"
              >
                <Send className="w-3.5 h-3.5" />
                Open Telegram Support
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
