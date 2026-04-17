"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DetailPanel from "@/components/ui/DetailPanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cachedFetch } from "@/lib/clientCache";
import type { PainPoint } from "@/types/notion";

// ─── Fréquence badge ─────────────────────────────────────────────────────────

const FREQUENCE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Élevée":   { bg: "#fff1f2", text: "#be123c", dot: "#f43f5e" },
  "Haute":    { bg: "#fff1f2", text: "#be123c", dot: "#f43f5e" },
  "Forte":    { bg: "#fff1f2", text: "#be123c", dot: "#f43f5e" },
  "Moyenne":  { bg: "#fff7e6", text: "#b45309", dot: "#fea706" },
  "Modérée":  { bg: "#fff7e6", text: "#b45309", dot: "#fea706" },
  "Faible":   { bg: "#f3f4f6", text: "#4b5563", dot: "#9ca3af" },
  "Basse":    { bg: "#f3f4f6", text: "#4b5563", dot: "#9ca3af" },
};

function FrequenceBadge({ value }: { value: string }) {
  const key = Object.keys(FREQUENCE_COLORS).find(k =>
    value.toLowerCase().includes(k.toLowerCase())
  );
  const cfg = key ? FREQUENCE_COLORS[key] : { bg: "#f3f4f6", text: "#4b5563", dot: "#9ca3af" };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {value}
    </span>
  );
}

// ─── Category config ──────────────────────────────────────────────────────────

// Couleurs cycliques pour les catégories inconnues
const PALETTE: Array<{ color: string; bg: string; lightBg: string; borderColor: string }> = [
  { color: "#be123c", bg: "#f43f5e", lightBg: "#fff1f2", borderColor: "#fecdd3" },
  { color: "#b45309", bg: "#fea706", lightBg: "#fff7e6", borderColor: "#fdd89a" },
  { color: "#0887a3", bg: "#0ca2c2", lightBg: "#e8f7fa", borderColor: "#b2e3ef" },
  { color: "#5b21b6", bg: "#8b5cf6", lightBg: "#ede9fe", borderColor: "#ddd6fe" },
  { color: "#15803d", bg: "#22c55e", lightBg: "#f0fdf4", borderColor: "#a7f3c0" },
  { color: "#0e7490", bg: "#06b6d4", lightBg: "#ecfeff", borderColor: "#a5f0fc" },
  { color: "#374151", bg: "#6b7280", lightBg: "#f3f4f6", borderColor: "#d1d5db" },
];

