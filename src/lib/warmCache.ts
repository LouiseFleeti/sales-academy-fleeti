/**
 * Préchauffe le cache Notion au démarrage du serveur.
 * 1. Charge toutes les pages de toutes les bases (index id→nom)
 * 2. Puis construit les objets enrichis (sans appels réseau supplémentaires)
 */
import {
  preloadAllDatabases,
  getIndustries, getEnjeux, getPainPoints, getSolutions,
  getCapacites, getFonctionnalites, getBenefices, getPersonas, getRelances,
} from "@/lib/notion";

const LOADERS = [
  { name: "industries",      fn: getIndustries },
  { name: "enjeux",          fn: getEnjeux },
  { name: "painpoints",      fn: getPainPoints },
  { name: "solutions",       fn: getSolutions },
  { name: "capacites",       fn: getCapacites },
  { name: "fonctionnalites", fn: getFonctionnalites },
  { name: "benefices",       fn: getBenefices },
  { name: "personas",        fn: getPersonas },
  { name: "relances",        fn: getRelances },
];

export async function warmNotionCache() {
  console.log("[cache] Étape 1 : index id→nom de toutes les bases...");
  try {
    await preloadAllDatabases();
    console.log("[cache] ✓ Index prêt");
  } catch (e) {
    console.warn("[cache] ✗ Index partiel :", e);
  }

  console.log("[cache] Étape 2 : construction du cache enrichi...");
  for (const { name, fn } of LOADERS) {
    try {
      await fn();
      console.log(`[cache] ✓ ${name}`);
    } catch (e) {
      console.warn(`[cache] ✗ ${name} :`, e);
    }
  }
  console.log("[cache] Cache Notion prêt ✓");
}
