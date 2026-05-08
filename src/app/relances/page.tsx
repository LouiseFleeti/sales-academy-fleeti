"use client";

import { useState, useEffect, useMemo } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cachedFetch } from "@/lib/clientCache";
import type { Relance } from "@/types/notion";

// ─── Fleeti tokens ────────────────────────────────────────────────────────────
const F = {
  primaryMain:  "#3979C1",
  primaryDark:  "#224873",
  primaryLight: "#9CC3F0",
  primaryBg:    "#E8F2FD",
  dark:         "#131313",
  midGrey:      "#89969E",
  lightGrey:    "#D7E1EC",
  successMain:  "#22875B",
  successBg:    "#DDF6EB",
  warningMain:  "#C9820A",
  warningBg:    "#FFF0D6",
};

const PRODUITS = ["GPS", "Dashcam"] as const;
const SITUATIONS = ["Après appel", "Envoi direct", "Relance 1", "Relance 2", "Relance 3"] as const;
const LANGUES = ["FR", "EN"] as const;

type Produit = typeof PRODUITS[number];
type Situation = typeof SITUATIONS[number];
type Langue = typeof LANGUES[number];

const SITUATION_DESC: Record<string, string> = {
  "Après appel":  "1er email après un appel téléphonique",
  "Envoi direct": "1er envoi sans appel préalable",
  "Relance 1":    "Suivi après l'envoi initial",
  "Relance 2":    "2ème suivi si pas de réponse",
  "Relance 3":    "Fermeture de boucle",
};

