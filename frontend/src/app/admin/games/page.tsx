"use client";

import React, { useState, useEffect } from "react";
import { 
  Gamepad2, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Diamond, 
  DollarSign, 
  Tag, 
  Check, 
  X,
  AlertTriangle,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

interface Package {
  id: string;
  gameId: string;
  name: string;
  amount: number;
  price: number;
  originalPrice: number;
  bestValue: boolean;
  providerSku: string;
}

interface Game {
  id: string;
  slug: string;
  name: string;
  iconUrl: string;
  bannerUrl: string | null;
  inputConfig: any;
  isActive: boolean;
  isHot: boolean;
  packages: Package[];
}

export default function AdminGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Expander state for packages list
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  // Modals state
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null); // null means adding a new game
  const [gameForm, setGameForm] = useState({
    name: "",
    slug: "",
    iconUrl: "",
    bannerUrl: "",
    requireZoneId: false,
    isActive: true,
    isHot: false
  });

  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null); // null means adding a new package
  const [targetGameId, setTargetGameId] = useState<string>("");
  const [pkgForm, setPkgForm] = useState({
    name: "",
    amount: 100,
    price: 0.99,
    originalPrice: 0.99,
    bestValue: false,
    providerSku: "SKU-DEFAULT"
  });

  // Deletions warning
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  const [deletingPkgId, setDeletingPkgId] = useState<string | null>(null);

  // Uploading states
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "iconUrl" | "bannerUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "iconUrl") setUploadingIcon(true);
    else setUploadingBanner(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Str = reader.result as string;

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: file.name,
            data: base64Str
          })
        });

        if (!res.ok) {
          throw new Error("Failed to upload image.");
        }

        const data = await res.json();
        setGameForm(prev => ({
          ...prev,
          [field]: data.url
        }));
        showToast("Image uploaded successfully!");
      };
      reader.onerror = () => {
        throw new Error("Failed to read image file.");
      };
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Image upload failed.");
    } finally {
      if (field === "iconUrl") setUploadingIcon(false);
      else setUploadingBanner(false);
    }
  };

  const fetchGames = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/games");

      if (!res.ok) {
        throw new Error(`Failed to load games: ${res.statusText}`);
      }

      const data = await res.json();
      setGames(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to retrieve game database catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // Show Toast Message
  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  // --- Game CRUD Handlers ---

  const openGameModal = (game: Game | null = null) => {
    if (game) {
      setSelectedGame(game);
      // Determine zoneId state from JSON config
      const hasZoneId = game.inputConfig && game.inputConfig.zoneId !== undefined;
      setGameForm({
        name: game.name,
        slug: game.slug,
        iconUrl: game.iconUrl,
        bannerUrl: game.bannerUrl || "",
        requireZoneId: hasZoneId,
        isActive: game.isActive,
        isHot: game.isHot || false
      });
    } else {
      setSelectedGame(null);
      setGameForm({
        name: "",
        slug: "",
        iconUrl: "",
        bannerUrl: "",
        requireZoneId: false,
        isActive: true,
        isHot: false
      });
    }
    setGameModalOpen(true);
  };

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      name: gameForm.name,
      slug: gameForm.slug,
      iconUrl: gameForm.iconUrl,
      bannerUrl: gameForm.bannerUrl || null,
      isActive: gameForm.isActive,
      isHot: gameForm.isHot,
      inputConfig: gameForm.requireZoneId 
        ? { playerId: "string", zoneId: "string" } 
        : { playerId: "string" }
    };

    try {
      let res;
      if (selectedGame) {
        // Edit Game
        res = await fetch(`/api/admin/games/${selectedGame.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create Game
        res = await fetch("/api/admin/games", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Save game rejected.");
      }

      showToast(selectedGame ? "Game modified successfully." : "New game successfully added!");
      setGameModalOpen(false);
      fetchGames();
    } catch (err: any) {
      setError(err.message || "Failed to process game database update.");
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    setError("");
    try {
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete game from DB.");
      }

      showToast("Game deleted successfully along with all nested packages.");
      setDeletingGameId(null);
      fetchGames();
    } catch (err: any) {
      setError(err.message || "Game deletion failed.");
    }
  };

  // --- Package CRUD Handlers ---

  const openPkgModal = (gameId: string, pkg: Package | null = null) => {
    setTargetGameId(gameId);
    if (pkg) {
      setSelectedPkg(pkg);
      setPkgForm({
        name: pkg.name,
        amount: pkg.amount,
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        bestValue: pkg.bestValue,
        providerSku: pkg.providerSku
      });
    } else {
      setSelectedPkg(null);
      setPkgForm({
        name: "",
        amount: 100,
        price: 0.99,
        originalPrice: 0.99,
        bestValue: false,
        providerSku: "SKU-DEFAULT"
      });
    }
    setPkgModalOpen(true);
  };

  const handlePkgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      gameId: targetGameId,
      name: pkgForm.name,
      amount: Number(pkgForm.amount),
      price: Number(pkgForm.price),
      originalPrice: Number(pkgForm.originalPrice),
      bestValue: pkgForm.bestValue,
      providerSku: pkgForm.providerSku
    };

    try {
      let res;
      if (selectedPkg) {
        // Edit Package
        res = await fetch(`/api/admin/packages/${selectedPkg.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create Package
        res = await fetch("/api/admin/packages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Save package rejected.");
      }

      showToast(selectedPkg ? "Package pricing updated." : "Package successfully added to game catalog.");
      setPkgModalOpen(false);
      fetchGames();
    } catch (err: any) {
      setError(err.message || "Failed to process package database update.");
    }
  };

  const handleDeletePkg = async (pkgId: string) => {
    setError("");
    try {
      const res = await fetch(`/api/admin/packages/${pkgId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete package from DB.");
      }

      showToast("Package denomination deleted successfully.");
      setDeletingPkgId(null);
      fetchGames();
    } catch (err: any) {
      setError(err.message || "Package deletion failed.");
    }
  };

  const toggleExpandGame = (gameId: string) => {
    setExpandedGameId(expandedGameId === gameId ? null : gameId);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Games Catalog <Sparkles className="w-5 h-5 text-brand-cyan" />
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage game metadata fields and package diamond pricing details.</p>
        </div>
        <button
          onClick={() => openGameModal(null)}
          className="self-start sm:self-center px-4 py-2.5 bg-brand-cyan text-[#080b11] font-bold rounded-xl shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer text-xs font-black uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" /> Add New Game
        </button>
      </div>

      {/* Message and Error Toasts */}
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

      {/* Main catalog layout */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 text-sm font-semibold gap-2">
            <div className="w-5 h-5 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
            <span>Loading games database...</span>
          </div>
        ) : games.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#111625] border border-[#1d2438] text-gray-500 text-sm font-medium">
            No games registered. Click "Add New Game" above to populate catalog.
          </div>
        ) : (
          games.map((game) => {
            const isExpanded = expandedGameId === game.id;
            return (
              <div 
                key={game.id} 
                className={`rounded-2xl border transition-all ${
                  isExpanded ? "bg-[#111625]/70 border-brand-cyan/25" : "bg-[#111625] border-[#1d2438]"
                }`}
              >
                {/* Game Header Row */}
                <div 
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  onClick={() => toggleExpandGame(game.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={game.iconUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-[#1d2438] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-base leading-tight truncate">{game.name}</h3>
                        <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded border ${
                          game.isActive 
                            ? "bg-green-500/10 text-green-400 border-green-500/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {game.isActive ? "Active" : "Disabled"}
                        </span>
                        {game.isHot && (
                          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded border bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-400 border-pink-500/20">
                            🔥 Hot
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs font-mono mt-1">/{game.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Extra indicators */}
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-400 bg-[#080b11] px-2.5 py-1 rounded-lg border border-[#1d2438]">
                      <Layers className="w-3.5 h-3.5 text-brand-purple" />
                      {game.packages.length} Packs
                    </span>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openGameModal(game)}
                        className="p-2 bg-[#1c2235] hover:bg-brand-cyan/15 text-gray-400 hover:text-brand-cyan border border-[#2d3652] rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingGameId(game.id)}
                        className="p-2 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 border border-red-500/10 hover:border-red-500/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-gray-500">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Game Packages Panel (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-[#1d2438] p-5 bg-[#0a0d17]/50 rounded-b-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Info className="w-3.5 h-3.5 text-brand-cyan/70" />
                        <span>Denominations & Packages catalog</span>
                      </div>
                      <button
                        onClick={() => openPkgModal(game.id, null)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-brand-cyan/15 hover:bg-brand-cyan border border-brand-cyan/20 hover:border-transparent text-brand-cyan hover:text-[#080b11] text-xs font-bold rounded-lg cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Package
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-[#1d2438]/60 rounded-xl bg-[#111625]/50">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#1d2438] text-gray-400 font-semibold uppercase tracking-wider bg-[#080b11]/30">
                            <th className="py-2.5 px-4">Package Title</th>
                            <th className="py-2.5 px-4">Diamonds / Credits</th>
                            <th className="py-2.5 px-4">Sales Price</th>
                            <th className="py-2.5 px-4">Original (Strike)</th>
                            <th className="py-2.5 px-4">Provider SKU</th>
                            <th className="py-2.5 px-4">Tag</th>
                            <th className="py-2.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1d2438]/50">
                          {game.packages.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 px-4 text-center text-gray-500 font-medium">
                                No prices configured. Click "Add Package" above to populate catalog.
                              </td>
                            </tr>
                          ) : (
                            game.packages.map((pkg) => (
                              <tr key={pkg.id} className="hover:bg-[#151c2f]/30">
                                <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                                  <Diamond className="w-3.5 h-3.5 text-brand-cyan/80" />
                                  {pkg.name}
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-gray-300">
                                  {pkg.amount.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 font-bold text-brand-cyan">
                                  ${pkg.price.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 font-semibold text-gray-500 line-through">
                                  ${pkg.originalPrice.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 font-mono text-gray-400">
                                  {pkg.providerSku}
                                </td>
                                <td className="py-3 px-4">
                                  {pkg.bestValue && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[9px] font-bold uppercase rounded">
                                      <Tag className="w-2.5 h-2.5" /> Best
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      onClick={() => openPkgModal(game.id, pkg)}
                                      className="p-1.5 hover:bg-[#1c2235] text-gray-500 hover:text-white rounded transition-colors cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setDeletingPkgId(pkg.id)}
                                      className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* GAME MODAL (ADD/EDIT) */}
      {gameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleGameSubmit}
            className="w-full max-w-lg p-8 bg-[#111625] border border-[#1d2438] rounded-2xl shadow-2xl relative space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1d2438]">
              <div className="flex items-center gap-2 text-brand-cyan">
                <Gamepad2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  {selectedGame ? "Edit Game metadata" : "Add New Game"}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setGameModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Game Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Game Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Fire"
                  value={gameForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Auto-slugify on create
                    setGameForm({
                      ...gameForm,
                      name: val,
                      slug: selectedGame ? gameForm.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                    });
                  }}
                  className="block w-full px-4 py-2.5 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Slug URL identifier */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Slug URL Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. free-fire"
                  value={gameForm.slug}
                  onChange={(e) => setGameForm({ ...gameForm, slug: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            {/* Icon Image URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Icon Image URL / File Upload
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="/images/games/free-fire.jpg or web url"
                  value={gameForm.iconUrl}
                  onChange={(e) => setGameForm({ ...gameForm, iconUrl: e.target.value })}
                  className="block flex-1 px-4 py-2.5 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white text-sm focus:outline-none focus:border-brand-cyan"
                />
                <label className="px-4 py-2.5 bg-[#1c2235] hover:bg-brand-cyan/20 border border-[#2d3652] hover:border-brand-cyan/35 text-xs text-brand-cyan hover:text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 min-w-[100px]">
                  {uploadingIcon ? (
                    <span className="w-4 h-4 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Upload File"
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "iconUrl")}
                    className="hidden"
                    disabled={uploadingIcon}
                  />
                </label>
              </div>
            </div>

            {/* Banner Image URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Banner Image URL / File Upload (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="/images/banners/free-fire.jpg"
                  value={gameForm.bannerUrl}
                  onChange={(e) => setGameForm({ ...gameForm, bannerUrl: e.target.value })}
                  className="block flex-1 px-4 py-2.5 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white text-sm focus:outline-none focus:border-brand-cyan"
                />
                <label className="px-4 py-2.5 bg-[#1c2235] hover:bg-brand-cyan/20 border border-[#2d3652] hover:border-brand-cyan/35 text-xs text-brand-cyan hover:text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 min-w-[100px]">
                  {uploadingBanner ? (
                    <span className="w-4 h-4 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Upload File"
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "bannerUrl")}
                    className="hidden"
                    disabled={uploadingBanner}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Requires Zone ID check */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
                <input
                  type="checkbox"
                  checked={gameForm.requireZoneId}
                  onChange={(e) => setGameForm({ ...gameForm, requireZoneId: e.target.checked })}
                  className="w-4 h-4 accent-brand-cyan rounded border-[#1d2438] cursor-pointer"
                />
                <span>Requires Zone ID</span>
              </label>

              {/* Status active check */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
                <input
                  type="checkbox"
                  checked={gameForm.isActive}
                  onChange={(e) => setGameForm({ ...gameForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-brand-cyan rounded border-[#1d2438] cursor-pointer"
                />
                <span>Publish Active</span>
              </label>

              {/* Hot badge check */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
                <input
                  type="checkbox"
                  checked={gameForm.isHot}
                  onChange={(e) => setGameForm({ ...gameForm, isHot: e.target.checked })}
                  className="w-4 h-4 accent-brand-cyan rounded border-[#1d2438] cursor-pointer"
                />
                <span>Mark as Hot 🔥</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#1d2438]">
              <button
                type="button"
                onClick={() => setGameModalOpen(false)}
                className="px-4 py-2 border border-[#1d2438] hover:bg-[#1d2438] text-gray-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-cyan text-[#080b11] font-bold rounded-xl text-xs transition-all shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 hover:scale-[1.02] cursor-pointer"
              >
                {selectedGame ? "Save Game" : "Create Game"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PACKAGE MODAL (ADD/EDIT) */}
      {pkgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form 
            onSubmit={handlePkgSubmit}
            className="w-full max-w-md p-8 bg-[#111625] border border-[#1d2438] rounded-2xl shadow-2xl relative space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1d2438]">
              <div className="flex items-center gap-2 text-brand-purple">
                <Diamond className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  {selectedPkg ? "Edit package pricing" : "Add Package Denomination"}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPkgModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Package title */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Package Name / Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 100 Diamonds"
                value={pkgForm.name}
                onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                className="block w-full px-4 py-2.5 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white text-sm focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount of credits */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Credits (Numerical)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="100"
                  value={pkgForm.amount}
                  onChange={(e) => setPkgForm({ ...pkgForm, amount: parseInt(e.target.value) || 0 })}
                  className="block w-full px-4 py-2.5 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-brand-purple"
                />
              </div>

              {/* External SKU code */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Provider SKU SKU
                </label>
                <input
                  type="text"
                  required
                  placeholder="SKU-100-DIA"
                  value={pkgForm.providerSku}
                  onChange={(e) => setPkgForm({ ...pkgForm, providerSku: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Sales price */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Price (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0.01}
                    placeholder="0.99"
                    value={pkgForm.price}
                    onChange={(e) => setPkgForm({ ...pkgForm, price: parseFloat(e.target.value) || 0 })}
                    className="block w-full pl-8 pr-4 py-2.5 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              {/* Original strike price */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Original Price (strike)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0.01}
                    placeholder="1.49"
                    value={pkgForm.originalPrice}
                    onChange={(e) => setPkgForm({ ...pkgForm, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="block w-full pl-8 pr-4 py-2.5 bg-[#080b11]/80 border border-[#1d2438] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>
            </div>

            {/* Best Value indicator */}
            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-300">
              <input
                type="checkbox"
                checked={pkgForm.bestValue}
                onChange={(e) => setPkgForm({ ...pkgForm, bestValue: e.target.checked })}
                className="w-4.5 h-4.5 accent-brand-purple rounded border-[#1d2438] cursor-pointer"
              />
              <span>Mark as Best Value (displays tag on front catalog)</span>
            </label>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#1d2438]">
              <button
                type="button"
                onClick={() => setPkgModalOpen(false)}
                className="px-4 py-2 border border-[#1d2438] hover:bg-[#1d2438] text-gray-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-purple text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-brand-purple/10 hover:shadow-brand-purple/20 hover:scale-[1.02] cursor-pointer"
              >
                {selectedPkg ? "Update Package" : "Create Package"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GAME DELETE WARNING */}
      {deletingGameId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-8 bg-[#111625] border border-red-500/20 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-500"></div>

            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-black text-white">Delete game profile</h3>
            </div>

            <p className="text-gray-300 text-xs leading-relaxed mb-6">
              Are you sure you want to delete this game catalog profile?
              <br /><br />
              <strong className="text-red-400">Warning:</strong> Deleting a game will permanently remove all associated pricing packages and logs. This action is irreversible.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingGameId(null)}
                className="px-4 py-2 border border-[#1d2438] hover:bg-[#1d2438] text-gray-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteGame(deletingGameId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PACKAGE DELETE WARNING */}
      {deletingPkgId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-8 bg-[#111625] border border-red-500/20 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-500"></div>

            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-black text-white">Delete pricing package</h3>
            </div>

            <p className="text-gray-300 text-xs leading-relaxed mb-6">
              Are you sure you want to delete this diamond denomination package? This will immediately remove it from customer checkout pages.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingPkgId(null)}
                className="px-4 py-2 border border-[#1d2438] hover:bg-[#1d2438] text-gray-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePkg(deletingPkgId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
