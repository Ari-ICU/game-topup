"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  RefreshCw,
  Calendar,
  Gamepad2,
  User,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface StatCounts {
  PENDING: number;
  COMPLETED: number;
  FAILED: number;
  EXPIRED: number;
  PROCESSING: number;
}

interface TopGame {
  name: string;
  sales: number;
  count: number;
}

interface RecentTransaction {
  id: string;
  playerInfo: { playerId: string; zoneId?: string };
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "EXPIRED";
  createdAt: string;
  paymentMethod: string;
  package: {
    name: string;
    game: {
      name: string;
      iconUrl: string;
    };
  };
}

interface DashboardStats {
  totalSales: number;
  totalTransactions: number;
  statusCounts: StatCounts;
  topGames: TopGame[];
  recentTransactions: RecentTransaction[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      const res = await fetch("/api/admin/stats");

      if (!res.ok) {
        throw new Error(`Failed to load stats: ${res.statusText}`);
      }

      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to retrieve statistics from backend server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium">Computing aggregate metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center max-w-xl mx-auto my-12">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Failed to load statistics</h3>
        <p className="text-gray-400 mb-6 text-sm">{error}</p>
        <button
          onClick={() => fetchStats()}
          className="px-6 py-2 bg-[#1a1c24] hover:bg-[#252834] text-white border border-[#2d3142] rounded-xl transition-all cursor-pointer font-semibold text-sm inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry Fetch
        </button>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate some analytics
  const completionRate = stats.totalTransactions > 0 
    ? ((stats.statusCounts.COMPLETED / stats.totalTransactions) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time revenue monitoring and gaming transaction volume metrics.</p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-[#111625] border border-[#1d2438] hover:border-brand-cyan/30 text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer text-xs font-bold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-brand-cyan" : ""}`} />
          {refreshing ? "Updating..." : "Refresh Stats"}
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="p-6 rounded-2xl bg-[#111625] border border-[#1d2438] hover:border-brand-cyan/20 transition-all shadow-lg shadow-black/10 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
            <DollarSign className="w-32 h-32 text-brand-cyan" />
          </div>
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-brand-cyan/10 rounded-xl text-brand-cyan border border-brand-cyan/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
              Live Sales
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white">${stats.totalSales.toFixed(2)}</h3>
            <p className="text-gray-400 text-xs font-semibold mt-1">Total Sales (USD)</p>
          </div>
        </div>

        {/* Total Volume */}
        <div className="p-6 rounded-2xl bg-[#111625] border border-[#1d2438] hover:border-brand-cyan/20 transition-all shadow-lg shadow-black/10 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
            <Receipt className="w-32 h-32 text-brand-purple" />
          </div>
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-brand-purple/10 rounded-xl text-brand-purple border border-brand-purple/20">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white">{stats.totalTransactions}</h3>
            <p className="text-gray-400 text-xs font-semibold mt-1">Transactions Initiated</p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-6 rounded-2xl bg-[#111625] border border-[#1d2438] hover:border-brand-cyan/20 transition-all shadow-lg shadow-black/10 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
            <TrendingUp className="w-32 h-32 text-green-400" />
          </div>
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-green-500/10 rounded-xl text-green-400 border border-green-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white">{completionRate}%</h3>
            <p className="text-gray-400 text-xs font-semibold mt-1">Completion Success Rate</p>
          </div>
        </div>

        {/* Pending / Active */}
        <div className="p-6 rounded-2xl bg-[#111625] border border-[#1d2438] hover:border-brand-cyan/20 transition-all shadow-lg shadow-black/10 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
            <Clock className="w-32 h-32 text-yellow-400" />
          </div>
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white">{stats.statusCounts.PENDING}</h3>
            <p className="text-gray-400 text-xs font-semibold mt-1">Pending Unpaid Orders</p>
          </div>
        </div>
      </div>

      {/* Middle Grid - Top Games & Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Selling Games */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111625] border border-[#1d2438] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Gamepad2 className="w-5 h-5 text-brand-cyan" />
            <h3 className="text-base font-bold text-white">Top Performing Games</h3>
          </div>

          <div className="flex-1 space-y-5">
            {stats.topGames.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12 text-sm">
                No game sales recorded yet.
              </div>
            ) : (
              stats.topGames.map((game, idx) => {
                // Determine max sales for visual meter width normalization
                const maxSales = Math.max(...stats.topGames.map(g => g.sales));
                const percentage = maxSales > 0 ? (game.sales / maxSales) * 100 : 0;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-200">{game.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs">{game.count} orders</span>
                        <span className="font-bold text-brand-cyan">${game.sales.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-[#080b11] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status breakdown logs */}
        <div className="p-6 rounded-2xl bg-[#111625] border border-[#1d2438]">
          <h3 className="text-base font-bold text-white mb-6">Transaction States</h3>
          
          <div className="space-y-4">
            {/* Completed */}
            <div className="flex items-center justify-between p-3.5 bg-[#080b11]/50 border border-[#1d2438] rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-gray-300">Completed</span>
              </div>
              <span className="text-sm font-bold text-white">{stats.statusCounts.COMPLETED}</span>
            </div>

            {/* Pending */}
            <div className="flex items-center justify-between p-3.5 bg-[#080b11]/50 border border-[#1d2438] rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-300">Pending</span>
              </div>
              <span className="text-sm font-bold text-white">{stats.statusCounts.PENDING}</span>
            </div>

            {/* Processing */}
            <div className="flex items-center justify-between p-3.5 bg-[#080b11]/50 border border-[#1d2438] rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-semibold text-gray-300">Processing</span>
              </div>
              <span className="text-sm font-bold text-white">{stats.statusCounts.PROCESSING}</span>
            </div>

            {/* Expired */}
            <div className="flex items-center justify-between p-3.5 bg-[#080b11]/50 border border-[#1d2438] rounded-xl">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-semibold text-gray-400">Expired</span>
              </div>
              <span className="text-sm font-bold text-white">{stats.statusCounts.EXPIRED}</span>
            </div>

            {/* Failed */}
            <div className="flex items-center justify-between p-3.5 bg-[#080b11]/50 border border-[#1d2438] rounded-xl">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm font-semibold text-gray-300">Failed</span>
              </div>
              <span className="text-sm font-bold text-white">{stats.statusCounts.FAILED}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Log */}
      <div className="p-6 rounded-2xl bg-[#111625] border border-[#1d2438]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-purple" />
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
          </div>
          <Link
            href="/admin/transactions"
            className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1 group"
          >
            View all logs <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#1d2438] text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Game</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Player Details</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d2438]/50">
              {stats.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                    No transactions registered in system yet.
                  </td>
                </tr>
              ) : (
                stats.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#151c2f]/40 transition-colors">
                    {/* Game */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {tx.package?.game?.iconUrl ? (
                          <img
                            src={tx.package.game.iconUrl}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover border border-[#1d2438]"
                          />
                        ) : (
                          <div className="w-7 h-7 bg-[#1c2235] rounded-lg flex items-center justify-center border border-[#1d2438] text-brand-cyan">
                            <Gamepad2 className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-semibold text-white">{tx.package?.game?.name || "Unknown"}</span>
                      </div>
                    </td>

                    {/* Package */}
                    <td className="py-3 px-4 font-medium text-gray-300">
                      {tx.package?.name || "Denomination Pack"}
                    </td>

                    {/* Player Details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <User className="w-3.5 h-3.5 text-brand-cyan/70" />
                        <span className="font-mono bg-[#080b11] px-1.5 py-0.5 rounded text-gray-300">
                          {tx.playerInfo?.playerId || "N/A"}
                        </span>
                        {tx.playerInfo?.zoneId && (
                          <span className="font-mono bg-[#080b11] px-1.5 py-0.5 rounded text-gray-400">
                            ({tx.playerInfo.zoneId})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-bold text-brand-cyan">
                      ${tx.totalAmount.toFixed(2)}
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        tx.status === "COMPLETED" 
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : tx.status === "PENDING"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse"
                          : tx.status === "PROCESSING"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : tx.status === "EXPIRED"
                          ? "bg-gray-500/10 text-gray-400 border-gray-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                        <span className="text-gray-600 font-mono">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
