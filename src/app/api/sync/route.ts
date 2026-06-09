import { NextResponse } from "next/server";
import { writeData } from "@/lib/dataStore";
import {
  getIndustries, getEnjeux, getPainPoints, getSolutions,
  getCapacites, getFonctionnalites, getBenefices, getPersonas, getRelances,
  preloadAllDatabases,
} from "@/lib/notion";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LOADERS = [
  { key: "industries",      fn: getIndustries },
  { key: "enjeux",          fn: getEnjeux },
  { key: "painpoints",      fn: getPainPoints },
  { key: "solutions",       fn: getSolutions },
  { key: "capacites",       fn: getCapacites },
  { key: "fonctionnalites", fn: getFonctionnalites },
  { key: "benefices",       fn: getBenefices },
  { key: "personas",        fn: getPersonas },
  { key: "relances",        fn: getRelances },
];

export async function POST() {
  const results: Record<string, string> = {};

  try {
    // 1. Charger l'index id→nom (9 appels seulement)
    await preloadAllDatabases();

    // 2. Construire et sauvegarder chaque base séquentiellement
    for (const { key, fn } of LOADERS) {
      try {
        const data = await fn();
        await writeData(key, data);
        results[key] = "ok";
      } catch (e) {
        results[key] = `erreur: ${e instanceof Error ? e.message : e}`;
      }
    }

    // 3. Sauvegarder la date de dernière sync
    await writeData("sync-meta", { syncedAt: new Date().toISOString() });

    return NextResponse.json({ success: true, results });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { readData } = await import("@/lib/dataStore");
    const meta = await readData<{ syncedAt: string }>("sync-meta");
    return NextResponse.json({ syncedAt: meta?.syncedAt ?? null });
  } catch {
    return NextResponse.json({ syncedAt: null });
  }
}
