"use client";
import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  Building,
  User,
  MapPin,
  Sparkles,
  Ticket,
  Plus,
  Trash2,
  X,
  Globe,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface KhqrSettingsObj {
  id: string;
  accountId: string;
  merchantName: string;
  merchantCity: string;
  smileOneEmail?: string;
  smileOneApiKey?: string;
  smileOneApiUrl?: string;
  uniPinSecret?: string;
  uniPinApiUrl?: string;
  topUpLiveMerchantId?: string;
  topUpLiveApiKey?: string;
  topUpLiveApiUrl?: string;
}

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  maxUses: number;
  useCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"khqr" | "providers" | "promos">("khqr");

  // KHQR settings state
  const [settings, setSettings] = useState<KhqrSettingsObj>({
    id: "",
    accountId: "",
    merchantName: "",
    merchantCity: "",
    smileOneEmail: "",
    smileOneApiKey: "",
    smileOneApiUrl: "",
    uniPinSecret: "",
    uniPinApiUrl: "",
    topUpLiveMerchantId: "",
    topUpLiveApiKey: "",
    topUpLiveApiUrl: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showSmileOneKey, setShowSmileOneKey] = useState(false);
  const [showUniPinKey, setShowUniPinKey] = useState(false);
  const [showTopUpLiveKey, setShowTopUpLiveKey] = useState(false);

  // Promo Codes state
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(10);
  const [newPromoMaxUses, setNewPromoMaxUses] = useState<number>(100);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings");

      if (!res.ok) {
        throw new Error(`Failed to fetch settings: ${res.statusText}`);
      }

      const data = await res.json();
      setSettings({
        id: data.id || "",
        accountId: data.accountId || "",
        merchantName: data.merchantName || "",
        merchantCity: data.merchantCity || "",
        smileOneEmail: data.smileOneEmail || "",
        smileOneApiKey: data.smileOneApiKey || "",
        smileOneApiUrl: data.smileOneApiUrl || "https://api.smileone.com/v1/order",
        uniPinSecret: data.uniPinSecret || "",
        uniPinApiUrl: data.uniPinApiUrl || "https://api.unipin.com/v1/topup",
        topUpLiveMerchantId: data.topUpLiveMerchantId || "",
        topUpLiveApiKey: data.topUpLiveApiKey || "",
        topUpLiveApiUrl: data.topUpLiveApiUrl || "https://api.topuplive.com/v1/order"
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to retrieve configuration settings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPromos = async () => {
    setPromosLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/admin/promos");
      if (!res.ok) {
        throw new Error(`Failed to fetch promo codes: ${res.statusText}`);
      }
      const data = await res.json();
      setPromos(data || []);
    } catch (err: any) {
      console.error(err);
      setPromoError(err.message || "Failed to retrieve active promo codes.");
    } finally {
      setPromosLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "promos") {
      fetchPromos();
    }
  }, [activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to save settings: ${res.statusText}`);
      }

      const updated = await res.json();
      setSettings({
        id: updated.id,
        accountId: updated.accountId,
        merchantName: updated.merchantName,
        merchantCity: updated.merchantCity,
        smileOneEmail: updated.smileOneEmail || "",
        smileOneApiKey: updated.smileOneApiKey || "",
        smileOneApiUrl: updated.smileOneApiUrl || "https://api.smileone.com/v1/order",
        uniPinSecret: updated.uniPinSecret || "",
        uniPinApiUrl: updated.uniPinApiUrl || "https://api.unipin.com/v1/topup",
        topUpLiveMerchantId: updated.topUpLiveMerchantId || "",
        topUpLiveApiKey: updated.topUpLiveApiKey || "",
        topUpLiveApiUrl: updated.topUpLiveApiUrl || "https://api.topuplive.com/v1/order"
      });

      setMessage("System Settings successfully saved! Updates are now globally active across checkout payment paths and reseller top-up routing workflows.");
      
      // Auto-dismiss message after 5s
      setTimeout(() => setMessage(""), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save settings to the database.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoMessage("");
    if (!newPromoCode) {
      setPromoError("Promo code cannot be empty.");
      return;
    }
    if (newPromoDiscount <= 0 || newPromoDiscount > 100) {
      setPromoError("Discount percentage must be between 1 and 100.");
      return;
    }
    if (newPromoMaxUses <= 0) {
      setPromoError("Max uses must be greater than 0.");
      return;
    }

    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: newPromoCode.trim().toUpperCase(),
          discount: newPromoDiscount / 100,
          maxUses: newPromoMaxUses,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create promo code.");
      }

      setPromoMessage(`Promo code '${newPromoCode.trim().toUpperCase()}' created successfully!`);
      setNewPromoCode("");
      setNewPromoDiscount(10);
      setNewPromoMaxUses(100);
      setShowCreateModal(false);
      fetchPromos();
      setTimeout(() => setPromoMessage(""), 5000);
    } catch (err: any) {
      console.error(err);
      setPromoError(err.message || "Failed to create promo code.");
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this promo code? This action is irreversible.")) {
      return;
    }
    setPromoError("");
    setPromoMessage("");
    try {
      const res = await fetch(`/api/admin/promos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete promo code.");
      }

      setPromoMessage("Promo code successfully deleted.");
      fetchPromos();
      setTimeout(() => setPromoMessage(""), 5000);
    } catch (err: any) {
      console.error(err);
      setPromoError(err.message || "Failed to delete promo code.");
    }
  };

  const handleTogglePromo = async (id: string, currentIsActive: boolean) => {
    setPromoError("");
    // Optimistic UI update
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !currentIsActive } : p))
    );
    try {
      const res = await fetch(`/api/admin/promos/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentIsActive }),
      });
      if (!res.ok) {
        throw new Error("Failed to toggle promo status.");
      }
    } catch (err: any) {
      console.error(err);
      // Revert on failure
      setPromos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: currentIsActive } : p))
      );
      setPromoError(err.message || "Failed to update promo status.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium">Fetching bank configs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          {activeTab === "khqr" && "KHQR Credentials"}
          {activeTab === "providers" && "Provider API Settings"}
          {activeTab === "promos" && "Promo Codes Manager"}{" "}
          <Sparkles className="w-6 h-6 text-brand-cyan" />
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {activeTab === "khqr" && "Configure active Bakong merchant information details for payments."}
          {activeTab === "providers" && "Configure credentials and endpoint parameters for Smile One & UniPin APIs."}
          {activeTab === "promos" && "Create, monitor, and delete checkout discount codes."}
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#1d2438] gap-1">
        <button
          onClick={() => setActiveTab("khqr")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === "khqr"
              ? "border-brand-cyan text-brand-cyan bg-brand-cyan/5 rounded-t-xl"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#111625]/30 rounded-t-xl"
          }`}
        >
          <Settings className="w-4 h-4" />
          KHQR Settings
        </button>
        <button
          onClick={() => setActiveTab("providers")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === "providers"
              ? "border-brand-cyan text-brand-cyan bg-brand-cyan/5 rounded-t-xl"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#111625]/30 rounded-t-xl"
          }`}
        >
          <Globe className="w-4 h-4" />
          Provider Settings
        </button>
        <button
          onClick={() => setActiveTab("promos")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === "promos"
              ? "border-brand-cyan text-brand-cyan bg-brand-cyan/5 rounded-t-xl"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#111625]/30 rounded-t-xl"
          }`}
        >
          <Ticket className="w-4 h-4" />
          Promo Codes
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "khqr" && (
        <div className="space-y-6 max-w-2xl">
          {/* Warning/Alert box */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-3 text-sm text-yellow-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Critical Operation Note</h4>
              <p className="text-gray-300 leading-relaxed text-xs">
                Modifying credentials updates parameters embedded in generated payment QR strings instantly. Ensure Account ID is exactly matched to your merchant profile. Any typos will route customer checkout payments incorrectly.
              </p>
            </div>
          </div>

          {/* Success/Error Banner */}
          {message && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex gap-3 text-sm text-green-400">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed text-xs font-semibold">{message}</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-sm text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed text-xs font-semibold">{error}</p>
            </div>
          )}

          {/* Settings Form Card */}
          <form onSubmit={handleSave} className="p-8 rounded-2xl bg-[#111625] border border-[#1d2438] space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-[#1d2438]">
              <Settings className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-base font-bold text-white">Merchant Config parameters</h3>
            </div>

            {/* Bakong Account ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Bakong Account ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={settings.accountId}
                  onChange={(e) => setSettings({ ...settings, accountId: e.target.value })}
                  placeholder="username@aba"
                  className="block w-full pl-10 pr-4 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                />
              </div>
              <p className="text-gray-500 text-[10px] mt-1.5 leading-normal">
                For individual accounts: e.g., <strong>thoeurn_ratha@bkrt</strong> or <strong>099999999@aba</strong>. Do not use account numbers; use the unique user account alias.
              </p>
            </div>

            {/* Merchant Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Merchant Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={25}
                  value={settings.merchantName}
                  onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })}
                  placeholder="e.g. Gamex Cambodia"
                  className="block w-full pl-10 pr-4 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                />
              </div>
              <p className="text-gray-500 text-[10px] mt-1.5 flex items-center justify-between">
                <span>Will display as the store label in banking apps when scanning the QR code.</span>
                <span className={settings.merchantName.length > 22 ? "text-yellow-400" : "text-gray-600"}>
                  {settings.merchantName.length}/25
                </span>
              </p>
            </div>

            {/* Merchant City */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Merchant City
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={settings.merchantCity}
                  onChange={(e) => setSettings({ ...settings, merchantCity: e.target.value })}
                  placeholder="e.g. Phnom Penh"
                  className="block w-full pl-10 pr-4 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                />
              </div>
              <p className="text-gray-500 text-[10px] mt-1.5">
                City of register for individual or business bank setup.
              </p>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 bg-brand-cyan text-[#080b11] font-bold rounded-xl shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-[#080b11] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving changes..." : "Save Credentials"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "providers" && (
        <div className="space-y-6 max-w-2xl">
          {/* Warning/Alert box */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-3 text-sm text-yellow-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Sensitive API Credentials Note</h4>
              <p className="text-gray-300 leading-relaxed text-xs">
                Make sure the API endpoints and keys matches your merchant access dashboard. Leaving credentials blank will automatically keep the clients in fail-safe Sandboxed Simulation (Mock) mode.
              </p>
            </div>
          </div>

          {/* Success/Error Banner */}
          {message && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex gap-3 text-sm text-green-400">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed text-xs font-semibold">{message}</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-sm text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed text-xs font-semibold">{error}</p>
            </div>
          )}

          {/* Providers settings Form Card */}
          <form onSubmit={handleSave} className="p-8 rounded-2xl bg-[#111625] border border-[#1d2438] space-y-8">
            {/* Dummy hidden inputs to intercept browser autofill */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
              <input type="text" name="dummy_username_autofill" tabIndex={-1} autoComplete="off" />
              <input type="password" name="dummy_password_autofill" tabIndex={-1} autoComplete="new-password" />
            </div>

            {/* Smile One Integration */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-[#1d2438]">
                <Globe className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-base font-bold text-white">Smile One API Integration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Smile One API Email
                  </label>
                  <input
                    type="email"
                    value={settings.smileOneEmail || ""}
                    onChange={(e) => setSettings({ ...settings, smileOneEmail: e.target.value })}
                    placeholder="e.g. api@smileone.com"
                    autoComplete="off"
                    className="block w-full px-4 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Smile One API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSmileOneKey ? "text" : "password"}
                      value={settings.smileOneApiKey || ""}
                      onChange={(e) => setSettings({ ...settings, smileOneApiKey: e.target.value })}
                      placeholder="••••••••••••••••"
                      autoComplete="new-password"
                      className="block w-full pl-4 pr-10 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmileOneKey(!showSmileOneKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showSmileOneKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Smile One API URL Endpoint
                </label>
                <input
                  type="text"
                  value={settings.smileOneApiUrl || ""}
                  onChange={(e) => setSettings({ ...settings, smileOneApiUrl: e.target.value })}
                  placeholder="https://api.smileone.com/v1/order"
                  autoComplete="off"
                  className="block w-full px-4 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                />
              </div>
            </div>

            {/* UniPin Integration */}
            <div className="pt-6 border-t border-[#1d2438] space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-[#1d2438]">
                <Globe className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-base font-bold text-white">UniPin API Integration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    UniPin API Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showUniPinKey ? "text" : "password"}
                      value={settings.uniPinSecret || ""}
                      onChange={(e) => setSettings({ ...settings, uniPinSecret: e.target.value })}
                      placeholder="••••••••••••••••"
                      autoComplete="new-password"
                      className="block w-full pl-4 pr-10 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUniPinKey(!showUniPinKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showUniPinKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    UniPin API URL Endpoint
                  </label>
                  <input
                    type="text"
                    value={settings.uniPinApiUrl || ""}
                    onChange={(e) => setSettings({ ...settings, uniPinApiUrl: e.target.value })}
                    placeholder="https://api.unipin.com/v1/topup"
                    autoComplete="off"
                    className="block w-full px-4 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* TopUpLive Integration */}
            <div className="pt-6 border-t border-[#1d2438] space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-[#1d2438]">
                <Globe className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-base font-bold text-white">TopUpLive API Integration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    TopUpLive Merchant ID
                  </label>
                  <input
                    type="text"
                    value={settings.topUpLiveMerchantId || ""}
                    onChange={(e) => setSettings({ ...settings, topUpLiveMerchantId: e.target.value })}
                    placeholder="e.g. 12345"
                    autoComplete="off"
                    className="block w-full px-4 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    TopUpLive API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showTopUpLiveKey ? "text" : "password"}
                      value={settings.topUpLiveApiKey || ""}
                      onChange={(e) => setSettings({ ...settings, topUpLiveApiKey: e.target.value })}
                      placeholder="••••••••••••••••"
                      autoComplete="new-password"
                      className="block w-full pl-4 pr-10 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTopUpLiveKey(!showTopUpLiveKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showTopUpLiveKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  TopUpLive API URL Endpoint
                </label>
                <input
                  type="text"
                  value={settings.topUpLiveApiUrl || ""}
                  onChange={(e) => setSettings({ ...settings, topUpLiveApiUrl: e.target.value })}
                  placeholder="https://api.topuplive.com/v1/order"
                  autoComplete="off"
                  className="block w-full px-4 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 bg-brand-cyan text-[#080b11] font-bold rounded-xl shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-[#080b11] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving changes..." : "Save Provider API"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "promos" && (
        <div className="space-y-6">
          {/* Messages */}
          {promoMessage && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex gap-3 text-sm text-green-400">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed text-xs font-semibold">{promoMessage}</p>
            </div>
          )}

          {promoError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-sm text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed text-xs font-semibold">{promoError}</p>
            </div>
          )}

          {/* Promo list container */}
          <div className="p-6 rounded-2xl bg-[#111625] border border-[#1d2438] shadow-lg shadow-black/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Active Coupons ({promos.length})
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">List of discount codes currently configured on the platform.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-brand-cyan text-[#080b11] font-bold rounded-xl shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Plus className="w-4 h-4" />
                Create Promo Code
              </button>
            </div>

            {promosLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 font-semibold text-sm">
                <div className="w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
                <span>Loading promo codes...</span>
              </div>
            ) : promos.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                No promo codes configured yet. Click "Create Promo Code" to add one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#1d2438] text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Uses (Used/Max)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Active</th>
                      <th className="py-3 px-4">Created At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1d2438]/50">
                    {promos.map((promo) => {
                      const isLimitReached = promo.useCount >= promo.maxUses;
                      const statusLabel = !promo.isActive 
                        ? "Inactive" 
                        : isLimitReached 
                          ? "Limit Reached" 
                          : "Active";
                      
                      return (
                        <tr key={promo.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-brand-cyan" />
                            <span className="tracking-wide">{promo.code}</span>
                          </td>
                          <td className="py-4 px-4 text-brand-cyan font-bold">
                            {(promo.discount * 100).toFixed(0)}%
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-300 font-semibold">
                                {promo.useCount} <span className="text-gray-500">/ {promo.maxUses}</span>
                              </span>
                              <div className="w-24 h-1.5 bg-[#080b11] rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isLimitReached ? "bg-red-500" : "bg-brand-cyan"
                                  }`}
                                  style={{ width: `${Math.min(100, (promo.useCount / promo.maxUses) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                              statusLabel === "Active"
                                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                : statusLabel === "Limit Reached"
                                  ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/10 border border-red-500/20 text-red-400"
                            }`}>
                              {statusLabel}
                            </span>
                          </td>
                          {/* Active Toggle */}
                          <td className="py-4 px-4">
                            <button
                              type="button"
                              onClick={() => handleTogglePromo(promo.id, promo.isActive)}
                              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                                promo.isActive
                                  ? "bg-brand-cyan border-brand-cyan/80"
                                  : "bg-gray-700 border-gray-600"
                              }`}
                              title={promo.isActive ? "Click to disable" : "Click to enable"}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 mt-0.5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                                  promo.isActive ? "translate-x-4" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-400">
                            {new Date(promo.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleDeletePromo(promo.id)}
                              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                              title="Delete Promo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md p-6 bg-[#111625] border border-[#1d2438] rounded-2xl shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#1d2438]">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-brand-cyan" />
                  <h3 className="text-lg font-bold text-white">Create Promo Code</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePromo} className="space-y-4">
                {/* Promo Code Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Promo Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUPER10"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value)}
                    className="block w-full px-4 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold uppercase tracking-wider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Discount (%) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Discount (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={newPromoDiscount}
                        onChange={(e) => setNewPromoDiscount(parseInt(e.target.value) || 0)}
                        className="block w-full pl-4 pr-10 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 font-bold text-sm">
                        %
                      </div>
                    </div>
                  </div>

                  {/* Max Uses */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Max Uses
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newPromoMaxUses}
                      onChange={(e) => setNewPromoMaxUses(parseInt(e.target.value) || 0)}
                      className="block w-full px-4 py-3 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-cyan text-[#080b11] font-bold rounded-xl shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create Code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
