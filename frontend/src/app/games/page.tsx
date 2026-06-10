"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Search, Zap } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { apiService } from "@/services/api";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface GameCard {
  id: string;
  name: string;
  image: string;
  isHot?: boolean;
  slug: string;
}

const allGames: GameCard[] = [
  {
    id: "1",
    name: "Mobile Legends",
    image: "/images/mlbb.png",
    isHot: true,
    slug: "mobile-legends",
  },
  {
    id: "2",
    name: "PUBG Mobile",
    image: "/images/pubg.png",
    slug: "pubg-mobile",
  },
  {
    id: "3",
    name: "Garena Free Fire",
    image: "/images/free_fire.png",
    slug: "free-fire",
  },
  {
    id: "4",
    name: "Roblox",
    image: "/images/roblox.png",
    slug: "roblox",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
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

function GamesCatalog() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("search") || "";
  const [search, setSearch] = useState(urlQuery);
  const [games, setGames] = useState<GameCard[]>(allGames);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    let isMounted = true;
    apiService.getGames()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((game: any) => ({
            id: game.id,
            name: game.name,
            image: game.iconUrl || "/images/mlbb.png",
            slug: game.slug,
            isHot: game.isHot,
          }));
          setGames(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to load games catalog from API, using fallback:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8">
        {/* Banner Section */}
        <motion.div
          className="text-center max-w-xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.games.pageTitle}
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-medium">
            {t.games.pageSubtitle}
          </p>

          {/* Search bar inside games page */}
          <motion.div
            className="mt-8 relative max-w-md mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center bg-[#111625]/90 border border-[#1d2438] focus-within:border-brand-cyan/40 rounded-xl px-4 py-3 shadow-md group transition-all duration-300">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-brand-cyan transition-colors duration-200" />
              <input
                type="text"
                placeholder={t.games.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm px-3 placeholder-gray-400"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Games Grid or Loading State */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-gray-700 border-t-brand-cyan animate-spin" />
            <span className="mt-4 text-gray-400 font-medium text-sm">{t.games.loading}</span>
          </div>
        ) : filteredGames.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                variants={cardVariants}
                className="group relative flex flex-col bg-[#111625] border border-[#1d2438] hover:border-brand-cyan/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={game.image}
                    alt={game.name}
                    fill
                    className="object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111625] via-transparent to-transparent opacity-80" />

                  {/* Hot Badge */}
                  {game.isHot && (
                    <motion.span
                      className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-[10px] font-black text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {t.games.hotBadge}
                    </motion.span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between gap-3 sm:gap-4">
                  <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 group-hover:text-brand-cyan transition duration-200">
                    {game.name}
                  </h3>

                  <Link href={`/games/${game.slug}`} className="w-full">
                    <div className="w-full flex items-center justify-center space-x-1 sm:space-x-2 bg-[#1d2438] group-hover:bg-brand-cyan group-hover:text-black text-gray-300 font-bold text-[10px] sm:text-xs py-2.5 sm:py-3 rounded-xl transition-all duration-300 cursor-pointer">
                      <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      <span>{t.games.instantTopUp}</span>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-20 bg-[#111625]/20 border border-[#1d2438]/40 rounded-2xl max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-gray-400 font-semibold text-lg">{t.games.noResults} &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-brand-cyan hover:underline text-sm font-bold"
            >
              {t.games.clearSearch}
            </button>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-gray-700 border-t-brand-cyan animate-spin" />
        </main>
        <Footer />
      </div>
    }>
      <GamesCatalog />
    </Suspense>
  );
}
