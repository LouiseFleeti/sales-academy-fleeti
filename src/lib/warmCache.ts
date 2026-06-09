/**
 * Préchauffe le cache Notion au démarrage du serveur.
 * Appelé une seule fois depuis instrumentation.ts.
 */
import {
  getIndustries, getEnjeux, getPainPoints, getSolutions,
  getCapacites, getFonctionnalites, getBenefices, getPersonas, getRelances,
} from "@/lib/notion";

export async function warmNotionCache() {
  console.log("[cache] Préchauffage du cache Notion...");
  try {
    await Promise.allSettled([
      getIndustries(),
      getEnjeux(),
      getPainPoints(),
      getSolutions(),
      getCapacites(),
      getFonctionnalites(),
      getBenefices(),
      getPersonas(),
      getRelances(),
    ]);
    console.log("[cache] Cache Notion prêt ✓");
  } catch (e) {
    console.warn("[cache] Préchauffage partiel :", e);
  }
}
