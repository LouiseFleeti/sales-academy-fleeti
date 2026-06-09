"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import GlobalSearch from "@/components/ui/GlobalSearch";
import { clearClientCache } from "@/lib/clientCache";

const NAV_GROUPS = [
  {
    label: "Contexte client",
    color: "#3979C1",
    lightBg: "#E8F2FD",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    items: [
      { label: "Industries", href: "/industries", description: "Secteurs cibles et types de flotte" },
      { label: "Personas", href: "/personas", description: "Profils acheteurs et décideurs" },
    ],
  },
  {
    label: "Problèmes",
    color: "#be123c",
    lightBg: "#fff1f2",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    items: [
      { label: "Enjeux business", href: "/enjeux", description: "Priorités stratégiques des prospects" },
      { label: "Pain points", href: "/painpoints", description: "Douleurs terrain identifiées" },
    ],
  },
  {
    label: "Réponses Fleeti",
    color: "#15803d",
    lightBg: "#f0fdf4",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    items: [
      { label: "Bénéfices", href: "/benefices", description: "Point d'entrée — la valeur apportée au client", primary: true },
      { label: "Solutions", href: "/solutions", description: "Réponses Fleeti aux problèmes" },
      { label: "Capacités produit", href: "/capacites", description: "Ce que le produit sait faire" },
      { label: "Fonctionnalités", href: "/fonctionnalites", description: "Modules et features détaillés" },
    ],
  },
  {
    label: "Outils",
    color: "#7A4A00",
    lightBg: "#FFF0D6",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    items: [
      { label: "Qualification", href: "/qualification", description: "Scorer et qualifier un prospect" },
      { label: "Relances", href: "/relances", description: "Templates de suivi" },
      { label: "Prez client", href: "/presentation", description: "Générer un deck à envoyer" },
    ],
  },
];

type NavItem = { label: string; href: string; description: string; primary?: boolean };
type NavGroupType = { label: string; color: string; lightBg: string; icon: React.ReactNode; items: NavItem[] };

function NavGroup({ group, pathname }: { group: NavGroupType; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isGroupActive = group.items.some((i) => pathname.startsWith(i.href));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        style={{
          color: isGroupActive ? group.color : "#6b7280",
          background: isGroupActive ? group.lightBg : "transparent",
        }}
        onMouseEnter={(e) => { if (!isGroupActive) e.currentTarget.style.background = "#f9fafb"; }}
        onMouseLeave={(e) => { if (!isGroupActive) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ color: isGroupActive ? group.color : "#9ca3af" }}>{group.icon}</span>
        {group.label}
        <svg
          className="w-3 h-3 transition-transform"
          style={{
            color: isGroupActive ? group.color : "#9ca3af",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
        {isGroupActive && (
          <span
            className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
            style={{ background: group.color }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 rounded-xl border bg-white py-1.5 z-50"
          style={{
            minWidth: "220px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
            borderColor: "#e5e7eb",
          }}
        >
          <div className="px-3 pb-1.5 mb-1 border-b" style={{ borderColor: "#f3f4f6" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: group.color }}>
              {group.label}
            </p>
          </div>
          {group.items.map((item, idx) => {
            const isActive = pathname.startsWith(item.href);
            const isPrimary = item.primary;
            const showDivider = idx > 0 && group.items[idx - 1].primary;
            return (
              <div key={item.href}>
                {showDivider && (
                  <div className="mx-3 my-1 border-t" style={{ borderColor: "#f3f4f6" }} />
                )}
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 mx-1.5 px-3 py-2.5 rounded-lg transition-all"
                  style={{
                    background: isActive ? group.lightBg : isPrimary && !isActive ? group.lightBg + "80" : "transparent",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = group.lightBg; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isActive ? group.lightBg : isPrimary ? group.lightBg + "80" : "transparent"; }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-semibold leading-snug"
                        style={{ color: isActive || isPrimary ? group.color : "#111827" }}
                      >
                        {item.label}
                      </p>
                      {isPrimary && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                          style={{ background: group.color, color: "white", fontSize: "10px" }}
                        >
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: "#9ca3af" }}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: group.color }} />
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SyncButton() {
  const [status, setStatus] = useState<"idle"|"loading"|"ok"|"error">("idle");
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sync").then(r => r.json()).then(d => {
      if (d.syncedAt) setSyncedAt(new Date(d.syncedAt).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }));
    }).catch(() => {});
  }, []);

  const sync = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        clearClientCache();
        setStatus("ok");
        setSyncedAt(new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }));
      } else setStatus("error");
    } catch { setStatus("error"); }
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <button onClick={sync} disabled={status === "loading"} title={syncedAt ? `Dernière sync : ${syncedAt}` : "Synchroniser les données Notion"}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50"
      style={{ borderColor: status === "ok" ? "#16a34a" : status === "error" ? "#dc2626" : "#e5e7eb", color: status === "ok" ? "#16a34a" : status === "error" ? "#dc2626" : "#6b7280", background: "white" }}
    >
      {status === "loading" ? (
        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round"/></svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
      )}
      {status === "ok" ? "Syncé ✓" : status === "error" ? "Erreur" : "Sync Notion"}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const isChat = pathname.startsWith("/chat");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderColor: "#e8edf3", boxShadow: "0 1px 20px rgba(34,72,115,0.07)" }}>
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-6">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3979C1 0%, #224873 100%)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight text-gray-900">
            Sales <span style={{ color: "#3979C1" }}>Academy</span>
          </span>
        </Link>

        {/* Nav groups */}
        <div className="flex items-center gap-1 flex-1">
          {NAV_GROUPS.map((group) => (
            <NavGroup key={group.label} group={group} pathname={pathname} />
          ))}
        </div>

        {/* Sync Notion */}
        <SyncButton />

        {/* Global search */}
        <GlobalSearch />

        {/* Chat CTA */}
        <Link
          href="/chat"
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shrink-0"
          style={{
            background: isChat ? "#3979C1" : "#C9820A",
            color: "white",
            boxShadow: isChat
              ? "0 1px 4px rgba(57,121,193,0.3)"
              : "0 1px 4px rgba(201,130,10,0.3)",
          }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Chat IA
        </Link>
      </div>
    </nav>
  );
}
