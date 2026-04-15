"use client";

import { useState, useMemo } from "react";
import SearchInput from "./SearchInput";
import LoadingSpinner from "./LoadingSpinner";

export type ListItem = {
  id: string;
  name: string;
  subtitle?: string;
  badge?: string;
};

type Props = {
  title: string;
  icon: React.ReactNode;
  items: ListItem[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  detail: React.ReactNode;
  emptyLabel?: string;
};

export default function LibraryLayout({
  title,
  icon,
  items,
  loading,
  selectedId,
  onSelect,
  detail,
  emptyLabel = "Sélectionne une entrée",
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 border-r border-gray-100 bg-white flex flex-col">
        {/* Header */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <span style={{ color: "#0ca2c2" }}>{icon}</span>
            <h1 className="font-bold text-sm text-gray-900">{title}</h1>
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#e8f7fa", color: "#0ca2c2" }}
            >
              {filtered.length}
            </span>
          </div>
          <SearchInput value={search} onChange={setSearch} />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <LoadingSpinner label="Chargement..." />
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-10">Aucun résultat</p>
          ) : (
            <ul className="py-1">
              {filtered.map((item) => {
                const isActive = selectedId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelect(item.id)}
                      className="w-full text-left px-4 py-2.5 transition-all relative group"
                      style={isActive ? { background: "#f0fafc" } : {}}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <span
                          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
                          style={{ background: "#0ca2c2" }}
                        />
                      )}
                      <p
                        className="text-sm font-semibold truncate leading-snug"
                        style={{ color: isActive ? "#0ca2c2" : "#1a1a1a" }}
                      >
                        {item.name}
                      </p>
                      {item.subtitle && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* ── Detail panel ── */}
      <section className="flex-1 overflow-y-auto" style={{ background: "#f8f9fb" }}>
        {selectedId ? (
          detail
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "#f0fafc" }}
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#0ca2c2" strokeWidth="1.5" opacity="0.5">
                <path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <p className="text-sm font-medium">{emptyLabel}</p>
          </div>
        )}
      </section>
    </div>
  );
}
