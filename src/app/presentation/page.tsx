"use client";

import { useState } from "react";
import Navbar from "@/components/ui/Navbar";

const SECTORS = [
  { value: "transport", label: "Transport & Logistique" },
  { value: "btp", label: "BTP & Construction" },
  { value: "froid", label: "Chaîne du froid & Agroalimentaire" },
  { value: "services", label: "Entreprises & Services" },
  { value: "industrie", label: "Industrie & Énergie" },
];

export default function PresentationPage() {
  const [client, setClient] = useState("");
  const [sector, setSector] = useState("");
  const [vehicles, setVehicles] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [sales, setSales] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!client.trim()) {
      setError("Le nom du client est requis.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/presentation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, sector, vehicles, logoUrl, sales }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur serveur");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Fleeti - ${client.trim()}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16 max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">Outil</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Présentation personnalisée</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Génère la présentation Fleeti adaptée au client en quelques secondes.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {/* Client name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nom du client <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex : Groupe Legrand"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Secteur d&apos;activité
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SECTORS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSector(sector === s.value ? "" : s.value)}
                  className={`px-3 py-2 rounded-lg text-sm border text-left transition-all ${
                    sector === s.value
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicles */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nombre de véhicules
            </label>
            <input
              type="number"
              min="1"
              placeholder="Ex : 120"
              value={vehicles}
              onChange={(e) => setVehicles(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">Remplace la démo live sur la slide de couverture</p>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              URL du logo client
            </label>
            <input
              type="url"
              placeholder="https://exemple.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">PNG ou JPG, fond transparent recommandé</p>
          </div>

          {/* Sales name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ton prénom &amp; nom (sales)
            </label>
            <input
              type="text"
              placeholder="Ex : Louise Duplaceau"
              value={sales}
              onChange={(e) => setSales(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleGenerate}
            disabled={loading || !client.trim()}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: loading ? "#6b7280" : "linear-gradient(135deg, #3979C1 0%, #224873 100%)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round"/>
                </svg>
                Génération en cours…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Générer et télécharger le .pptx
              </span>
            )}
          </button>
        </div>

        {/* What gets personalized */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ce qui est personnalisé</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              <span><strong>Slide 1 :</strong> titre &quot;Présentation — [Client]&quot;, nombre de véhicules dans la démo live, logo client</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              <span><strong>Slide 8 :</strong> secteur du client mis en avant en vert</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              <span><strong>Toutes les slides :</strong> footer avec le nom du client</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              <span><strong>Slide 11 :</strong> ton nom en contact</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
