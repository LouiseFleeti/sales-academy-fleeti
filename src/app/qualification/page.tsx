"use client";

import { useState, useMemo } from "react";

// ─── Fleeti brand tokens ───────────────────────────────────────────────────────
const F = {
  primaryMain:   "#3979C1",
  primaryDark:   "#224873",
  primaryLight:  "#9CC3F0",
  primaryBg:     "#E8F2FD",
  secondaryMain: "#1B8483",
  secondaryBg:   "#D9F6F6",
  thirdlyMain:   "#22875B",
  thirdlyBg:     "#DDF6EB",
  dark:          "#131313",
  midGrey:       "#89969E",
  lightGrey:     "#D7E1EC",
  // Status
  successDark:   "#145136",
  successMain:   "#22875B",
  successBg:     "#DDF6EB",
  warningDark:   "#7A4A00",
  warningMain:   "#C9820A",
  warningBg:     "#FFF0D6",
  errorDark:     "#7A1A2E",
  errorMain:     "#C94A6A",
  errorBg:       "#FFE0E8",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  prospectNom: string;
  vehicules15: boolean;
  vehiculesNombre: string;
  typeFlotteOk: boolean;
  typeFlotteDetail: string;
  flotteStrategique: "oui" | "non" | "";
  douleurs: string[];
  douleurAutre: string;
  douleurPrincipale: string;
  impactBusiness: string[];
  impactDetail: string;
  outilsActuels: string;
  satisfaction: "tres_insatisfait" | "insatisfait" | "mitige" | "satisfait" | "";
  ceQuiManque: string;
  envisageChangement: "oui" | "non" | "";
  budget: "existe" | "peut_debloquer" | "aucun" | "";
  budgetMontant: string;
  budgetValide: boolean;
  decideur: "present" | "identifie_absent" | "inconnu" | "";
  decideurNom: string;
  autresParties: string;
  processusDecisionClair: "oui" | "non" | "";
  processusEtapes: string;
  projetStatut: "en_cours" | "a_lancer" | "reflexion" | "";
  echeance: "moins_3" | "trois_six" | "plus_6" | "";
  evenementDeclencheur: string;
  priorite: "strategique" | "important" | "nice_to_have" | "";
  consequenceSiRien: string;
  engagement: string[];
  scoreEngagement: "faible" | "moyen" | "fort" | "";
};

const INITIAL_STATE: FormState = {
  prospectNom: "",
  vehicules15: false, vehiculesNombre: "", typeFlotteOk: false, typeFlotteDetail: "",
  flotteStrategique: "",
  douleurs: [], douleurAutre: "", douleurPrincipale: "", impactBusiness: [], impactDetail: "",
  outilsActuels: "", satisfaction: "", ceQuiManque: "", envisageChangement: "",
  budget: "", budgetMontant: "", budgetValide: false,
  decideur: "", decideurNom: "", autresParties: "", processusDecisionClair: "", processusEtapes: "",
  projetStatut: "", echeance: "", evenementDeclencheur: "",
  priorite: "", consequenceSiRien: "",
  engagement: [], scoreEngagement: "",
};

const DOULEURS_OPTIONS = [
  "Coûts trop élevés (carburant, entretien, leasing, etc.)",
  "Manque de visibilité / reporting",
  "Gestion manuelle (Excel, outils bricolés)",
  "Sinistralité / risques",
  "Non-conformité / obligations légales",
  "Sous-utilisation des véhicules",
  "Vols / abus / mauvais usages",
  "Insatisfaction des collaborateurs",
];

const ENGAGEMENT_OPTIONS = [
  "Donne des chiffres",
  "Pose des questions",
  "Partage ses enjeux",
  "Accepte un prochain RDV",
  "Invite d'autres décideurs",
];

// ─── Score logic ──────────────────────────────────────────────────────────────

function checkFitStructurel(f: FormState) {
  const fails: string[] = [];
  const nb = parseInt(f.vehiculesNombre);
  if (!isNaN(nb) && nb < 15) fails.push(`Moins de 15 véhicules (${nb} renseigné)`);
  if (f.flotteStrategique === "non") fails.push("Flotte non stratégique");
  return fails.length > 0 ? fails : null;
}

