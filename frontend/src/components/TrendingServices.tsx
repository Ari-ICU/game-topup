"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap, TrendingUp } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { apiService } from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";

interface GameCard {
  id: string;
  name: string;
  image: string;
  isHot?: boolean;
  slug: string;
  packageCount?: number;
}

const FALLBACK_GAMES: GameCard[] = [
  { id: "1", name: "Mobile Legends", image: "/images/mlbb.avif", isHot: true, slug: "mobile-legends", packageCount: 5 },
  { id: "2", name: "PUBG Mobile", image: "/images/pubg.avif", slug: "pubg-mobile", packageCount: 5 },
  { id: "3", name: "Garena Free Fire", image: "/images/free_fire.png", slug: "free-fire", packageCount: 5 },
  { id: "4", name: "Roblox", image: "/images/roblox.jpg", slug: "roblox", packageCount: 4 },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-[#111625] border border-[#1d2438] rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] w-full bg-[#1d2438]" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/4 bg-[#1d2438] rounded-lg" />
        <div className="h-9 w-full bg-[#1d2438] rounded-xl" />
      </div>
    </div>
  );
}

export default function TrendingServices() {
  const [games, setGames] = useState<GameCard[]>(FALLBACK_GAMES);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    apiService
      .getGames()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((game: any) => ({
            id: game.id,
            name: game.name,
            image: game.iconUrl || "/images/mlbb.png",
            slug: game.slug,
            isHot: game.isHot,
            packageCount: game._count?.packages ?? 0,
          }));
          setGames(mapped.slice(0, 4));
        }
      })
      .catch((err) => {
        console.error("Failed to load trending services from API, using fallback:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Header Row */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
            <TrendingUp className="w-3 h-3" />
            {language === "en" ? "Trending Now" : "ពេញនិយមឥឡូវនេះ"}
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {t.trending.title}
          </h2>
          <p className="text-sm text-gray-400 font-medium">
            {t.trending.subtitle}
          </p>
        </div>

        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-cyan hover:text-white transition-colors group"
        >
          {language === "en" ? "View All Games" : "មើលហ្គេមទាំងអស់"}
          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </Link>
      </motion.div>

      {/* Loading skeletons or game cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
        >
          {games.map((game) => (
            <motion.div
              key={game.id}
              variants={cardVariants}
              className="group relative flex flex-col bg-[#111625] border border-[#1d2438] hover:border-brand-cyan/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
              whileHover={{ y: -8, transition: { duration: 0.22 } }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  className="object-cover group-hover:scale-108 group-hover:brightness-110 transition-all duration-500"
                />
                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111625] via-transparent to-transparent opacity-80" />

                {/* Hot badge */}
                {game.isHot && (
                  <motion.span
                    className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-[10px] font-black text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🔥 Hot
                  </motion.span>
                )}

                {/* Package count pill */}
                {game.packageCount !== undefined && game.packageCount > 0 && (
                  <span className="absolute bottom-3 left-3 text-[9px] font-black text-white bg-black/50 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {game.packageCount} {language === "en" ? "packages" : "កញ្ចប់"}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between gap-3 sm:gap-4">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-cyan transition-colors duration-200">
                  {game.name}
                </h3>

                <Link href={`/games/${game.slug}`} className="w-full">
                  <motion.div
                    className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-[#1d2438] group-hover:bg-brand-cyan group-hover:text-black text-gray-300 font-bold text-[10px] sm:text-xs py-2.5 sm:py-3 rounded-xl transition-all duration-300 cursor-pointer"
                    whileTap={{ scale: 0.96 }}
                  >
                    <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    <span>{t.trending.viewDetails}</span>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
