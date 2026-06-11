"use client";

import Link from "next/link";


export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col" style={{ background: "#0f1e35" }}>

      {/* ── Hero Fleeti IA ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-20">

        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-8" style={{ background: "rgba(57,121,193,0.15)", border: "1px solid rgba(57,121,193,0.3)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#3979C1" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9CC3F0" }}>Fleeti Academy</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-black text-center leading-tight mb-4 text-white">
          Posez n'importe quelle<br />
          <span style={{ background: "linear-gradient(90deg, #9CC3F0, #3979C1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            question à Fleeti IA
          </span>
        </h1>
        <p className="text-base text-center mb-10 max-w-lg" style={{ color: "rgba(255,255,255,0.45)" }}>
          Sales ou Ops — l'IA répond en s'appuyant sur toute la base de connaissance Fleeti en temps réel.
        </p>

        {/* CTA Chat */}
        <Link
          href="/chat"
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.03]"
          style={{
            background: "linear-gradient(135deg, #3979C1 0%, #224873 100%)",
            boxShadow: "0 0 40px rgba(57,121,193,0.35), 0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Ouvrir Fleeti IA
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </Link>

        {/* Divider */}
        <div className="flex items-center gap-4 mt-16 mb-10 w-full max-w-2xl">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>ou accéder directement</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* ── Portails ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">

          {/* Sales Academy */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3979C1, #224873)" }}>
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">Sales Academy</h2>
                  <p className="text-xs" style={{ color: "#9CC3F0" }}>Équipe commerciale</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                Argumentaires, pain points, solutions et bénéfices Fleeti.
              </p>
            </div>
            <div className="p-4">
              <Link
                href="/industries"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "rgba(57,121,193,0.25)", color: "#9CC3F0", border: "1px solid rgba(57,121,193,0.3)" }}
              >
                Accéder à la Sales Academy →
              </Link>
            </div>
          </div>

          {/* Ops Academy */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9820A, #7A4A00)" }}>
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">Ops Academy</h2>
                  <p className="text-xs" style={{ color: "#f5c97a" }}>Équipe opérationnelle</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                Process, procédures et base de connaissance ops.
              </p>
            </div>
            <div className="p-4">
              <div
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold"
                style={{ border: "1px dashed rgba(245,201,122,0.3)", color: "rgba(245,201,122,0.5)" }}
              >
                Bientôt disponible
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
