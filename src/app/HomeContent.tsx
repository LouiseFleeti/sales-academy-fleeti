"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cachedFetch } from "@/lib/clientCache";
import type { Industry, PainPoint, Solution } from "@/types/notion";

// ─── Tokens Fleeti ────────────────────────────────────────────────────────────
const F = { primary: "#3979C1", primaryDark: "#224873", primaryBg: "#E8F2FD", orange: "#C9820A", orangeBg: "#FFF0D6" };

// ─── Palette industries ───────────────────────────────────────────────────────
const IND_CFG: Record<string, { color: string; bg: string; lightBg: string }> = {
  "Finance & Location":     { color: "#224873", bg: "#3979C1", lightBg: "#E8F2FD" },
  "Mobilité & Livraison":   { color: "#7A4A00", bg: "#C9820A", lightBg: "#FFF0D6" },
  "Terrain & Energie":      { color: "#15803d", bg: "#22c55e", lightBg: "#f0fdf4" },
  "Passagers & Transport":  { color: "#0e7490", bg: "#06b6d4", lightBg: "#ecfeff" },
  "Industrie & Défense":    { color: "#374151", bg: "#6b7280", lightBg: "#f3f4f6" },
  "Santé & Retail":         { color: "#9f1239", bg: "#f43f5e", lightBg: "#fff1f2" },
  "Agri & Collectivités":   { color: "#166534", bg: "#16a34a", lightBg: "#f0fdf4" },
};
const IND_DEFAULT = { color: "#374151", bg: "#6b7280", lightBg: "#f3f4f6" };

