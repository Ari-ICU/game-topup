import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiveFeed from "@/components/LiveFeed";
import StatsBar from "@/components/StatsBar";
import TrendingServices from "@/components/TrendingServices";
import Features from "@/components/Features";
import PaymentMethods from "@/components/PaymentMethods";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-gray-200">
      {/* Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Banner with Search Bar */}
        <Hero />

        {/* Live Orders Ticker */}
        <LiveFeed />

        {/* Platform Stats */}
        <StatsBar />

        {/* Trending Game Grid */}
        <TrendingServices />

        {/* Customer Value Props & Features */}
        <Features />

        {/* Accepted Local Bank Providers */}
        <PaymentMethods />
      </main>

      {/* Footer Details */}
      <Footer />
    </div>
  );
}
