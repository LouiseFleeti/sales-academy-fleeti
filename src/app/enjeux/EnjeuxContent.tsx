"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DetailPanel from "@/components/ui/DetailPanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cachedFetch } from "@/lib/clientCache";
import type { Enjeu, Industry } from "@/types/notion";

const CARD_COLORS = [
  { bg: "#FFF0D6", border: "#f5c97a", accent: "#C9820A", text: "#7A4A00" },
  { bg: "#E8F2FD", border: "#9CC3F0", accent: "#3979C1", text: "#224873" },
  { bg: "#ede9fe", border: "#ddd6fe", accent: "#8b5cf6", text: "#5b21b6" },
  { bg: "#f0fdf4", border: "#a7f3c0", accent: "#22c55e", text: "#15803d" },
  { bg: "#fff1f2", border: "#fecdd3", accent: "#f43f5e", text: "#9f1239" },
  { bg: "#ecfeff", border: "#a5f0fc", accent: "#06b6d4", text: "#0e7490" },
];

export default function EnjeuxContent() {
  const [items, setItems] = useState<Enjeu[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Enjeu | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterIndustry, setFilterIndustry] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      cachedFetch<Enjeu[]>("/api/notion/enjeux"),
      cachedFetch<Industry[]>("/api/notion/industries"),
    ])
      .then(([enjeux, inds]) => {
        setItems(Array.isArray(enjeux) ? enjeux : []);
        setIndustries(Array.isArray(inds) ? inds : []);
        setLoading(false);
      })
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

  // Industries uniques présentes dans les enjeux (triées par nom)
  const usedIndustries = useMemo(() => {
    const seen = new Map<string, string>();
    items.forEach((e) => e.industriesConcernees.forEach((ind) => {
      if (!seen.has(ind.id)) seen.set(ind.id, ind.name);
    }));
    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (filterIndustry) {
      list = list.filter((e) => e.industriesConcernees.some((ind) => ind.id === filterIndustry));
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      (e.description || "").toLowerCase().includes(q)
    );
  }, [items, search, filterIndustry]);

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
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Enjeux business</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">Les priorités stratégiques qui guident les décisions d'achat de tes prospects — ce qu'ils cherchent à résoudre au niveau direction.</p>
          <p className="text-xs text-gray-400 mt-1">{filtered.length} enjeu{filtered.length > 1 ? "x" : ""}{filterIndustry ? " · filtré par industrie" : ""}</p>
        </div>

        <div className="mb-6 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher parmi les enjeux..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#3979C1] focus:ring-1 focus:ring-[#3979C1]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Industry filter pills */}
        {usedIndustries.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterIndustry(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: filterIndustry === null ? "#3979C1" : "white",
                color: filterIndustry === null ? "white" : "#6b7280",
                borderColor: filterIndustry === null ? "#3979C1" : "#e5e7eb",
              }}
            >
              Toutes les industries
            </button>
            {usedIndustries.map((ind) => (
              <button
                key={ind.id}
                onClick={() => setFilterIndustry(filterIndustry === ind.id ? null : ind.id)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
                style={{
                  background: filterIndustry === ind.id ? "#224873" : "white",
                  color: filterIndustry === ind.id ? "white" : "#6b7280",
                  borderColor: filterIndustry === ind.id ? "#224873" : "#e5e7eb",
                }}
              >
                {ind.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
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
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-sm text-gray-900 leading-snug">{item.name}</h2>
                    {item.description && (
                      <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: color.text }}>
                        {item.description}
                      </p>
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
                  <span className="shrink-0">Enjeux business</span>
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
                  { label: "Pain points associés", relations: selectedItem.painpointsAssocies, targetTab: "painpoints" },
                  { label: "Solutions associées", relations: selectedItem.solutionsAssociees, targetTab: "solutions" },
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
