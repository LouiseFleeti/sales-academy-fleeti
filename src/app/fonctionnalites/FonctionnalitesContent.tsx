"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DetailPanel from "@/components/ui/DetailPanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cachedFetch } from "@/lib/clientCache";
import type { Fonctionnalite } from "@/types/notion";

const CARD_COLORS = [
  { bg: "#ede9fe", border: "#ddd6fe", accent: "#8b5cf6", text: "#5b21b6" },
  { bg: "#E8F2FD", border: "#9CC3F0", accent: "#3979C1", text: "#224873" },
  { bg: "#f0fdf4", border: "#a7f3c0", accent: "#22c55e", text: "#15803d" },
  { bg: "#FFF0D6", border: "#f5c97a", accent: "#C9820A", text: "#7A4A00" },
  { bg: "#ecfeff", border: "#a5f0fc", accent: "#06b6d4", text: "#0e7490" },
  { bg: "#fff1f2", border: "#fecdd3", accent: "#f43f5e", text: "#9f1239" },
];

export default function FonctionnalitesContent() {
  const [items, setItems] = useState<Fonctionnalite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Fonctionnalite | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    cachedFetch<Fonctionnalite[]>("/api/notion/fonctionnalites")
      .then((data) => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id && items.length > 0) {
      const found = items.find((i) => i.id === id);
      if (found) { setSelectedItem(found); setPanelOpen(true); }
    } else {
      setPanelOpen(false);
      setSelectedItem(null);
    }
  }, [searchParams, items]);

  const grouped = useMemo(() => {
    const map = new Map<string, Fonctionnalite[]>();
    items.forEach((item) => {
      const cat = item.categorie || "Autre";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  const openDetail = (item: Fonctionnalite) => {
    setSelectedItem(item);
    setPanelOpen(true);
    router.push(`/fonctionnalites?id=${item.id}`, { scroll: false });
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedItem(null);
    router.push("/fonctionnalites", { scroll: false });
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return activeCategory ? (grouped.find(([c]) => c === activeCategory)?.[1] ?? []) : items;
    const q = search.toLowerCase();
    return items.filter((f) =>
      f.name.toLowerCase().includes(q) ||
      (f.descriptionTerrain || "").toLowerCase().includes(q) ||
      (f.categorie || "").toLowerCase().includes(q)
    );
  }, [items, search, activeCategory, grouped]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <LoadingSpinner label="Chargement des fonctionnalités..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)]" style={{ background: "#f8f9fb" }}>
      <div className="px-10 py-10">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Fonctionnalités / Modules</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">Le détail des features et modules de la plateforme, par catégorie — pour répondre aux questions techniques en démo ou en avant-vente.</p>
            <p className="text-xs text-gray-400 mt-1">{items.length} fonctionnalité{items.length > 1 ? "s" : ""}</p>
          </div>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Toutes les catégories
            </button>
          )}
        </div>

        <div className="mb-6 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
            placeholder="Rechercher parmi les fonctionnalités..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#3979C1] focus:ring-1 focus:ring-[#3979C1]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Catégories */}
        {!search.trim() && !activeCategory && (
          <div className="flex flex-wrap gap-2 mb-6">
            {grouped.map(([cat, foncs], i) => {
              const color = CARD_COLORS[i % CARD_COLORS.length];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:shadow-sm"
                  style={{ background: color.bg, borderColor: color.border, color: color.text }}
                >
                  {cat}
                  <span className="px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ background: color.accent, color: "white" }}>
                    {foncs.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item, i) => {
            const catIdx = grouped.findIndex(([c]) => c === (item.categorie || "Autre"));
            const color = CARD_COLORS[(catIdx >= 0 ? catIdx : i) % CARD_COLORS.length];
            const isSelected = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => openDetail(item)}
                className="text-left rounded-2xl border bg-white overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: isSelected ? color.accent : color.border,
                  boxShadow: isSelected
                    ? `0 0 0 2px ${color.accent}30, 0 2px 8px rgba(0,0,0,0.06)`
                    : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div className="px-5 py-4 flex items-start gap-3" style={{ background: color.bg }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: color.accent }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-bold text-sm text-gray-900 leading-snug">{item.name}</h2>
                      {item.type && (
                        <span className="text-xs px-2 py-0.5 rounded-md font-medium shrink-0" style={{ background: color.accent + "20", color: color.text }}>
                          {item.type}
                        </span>
                      )}
                    </div>
                    {item.descriptionTerrain && (
                      <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: color.text }}>
                        {item.descriptionTerrain}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-5 py-3 bg-white flex items-center justify-between gap-2">
                  <div className="flex gap-1.5 flex-wrap min-w-0">
                    {item.categorie && (
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]" style={{ background: color.bg, color: color.text }}>
                        {item.categorie}
                      </span>
                    )}
                  </div>
                  <svg className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: color.text }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {panelOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
          <div className="fixed top-14 inset-x-0 bottom-0 z-50 bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={closePanel} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  Retour
                </button>
                <div className="h-4 w-px bg-gray-200 shrink-0" />
                <nav className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0 truncate">
                  <span className="shrink-0">Fonctionnalités</span>
                  <span className="shrink-0">/</span>
                  <span className="font-semibold text-gray-700 truncate">{selectedItem?.name}</span>
                </nav>
              </div>
              <button onClick={closePanel} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0 ml-4">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            {selectedItem && (
              <DetailPanel
                name={selectedItem.name}
                badge={selectedItem.categorie}
                fields={[
                  { label: "Description terrain", value: selectedItem.descriptionTerrain, display: "description" },
                  { label: "Type", value: selectedItem.type, display: "text" },
                ]}
                relations={[
                  { label: "Solutions associées", relations: selectedItem.solutionsAssociees, targetTab: "solutions" },
                  { label: "Capacités produit", relations: selectedItem.capacitesProduit, targetTab: "capacites" },
                  { label: "Enjeu business", relations: selectedItem.enjeuBusiness, targetTab: "enjeux" },
                ]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
