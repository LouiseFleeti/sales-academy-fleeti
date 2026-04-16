"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DetailPanel from "@/components/ui/DetailPanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cachedFetch } from "@/lib/clientCache";
import type { Capacite } from "@/types/notion";

// Palette de couleurs pour les cartes (cycle)
const CARD_COLORS = [
  { bg: "#e8f7fa", border: "#b2e3ef", accent: "#0ca2c2", text: "#0887a3" },
  { bg: "#fff7e6", border: "#fdd89a", accent: "#fea706", text: "#b45309" },
  { bg: "#ede9fe", border: "#ddd6fe", accent: "#8b5cf6", text: "#5b21b6" },
  { bg: "#f0fdf4", border: "#a7f3c0", accent: "#22c55e", text: "#15803d" },
  { bg: "#fff1f2", border: "#fecdd3", accent: "#f43f5e", text: "#9f1239" },
  { bg: "#ecfeff", border: "#a5f0fc", accent: "#06b6d4", text: "#0e7490" },
];

export default function CapacitesContent() {
  const [items, setItems] = useState<Capacite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Capacite | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    cachedFetch<Capacite[]>("/api/notion/capacites")
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

  const openDetail = (cap: Capacite) => {
    setSelectedItem(cap);
    setPanelOpen(true);
    router.push(`/capacites?id=${cap.id}`, { scroll: false });
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedItem(null);
    router.push("/capacites", { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <LoadingSpinner label="Chargement des capacités produit..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)]" style={{ background: "#f8f9fb" }}>
      <div className="px-10 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Capacités produit</h1>
          <p className="text-sm text-gray-400 mt-1">{items.length} capacités</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((cap, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
            const isSelected = selectedItem?.id === cap.id;
            return (
              <button
                key={cap.id}
                onClick={() => openDetail(cap)}
                className="text-left rounded-2xl border bg-white overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: isSelected ? color.accent : color.border,
                  boxShadow: isSelected
                    ? `0 0 0 2px ${color.accent}30, 0 2px 8px rgba(0,0,0,0.06)`
                    : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* Colored header */}
                <div className="px-5 py-4 flex items-start gap-3" style={{ background: color.bg }}>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: color.accent }}
                  >
                    <svg className="w-4.5 h-4.5 text-white" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-sm text-gray-900 leading-snug">{cap.name}</h2>
                    {cap.description && (
                      <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: color.text }}>
                        {cap.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer : relations preview */}
                <div className="px-5 py-3 bg-white flex items-center justify-between gap-2">
                  <div className="flex gap-1.5 flex-wrap min-w-0">
                    {cap.painPointsLies.slice(0, 2).map((rel) => (
                      <span
                        key={rel.id}
                        className="text-xs px-2 py-0.5 rounded-md font-medium truncate max-w-[140px]"
                        style={{ background: "#fff1f2", color: "#be123c" }}
                      >
                        {rel.name}
                      </span>
                    ))}
                    {cap.painPointsLies.length === 0 && cap.solutionsAssociees.slice(0, 2).map((rel) => (
                      <span
                        key={rel.id}
                        className="text-xs px-2 py-0.5 rounded-md font-medium truncate max-w-[140px]"
                        style={{ background: "#edf7ee", color: "#2e7d32" }}
                      >
                        {rel.name}
                      </span>
                    ))}
                    {(cap.painPointsLies.length + cap.solutionsAssociees.length) === 0 && (
                      <span className="text-xs text-gray-300 italic">Aucune relation</span>
                    )}
                  </div>
                  <svg
                    className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: color.text }}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  >
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Panneau slide-in ── */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
          <div
            className="fixed top-14 inset-x-0 bottom-0 z-50 bg-white overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between z-10">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Fiche capacité produit</p>
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
                fields={[
                  { label: "Description", value: selectedItem.description, display: "description" },
                ]}
                relations={[
                  { label: "Pain points liés", relations: selectedItem.painPointsLies, targetTab: "painpoints" },
                  { label: "Solutions associées", relations: selectedItem.solutionsAssociees, targetTab: "solutions" },
                  { label: "Modules associés", relations: selectedItem.modulesAssocies, targetTab: "fonctionnalites" },
                ]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