// ─── Palette catégories pain points ───────────────────────────────────────────
const PP_PALETTE = [
  { color: "#be123c", lightBg: "#fff1f2", border: "#fecdd3" },
  { color: "#7A4A00", lightBg: "#FFF0D6", border: "#f5c97a" },
  { color: "#224873", lightBg: "#E8F2FD", border: "#9CC3F0" },
  { color: "#5b21b6", lightBg: "#ede9fe", border: "#ddd6fe" },
  { color: "#15803d", lightBg: "#f0fdf4", border: "#a7f3c0" },
  { color: "#0e7490", lightBg: "#ecfeff", border: "#a5f0fc" },
  { color: "#374151", lightBg: "#f3f4f6", border: "#d1d5db" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dedup<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  return arr.filter((x) => { if (seen.has(x.id)) return false; seen.add(x.id); return true; });
}

function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
      style={{ background: copied ? "#f0fdf4" : "#f3f4f6", color: copied ? "#15803d" : "#6b7280" }}
    >
      {copied ? (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      )}
      {copied ? "Copié !" : label}
    </button>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Prospect" },
    { n: 2, label: "Problèmes" },
    { n: 3, label: "Brief RDV" },
  ];
  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all"
                style={{
                  background: done ? "rgba(255,255,255,0.92)" : active ? "white" : "rgba(255,255,255,0.13)",
                  color: done ? F.primary : active ? F.primaryDark : "rgba(255,255,255,0.38)",
                  boxShadow: active ? "0 0 0 4px rgba(255,255,255,0.18)" : "none",
                }}
              >
                {done ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ) : s.n}
              </div>
              <span className="text-xs font-semibold whitespace-nowrap" style={{ color: active ? "white" : done ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.38)" }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-14 h-0.5 mb-5 mx-2" style={{ background: done ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.16)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomeContent() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [allPainPoints, setAllPainPoints] = useState<PainPoint[]>([]);
  const [allSolutions, setAllSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedPPIds, setSelectedPPIds] = useState<Set<string>>(new Set());
  const [indSearch, setIndSearch] = useState("");
  const [briefCopied, setBriefCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      cachedFetch<Industry[]>("/api/notion/industries"),
      cachedFetch<PainPoint[]>("/api/notion/painpoints"),
      cachedFetch<Solution[]>("/api/notion/solutions"),
    ]).then(([inds, pps, sols]) => {
      setIndustries(Array.isArray(inds) ? inds : []);
      setAllPainPoints(Array.isArray(pps) ? pps : []);
      setAllSolutions(Array.isArray(sols) ? sols : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Pain points de l'industrie sélectionnée
  const industryPPs = useMemo(() => {
    if (!selectedIndustry) return [];
    const ids = new Set(selectedIndustry.painPoints.map((p) => p.id));
    return allPainPoints.filter((pp) => ids.has(pp.id));
  }, [selectedIndustry, allPainPoints]);

  // Groupés par catégorie
  const ppGrouped = useMemo(() => {
    const map = new Map<string, PainPoint[]>();
    industryPPs.forEach((pp) => {
      const cat = pp.categorie || "Autre";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(pp);
    });
    return Array.from(map.entries()).map(([cat, items], i) => ({
      cat, items, cfg: PP_PALETTE[i % PP_PALETTE.length],
    }));
  }, [industryPPs]);

  // Pain points sélectionnés (objets complets)
  const selectedPPs = useMemo(
    () => industryPPs.filter((pp) => selectedPPIds.has(pp.id)),
    [industryPPs, selectedPPIds]
  );

  // Brief data assemblé
  const brief = useMemo(() => {
    const enjeux = dedup(selectedPPs.flatMap((pp) => pp.enjeuBusiness));
    const solutionRefs = dedup(selectedPPs.flatMap((pp) => pp.solutions));
    const capacites = dedup(selectedPPs.flatMap((pp) => pp.capacitesProduit));
    const questions = selectedPPs.map((pp) => pp.questionStrategique).filter(Boolean) as string[];
    const personas = dedup(selectedPPs.flatMap((pp) => pp.personas));

    const solutionObjs = allSolutions.filter((s) => solutionRefs.some((r) => r.id === s.id));
    const benefices = dedup(solutionObjs.flatMap((s) => s.benefices));

    return { enjeux, solutionRefs, capacites, questions, personas, benefices };
  }, [selectedPPs, allSolutions]);

  // Texte du brief complet
  const briefText = useMemo(() => {
    if (!selectedIndustry) return "";
    const lines: string[] = [
      `🎯 BRIEF RDV — ${selectedIndustry.name}`,
      `Date : ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`,
      "",
    ];
    if (brief.enjeux.length) {
      lines.push("📌 ENJEUX BUSINESS DÉTECTÉS");
      brief.enjeux.forEach((e) => lines.push(`  • ${e.name}`));
      lines.push("");
    }
    if (selectedPPs.length) {
      lines.push("❌ PAIN POINTS IDENTIFIÉS");
      selectedPPs.forEach((pp) => lines.push(`  • ${pp.name}`));
      lines.push("");
    }
    if (brief.solutionRefs.length) {
      lines.push("✅ ARGUMENTS FLEETI");
      brief.solutionRefs.forEach((s) => lines.push(`  • ${s.name}`));
      lines.push("");
    }
    if (brief.benefices.length) {
      lines.push("⭐ BÉNÉFICES CLÉS À METTRE EN AVANT");
      brief.benefices.forEach((b) => lines.push(`  • ${b.name}`));
      lines.push("");
    }
    if (brief.questions.length) {
      lines.push("💡 QUESTIONS STRATÉGIQUES À POSER");
      brief.questions.forEach((q) => lines.push(`  • ${q}`));
      lines.push("");
    }
    if (brief.capacites.length) {
      lines.push("⚙️ CAPACITÉS PRODUIT À MENTIONNER");
      brief.capacites.forEach((c) => lines.push(`  • ${c.name}`));
    }
    return lines.join("\n");
  }, [selectedIndustry, selectedPPs, brief]);

  const indCfg = selectedIndustry
    ? (IND_CFG[selectedIndustry.typeIndustrie ?? ""] ?? IND_DEFAULT)
    : IND_DEFAULT;

  const filteredIndustries = useMemo(() => {
    if (!indSearch.trim()) return industries;
    const q = indSearch.toLowerCase();
    return industries.filter((i) =>
      i.name.toLowerCase().includes(q) ||
      (i.typeIndustrie || "").toLowerCase().includes(q)
    );
  }, [industries, indSearch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: F.primary, borderTopColor: "transparent" }} />
        <p className="text-sm text-gray-400">Chargement de la Sales Academy…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ background: "#f4f6f9" }}>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg, #182f4e 0%, #224873 50%, #2e6fba 100%)" }}>
        <div className="max-w-screen-lg mx-auto px-8 py-8 flex items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4" style={{ color: "rgba(255,255,255,0.45)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>Sales Academy</span>
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight">Prépare ton RDV</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.58)" }}>Génère un brief personnalisé en 3 étapes</p>
          </div>
          <div className="shrink-0">
            <Steps current={step} />
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-8 py-8">

        {/* ════════════════════════════════════════════════════════ STEP 1 */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-base font-bold text-gray-800">Dans quel secteur est ton prospect ?</h2>
              <p className="text-sm text-gray-400 mt-1">Sélectionne une industrie pour continuer</p>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-sm">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={indSearch}
                onChange={(e) => setIndSearch(e.target.value)}
                placeholder="Filtrer les industries…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#3979C1]"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredIndustries.map((ind) => {
                const cfg = IND_CFG[ind.typeIndustrie ?? ""] ?? IND_DEFAULT;
                const isSelected = selectedIndustry?.id === ind.id;
                return (
                  <button
                    key={ind.id}
                    onClick={() => {
                      setSelectedIndustry(ind);
                      setSelectedPPIds(new Set());
                      setStep(2);
                    }}
                    className="text-left rounded-2xl border bg-white overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      borderColor: isSelected ? cfg.bg : "#e5e7eb",
                      boxShadow: isSelected ? `0 0 0 2px ${cfg.bg}` : "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="h-1.5 w-full" style={{ background: cfg.bg }} />
                    <div className="px-4 py-3">
                      {ind.typeIndustrie && (
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md" style={{ background: cfg.lightBg, color: cfg.color }}>
                          {ind.typeIndustrie}
                        </span>
                      )}
                      <p className="font-bold text-sm text-gray-900 leading-snug mt-1.5">{ind.name}</p>
                      {ind.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{ind.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-300">
                          {ind.painPoints.length} pain point{ind.painPoints.length !== 1 ? "s" : ""}
                        </span>
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" style={{ color: cfg.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════ STEP 2 */}
        {step === 2 && selectedIndustry && (
          <div>
            {/* Context bar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setStep(1); setSelectedPPIds(new Set()); }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                </button>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold"
                  style={{ background: indCfg.lightBg, color: indCfg.color }}
                >
                  <span>{selectedIndustry.name}</span>
                </div>
                <span className="text-sm text-gray-400">{industryPPs.length} pain points disponibles</span>
              </div>
              {selectedPPIds.size > 0 && (
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: F.primary, boxShadow: "0 2px 8px rgba(57,121,193,0.3)" }}
                >
                  Générer le brief
                  <span className="px-1.5 py-0.5 rounded-md text-xs" style={{ background: "rgba(255,255,255,0.25)" }}>
                    {selectedPPIds.size}
                  </span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              )}
            </div>

            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-800">Quels problèmes as-tu identifiés ?</h2>
              <p className="text-sm text-gray-400 mt-1">Coche les pain points qui correspondent à ton prospect</p>
            </div>

            {industryPPs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-400">Aucun pain point associé à cette industrie.</p>
                <button onClick={() => setStep(1)} className="mt-3 text-sm font-semibold" style={{ color: F.primary }}>
                  Changer d&apos;industrie
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {ppGrouped.map(({ cat, items, cfg }) => {
                  const allChecked = items.every((pp) => selectedPPIds.has(pp.id));
                  const someChecked = items.some((pp) => selectedPPIds.has(pp.id));
                  return (
                    <div
                      key={cat}
                      className="bg-white rounded-2xl border overflow-hidden"
                      style={{ borderColor: cfg.border }}
                    >
                      {/* Category header */}
                      <div
                        className="px-5 py-3 flex items-center justify-between"
                        style={{ background: cfg.lightBg }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                          <span className="text-sm font-bold" style={{ color: cfg.color }}>{cat}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.color + "20", color: cfg.color }}>
                            {items.length}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPPIds((prev) => {
                              const next = new Set(prev);
                              if (allChecked) items.forEach((pp) => next.delete(pp.id));
                              else items.forEach((pp) => next.add(pp.id));
                              return next;
                            });
                          }}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
                          style={{
                            background: allChecked ? cfg.color : "white",
                            color: allChecked ? "white" : cfg.color,
                            border: `1px solid ${cfg.color}`,
                          }}
                        >
                          {allChecked ? "Tout désélectionner" : someChecked ? "Tout sélectionner" : "Tout sélectionner"}
                        </button>
                      </div>

                      {/* Pain points */}
                      <div className="divide-y divide-gray-50">
                        {items.map((pp) => {
                          const checked = selectedPPIds.has(pp.id);
                          return (
                            <label
                              key={pp.id}
                              className="flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50"
                            >
                              <div className="mt-0.5 shrink-0">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setSelectedPPIds((prev) => {
                                      const next = new Set(prev);
                                      if (checked) next.delete(pp.id);
                                      else next.add(pp.id);
                                      return next;
                                    });
                                  }}
                                  className="sr-only"
                                />
                                <div
                                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                                  style={{
                                    borderColor: checked ? cfg.color : "#d1d5db",
                                    background: checked ? cfg.color : "white",
                                  }}
                                >
                                  {checked && (
                                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                      <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 leading-snug">{pp.name}</p>
                                {pp.descriptionTerrain && (
                                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 leading-relaxed">{pp.descriptionTerrain}</p>
                                )}
                              </div>
                              {pp.frequence && (
                                <span
                                  className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                                  style={{
                                    background: pp.frequence.toLowerCase().includes("élevée") || pp.frequence.toLowerCase().includes("haute") || pp.frequence.toLowerCase().includes("forte")
                                      ? "#fff1f2" : pp.frequence.toLowerCase().includes("moyenne") || pp.frequence.toLowerCase().includes("modérée")
                                        ? "#FFF0D6" : "#f3f4f6",
                                    color: pp.frequence.toLowerCase().includes("élevée") || pp.frequence.toLowerCase().includes("haute") || pp.frequence.toLowerCase().includes("forte")
                                      ? "#be123c" : pp.frequence.toLowerCase().includes("moyenne") || pp.frequence.toLowerCase().includes("modérée")
                                        ? "#7A4A00" : "#6b7280",
                                  }}
                                >
                                  {pp.frequence}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedPPIds.size > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: F.primary, boxShadow: "0 2px 12px rgba(57,121,193,0.35)" }}
                >
                  Générer le brief RDV
                  <span className="px-1.5 py-0.5 rounded-md text-xs" style={{ background: "rgba(255,255,255,0.25)" }}>
                    {selectedPPIds.size} pain point{selectedPPIds.size > 1 ? "s" : ""}
                  </span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════ STEP 3 */}
        {step === 3 && selectedIndustry && (
          <div>
            {/* Header brief */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold" style={{ background: indCfg.lightBg, color: indCfg.color }}>
                  {selectedIndustry.name}
                </div>
                <span className="text-sm text-gray-400">
                  {selectedPPIds.size} problème{selectedPPIds.size > 1 ? "s" : ""} sélectionné{selectedPPIds.size > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton text={briefText} label="Tout copier" />
                <Link
                  href="/chat"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: F.orange, boxShadow: "0 1px 4px rgba(201,130,10,0.3)" }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                  Approfondir avec l'IA
                </Link>
              </div>
            </div>

            <div className="space-y-4">

              {/* Enjeux */}
              {brief.enjeux.length > 0 && (
                <BriefSection
                  icon="📌" title="Enjeux business détectés" color="#C9820A" lightBg="#FFF0D6"
                  copyText={brief.enjeux.map((e) => `• ${e.name}`).join("\n")}
                  count={brief.enjeux.length}
                >
                  <div className="flex flex-wrap gap-2 pt-1">
                    {brief.enjeux.map((e) => (
                      <Link key={e.id} href={`/enjeux?id=${e.id}`}>
                        <span className="text-sm px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:opacity-80 transition-opacity" style={{ background: "#FFF0D6", color: "#7A4A00" }}>
                          {e.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </BriefSection>
              )}

              {/* Pain points sélectionnés */}
              <BriefSection
                icon="❌" title="Pain points identifiés" color="#be123c" lightBg="#fff1f2"
                copyText={selectedPPs.map((p) => `• ${p.name}`).join("\n")}
                count={selectedPPs.length}
              >
                <div className="space-y-2 pt-1">
                  {selectedPPs.map((pp) => (
                    <div key={pp.id} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "#be123c" }} />
                      <div>
                        <Link href={`/painpoints?id=${pp.id}`}>
                          <span className="text-sm font-semibold text-gray-800 hover:text-[#be123c] transition-colors cursor-pointer">{pp.name}</span>
                        </Link>
                        {pp.descriptionTerrain && (
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{pp.descriptionTerrain}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </BriefSection>

              {/* Solutions */}
              {brief.solutionRefs.length > 0 && (
                <BriefSection
                  icon="✅" title="Arguments Fleeti" color="#15803d" lightBg="#f0fdf4"
                  copyText={brief.solutionRefs.map((s) => `• ${s.name}`).join("\n")}
                  count={brief.solutionRefs.length}
                >
                  <div className="flex flex-wrap gap-2 pt-1">
                    {brief.solutionRefs.map((s) => (
                      <Link key={s.id} href={`/solutions?id=${s.id}`}>
                        <span className="text-sm px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:opacity-80 transition-opacity" style={{ background: "#f0fdf4", color: "#15803d" }}>
                          {s.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </BriefSection>
              )}

              {/* Bénéfices — section mise en avant */}
              {brief.benefices.length > 0 && (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #224873 0%, #3979C1 100%)",
                    boxShadow: "0 4px 20px rgba(57,121,193,0.30)",
                  }}
                >
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Bénéfices clés à mettre en avant</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {brief.benefices.length} bénéfice{brief.benefices.length > 1 ? "s" : ""} identifié{brief.benefices.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <CopyButton text={brief.benefices.map((b) => `• ${b.name}`).join("\n")} />
                  </div>
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {brief.benefices.map((b) => (
                        <Link key={b.id} href={`/benefices?id=${b.id}`}>
                          <div
                            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                            style={{ background: "rgba(255,255,255,0.12)" }}
                          >
                            <svg className="w-4 h-4 shrink-0" style={{ color: "#9CC3F0" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            <span className="text-sm font-semibold text-white leading-snug">{b.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Questions stratégiques */}
              {brief.questions.length > 0 && (
                <BriefSection
                  icon="💡" title="Questions stratégiques à poser" color="#5b21b6" lightBg="#ede9fe"
                  copyText={brief.questions.map((q) => `• ${q}`).join("\n")}
                  count={brief.questions.length}
                >
                  <div className="space-y-2 pt-1">
                    {brief.questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "#ede9fe" }}>
                        <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#8b5cf6", color: "white" }}>
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-700 leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </BriefSection>
              )}

              {/* Capacités produit */}
              {brief.capacites.length > 0 && (
                <BriefSection
                  icon="⚙️" title="Capacités produit à mentionner" color="#0e7490" lightBg="#ecfeff"
                  copyText={brief.capacites.map((c) => `• ${c.name}`).join("\n")}
                  count={brief.capacites.length}
                >
                  <div className="flex flex-wrap gap-2 pt-1">
                    {brief.capacites.map((c) => (
                      <Link key={c.id} href={`/capacites?id=${c.id}`}>
                        <span className="text-sm px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:opacity-80 transition-opacity" style={{ background: "#ecfeff", color: "#0e7490" }}>
                          {c.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </BriefSection>
              )}

              {/* Personas */}
              {brief.personas.length > 0 && (
                <BriefSection
                  icon="👤" title="Personas à cibler" color="#374151" lightBg="#f3f4f6"
                  copyText={brief.personas.map((p) => `• ${p.name}`).join("\n")}
                  count={brief.personas.length}
                >
                  <div className="flex flex-wrap gap-2 pt-1">
                    {brief.personas.map((p) => (
                      <Link key={p.id} href={`/personas?id=${p.id}`}>
                        <span className="text-sm px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:opacity-80 transition-opacity" style={{ background: "#f3f4f6", color: "#374151" }}>
                          {p.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </BriefSection>
              )}

            </div>

            {/* Footer actions */}
            <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={() => { setStep(1); setSelectedIndustry(null); setSelectedPPIds(new Set()); }}
                className="text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
              >
                Recommencer
              </button>
              <div className="flex items-center gap-3">
                <CopyButton text={briefText} label="Copier le brief complet" />
                <Link
                  href="/presentation"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: F.primary, boxShadow: "0 2px 8px rgba(57,121,193,0.3)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  Générer la présentation
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Brief section card ───────────────────────────────────────────────────────
function BriefSection({
  icon, title, color, lightBg, copyText, count, children,
}: {
  icon: string; title: string; color: string; lightBg: string;
  copyText: string; count: number; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ background: lightBg }}>
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-bold" style={{ color }}>{title}</span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: color, color: "white", fontSize: "11px", lineHeight: "1.2" }}
          >
            {count}
          </span>
        </div>
        <CopyButton text={copyText} />
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