function computeScore(f: FormState) {
  let score = 0;
  const breakdown: { label: string; pts: number; max: number }[] = [];

  const v = f.vehicules15 ? 1 : 0; score += v;
  breakdown.push({ label: "15+ véhicules", pts: v, max: 1 });

  const d = f.douleurs.length > 0 || f.douleurAutre.trim() ? 2 : 0; score += d;
  breakdown.push({ label: "Douleur claire", pts: d, max: 2 });

  const imp = f.impactBusiness.length > 0 ? 1 : 0; score += imp;
  breakdown.push({ label: "Impact business réel", pts: imp, max: 1 });

  const b = f.budget === "existe" ? 2 : f.budget === "peut_debloquer" ? 1 : 0; score += b;
  breakdown.push({ label: "Budget identifié", pts: b, max: 2 });

  const dec = f.decideur === "present" ? 2 : f.decideur === "identifie_absent" ? 1 : 0; score += dec;
  breakdown.push({ label: "Décideur impliqué", pts: dec, max: 2 });

  const t = f.echeance === "moins_3" || f.echeance === "trois_six" ? 1 : 0; score += t;
  breakdown.push({ label: "Timing < 6 mois", pts: t, max: 1 });

  const p = f.priorite === "strategique" ? 1 : 0; score += p;
  breakdown.push({ label: "Priorité business", pts: p, max: 1 });

  return { score, breakdown };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden mb-4" style={{ borderColor: F.lightGrey, boxShadow: "0 1px 4px rgba(34,72,115,0.06)" }}>
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: F.lightGrey, background: F.primaryBg }}>
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: F.primaryDark }}>{title}</h2>
        {badge && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: F.errorBg, color: F.errorDark }}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function CheckItem({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
        style={{ borderColor: checked ? F.primaryMain : F.lightGrey, background: checked ? F.primaryMain : "white" }}
        onClick={onChange}
      >
        {checked && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed" onClick={onChange}>{label}</span>
    </label>
  );
}

function RadioItem({ selected, onChange, label }: { selected: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group" onClick={onChange}>
      <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
        style={{ borderColor: selected ? F.primaryMain : F.lightGrey }}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: F.primaryMain }} />}
      </div>
      <span className="text-sm transition-colors" style={{ color: selected ? F.primaryDark : "#374151" }}>{label}</span>
    </label>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium mb-2" style={{ color: F.dark }}>{children}</p>;
}

function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full px-4 py-2.5 rounded-xl border text-sm resize-none focus:outline-none placeholder-gray-300 transition-colors"
      style={{ borderColor: F.lightGrey }}
      onFocus={(e) => { e.target.style.borderColor = F.primaryMain; e.target.style.boxShadow = `0 0 0 3px ${F.primaryBg}`; }}
      onBlur={(e) => { e.target.style.borderColor = F.lightGrey; e.target.style.boxShadow = "none"; }}
    />
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none placeholder-gray-300 transition-colors"
      style={{ borderColor: F.lightGrey }}
      onFocus={(e) => { e.target.style.borderColor = F.primaryMain; e.target.style.boxShadow = `0 0 0 3px ${F.primaryBg}`; }}
      onBlur={(e) => { e.target.style.borderColor = F.lightGrey; e.target.style.boxShadow = "none"; }}
    />
  );
}

// ─── Recap generator ──────────────────────────────────────────────────────────

