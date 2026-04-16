"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DetailPanel from "@/components/ui/DetailPanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cachedFetch } from "@/lib/clientCache";
import type { Industry } from "@/types/notion";

// ─── Category config ─────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, {
  color: string; bg: string; lightBg: string; borderColor: string;
  icon: React.ReactNode; description: string;
}> = {
  "Finance & Location": {
    color: "#0887a3", bg: "#0ca2c2", lightBg: "#e8f7fa", borderColor: "#b2e3ef",
    description: "Sociétés de leasing, LLD/LCD, financeurs de véhicules",
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  },
  "Mobilité & Livraison": {
    color: "#b45309", bg: "#fea706", lightBg: "#fff7e6", borderColor: "#fdd89a",
    description: "Transport, logistique, livraison du dernier kilomètre",
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  "Terrain & Energie": {
    color: "#15803d", bg: "#22c55e", lightBg: "#f0fdf4", borderColor: "#a7f3c0",
    description: "BTP, services terrain, maintenance infrastructure",
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  },
  "Passagers & Transport": {
    color: "#0e7490", bg: "#06b6d4", lightBg: "#ecfeff", borderColor: "#a5f0fc",
    description: "Transport de passagers, mobilité urbaine et interurbaine",
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1"/><path d="M15 4H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l4-4h4a2 2 0 002-2V6a2 2 0 00-2-2z"/></svg>,
  },
  "Industrie & Défense": {
    color: "#374151", bg: "#6b7280", lightBg: "#f3f4f6", borderColor: "#d1d5db",
    description: "Industries sensibles, sécurité privée, défense",
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  "Santé & Retail": {
    color: "#9f1239", bg: "#f43f5e", lightBg: "#fff1f2", borderColor: "#fecdd3",
    description: "Transport sanitaire, distribution, commerce de détail",
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  },
  "Agri & Collectivités": {
    color: "#166534", bg: "#16a34a", lightBg: "#f0fdf4", borderColor: "#86efac",
    description: "Agriculture, services publics, collectivités territoriales",
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
};

const DEFAULT_CONFIG = {
  color: "#4b5563", bg: "#6b7280", lightBg: "#f9fafb", borderColor: "#e5e7eb",
  description: "Autres secteurs",
  icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/></svg>,
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function IndustriesContent() {
  const [items, setItems] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Industry | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    cachedFetch<Industry[]>("/api/notion/industries")
      .then((data) => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id && items.length > 0) {
      const found = items.find((i) => i.id === id);
      if (found) {
        setSelectedItem(found);
        setPanelOpen(true);
        if (!activeCategory) setActiveCategory(found.typeIndustrie || null);
      }
    } else {
      setPanelOpen(false);
      setSelectedItem(null);
    }
  }, [searchParams, items]);

  const grouped = useMemo(() => {
    const map = new Map<string, Industry[]>();
    items.forEach((item) => {
      const cat = item.typeIndustrie || "Autre";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  const openDetail = (industry: Industry) => {
    setSelectedItem(industry);
    setPanelOpen(true);
    router.push(`/industries?id=${industry.id}`, { scroll: false });
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedItem(null);
    router.push("/industries", { scroll: false });
  };

  const currentIndustries = activeCategory
    ? (grouped.find(([cat]) => cat === activeCategory)?.[1] ?? [])
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <LoadingSpinner label="Chargement des industries..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)]" style={{ background: "#f8f9fb" }}>

      {/* ── Level 1 : Categories ──────────────────────────────────────────── */}
      {!activeCategory && (
        <div className="px-10 py-10">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900">Industries cibles</h1>
            <p className="text-sm text-gray-400 mt-1">
              {grouped.length} catégories · {items.length} industries
            </p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {grouped.map(([category, industries]) => {
              const cfg = CATEGORY_CONFIG[category] ?? DEFAULT_CONFIG;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className="text-left rounded-2xl border overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    background: "white",
                    borderColor: cfg.borderColor,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Colored top strip */}
                  <div
                    className="px-5 py-5 flex items-start gap-4"
                    style={{ background: cfg.lightBg }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: cfg.bg, color: "white" }}
                    >
                      {cfg.icon}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-base text-gray-900 leading-tight">{category}</h2>
                      <p className="text-xs mt-1 leading-relaxed text-gray-500">{cfg.description}</p>
                    </div>
                  </div>

                  {/* Count + arrow */}
                  <div className="px-5 py-3 flex items-center justify-between bg-white">
                    <div className="flex gap-1.5 flex-wrap">
                      {industries.slice(0, 3).map((ind) => (
                        <span
                          key={ind.id}
                          className="text-xs px-2 py-0.5 rounded-md font-medium"
                          style={{ background: cfg.lightBg, color: cfg.color }}
                        >
                          {ind.name.length > 20 ? ind.name.slice(0, 18) + "…" : ind.name}
                        </span>
                      ))}
                      {industries.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 font-medium">
                          +{industries.length - 3}
                        </span>
                      )}
                    </div>
                    <svg className="w-4 h-4 ml-2 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: cfg.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Level 2 : Industries of a category ───────────────────────────── */}
      {activeCategory && (
        <div className="px-10 py-10">
          {/* Back + header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => { setActiveCategory(null); closePanel(); }}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Retour
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <div>
              {(() => {
                const cfg = CATEGORY_CONFIG[activeCategory] ?? DEFAULT_CONFIG;
                return (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: cfg.bg, color: "white" }}
                    >
                      <span className="scale-75">{cfg.icon}</span>
                    </span>
                    <h1 className="text-xl font-bold text-gray-900">{activeCategory}</h1>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: (CATEGORY_CONFIG[activeCategory] ?? DEFAULT_CONFIG).lightBg, color: (CATEGORY_CONFIG[activeCategory] ?? DEFAULT_CONFIG).color }}
                    >
                      {currentIndustries.length}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Industry cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentIndustries.map((industry) => {
              const cfg = CATEGORY_CONFIG[activeCategory] ?? DEFAULT_CONFIG;
              const isSelected = selectedItem?.id === industry.id;
              return (
                <button
                  key={industry.id}
                  onClick={() => openDetail(industry)}
                  className="text-left rounded-xl border bg-white p-5 group transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    borderColor: isSelected ? cfg.bg : "#e5e7eb",
                    boxShadow: isSelected
                      ? `0 0 0 2px ${cfg.bg}30, 0 2px 8px rgba(0,0,0,0.06)`
                      : "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 leading-snug">{industry.name}</p>
                      {industry.description && (
                        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
                          {industry.description}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-4 h-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5"
                      style={{ color: cfg.color }}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    >
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>

                  {industry.typeFlotte && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {industry.typeFlotte.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded-md font-medium"
                          style={{ background: cfg.lightBg, color: cfg.color }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Slide-in detail panel ────────────────────────────────────────── */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto pointer-events-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between z-10">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Fiche industrie</p>
              <button
                onClick={closePanel}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            {selectedItem && (
              <DetailPanel
                name={selectedItem.name}
                badge={selectedItem.typeIndustrie}
                fields={[
                  { label: "Description", value: selectedItem.description, display: "description" },
                  { label: "Type de flotte", value: selectedItem.typeFlotte, display: "list" },
                  { label: "Opérations terrain", value: selectedItem.operationsTerrain, display: "bullets" },
                ]}
                relations={[
                  { label: "Pain points", relations: selectedItem.painPoints, targetTab: "painpoints" },
                ]}
              />
            )}
          </div>
          </div>
        </>
      )}
    </div>
  );
}
