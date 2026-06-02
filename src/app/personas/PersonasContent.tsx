"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RelationTag from "@/components/ui/RelationTag";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cachedFetch } from "@/lib/clientCache";
import type { Persona } from "@/types/notion";

// ─── Fleeti tokens ────────────────────────────────────────────────────────────
const F = {
  primaryMain:  "#3979C1",
  primaryDark:  "#224873",
  primaryLight: "#9CC3F0",
  primaryBg:    "#E8F2FD",
  midGrey:      "#89969E",
  lightGrey:    "#D7E1EC",
  dark:         "#131313",
};

// Palette pour les avatars personas (cycle)
const AVATAR_PALETTE = [
  { bg: "#E8F2FD", color: "#224873" },
  { bg: "#D9F6F6", color: "#0B3636" },
  { bg: "#DDF6EB", color: "#145136" },
  { bg: "#FFF0D6", color: "#7A4A00" },
  { bg: "#FFE0E8", color: "#7A1A2E" },
  { bg: "#ede9fe", color: "#5b21b6" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ─── Persona card ─────────────────────────────────────────────────────────────

function PersonaCard({
  persona,
  index,
  isSelected,
  onClick,
}: {
  persona: Persona;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length];

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border transition-all overflow-hidden group"
      style={{
        borderColor: isSelected ? F.primaryMain : F.lightGrey,
        background: "white",
        boxShadow: isSelected
          ? `0 0 0 2px ${F.primaryMain}, 0 4px 16px rgba(57,121,193,0.12)`
          : "0 1px 4px rgba(34,72,115,0.06)",
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full transition-all"
        style={{ background: isSelected ? F.primaryMain : "transparent" }}
      />

      <div className="p-5">
        {/* Avatar + nom */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-black shrink-0"
            style={{ background: palette.bg, color: palette.color }}
          >
            {getInitials(persona.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-snug truncate" style={{ color: F.dark }}>
              {persona.name}
            </p>
            {persona.titre && (
              <p className="text-xs mt-0.5 leading-snug" style={{ color: F.midGrey }}>
                {persona.titre}
              </p>
            )}
          </div>
        </div>

        {/* Taille cible badge */}
        {persona.tailleCible && (
          <div className="mb-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: F.primaryBg, color: F.primaryDark }}
            >
              <svg className="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              {persona.tailleCible}
            </span>
          </div>
        )}

        {/* Objectif */}
        {persona.objectifPrincipal && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: F.midGrey }}>
            {persona.objectifPrincipal}
          </p>
        )}

        {/* Footer — nb relations */}
        {(persona.industries.length > 0 || persona.painPointsPrincipaux.length > 0) && (
          <div
            className="flex items-center gap-3 mt-4 pt-3 border-t text-xs"
            style={{ borderColor: F.lightGrey, color: F.midGrey }}
          >
            {persona.industries.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                {persona.industries.length} industrie{persona.industries.length > 1 ? "s" : ""}
              </span>
            )}
            {persona.painPointsPrincipaux.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {persona.painPointsPrincipaux.length} pain point{persona.painPointsPrincipaux.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function PersonaDetail({ persona, index, onClose }: { persona: Persona; index: number; onClose: () => void }) {
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b flex items-start justify-between gap-4" style={{ borderColor: F.lightGrey, background: F.primaryBg }}>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0"
            style={{ background: palette.bg, color: palette.color }}
          >
            {getInitials(persona.name)}
          </div>
          <div>
            <h2 className="text-xl font-bold leading-snug" style={{ color: F.dark }}>{persona.name}</h2>
            {persona.titre && (
              <p className="text-sm mt-0.5" style={{ color: F.primaryDark }}>{persona.titre}</p>
            )}
            {persona.tailleCible && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg mt-2"
                style={{ background: "white", color: F.primaryDark, border: `1px solid ${F.lightGrey}` }}
              >
                <svg className="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
                {persona.tailleCible}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
          style={{ color: F.midGrey }}
          onMouseEnter={(e) => (e.currentTarget.style.background = F.lightGrey)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

        {/* Objectif principal */}
        {persona.objectifPrincipal && (
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: F.lightGrey, boxShadow: "0 1px 4px rgba(34,72,115,0.06)" }}
          >
            <div className="px-5 py-2.5 flex items-center gap-2" style={{ background: F.primaryBg }}>
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={F.primaryDark} strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: F.primaryDark }}>
                Objectif principal
              </p>
            </div>
            <div className="px-5 py-4 bg-white">
              <p className="text-sm text-gray-800 leading-relaxed">{persona.objectifPrincipal}</p>
            </div>
          </div>
        )}

        {/* Industries */}
        {persona.industries.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: F.midGrey }}>
              Industries concernées
            </p>
            <div className="flex flex-wrap gap-2">
              {persona.industries.map((rel) => (
                <RelationTag key={rel.id} relation={rel} targetTab="industries" bgColor={F.primaryBg} textColor={F.primaryDark} />
              ))}
            </div>
          </div>
        )}

        {/* Pain points */}
        {persona.painPointsPrincipaux.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: F.midGrey }}>
              Pain points principaux
            </p>
            <div className="flex flex-wrap gap-2">
              {persona.painPointsPrincipaux.map((rel) => (
                <RelationTag key={rel.id} relation={rel} targetTab="painpoints" bgColor="#fff1f2" textColor="#7A1A2E" />
              ))}
            </div>
          </div>
        )}

        {!persona.objectifPrincipal && persona.industries.length === 0 && persona.painPointsPrincipaux.length === 0 && (
          <p className="text-sm italic" style={{ color: F.midGrey }}>Aucun contenu disponible pour ce persona.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PersonasContent() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    cachedFetch<Persona[]>("/api/notion/personas")
      .then((data) => { setPersonas(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    setSelectedId(id || null);
  }, [searchParams]);

  const filtered = useMemo(() => {
    if (!search.trim()) return personas;
    const q = search.toLowerCase();
    return personas.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.titre || "").toLowerCase().includes(q) ||
      (p.objectifPrincipal || "").toLowerCase().includes(q) ||
      (p.tailleCible || "").toLowerCase().includes(q)
    );
  }, [personas, search]);

  const selectedPersona = personas.find((p) => p.id === selectedId);
  const selectedIndex = personas.findIndex((p) => p.id === selectedId);

  const openDetail = (persona: Persona) => {
    setSelectedId(persona.id);
    router.push(`/personas?id=${persona.id}`, { scroll: false });
  };

  const closeDetail = () => {
    setSelectedId(null);
    router.push("/personas", { scroll: false });
  };

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ background: "#f4f6f9" }}>
      {/* Header */}
      <div className="bg-white border-b px-8 py-6" style={{ borderColor: F.lightGrey }}>
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: F.dark }}>Personas acheteurs</h1>
            <p className="text-sm mt-1 max-w-xl" style={{ color: "#6b7280" }}>Les profils d'interlocuteurs et décideurs à cibler selon le contexte client — leurs objectifs, leurs industries et les pain points qui les concernent en priorité.</p>
            <p className="text-xs mt-1" style={{ color: F.midGrey }}>
              {loading ? "Chargement..." : `${personas.length} persona${personas.length > 1 ? "s" : ""} identifié${personas.length > 1 ? "s" : ""}`}
            </p>
          </div>
          {/* Search */}
          <div className="relative w-72">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: F.midGrey }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un persona..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none placeholder-gray-300"
              style={{ borderColor: F.lightGrey }}
              onFocus={(e) => { e.target.style.borderColor = F.primaryMain; e.target.style.boxShadow = `0 0 0 3px ${F.primaryBg}`; }}
              onBlur={(e) => { e.target.style.borderColor = F.lightGrey; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-8 py-8 flex gap-6 items-start">
        {/* Grid */}
        <div className={`flex-1 min-w-0 transition-all ${selectedPersona ? "max-w-xl" : ""}`}>
          {loading ? (
            <LoadingSpinner label="Chargement des personas..." />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm font-medium" style={{ color: F.midGrey }}>Aucun persona trouvé</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${selectedPersona ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {filtered.map((persona, i) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  index={personas.indexOf(persona)}
                  isSelected={selectedId === persona.id}
                  onClick={() => openDetail(persona)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedPersona && (
          <div
            className="w-[480px] shrink-0 bg-white rounded-2xl border overflow-hidden sticky top-20"
            style={{ borderColor: F.lightGrey, boxShadow: "0 4px 24px rgba(34,72,115,0.10)", maxHeight: "calc(100vh - 120px)" }}
          >
            <PersonaDetail
              persona={selectedPersona}
              index={selectedIndex}
              onClose={closeDetail}
            />
          </div>
        )}
      </div>
    </div>
  );
}
