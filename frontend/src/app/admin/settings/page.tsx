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
  EyeOff,
  ShieldCheck,
  Zap,
  Info,
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

// ─── Reusable Field ───────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-500 leading-relaxed">{hint}</p>}
    </div>
  );
}

// ─── Reusable Input ───────────────────────────────────────────────────────────
function Input({
  icon: Icon,
  suffix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ElementType;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        {...props}
        className={`block w-full py-2.5 bg-[#080c15] border border-[#1e2840] rounded-lg text-sm text-white placeholder-gray-600
          focus:outline-none focus:ring-2 focus:ring-brand-cyan/25 focus:border-brand-cyan/60 transition-all
          ${Icon ? "pl-10" : "pl-3.5"} ${suffix ? "pr-10" : "pr-3.5"}
          ${props.className ?? ""}`}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
          {suffix}
        </div>
      )}
    </div>
  );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────
function AlertBanner({
  type,
  message,
}: {
  type: "success" | "error" | "warning";
  message: string;
}) {
  const styles = {
    success: "bg-green-500/8 border-green-500/20 text-green-400",
    error: "bg-red-500/8 border-red-500/20 text-red-400",
    warning: "bg-amber-500/8 border-amber-500/20 text-amber-400",
  };
  const Icon = type === "success" ? CheckCircle : AlertTriangle;
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs font-medium ${styles[type]}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  icon: Icon,
  accent = "cyan",
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  accent?: "cyan" | "purple" | "amber";
  children: React.ReactNode;
}) {
  const accentMap = {
    cyan: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20",
    purple: "text-brand-purple bg-brand-purple/10 border-brand-purple/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };
  return (
    <div className="rounded-xl bg-[#0e1420] border border-[#1e2840] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e2840]">
        <div className={`p-1.5 rounded-lg border ${accentMap[accent]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Provider Section ─────────────────────────────────────────────────────────
function ProviderSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-[#1e2840]" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
          {title}
        </span>
        <div className="h-px flex-1 bg-[#1e2840]" />
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"khqr" | "providers" | "promos">("khqr");

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
    topUpLiveApiUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showSmileOneKey, setShowSmileOneKey] = useState(false);
  const [showUniPinKey, setShowUniPinKey] = useState(false);
  const [showTopUpLiveKey, setShowTopUpLiveKey] = useState(false);

  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(10);
  const [newPromoMaxUses, setNewPromoMaxUses] = useState<number>(100);
  const [newPromoGameId, setNewPromoGameId] = useState<string>("");
  const [games, setGames] = useState<any[]>([]);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error(`Failed to fetch settings: ${res.statusText}`);
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
        topUpLiveApiUrl: data.topUpLiveApiUrl || "https://api.topuplive.com/v1/order",
      });
    } catch (err: any) {
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
      if (!res.ok) throw new Error(`Failed to fetch promo codes: ${res.statusText}`);
      const data = await res.json();
      setPromos(data || []);
    } catch (err: any) {
      setPromoError(err.message || "Failed to retrieve active promo codes.");
    } finally {
      setPromosLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/admin/games");
      if (!res.ok) throw new Error("Failed to fetch games catalog");
      const data = await res.json();
      setGames(data || []);
    } catch (err) {
      console.error("Failed to load games:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchGames();
  }, []);
  useEffect(() => { if (activeTab === "promos") fetchPromos(); }, [activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        topUpLiveApiUrl: updated.topUpLiveApiUrl || "https://api.topuplive.com/v1/order",
      });
      setMessage("Settings saved successfully.");
      setTimeout(() => setMessage(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings to the database.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoMessage("");
    if (!newPromoCode) { setPromoError("Promo code cannot be empty."); return; }
    if (newPromoDiscount <= 0 || newPromoDiscount > 100) { setPromoError("Discount must be between 1–100%."); return; }
    if (newPromoMaxUses <= 0) { setPromoError("Max uses must be greater than 0."); return; }
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newPromoCode.trim().toUpperCase(),
          discount: newPromoDiscount / 100,
          maxUses: newPromoMaxUses,
          gameId: newPromoGameId || null,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create promo code.");
      }
      setPromoMessage(`Code "${newPromoCode.trim().toUpperCase()}" created successfully.`);
      setNewPromoCode("");
      setNewPromoDiscount(10);
      setNewPromoMaxUses(100);
      setNewPromoGameId("");
      setShowCreateModal(false);
      fetchPromos();
      setTimeout(() => setPromoMessage(""), 5000);
    } catch (err: any) {
      setPromoError(err.message || "Failed to create promo code.");
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!window.confirm("Delete this promo code? This cannot be undone.")) return;
    setPromoError("");
    setPromoMessage("");
    try {
      const res = await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete promo code.");
      setPromoMessage("Promo code deleted.");
      fetchPromos();
      setTimeout(() => setPromoMessage(""), 5000);
    } catch (err: any) {
      setPromoError(err.message || "Failed to delete promo code.");
    }
  };

  const handleTogglePromo = async (id: string, currentIsActive: boolean) => {
    setPromoError("");
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !currentIsActive } : p)));
    try {
      const res = await fetch(`/api/admin/promos/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentIsActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle promo status.");
    } catch (err: any) {
      setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: currentIsActive } : p)));
      setPromoError(err.message || "Failed to update promo status.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-9 h-9 border-[3px] border-brand-cyan border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Loading configuration...</p>
      </div>
    );
  }

  const tabs = [
    { id: "khqr" as const, label: "KHQR Merchant", icon: ShieldCheck },
    { id: "providers" as const, label: "API Providers", icon: Zap },
    { id: "promos" as const, label: "Promo Codes", icon: Ticket },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            System Settings
            <Sparkles className="w-5 h-5 text-brand-cyan" />
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage payment credentials, API integrations, and promotional codes.
          </p>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-[#0c1119] border border-[#1e2840] rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === id
                ? "bg-brand-cyan text-[#080b11] shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── KHQR Tab ────────────────────────────────────────────────────────── */}
      {activeTab === "khqr" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Form Column */}
          <div className="xl:col-span-2 space-y-4">
            {message && <AlertBanner type="success" message={message} />}
            {error && <AlertBanner type="error" message={error} />}

            <form onSubmit={handleSave}>
              <SectionCard title="Bakong Merchant Config" subtitle="Payment QR generation parameters" icon={ShieldCheck}>
                <div className="space-y-5">
                  <Field
                    label="Bakong Account ID"
                    hint={<>Format: <strong className="text-gray-400">username@bank</strong> (e.g. thoeurn@aba or 099999999@bkrt)</>}
                  >
                    <Input
                      icon={User}
                      type="text"
                      required
                      value={settings.accountId}
                      onChange={(e) => setSettings({ ...settings, accountId: e.target.value })}
                      placeholder="username@aba"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field
                      label="Merchant Name"
                      hint={
                        <span className="flex items-center justify-between">
                          <span>Shown in banking apps on QR scan</span>
                          <span className={settings.merchantName.length > 22 ? "text-amber-400" : "text-gray-600"}>
                            {settings.merchantName.length}/25
                          </span>
                        </span>
                      }
                    >
                      <Input
                        icon={Building}
                        type="text"
                        required
                        maxLength={25}
                        value={settings.merchantName}
                        onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })}
                        placeholder="e.g. Gamex Cambodia"
                      />
                    </Field>

                    <Field label="Merchant City" hint="City of merchant bank registration">
                      <Input
                        icon={MapPin}
                        type="text"
                        required
                        value={settings.merchantCity}
                        onChange={(e) => setSettings({ ...settings, merchantCity: e.target.value })}
                        placeholder="e.g. Phnom Penh"
                      />
                    </Field>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-cyan text-[#080b11] font-bold rounded-lg text-sm
                        hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      {saving ? (
                        <span className="w-4 h-4 border-2 border-[#080b11] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? "Saving..." : "Save Credentials"}
                    </button>
                  </div>
                </div>
              </SectionCard>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <SectionCard title="Important Note" icon={AlertTriangle} accent="amber">
              <p className="text-xs text-gray-400 leading-relaxed">
                Modifying these credentials immediately affects all generated payment QR codes.
                Ensure the Account ID exactly matches your merchant profile — any mismatch will
                route payments incorrectly.
              </p>
            </SectionCard>

            <div className="rounded-xl bg-[#0e1420] border border-[#1e2840] p-4 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Reference</p>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-brand-cyan mt-0.5 shrink-0" />
                  <span>ABA: <code className="text-gray-300">name@aba</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-brand-cyan mt-0.5 shrink-0" />
                  <span>BKRT: <code className="text-gray-300">name@bkrt</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-brand-cyan mt-0.5 shrink-0" />
                  <span>Wing: <code className="text-gray-300">phone@wing</code></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Providers Tab ────────────────────────────────────────────────────── */}
      {activeTab === "providers" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-4">
            {message && <AlertBanner type="success" message={message} />}
            {error && <AlertBanner type="error" message={error} />}

            <form onSubmit={handleSave}>
              {/* Hidden anti-autofill */}
              <div style={{ position: "absolute", top: "-9999px", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }} aria-hidden="true">
                <input type="text" name="dummy_username_autofill" tabIndex={-1} autoComplete="off" />
                <input type="password" name="dummy_password_autofill" tabIndex={-1} autoComplete="new-password" />
              </div>

              <SectionCard title="Third-Party API Credentials" subtitle="Configure top-up provider integrations" icon={Zap}>
                <div className="space-y-8">
                  {/* Smile One */}
                  <ProviderSection title="Smile One">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="API Email">
                        <Input
                          type="email"
                          value={settings.smileOneEmail || ""}
                          onChange={(e) => setSettings({ ...settings, smileOneEmail: e.target.value })}
                          placeholder="api@smileone.com"
                          autoComplete="off"
                        />
                      </Field>
                      <Field label="API Key">
                        <Input
                          type={showSmileOneKey ? "text" : "password"}
                          value={settings.smileOneApiKey || ""}
                          onChange={(e) => setSettings({ ...settings, smileOneApiKey: e.target.value })}
                          placeholder="••••••••••••••••"
                          autoComplete="new-password"
                          suffix={
                            <button type="button" onClick={() => setShowSmileOneKey(!showSmileOneKey)} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                              {showSmileOneKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                        />
                      </Field>
                    </div>
                    <Field label="API URL Endpoint">
                      <Input
                        type="text"
                        value={settings.smileOneApiUrl || ""}
                        onChange={(e) => setSettings({ ...settings, smileOneApiUrl: e.target.value })}
                        placeholder="https://api.smileone.com/v1/order"
                        autoComplete="off"
                      />
                    </Field>
                  </ProviderSection>

                  {/* UniPin */}
                  <ProviderSection title="UniPin">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="API Secret Key">
                        <Input
                          type={showUniPinKey ? "text" : "password"}
                          value={settings.uniPinSecret || ""}
                          onChange={(e) => setSettings({ ...settings, uniPinSecret: e.target.value })}
                          placeholder="••••••••••••••••"
                          autoComplete="new-password"
                          suffix={
                            <button type="button" onClick={() => setShowUniPinKey(!showUniPinKey)} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                              {showUniPinKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                        />
                      </Field>
                      <Field label="API URL Endpoint">
                        <Input
                          type="text"
                          value={settings.uniPinApiUrl || ""}
                          onChange={(e) => setSettings({ ...settings, uniPinApiUrl: e.target.value })}
                          placeholder="https://api.unipin.com/v1/topup"
                          autoComplete="off"
                        />
                      </Field>
                    </div>
                  </ProviderSection>

                  {/* TopUpLive */}
                  <ProviderSection title="TopUpLive">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Merchant ID">
                        <Input
                          type="text"
                          value={settings.topUpLiveMerchantId || ""}
                          onChange={(e) => setSettings({ ...settings, topUpLiveMerchantId: e.target.value })}
                          placeholder="e.g. 12345"
                          autoComplete="off"
                        />
                      </Field>
                      <Field label="API Key">
                        <Input
                          type={showTopUpLiveKey ? "text" : "password"}
                          value={settings.topUpLiveApiKey || ""}
                          onChange={(e) => setSettings({ ...settings, topUpLiveApiKey: e.target.value })}
                          placeholder="••••••••••••••••"
                          autoComplete="new-password"
                          suffix={
                            <button type="button" onClick={() => setShowTopUpLiveKey(!showTopUpLiveKey)} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                              {showTopUpLiveKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                        />
                      </Field>
                    </div>
                    <Field label="API URL Endpoint">
                      <Input
                        type="text"
                        value={settings.topUpLiveApiUrl || ""}
                        onChange={(e) => setSettings({ ...settings, topUpLiveApiUrl: e.target.value })}
                        placeholder="https://api.topuplive.com/v1/order"
                        autoComplete="off"
                      />
                    </Field>
                  </ProviderSection>

                  <div className="pt-2 flex justify-end border-t border-[#1e2840]">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-cyan text-[#080b11] font-bold rounded-lg text-sm
                        hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-4"
                    >
                      {saving ? (
                        <span className="w-4 h-4 border-2 border-[#080b11] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? "Saving..." : "Save API Settings"}
                    </button>
                  </div>
                </div>
              </SectionCard>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <SectionCard title="Sandbox Mode" icon={AlertTriangle} accent="amber">
              <p className="text-xs text-gray-400 leading-relaxed">
                Leaving any provider credentials blank will automatically switch that provider to
                <strong className="text-amber-400"> Simulation (Mock) mode</strong> — no real top-ups
                will be processed.
              </p>
            </SectionCard>

            <div className="rounded-xl bg-[#0e1420] border border-[#1e2840] p-4 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Provider Status</p>
              {[
                { name: "Smile One", active: !!(settings.smileOneApiKey) },
                { name: "UniPin", active: !!(settings.uniPinSecret) },
                { name: "TopUpLive", active: !!(settings.topUpLiveApiKey) },
              ].map(({ name, active }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{name}</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold border ${
                    active
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-gray-500/10 border-gray-500/20 text-gray-500"
                  }`}>
                    {active ? "Configured" : "Mock Mode"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Promo Codes Tab ──────────────────────────────────────────────────── */}
      {activeTab === "promos" && (
        <div className="space-y-4">
          {promoMessage && <AlertBanner type="success" message={promoMessage} />}
          {promoError && <AlertBanner type="error" message={promoError} />}

          <div className="rounded-xl bg-[#0e1420] border border-[#1e2840] overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2840]">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Promo Codes
                    <span className="ml-2 text-xs font-semibold text-gray-500 bg-[#1e2840] px-2 py-0.5 rounded-full">
                      {promos.length}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Manage discount codes for checkout</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-cyan text-[#080b11] font-bold rounded-lg text-xs
                  hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Code
              </button>
            </div>

            {/* Table Body */}
            {promosLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-500 text-sm">
                <div className="w-5 h-5 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : promos.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Ticket className="w-8 h-8 text-gray-700 mx-auto" />
                <p className="text-gray-500 text-sm">No promo codes yet</p>
                <p className="text-gray-600 text-xs">Click "New Code" to create your first discount code</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#1e2840]">
                      {["Code", "Game", "Discount", "Usage", "Status", "Active", "Created", ""].map((h) => (
                        <th key={h} className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2840]/60">
                    {promos.map((promo) => {
                      const isLimitReached = promo.useCount >= promo.maxUses;
                      const statusLabel = !promo.isActive ? "Inactive" : isLimitReached ? "Limit Reached" : "Active";
                      const usagePct = Math.min(100, (promo.useCount / promo.maxUses) * 100);

                      return (
                        <tr key={promo.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Code */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-bold text-white tracking-wider bg-[#1e2840] px-2.5 py-1 rounded-lg">
                                {promo.code}
                              </code>
                            </div>
                          </td>

                          {/* Game */}
                          <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold text-gray-400">
                            {(promo as any).game?.name || "Global"}
                          </td>

                          {/* Discount */}
                          <td className="px-5 py-4">
                            <span className="text-brand-cyan font-bold text-sm">
                              {(promo.discount * 100).toFixed(0)}%
                            </span>
                          </td>

                          {/* Usage */}
                          <td className="px-5 py-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="font-semibold text-gray-300">{promo.useCount}</span>
                                <span className="text-gray-600">/ {promo.maxUses}</span>
                              </div>
                              <div className="w-20 h-1 bg-[#1e2840] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${isLimitReached ? "bg-red-500" : "bg-brand-cyan"}`}
                                  style={{ width: `${usagePct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              statusLabel === "Active"
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : statusLabel === "Limit Reached"
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                : "bg-gray-500/10 border-gray-500/20 text-gray-400"
                            }`}>
                              {statusLabel}
                            </span>
                          </td>

                          {/* Toggle */}
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => handleTogglePromo(promo.id, promo.isActive)}
                              title={promo.isActive ? "Disable" : "Enable"}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ${
                                promo.isActive ? "bg-brand-cyan border-brand-cyan/80" : "bg-[#1e2840] border-[#2a3350]"
                              }`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 mt-[1px] ml-[1px] transform rounded-full bg-white shadow transition-transform duration-200 ${
                                promo.isActive ? "translate-x-4" : "translate-x-0"
                              }`} />
                            </button>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(promo.createdAt).toLocaleDateString(undefined, {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </td>

                          {/* Delete */}
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleDeletePromo(promo.id)}
                              title="Delete"
                              className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* ── Create Promo Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-sm bg-[#0e1420] border border-[#1e2840] rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2840]">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Create Promo Code</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreatePromo} className="p-5 space-y-4">
                {promoError && <AlertBanner type="error" message={promoError} />}

                <Field label="Promo Code">
                  <Input
                    type="text"
                    required
                    placeholder="e.g. SUMMER20"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value)}
                    className="uppercase tracking-widest font-mono"
                  />
                </Field>

                <Field label="Apply to Game">
                  <select
                    value={newPromoGameId}
                    onChange={(e) => setNewPromoGameId(e.target.value)}
                    className="block w-full py-2.5 px-3.5 bg-[#080c15] border border-[#1e2840] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/25 focus:border-brand-cyan/60 transition-all cursor-pointer"
                  >
                    <option value="">Global (All Games)</option>
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Discount (%)">
                    <Input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={newPromoDiscount}
                      onChange={(e) => setNewPromoDiscount(parseInt(e.target.value) || 0)}
                      suffix={<span className="text-gray-500 text-sm font-bold pointer-events-none">%</span>}
                    />
                  </Field>
                  <Field label="Max Uses">
                    <Input
                      type="number"
                      required
                      min="1"
                      value={newPromoMaxUses}
                      onChange={(e) => setNewPromoMaxUses(parseInt(e.target.value) || 0)}
                    />
                  </Field>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-cyan text-[#080b11] font-bold rounded-lg text-sm
                      hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create
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
