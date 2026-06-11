"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DetailPanel from "@/components/ui/DetailPanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cachedFetch } from "@/lib/clientCache";
import type { Enjeu } from "@/types/notion";

const CAT_COLORS: Record<string, { bg: string; border: string; accent: string; text: string }> = {
  "Financier":    { bg: "#E8F2FD", border: "#9CC3F0", accent: "#3979C1", text: "#224873" },
  "Opérationnel": { bg: "#FFF0D6", border: "#f5c97a", accent: "#C9820A", text: "#7A4A00" },
  "Sécurité":     { bg: "#fff1f2", border: "#fecdd3", accent: "#f43f5e", text: "#9f1239" },
  "Conformité":   { bg: "#ede9fe", border: "#ddd6fe", accent: "#8b5cf6", text: "#5b21b6" },
  "Client":       { bg: "#f0fdf4", border: "#a7f3c0", accent: "#22c55e", text: "#15803d" },
  "Autre":        { bg: "#f3f4f6", border: "#d1d5db", accent: "#6b7280", text: "#374151" },
};

const CAT_ORDER = ["Opérationnel", "Financier", "Sécurité", "Conformité", "Client", "Autre"];

export default function EnjeuxContent() {
  const [items, setItems] = useState<Enjeu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Enjeu | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    cachedFetch<Enjeu[]>("/api/notion/enjeux")
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

  const openDetail = (item: Enjeu) => {
    setSelectedItem(item);
    setPanelOpen(true);
    router.push(`/enjeux?id=${item.id}`, { scroll: false });
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedItem(null);
    router.push("/enjeux", { scroll: false });
  };

  // Grouped by catégorie
  const grouped = useMemo(() => {
    const map = new Map<string, Enjeu[]>();
    items.forEach((item) => {
      const cat = item.categorie || "Autre";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    });
    return CAT_ORDER
      .filter((cat) => map.has(cat))
      .map((cat) => ({ cat, items: map.get(cat)! }));
  }, [items]);

  const filtered = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return items.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q)
      );
    }
    if (activeCategory) return grouped.find((g) => g.cat === activeCategory)?.items ?? [];
    return null; // null = grouped view
  }, [items, search, activeCategory, grouped]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <LoadingSpinner label="Chargement des enjeux business..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)]" style={{ background: "#f8f9fb" }}>
      <div className="px-10 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Enjeux business</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">Les priorités stratégiques qui guident les décisions d'achat de tes prospects — ce qu'ils cherchent à résoudre au niveau direction.</p>
            <p className="text-xs text-gray-400 mt-1">{items.length} enjeu{items.length > 1 ? "x" : ""} · {grouped.length} catégorie{grouped.length > 1 ? "s" : ""}</p>
          </div>
          {(activeCategory || search) && (
            <button
              onClick={() => { setActiveCategory(null); setSearch(""); }}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Tout afficher
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
            placeholder="Rechercher parmi les enjeux..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#3979C1] focus:ring-1 focus:ring-[#3979C1]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Category pills */}
        {!search.trim() && !activeCategory && (
          <div className="flex flex-wrap gap-2 mb-8">
            {grouped.map(({ cat, items: catItems }) => {
              const color = CAT_COLORS[cat] ?? CAT_COLORS["Autre"];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:shadow-sm"
                  style={{ background: color.bg, borderColor: color.border, color: color.text }}
                >
                  {cat}
                  <span className="px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ background: color.accent, color: "white" }}>
                    {catItems.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Filtered (search or category selected) */}
        {filtered !== null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item, i) => {
              const color = CAT_COLORS[item.categorie ?? "Autre"] ?? CAT_COLORS["Autre"];
              return <EnjeuCard key={item.id} item={item} color={color} isSelected={selectedItem?.id === item.id} onClick={() => openDetail(item)} />;
            })}
          </div>
        ) : (
          /* Grouped view */
          <div className="space-y-10">
            {grouped.map(({ cat, items: catItems }) => {
              const color = CAT_COLORS[cat] ?? CAT_COLORS["Autre"];
              return (
                <div key={cat}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color.accent }} />
                    <h2 className="text-base font-bold" style={{ color: color.text }}>{cat}</h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                      {catItems.length} enjeu{catItems.length > 1 ? "x" : ""}
                    </span>
                    <div className="flex-1 h-px" style={{ background: color.border }} />
                    <button onClick={() => setActiveCategory(cat)} className="text-xs font-semibold shrink-0 transition-colors" style={{ color: color.accent }}>
                      Voir tout →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {catItems.map((item) => (
                      <EnjeuCard key={item.id} item={item} color={color} isSelected={selectedItem?.id === item.id} onClick={() => openDetail(item)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
          <div className="fixed top-14 inset-x-0 bottom-0 z-40 bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={closePanel} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  Retour
                </button>
                <div className="h-4 w-px bg-gray-200 shrink-0" />
                <nav className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0 truncate">
                  <button onClick={closePanel} className="shrink-0 hover:text-gray-700 transition-colors">Enjeux business</button>
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
                  { label: "Description", value: selectedItem.description, display: "description" },
                ]}
                relations={[
                  { label: "Pain points associés", relations: selectedItem.painpointsAssocies, targetTab: "painpoints" },
                  { label: "Solutions associées", relations: selectedItem.solutionsAssociees, targetTab: "solutions" },
                  { label: "Bénéfices associés", relations: selectedItem.beneficesAssocies, targetTab: "benefices" },
                  { label: "Fonctionnalités associées", relations: selectedItem.fonctionnalitesAssociees, targetTab: "fonctionnalites" },
                  { label: "Industries concernées", relations: selectedItem.industriesConcernees, targetTab: "industries" },
                ]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function EnjeuCard({ item, color, isSelected, onClick }: {
  item: Enjeu;
  color: { bg: string; border: string; accent: string; text: string };
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl border bg-white overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{
        borderColor: isSelected ? color.accent : color.border,
        boxShadow: isSelected ? `0 0 0 2px ${color.accent}30, 0 2px 8px rgba(0,0,0,0.06)` : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="px-5 py-4 flex items-start gap-3" style={{ background: color.bg }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: color.accent }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-sm text-gray-900 leading-snug">{item.name}</h2>
          {item.description && (
            <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: color.text }}>{item.description}</p>
          )}
        </div>
      </div>
      <div className="px-5 py-3 bg-white flex items-center justify-between gap-2">
        <div className="flex gap-1.5 flex-wrap min-w-0">
          {item.painpointsAssocies.slice(0, 2).map((rel) => (
            <span key={rel.id} className="text-xs px-2 py-0.5 rounded-md font-medium truncate max-w-[140px]" style={{ background: "#fff1f2", color: "#be123c" }}>
              {rel.name}
            </span>
          ))}
          {item.painpointsAssocies.length === 0 && (
            <span className="text-xs text-gray-300 italic">Aucune relation</span>
          )}
        </div>
        <svg className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: color.text }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
    </button>
  );
}
