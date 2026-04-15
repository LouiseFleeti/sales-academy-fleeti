import RelationTag from "./RelationTag";
import type { NotionRelation, TabKey } from "@/types/notion";

export type Field = {
  label: string;
  value?: string;
  display?: "text" | "description" | "list" | "bullets" | "highlight";
};

type RelationGroup = {
  label: string;
  relations: NotionRelation[];
  targetTab: TabKey;
};

type Props = {
  name: string;
  badge?: string;
  fields: Field[];
  relations: RelationGroup[];
};

const RELATION_COLORS: Record<string, [string, string]> = {
  industries:      ["#e8f7fa", "#0887a3"],
  painpoints:      ["#fef3e2", "#c47f00"],
  solutions:       ["#edf7ee", "#2e7d32"],
  capacites:       ["#ede9fe", "#5b21b6"],
  fonctionnalites: ["#f1f5f9", "#475569"],
  enjeux:          ["#fff1f2", "#be123c"],
  benefices:       ["#f0fdf4", "#15803d"],
  personas:        ["#fdf4ff", "#7e22ce"],
};

function FieldContent({ field }: { field: Field }) {
  const { value, display = "text" } = field;
  if (!value) return null;

  // Description : texte grand et lisible, fond bleuté léger
  if (display === "description") {
    return (
      <div
        className="rounded-xl border overflow-hidden mb-5"
        style={{ borderColor: "#d4eef5", boxShadow: "0 1px 4px rgba(12,162,194,0.06)" }}
      >
        <div className="px-5 py-2.5 flex items-center gap-2" style={{ background: "#eaf6fa" }}>
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#0887a3" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0887a3" }}>
            {field.label}
          </p>
        </div>
        <div className="px-5 py-4" style={{ background: "white" }}>
          <p className="text-sm text-gray-800 leading-7 whitespace-pre-wrap">{value}</p>
        </div>
      </div>
    );
  }

  // Liste : split par virgule → chips gris
  if (display === "list") {
    const items = value.split(",").map((s) => s.trim()).filter(Boolean);
    return (
      <div
        className="rounded-xl border border-gray-100 overflow-hidden mb-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="px-5 py-2 border-b border-gray-50 flex items-center gap-2 bg-white">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#0ca2c2" }} />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{field.label}</p>
        </div>
        <div className="px-5 py-3.5 bg-white flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "#f4f4f5", color: "#3f3f46" }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Bullets : split par virgule ou "," → liste à puces
  if (display === "bullets") {
    const items = value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    return (
      <div
        className="rounded-xl border border-gray-100 overflow-hidden mb-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="px-5 py-2 border-b border-gray-50 flex items-center gap-2 bg-white">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#0ca2c2" }} />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{field.label}</p>
        </div>
        <ul className="px-5 py-3.5 bg-white space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "#fea706" }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Highlight : fond jaune ambre, icône ampoule — pour les questions stratégiques
  if (display === "highlight") {
    return (
      <div
        className="rounded-xl border overflow-hidden mb-4"
        style={{ borderColor: "#fde68a", boxShadow: "0 1px 4px rgba(254,167,6,0.1)" }}
      >
        <div className="px-5 py-2.5 flex items-center gap-2" style={{ background: "#fffbeb" }}>
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6L15 17H9l-.7-2C6.3 13.7 5 11.5 5 9a7 7 0 017-7z"/>
          </svg>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#b45309" }}>
            {field.label}
          </p>
        </div>
        <div className="px-5 py-4" style={{ background: "#fffdf5" }}>
          <p className="text-sm text-gray-800 leading-relaxed italic whitespace-pre-wrap">{value}</p>
        </div>
      </div>
    );
  }

  // Default text
  return (
    <div
      className="rounded-xl border border-gray-100 overflow-hidden mb-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className="px-5 py-2 border-b border-gray-50 flex items-center gap-2 bg-white">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#0ca2c2" }} />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{field.label}</p>
      </div>
      <div className="px-5 py-4 bg-white">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{value}</p>
      </div>
    </div>
  );
}

export default function DetailPanel({ name, badge, fields, relations }: Props) {
  const visibleFields = fields.filter((f) => f.value);
  const visibleRelations = relations.filter((r) => r.relations.length > 0);

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-7">
        {badge && (
          <span
            className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 tracking-widest uppercase"
            style={{ background: "#e8f7fa", color: "#0887a3" }}
          >
            {badge}
          </span>
        )}
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{name}</h2>
      </div>

      {/* Fields */}
      {visibleFields.length > 0 && (
        <div className="mb-10">
          {visibleFields.map((field) => (
            <FieldContent key={field.label} field={field} />
          ))}
        </div>
      )}

      {/* Relations */}
      {visibleRelations.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1" style={{ background: "#e8f7fa" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0ca2c2" }}>
              Relations
            </span>
            <div className="h-px flex-1" style={{ background: "#e8f7fa" }} />
          </div>
          <div className="space-y-5">
            {visibleRelations.map((group) => {
              const [bgColor, textColor] = RELATION_COLORS[group.targetTab] ?? ["#f1f5f9", "#475569"];
              return (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.relations.map((rel) => (
                      <RelationTag key={rel.id} relation={rel} targetTab={group.targetTab} bgColor={bgColor} textColor={textColor} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {visibleFields.length === 0 && visibleRelations.length === 0 && (
        <p className="text-sm text-gray-400 italic">Aucun contenu disponible.</p>
      )}
    </div>
  );
}
