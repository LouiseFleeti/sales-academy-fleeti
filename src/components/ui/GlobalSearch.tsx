"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cachedFetch } from "@/lib/clientCache";
import type { Industry, Enjeu, PainPoint, Solution, Benefice } from "@/types/notion";

type ResultItem = { id: string; name: string; description?: string };
type GroupedResults = {
  industries: ResultItem[];
  enjeux: ResultItem[];
  painpoints: ResultItem[];
  solutions: ResultItem[];
  benefices: ResultItem[];
};

const GROUPS: Array<{
  key: keyof GroupedResults;
  label: string;
  color: string;
  lightBg: string;
  href: (id: string) => string;
}> = [
  { key: "industries", label: "Industries", color: "#224873", lightBg: "#E8F2FD", href: (id) => `/industries?id=${id}` },
  { key: "enjeux", label: "Enjeux", color: "#C9820A", lightBg: "#FFF0D6", href: (id) => `/enjeux?id=${id}` },
  { key: "painpoints", label: "Pain points", color: "#be123c", lightBg: "#fff1f2", href: (id) => `/painpoints?id=${id}` },
  { key: "solutions", label: "Solutions", color: "#15803d", lightBg: "#f0fdf4", href: (id) => `/solutions?id=${id}` },
  { key: "benefices", label: "Bénéfices", color: "#3979C1", lightBg: "#E8F2FD", href: (id) => `/benefices?id=${id}` },
];

const MAX_PER_GROUP = 4;

function matchesQuery(name: string, description: string | undefined, q: string): boolean {
  return (
    name.toLowerCase().includes(q) ||
    (description ?? "").toLowerCase().includes(q)
  );
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GroupedResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Autofocus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults(null);
      setActiveIndex(-1);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    const lq = q.toLowerCase();
    try {
      const [industries, enjeux, painpoints, solutions, benefices] = await Promise.all([
        cachedFetch<Industry[]>("/api/notion/industries"),
        cachedFetch<Enjeu[]>("/api/notion/enjeux"),
        cachedFetch<PainPoint[]>("/api/notion/painpoints"),
        cachedFetch<Solution[]>("/api/notion/solutions"),
        cachedFetch<Benefice[]>("/api/notion/benefices"),
      ]);
      setResults({
        industries: (Array.isArray(industries) ? industries : [])
          .filter((i) => matchesQuery(i.name, i.description, lq))
          .slice(0, MAX_PER_GROUP),
        enjeux: (Array.isArray(enjeux) ? enjeux : [])
          .filter((i) => matchesQuery(i.name, i.description, lq))
          .slice(0, MAX_PER_GROUP),
        painpoints: (Array.isArray(painpoints) ? painpoints : [])
          .filter((i) => matchesQuery(i.name, i.descriptionTerrain, lq))
          .slice(0, MAX_PER_GROUP),
        solutions: (Array.isArray(solutions) ? solutions : [])
          .filter((i) => matchesQuery(i.name, i.description, lq))
          .slice(0, MAX_PER_GROUP),
        benefices: (Array.isArray(benefices) ? benefices : [])
          .filter((i) => matchesQuery(i.name, i.description, lq))
          .slice(0, MAX_PER_GROUP),
      });
    } finally {
      setLoading(false);
      setActiveIndex(-1);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 250);
    return () => clearTimeout(t);
  }, [query, search]);

  // Flat list of all results for keyboard nav
  const flatItems = results
    ? GROUPS.flatMap((g) =>
        results[g.key].map((item) => ({ item, group: g }))
      )
    : [];

  function navigateTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDownInput(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0 && flatItems[activeIndex]) {
      const { item, group } = flatItems[activeIndex];
      navigateTo(group.href(item.id));
    }
  }

  const hasResults = results && GROUPS.some((g) => results[g.key].length > 0);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-400 transition-all hover:border-gray-300 hover:text-gray-600"
        style={{ background: "#f9fafb" }}
        title="Recherche globale (⌘K)"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <span className="hidden sm:inline text-xs">Rechercher</span>
        <kbd className="hidden sm:inline text-xs px-1 py-0.5 rounded bg-gray-100 text-gray-400 font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-24 z-[101] w-full max-w-xl -translate-x-1/2 rounded-2xl bg-white overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)" }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin shrink-0" style={{ borderColor: "#3979C1", borderTopColor: "transparent" }} />
          ) : (
            <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDownInput}
            placeholder="Rechercher une industrie, enjeu, pain point, solution…"
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}
              className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors shrink-0"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
          <kbd
            className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-mono shrink-0 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto">
          {query.trim().length < 2 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">Tapez au moins 2 caractères pour rechercher dans toutes les bases</p>
            </div>
          )}

          {query.trim().length >= 2 && !loading && !hasResults && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">Aucun résultat pour &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {hasResults && (
            <div className="py-2">
              {GROUPS.map((group) => {
                const items = results![group.key];
                if (items.length === 0) return null;
                return (
                  <div key={group.key} className="mb-1">
                    <div className="px-4 py-1.5 flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: group.color }}>
                        {group.label}
                      </span>
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: group.lightBg, color: group.color }}>
                        {items.length}
                      </span>
                    </div>
                    {items.map((item) => {
                      const globalIdx = flatItems.findIndex((f) => f.item.id === item.id && f.group.key === group.key);
                      const isActive = globalIdx === activeIndex;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigateTo(group.href(item.id))}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors"
                          style={{ background: isActive ? group.lightBg : "transparent" }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: group.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 leading-snug truncate">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-gray-400 truncate leading-relaxed">{item.description}</p>
                            )}
                          </div>
                          <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-gray-50 flex items-center gap-4">
          <span className="text-xs text-gray-300 flex items-center gap-1">
            <kbd className="font-mono text-gray-400 bg-gray-100 px-1 rounded">↑↓</kbd> naviguer
          </span>
          <span className="text-xs text-gray-300 flex items-center gap-1">
            <kbd className="font-mono text-gray-400 bg-gray-100 px-1 rounded">↵</kbd> ouvrir
          </span>
          <span className="text-xs text-gray-300 flex items-center gap-1">
            <kbd className="font-mono text-gray-400 bg-gray-100 px-1 rounded">Esc</kbd> fermer
          </span>
        </div>
      </div>
    </>
  );
}
