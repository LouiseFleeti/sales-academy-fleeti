"use client";

import { useState } from "react";
import Navbar from "@/components/ui/Navbar";

const VEHICLE_TYPES = [
  { value: "VL",       label: "VL",       desc: "Véhicules légers" },
  { value: "VUL",      label: "VUL",      desc: "Utilitaires légers" },
  { value: "PL",       label: "PL",       desc: "Poids lourds" },
  { value: "engins",   label: "Engins",   desc: "BTP / chantier" },
  { value: "machines", label: "Machines", desc: "Industriel" },
];

const PAIN_POINTS = [
  { value: "silos",           label: "Outils en silos",                 icon: "🔀" },
  { value: "flotte",          label: "Flotte hétérogène mal couverte",  icon: "🚛" },
  { value: "tco",             label: "TCO non maîtrisé",                icon: "💸" },
  { value: "sinistralite",    label: "Sinistralité subie",              icon: "🚨" },
  { value: "contrats",        label: "Contrats LLD/LOA dispersés",      icon: "📄" },
  { value: "fournisseurs",    label: "Fournisseurs non intégrés",       icon: "🔌" },
  { value: "electrification", label: "Électrification sans visibilité", icon: "⚡" },
  { value: "conformite",      label: "Conformité à risque",             icon: "⚠️" },
];

export default function PresentationPage() {
  const [client, setClient]             = useState("");
  const [vehicles, setVehicles]         = useState("");
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [painPoints, setPainPoints]     = useState<string[]>([]);
  const [logoB64, setLogoB64]           = useState("");
  const [logoName, setLogoName]         = useState("");
  const [sales, setSales]               = useState("");
  const [loadingType, setLoadingType]   = useState<"envoyer"|"rdv"|null>(null);
  const [error, setError]               = useState("");

  const toggle = (arr: string[], val: string, set: (a: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const generate = async (type: "envoyer" | "rdv") => {
    if (!client.trim()) { setError("Le nom du client est requis."); return; }
    setError("");
    setLoadingType(type);
    try {
      const res = await fetch("/api/presentation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, client, vehicles, vehicleTypes, painPoints, logoB64, sales }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erreur serveur"); }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${client.trim()} x Fleeti${type === "rdv" ? " (RDV)" : ""}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoadingType(null);
    }
  };

  const loading = loadingType !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16 max-w-2xl mx-auto px-6">

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Outil sales</p>
          <h1 className="text-2xl font-bold text-gray-900">Prez client</h1>
          <p className="text-sm text-gray-500 mt-1">Remplis les infos, puis choisis le format à générer.</p>
        </div>

        <div className="space-y-4">

          {/* Nom du client */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Nom du client <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex : Groupe Legrand"
              value={client}
              onChange={e => setClient(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          {/* Problématiques */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Problématiques évoquées</label>
            <p className="text-xs text-gray-400 mb-3">Ces points seront mis en avant sur la slide &quot;Le Problème&quot;.</p>
            <div className="grid grid-cols-2 gap-2">
              {PAIN_POINTS.map(pp => (
                <button key={pp.value}
                  onClick={() => toggle(painPoints, pp.value, setPainPoints)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border text-left transition-all ${
                    painPoints.includes(pp.value)
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-base leading-none">{pp.icon}</span>
                  <span>{pp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Flotte */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Flotte</label>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1.5">Nombre de véhicules</p>
                <input
                  type="number" min="1" placeholder="Ex : 120"
                  value={vehicles} onChange={e => setVehicles(e.target.value)}
                  className="w-40 px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1.5">Typologie</p>
                <div className="flex flex-wrap gap-2">
                  {VEHICLE_TYPES.map(vt => (
                    <button key={vt.value}
                      onClick={() => toggle(vehicleTypes, vt.value, setVehicleTypes)}
                      className={`flex flex-col items-center px-4 py-2 rounded-lg border text-sm transition-all ${
                        vehicleTypes.includes(vt.value)
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-bold text-sm">{vt.label}</span>
                      <span className="text-xs font-normal opacity-70">{vt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <details className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <summary className="px-5 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-gray-800 transition-colors">
              Options supplémentaires
            </summary>
            <div className="px-5 pb-5 space-y-4 border-t border-gray-50 pt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Logo client</label>
                <label className={`flex items-center gap-3 px-3.5 py-3 rounded-lg border cursor-pointer transition-all ${logoB64 ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                  <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                  </svg>
                  <span className="text-sm text-gray-600 truncate">{logoName || "Choisir un fichier PNG / JPG…"}</span>
                  {logoB64 && <span className="ml-auto text-xs text-green-600 font-medium shrink-0">✓</span>}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLogoName(file.name);
                      const reader = new FileReader();
                      reader.onload = ev => setLogoB64((ev.target?.result as string).split(",")[1]);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1">Apparaît sur la slide de couverture · fond transparent recommandé</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ton nom (sales)</label>
                <input type="text" placeholder="Ex : Louise Duplaceau"
                  value={sales} onChange={e => setSales(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 transition-all"
                />
              </div>
            </div>
          </details>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          {/* Double CTA */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => generate("envoyer")} disabled={loading || !client.trim()}
              className="py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #3979C1 0%, #224873 100%)" }}
            >
              {loadingType === "envoyer"
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round"/></svg>Génération…</>
                : <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>📤 À envoyer</>
              }
            </button>
            <button onClick={() => generate("rdv")} disabled={loading || !client.trim()}
              className="py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2"
              style={{ borderColor: "#3979C1", color: "#3979C1", background: "white" }}
            >
              {loadingType === "rdv"
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round"/></svg>Génération…</>
                : <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>🎤 Pour RDV</>
              }
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
