"use client";

import Link from "next/link";

const SALES_MODULES = [
  { label: "Industries", href: "/industries", icon: "🏭" },
  { label: "Personas", href: "/personas", icon: "👤" },
  { label: "Enjeux business", href: "/enjeux", icon: "💼" },
  { label: "Pain points", href: "/painpoints", icon: "⚡" },
  { label: "Bénéfices", href: "/benefices", icon: "⭐" },
  { label: "Solutions", href: "/solutions", icon: "✅" },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ background: "#f4f6f9" }}>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg, #182f4e 0%, #224873 50%, #2e6fba 100%)" }}>
        <div className="max-w-screen-lg mx-auto px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: "rgba(255,255,255,0.1)" }}>
            <svg className="w-3.5 h-3.5" style={{ color: "#9CC3F0" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9CC3F0" }}>Fleeti Academy</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Tout ce qu'il faut savoir,<br />
            <span style={{ color: "#9CC3F0" }}>quand il le faut.</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            L'outil de référence des équipes Fleeti — bases de connaissance, argumentaires et outils métier en un seul endroit.
          </p>
        </div>
      </div>

      {/* ── Les deux portails ── */}
      <div className="max-w-screen-lg mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Sales Academy */}
          <div className="bg-white rounded-3xl border overflow-hidden" style={{ borderColor: "#e5e7eb", boxShadow: "0 4px 24px rgba(34,72,115,0.08)" }}>
            {/* Header */}
            <div className="px-8 py-6 border-b" style={{ background: "linear-gradient(135deg, #E8F2FD 0%, #f0f7ff 100%)", borderColor: "#D7E9FB" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3979C1, #224873)" }}>
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-black" style={{ color: "#224873" }}>Sales Academy</h2>
                  <p className="text-xs font-semibold" style={{ color: "#3979C1" }}>Équipe commerciale</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#4a6fa5" }}>
                Argumentaires, pain points, solutions et bénéfices Fleeti — tout ce qu'il faut pour préparer et réussir tes RDV.
              </p>
            </div>

            {/* Modules grid */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-2 mb-5">
                {SALES_MODULES.map((m) => (
                  <Link key={m.href} href={m.href}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover:border-[#9CC3F0] hover:bg-[#E8F2FD] group"
                    style={{ borderColor: "#f0f4f8" }}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-xs font-semibold text-center leading-snug" style={{ color: "#374151" }}>{m.label}</span>
                  </Link>
                ))}
              </div>
              <Link
                href="/rdv"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #3979C1, #224873)", boxShadow: "0 2px 12px rgba(57,121,193,0.3)" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Préparer un RDV
              </Link>
            </div>
          </div>

          {/* Ops Academy */}
          <div className="bg-white rounded-3xl border overflow-hidden" style={{ borderColor: "#e5e7eb", boxShadow: "0 4px 24px rgba(201,130,10,0.07)" }}>
            {/* Header */}
            <div className="px-8 py-6 border-b" style={{ background: "linear-gradient(135deg, #FFF8ED 0%, #fffdf7 100%)", borderColor: "#fde8b4" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9820A, #7A4A00)" }}>
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-black" style={{ color: "#7A4A00" }}>Ops Academy</h2>
                  <p className="text-xs font-semibold" style={{ color: "#C9820A" }}>Équipe opérationnelle</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#8a6030" }}>
                Processus, procédures et base de connaissance ops — posez vos questions à l'IA ou ouvrez un ticket si besoin.
              </p>
            </div>

            {/* Ops content */}
            <div className="p-6">
              <div className="space-y-2 mb-5">
                {[
                  { icon: "🤖", label: "Poser une question à l'IA", desc: "Réponse instantanée basée sur vos process" },
                  { icon: "🎫", label: "Ouvrir un ticket", desc: "Escalader vers le VP si l'IA ne suffit pas" },
                  { icon: "📋", label: "Base de connaissance", desc: "Procédures, guides et documentation Ops" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: "#fde8b4", background: "#fffdf7" }}>
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#7A4A00" }}>{item.label}</p>
                      <p className="text-xs" style={{ color: "#a07040" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold border-2 border-dashed"
                style={{ borderColor: "#f5c97a", color: "#C9820A", background: "#FFFBF0" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Bientôt disponible ici
              </div>
            </div>
          </div>

        </div>

        {/* ── Chat IA global ── */}
        <div className="mt-6 bg-white rounded-2xl border p-6 flex items-center justify-between gap-6" style={{ borderColor: "#e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #6d28d9, #4c1d95)" }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Chat IA Fleeti</p>
              <p className="text-xs text-gray-400">Posez n'importe quelle question — l'IA répond en s'appuyant sur toute la base de connaissance Fleeti</p>
            </div>
          </div>
          <Link
            href="/chat"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6d28d9, #4c1d95)", boxShadow: "0 2px 12px rgba(109,40,217,0.3)" }}
          >
            Ouvrir le chat
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </Link>
        </div>

      </div>
    </div>
  );
}