// ─── Substitution des variables ───────────────────────────────────────────────
function applyVars(text: string, prenom: string, entreprise: string, nbVehicules: string) {
  return text
    .replace(/\{prenom\}/gi, prenom || "[Prénom]")
    .replace(/\{entreprise\}/gi, entreprise || "[Entreprise]")
    .replace(/\{nb_vehicules\}/gi, nbVehicules || "[Nb véhicules]");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: F.midGrey }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none placeholder-gray-300 transition-all"
        style={{ borderColor: F.lightGrey, color: F.dark }}
        onFocus={(e) => { e.target.style.borderColor = F.primaryMain; e.target.style.boxShadow = `0 0 0 3px ${F.primaryBg}`; }}
        onBlur={(e) => { e.target.style.borderColor = F.lightGrey; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RelancesPage() {
  const [relances, setRelances] = useState<Relance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filtres
  const [produit, setProduit] = useState<Produit>("GPS");
  const [situation, setSituation] = useState<Situation>("Après appel");
  const [langue, setLangue] = useState<Langue>("FR");

  // Variables
  const [prenom, setPrenom] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [nbVehicules, setNbVehicules] = useState("");

  // Copy state
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedObjet, setCopiedObjet] = useState(false);

  useEffect(() => {
    cachedFetch<Relance[]>("/api/notion/relances")
      .then((data) => { setRelances(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // Template actif
  const template = useMemo(() => {
    return relances.find(
      (r) =>
        r.produit === produit &&
        r.situation === situation &&
        r.langue === langue
    ) || null;
  }, [relances, produit, situation, langue]);

  const objet = useMemo(
    () => template ? applyVars(template.objet, prenom, entreprise, nbVehicules) : "",
    [template, prenom, entreprise, nbVehicules]
  );
  const corps = useMemo(
    () => template ? applyVars(template.corps, prenom, entreprise, nbVehicules) : "",
    [template, prenom, entreprise, nbVehicules]
  );

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Objet : ${objet}\n\n${corps}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };
  const handleCopyObjet = () => {
    navigator.clipboard.writeText(objet);
    setCopiedObjet(true);
    setTimeout(() => setCopiedObjet(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ background: "#f4f6f9" }}>
      {/* Header */}
      <div className="bg-white border-b px-8 py-5" style={{ borderColor: F.lightGrey }}>
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: F.dark }}>Templates de relance</h1>
            <p className="text-sm mt-0.5" style={{ color: F.midGrey }}>
              Sélectionne le produit et la situation pour générer l&apos;email
            </p>
          </div>
          {/* Toggle langue */}
          <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ borderColor: F.lightGrey, background: "#f4f6f9" }}>
            {LANGUES.map((l) => (
              <button
                key={l}
                onClick={() => setLangue(l)}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: langue === l ? F.primaryMain : "transparent",
                  color: langue === l ? "white" : F.midGrey,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Chargement des templates..." />
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: "#C94A6A" }}>Impossible de charger les templates</p>
            <p className="text-xs mt-1" style={{ color: F.midGrey }}>Vérifier la variable NOTION_DB_RELANCES dans .env.local</p>
          </div>
        </div>
      ) : (
        <div className="max-w-screen-xl mx-auto px-8 py-8 flex gap-6 items-start">

          {/* ── Panneau gauche ── */}
          <div className="w-64 shrink-0 space-y-4">

            {/* Produit */}
            <div className="bg-white rounded-2xl border p-5" style={{ borderColor: F.lightGrey, boxShadow: "0 1px 4px rgba(34,72,115,0.06)" }}>
              <div className="px-0 pb-3 mb-3 border-b" style={{ borderColor: F.lightGrey }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: F.primaryDark }}>Produit</p>
              </div>
              <div className="space-y-2">
                {PRODUITS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProduit(p)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                    style={{
                      background: produit === p ? F.primaryBg : "transparent",
                      color: produit === p ? F.primaryDark : F.midGrey,
                      border: `1px solid ${produit === p ? F.primaryLight : "transparent"}`,
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: produit === p ? F.primaryMain : F.lightGrey }}
                    >
                      {produit === p && <div className="w-2 h-2 rounded-full" style={{ background: F.primaryMain }} />}
                    </div>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Situation */}
            <div className="bg-white rounded-2xl border p-5" style={{ borderColor: F.lightGrey, boxShadow: "0 1px 4px rgba(34,72,115,0.06)" }}>
              <div className="pb-3 mb-3 border-b" style={{ borderColor: F.lightGrey }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: F.primaryDark }}>Situation</p>
              </div>
              <div className="space-y-2">
                {SITUATIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSituation(s)}
                    className="w-full text-left px-3 py-2.5 rounded-xl transition-all"
                    style={{
                      background: situation === s ? F.primaryBg : "transparent",
                      border: `1px solid ${situation === s ? F.primaryLight : "transparent"}`,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: situation === s ? F.primaryMain : F.lightGrey }}
                      >
                        {situation === s && <div className="w-2 h-2 rounded-full" style={{ background: F.primaryMain }} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-snug" style={{ color: situation === s ? F.primaryDark : F.dark }}>
                          {s}
                        </p>
                        <p className="text-xs mt-0.5 leading-snug" style={{ color: F.midGrey }}>
                          {SITUATION_DESC[s]}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Variables */}
            <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: F.lightGrey, boxShadow: "0 1px 4px rgba(34,72,115,0.06)" }}>
              <div className="pb-3 mb-1 border-b" style={{ borderColor: F.lightGrey }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: F.primaryDark }}>Personnaliser</p>
              </div>
              <FieldInput label="Prénom" value={prenom} onChange={setPrenom} placeholder="Ex : Marie" />
              <FieldInput label="Entreprise" value={entreprise} onChange={setEntreprise} placeholder="Ex : TransCo Ltée" />
              <FieldInput label="Nb véhicules" value={nbVehicules} onChange={setNbVehicules} placeholder="Ex : 25" />
            </div>
          </div>

          {/* ── Aperçu template ── */}
          <div className="flex-1 min-w-0">
            {!template ? (
              <div className="bg-white rounded-2xl border flex flex-col items-center justify-center py-20 text-center" style={{ borderColor: F.lightGrey }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: F.primaryBg }}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={F.primaryMain} strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold" style={{ color: F.dark }}>Aucun template trouvé</p>
                <p className="text-xs mt-1" style={{ color: F.midGrey }}>
                  Aucune entrée correspondant à {produit} / {situation} / {langue} dans Notion
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: F.lightGrey, boxShadow: "0 1px 4px rgba(34,72,115,0.06)" }}>
                {/* Template header */}
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: F.primaryBg, borderColor: F.primaryLight }}>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: F.primaryMain, color: "white" }}
                    >
                      {produit}
                    </span>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: "white", color: F.primaryDark, border: `1px solid ${F.lightGrey}` }}
                    >
                      {situation}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{ background: "white", color: F.midGrey, border: `1px solid ${F.lightGrey}` }}
                    >
                      {langue}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyObjet}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                      style={{
                        borderColor: copiedObjet ? F.successMain : F.lightGrey,
                        background: copiedObjet ? F.successBg : "white",
                        color: copiedObjet ? F.successMain : F.midGrey,
                      }}
                    >
                      {copiedObjet
                        ? <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Objet copié</>
                        : <>Copier l&apos;objet</>
                      }
                    </button>
                    <button
                      onClick={handleCopyEmail}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                      style={{ background: copiedEmail ? F.successMain : F.primaryMain }}
                    >
                      {copiedEmail
                        ? <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copié !</>
                        : <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copier l&apos;email</>
                      }
                    </button>
                  </div>
                </div>

                {/* Objet */}
                <div className="px-6 py-4 border-b flex items-start gap-3" style={{ borderColor: F.lightGrey }}>
                  <span className="text-xs font-bold uppercase tracking-wider shrink-0 mt-0.5" style={{ color: F.midGrey }}>Objet</span>
                  <p className="text-sm font-semibold" style={{ color: F.dark }}>{objet || <span style={{ color: F.midGrey, fontStyle: "italic" }}>Objet non renseigné</span>}</p>
                </div>

                {/* Corps */}
                <div className="px-6 py-6">
                  {corps ? (
                    <div className="text-sm leading-7 whitespace-pre-wrap" style={{ color: "#374151" }}>
                      {corps}
                    </div>
                  ) : (
                    <p className="text-sm italic" style={{ color: F.midGrey }}>Corps non renseigné dans Notion</p>
                  )}
                </div>

                {/* Footer — variables legend */}
                {(!prenom || !entreprise || !nbVehicules) && (
                  <div className="px-6 py-3 border-t flex items-center gap-2" style={{ borderColor: F.lightGrey, background: F.warningBg }}>
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={F.warningMain} strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-xs" style={{ color: F.warningMain }}>
                      Remplis les champs à gauche pour remplacer les variables dans l&apos;aperçu
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
