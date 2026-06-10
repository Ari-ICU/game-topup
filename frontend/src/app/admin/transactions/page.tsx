"use client";

import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  Search, 
  Filter, 
  RefreshCw, 
  Check, 
  X, 
  User, 
  Gamepad2, 
  Calendar,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Sparkles
} from "lucide-react";

interface Transaction {
  id: string;
  playerInfo: { playerId: string; zoneId?: string };
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "EXPIRED";
  paymentMethod: string;
  paymentRef: string | null;
  providerRef: string | null;
  createdAt: string;
  package: {
    name: string;
    game: {
      name: string;
      iconUrl: string;
    };
  };
}

export default function AdminTransactions() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [overridingId, setOverridingId] = useState<string | null>(null);
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchTransactions = async (pageNum = page, searchStr = search, statusStr = status) => {
    setLoading(true);
    setError("");
    
    // Build query params
    const query = new URLSearchParams({
      page: pageNum.toString(),
      limit: limit.toString(),
    });
    if (searchStr) query.append("search", searchStr);
    if (statusStr) query.append("status", statusStr);

    try {
      const res = await fetch(`/api/admin/transactions?${query.toString()}`);

      if (!res.ok) {
        throw new Error(`Failed to load transactions: ${res.statusText}`);
      }

      const data = await res.json();
      setTxs(data.transactions || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load transaction logs from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page, search, status);
  }, [page, search, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleStatusFilter = (newStatus: string) => {
    setPage(1);
    setStatus(newStatus);
  };

  const handleManualComplete = async (txId: string) => {
    setOverrideLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/admin/transactions/${txId}/complete`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Override request rejected by backend.");
      }

      const updatedTx = await res.json();
      
      // Update local transaction state
      setTxs(txs.map(t => t.id === txId ? { ...t, status: updatedTx.status, paymentRef: updatedTx.paymentRef } : t));
      
      setMessage(`Successfully overrode payment status for Order ID #${txId}. Updated status to COMPLETED.`);
      setOverridingId(null);
      
      setTimeout(() => setMessage(""), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Manual completion override failed.");
    } finally {
      setOverrideLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Top-up Logs <Sparkles className="w-5 h-5 text-brand-cyan" />
          </h1>
          <p className="text-gray-400 text-sm mt-1">Audit client checkouts, inspect payment states, and force manual fulfillments.</p>
        </div>
        <button
          onClick={() => fetchTransactions(page, search, status)}
          disabled={loading}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-[#111625] border border-[#1d2438] hover:border-brand-cyan/30 text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer text-xs font-bold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-cyan" : ""}`} />
          Reload logs
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-xs font-semibold text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-semibold text-red-400">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search by Transaction ID, Player ID, paymentRef..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-[#111625] border border-[#1d2438] rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-cyan transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search className="w-4 h-4" />
          </div>
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { label: "All Statuses", val: "" },
            { label: "Pending", val: "PENDING" },
            { label: "Completed", val: "COMPLETED" },
            { label: "Expired", val: "EXPIRED" },
            { label: "Failed", val: "FAILED" },
            { label: "Processing", val: "PROCESSING" }
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => handleStatusFilter(item.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border cursor-pointer transition-all ${
                status === item.val
                  ? "bg-brand-cyan/15 border-brand-cyan text-brand-cyan"
                  : "bg-[#111625] border-[#1d2438] text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main logs Table */}
      <div className="p-6 rounded-2xl bg-[#111625] border border-[#1d2438] shadow-lg shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#1d2438] text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Game</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Player Details</th>
                <th className="py-3 px-4">Total Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Ref Numbers</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d2438]/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400 font-semibold text-sm">
                      <div className="w-4 h-4 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
                      <span>Retrieving page entries...</span>
                    </div>
                  </td>
                </tr>
              ) : txs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">
                    No transactions matched search criteria.
                  </td>
                </tr>
              ) : (
                txs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#151c2f]/40 transition-colors">
                    {/* Game */}
                    <td className="py-3.5 px-4">
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
                        <span className="font-semibold text-white text-xs">{tx.package?.game?.name || "Unknown"}</span>
                      </div>
                    </td>

                    {/* Package */}
                    <td className="py-3.5 px-4 text-xs font-semibold text-gray-300">
                      {tx.package?.name || "Denomination Pack"}
                    </td>

                    {/* Player Info */}
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 font-bold text-brand-cyan text-xs">
                      ${tx.totalAmount.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
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

                    {/* References */}
                    <td className="py-3.5 px-4">
                      <div className="text-[10px] space-y-0.5 font-mono text-gray-400 leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600 font-bold text-[9px] uppercase">ID:</span>
                          <span className="text-gray-300 select-all">{tx.id}</span>
                        </div>
                        {tx.paymentRef && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600 font-bold text-[9px] uppercase">PayRef:</span>
                            <span className="text-brand-cyan select-all">{tx.paymentRef}</span>
                          </div>
                        )}
                        {tx.providerRef && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600 font-bold text-[9px] uppercase">ProvRef:</span>
                            <span className="text-brand-purple select-all">{tx.providerRef}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[10px] text-gray-400 font-medium whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                        <span className="text-gray-600 font-mono">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {tx.status === "PENDING" || tx.status === "PROCESSING" || tx.status === "FAILED" ? (
                        <button
                          onClick={() => setOverridingId(tx.id)}
                          className="px-2.5 py-1 bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-[#080b11] border border-brand-cyan/20 hover:border-transparent text-xs font-bold rounded-lg cursor-pointer transition-all"
                        >
                          Manual Complete
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500 font-bold px-2.5">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#1d2438] mt-6 pt-4 gap-4 text-xs font-semibold text-gray-400">
            <div>
              Showing <span className="text-white">{(page - 1) * limit + 1}</span> to{" "}
              <span className="text-white">{Math.min(page * limit, total)}</span> of{" "}
              <span className="text-white">{total}</span> records
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 bg-[#080b11] border border-[#1d2438] hover:border-brand-cyan/30 text-gray-400 hover:text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="bg-[#0c101b] px-3 py-1.5 rounded-lg border border-[#1d2438] text-white">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 bg-[#080b11] border border-[#1d2438] hover:border-brand-cyan/30 text-gray-400 hover:text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Overrides */}
      {overridingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-8 bg-[#111625] border border-red-500/20 rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-yellow-500"></div>

            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertOctagon className="w-8 h-8" />
              <h3 className="text-lg font-black text-white">Manual Status Override</h3>
            </div>

            <p className="text-gray-300 text-xs leading-relaxed mb-6">
              You are about to force mark Transaction <strong className="text-white">#{overridingId}</strong> as <strong>COMPLETED</strong>.
              <br /><br />
              This operation bypasses automated bank checks and forces state updates. Confirm ONLY if you have manually verified the payment on the merchant bank account portal.
            </p>

            <div className="flex justify-end gap-3">
              <button
                disabled={overrideLoading}
                onClick={() => setOverridingId(null)}
                className="px-4 py-2 border border-[#1d2438] hover:bg-[#1d2438] text-gray-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={overrideLoading}
                onClick={() => handleManualComplete(overridingId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-950/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {overrideLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Confirm Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
