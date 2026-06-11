"use client";

import Link from "next/link";

const MODULES = [
  { label: "Industries", href: "/industries", icon: "🏭", description: "Secteurs cibles et types de flotte" },
  { label: "Personas", href: "/personas", icon: "👤", description: "Profils acheteurs et décideurs" },
  { label: "Enjeux business", href: "/enjeux", icon: "💼", description: "Priorités stratégiques des prospects" },
  { label: "Pain points", href: "/painpoints", icon: "⚡", description: "Douleurs terrain identifiées" },
  { label: "Bénéfices", href: "/benefices", icon: "⭐", description: "La valeur apportée au client" },
  { label: "Solutions", href: "/solutions", icon: "✅", description: "Réponses Fleeti aux problèmes" },
];

export default function SalesAcademyPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center px-8 py-14" style={{ background: "#f8f9fb" }}>

      {/* Header */}
      <div className="w-full max-w-2xl mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3979C1, #224873)" }}>
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Sales Academy</h1>
            <p className="text-sm" style={{ color: "#3979C1" }}>Équipe commerciale</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3 max-w-lg">
          Tous les outils pour préparer tes RDV, argumenter et convaincre — en s'appuyant sur la base de connaissance Fleeti.
        </p>
      </div>

      {/* CTAs principaux */}
      <div className="w-full max-w-2xl mb-10 flex flex-col sm:flex-row gap-3">
        <Link
          href="/rdv"
          className="flex items-center justify-center gap-3 flex-1 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #3979C1 0%, #224873 100%)",
            boxShadow: "0 4px 20px rgba(57,121,193,0.3)",
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Préparer un RDV
        </Link>
        <Link
          href="/presentation"
          className="flex items-center justify-center gap-3 flex-1 py-4 rounded-2xl text-base font-bold transition-all hover:scale-[1.02] hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #C9820A 0%, #7A4A00 100%)",
            color: "white",
            boxShadow: "0 4px 20px rgba(201,130,10,0.3)",
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
          </svg>
          Générer une présentation
        </Link>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 w-full max-w-2xl mb-8">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Base de connaissance</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-gray-100 hover:border-[#3979C1] hover:shadow-md transition-all group"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <span className="text-2xl">{m.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 group-hover:text-[#3979C1] transition-colors">{m.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-[#3979C1] transition-all group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        ))}
      </div>

    </div>
  );
}
