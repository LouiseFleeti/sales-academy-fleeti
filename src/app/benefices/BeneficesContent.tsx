"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DetailPanel from "@/components/ui/DetailPanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cachedFetch } from "@/lib/clientCache";
import type { Benefice } from "@/types/notion";

const PALETTE = [
  { color: "#C9820A", bg: "#C9820A", lightBg: "#FFF0D6", borderColor: "#f5c97a" },
  { color: "#3979C1", bg: "#3979C1", lightBg: "#E8F2FD", borderColor: "#9CC3F0" },
  { color: "#15803d", bg: "#22c55e", lightBg: "#f0fdf4", borderColor: "#a7f3c0" },
  { color: "#5b21b6", bg: "#8b5cf6", lightBg: "#ede9fe", borderColor: "#ddd6fe" },
  { color: "#0e7490", bg: "#06b6d4", lightBg: "#ecfeff", borderColor: "#a5f0fc" },
  { color: "#be123c", bg: "#f43f5e", lightBg: "#fff1f2", borderColor: "#fecdd3" },
  { color: "#374151", bg: "#6b7280", lightBg: "#f3f4f6", borderColor: "#d1d5db" },
];

const ICONS = [
  <svg key="0" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  <svg key="1" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  <svg key="2" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  <svg key="3" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  <svg key="4" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  <svg key="5" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  <svg key="6" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
];

