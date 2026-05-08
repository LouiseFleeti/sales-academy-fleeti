"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Industries", href: "/industries" },
  { label: "Pain points", href: "/painpoints" },
  { label: "Capacités produit", href: "/capacites" },
  { label: "Personas", href: "/personas" },
  { label: "Qualification", href: "/qualification" },
  { label: "Relances", href: "/relances" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isChat = pathname.startsWith("/chat");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100" style={{ boxShadow: "0 1px 0 #f0f0f0" }}>
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-8">
        {/* Logo */}
        <Link href="/industries" className="flex items-center gap-2.5 shrink-0 mr-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3979C1 0%, #224873 100%)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight text-gray-900">
            Sales <span style={{ color: "#3979C1" }}>Academy</span>
          </span>
        </Link>

        {/* Nav tabs */}
        <div className="flex items-center gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all
                  ${isActive
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full"
                    style={{ background: "#3979C1" }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Chat CTA */}
        <Link
          href="/chat"
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
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
