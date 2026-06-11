"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DetailPanel from "@/components/ui/DetailPanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cachedFetch } from "@/lib/clientCache";
import type { Solution } from "@/types/notion";

const ENJEU_COLORS = [
  { bg: "#E8F2FD", border: "#9CC3F0", accent: "#3979C1", text: "#224873" },
  { bg: "#f0fdf4", border: "#a7f3c0", accent: "#22c55e", text: "#15803d" },
  { bg: "#FFF0D6", border: "#f5c97a", accent: "#C9820A", text: "#7A4A00" },
  { bg: "#ede9fe", border: "#ddd6fe", accent: "#8b5cf6", text: "#5b21b6" },
  { bg: "#ecfeff", border: "#a5f0fc", accent: "#06b6d4", text: "#0e7490" },
  { bg: "#fff1f2", border: "#fecdd3", accent: "#f43f5e", text: "#9f1239" },
];

export default function SolutionsContent() {
  const [items, setItems] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Solution | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeEnjeu, setActiveEnjeu] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    cachedFetch<Solution[]>("/api/notion/solutions")
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

  const openDetail = (item: Solution) => {
    setSelectedItem(item);
    setPanelOpen(true);
    router.push(`/solutions?id=${item.id}`, { scroll: false });
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedItem(null);
    router.push("/solutions", { scroll: false });
  };

  // Grouped by enjeu business — only groups with ≥3 solutions, rest → "Autres"
  const grouped = useMemo(() => {
    const map = new Map<string, { id: string; name: string; solutions: Solution[] }>();
    items.forEach((item) => {
      if (item.enjeuBusiness.length === 0) {
        if (!map.has("__autres__")) map.set("__autres__", { id: "__autres__", name: "Autres solutions", solutions: [] });
        map.get("__autres__")!.solutions.push(item);
      } else {
        item.enjeuBusiness.forEach((enjeu) => {
          if (!map.has(enjeu.id)) map.set(enjeu.id, { id: enjeu.id, name: enjeu.name, solutions: [] });
          map.get(enjeu.id)!.solutions.push(item);
        });
      }
    });
    // Keep only groups with ≥3 solutions, merge the rest into "Autres"
    const MIN = 3;
    const result: { id: string; name: string; solutions: Solution[] }[] = [];
    const autres: Solution[] = [];
    map.forEach((group) => {
      if (group.id === "__autres__" || group.solutions.length < MIN) {
        autres.push(...group.solutions);
      } else {
        result.push(group);
      }
    });
    result.sort((a, b) => b.solutions.length - a.solutions.length);
    if (autres.length > 0) {
      // Deduplicate autres
      const seen = new Set<string>();
      const dedupedAutres = autres.filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
      result.push({ id: "__autres__", name: "Autres solutions", solutions: dedupedAutres });
    }
    return result;
  }, [items]);

  const filtered = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return items.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
      );
    }
    if (activeEnjeu) {
      return grouped.find((g) => g.id === activeEnjeu)?.solutions ?? [];
    }
    return null; // null = show grouped view
  }, [items, search, activeEnjeu, grouped]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <LoadingSpinner label="Chargement des solutions..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)]" style={{ background: "#f8f9fb" }}>
      <div className="px-10 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Solutions</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">Les réponses concrètes que Fleeti apporte face aux problèmes terrain — chaque solution est liée aux pain points qu'elle résout et aux bénéfices qu'elle génère.</p>
            <p className="text-xs text-gray-400 mt-1">{items.length} solution{items.length > 1 ? "s" : ""} · {grouped.length} enjeu{grouped.length > 1 ? "x" : ""}</p>
          </div>
          {(activeEnjeu || search) && (
            <button
              onClick={() => { setActiveEnjeu(null); setSearch(""); }}
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
            onChange={(e) => { setSearch(e.target.value); setActiveEnjeu(null); }}
            placeholder="Rechercher parmi les solutions..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#3979C1] focus:ring-1 focus:ring-[#3979C1]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Enjeu filter pills — shown when no search */}
        {!search.trim() && !activeEnjeu && (
          <div className="flex flex-wrap gap-2 mb-8">
            {grouped.map((group, i) => {
              const color = ENJEU_COLORS[i % ENJEU_COLORS.length];
              return (
                <button
                  key={group.id}
                  onClick={() => setActiveEnjeu(group.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:shadow-sm"
                  style={{ background: color.bg, borderColor: color.border, color: color.text }}
                >
                  {group.name}
                  <span className="px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ background: color.accent, color: "white" }}>
                    {group.solutions.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Filtered (search or enjeu selected) */}
        {filtered !== null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item, i) => {
              const enjeuIdx = grouped.findIndex((g) => item.enjeuBusiness.some((e) => e.id === g.id));
              const color = ENJEU_COLORS[(enjeuIdx >= 0 ? enjeuIdx : i) % ENJEU_COLORS.length];
              const isSelected = selectedItem?.id === item.id;
              return <SolutionCard key={item.id} item={item} color={color} isSelected={isSelected} onClick={() => openDetail(item)} />;
            })}
          </div>
        ) : (
          /* Grouped view */
          <div className="space-y-10">
            {grouped.map((group, gi) => {
              const color = ENJEU_COLORS[gi % ENJEU_COLORS.length];
              return (
                <div key={group.id}>
                  {/* Group header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color.accent }} />
                    <h2 className="text-base font-bold" style={{ color: color.text }}>{group.name}</h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                      {group.solutions.length} solution{group.solutions.length > 1 ? "s" : ""}
                    </span>
                    <div className="flex-1 h-px" style={{ background: color.border }} />
                    <button
                      onClick={() => setActiveEnjeu(group.id)}
                      className="text-xs font-semibold shrink-0 transition-colors"
                      style={{ color: color.accent }}
                    >
                      Voir tout →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.solutions.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      return <SolutionCard key={item.id} item={item} color={color} isSelected={isSelected} onClick={() => openDetail(item)} />;
                    })}
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
                  <span className="shrink-0">Solutions</span>
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
                  { label: "Enjeu business", relations: selectedItem.enjeuBusiness, targetTab: "enjeux" },
                  { label: "Pain points résolus", relations: selectedItem.painPointsResolus, targetTab: "painpoints" },
                  { label: "Bénéfices", relations: selectedItem.benefices, targetTab: "benefices" },
                  { label: "Capacités produit", relations: selectedItem.capacitesProduit, targetTab: "capacites" },
                  { label: "Fonctionnalités", relations: selectedItem.fonctionnalites, targetTab: "fonctionnalites" },
                ]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Solution card ────────────────────────────────────────────────────────────
function SolutionCard({
  item, color, isSelected, onClick,
}: {
  item: Solution;
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
        boxShadow: isSelected
          ? `0 0 0 2px ${color.accent}30, 0 2px 8px rgba(0,0,0,0.06)`
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="px-5 py-4 flex items-start gap-3" style={{ background: color.bg }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: color.accent }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
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
          {item.benefices.slice(0, 2).map((rel) => (
            <span key={rel.id} className="text-xs px-2 py-0.5 rounded-md font-medium truncate max-w-[140px]" style={{ background: "#f0fdf4", color: "#15803d" }}>
              {rel.name}
            </span>
          ))}
          {item.benefices.length === 0 && item.painPointsResolus.slice(0, 2).map((rel) => (
            <span key={rel.id} className="text-xs px-2 py-0.5 rounded-md font-medium truncate max-w-[140px]" style={{ background: "#fff1f2", color: "#be123c" }}>
              {rel.name}
            </span>
          ))}
          {item.benefices.length === 0 && item.painPointsResolus.length === 0 && (
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
