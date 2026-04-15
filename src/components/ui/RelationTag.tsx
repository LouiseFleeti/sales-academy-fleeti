"use client";

import { useRouter } from "next/navigation";
import type { NotionRelation, TabKey } from "@/types/notion";

const TAB_ROUTES: Record<string, string> = {
  industries: "/industries",
  enjeux: "/enjeux",
  painpoints: "/painpoints",
  solutions: "/solutions",
  capacites: "/capacites",
  fonctionnalites: "/fonctionnalites",
  benefices: "/benefices",
  personas: "/personas",
};

type Props = {
  relation: NotionRelation;
  targetTab: TabKey;
  bgColor?: string;
  textColor?: string;
};

export default function RelationTag({ relation, targetTab, bgColor = "#e8f7fa", textColor = "#0887a3" }: Props) {
  const router = useRouter();
  const route = TAB_ROUTES[targetTab];

  return (
    <button
      onClick={() => router.push(`${route}?id=${relation.id}`)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
      style={{ background: bgColor, color: textColor }}
    >
      <svg className="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
      {relation.name}
    </button>
  );
}
