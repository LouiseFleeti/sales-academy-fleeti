/**
 * Préchauffe le cache Notion au démarrage du serveur.
 * Appelé une seule fois depuis instrumentation.ts.
 */
import {
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
  console.log("[cache] Préchauffage du cache Notion (séquentiel)...");
  for (const { name, fn } of LOADERS) {
    try {
      await fn();
      console.log(`[cache] ✓ ${name}`);
      await new Promise(r => setTimeout(r, 500)); // 500ms entre chaque base
    } catch (e) {
      console.warn(`[cache] ✗ ${name} :`, e);
    }
  }
  console.log("[cache] Cache Notion prêt ✓");
}