export default function BeneficesContent() {
  const [items, setItems] = useState<Benefice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Benefice | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    cachedFetch<Benefice[]>("/api/notion/benefices")
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

  // Grouper par enjeux business (domainerBusiness)
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: Benefice[] }>();
    items.forEach((b) => {
      if (b.domainerBusiness.length === 0) {
        const key = "__sans_enjeu__";
        if (!map.has(key)) map.set(key, { label: "Autres bénéfices", items: [] });
        map.get(key)!.items.push(b);
      } else {
        b.domainerBusiness.forEach((enjeu) => {
          if (!map.has(enjeu.id)) map.set(enjeu.id, { label: enjeu.name, items: [] });
          map.get(enjeu.id)!.items.push(b);
        });
      }
    });
    return Array.from(map.entries()).map(([id, val]) => ({ id, ...val }));
  }, [items]);

  const groupConfig = useMemo(() => {
    const m = new Map<string, typeof PALETTE[0] & { icon: React.ReactNode }>();
    grouped.forEach((g, i) => {
      m.set(g.id, { ...PALETTE[i % PALETTE.length], icon: ICONS[i % ICONS.length] });
    });
    return m;
  }, [grouped]);

  const activeItems = useMemo(() => {
    if (!activeGroup) return [];
    return grouped.find((g) => g.id === activeGroup)?.items ?? [];
  }, [activeGroup, grouped]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return items.filter((b) =>
      b.name.toLowerCase().includes(q) ||
      (b.description || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const openDetail = (item: Benefice) => {
    setSelectedItem(item);
    setPanelOpen(true);
    router.push(`/benefices?id=${item.id}`, { scroll: false });
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedItem(null);
    router.push("/benefices", { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <LoadingSpinner label="Chargement des bénéfices..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)]" style={{ background: "#f8f9fb" }}>

      {/* Barre de recherche */}
      <div className="px-10 pt-8 pb-2">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveGroup(null); }}
            placeholder="Rechercher parmi tous les bénéfices..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Résultats de recherche */}
      {search.trim() && (
        <div className="px-10 py-6">
          <p className="text-xs text-gray-400 mb-4">
            {searchResults.length} résultat{searchResults.length !== 1 ? "s" : ""} pour &ldquo;{search}&rdquo;
          </p>
          {searchResults.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucun bénéfice trouvé.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((b) => {
                const enjeu = b.domainerBusiness[0];
                const groupId = enjeu?.id ?? "__sans_enjeu__";
                const cfg = groupConfig.get(groupId) ?? { ...PALETTE[0], icon: ICONS[0] };
                return (
                  <button key={b.id} onClick={() => openDetail(b)}
                    className="text-left rounded-xl border bg-white p-5 group transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: "#e5e7eb" }}>
                    {enjeu && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block" style={{ background: cfg.lightBg, color: cfg.color }}>
                        {enjeu.name}
                      </span>
                    )}
                    <p className="font-bold text-sm text-gray-900 leading-snug">{b.name}</p>
                    {b.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{b.description}</p>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Niveau 1 : Groupes (Enjeux) */}
      {!search.trim() && !activeGroup && (
        <div className="px-10 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Bénéfices</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">La valeur mesurable que Fleeti apporte à ses clients — le meilleur angle d'entrée pour argumenter. Chaque bénéfice est regroupé par enjeu business.</p>
            <p className="text-xs text-gray-400 mt-1">{grouped.length} enjeux · {items.length} bénéfices</p>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {grouped.map((group) => {
              const cfg = groupConfig.get(group.id)!;
              return (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className="text-left rounded-2xl border overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: "white", borderColor: cfg.borderColor, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                >
                  <div className="px-5 py-5 flex items-start gap-4" style={{ background: cfg.lightBg }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg, color: "white" }}>
                      {cfg.icon}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-base text-gray-900 leading-tight">{group.label}</h2>
                      <p className="text-xs mt-1" style={{ color: cfg.color }}>
                        {group.items.length} bénéfice{group.items.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-white flex items-center justify-between gap-2">
                    <div className="flex gap-1.5 flex-wrap min-w-0">
                      {group.items.slice(0, 2).map((b) => (
                        <span key={b.id} className="text-xs px-2 py-0.5 rounded-md font-medium truncate max-w-[140px]" style={{ background: cfg.lightBg, color: cfg.color }}>
                          {b.name}
                        </span>
                      ))}
                      {group.items.length > 2 && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 font-medium">+{group.items.length - 2}</span>
                      )}
                    </div>
                    <svg className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: cfg.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Niveau 2 : Bénéfices d'un groupe */}
      {!search.trim() && activeGroup && (
        <div className="px-10 py-10">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => { setActiveGroup(null); closePanel(); }}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Retour
            </button>
            <div className="h-4 w-px bg-gray-200" />
            {(() => {
              const cfg = groupConfig.get(activeGroup)!;
              const group = grouped.find((g) => g.id === activeGroup)!;
              return (
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cfg.bg, color: "white" }}>
                    <span className="scale-[0.65]">{cfg.icon}</span>
                  </span>
                  <h1 className="text-xl font-bold text-gray-900">{group.label}</h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.lightBg, color: cfg.color }}>
                    {group.items.length}
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeItems.map((b) => {
              const cfg = groupConfig.get(activeGroup)!;
              const isSelected = selectedItem?.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => openDetail(b)}
                  className="text-left rounded-xl border bg-white p-5 group transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    borderColor: isSelected ? cfg.bg : "#e5e7eb",
                    boxShadow: isSelected ? `0 0 0 2px ${cfg.bg}30, 0 2px 8px rgba(0,0,0,0.06)` : "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-bold text-sm text-gray-900 leading-snug">{b.name}</p>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                  {b.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{b.description}</p>
                  )}
                  {b.solutionsAssociees.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50 flex-wrap">
                      {b.solutionsAssociees.slice(0, 2).map((s) => (
                        <span key={s.id} className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: cfg.lightBg, color: cfg.color }}>
                          {s.name}
                        </span>
                      ))}
                      {b.solutionsAssociees.length > 2 && (
                        <span className="text-xs text-gray-400">+{b.solutionsAssociees.length - 2}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Panneau slide-in */}
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
                  <span className="shrink-0">Bénéfices</span>
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
                fields={[
                  { label: "Description", value: selectedItem.description, display: "description" },
                ]}
                relations={[
                  { label: "Enjeux business", relations: selectedItem.domainerBusiness, targetTab: "enjeux" },
                  { label: "Solutions associées", relations: selectedItem.solutionsAssociees, targetTab: "solutions" },
                  { label: "Pain points liés", relations: selectedItem.painPointsLies, targetTab: "painpoints" },
                ]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