const CATEGORY_ICONS: React.ReactNode[] = [
  <svg key="0" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  <svg key="1" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  <svg key="2" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  <svg key="3" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  <svg key="4" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  <svg key="5" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  <svg key="6" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function PainPointsContent() {
  const [items, setItems] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PainPoint | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    cachedFetch<PainPoint[]>("/api/notion/painpoints")
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
        if (!activeCategory) setActiveCategory(found.categorie || null);
      }
    } else {
      setPanelOpen(false);
      setSelectedItem(null);
    }
  }, [searchParams, items]);

  const grouped = useMemo(() => {
    const map = new Map<string, PainPoint[]>();
    items.forEach((item) => {
      const cat = item.categorie || "Autre";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  // Associe chaque catégorie à une couleur/icône de la palette
  const categoryConfig = useMemo(() => {
    const map = new Map<string, typeof PALETTE[0] & { icon: React.ReactNode }>();
    grouped.forEach(([cat], i) => {
      map.set(cat, { ...PALETTE[i % PALETTE.length], icon: CATEGORY_ICONS[i % CATEGORY_ICONS.length] });
    });
    return map;
  }, [grouped]);

  const openDetail = (pp: PainPoint) => {
    setSelectedItem(pp);
    setPanelOpen(true);
    router.push(`/painpoints?id=${pp.id}`, { scroll: false });
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedItem(null);
    router.push("/painpoints", { scroll: false });
  };

  const currentItems = useMemo(() => {
    return activeCategory
      ? (grouped.find(([cat]) => cat === activeCategory)?.[1] ?? [])
      : [];
  }, [activeCategory, grouped]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return items.filter((i) =>
      i.name.toLowerCase().includes(q) ||
      i.descriptionTerrain?.toLowerCase().includes(q) ||
      i.consequenceBusiness?.toLowerCase().includes(q)
    );
  }, [items, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <LoadingSpinner label="Chargement des pain points..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)]" style={{ background: "#f8f9fb" }}>

      {/* ── Barre de recherche globale ────────────────────────────────────── */}
      <div className="px-10 pt-8 pb-2">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
            placeholder="Rechercher parmi tous les pain points..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#0ca2c2] focus:ring-1 focus:ring-[#0ca2c2]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Résultats de recherche ────────────────────────────────────────── */}
      {search.trim() && (
        <div className="px-10 py-6">
          <p className="text-xs text-gray-400 mb-4">
            {searchResults.length} résultat{searchResults.length !== 1 ? "s" : ""} pour &ldquo;{search}&rdquo;
          </p>
          {searchResults.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucun pain point trouvé.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((pp) => {
                const cfg = categoryConfig.get(pp.categorie ?? "") ?? { ...PALETTE[0], icon: CATEGORY_ICONS[0] };
                return (
                  <button
                    key={pp.id}
                    onClick={() => openDetail(pp)}
                    className="text-left rounded-xl border bg-white p-5 group transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: "#e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block" style={{ background: cfg.lightBg, color: cfg.color }}>{pp.categorie}</span>
                        <p className="font-bold text-sm text-gray-900 leading-snug">{pp.name}</p>
                        {pp.descriptionTerrain && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{pp.descriptionTerrain}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {pp.frequence && <FrequenceBadge value={pp.frequence} />}
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Niveau 1 : Catégories ─────────────────────────────────────────── */}
      {!search.trim() && !activeCategory && (
        <div className="px-10 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Pain points terrain</h1>
            <p className="text-sm text-gray-400 mt-1">
              {grouped.length} catégories · {items.length} pain points identifiés
            </p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {grouped.map(([category, painpoints]) => {
              const cfg = categoryConfig.get(category)!;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className="text-left rounded-2xl border overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: "white", borderColor: cfg.borderColor, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                >
                  <div className="px-5 py-5 flex items-start gap-4" style={{ background: cfg.lightBg }}>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: cfg.bg, color: "white" }}
                    >
                      {cfg.icon}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-base text-gray-900 leading-tight">{category}</h2>
                      <p className="text-xs mt-1" style={{ color: cfg.color }}>
                        {painpoints.length} pain point{painpoints.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-white flex items-center justify-between gap-2">
                    <div className="flex gap-1.5 flex-wrap min-w-0">
                      {painpoints.slice(0, 2).map((pp) => (
                        <span
                          key={pp.id}
                          className="text-xs px-2 py-0.5 rounded-md font-medium truncate max-w-[140px]"
                          style={{ background: cfg.lightBg, color: cfg.color }}
                        >
                          {pp.name}
                        </span>
                      ))}
                      {painpoints.length > 2 && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 font-medium">
                          +{painpoints.length - 2}
                        </span>
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

      {/* ── Niveau 2 : Pain points d'une catégorie ───────────────────────── */}
      {!search.trim() && activeCategory && (
        <div className="px-10 py-10">
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
            {(() => {
              const cfg = categoryConfig.get(activeCategory)!;
              return (
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cfg.bg, color: "white" }}>
                    <span className="scale-[0.65]">{cfg.icon}</span>
                  </span>
                  <h1 className="text-xl font-bold text-gray-900">{activeCategory}</h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.lightBg, color: cfg.color }}>
                    {currentItems.length}
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((pp) => {
              const cfg = categoryConfig.get(activeCategory)!;
              const isSelected = selectedItem?.id === pp.id;
              return (
                <button
                  key={pp.id}
                  onClick={() => openDetail(pp)}
                  className="text-left rounded-xl border bg-white p-5 group transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    borderColor: isSelected ? cfg.bg : "#e5e7eb",
                    boxShadow: isSelected
                      ? `0 0 0 2px ${cfg.bg}30, 0 2px 8px rgba(0,0,0,0.06)`
                      : "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="font-bold text-sm text-gray-900 leading-snug">{pp.name}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {pp.frequence && <FrequenceBadge value={pp.frequence} />}
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </div>

                  {pp.descriptionTerrain && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                      {pp.descriptionTerrain}
                    </p>
                  )}

                  {pp.consequenceBusiness && (
                    <div className="flex items-start gap-2 pt-3 border-t border-gray-50">
                      <svg className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-1">{pp.consequenceBusiness}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Panneau slide-in ──────────────────────────────────────────────── */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
          <div
            className="fixed top-14 inset-x-0 bottom-0 z-50 bg-white overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={closePanel}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                  </svg>
                  Retour
                </button>
                <div className="h-4 w-px bg-gray-200 shrink-0" />
                <nav className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0 truncate">
                  <span className="shrink-0">Pain points</span>
                  <span className="shrink-0">/</span>
                  <span className="shrink-0">{selectedItem?.categorie}</span>
                  <span className="shrink-0">/</span>
                  <span className="font-semibold text-gray-700 truncate">{selectedItem?.name}</span>
                </nav>
              </div>
              <button
                onClick={closePanel}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0 ml-4"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {selectedItem && (
              <DetailPanel
                name={selectedItem.name}
                badge={selectedItem.categorie}
                fields={[
                  { label: "Description terrain", value: selectedItem.descriptionTerrain, display: "description" },
                  { label: "Fréquence", value: selectedItem.frequence, display: "list" },
                  { label: "Conséquence business", value: selectedItem.consequenceBusiness, display: "text" },
                  { label: "Question stratégique", value: selectedItem.questionStrategique, display: "highlight" },
                  { label: "Symptômes", value: selectedItem.symptomes, display: "bullets" },
                ]}
                relations={[
                  { label: "Industries concernées", relations: selectedItem.industriesConcernees, targetTab: "industries" },
                  { label: "Capacités produit", relations: selectedItem.capacitesProduit, targetTab: "capacites" },
                  { label: "Enjeu business", relations: selectedItem.enjeuBusiness, targetTab: "enjeux" },
                  { label: "Personas", relations: selectedItem.personas, targetTab: "personas" },
                  { label: "Solutions", relations: selectedItem.solutions, targetTab: "solutions" },
                ]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