function generateRecap(form: FormState, score: number, verdictLabel: string, isEliminated: boolean): string {
  const sat: Record<string, string> = { tres_insatisfait: "Très insatisfait", insatisfait: "Insatisfait", mitige: "Mitigé", satisfait: "Satisfait" };
  const bud: Record<string, string> = { existe: "Budget existant", peut_debloquer: "Budget à débloquer", aucun: "Aucun budget" };
  const dec: Record<string, string> = { present: "Présent au RDV", identifie_absent: "Identifié mais absent", inconnu: "Inconnu" };
  const ech: Record<string, string> = { moins_3: "< 3 mois", trois_six: "3–6 mois", plus_6: "> 6 mois" };
  const pri: Record<string, string> = { strategique: "Priorité stratégique", important: "Important mais pas urgent", nice_to_have: "Nice to have" };
  const pro: Record<string, string> = { en_cours: "Projet en cours", a_lancer: "Projet à lancer", reflexion: "Simple réflexion" };
  const douleurs = [...form.douleurs, ...(form.douleurAutre ? [form.douleurAutre] : [])];

  return `RÉCAP DE QUALIFICATION — ${form.prospectNom || "Prospect"}
${"─".repeat(50)}

SCORE : ${score}/10 — ${verdictLabel}${isEliminated ? " ⛔ ÉLIMINATOIRE" : ""}

─── FIT STRUCTUREL ───────────────────────────────
• 15+ véhicules : ${form.vehicules15 ? `✓ (${form.vehiculesNombre || "nb non précisé"})` : "✗"}
• Type de flotte : ${form.typeFlotteOk ? `✓ ${form.typeFlotteDetail || ""}` : "✗"}
• Flotte stratégique : ${form.flotteStrategique === "oui" ? "✓ Oui" : form.flotteStrategique === "non" ? "✗ Non" : "—"}

─── DOULEURS IDENTIFIÉES ─────────────────────────
${douleurs.length > 0 ? douleurs.map((d) => `• ${d}`).join("\n") : "• Aucune douleur identifiée"}
${form.douleurPrincipale ? `\nDouleur principale : ${form.douleurPrincipale}` : ""}
${form.impactBusiness.length > 0 ? `Impact : ${form.impactBusiness.join(", ")}` : ""}

─── SITUATION ACTUELLE ───────────────────────────
${form.outilsActuels ? `• Outils actuels : ${form.outilsActuels}` : "• Outils : non renseigné"}
${form.satisfaction ? `• Satisfaction : ${sat[form.satisfaction]}` : ""}
${form.ceQuiManque ? `• Ce qui manque : ${form.ceQuiManque}` : ""}
${form.envisageChangement ? `• A envisagé un changement : ${form.envisageChangement === "oui" ? "Oui" : "Non"}` : ""}

─── BUDGET ───────────────────────────────────────
${form.budget ? `• ${bud[form.budget]}${form.budgetMontant ? ` — ${form.budgetMontant}` : ""}` : "• Non renseigné"}
${form.budgetValide ? "• Sait comment le budget est validé" : ""}

─── DÉCISION & PARTIES PRENANTES ─────────────────
${form.decideur ? `• Décideur : ${dec[form.decideur]}${form.decideurNom ? ` (${form.decideurNom})` : ""}` : "• Décideur : non renseigné"}
${form.autresParties ? `• Autres parties : ${form.autresParties}` : ""}
${form.processusDecisionClair ? `• Processus clair : ${form.processusDecisionClair === "oui" ? "Oui" : "Non"}` : ""}
${form.processusEtapes ? `• Étapes : ${form.processusEtapes}` : ""}

─── TIMING ───────────────────────────────────────
${form.projetStatut ? `• Statut : ${pro[form.projetStatut]}` : "• Statut : non renseigné"}
${form.echeance ? `• Échéance : ${ech[form.echeance]}` : ""}
${form.evenementDeclencheur ? `• Déclencheur : ${form.evenementDeclencheur}` : ""}

─── PRIORITÉ ─────────────────────────────────────
${form.priorite ? `• ${pri[form.priorite]}` : "• Non renseignée"}
${form.consequenceSiRien ? `• Conséquence si rien : ${form.consequenceSiRien}` : ""}

─── ENGAGEMENT ───────────────────────────────────
${form.engagement.length > 0 ? form.engagement.map((e) => `• ${e}`).join("\n") : "• Aucun signal d'engagement"}
${form.scoreEngagement ? `• Score : ${form.scoreEngagement}` : ""}
`.trim();
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function QualificationPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [showRecap, setShowRecap] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArr = (key: "douleurs" | "impactBusiness" | "engagement", val: string) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? (prev[key] as string[]).filter((v) => v !== val)
        : [...(prev[key] as string[]), val],
    }));

  const { score, breakdown } = useMemo(() => computeScore(form), [form]);
  const fitFails = useMemo(() => checkFitStructurel(form), [form]);
  const isEliminated = fitFails !== null && fitFails.length > 0;

  const verdict = isEliminated
    ? { label: "Non qualifié → Éliminatoire", color: F.errorDark, bg: F.errorBg, border: "#f9a8c0", dot: F.errorMain }
    : score >= 7
    ? { label: "RDV qualifié → Go vente",     color: F.successDark, bg: F.successBg, border: "#75D9AD", dot: F.successMain }
    : score >= 4
    ? { label: "À nurturer / relancer",        color: F.warningDark, bg: F.warningBg, border: "#f5c97a", dot: F.warningMain }
    : { label: "Non qualifié → Disqualifier",  color: F.errorDark,   bg: F.errorBg,   border: "#f9a8c0", dot: F.errorMain };

  const recap = useMemo(() => generateRecap(form, score, verdict.label, isEliminated), [form, score, verdict.label, isEliminated]);

  const handleCopy = () => {
    navigator.clipboard.writeText(recap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ background: "#f4f6f9" }}>
      <div className="max-w-screen-lg mx-auto px-6 py-8 flex gap-6 items-start">

        {/* ── Formulaire ── */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-bold" style={{ color: F.dark }}>Checklist de qualification</h1>
                <p className="text-sm mt-1" style={{ color: F.midGrey }}>À remplir pendant ou après le RDV prospect</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowRecap(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: F.primaryMain, boxShadow: `0 2px 8px ${F.primaryLight}80` }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Voir le récap
                </button>
                <button
                  onClick={() => setForm(INITIAL_STATE)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ borderColor: F.lightGrey, color: F.midGrey }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                  Réinitialiser
                </button>
              </div>
            </div>
            <input
              type="text"
              value={form.prospectNom}
              onChange={(e) => set("prospectNom", e.target.value)}
              placeholder="Nom du prospect / entreprise..."
              className="w-full px-4 py-3 rounded-xl border-2 text-sm font-medium focus:outline-none placeholder-gray-300 transition-all"
              style={{ borderColor: F.lightGrey, color: F.dark }}
              onFocus={(e) => { e.target.style.borderColor = F.primaryMain; e.target.style.boxShadow = `0 0 0 3px ${F.primaryBg}`; }}
              onBlur={(e) => { e.target.style.borderColor = F.lightGrey; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Bannière éliminatoire */}
          {isEliminated && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-semibold border" style={{ background: F.errorBg, color: F.errorDark, borderColor: "#f9a8c0" }}>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Prospect éliminatoire — critères structurels non remplis
            </div>
          )}

          {/* Section 1 */}
          <Section title="Fit structurel" badge="Éliminatoire">
            <div>
              <CheckItem
                checked={form.vehicules15}
                onChange={() => set("vehicules15", !form.vehicules15)}
                label="Le prospect gère au moins 15 véhicules"
              />
              {form.vehicules15 && (
                <div className="ml-8 mt-2">
                  <TextInput value={form.vehiculesNombre} onChange={(v) => set("vehiculesNombre", v)} placeholder="Nombre exact..." />
                </div>
              )}
            </div>
            <div>
              <CheckItem
                checked={form.typeFlotteOk}
                onChange={() => set("typeFlotteOk", !form.typeFlotteOk)}
                label="Le type de flotte correspond à notre cible (VL, utilitaires, poids lourds, engins, etc.)"
              />
              {form.typeFlotteOk && (
                <div className="ml-8 mt-2">
                  <TextInput value={form.typeFlotteDetail} onChange={(v) => set("typeFlotteDetail", v)} placeholder="Préciser le type..." />
                </div>
              )}
            </div>
            <div>
              <FieldLabel>La flotte est stratégique pour leur activité</FieldLabel>
              <div className="flex gap-6">
                <RadioItem selected={form.flotteStrategique === "oui"} onChange={() => set("flotteStrategique", "oui")} label="Oui" />
                <RadioItem selected={form.flotteStrategique === "non"} onChange={() => set("flotteStrategique", "non")} label="Non" />
              </div>
            </div>
          </Section>

          {/* Section 2 */}
          <Section title="Problématique & douleurs">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: F.midGrey }}>Au moins une douleur claire doit être identifiée</p>
              <div className="space-y-3">
                {DOULEURS_OPTIONS.map((d) => (
                  <CheckItem key={d} checked={form.douleurs.includes(d)} onChange={() => toggleArr("douleurs", d)} label={d} />
                ))}
                <div className="flex items-center gap-3">
                  <CheckItem
                    checked={form.douleurAutre.length > 0}
                    onChange={() => form.douleurAutre ? set("douleurAutre", "") : undefined}
                    label="Autre :"
                  />
                  <TextInput value={form.douleurAutre} onChange={(v) => set("douleurAutre", v)} placeholder="Préciser..." />
                </div>
              </div>
            </div>
            <div>
              <FieldLabel>Douleur principale</FieldLabel>
              <TextArea value={form.douleurPrincipale} onChange={(v) => set("douleurPrincipale", v)} placeholder="Décrire la douleur principale exprimée..." />
            </div>
            <div>
              <FieldLabel>Impact business estimé</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {["Financier", "Temps", "Risque", "Image", "Croissance"].map((imp) => {
                  const active = form.impactBusiness.includes(imp);
                  return (
                    <button
                      key={imp}
                      onClick={() => toggleArr("impactBusiness", imp)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
                      style={{
                        borderColor: active ? F.primaryMain : F.lightGrey,
                        background: active ? F.primaryBg : "white",
                        color: active ? F.primaryDark : F.midGrey,
                      }}
                    >
                      {imp}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3">
                <TextArea value={form.impactDetail} onChange={(v) => set("impactDetail", v)} placeholder="Détails sur l'impact..." />
              </div>
            </div>
          </Section>

          {/* Section 3 */}
          <Section title="Situation actuelle">
            <div>
              <FieldLabel>Outil(s) actuel(s)</FieldLabel>
              <TextArea value={form.outilsActuels} onChange={(v) => set("outilsActuels", v)} placeholder="Excel, logiciel interne, rien..." />
            </div>
            <div>
              <FieldLabel>Niveau de satisfaction</FieldLabel>
              <div className="flex flex-wrap gap-4">
                {(["tres_insatisfait", "insatisfait", "mitige", "satisfait"] as const).map((s) => (
                  <RadioItem key={s} selected={form.satisfaction === s} onChange={() => set("satisfaction", s)}
                    label={s === "tres_insatisfait" ? "Très insatisfait" : s === "insatisfait" ? "Insatisfait" : s === "mitige" ? "Mitigé" : "Satisfait"} />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Ce qui manque aujourd&apos;hui</FieldLabel>
              <TextArea value={form.ceQuiManque} onChange={(v) => set("ceQuiManque", v)} placeholder="Fonctionnalités, reporting, visibilité..." />
            </div>
            <div>
              <FieldLabel>A déjà envisagé un changement</FieldLabel>
              <div className="flex gap-6">
                <RadioItem selected={form.envisageChangement === "oui"} onChange={() => set("envisageChangement", "oui")} label="Oui" />
                <RadioItem selected={form.envisageChangement === "non"} onChange={() => set("envisageChangement", "non")} label="Non" />
              </div>
            </div>
          </Section>

          {/* Section 4 */}
          <Section title="Budget">
            <div className="space-y-3">
              <RadioItem selected={form.budget === "existe"} onChange={() => set("budget", "existe")} label="Un budget existe déjà" />
              <RadioItem selected={form.budget === "peut_debloquer"} onChange={() => set("budget", "peut_debloquer")} label="Un budget peut être débloqué" />
              <RadioItem selected={form.budget === "aucun"} onChange={() => set("budget", "aucun")} label="Aucun budget envisagé" />
            </div>
            <div>
              <FieldLabel>Montant estimé (si connu)</FieldLabel>
              <TextInput value={form.budgetMontant} onChange={(v) => set("budgetMontant", v)} placeholder="Ex : 20 000 € / an" />
            </div>
            <CheckItem checked={form.budgetValide} onChange={() => set("budgetValide", !form.budgetValide)} label="Le prospect sait comment le budget est validé" />
          </Section>

          {/* Section 5 */}
          <Section title="Décision & parties prenantes">
            <div className="space-y-3">
              <RadioItem selected={form.decideur === "present"} onChange={() => set("decideur", "present")} label="Le décideur est présent au RDV" />
              <RadioItem selected={form.decideur === "identifie_absent"} onChange={() => set("decideur", "identifie_absent")} label="Le décideur est identifié mais absent" />
              <RadioItem selected={form.decideur === "inconnu"} onChange={() => set("decideur", "inconnu")} label="Le décideur est inconnu" />
            </div>
            <div>
              <FieldLabel>Nom / Fonction</FieldLabel>
              <TextInput value={form.decideurNom} onChange={(v) => set("decideurNom", v)} placeholder="Ex : Marie Dupont, DSI" />
            </div>
            <div>
              <FieldLabel>Autres parties prenantes</FieldLabel>
              <TextInput value={form.autresParties} onChange={(v) => set("autresParties", v)} placeholder="RH, DAF, Direction générale..." />
            </div>
            <div>
              <FieldLabel>Processus de décision clair</FieldLabel>
              <div className="flex gap-6">
                <RadioItem selected={form.processusDecisionClair === "oui"} onChange={() => set("processusDecisionClair", "oui")} label="Oui" />
                <RadioItem selected={form.processusDecisionClair === "non"} onChange={() => set("processusDecisionClair", "non")} label="Non" />
              </div>
            </div>
            <div>
              <FieldLabel>Étapes du processus</FieldLabel>
              <TextArea value={form.processusEtapes} onChange={(v) => set("processusEtapes", v)} placeholder="Comité, validation DAF, appel d'offres..." />
            </div>
          </Section>

          {/* Section 6 */}
          <Section title="Timing">
            <div>
              <FieldLabel>Statut du projet</FieldLabel>
              <div className="space-y-3">
                <RadioItem selected={form.projetStatut === "en_cours"} onChange={() => set("projetStatut", "en_cours")} label="Projet en cours" />
                <RadioItem selected={form.projetStatut === "a_lancer"} onChange={() => set("projetStatut", "a_lancer")} label="Projet à lancer" />
                <RadioItem selected={form.projetStatut === "reflexion"} onChange={() => set("projetStatut", "reflexion")} label="Simple réflexion" />
              </div>
            </div>
            <div>
              <FieldLabel>Échéance estimée</FieldLabel>
              <div className="space-y-3">
                <RadioItem selected={form.echeance === "moins_3"} onChange={() => set("echeance", "moins_3")} label="< 3 mois" />
                <RadioItem selected={form.echeance === "trois_six"} onChange={() => set("echeance", "trois_six")} label="3 – 6 mois" />
                <RadioItem selected={form.echeance === "plus_6"} onChange={() => set("echeance", "plus_6")} label="> 6 mois" />
              </div>
            </div>
            <div>
              <FieldLabel>Événement déclencheur</FieldLabel>
              <TextArea value={form.evenementDeclencheur} onChange={(v) => set("evenementDeclencheur", v)} placeholder="Renouvellement de flotte, incident récent, audit..." />
            </div>
          </Section>

          {/* Section 7 */}
          <Section title="Priorité business">
            <div className="space-y-3">
              <RadioItem selected={form.priorite === "strategique"} onChange={() => set("priorite", "strategique")} label="Priorité stratégique" />
              <RadioItem selected={form.priorite === "important"} onChange={() => set("priorite", "important")} label="Important mais pas urgent" />
              <RadioItem selected={form.priorite === "nice_to_have"} onChange={() => set("priorite", "nice_to_have")} label="Nice to have" />
            </div>
            <div>
              <FieldLabel>Conséquence si rien n&apos;est fait</FieldLabel>
              <TextArea value={form.consequenceSiRien} onChange={(v) => set("consequenceSiRien", v)} placeholder="Risques, coûts, problèmes non résolus..." />
            </div>
          </Section>

          {/* Section 8 */}
          <Section title="Engagement du prospect">
            <div className="space-y-3">
              {ENGAGEMENT_OPTIONS.map((e) => (
                <CheckItem key={e} checked={form.engagement.includes(e)} onChange={() => toggleArr("engagement", e)} label={e} />
              ))}
            </div>
            <div>
              <FieldLabel>Score d&apos;engagement</FieldLabel>
              <div className="flex gap-6">
                <RadioItem selected={form.scoreEngagement === "faible"} onChange={() => set("scoreEngagement", "faible")} label="Faible" />
                <RadioItem selected={form.scoreEngagement === "moyen"} onChange={() => set("scoreEngagement", "moyen")} label="Moyen" />
                <RadioItem selected={form.scoreEngagement === "fort"} onChange={() => set("scoreEngagement", "fort")} label="Fort" />
              </div>
            </div>
          </Section>
        </div>

        {/* ── Score sticky ── */}
        <div className="w-64 shrink-0 sticky top-20">
          {/* Score card */}
          <div className="bg-white rounded-2xl border overflow-hidden mb-3" style={{ borderColor: F.lightGrey, boxShadow: "0 1px 4px rgba(34,72,115,0.08)" }}>
            {/* Header */}
            <div className="px-5 py-3 border-b" style={{ background: F.primaryDark, borderColor: F.primaryDark }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Score de qualification</p>
            </div>
            <div className="p-5">
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-black" style={{ color: verdict.dot }}>{score}</span>
                <span className="text-xl font-bold mb-1" style={{ color: F.lightGrey }}>/ 10</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full overflow-hidden mb-5" style={{ background: F.lightGrey }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(score / 10) * 100}%`, background: verdict.dot }}
                />
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5">
                {breakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between gap-2">
                    <span className="text-xs truncate" style={{ color: F.midGrey }}>{b.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs font-bold" style={{ color: b.pts > 0 ? verdict.dot : F.lightGrey }}>
                        {b.pts}
                      </span>
                      <span className="text-xs" style={{ color: F.lightGrey }}>/{b.max}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="rounded-2xl border p-4" style={{ background: verdict.bg, borderColor: verdict.border }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: verdict.dot }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: verdict.color }}>Verdict</p>
            </div>
            <p className="text-sm font-semibold leading-snug" style={{ color: verdict.color }}>{verdict.label}</p>
            {isEliminated && fitFails && fitFails.length > 0 && (
              <ul className="mt-2 space-y-1">
                {fitFails.map((f) => (
                  <li key={f} className="text-xs flex items-center gap-1.5" style={{ color: verdict.color }}>
                    <span>✕</span>{f}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 pt-3 border-t space-y-1" style={{ borderColor: verdict.border }}>
              <p className="text-xs" style={{ color: verdict.color, opacity: 0.7 }}>7–10 → Qualifié</p>
              <p className="text-xs" style={{ color: verdict.color, opacity: 0.7 }}>4–6 → À nurturer</p>
              <p className="text-xs" style={{ color: verdict.color, opacity: 0.7 }}>0–3 → Non qualifié</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal récap ── */}
      {showRecap && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowRecap(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border" style={{ borderColor: F.lightGrey }}>
              {/* Modal header */}
              <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ background: F.primaryDark, borderColor: F.primaryDark }}>
                <div>
                  <h2 className="font-bold text-white">Récapitulatif de qualification</h2>
                  {form.prospectNom && <p className="text-sm mt-0.5" style={{ color: F.primaryLight }}>{form.prospectNom}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: copied ? F.thirdlyMain : F.primaryMain }}
                  >
                    {copied ? (
                      <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copié !</>
                    ) : (
                      <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copier</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowRecap(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
              {/* Content */}
              <div className="overflow-y-auto flex-1 p-6" style={{ background: "#f4f6f9" }}>
                <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono rounded-xl p-4 border" style={{ color: F.dark, background: "white", borderColor: F.lightGrey }}>
                  {recap}
                </pre>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
