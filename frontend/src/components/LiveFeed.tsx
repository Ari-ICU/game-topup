"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const recentOrders = [
  { user: "Sokha***", game: "Mobile Legends", item: "706 Diamonds", time: "2m ago" },
  { user: "Dara***", game: "PUBG Mobile", item: "660 UC", time: "4m ago" },
  { user: "Ratha***", game: "Free Fire", item: "520 Diamonds", time: "6m ago" },
  { user: "Mony***", game: "Roblox", item: "800 Robux", time: "8m ago" },
  { user: "Pisach***", game: "Mobile Legends", item: "2195 Diamonds", time: "10m ago" },
  { user: "Vanna***", game: "PUBG Mobile", item: "1800 UC", time: "12m ago" },
  { user: "Borey***", game: "Free Fire", item: "1060 Diamonds", time: "14m ago" },
  { user: "Chenda***", game: "Mobile Legends", item: "172 Diamonds", time: "16m ago" },
  { user: "Sreymom***", game: "Roblox", item: "1700 Robux", time: "18m ago" },
  { user: "Kosal***", game: "PUBG Mobile", item: "325 UC", time: "20m ago" },
];

// Duplicate for seamless loop
const items = [...recentOrders, ...recentOrders];

export default function LiveFeed() {
  return (
    <div className="py-4 border-y border-[#1d2438]/40 bg-[#080b11]/80 overflow-hidden">
      <div className="flex items-center">
        {/* Label */}
        <div className="shrink-0 flex items-center gap-2 px-4 pr-6 border-r border-[#1d2438] mr-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">
            Live Orders
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden relative">
          {/* Fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#080b11] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#080b11] to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 30,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {items.map((order, idx) => (
              <div
                key={idx}
                className="shrink-0 flex items-center gap-2 bg-[#111625]/60 border border-[#1d2438] rounded-full px-4 py-1.5"
              >
                <Zap className="w-3 h-3 text-brand-cyan shrink-0" />
                <span className="text-[11px] font-bold text-white whitespace-nowrap">
                  {order.user}
                </span>
                <span className="text-[11px] text-gray-500 whitespace-nowrap">
                  topped up
                </span>
                <span className="text-[11px] font-bold text-brand-cyan whitespace-nowrap">
                  {order.item}
                </span>
                <span className="text-[11px] text-gray-500 whitespace-nowrap">
                  on {order.game}
                </span>
                <span className="text-[10px] text-gray-600 whitespace-nowrap ml-1">
                  · {order.time}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
